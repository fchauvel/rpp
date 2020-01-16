/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Blueprint } from "../../../src/rpp";
import { Guard } from "../../../src/rpp/verify/guard";
import { Codes } from "../../../src/rpp/verify/rules/commons";
import { ObjectParser, JsonBlueprint } from "../../../src/storage/adapters/object";

class SampleProject {


    private get raw(): JsonBlueprint {
        return {
            project: {
                name: "Sample Project",
                origin: "2020-01-16",
                milestones: [
                    {
                        name: "First Milestone",
                        date: 3
                    },
                    {
                        name: "Second Miletsone",
                        date: 6
                    }
                ],
                breakdown: [
                    {
                        name: "Activity 1",
                        start: 1,
                        duration: 5,
                        deliverables: [
                            {
                                name: "Report on Activity 1",
                                kind: "Report",
                                due: 4
                            }
                        ]
                    },
                    {
                        name: "Activity 2",
                        start: 3,
                        duration: 5,
                        deliverables: [
                            {
                                name: "Report on Activity 2",
                                kind: "Report",
                                due: 5
                            }
                        ]
                    },
                    {
                        name: "Activity 3",
                        breakdown: [
                            {
                                name: "Activity 3.1",
                                start: 3,
                                duration: 8,
                                deliverables: [
                                    {
                                        name: "Report on Activity 3.1",
                                        kind: "Report",
                                        due: 10
                                    }
                                ]
                            },
                            {
                                name: "Activity 3.2",
                                start: 6,
                                duration: 10,
                                deliverables: [
                                    {
                                        name: "Report on Activity 3.2",
                                        kind: "Report",
                                        due: 15
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            team: {
                name: "Sample Team",
                members: [
                    {
                        firstname: "John",
                        lastname: "Doe",
                        leads: [ "A 1",  "A 3.1", "A 3.2" ],
                        contributes: [ "A 2" ]
                    },
                    {
                        firstname: "Bob",
                        lastname: "Spong",
                        leads: [ "A 2", "A 3" ],
                        contributes: [ "A 1" ]
                    }
                ]
            }
        };
    }


    public get asIs(): Blueprint {
        return this.modify();
    }

    public get withoutAnyActivity(): Blueprint {
        return this.modify(sample => {
            sample.project.breakdown.splice(0, 3);
            sample.project.milestones.splice(0, 2);
        });
    }


    public get withEmptyWP3(): Blueprint {
        return this.modify(sample => {
            sample.project
                .breakdown[2]
                .breakdown.splice(0, 2);
        });
    }

    public get withoutActivity32(): Blueprint {
        return this.modify( sample => {
            sample.project
                .breakdown[2]
                .breakdown.splice(1, 1);
        });
    }


    get withAMilestoneAfterProjectEnd(): Blueprint {
        return this.modify( sample => {
            sample.project.milestones[1].date = 56;
        });
    }

    get withAMilestoneBeforeProjectStart(): Blueprint {
        return this.modify( sample => {
            sample.project.milestones[1].date = 0;
        });
    }

    get withActivity1WithoutDeliverable(): Blueprint {
        return this.modify( sample => {
            sample.project.breakdown[0].deliverables.splice(0, 1);
        });
    }

    get withD111DueAfterA1(): Blueprint {
        return this.modify( sample => {
            sample.project.breakdown[0].deliverables[0].due = 156;
        });
    }

    get withD21BeforeA2(): Blueprint {
        return this.modify( sample => {
            sample.project.breakdown[1].deliverables[0].due = 1;
        });
    }

    get withDiscontinuityInA3(): Blueprint {
        return this.modify( sample => {
            sample.project.breakdown[2].breakdown[1].start = 14;
        });
    }

    public get withoutContributorToTask1(): Blueprint {
        return this.modify( sample => {
            sample.team.members[0].leads.splice(0, 1);
            sample.team.members[1].contributes.splice(0, 1);
        });
    }

    public get withoutLeaderOfTask2(): Blueprint {
        return this.modify( sample => {
            sample.team.members[1].leads.splice(0, 1);
        });
    }


    private modify(change?: (JsonBlueprint) => void): Blueprint {
        const sample = this.raw;
        if (change) {
            change(sample);
        }
        return SampleProject.asBlueprint(sample);
    }

    private static asBlueprint(sample: JsonBlueprint): Blueprint {
        const read = new ObjectParser();
        const project = read.asProject(sample.project);
        const team = read.asTeam(sample.team);
        return new Blueprint(project, team);
    }


}


describe("The guard should", () => {

    const sampleProject = new SampleProject();
    const guard = new Guard();


    function check(blueprint: Blueprint, expectedErrors: number[]): void {
        const report = guard.scrutinize(blueprint);
        expect(report.issues).toHaveLength(expectedErrors.length);
        for(const eachCode of expectedErrors) {
            expect(report.issues.some(i => i.code === eachCode)).toBe(true);
        }
    }

    test("not report issues when there is none", () => {
        check(
            sampleProject.asIs,
            []
        );
    });

    test("report empty project", () => {
        check(
            sampleProject.withoutAnyActivity,
            [ Codes.EMPTY_PROJECT ]
        );
    });

    test("report empty work packages", () => {
        check(
            sampleProject.withEmptyWP3,
            [ Codes.EMPTY_WORK_PACKAGE ]
        );
    });

    test("warn about work packages that have only one activity", () => {
        check(
            sampleProject.withoutActivity32,
            [ Codes.SINGLE_TASK_WORK_PACKAGE ]
        );
    });

    test("report milestones after the project end", () => {
        check(
            sampleProject.withAMilestoneAfterProjectEnd,
            [ Codes.MILESTONE_AFTER_PROJECT_END ]
        );
    });

    test("report milestones before the project end", () => {
        check(
            sampleProject.withAMilestoneBeforeProjectStart,
            [ Codes.MILESTONE_BEFORE_PROJECT_START ]
        );
    });

    test("warn about tasks without deliverables", () => {
        check(
            sampleProject.withActivity1WithoutDeliverable,
            [ Codes.TASK_WITHOUT_DELIVERABLE ]
        );
    });

    test("report deliverables due after task ends", () => {
        check(
            sampleProject.withD111DueAfterA1,
            [ Codes.WRONG_DELIVERABLE_DATE ]
        );

    });

    test("report deliverables due before task starts", () => {
        check(
            sampleProject.withD21BeforeA2,
            [ Codes.WRONG_DELIVERABLE_DATE ]
        );
    });


    test("report discontinuous work packages", () => {
        check(
            sampleProject.withDiscontinuityInA3,
            [ Codes.DISCONTINUITY_IN_WORK_PACKAGE ]
        );
    });


    test("report tasks without contributors", () => {
        check(
            sampleProject.withoutContributorToTask1,
            [
                Codes.NO_LEADER,
                Codes.NO_CONTRIBUTOR
            ]
        );
    });


    test("report tasks without leaders", () => {
        check(
            sampleProject.withoutLeaderOfTask2,
            [
                Codes.NO_LEADER
            ]
        );
    });



});
