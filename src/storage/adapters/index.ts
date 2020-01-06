/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project, Task, Package, Activity } from "../../wbs";



export abstract class Format {

    private _name: string;
    private _extensions: string[];


    constructor (name: string, extensions: string[]=[]) {
        this._name = name;
        this._extensions = extensions;
    }


    public get name(): string {
        return this._name;
    }


    public accept(resource: string): boolean {
        const extension = resource.match(Format.EXTENSION_PATTERN);
        return extension !== null &&
            this._extensions.includes(extension[0]);
    }

    private static readonly EXTENSION_PATTERN: RegExp
        = /\.([0-9a-z]+)(?:[\?#]|$)/i;


    public parseProject(source: string): Project {
        const message = "Loading projects from "
            + `${this.name} files is not yet suported!`;
        throw new Error(message);
    }


    public writeGantt(project: Project): string {
        const message = "Gantt serialization not yet"
            + `supported for ${this.name} files.`;
        throw new Error(message);
    }


    protected parseActivities(json: Array<any>): Array<Activity> {
        const activities: Array<Activity> = [];
        for (const item of json) {
            if ("breakdown" in item) {
                const breakdown = this.parseActivities(item.breakdown);
                activities.push(new Package(item.name, breakdown));
            } else {
                const task = new Task(
                    item.name,
                    item.start,
                    item.duration);
                activities.push(task);
            }
        }
        return activities;
    }
}
