// Google Sheets làm DB (chỉ server). Mỗi tab dòng 1 là tiêu đề, cột theo đúng thứ tự:
//   machines: id | name | short | area | group | sort
//   orders:   id | machine_id | day | seq | start | end   (start/end: "2026-10-28T06:00" giờ VN)
//   workers:  machine_id | role | name
// Auth bằng service account, sheet phải share quyền Editor cho GOOGLE_CLIENT_EMAIL.
import { createSign } from 'node:crypto';
import { cacheLife, cacheTag } from 'next/cache';
import { fromVn, toVn, type Area, type WorkerRole } from '@/lib/data/machines';

export { fromVn, toVn };

type Tab = 'machines' | 'orders' | 'workers';

const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}`;

let token: { value: string; exp: number } | null = null;

async function auth() {
    const now = Date.now();
    if (token && token.exp > now + 60_000) return token.value;
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const iat = Math.floor(now / 1000);
    const jwt = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
        iss: process.env.GOOGLE_CLIENT_EMAIL,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        iat,
        exp: iat + 3600,
    })}`;
    // .env giữ private key trên 1 dòng với "\n"
    const key = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
    const sig = createSign('RSA-SHA256').update(jwt).sign(key, 'base64url');
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${jwt}.${sig}`,
        }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Google auth: ${json.error_description ?? json.error ?? res.status}`);
    token = { value: json.access_token, exp: now + json.expires_in * 1000 };
    return token.value;
}

async function api(path: string, body?: object) {
    const res = await fetch(`${BASE}${path}`, {
        method: body ? 'POST' : 'GET',
        body: body && JSON.stringify(body),
        headers: { Authorization: `Bearer ${await auth()}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`Google Sheets: ${json.error?.message ?? res.status}`);
    return json;
}

export type MachineRow = { row: number; id: string; name: string; short: string; area: Area; group: string; sort: string };
export type OrderRow = { row: number; id: number; machine: string; day: string; seq: number; start: number; end: number };
export type WorkerRow = { row: number; machine: string; role: WorkerRole; name: string };
export type Sheet = Awaited<ReturnType<typeof readSheet>>;

export const orderCode = (seq: number) => `L${String(seq).padStart(2, '0')}`;

/** Đọc cả 3 tab trong 1 request. `row` là số dòng trên sheet (1-based) để ghi lại đúng chỗ. */
export async function readSheet() {
    const { valueRanges } = await api('/values:batchGet?ranges=machines&ranges=orders&ranges=workers');
    const [machines, orders, workers] = (valueRanges as { values?: string[][] }[]).map((v) =>
        (v.values ?? [])
            .map((r, i) => ({ r, row: i + 1 }))
            .slice(1)
            .filter(({ r }) => r[0]),
    );
    return {
        machines: machines
            .map(({ r, row }) => ({ row, id: r[0], name: r[1], short: r[2], area: r[3] as Area, group: r[4], sort: r[5] }))
            .sort((a, b) => Number(a.sort) - Number(b.sort)),
        orders: orders
            .map(({ r, row }) => ({
                row,
                id: Number(r[0]),
                machine: r[1],
                day: r[2],
                seq: Number(r[3]),
                start: fromVn(r[4]),
                end: fromVn(r[5]),
            }))
            .sort((a, b) => a.start - b.start),
        workers: workers.map(({ r, row }) => ({ row, machine: r[0], role: r[1] as WorkerRole, name: r[2] })),
    };
}

const SHEET_IDS = new Map<string, number>();

type Cells = (string | number)[];
export type Change = { update?: { row: number; values: Cells }[]; remove?: number[]; add?: Cells[] };

/** Ghi 1 tab trong 1 batchUpdate (atomic): sửa dòng, xoá dòng, thêm dòng cuối (tự nới lưới khi vượt 1000 dòng). */
export async function commit(tab: Tab, { update = [], remove = [], add = [] }: Change) {
    if (!SHEET_IDS.size) {
        const { sheets } = await api('?fields=sheets.properties(sheetId,title)');
        for (const { properties: p } of sheets) SHEET_IDS.set(p.title, p.sheetId);
    }
    const sheetId = SHEET_IDS.get(tab);
    if (sheetId === undefined) throw new Error(`Thiếu tab "${tab}" trong Google Sheet`);
    const cells = (v: Cells) => ({ values: v.map((x) => ({ userEnteredValue: { stringValue: String(x) } })) });
    await api(':batchUpdate', {
        requests: [
            ...update.map(({ row, values }) => ({
                updateCells: {
                    range: { sheetId, startRowIndex: row - 1, endRowIndex: row, startColumnIndex: 0 },
                    rows: [cells(values)],
                    fields: 'userEnteredValue',
                },
            })),
            // xoá từ dưới lên để số dòng phía trên không bị lệch
            ...[...remove]
                .sort((a, b) => b - a)
                .map((row) => ({ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: row - 1, endIndex: row } } })),
            ...(add.length ? [{ appendCells: { sheetId, rows: add.map(cells), fields: 'userEnteredValue' } }] : []),
        ],
    });
}

/** Bản đọc để hiển thị: cache dùng chung mọi instance Vercel 15 phút, action ghi xong gọi updateTag('sheet').
 *  Action ghi phải dùng `readSheet()` để lấy số dòng tươi. */
export async function readSheetCached() {
    'use cache: remote';
    cacheLife({ stale: 0, revalidate: 900, expire: 3600 });
    cacheTag('sheet');
    return readSheet();
}
