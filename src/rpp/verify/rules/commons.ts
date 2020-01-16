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
import { Visitor } from "../../../wbs";
import { Report } from "../report";



export class Codes {

    // Work-breakdown related issues
    public static readonly EMPTY_PROJECT = 1;
    public static readonly EMPTY_WORK_PACKAGE = 2;
    public static readonly SINGLE_TASK_WORK_PACKAGE = 3;
    public static readonly TASK_WITHOUT_DELIVERABLE = 4;
    public static readonly WRONG_DELIVERABLE_DATE = 5;
    public static readonly DISCONTINUITY_IN_WORK_PACKAGE = 6;

    // Milestone related issue
    public static readonly MILESTONE_AFTER_PROJECT_END = 10;
    public static readonly MILESTONE_BEFORE_PROJECT_START = 11;

    // Team-related issues
    public static readonly NO_LEADER = 100;
    public static readonly NO_CONTRIBUTOR = 101;

}



export abstract class Rule extends Visitor {

    private _blueprint: Blueprint;
    private _report: Report;

    public applyTo(blueprint: Blueprint, report: Report): void {
        this._blueprint = blueprint;
        this._report = report;
        blueprint.project.accept(this);
    }

    protected get blueprint(): Blueprint {
        return this._blueprint;
    }

    protected warn(description: string, advice: string, code= 0): void {
        this._report.warn(description, advice, code);
    }

    protected error(description: string, advice: string, code= 0): void {
        this._report.error(description, advice, code);
    }

}
