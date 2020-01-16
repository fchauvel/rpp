/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Deliverable, Milestone, Package, Path, Project, Task, Visitor } from "../../src/rpp/wbs";



describe("The root path should", () => {

    const path = new Path();

    test("reject access to its parent", () => {
        expect(() => path.parent ).toThrow();
    });


    test("reject exit", () => {
        expect(() => { path.exit(); }).toThrow();
    });

});



describe("Paths should", () => {

    test("be build from a text using spaces", () => {
        const path = Path.fromText("WP 1.3");
        expect(path.asIdentifier()).toBe(new Path([1, 3]).asIdentifier());
    });

    test("be build from a text using spaces", () => {
        const path = Path.fromText("WP1.3.5.6.7");
        expect(path.asIdentifier()).toBe(new Path([1, 3, 5, 6, 7]).asIdentifier());
    });


    test("be build from a text using alternative separator", () => {
        const path = Path.fromText("WP1/3/5/6");
        expect(path.asIdentifier()).toBe(new Path([1, 3, 5, 6]).asIdentifier());
    });

});


describe("A path should", () => {
    const path = new Path([5, 1]);

    test("knows whether it includes another path", () => {
        expect(path.includes(new Path([5]))).toBe(false);
        expect(path.includes(new Path([5, 1]))).toBe(true);
        expect(path.includes(new Path([5, 1, 2]))).toBe(true);
        expect(path.includes(new Path([6, 1]))).toBe(false);
    });


    test("equal itself", () => {
        expect(path.equals(path)).toBe(true);
    });


    test("equal an equivalent path", () => {
        expect(path.equals(new Path([5, 1]))).toBe(true);
    });


    test("differ from a different path", () => {
        expect(path.equals(new Path([5]))).toBe(false);
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

    test("detect following contiguous tasks", () => {
        const nextTask = new Task("Next", 11, 5);
        expect(task.isContiguousWith(nextTask)).toBe(true);
    });

    test("detect previous contiguous tasks", () => {
        const nextTask = new Task("Next", 11, 5);
        expect(nextTask.isContiguousWith(task)).toBe(true);
    });

    test("detect tasks that are not contiguous", () => {
        const disconnectedTask = new Task("Next", 18, 5);
        expect(task.isContiguousWith(disconnectedTask)).toBe(false);
    });

    test("detect later tasks that overlaps", () => {
        const overlapping = new Task("Step 2", 8, 10);
        expect(task.overlapWith(overlapping)).toBe(true);
    });

    test("detect tasks that do not overlap", () => {
        const overlapping = new Task("Step 2", 15, 10);
        expect(task.overlapWith(overlapping)).toBe(false);
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

            public onTask(task2: Task): void {
                this.taskCount += 1;
            }

            public onMilestone(milestone2: Milestone): void {
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
