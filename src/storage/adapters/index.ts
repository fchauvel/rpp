/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Team } from "../../rpp/team";
import { Project } from "../../rpp/wbs";


export abstract class Format {

    public get name(): string {
        return this._name;
    }

    private static readonly EXTENSION_PATTERN: RegExp
        = /\.([0-9a-z]+)(?:[\?#]|$)/i;

    private _name: string;
    private _extensions: string[];


    constructor(name: string, extensions: string[]= []) {
        this._name = name;
        this._extensions = extensions;
    }


    public accept(resource: string): boolean {
        const extension = resource.match(Format.EXTENSION_PATTERN);
        return extension !== null &&
            this._extensions.includes(extension[0]);
    }


    public parseTeam(source: string): Team {
        const message = "Loading teams from "
            + `${this.name} files is not yet supported.`;
        throw new Error(message);
    }


    public parseProject(source: string): Project {
        const message = "Loading projects from "
            + `${this.name} files is not yet suported.`;
        throw new Error(message);
    }


    public writeGantt(project: Project): string {
        const message = "Gantt serialization not yet "
            + `supported for ${this.name} files.`;
        throw new Error(message);
    }

}
