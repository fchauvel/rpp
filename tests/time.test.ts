/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Period, Durations } from "../src/time";



describe("A period should", () => {

    const start = new Date("1980-11-16");
    const end = new Date("1982-11-16");
    const period = new Period(start, end);


    test("expose its start", () => {
        expect(period.start).toBe(start);

    });


    test("expose its end", () => {
        expect(period.end).toBe(end);
    });


    test("should split itself into months", () => {
        const months = period.splitBy(Durations.MONTH);

        expect(months).toHaveLength(24);
        expect(months[0].end).toEqual(new Date("1980-12-16"));
        expect(months[1].end).toEqual(new Date("1981-01-16"));
        expect(months[13].end).toEqual(new Date("1982-01-16"));
        expect(months[23].end).toEqual(new Date("1982-11-16"));
    });


    test("should split itself into quarters", () => {
        const quarters = period.splitBy(Durations.QUARTER);

        expect(quarters).toHaveLength(8);
        expect(quarters[0].end).toEqual(new Date("1981-02-16"));
        expect(quarters[3].end).toEqual(new Date("1981-11-16"));
        expect(quarters[7].end).toEqual(new Date("1982-11-16"));
    });


    test("should split itself into into years", () => {
        const years = period.splitBy(Durations.YEAR);

        expect(years).toHaveLength(2);
        expect(years[0].end).toEqual(new Date("1981-11-16"));
        expect(years[1].end).toEqual(new Date("1982-11-16"));
    });

});
