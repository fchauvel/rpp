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


export class ActivityWithoutLeader extends Rule  {

    public onTask(task: Task): void {
        this.onActivity(task);
    }

    public onPackage(workPackage: Package): void {
        this.onActivity(workPackage);
    }

    private onActivity(activity: Activity): void {
        if (this.blueprint.team) {
            const missingLeader =
                !this.blueprint.team.members.some((m) => m.leads(this.path));
            if (missingLeader) {
                const identifier = this.path.asIdentifier("A");
                this.error(
                    `No one leads Activity '${activity.name}'.`,
                    "Please check the roles set up in the team.",
                    Codes.NO_LEADER,
                    identifier
                );
            }
        }
    }
}
