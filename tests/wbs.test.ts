/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project, Task, Package, Deliverable, Visitor } from "../src/wbs"



describe("A task should", () => {

    const start = 1
    const duration = 10;
    const deliverables = [
        new Deliverable("D1",
                        "Report",
                        3)
    ];

    const task = new Task(
        "Do something",
        start,
        duration,
        deliverables
    );


    test("expose its start", () => {
        expect(task.start()).toBe(start);
    });


    test("expose its duration", () => {
        expect(task.duration()).toBe(duration);
    });


    test("expose its end", () => {
        expect(task.end()).toBe(start + duration - 1);
    });


    test("expose its deliverables", () => {
        expect(task.deliverables).toHaveLength(deliverables.length);
    });


    test("ensure visitors access its deliverables", () => {
        const visitor = new class extends Visitor {
            public counter: number;

            constructor () {
                super();
                this.counter = 0;
            }

            onDeliverable(deliberable: Deliverable): void {
                this.counter += 1;
            }
        }();

        task.accept(visitor);

        expect(visitor.counter).toBe(1);
    });

});



describe("A package should", () => {


    const task1 = new Task("T1", 3, 10, [
        new Deliverable("D1",
                        "Report",
                        5)
    ]);
    const task2 = new Task("T2", 4, 5);
    const wp1 = new Package("WP1", [task1, task2]);


    test("start with its earliest tasks", () => {
        expect(wp1.start()).toBe(task1.start());
    });


    test("end with its latest tasks", () => {
        expect(wp1.end()).toBe(task1.end());
    });


    test("run as long as there are tasks running", () => {
        expect(wp1.duration()).toBe(task1.duration());
    });


    test("expose its deliverables", () => {
        expect(wp1.deliverables).toHaveLength(1);
    });

});



describe("A project should", () => {

    const name = "Dummy project";
    const task = new Task("T1", 0);
    const activities = [ task ];
    const project = new Project(name, activities);


    it("expose its name", () => {
         expect(project.name).toBe(name);
    });


    test("expose its work breakdown structure", () => {
        expect(project.breakdown).toBeDefined();
        expect(project.breakdown.length).toBe(1);
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
