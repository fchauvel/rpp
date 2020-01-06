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
    public family: string
    public size: string
    public weight: string
    public textAnchor: string
    public dominantBaseline: string

    constructor(family="sans-serif",
                size="12pt",
                weight="normal",
                textAnchor="middle",
                dominantBaseline="middle") {
        this.family = family;
        this.size = size;
        this.weight = weight;
        this.textAnchor = textAnchor;
        this.dominantBaseline = dominantBaseline;
    }

}


class Stroke {

    public width: number;
    public color: string;
    public dashArray: string

    constructor(strokeWidth=1, stroke="black") {
        this.width = strokeWidth;
        this.color = stroke;
        this.dashArray = "";
    }

}

class Fill {

    public color: string;

    constructor () {
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



export class StyleSheet {

    public taskHeader: Style;
    public timeScale: Style;

    private _tasks: Activity[];

    public quarterGrid: Style;
    public yearGrid: Style;
    public axis: Style;


    public constructor() {
        this._tasks = [];
        this._tasks.push(new Activity());
        this._tasks.push(new Activity());

        this._tasks[0].identifier.fill.color = "darkblue";
        this._tasks[0].identifier.font.textAnchor = "start";
        this._tasks[0].identifier.font.weight = "bold";
        this._tasks[0].label.fill.color = "darkblue";
        this._tasks[0].label.font.textAnchor = "start";
        this._tasks[0].label.font.weight = "bold";
        this._tasks[0].bar.fill.color = "darkblue";
        this._tasks[0].bar.stroke.width = 0;

        this._tasks[1].identifier.fill.color = "steelblue";
        this._tasks[1].identifier.font.textAnchor = "start";
        this._tasks[1].identifier.font.weight = "normal";
        this._tasks[1].label.fill.color = "steelblue";
        this._tasks[1].label.font.textAnchor = "start";
        this._tasks[1].label.font.weight = "normal";
        this._tasks[1].bar.fill.color = "steelblue";
        this._tasks[1].bar.stroke.width = 0;


        this.taskHeader = new Style();
        this.taskHeader.font.textAnchor = "start";
        this.taskHeader.font.weight = "bold";

        this.timeScale = new Style();

        this.quarterGrid = new Style();
        this.quarterGrid.stroke.dashArray = "4";

        this.yearGrid = new Style();

        this.axis = new Style();
        this.axis.stroke.width = 3;

    }


    public activity(depth: number, isPackage = false) {
        if (isPackage) {
            return StyleSheet.fetch(depth-1, this._tasks);
        }
        return StyleSheet.fetch(depth-1, this._tasks);
    }


    private static fetch<T>(depth: number, array: Array<T>): T {
        const length = array.length;
        if (depth >= length) {
            return array[length-1];
        }
        return array[depth];
    }


}
