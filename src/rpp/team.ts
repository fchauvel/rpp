/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Path } from "./wbs";


export interface Visitor {

    visitTeam(team: Team): void;

    visitPerson(person: Person): void;

    visitRole(role: Role): void;

}


export interface Visitable {

    accept(visitor: Visitor): void;

}


export class Role implements Visitable {

    public static readonly CONTRIBUTOR = "contributor";
    public static readonly LEADER = "leader";


    public static lead(activity: Path): Role {
        return new Role(Role.LEADER, activity);
    }

    public static contributeTo(activity: Path): Role {
        return new Role(Role.CONTRIBUTOR, activity);
    }

    private _role: string;
    private _activity: Path;

    constructor(role: string, activity: Path) {
        this._role = role;
        this._activity = activity;
    }

    get activity(): Path {
        return this._activity;
    }

    get isLeader(): boolean {
        return this._role === Role.LEADER;
    }

    public accept(visitor: Visitor): void {
        visitor.visitRole(this);
    }

}


export abstract class Partner implements Visitable {

    public abstract get name(): string;

    public abstract contributesTo(activity: Path): boolean;

    public abstract leads(activity: Path): boolean;

    public abstract leadersOf(activity: Path): Partner[];

    public abstract accept(visitor: Visitor): void;

}


export class Team extends Partner {

    private _name: string;
    private _members: Partner[];

    constructor(name: string, members: Partner[]) {
        super();
        this._name = name;
        this._members = members;
    }

    public get name(): string {
        return this._name;
    }

    public get members(): Partner[] {
        return this._members;
    }

    public contributesTo(path: Path): boolean {
        return this._members.some((member) => member.contributesTo(path));
    }

    public leads(activity: Path): boolean {
        return this._members.some((member) => member.leads(activity));
    }

    public leadersOf(activity: Path): Partner[] {
        return this._members.reduce(
            (contributors, member) => {
                return contributors.concat(member.leadersOf(activity));
            },
            []);
    }

    public accept(visitor: Visitor): void {
        visitor.visitTeam(this);
    }

}


export class Person extends Partner {

    private _firstName: string;
    private _lastName: string;
    private _roles: Role[];

    constructor(firstName: string, lastName: string, roles: Role[]= []) {
        super();
        this._firstName = firstName;
        this._lastName = lastName;
        this._roles = roles;
    }

    public get firstName(): string {
        return this._firstName;
    }

    public get lastName(): string {
        return this._lastName;
    }

    public get name(): string {
        return this.firstName + " " + this.lastName;
    }

    public contributesTo(activity: Path): boolean {
        return this._roles.some(
            (r) => activity.includes(r.activity),
        );
    }

    public leads(activity: Path): boolean {
        return this._roles.some(
            (r) => r.activity.equals(activity) && r.isLeader,
        );
    }

    public leadersOf(activity: Path): Partner[] {
        if (this.leads(activity)) {
            return [ this ];
        }
        return [];
    }

    public get roles(): Role[] {
        return this._roles;
    }

    public accept(visitor: Visitor): void {
        visitor.visitPerson(this);
    }

}
