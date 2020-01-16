/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */




import * as wbs from "./wbs";
import * as team from "./team";


type Visitable = wbs.Element | team.Visitable;


export class Visitor implements wbs.Visitor, team.Visitor {

    private _path: wbs.Path;

    constructor() {
        this._path = new wbs.Path();
    }

    public get path(): wbs.Path {
        return this._path;
    }

    public visitProject(project: wbs.Project): void {
        this.onProject(project);
        this.iterateOver(project.breakdown);
        this.iterateOver(project.milestones);
    }

    private iterateOver(array: Visitable[]): void {
        for (const [index, entry] of array.entries()) {
            this.path.enter(index + 1);
            entry.accept(this);
            this.path.exit();
        }
    }

    public onProject(project: wbs.Project): void {
        // Do nothing by default
    }


    public visitPackage(workPackage: wbs.Package): void {
        this.onPackage(workPackage);
        this.iterateOver(workPackage.breakdown);
    }

    public onPackage(workPackage: wbs.Package): void {
        // Do nothing by default
    }

    public visitTask(task: wbs.Task): void {
        this.onTask(task);
        this.iterateOver(task.deliverables);
    }

    public onTask(task: wbs.Task): void {
        // Do nothing by default
    }

    public visitDeliverable(deliverable: wbs.Deliverable): void {
        this.onDeliverable(deliverable);
    }

    public onDeliverable(deliverable: wbs.Deliverable): void {
        // Do nothing by default
    }

    public visitMilestone(milestone: wbs.Milestone): void {
        this.onMilestone(milestone);
    }

    public onMilestone(milestone: wbs.Milestone): void {
        // Do nothing by default
    }

    public visitTeam(team: team.Team): void {
        this.onTeam(team);
        this.iterateOver(team.members);
    }

    public onTeam(team: team.Team): void {
        // Do nothing by default;
    }

    public visitPerson(person: team.Person): void {
        this.onPerson(person);
        this.iterateOver(person.roles);
    }

    public onPerson(person: team.Person): void {
        // Do nothing by default;
    }

    public visitRole(role: team.Role): void {
        this.onRole(role);
    }

    public onRole(role: team.Role): void {
        // Do nothing by default;
    }

};
