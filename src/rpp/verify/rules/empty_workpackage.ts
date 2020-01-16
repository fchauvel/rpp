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


export class EmptyWorkPackage extends Rule {

    public onPackage(workPackage: Package): void {
        if (workPackage.breakdown.length === 0) {
            this.warn(
                `Work package '${workPackage.name}' is empty.`,
                "Have we forgotten some tasks or work packages there?",
                Codes.EMPTY_WORK_PACKAGE);
        }
    }

}
