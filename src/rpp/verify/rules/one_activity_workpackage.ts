/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Package } from "../../../wbs";
import { Codes, Rule } from "./commons";



export class SingleActivityWorkPackage extends Rule {

    public onPackage(workPackage: Package): void {
        if (workPackage.breakdown.length === 1) {
            const identifier = this.path.asIdentifier("WP");
            this.warn(
                `${identifier} ($workPackage.name) includes only one activity.`,
                "Is it really necessary?",
                Codes.SINGLE_TASK_WORK_PACKAGE);
        }
    }
}
