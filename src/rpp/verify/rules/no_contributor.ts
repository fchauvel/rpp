/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Activity, Package, Task } from "../../../rpp/wbs";
import { Codes, Rule } from "./commons";



export class ActivityWithoutContributor extends Rule  {

    public onPackage(workPackage: Package): void {
        this.onActivity(workPackage);
    }


    public onTask(task: Task): void {
        this.onActivity(task);
    }


    private onActivity(activity: Activity): void {
        if (this.blueprint.team) {
            const existContributor =
                this.blueprint.team.members.some(
                    m => m.contributesTo(this.path)
                );
            if (!existContributor) {
                const identifier = this.path.asIdentifier("A");
                this.error(
                    `No one contributes to Activity '${activity.name}'.`,
                    "Please check the roles set up in the team",
                    Codes.NO_CONTRIBUTOR,
                    identifier);
            }
        }
    }
}
