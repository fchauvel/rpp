/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Grammar } from "@fchauvel/quick-check";
import { anArrayOf,
         anObject,
         aProperty,
         aString,
         eitherOf } from "@fchauvel/quick-check";

import { Person, Role, Team } from "../../rpp/team";
import { Deliverable, Milestone, Package, Project, Task } from "../../rpp/wbs";
import { Path } from "../../rpp/wbs";


/*
 * Data schema for workplans
 */

export const workPlanSchema = new Grammar();
workPlanSchema.define("workplan-root")
    .as(anObject()
        .with(aProperty("project").ofType("project")));

workPlanSchema.define("project")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("origin")
              .optional()
              .ofType("string"))
        .with(aProperty("milestones")
              .ofType(anArrayOf("milestone"))
              .withDefault([]))
        .with(aProperty("breakdown")
              .ofType(anArrayOf(eitherOf("task", "work package")))));

workPlanSchema.define("milestone").
    as(anObject()
       .with(aProperty("name").ofType("string"))
       .with(aProperty("date").ofType("number")));

workPlanSchema.define("work package")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("breakdown")
              .ofType(anArrayOf(eitherOf("task", "work package")))));

workPlanSchema.define("task")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("duration").ofType("number"))
        .with(aProperty("start").ofType("number"))
        .with(aProperty("deliverables")
              .ofType(anArrayOf("deliverable"))
              .withDefault([])));

workPlanSchema.define("deliverable")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("kind").ofType("string"))
        .with(aProperty("due").ofType("number")));

// Production rules

workPlanSchema.on("project")
    .apply((data) => new Project(
        data.name,
        data.breakdown,
        new Date(data.origin),
        data.milestones,
    ));

workPlanSchema.on("milestone")
    .apply((data) =>  new Milestone(
        data.name,
        data.date,
    ));

workPlanSchema.on("work package")
    .apply((data) => new Package(
        data.name,
        data.breakdown,
    ));

workPlanSchema.on("task")
    .apply((data) => new Task(
        data.name,
        data.start,
        data.duration,
        data.deliverables));

workPlanSchema.on("deliverable")
    .apply((data) => new Deliverable(
        data.name,
        data.kind,
        data.due));


/*
 * Define the data schema expected in the team descriptions
 */
export const teamSchema = new Grammar();
teamSchema.define("teams-root")
    .as(anObject()
        .with(aProperty("team").ofType("team")));

teamSchema.define("team")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("members")
              .ofType(anArrayOf(eitherOf("person", "team")))));

teamSchema.define("person")
    .as(anObject()
        .with(aProperty("firstname").ofType("string"))
        .with(aProperty("lastname").ofType("string"))
        .with(aProperty("leads")
              .withDefault([])
              .ofType(anArrayOf("task-reference")))
        .with(aProperty("contributes")
              .withDefault([])
              .ofType(anArrayOf("task-reference"))));

teamSchema.define("task-reference")
    .as(aString()
        .thatMatches(/(T|WP|A)\s*(\d+)(\.(\d+))*/));



/* Production rules */

teamSchema.on("team")
    .apply( (data) => {
        return new Team(data.name, data.members);
    });

teamSchema.on("person")
    .apply( (data) => {
        const roles = data.contributes.map(
            (activity) => Role.contributeTo(activity),
        );
        data.leads.forEach(
            (activity) => roles.push(Role.lead(activity)),
        );
        return new Person(data.firstname,
                          data.lastname,
                          roles);
    });

teamSchema.on("task-reference")
    .apply( (data) => {
        return Path.fromText(data);
    });
