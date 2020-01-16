/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Deliverable, Task } from "../../../rpp/wbs";
import { Codes, Rule } from "./commons";



export class DeliverableOutsideTask extends Rule {

    private _task: Task;

    public onTask(task: Task): void {
        this._task = task;
    }

    public onDeliverable(deliverable: Deliverable): void {
        if (deliverable.dueDate > this._task.end) {
            const identifier = this.path.asIdentifier("D");
            this.error(
                `${identifier} (${deliverable.name}) is due after the task ends.`,
                "Please check task start, duration and deliverable date.",
                Codes.WRONG_DELIVERABLE_DATE);
        }
        if (deliverable.dueDate < this._task.start) {
            const identifier = this.path.asIdentifier("D");
            this.error(
                `${identifier} (${deliverable.name}) is due before the task starts.`,
                "Please check task start, duration and deliverable date.",
                Codes.WRONG_DELIVERABLE_DATE);
        }
    }
}
