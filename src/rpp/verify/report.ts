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

    public static readonly DEFAULT_CODE = "unknown";
    public static readonly DEFAULT_LOCATION = "unknown";

    private _level: Level;
    private _description: string;
    private _advice: string;
    private _code: string;
    private _location: string;

    constructor(level: Level,
                description: string,
                advice: string,
                code:string,
                location:string) {
        this._level = level;
        this._description = description;
        this._advice = advice;
        this._code = code || Issue.DEFAULT_CODE;
        this._location = location || Issue.DEFAULT_LOCATION;
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

    public get code(): string {
        return this._code;
    }

    public get location(): string {
        return this._location;
    }
}


export class Report {


    private _issues: Issue[];

    constructor() {
        this._issues = [];
    }

    public warn(description: string,
                advice: string,
                code?:string,
                location?:string): void {
        this.push(Level.WARNING, description, advice, code, location);
    }

    public error(description: string,
                 advice: string,
                 code?:string,
                 location?:string): void {
        this.push(Level.ERROR, description, advice, code, location);
    }

    private push(level: Level,
                 description: string,
                 advice: string,
                 code?:string,
                 location?: string): void {
        this._issues.push(
            new Issue(level, description, advice, code, location)
        );
    }

    public get issues(): Issue[] {
        return this._issues;
    }

    public get warnings(): Issue[] {
        return this.issuesByLevel(Level.WARNING);
    }

    public get errors(): Issue[] {
        return this.issuesByLevel(Level.ERROR);
    }

    private issuesByLevel(level: Level): Issue[] {
        return this._issues.filter(
            (issue) => issue.level as Level === level,
        );
    }

}
