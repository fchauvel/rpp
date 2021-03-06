/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../../../rpp";
import { Visitor } from "../../../rpp/visitor";
import { Report } from "../report";



export class Codes {

    // Workplan-related issues
    public static readonly EMPTY_PROJECT = "EMPTY PROJECT";
    public static readonly EMPTY_WORK_PACKAGE = "EMPTY WORK PACKAGE";
    public static readonly SINGLE_TASK_WORK_PACKAGE = "SINGLE ACTIVITY WORK PACKAGE";
    public static readonly TASK_WITHOUT_DELIVERABLE = "NO DELIVERABLE";
    public static readonly WRONG_DELIVERABLE_DATE = "WRONG DELIVERABLE DATE";
    public static readonly DISCONTINUITY_IN_WORK_PACKAGE = "INTERRUPTED WORK PACKAGE";
    public static readonly MILESTONE_AFTER_PROJECT_END = "LATE MILESTONE";
    public static readonly MILESTONE_BEFORE_PROJECT_START = "EARLY MILESTONE";

    // Team-related issues
    public static readonly NO_LEADER = "NO LEADER";
    public static readonly NO_CONTRIBUTOR = "NO CONTRIBUTOR";
    public static readonly EMPTY_TEAM = "EMPTY TEAM";
    public static readonly NO_ROLE = "NO ROLE";
    public static readonly DUPLICATE_LEADER =  "DUPLICATE LEADER";

}



export abstract class Rule extends Visitor {

    private _blueprint: Blueprint;
    private _report: Report;

    public applyTo(blueprint: Blueprint, report: Report): void {
        this._blueprint = blueprint;
        this._report = report;
        blueprint.accept(this);
    }

    protected get blueprint(): Blueprint {
        return this._blueprint;
    }

    protected warn(description: string,
                   advice: string,
                   code?: string,
                   location?: string): void {
        this._report.warn(description, advice, code, location);
    }

    protected error(description: string,
                    advice: string,
                    code?: string,
                    location?: string): void {
        this._report.error(description, advice, code, location);
    }

}
