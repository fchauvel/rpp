/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Task } from "../../../wbs";
import { Codes, Rule } from "./commons";


export class ActivityWithoutLeader extends Rule  {

    public onTask(task: Task): void {
        if (this.blueprint.team) {
            const missingLeader =
                !this.blueprint.team.members.some((m) => m.leads(this.path));
            if (missingLeader) {
                const identifier = this.path.asIdentifier("T");
                this.error(
                    `No one leads ${identifier}.`,
                    "Please check the roles set up in the team.",
                    Codes.NO_LEADER,
                );
            }
        }
    }
}
