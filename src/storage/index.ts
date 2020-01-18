/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../rpp";
import { Team } from "../rpp/team";
import { Project  } from "../rpp/wbs";
import { Format } from "./adapters";
import { JSONFormat } from "./adapters/json";
import { SVGFormat } from "./adapters/svg";
import { YAMLFormat } from "./adapters/yaml";

import * as fs from "fs";



export abstract class DataSource {

    public abstract fetch(location: string): string;

    public store(location: string, content: string): void {
        throw new Error("Not supported!");
    }

}

export class FileSystem extends DataSource {

    public fetch(location: string): string {
        const encoding = "utf-8";
        return fs.readFileSync(location, encoding);
    }

    public store(location: string, content: string): void {
        fs.writeFileSync(location, content);
    }

}

export class Storage {

    private _sources: DataSource[];
    private _formats: Format[];

    constructor(sources: DataSource[]= []) {
        this._sources = sources;
        this._formats = [
            new JSONFormat(),
            new YAMLFormat(),
            new SVGFormat(),
        ];
    }

    public loadProject(location: string): Project {
        const content = this._sources[0].fetch(location);
        const reader = this.selectReader(location);
        return reader.parseProject(content);
    }


    public loadTeam(location: string): Team {
        const content = this._sources[0].fetch(location);
        const reader = this.selectReader(location);
        return reader.parseTeam(content);
    }


    public storeGanttChart(blueprint: Blueprint, location: string): void {
        const format = this.selectReader(location);
        const content = format.writeGantt(blueprint);
        this._sources[0].store(location, content);
    }

    private selectReader(location: string): Format {
        for (const anyFormat of this._formats) {
            if (anyFormat.accept(location)) {
                return anyFormat;
            }
        }
        throw Error("Format not supported (" + location + ")");
    }

}
