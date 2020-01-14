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

export class JSONFormat extends Format {

    constructor() {
        super("JSON", [".json"]);
    }

    public parseProject(content: string): Project {
        return this.asProject(JSON.parse(content).project);
    }

    public parseTeam(content: string): Team {
        return this.asTeam(JSON.parse(content).team);
    }

}
