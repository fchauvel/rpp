/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

class Font {
    public family: string;
    public style: string;
    public size: string;
    public weight: string;
    public textAnchor: string;
    public dominantBaseline: string;

    constructor(family= "sans-serif",
                size= "12pt",
                weight= "normal",
                textAnchor= "middle",
                dominantBaseline= "middle") {
        this.family = family;
        this.size = size;
        this.weight = weight;
        this.textAnchor = textAnchor;
        this.dominantBaseline = dominantBaseline;
        this.style = "normal";
    }

}

class Stroke {

    public width: number;
    public color: string;
    public dashArray: string;

    constructor(strokeWidth= 1, stroke= "black") {
        this.width = strokeWidth;
        this.color = stroke;
        this.dashArray = "";
    }

}

class Fill {

    public color: string;

    constructor() {
        this.color = "black";
    }

}

export class Style {

    public stroke: Stroke;
    public fill: Fill;
    public font: Font;

    constructor() {
        this.font = new Font();
        this.stroke = new Stroke();
        this.fill = new Fill();
    }

}

class Activity {

    public identifier: Style;
    public label: Style;
    public bar: Style;

    constructor() {
        this.identifier = new Style();
        this.label = new Style();
        this.bar = new Style();
    }

}

type Factory<T> = () => T;

class Hierarchy<T> {

    private _levels: T[];

    constructor(levelCount: number, factory: Factory<T>) {
        this._levels = [];
        for (let index = 0 ; index < levelCount ; index++) {
            this._levels.push(factory());
        }
    }

    public level(depth: number): T {
        const length = this._levels.length;
        if (depth >= length) {
            return this._levels[length - 1];
        }
        return this._levels[depth - 1];
    }
}

export class StyleSheet {

    public timeAxis: Style;
    public timeLabels: Hierarchy<Style>;

    public milestone: Style;

    public grids: Hierarchy<Style>;

    public deliverable: Style;

    private _tasks: Hierarchy<Activity>;

    public constructor() {
        this.initializeTasks();
        this.initializeDeliverables();

        this.timeAxis = new Style();
        this.timeAxis.stroke.width = 3;

        this.timeLabels = new Hierarchy<Style>(3, () => new Style());
        this.timeLabels.level(1).font.weight = "bold";
        this.timeLabels.level(2).font.size = "10pt";
        this.timeLabels.level(3).font.size = "9pt";

        this.milestone = new Style();
        this.milestone.stroke.color = "green";
        this.milestone.stroke.width = 4;
        this.milestone.fill.color = "green";
        this.milestone.font.style = "oblique";
        this.milestone.font.textAnchor = "end";

        this.grids = new Hierarchy<Style>(3, () => new Style());
        this.grids.level(1).stroke.width = 1;
        this.grids.level(2).stroke.dashArray = "4";

    }

    public activity(depth: number, isPackage = false): Activity {
        if (isPackage) {
            return this._tasks.level(depth);
        }
        return this._tasks.level(depth);
    }

    private initializeTasks(): void {
        this._tasks = new Hierarchy<Activity>(2, () => new Activity());

        this._tasks.level(1).identifier.fill.color = "darkblue";
        this._tasks.level(1).identifier.font.textAnchor = "start";
        this._tasks.level(1).identifier.font.weight = "bold";
        this._tasks.level(1).label.fill.color = "darkblue";
        this._tasks.level(1).label.font.textAnchor = "start";
        this._tasks.level(1).label.font.weight = "bold";
        this._tasks.level(1).bar.fill.color = "darkblue";
        this._tasks.level(1).bar.stroke.width = 0;

        this._tasks.level(2).identifier.fill.color = "steelblue";
        this._tasks.level(2).identifier.font.textAnchor = "start";
        this._tasks.level(2).identifier.font.weight = "normal";
        this._tasks.level(2).label.fill.color = "steelblue";
        this._tasks.level(2).label.font.textAnchor = "start";
        this._tasks.level(2).label.font.weight = "normal";
        this._tasks.level(2).bar.fill.color = "steelblue";
        this._tasks.level(2).bar.stroke.width = 0;
    }

    private initializeDeliverables(): void {
        this.deliverable = new Style();
        this.deliverable.font.textAnchor = "middle";
        this.deliverable.font.weight = "bold";
        this.deliverable.font.size = "10pt";
        this.deliverable.fill.color = "white";
    }

}
