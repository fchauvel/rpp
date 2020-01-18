/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../src/rpp";
import { JsonBlueprint, ObjectParser } from "../src/storage/adapters/object";

import * as fs from "fs";



export class SampleProject {


    private get raw(): JsonBlueprint {
        const data = fs.readFileSync("./tests/sample.data.json", "utf-8");
        return JSON.parse(data);
    }


    public get asIs(): Blueprint {
        return this.modify();
    }

    public get withoutAnyActivity(): Blueprint {
        return this.modify((sample) => {
            sample.project.breakdown.splice(0, 3);
            sample.project.milestones.splice(0, 2);
        });
    }


    public get withEmptyWP3(): Blueprint {
        return this.modify((sample) => {
            sample.project
                .breakdown[2]
                .breakdown.splice(0, 2);
        });
    }

    public get withoutActivity32(): Blueprint {
        return this.modify( (sample) => {
            sample.project
                .breakdown[2]
                .breakdown.splice(1, 1);
        });
    }


    get withAMilestoneAfterProjectEnd(): Blueprint {
        return this.modify( (sample) => {
            sample.project.milestones[1].date = 56;
        });
    }

    get withAMilestoneBeforeProjectStart(): Blueprint {
        return this.modify( (sample) => {
            sample.project.milestones[1].date = 0;
        });
    }

    get withActivity1WithoutDeliverable(): Blueprint {
        return this.modify( (sample) => {
            sample.project.breakdown[0].deliverables.splice(0, 1);
        });
    }

    get withD111DueAfterA1(): Blueprint {
        return this.modify( (sample) => {
            sample.project.breakdown[0].deliverables[0].due = 156;
        });
    }

    get withD21BeforeA2(): Blueprint {
        return this.modify( (sample) => {
            sample.project.breakdown[1].deliverables[0].due = 1;
        });
    }

    get withDiscontinuityInA3(): Blueprint {
        return this.modify( (sample) => {
            sample.project.breakdown[2].breakdown[1].start = 14;
        });
    }

    public get withoutContributorToTask1(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[0].leads.splice(0, 1);
            sample.team.members[1].contributes.splice(0, 1);
        });
    }

    public get withoutContributorToWP3(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[0].leads.splice(1, 2);
            sample.team.members[1].leads.splice(1, 1);
        });
    }

    public get withoutLeaderOfTask2(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[1].leads.splice(0, 1);
        });
    }

    public get withoutLeaderOfWP3(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[1].leads.splice(1, 1);
        });
    }

    public get withoutAnyone(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members.splice(0, 2);
        });
    }

    public get withExtraIdlePerson(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members.push({
                firstname: "Extra",
                lastname: "Person",
            });
        });
    }

    public get withTwoLeadersForA1(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[1].leads.push("A 1");
        });
    }


    public get withTwoLeadersForA3(): Blueprint {
        return this.modify( (sample) => {
            sample.team.members[0].leads.push("A 3");
        });
    }

    private static asBlueprint(sample: JsonBlueprint): Blueprint {
        const read = new ObjectParser();
        const project = read.asProject(sample.project);
        const team = read.asTeam(sample.team);
        return new Blueprint(project, team);
    }


    private modify(change?: (JsonBlueprint) => void): Blueprint {
        const sample = this.raw;
        if (change) {
            change(sample);
        }
        return SampleProject.asBlueprint(sample);
    }


}
