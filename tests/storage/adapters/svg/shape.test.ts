/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Blueprint } from "../../../../src/rpp";
import { Person, Role, Team } from "../../../../src/rpp/team";
import { Visitor } from "../../../../src/rpp/visitor";
import { Activity, Deliverable, Milestone, Package, Path, Project, Task } from "../../../../src/rpp/wbs";
import { GanttPainter, Layout, Tags } from "../../../../src/storage/adapters/svg/painter";
import { Figure, Shape } from "../../../../src/storage/adapters/svg/shape";

class Reader {

    private _chart: Figure;

    constructor(chart: Figure) {
        this._chart = chart;
    }

    public readStartAndEnd(identifier: string): [number, number] {
        const timeAxis = this._chart.findShapesWithTags([Tags.TIME_AXIS])[0];
        const bar = this._chart.findShapesWithTags([identifier,
                                                    Tags.BAR])[0];

        const width = timeAxis.boundingBox.right - timeAxis.boundingBox.left;
        const start = (bar.boundingBox.left - timeAxis.boundingBox.left) /
            width;
        const end = (bar.boundingBox.right - timeAxis.boundingBox.left) /
            width;
        return [start, end];
    }

    public readDeliverableDueDate(identifier: string): number {
        const timeAxis = this._chart.findShapesWithTags([Tags.TIME_AXIS])[0];
        const deliverable = this.findDeliverable(identifier);
        const width = timeAxis.boundingBox.right - timeAxis.boundingBox.left;
        return (deliverable.boundingBox.center.x - timeAxis.boundingBox.left) / width;
    }


    public readMilestoneDate(identifier: string): number {
        const timeAxis = this._chart.findShapesWithTags([Tags.TIME_AXIS])[0];
        const milestone = this._chart.findShapesWithTags([identifier,
                                                          Tags.MILESTONE])[0];
        const width = timeAxis.boundingBox.right - timeAxis.boundingBox.left;
        return (milestone.boundingBox.center.x - timeAxis.boundingBox.left) / width;
    }


    public findLeader(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [
                identifier,
                Tags.LEADER,
            ],
        )[0];
    }

    public findDeliverable(identifier: string): Shape {
        return this._chart.findShapesWithTags([identifier,
                                        Tags.DELIVERABLE])[0];
    }

    public findActivityLabel(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.NAME])[0];
    }

    public findActivityBar(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.BAR])[0];
    }

    public findActivityIdentifier(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.IDENTIFIER])[0];
    }

}

abstract class Tester extends Visitor {

    public onTask(task: Task): void {
        this.verify("T", task);
    }

    public onPackage(workPackage: Package): void {
        this.verify("WP", workPackage);
    }

    protected abstract verify(prefix: string, activity: Activity): void;

}

describe("A Gantt chart should", () => {

    const project = new Project(
        "P1",
        [
            new Task("First Task", 1, 10),
            new Task("Second Task", 5, 7,
                     [ new Deliverable("Blabla",
                                       "Report",
                                       1),
                     ]),
            new Package("Hard Stuff", [
                new Task("Fairly hard", 5, 5),
                new Task("Really hard", 7, 7),
            ]),
        ],
        undefined,
        [ new Milestone("MS1 key milestone", 6) ],
    );

    const team = new Team(
        "Team",
        [
            new Person("John", "Doe",
                       [ Role.lead(new Path([1])),
                         Role.lead(new Path([3])) ]),
            new Person("Mark", "Moe",
                       [ Role.lead(new Path([2])),
                         Role.lead(new Path([3, 1])),
                         Role.lead(new Path([3, 2])) ]),
        ]);

    const gantt = new GanttPainter(new Layout());
    const chart = new Reader(gantt.draw(new Blueprint(project, team)));

    test("have tasks' identifier that do not overlap tasks' name", () => {
        const tester = new class extends Tester {

            protected verify(prefix: string, activity: Activity): void {
                const identifier = this.path.asIdentifier(prefix);
                const key = chart.findActivityIdentifier(identifier);
                const name = chart.findActivityLabel(identifier);

                expect(key.overlapWith(name)).toBe(false);
            }

        }();

        project.accept(tester);
    });

    test("have tasks' bar aligned with tasks' name", () => {
        const tester = new class extends Tester {

            protected verify(prefix: string, activity: Activity): void {
                const identifier = this.path.asIdentifier(prefix);

                const bar = chart.findActivityBar(identifier);
                const label = chart.findActivityLabel(identifier);

                expect(bar.center.isAlignedWith(label.center)).toBe(true);
                expect(bar.overlapWith(label)).toBe(false);
            }

        }();

        project.accept(tester);
    });

    const normalize = (d: number): number => {
        return d / project.duration;
    };

    test("have bar placed with respect to the time axis", () => {

        const tester = new class extends Tester {
            protected verify(prefix: string, activity: Activity): void {
                const identifier = this.path.asIdentifier(prefix);
                const [start, end] = chart.readStartAndEnd(identifier);

                expect(start).toBeCloseTo(normalize(activity.start - 1));
                expect(end).toBeCloseTo(normalize(activity.end));
            }
        }();

        project.accept(tester);
    });

    test("have deliverables placed with respect to the time axis", () => {
        const tester = new class extends Visitor {

            public onDeliverable(deliverable: Deliverable): void {
                const identifier = this.path.asIdentifier("D");

                const dueDate = chart.readDeliverableDueDate(identifier);
                expect(dueDate).toBeCloseTo(normalize(deliverable.dueDate - 0.5));
            }

        }();

        project.accept(tester);
    });

    test("have deliverables aligned with task that produces them", () => {

        const tester = new class extends Visitor {

            public onDeliverable(deliverable: Deliverable): void {
                const identifier = this.path.asIdentifier("D");

                const parentIdentifier = this.path.parent.asIdentifier("T");

                const marker = chart.findDeliverable(identifier);
                const label = chart.findActivityLabel(parentIdentifier);

                expect(label.center.isAlignedWith(marker.center)).toBe(true);
            }

        }();

        project.accept(tester);
    });


    test("have milestones aligned with their due date", () => {
        for (const [index, milestone] of project.milestones.entries()) {
            const identifier = "M" +  index;
            const actualDate = chart.readMilestoneDate(identifier);

            expect(actualDate).toBeCloseTo(normalize(milestone.date - 1));
        }
    });


    test("have task leaders aligned with tasks", () => {

        const tester = new class extends Visitor {

            public onTask(task: Task): void {
                this.onActivity(task, "T");
            }

            public onWorkPackage(workPackage: Package): void {
                this.onActivity(workPackage, "WP");
            }

            public onActivity(activity: Activity, prefix: string): void {
                const identifier = this.path.asIdentifier(prefix);
                const leader = chart.findLeader(identifier);
                const label = chart.findActivityLabel(identifier);
                expect(leader.center.isAlignedWith(label.center)).toBe(true);
            }

        }();

        project.accept(tester);
    });

});
