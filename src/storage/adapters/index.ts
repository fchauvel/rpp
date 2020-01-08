/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Activity, Deliverable, Package, Project, Task } from "../../wbs";

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

    protected asProject(data: any): Project {
        const activities = this.parseActivities(data.project.breakdown);
        return new Project(data.project.name,
                           activities,
                           new Date(data.project.origin));
    }

    protected parseActivities(json: any[]): Activity[] {
        const activities: Activity[] = [];
        for (const item of json) {
            if ("breakdown" in item) {
                const breakdown = this.parseActivities(item.breakdown);
                activities.push(new Package(item.name, breakdown));
            } else {
                const deliverables = this.parseDeliverable(item.deliverables);
                const task = new Task(
                    item.name,
                    item.start,
                    item.duration,
                    deliverables);
                activities.push(task);
            }
        }
        return activities;
    }

    protected parseDeliverable(json: any[]): Deliverable[] {
        const deliverables: Deliverable[] = [];
        if (!(Symbol.iterator in Object(json))) {
            return deliverables;
        }
        for (const item of json) {
            const deliverable = new Deliverable(item.name,
                                                item.kind,
                                                item.due);
            deliverables.push(deliverable);
        }
        return deliverables;
    }
}
