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
import { Format } from "../adapters";
import { teamSchema, workPlanSchema } from "./schemas";

export class JSONFormat extends Format {

    constructor() {
        super("JSON", [".json"]);
    }

    public parseProject(content: string): Project {
        const data = JSON.parse(content);
        return workPlanSchema.read(data).as("workplan-root").project;
    }

    public parseTeam(content: string): Team {
        const data = JSON.parse(content);
        return teamSchema.read(data).as("teams-root").team;
    }

}
