'use client';

import {
    TimeField as AriaTimeField,
    DateInput,
    DateSegment,
    I18nProvider,
    type TimeFieldProps,
    type TimeValue,
} from 'react-aria-components';
import { cn } from '@/lib/utils';

/** TimeField của React Aria, style theo shadcn + brand token. Locale vi-VN, giờ 24h. */
export function TimeField<T extends TimeValue>({ className, ...props }: TimeFieldProps<T> & { className?: string }) {
    return (
        <I18nProvider locale="vi-VN">
            <AriaTimeField hourCycle={24} {...props} className={cn('group flex flex-col', className)}>
                <DateInput className="flex items-center bg-background px-3 border border-input group-data-[invalid]:border-destructive rounded-xl focus-within:ring-1 focus-within:ring-ring h-12 text-base">
                    {(segment) => (
                        <DateSegment
                            segment={segment}
                            className="data-[type=literal]:px-0 px-0.5 rounded focus:bg-main data-[placeholder]:text-muted-foreground focus:text-white tabular-nums outline-none"
                        />
                    )}
                </DateInput>
            </AriaTimeField>
        </I18nProvider>
    );
}
