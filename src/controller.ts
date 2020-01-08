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

import { RPP } from "./rpp";
import { FileSystem, Storage } from "./storage";
import { Terminal } from "./terminal";



export class Controller {

    private _rpp: RPP;
    private _terminal: Terminal;
    private _parser: Argv;
    private _storage: Storage;

    public constructor(rpp: RPP, terminal: Terminal) {
        this._rpp = rpp;
        this._terminal = terminal;
        this._storage = new Storage([ new FileSystem() ]);
        this._parser =          yargs
            .scriptName("rpp")
            .usage("$0 [command] [options...]")
            .command("help",
                     "generate project visualisations",
                     {},
                     (args: any) => { this.showHelp(args); })
            .command("version",
                     "show RPP's version",
                     {},
                     (args: any) => { this.showVersion(args); })
            .command("gantt",
                     "Generate Gantt chart",
                     (yargs) => yargs
                     .option("output", {
                         alias: "o",
                         desc: "set the name of the file to generate",
                         type: "string",
                         default: "gantt.svg",
                     })
                     .option("project", {
                         alias: "p",
                         desc: "set the project definition file",
                         type: "string",
                         demand: true,
                     }),
                     (args: any) => { this.generateGantt(args); })
            .help(false)
            .version(false)
            .fail((msg: string, err: Error) => {
                this.invalidArguments(msg, err);
            })
            .strict();
    }

    public execute(commandLine: string[]): void {
        this._parser.parse(commandLine);
    }

    private invalidArguments(message: string, error: Error): void {
        this._terminal.invalidArguments(message, error);
        this.showHelp(null);
    }

    private showVersion(args: any): void {
        const [version, commit] = this._rpp.version();
        this._terminal.showVersion(version, commit);
    }

    private showHelp(args: any): void {
        this._terminal.showHelp("Usage: rpp [command] [option]+");
        this._parser.showHelp("log");
    }

    private generateGantt(args: any): void {
        const project = this._storage.loadProject(args.project);
        this._storage.storeGanttChart(project, args.output);
    }

}