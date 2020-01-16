/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Blueprint } from "../../../src/rpp"
import { Person, Role, Team } from "../../../src/rpp/team";
import { Guard } from "../../../src/rpp/verify/guard";
import { Report } from "../../../src/rpp/verify/report";
import { Deliverable, Milestone, Package, Project, Task, Path } from "../../../src/wbs";

describe("The guard should", () => {

    const projectName = "Fake Project";
    const fakeDeliverable = new Deliverable("Fake demo", "Software", 4);
    const fakeTask = new Task("Fake task", 3, 5, [ fakeDeliverable ]);

    const guard = new Guard();

    function verify(project: Project, team?: Team): Report {
        return guard.scrutinize(
            new Blueprint(project, team)
        );
    }

    test("not report issues when there is none", () => {
        const project = new Project(
            projectName,
            [ fakeTask,
              new Package(
                  "First",
                  [ new Task("Step 1", 1, 5,
                             [ new Deliverable("Product 1", "Report", 4) ]),
                    new Task("Step 2", 6, 5,
                             [ new Deliverable("Product 2", "Report", 10) ]),
                  ]),
            ]);

        const report = verify(project);

        expect (report.issues).toHaveLength(0);
    });


    test("report empty project", () => {
        const project = new Project(projectName, []);

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("report empty work packages", () => {
        const project = new Project(
            projectName,
            [
                fakeTask,
                new Package("Bonjour", []),
            ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("warn about single task work packages", () => {
        const project = new Project(
            projectName,
            [
                fakeTask,
                new Package(
                    "Hard work",
                    [
                        new Task("Do first",
                                 2,
                                 10,
                                 [ new Deliverable("stuff", "report", 7) ]),
                    ]),
            ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("report milestones after the project end", () => {
        const project = new Project(
            projectName,
            [ fakeTask ],
            null,
            [ new Milestone("MS1", 10) ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("report milestones before the project end", () => {
        const project = new Project(
            projectName,
            [ fakeTask ],
            null,
            [ new Milestone("MS1", 1) ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("warn about tasks without deliverables", () => {
        const project = new Project(
            "Fake",
            [ new Task("First task", 1, 5) ],
            null,
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);
    });


    test("report deliverables due after task ends", () => {
        const project = new Project(
            projectName,
            [
                fakeTask,
                new Task("Another task",
                         5,
                         7,
                         [
                             new Deliverable(
                                 "Second deliverable",
                                 "Report",
                                 20),
                         ]),
            ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);

    });


    test("report deliverables due before task starts", () => {
        const project = new Project(
            projectName,
            [
                fakeTask,
                new Task("Another task",
                         5,
                         7,
                         [
                             new Deliverable(
                                 "Second deliverable",
                                 "Report",
                                 2),
                         ]),
            ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);

    });


    test("report discontinuous work packages", () => {
        const project = new Project(
            projectName,
            [
                fakeTask,
                new Package("Discontinuous", [
                    new Task("Another task", 5, 2,
                             [ new Deliverable("Thing 1", "Report", 6) ]),
                    new Task("Yet another task", 10, 2,
                             [ new Deliverable("Thing 2", "Report", 11) ]),
                ]),
            ],
        );

        const report = verify(project);

        expect(report.issues).toHaveLength(1);

    });


    test("report tasks without contributors", () => {
        const project = new Project(
            projectName,
            [
                new Task("First task", 1, 5,
                         [ new Deliverable("Thing 1", "Report", 3) ]),
                new Task("Second tasks", 3, 5,
                         [ new Deliverable("Thing 2", "Report", 5) ]),

            ],
        );

        const team = new Team(
            "worker",
            [
                new Person(
                    "John", "Doe",
                    [
                        Role.contributeTo(Path.fromText("A1"))
                    ]
                )
            ]
        );

        const report = verify(project, team);

        expect(report.issues).toHaveLength(1);

    });




    test("report tasks without leaders", () => {
        const project = new Project(
            projectName,
            [
                new Task("First task", 1, 5,
                         [ new Deliverable("Thing 1", "Report", 3) ]),
                new Task("Second tasks", 3, 5,
                         [ new Deliverable("Thing 2", "Report", 5) ]),

            ],
        );

        const team = new Team(
            "worker",
            [
                new Person(
                    "John", "Doe",
                    [
                        Role.contributeTo(Path.fromText("T1")),
                        Role.lead(Path.fromText("T2"))
                    ]
                )
            ]
        );

        const report = verify(project, team);

        expect(report.issues).toHaveLength(1);

    });

});
