/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import * as fs from "fs";

import { Controller } from "../src/controller";
import { RPP } from "../src/rpp";
import { Output, Terminal } from "../src/terminal";


class CaptureOutput implements Output {
    public output: string;

    constructor() {
        this.output = "";
    }

    public log(text: string): void {
        this.output += text;
    }

    public reset(): void {
        this.output = "";
    }

}


class Acceptance {

    private static readonly PREFIX: string = "test_";

    private _output: CaptureOutput;

    constructor() {
        this._output = new CaptureOutput();
    }

    get output(): string {
        return this._output.output;
    }

    public clearOutput(): void {
        this._output.reset();
    }

    public invoke(commandLine: string[]): void {
        new Controller(
            new RPP(),
            new Terminal(this._output)).execute(commandLine.slice(1));
    }

    public removeTemporaryFiles(): void {
        fs.readdir(".", (error, files) => {
            if (error) { throw error; }
            for (const anyFile of files) {
                if (anyFile.startsWith(Acceptance.PREFIX)) {
                    fs.unlinkSync(anyFile);
                }
            }
        });
    }

    public createRandomFileName(extension): string {
        const randomString = Math.random().toString(36).substring(2, 15);
        return Acceptance.PREFIX
            + randomString
            + extension;
    }


    public verifyOutput(warningCount: number, errorCount: number): void {
        const pattern =
            `${warningCount} warning(s), ${errorCount} error(s)`;
        expect(this.output).toMatch(pattern);
    }


}

describe("Given the EPIC project", () => {

    const tester = new Acceptance();

    describe("'rpp gantt' should", () => {

        afterAll(() => {
            tester.removeTemporaryFiles();
        });

        test("generate an SVG file from the workplan in JSON", () => {
            const outputFile = tester.createRandomFileName(".svg");

            tester.invoke(["rpp",
                           "gantt",
                           "-p",
                           "samples/epic/workplan.json",
                           "-o",
                           outputFile]);

            expect(fs.existsSync(outputFile)).toBe(true);
            expect(fs.statSync(outputFile).size).toBeGreaterThan(20000);
        });

        test("generate an SVG file from the workplan in YAML", () => {
            const outputFile = tester.createRandomFileName(".svg");

            tester.invoke(["rpp",
                           "gantt",
                           "-p",
                           "samples/epic/workplan.yaml",
                           "-o",
                           outputFile]);

            expect(fs.existsSync(outputFile)).toBe(true);
            expect(fs.statSync(outputFile).size).toBeGreaterThan(20000);
        });

        test("generate an SVG file from the workplan and team descriptions", () => {
            const outputFile = tester.createRandomFileName(".svg");

            tester.invoke(["rpp",
                           "gantt",
                           "-p",
                           "samples/epic/workplan.yaml",
                           "-t",
                           "samples/epic/team.yaml",
                           "-o",
                           outputFile]);

            expect(fs.existsSync(outputFile)).toBe(true);
            expect(fs.statSync(outputFile).size).toBeGreaterThan(20000);
        });

    });


    describe("'rpp verify' should spot", () => {

        beforeEach(() => tester.clearOutput());

        test("no issues in the workplan", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/epic/workplan.yaml"]);

            tester.verifyOutput(0, 0);
        });

        test("no issues in the workplan and the team", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/epic/workplan.yaml",
                           "-t",
                           "samples/epic/team.yaml"]);

            tester.verifyOutput(0, 0);
        });


    });

});


describe("Given the 'Erroneous' sample", () => {

    const tester = new Acceptance();
    beforeEach(() => tester.clearOutput());

    describe("'rpp verify' should spot", () => {

        test("3 issues in the workplan", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/erroneous/workplan.yaml"]);

            tester.verifyOutput(2, 1);
        });


        test("5 issues in the workplan and the team", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/erroneous/workplan.yaml",
                           "-t",
                           "samples/erroneous/team.yaml"]);

            tester.verifyOutput(3, 2);
        });

    });

});
