/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Deliverable, Package, Project, Task, Visitor, Milestone, Path } from "../src/wbs";



describe("The root path should", () => {

    const path = new Path();

    test("reject access to its parent", () => {
        expect(() => { path.parent }).toThrow();
    });


    test("reject exit", () => {
        expect(() => { path.exit() }).toThrow();
    });

});


describe("A task should", () => {

    const start = 1;
    const duration = 10;
    const deliverables = [
        new Deliverable("D1",
                        "Report",
                        3),
    ];

    const task = new Task(
        "Do something",
        start,
        duration,
        deliverables,
    );

    test("expose its start", () => {
        expect(task.start).toBe(start);
    });

    test("expose its duration", () => {
        expect(task.duration).toBe(duration);
    });

    test("expose its end", () => {
        expect(task.end).toBe(start + duration - 1);
    });

    test("expose its deliverables", () => {
        expect(task.deliverables).toHaveLength(deliverables.length);
    });

});



describe("A package should", () => {

    const task1 = new Task("T1", 3, 10, [
        new Deliverable("D1",
                        "Report",
                        5),
    ]);
    const task2 = new Task("T2", 4, 5);
    const wp1 = new Package("WP1", [task1, task2]);

    test("start with its earliest tasks", () => {
        expect(wp1.start).toBe(task1.start);
    });

    test("end with its latest tasks", () => {
        expect(wp1.end).toBe(task1.end);
    });

    test("run as long as there are tasks running", () => {
        expect(wp1.duration).toBe(task1.duration);
    });

    test("expose its deliverables", () => {
        expect(wp1.deliverables).toHaveLength(1);
    });

});



describe("A project should", () => {

    const name = "Dummy project";
    const origin = new Date("2020-07-01");
    const task = new Task("T1", 0);
    const activities = [ task ];
    const milestone = new Milestone("MS1", 12);
    const project = new Project(name, activities, origin, [milestone]);

    test("expose its name", () => {
         expect(project.name).toBe(name);
    });

    test("expose its origin", () => {
        expect(project.origin.getDate()).toBe(1);
        expect(project.origin.getMonth()).toBe(6);
        expect(project.origin.getFullYear()).toBe(2020);
    });

    test("expose its work breakdown structure", () => {
        expect(project.breakdown).toBeDefined();
        expect(project.breakdown.length).toBe(1);
    });

    test("expose its milestones", () => {
        expect(project.milestones).toHaveLength(1);
        expect(project.milestones[0]).toBe(milestone);
    });


    test("ensure visitors access its structure", () => {
        const visitor = new class extends Visitor {
            public deliverableCount: number;
            public packageCount: number;
            public taskCount: number;
            public milestoneCount: number;

            constructor() {
                super();
                this.deliverableCount = 0;
                this.packageCount = 0;
                this.taskCount = 0;
                this.milestoneCount = 0;
            }

            public onDeliverable(deliberable: Deliverable): void {
                this.deliverableCount += 1;
            }

            public onPackage(workPackage: Package): void {
                this.packageCount += 1;
            }

            public onTask(task: Task): void {
                this.taskCount += 1;
            }

            public onMilestone(milestone: Milestone): void {
                this.milestoneCount += 1;
            }

        }();

        project.accept(visitor);

        expect(visitor.deliverableCount).toBe(0);
        expect(visitor.milestoneCount).toBe(1);
        expect(visitor.taskCount).toBe(1);
        expect(visitor.packageCount).toBe(0);
    });

});



describe("A deliverable should", () => {

    const name = "My deliverable";
    const kind = "Report";
    const date = 3;
    const deliverable = new Deliverable(name, kind, date);

    test("expose its name", () => {
        expect(deliverable.name).toBe(name);
    });

    test("expose its due date", () => {
        expect(deliverable.dueDate).toBe(date);
    });

    test("expose its kind", () => {
        expect(deliverable.kind).toBe(kind);
    });

});


describe("A milestone should", () => {

    const name = "My Milestone";
    const date = 12;
    const milestone = new Milestone(name, date);


    test("expose its name", () => {
        expect(milestone.name).toBe(name);
    });


    test("expose its date", () => {
        expect(milestone.date).toBe(date);
    });


});
