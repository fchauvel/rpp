/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Controller } from "../src/controller";
import { RPP } from "../src/rpp";
import { Storage } from "../src/storage";
import { Terminal } from "../src/terminal";

jest.mock("../src/terminal");
jest.mock("../src/rpp");


const MockedStorage = Storage as jest.Mock<Storage>;
const MockedTerminal = Terminal as jest.Mock<Terminal>;
const MockedRPP = RPP as jest.Mock<RPP>;


describe("The controller should", () => {

    const rpp = new MockedRPP();
    rpp.version = jest.fn()
        .mockImplementation(() => ["0.0.0", "abcdef"]);

    const storage = new MockedStorage();
    storage.loadProject = jest.fn()
        .mockImplementation(() => "");
    storage.loadTeam = jest.fn()
        .mockImplementation(() => "");
    storage.storeGanttChart = jest.fn()
        .mockImplementation(() => "");

    const terminal = new MockedTerminal();
    const controller = new Controller(rpp, terminal, storage);


    afterEach(() => {
        jest.clearAllMocks();
    });

    test("accept a 'version' command", async () => {
        await new Promise((resolve) => {
            controller.execute(["version"]);
            resolve();
        });

        expect(rpp.version).toHaveBeenCalledTimes(1);
        expect(terminal.showVersion).toHaveBeenCalledTimes(1);
    });


    test("accept a 'gantt' command", async () => {
        await new Promise((resolve) => {
            controller.execute(["gantt",
                                "-p", "project.yaml",
                                "-o", "gantt.svg"]);
            resolve();
        });

        expect(storage.storeGanttChart).toHaveBeenCalledTimes(1);
    });


    test("accept a 'gantt' command", async () => {
        await new Promise((resolve) => {
            controller.execute(["gantt",
                                "-p", "project.yaml",
                                "-t", "team.yaml",
                                "-o", "gantt.svg"]);
            resolve();
        });

        expect(storage.storeGanttChart).toHaveBeenCalledTimes(1);
    });


    test("accept a 'verify' command", async () => {

        await new Promise((resolve) => {
            controller.execute(["verify", "-p", "dummy.yaml"]);
            resolve();
        });

        expect(rpp.verify).toHaveBeenCalledTimes(1);
        expect(terminal.showVerificationReport).toHaveBeenCalledTimes(1);
    });


    test("accept a 'verify' command with a team", async () => {

        await new Promise((resolve) => {
            controller.execute(["verify",
                                "-p", "dummy.yaml",
                                "-t", "team.yaml"]);
            resolve();
        });

        expect(rpp.verify).toHaveBeenCalledTimes(1);
        expect(terminal.showVerificationReport).toHaveBeenCalledTimes(1);
    });


    test("accept a 'help' command", async () => {
        await new Promise((resolve) => {
            controller.execute(["help"]);
            resolve();
        });

        expect(terminal.showHelp).toHaveBeenCalledTimes(1);
    });


    test("detect invalid command lines", async () => {
        await new Promise((resolve) => {
            controller.execute(["this", "is", "invalid"]);
            resolve();
        });

        expect(terminal.invalidArguments).toHaveBeenCalledTimes(1);
    });

});
