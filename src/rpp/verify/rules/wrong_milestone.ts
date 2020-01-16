/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Milestone, Project } from "../../../rpp/wbs";
import { Codes, Rule } from "./commons";



export class MilestoneOutsideProject extends Rule {

    private _project: Project;


    public onProject(project: Project): void {
        this._project = project;
    }

    public onMilestone(milestone: Milestone): void {
        if (milestone.date > this._project.end) {
            this.error(
                `Milestone '${milestone.name}' comes after project end.`,
                "Check the milestone date",
                Codes.MILESTONE_AFTER_PROJECT_END);
        }
        if (milestone.date < this._project.start) {
            this.error(
                `Milestone '${milestone.name}' comes before the project starts.`,
                "Please check milestone date and project start.",
                Codes.MILESTONE_BEFORE_PROJECT_START);
        }
    }

}
