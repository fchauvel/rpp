/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


export enum Level {
    WARNING = "WARNING",
    ERROR = "ERROR",
}


export class Issue {

    private _level: Level;
    private _description: string;
    private _advice: string;

    constructor(level: Level, description: string, advice: string) {
        this._level = level;
        this._description = description;
        this._advice = advice;
    }

    public get level(): Level {
        return this._level;
    }

    public get description(): string {
        return this._description;
    }

    public get advice(): string {
        return this._advice;
    }

}


export class Report {


    public get issues(): Issue[] {
        return this._issues;
    }

    public get warnings(): Issue[] {
        return this.issuesByLevel(Level.WARNING);
    }

    public get errors(): Issue[] {
        return this.issuesByLevel(Level.ERROR);
    }

    private _issues: Issue[];


    constructor() {
        this._issues = [];
    }


    public warn(description: string, advice: string): void {
        this.push(Level.WARNING, description, advice);
    }


    public error(description: string, advice: string): void {
        this.push(Level.ERROR, description, advice);
    }

    private issuesByLevel(level: Level): Issue[] {
        return this._issues.filter(
            (issue) => issue.level as Level === level,
        );
    }

    private push(level: Level, description: string, advice: string): void {
        this._issues.push(new Issue(level, description, advice));
    }

}
