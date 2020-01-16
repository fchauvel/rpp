/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Partner, Person, Role,  Team } from "../../rpp/team";
import { Activity, Deliverable, Milestone, Package, Path, Project, Task } from "../../rpp/wbs";


export interface JsonBlueprint {
    project: JsonProject;
    team: JsonTeam;
}

interface JsonProject {
    name: string;
    origin: string;
    breakdown: JsonActivity[];
    milestones: JsonMilestone[];
}


type JsonActivity = JsonWorkPackage | JsonTask;


interface JsonWorkPackage {
    name: string;
    breakdown: JsonActivity[];
}


interface JsonTask {
    name: string;
    start: number;
    duration: number;
    deliverables: JsonDeliverable[];
}


interface JsonDeliverable {
    name: string;
    kind: string;
    due: number;
}


interface JsonMilestone {
    name: string;
    date: number;
}

type JsonPartner = JsonTeam | JsonPerson;

interface JsonTeam {
    name: string;
    members: JsonPartner[];
}


interface JsonPerson {
    firstname: string;
    lastname: string;
    contributes: string[];
    leads: string[];
}


export class ObjectParser {


    public asTeam(jsonTeam: JsonTeam): Team {
        const members = this.parsePartners(jsonTeam.members);
        return new Team(jsonTeam.name, members);
    }

    public asProject(jsonProject: JsonProject): Project {
        const activities = this.parseActivities(jsonProject.breakdown);
        const milestones = this.parseMilestones(jsonProject.milestones);
        return new Project(jsonProject.name,
                           activities,
                           new Date(jsonProject.origin),
                           milestones);
    }

    private parseActivities(jsonActivities: JsonActivity[]): Activity[] {
        const activities: Activity[] = [];
        for (const item of jsonActivities) {
            if ("breakdown" in item) {
                const jsonPackage = item as JsonWorkPackage;
                const breakdown = this.parseActivities(jsonPackage.breakdown);
                activities.push(new Package(jsonPackage.name, breakdown));
            } else {
                const jsonTask = item as JsonTask;
                const deliverables = this.parseDeliverable(jsonTask.deliverables);
                const task = new Task(
                    jsonTask.name,
                    jsonTask.start,
                    jsonTask.duration,
                    deliverables);
                activities.push(task);
            }
        }
        return activities;
    }

    private parseDeliverable(json: JsonDeliverable[]): Deliverable[] {
        const deliverables: Deliverable[] = [];
        if (!(Symbol.iterator in Object(json))) {
            return deliverables;
        }
        for (const item of json) {
            const deliverable = new Deliverable(item.name,
                                                item.kind,
                                                item.due);
            deliverables.push(deliverable);
        }
        return deliverables;
    }

    private parseMilestones(json: JsonMilestone[]= []): Milestone[] {
        const milestones: Milestone[] = [];
        for (const item of json) {
            const milestone = new Milestone(
                item.name,
                item.date,
            );
            milestones.push(milestone);
        }
        return milestones;
    }

    private parsePartners(jsonPartners: JsonPartner[]): Partner[] {
        const partners: Partner[] = [];
        for (const anyJsonPartner of jsonPartners) {
            if ("members" in anyJsonPartner) {
                partners.push(
                    this.asTeam(anyJsonPartner as JsonTeam),
                );
            } else {
                partners.push(
                    this.parseJsonPerson(anyJsonPartner as JsonPerson),
                );
            }
        }
        return partners;
    }

    private parseJsonPerson(jsonPerson: JsonPerson): Person {
        const roles: Role[] = [];
        this.parseRoles(jsonPerson.leads, Role.lead)
            .forEach((r) => roles.push(r));
        this.parseRoles(jsonPerson.contributes, Role.contributeTo)
            .forEach((r) => roles.push(r));
        return new Person(jsonPerson.firstname,
                          jsonPerson.lastname,
                          roles);
    }

    private parseRoles(activities: string[],
                       factory: (a: Path) => Role): Role[] {
        if (!activities) { return []; }
        return activities.map((activity) => {
            const path = Path.fromText(activity);
            return factory(path);
        });
    }

}
