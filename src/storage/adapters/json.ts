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
import { Project } from "../../wbs";
import { Format } from "../adapters";
import { ObjectParser } from "./object";


export class JSONFormat extends Format {

    private _read: ObjectParser;

    constructor() {
        super("JSON", [".json"]);
        this._read = new ObjectParser();
    }

    public parseProject(content: string): Project {
        return this._read.asProject(JSON.parse(content).project);
    }

    public parseTeam(content: string): Team {
        return this._read.asTeam(JSON.parse(content).team);
    }

}
