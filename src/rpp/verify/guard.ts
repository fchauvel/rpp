/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../../rpp";
import { Report } from "./report";
import * as rules from "./rules";
import { Rule } from "./rules/commons";


export class Guard {

    private _rules: Rule[];

    constructor() {
        this._rules = [
            new rules.EmptyProject(),
            new rules.EmptyWorkPackage(),
            new rules.SingleActivityWorkPackage(),
            new rules.DeliverableOutsideTask(),
            new rules.TaskWithoutDeliverable(),
            new rules.MilestoneOutsideProject(),
            new rules.InterruptedWorkPackage(),
            new rules.ActivityWithoutContributor(),
            new rules.ActivityWithoutLeader(),
        ];
    }

    public scrutinize(blueprint: Blueprint): Report {
        const report = new Report();
        for (const eachRule of this._rules) {
            eachRule.applyTo(blueprint, report);
        }
        return report;
    }

}
