/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Durations, Period } from "./time";

export abstract class Activity {

    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }

    public abstract get start(): number;

    public abstract get duration(): number;

    public abstract get end(): number;

    public abstract get deliverables(): Deliverable[];

    public abstract accept(visitor: Visitor): void;

}

export class Deliverable {

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
        visitor.onDeliverable(this);
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
        visitor.onTask(this);
        for (const [index, deliverable] of this._deliverables.entries()) {
            visitor.path.enter(index + 1);
            deliverable.accept(visitor);
            visitor.path.exit();
        }
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
            (earliest, activity) => {
                return earliest < activity.start ?
                    earliest :
                    activity.start;
            },
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
        visitor.onPackage(this);
        this.iterateOverBreakdown(visitor);
    }

    protected iterateOverBreakdown(visitor: Visitor): void {
        for (const [index, activity] of this.breakdown.entries()) {
            visitor.path.enter(index + 1);
            activity.accept(visitor);
            visitor.path.exit();
        }
    }

}

export class Project extends Package {

    private _origin: Date;

    constructor(name: string, breakdown: Activity[], origin: Date= null) {
        super(name, breakdown);
        this._origin = origin || new Date();
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

    public accept(visitor: Visitor): void {
        visitor.onProject(this);
        this.iterateOverBreakdown(visitor);
    }

}

export class Path {

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

    public asIdentifier(prefix: string, separator= "."): string {
        return prefix + " " + this._indexes.map(String).join(separator);
    }

    public append(index: number): Path {
        return new Path(this._indexes.concat([index]));
    }

    public enter(index: number): void {
        this._indexes.push(index);
    }

    public exit(): void {
        if (this._indexes.length == 0) {
            throw new Error("Cannot exit root!");
        }
        this._indexes.pop();
    }

}

export abstract class Visitor {

    private _path: Path;

    constructor() {
        this._path = new Path();
    }

    public get path(): Path {
        return this._path;
    }

    public onTask(task: Task): void {}

    public onPackage(workPackage: Package): void {}

    public onProject(project: Project): void {}

    public onDeliverable(deliverable: Deliverable): void {}

}
