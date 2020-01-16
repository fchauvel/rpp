/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Durations, Period } from "../time";

export interface Element {

    accept(visitor: Visitor): void;

}


export abstract class Activity implements Element {

    public get name(): string {
        return this._name;
    }

    public abstract get start(): number;

    public abstract get duration(): number;

    public abstract get end(): number;

    public abstract get deliverables(): Deliverable[];

    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public abstract accept(visitor: Visitor): void;

    public overlapWith(other: Activity): boolean {
        return this.activeOn(other.start) || this.activeOn(other.end)
            || other.activeOn(this.start) || other.activeOn(this.end);
    }


    public isContiguousWith(other: Activity): boolean {
        return this.end + 1 === other.start
            || other.end + 1 === this.start;
    }

    private activeOn(date: number): boolean {
        return date >= this.start && date <= this.end;
    }


}

export class Deliverable implements Element {

    private _name: string;
    private _kind: string;
    private _date: number;

    constructor(name: string, kind: string, date: number) {
        this._name = name;
        this._kind = kind;
        this._date = date;
    }

    public get name(): string {
        return this._name;
    }

    public get dueDate(): number {
        return this._date;
    }

    public get kind(): string {
        return this._kind;
    }

    public accept(visitor: Visitor): void {
        visitor.visitDeliverable(this);
    }

}

export class Task extends Activity {

    private _start: number;
    private _duration: number;
    private _deliverables: Deliverable[];

    constructor(name: string,
                start: number,
                duration= 1,
                deliverables: Deliverable[]= []) {
        super(name);
        this._start = start;
        this._duration = duration;
        this._deliverables = deliverables;
    }

    public get start(): number {
        return this._start;
    }

    public get duration(): number {
        return this._duration;
    }

    public get end(): number {
        return this._start + this._duration - 1;
    }

    public get deliverables(): Deliverable[] {
        return this._deliverables;
    }

    public accept(visitor: Visitor): void {
        visitor.visitTask(this);
    }

}

export class Package extends Activity {

    private _breakdown: Activity[];

    constructor(name: string, breakdown: Activity[]) {
        super(name);
        this._breakdown = breakdown;
    }

    public get start(): number {
        return this.breakdown.reduce(
            (earliest, activity) => Math.min(earliest, activity.start),
            Number.MAX_VALUE);
    }

    public get duration(): number {
        return this.end - this.start + 1;
    }

    public get end(): number {
        return this.breakdown.reduce(
            (latest, activity) => Math.max(latest, activity.end),
            0);
    }

    public get deliverables(): Deliverable[] {
        return this.breakdown.reduce(
            (result: Deliverable[], activity: Activity) => {
                return result.concat(activity.deliverables);
            }, []);
    }

    public get breakdown(): Activity[] {
        return this._breakdown;
    }

    public accept(visitor: Visitor): void {
        visitor.visitPackage(this);
    }


}

export class Project extends Package {

    private _origin: Date;
    private _milestones: Milestone[];

    constructor(name: string,
                breakdown: Activity[],
                origin: Date= null,
                milestones: Milestone[]= []) {
        super(name, breakdown);
        this._origin = origin || new Date();
        this._milestones = milestones;
    }

    public get origin(): Date {
        return this._origin;
    }

    public get period(): Period {
        return new Period(
            this.origin,
            Durations.MONTH.times(this.duration)
                .from(this.origin),
        );
    }

    public get milestones(): Milestone[] {
        return this._milestones;
    }

    public accept(visitor: Visitor): void {
        visitor.visitProject(this);
    }

}

export class Path {

    public static fromText(text: string, separator= "."): Path {
        const pattern = /(\d+)/g;
        const path = text.match(pattern);
        return new Path(path.map((i) => parseInt(i, 10)));
    }


    private _indexes: number[];

    constructor(indexes: number[]= []) {
        this._indexes = indexes;
    }

    public get parent(): Path {
        const length = this._indexes.length;
        if (length <= 1) {
            throw new Error("The root element has no parent!");
        }
        return new Path(this._indexes.slice(0, length - 1));
    }

    public get depth(): number {
        return this._indexes.length;
    }

    public asIdentifier(prefix= "", separator= "."): string {
        return prefix + " " + this._indexes.map(String).join(separator);
    }

    public enter(index: number): void {
        this._indexes.push(index);
    }

    public exit(): void {
        if (this._indexes.length === 0) {
            throw new Error("Cannot exit root!");
        }
        this._indexes.pop();
    }

    public includes(other: Path): boolean {
        return other.asIdentifier().startsWith(this.asIdentifier());
    }

    public equals(other: Path): boolean {
        return this.asIdentifier() === other.asIdentifier();
    }
}


export interface Visitor {

    visitProject(project: Project): void;

    visitPackage(workPackage: Package): void;

    visitTask(task: Task): void;

    visitMilestone(milestone: Milestone): void;

    visitDeliverable(deliverable: Deliverable): void;

}



export class Milestone implements Element {

    private _name: string;
    private _date: number;

    constructor(name: string, date: number) {
        this._name = name;
        this._date = date;
    }

    get name(): string {
        return this._name;
    }

    get date(): number {
        return this._date;
    }


    public accept(visitor: Visitor): void {
        visitor.visitMilestone(this);
    }

}
