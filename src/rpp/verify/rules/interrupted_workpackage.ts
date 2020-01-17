/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Activity, Package } from "../../../rpp/wbs";
import { Codes, Rule } from "./commons";


export class InterruptedWorkPackage extends Rule {


    public onPackage(workPackage: Package): void {

        const isDisconnected = (activity: Activity): boolean => {
            return !workPackage.breakdown.some(
                (other: Activity) => {
                    return (activity !== other)
                        && (activity.overlapWith(other)
                            || activity.isContiguousWith(other));
                });
        };

        const disconnected = workPackage.breakdown.find(isDisconnected);
        if (workPackage.breakdown.length > 1
            && disconnected) {
            const identifier = this.path.asIdentifier("WP");
            this.warn(`${identifier} (${workPackage.name}) is discontinuous. `
                       + `Activity '${disconnected.name}' is disconnected from the others.`,
                      `Please check start and duration of ${identifier} activities.`,
                      Codes.DISCONTINUITY_IN_WORK_PACKAGE,
                      identifier);
        }
    }

}
