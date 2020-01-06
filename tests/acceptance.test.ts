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
import { Terminal } from "../src/terminal"
import { RPP } from "../src/rpp"



class Acceptance {


    public invoke(commandLine: string[]): void {
        new Controller(
            new RPP(),
            new Terminal(console)).execute(commandLine.slice(1));
    }


    public removeTemporaryFiles (): void {
        fs.readdir(".", (error, files) => {
            if (error) throw error;
            for (let anyFile of files) {
                if (anyFile.startsWith(Acceptance.PREFIX)) {
                    fs.unlinkSync(anyFile);
                }
            }
        });
    }


    public createRandomFileName(extension): string {
        const randomString = Math.random().toString(36).substring(2,15);
        return Acceptance.PREFIX
            + randomString
            + extension;
    }


    private static readonly PREFIX: string = "test_";

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

});
