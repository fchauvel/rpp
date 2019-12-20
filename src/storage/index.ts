/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project, Activity, Package, Task } from "../wbs";
import { Layout, GanttPainter } from "./adapters/painter";
import { SVGWriter } from "./adapters/svg"

import * as fs from "fs";



export class Storage {


    public loadProject(location: string): Project {
        let content = fs.readFileSync(location, "utf-8");
        let data = JSON.parse(content);
        const activities = this.parseActivities(data.project.breakdown);
        return new Project(data.project.name, activities);
    }


    private parseActivities(json: Array<any>): Array<Activity> {
        const activities: Array<Activity> = [];
        for (var item of json) {
            if ("breakdown" in item) {
                const breakdown = this.parseActivities(item.breakdown);
                activities.push(new Package(item.name, breakdown));
            } else {
                const task = new Task(
                    item.name,
                    item.start,
                    item.duration);
                activities.push(task);
            }
        }
        return activities;
    }


    public storeGanttChart(project: Project, location: string) {
        const gantt = new GanttPainter(new Layout());
        const svg = new SVGWriter();
        fs.writeFileSync(location, svg.write(gantt.draw(project)));
    }

}
