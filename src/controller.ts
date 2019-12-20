/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */




import * as infos from "../package.json";
import * as yargs from "yargs";
import { Argv } from "yargs";

import { RPP } from "./rpp";
import { Terminal } from "./terminal";
import { Storage } from "./storage"



export class Controller {

    private _rpp: RPP;
    private _terminal: Terminal;
    private _parser: Argv;
    private _storage: Storage;

    public constructor(rpp: RPP, terminal: Terminal) {
        this._rpp = rpp;
        this._terminal = terminal;
        this._storage = new Storage();
        this._parser =          yargs
            .scriptName("rpp")
            .usage("$0 [command] [options...]")
            .command("help",
                     "generate project visualisations",
                     {},
                     (args: any) => { this.show_help(args); })
            .command("version",
                     "show RPP's version",
                     {},
                     (args: any) => { this.show_version(args); })
            .command("gantt",
                     "Generate Gantt chart",
                     (yargs) => yargs
                     .option("output", {
                         alias: "o",
                         desc: "set the name of the file to generate",
                         type: "string",
                         default: "gantt.svg"
                     })
                     .option("project", {
                         alias: "p",
                         desc: "set the project definition file",
                         type: "string",
                         demand: true
                     }),
                     (args: any) => { this.generateGantt(args);})
            .help(false)
            .version(false)
            .fail((msg: string, err: Error) => {
                this.invalid_arguments(msg, err);
            })
            .strict();
    }

    public execute(commandLine: Array<string>) {
        this._parser.parse(commandLine);
    }


    private invalid_arguments(message: string, error: Error) {
        this._terminal.invalid_arguments(message, error);
        this.show_help(null);
    }


    private show_version(args: any) {
        const [version, commit] = this._rpp.version();
        this._terminal.show_version(version, commit);
    }


    private show_help(args: any) {
        this._terminal.show_help("Usage: rpp [command] [option]+")
        this._parser.showHelp("log");
    }


    private generateGantt(args: any) {
        console.log(args);
        const project = this._storage.loadProject(args.project);
        this._storage.storeGanttChart(project, args.output);
    }


}
