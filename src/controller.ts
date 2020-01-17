/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import * as yargs from "yargs";
import { Argv } from "yargs";

import { Blueprint, RPP } from "./rpp";
import { FileSystem, Storage } from "./storage";
import { Terminal } from "./terminal";

interface Arguments {

    project: string;
    team: string;
    output: string;

}

export class Controller {

    private _rpp: RPP;
    private _terminal: Terminal;
    private _parser: Argv;
    private _storage: Storage;

    public constructor(rpp: RPP,
                       terminal: Terminal,
                       storage?: Storage) {
        this._rpp = rpp;
        this._terminal = terminal;
        this._storage = storage && storage || new Storage([ new FileSystem() ]);
        this._parser = yargs
            .scriptName("rpp")
            .usage("$0 [command] [options...]")
            .fail((msg: string, err: Error) => {
                this.invalidArguments(msg, err);
            })
            .strict();
        this.configureHelpCommand();
        this.configureVersionCommand();
        this.configureGanttCommand();
        this.configureVerifyCommand();
    }


    public execute(commandLine: string[]): void {
        this._parser.parse(commandLine);
    }


    private configureHelpCommand(): void {
        this._parser = this._parser
            .help(false)
            .command("help",
                     "Show this help message",
                     (yargs2: Argv<Arguments>) => {/**/},
                     (args: Arguments) => { this.showHelp(args); });
    }


    private configureVersionCommand(): void {
        this._parser = this._parser
            .command("version",
                     "show RPP's version",
                     (yargs2: Argv<Arguments>) => {/**/},
                     (args: Arguments) => { this.showVersion(args); })
            .version(false);
    }


    private configureGanttCommand(): void {
        this._parser = this._parser
            .command("gantt",
                     "Generate Gantt chart",
                     (yargs2: Argv<Arguments>) => {
                         yargs2
                             .option("output", {
                                 alias: "o",
                                 default: "gantt.svg",
                                 desc: "set the name of the file to generate",
                                 type: "string",
                             })
                             .option("project", {
                                 alias: "p",
                                 demand: true,
                                 desc: "set the project definition file",
                                 type: "string",
                             }); },
                             (args: Arguments) => { this.generateGantt(args); });
    }


    private configureVerifyCommand(): void {
        this._parser = this._parser
            .command("verify",
                     "Check the consistency of the given input file",
                     (yargs2: Argv<Arguments>) => {
                         yargs2
                             .option("project", {
                                 alias: "p",
                                 demand: true,
                                 description: "Set the project file to verify",
                                 type: "string",
                             })
                             .option("team", {
                                 alias: "t",
                                 demand: false,
                                 description: "Set the team to verify (if any)",
                                 type: "string",
                             });
                     },
                     (args: Arguments) => { this.verify(args); });
    }


    private invalidArguments(message: string, error: Error): void {
        this._terminal.invalidArguments(message, error);
        this.showHelp(null);
    }

    private showVersion(args: Arguments): void {
        const [version, commit] = this._rpp.version();
        this._terminal.showVersion(version, commit);
    }

    private showHelp(args: Arguments): void {
        this._terminal.showHelp("Usage: rpp [command] [option]+");
        this._parser.showHelp("log");
    }

    private generateGantt(args: Arguments): void {
        const project = this._storage.loadProject(args.project);
        this._storage.storeGanttChart(project, args.output);
    }

    private verify(args: Arguments): void {
        const blueprint = this.loadBlueprint(args);
        const report = this._rpp.verify(blueprint);
        this._terminal.showVerificationReport(report);
    }

    private loadBlueprint(args: Arguments): Blueprint {
        const project = this._storage.loadProject(args.project);
        let team = undefined;
        if (args.team) {
            team = this._storage.loadTeam(args.team);
        }
        return new Blueprint(project, team);
    }

}
