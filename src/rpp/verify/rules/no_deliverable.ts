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



export class TaskWithoutDeliverable extends Rule {

    public onTask(task: Task): void {
        if (task.deliverables.length === 0) {
            const identifier = this.path.asIdentifier("T");
            this.warn(
                `${identifier} (${task.name}) has no deliverable`,
                "Do we miss some?",
                Codes.TASK_WITHOUT_DELIVERABLE);
        }
    }

}
