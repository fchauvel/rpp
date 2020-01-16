/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import * as yaml from "js-yaml";
import { Team  } from "../../rpp/team";
import { Project  } from "../../rpp/wbs";
import { Format } from "../adapters";
import { ObjectParser } from "./object";


export class YAMLFormat extends Format {

    private _read: ObjectParser;

    constructor() {
        super("YAML", [".yaml", ".yml"]);
        this._read = new ObjectParser();
    }

    public parseProject(content: string): Project {
        return this._read.asProject(yaml.safeLoad(content).project);
    }


    public parseTeam(content: string): Team {
        return this._read.asTeam(yaml.safeLoad(content).team);
    }

}
