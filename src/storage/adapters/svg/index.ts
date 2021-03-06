/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Blueprint } from "../../../rpp";
import { Format } from "../../adapters";
import { GanttPainter, Layout } from "./painter";
import { SVGWriter } from "./svg";


export class SVGFormat extends Format {

    constructor() {
        super("SVG", [".svg"]);
    }

    public writeGantt(blueprint: Blueprint): string {
        const gantt = new GanttPainter(new Layout());
        return new SVGWriter().write(gantt.draw(blueprint));
    }

}
