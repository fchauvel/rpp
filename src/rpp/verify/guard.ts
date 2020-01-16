/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../../rpp"
import { Activity, Deliverable, Milestone, Package, Project, Task, Visitor } from "../../wbs";
import { Report } from "./report";



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


abstract class Rule extends Visitor {

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

    protected warn(description: string, advice: string, code: number=0): void {
        this._report.warn(description, advice, code);
    }

    protected error(description: string, advice: string, code: number=0): void {
        this._report.error(description, advice, code);
    }

}


class EmptyProject extends Rule {

    public onProject(project: Project): void {
        if (project.breakdown.length === 0) {
            this.error(
                `Project ${project.name} is empty.`,
                "Have we forgotten some tasks or work packages there?",
                Codes.EMPTY_PROJECT
            );
        }
    }

}


class EmptyWorkPackage extends Rule {

    public onPackage(workPackage: Package): void {
        if (workPackage.breakdown.length === 0) {
            this.warn(
                `Work package '${workPackage.name}' is empty.`,
                "Have we forgotten some tasks or work packages there?",
                Codes.EMPTY_WORK_PACKAGE);
        }
    }

}


class SingleActivityWorkPackage extends Rule {

    public onPackage(workPackage: Package): void {
        if (workPackage.breakdown.length === 1) {
            const identifier = this.path.asIdentifier("WP");
            this.warn(
                `${identifier} ($workPackage.name) includes only one activity.`,
                "Is it really necessary?",
                Codes.SINGLE_TASK_WORK_PACKAGE);
        }
    }
}


class TaskWithoutDeliverable extends Rule {

    public onTask(task: Task): void {
        if (task.deliverables.length === 0) {
            const identifier = this.path.asIdentifier("T");
            this.warn(
                `${identifier} (${task.name}) has no deliverable`,
                "Do we miss some?",
                Codes.TASK_WITHOUT_DELIVERABLE);
        }
    }

}


class DeliverableOutsideTask extends Rule {

    private _task: Task;

    public onTask(task: Task): void {
        this._task = task;
    }

    public onDeliverable(deliverable: Deliverable): void {
        if (deliverable.dueDate > this._task.end) {
            const identifier = this.path.asIdentifier("D");
            this.error(
                `${identifier} (${deliverable.name}) is due after the task ends.`,
                "Please check task start, duration and deliverable date.",
                Codes.WRONG_DELIVERABLE_DATE);
        }
        if (deliverable.dueDate < this._task.start) {
            const identifier = this.path.asIdentifier("D");
            this.error(
                `${identifier} (${deliverable.name}) is due before the task starts.`,
                "Please check task start, duration and deliverable date.",
                Codes.WRONG_DELIVERABLE_DATE);
        }
    }
}


class MilestoneOutsideProject extends Rule {

    private _project: Project;


    public onProject(project: Project): void {
        this._project = project;
    }

    public onMilestone(milestone: Milestone): void {
        if (milestone.date > this._project.end) {
            this.error(
                `Milestone '${milestone.name}' comes after project end.`,
                "Check the milestone date",
                Codes.MILESTONE_AFTER_PROJECT_END);
        }
        if (milestone.date < this._project.start) {
            this.error(
                `Milestone '${milestone.name}' comes before the project starts.`,
                "Please check milestone date and project start.",
                Codes.MILESTONE_BEFORE_PROJECT_START);
        }
    }

}


class DiscontinuousWorkPackage extends Rule {


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
                     Codes.DISCONTINUITY_IN_WORK_PACKAGE);
        }
    }

}


class ActivityWithoutContributors extends Rule  {

    public onTask(task: Task): void {
        if (this.blueprint.team) {
            const contributors =
                this.blueprint.team.contributorsTo(this.path);
            if (contributors.length === 0) {
                const identifier = this.path.asIdentifier("T");
                this.error(
                    `No one contributes to ${identifier}.`,
                    `Please check the roles set up in the team.`,
                    Codes.NO_CONTRIBUTOR
                );
            }
        }
    }
}


class ActivityWithoutLeader extends Rule  {

    public onTask(task: Task): void {
        if (this.blueprint.team) {
            const missingLeader =
                !this.blueprint.team.members.some(m => m.leads(this.path));
            if (missingLeader) {
                const identifier = this.path.asIdentifier("T");
                this.error(
                    `No one leads ${identifier}.`,
                    `Please check the roles set up in the team.`,
                    Codes.NO_LEADER
                );
            }
        }
    }
}



export class Guard {

    private _rules: Rule[];

    constructor() {
        this._rules = [
            new EmptyProject(),
            new EmptyWorkPackage(),
            new SingleActivityWorkPackage(),
            new MilestoneOutsideProject(),
            new TaskWithoutDeliverable(),
            new DeliverableOutsideTask(),
            new DiscontinuousWorkPackage(),
            new ActivityWithoutContributors(),
            new ActivityWithoutLeader()
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
