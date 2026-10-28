'use client';

import {
    DatePicker as AriaDatePicker,
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    DateInput,
    DateSegment,
    Dialog,
    Group,
    Heading,
    I18nProvider,
    Popover,
    type DatePickerProps,
    type DateValue,
} from 'react-aria-components';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const navBtnClass =
    'flex justify-center items-center rounded-lg size-10 text-main hover:bg-main-tint outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring';

/** DatePicker của React Aria, style theo shadcn + brand token. Locale vi-VN, giờ 24h. */
export function DatePicker<T extends DateValue>({ className, ...props }: DatePickerProps<T> & { className?: string }) {
    return (
        <I18nProvider locale="vi-VN">
            <AriaDatePicker hourCycle={24} {...props} className={cn('group flex flex-col', className)}>
                <Group className="flex items-center bg-background py-1 pr-1 pl-3 border border-input group-data-[invalid]:border-destructive rounded-xl focus-within:ring-1 focus-within:ring-ring h-12 text-base">
                    <DateInput className="flex flex-1 min-w-0">
                        {(segment) => (
                            <DateSegment
                                segment={segment}
                                className="data-[type=literal]:px-0 px-0.5 rounded focus:bg-main data-[placeholder]:text-muted-foreground focus:text-white tabular-nums outline-none"
                            />
                        )}
                    </DateInput>
                    <Button aria-label="Mở lịch" className={navBtnClass}>
                        <LuCalendar aria-hidden="true" className="size-5" />
                    </Button>
                </Group>
                <Popover className="bg-card shadow-lg shadow-main/10 p-3 border border-line rounded-2xl outline-none">
                    <Dialog className="outline-none">
                        <Calendar>
                            <header className="flex justify-between items-center pb-2">
                                <Button slot="previous" aria-label="Tháng trước" className={navBtnClass}>
                                    <LuChevronLeft aria-hidden="true" className="size-5" />
                                </Button>
                                <Heading className="font-semibold text-base capitalize" />
                                <Button slot="next" aria-label="Tháng sau" className={navBtnClass}>
                                    <LuChevronRight aria-hidden="true" className="size-5" />
                                </Button>
                            </header>
                            <CalendarGrid className="[&_th]:font-medium [&_th]:text-subText [&_th]:text-xs border-separate border-spacing-0.5">
                                {(date) => (
                                    <CalendarCell
                                        date={date}
                                        className="flex justify-center items-center data-[selected]:bg-main hover:bg-main-tint data-[disabled]:opacity-40 rounded-lg data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring size-10 data-[today]:font-bold data-[selected]:text-white text-sm cursor-pointer data-[outside-month]:invisible outline-none"
                                    />
                                )}
                            </CalendarGrid>
                        </Calendar>
                    </Dialog>
                </Popover>
            </AriaDatePicker>
        </I18nProvider>
    );
}
