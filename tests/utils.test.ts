/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { format } from "../src/utils"



describe("The 'format' function should", () => {


    test("accept one 'string' object", () => {
        const result = format("This is '{0}'", "Franck");

        expect(result).toBe("This is 'Franck'");
    });


    test("accept one 'number' object", () => {
        const result = format("This is '{0}'", 1234.34);

        expect(result).toBe("This is '1234.34'");
    });


    test("accept a 'boolean' object", () => {
        const result = format("This is '{0}'", false);

        expect(result).toBe("This is 'false'");
    });


    test("inject mutliple times the same value", () => {
        const result = format("This is '{0}' = {0}", 'Franck');

        expect(result).toBe("This is 'Franck' = Franck");
    });


    test("inject multiple values, multiple times", () => {
        const result = format("{0} {1} {2} {1} {0}", 1, 2, 3);

        expect(result).toBe("1 2 3 2 1");
    });


    test("detect invalid index", () => {
        const block = () => { format("{0}, {1}, {2}", "Franck"); }

        expect(block).toThrow("Invalid indexes: {1},{2}");
    });


});
