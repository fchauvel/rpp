/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Report } from "../src/rpp/verify/report";
import { Terminal } from "../src/terminal";
import { format } from "../src/utils";
import { SpyOutput } from "./spies";



describe("The terminal should", () => {

    const output = new SpyOutput();
    const terminal = new Terminal(output);

    beforeEach(() => {
        output.reset();
    });

    test("format version number", () => {
        const version = "0.0.0";

        terminal.showVersion(version, null);

        const pattern = new RegExp(format(terminal.VERSION, version));
        expect(output.text).toMatch(pattern);
    });

    test("format version number with commit hash", () => {
        const version = "0.0.0";
        const commit = "abcedfghijklmnopqrstuvwxyz";

        terminal.showVersion(version, commit);

        expect(output.text).toMatch(version);
        expect(output.text).toMatch(commit.substring(0, terminal.HASH_LENGTH));
    });

    test("format 'help' message", () => {
        const message = "help";

        terminal.showHelp(message);

        expect(output.text).toMatch(message);
    });


    test("format verification report", () => {
        const report = new Report();
        report.warn("Very nice!", "Good job");

        terminal.showVerificationReport(report);

        expect(output.text).toMatch("Very nice!");
    });

    test("format invalid arguments", () => {
        const message = "Invalid arguments: x y";

        terminal.invalidArguments(message, null);

        expect(output.text).toMatch(message);
    });

});
