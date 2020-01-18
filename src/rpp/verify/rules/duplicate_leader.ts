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
import { format } from "../../../utils";
import { Codes, Rule } from "./commons";



const DESCRIPTION = "Task '{0}' has multiple leaders: {1}.";
const ADVICE = "Please check their roles.";


export class DuplicateLeader extends Rule  {

    public onTask(task: Task): void {
        this.onActivity(task);
    }

    public onPackage(workPackage: Package): void {
        this.onActivity(workPackage);
    }

    private onActivity(activity: Activity): void {
        if (this.blueprint.team) {
            const leaders =
                this.blueprint.team.leadersOf(this.path);
            if (leaders.length > 1) {
                const leaderNames = leaders.map((l) => l.name).join(", ");
                this.error(
                    format(DESCRIPTION, activity.name, leaderNames),
                    ADVICE,
                    Codes.DUPLICATE_LEADER,
                    this.path.asIdentifier("A"),
                );
            }
        }
    }

}
