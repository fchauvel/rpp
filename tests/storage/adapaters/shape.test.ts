/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project, Package, Activity, Task, Visitor } from "../../../src/wbs";
import { Figure, Shape } from "../../../src/storage/adapters/shape";
import { Layout, Tags, GanttPainter } from "../../../src/storage/adapters/painter";


class Reader {

    private _chart: Figure;

    constructor(chart: Figure) {
        this._chart = chart;
    }


    readStartAndEnd(identifier: string): [number, number] {
        const timeAxis = this._chart.findShapesWithTags([Tags.TIME_AXIS])[0];
        const bar = this._chart.findShapesWithTags([identifier,
                                                    Tags.BAR])[0];

        const width = timeAxis.boundingBox.right - timeAxis.boundingBox.left
        const start = (bar.boundingBox.left - timeAxis.boundingBox.left) /
            width;
        const end = (bar.boundingBox.right - timeAxis.boundingBox.left) /
            width;
        return [start, end];
    }


    findActivityLabel(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.NAME])[0];
    }


    findActivityBar(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.BAR])[0];
    }


    findActivityIdentifier(identifier: string): Shape {
        return this._chart.findShapesWithTags(
            [identifier,
             Tags.IDENTIFIER])[0];
    }

}

abstract class Tester extends Visitor {

    protected abstract verify(prefix: string, activity: Activity): void;

    onTask (task: Task): void {
        this.verify("T", task);
    }

    onPackage(workPackage: Package): void {
        this.verify("WP", workPackage);
    }

}



describe("A Gantt chart should", () => {

    const project = new Project(
        "P1",
        [
            new Task("First Task", 1, 10),
            new Task("Second Task", 5, 7),
            new Package("Hard Stuff", [
                new Task("Fairly hard", 5, 5),
                new Task("Really hard", 7, 7)
            ])
        ]);

    const gantt = new GanttPainter(new Layout());
    const chart = new Reader(gantt.draw(project));


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


    // test("not have two tasks whose bars overlap", () => {
    //     project.forEachActivity((activity1, path1) => {
    //         project.forEachActivity((activity2, path2) => {
    //             if (activity1 != activity2) {
    //                 const bar1 = chart.findActivityBar(path1.asIdentifier("));
    //                 const bar2 = chart.findActivityBar(task2.identifier);
    //                 expect(bar1.overlapWith(bar2)).toBe(false);
    //             }
    //         }
    //     }
    // });


    test("have bar placed with respect to the time axis", () => {

        const normalize = (d: number): number => {
            return d / project.duration();
        }

        const tester = new class extends Tester {
            protected verify(prefix: string, activity: Activity): void {
                const identifier = this.path.asIdentifier(prefix);
                const [start, end] = chart.readStartAndEnd(identifier);

                console.log(start, end);
                expect(start).toBeCloseTo(normalize(activity.start()-1));
                expect(end).toBeCloseTo(normalize(activity.end()));
            }
        }();

        project.accept(tester);
    });

});
