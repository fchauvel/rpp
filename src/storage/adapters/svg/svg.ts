/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import * as d3 from "d3";
import { JSDOM } from  "jsdom";

import { Figure, Line, Rectangle, Text } from "./shape";
import { StyleSheet } from "./style";

function xPosition(text: Text): number {
    switch (text.style.font.textAnchor) {
        case "start":
            return 0;
        case "end":
            return text.boundingBox.width;
        case "middle":
            return text.boundingBox.width / 2;
        default:
            return 0;
    }
}

function yPosition(text: Text): number {
    switch (text.style.font.dominantBaseline) {
        case "middle":
            return text.boundingBox.height / 2;
        default:
            return 0;
    }
}

export class SVGWriter {

    private _dom: JSDOM;
    private _body: any;
    private _container: any;

    public write(figure: Figure): string {
        this.initialize(figure.boundingBox.width,
                        figure.boundingBox.height);
        figure.accept(this);
        return this._body.select(".container").html();
    }

    public visitFigure(figure: Figure): void {
        for (const eachShape of figure.shapes) {
            eachShape.accept(this);
        }
    }

    public visitRectangle(rectangle: Rectangle): void {
        this._container.append("rect")
            .attr("x", rectangle.boundingBox.topLeft.x)
            .attr("y", rectangle.boundingBox.topLeft.y)
            .attr("width", rectangle.boundingBox.width)
            .attr("height", rectangle.boundingBox.height)
            .attr("stroke-width", rectangle.style.stroke.width)
            .attr("stroke", rectangle.style.stroke.color)
            .attr("fill", rectangle.style.fill.color)
            .attr("stroke-dasharray", rectangle.style.stroke.dashArray)
        ;
    }

    public visitLine(line: Line): void {
        this._container.append("line")
            .attr("x1", line.boundingBox.topLeft.x)
            .attr("y1", line.boundingBox.topLeft.y)
            .attr("x2", line.boundingBox.bottomRight.x)
            .attr("y2", line.boundingBox.bottomRight.y)
            .attr("stroke-width", line.style.stroke.width)
            .attr("stroke", line.style.stroke.color)
            .attr("stroke-dasharray", line.style.stroke.dashArray);
    }

    public visitText(text: Text): void {
        const frame = this._container.append("svg")
            .attr("x", text.boundingBox.topLeft.x)
            .attr("y", text.boundingBox.topLeft.y)
            .attr("width", text.boundingBox.width)
            .attr("height", text.boundingBox.height);
        frame.append("text")
            .attr("x", xPosition(text))
            .attr("y", yPosition(text))
            .attr("font-family", text.style.font.family)
            .attr("font-size", text.style.font.size)
            .attr("font-weight", text.style.font.weight)
            .attr("text-anchor", text.style.font.textAnchor)
            .attr("dominant-baseline", text.style.font.dominantBaseline)
            .attr("fill", text.style.fill.color)
            .text(text.text);
    }

    private initialize(width: number, height: number): void {
        this._dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
        this._body = d3.select(this._dom.window.document).select("body");
        this._container = this._body.append("div")
            .attr("class", "container")
            .append("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width)
            .attr("height", height);
    }

}
