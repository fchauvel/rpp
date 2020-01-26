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
import { teamSchema, workPlanSchema } from "./schemas";

export class YAMLFormat extends Format {

    constructor() {
        super("YAML", [".yaml", ".yml"]);
    }

    public parseProject(content: string): Project {
        const data = yaml.safeLoad(content);
        return workPlanSchema.read(data).as("workplan-root").project;
    }


    public parseTeam(content: string): Team {
        const data = yaml.safeLoad(content);
        return teamSchema.read(data).as("teams-root").team;
    }

}
