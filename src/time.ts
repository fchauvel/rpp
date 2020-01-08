/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

type DateChange = (date: Date) => Date;

export class Duration {

    private _from: DateChange;

    constructor(from: DateChange) {
        this._from = from;
    }

    public from(start: Date): Date {
        return this._from(start);
    }

    public times(count: number): Duration {
        const transition = (start: Date): Date => {
            let end = this.from(start);
            for (let i = 0 ; i < count - 1 ; i++) {
                end = this.from(end);
            }
            return end;
        };
        return new Duration(transition);
    }

}

export class Durations {

    public static readonly MONTH = new Duration((start: Date): Date => {
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        return end;
    });

    public static readonly QUARTER = Durations.MONTH.times(3);

    public static readonly YEAR = Durations.MONTH.times(12);

    public static readonly CALENDAR_YEAR =
        new Duration((start: Date): Date => {
            const end = new Date(start);
            end.setDate(1);
            end.setMonth(0);
            end.setFullYear(start.getFullYear() + 1);
            return end;
        });

}

export class Period {

    private _start: Date;
    private _end: Date;

    constructor(start: Date, end: Date) {
        this._start = start;
        this._end = end;
    }

    public get start(): Date {
        return this._start;
    }

    public get end(): Date {
        return this._end;
    }

    public splitBy(duration: Duration): Period[] {
        const parts: Period[] = [];
        let current: Date = this.start;
        let end = duration.from(current);
        while (end < this.end) {
            parts.push(new Period(current, end));
            current = end;
            end = duration.from(current);
        }
        if (end >= this.end) {
            parts.push(new Period(current, this.end));
        }
        return parts;
    }

    public normalize(date: Date): number {
        return (date.getTime() - this._start.getTime()) /
            (this._end.getTime() - this._start.getTime());
    }

}
