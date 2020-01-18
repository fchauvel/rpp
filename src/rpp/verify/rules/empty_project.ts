/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project } from "../../../rpp/wbs";
import { Codes, Rule } from "./commons";


export class EmptyProject extends Rule {

    public onProject(project: Project): void {
        if (project.breakdown.length === 0) {
            this.error(
                `Project ${project.name} is empty.`,
                "Have we forgotten some tasks or work packages there?",
                Codes.EMPTY_PROJECT,
                project.name,
            );
        }
    }

}
