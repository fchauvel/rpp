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

}

describe("Given the EPIC project", () => {

    const tester = new Acceptance();

    describe("RPP gantt should", () => {

        afterAll(() => {
            tester.removeTemporaryFiles();
        });

        test("generate a new SVG file from a JSON file", () => {
            const outputFile = tester.createRandomFileName(".svg");

            tester.invoke(["rpp",
                           "gantt",
                           "-p",
                           "samples/epic.json",
                           "-o",
                           outputFile]);

            expect(fs.existsSync(outputFile)).toBe(true);
            expect(fs.statSync(outputFile).size).toBeGreaterThan(20000);
        });

        test("generate a new SVG file from a YAML file", () => {
            const outputFile = tester.createRandomFileName(".svg");

            tester.invoke(["rpp",
                           "gantt",
                           "-p",
                           "samples/epic.yaml",
                           "-o",
                           outputFile]);

            expect(fs.existsSync(outputFile)).toBe(true);
            expect(fs.statSync(outputFile).size).toBeGreaterThan(20000);
        });

    });


    describe("RPP verify should", () => {


        function verifyOutput(warningCount: number, errorCount: number): void {
            const pattern =
                `${warningCount} warning(s), ${errorCount} error(s)`;
            expect(tester.output).toMatch(pattern);
        }

        beforeEach(() => tester.clearOutput());

        test("find no issues in samples.epic.yaml", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/epic.yaml"]);

            verifyOutput(0, 0);
        });


        test("find issues in samples/erroneous.yaml", () => {
            tester.invoke(["rpp",
                           "verify",
                           "-p",
                           "samples/erroneous.yaml"]);

            verifyOutput(2, 1);
        });

    });

});
