/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Figure, Painter } from "../../../../src/storage/adapters/svg/shape";
import { SVGWriter } from "../../../../src/storage/adapters/svg/svg";
import { StyleSheet } from "../../../../src/storage/adapters/svg/style";



describe("SVG converter should", () => {

    const style = new StyleSheet().activity(2).bar;
    const writer = new SVGWriter();

    test("draw a rectangle", () => {
        const painter = new Painter();
        painter.moveTo(15, 20);
        painter.drawRectangle(50, 25, style);

        const svgCode = writer.write(painter.figure);

        expect(svgCode).toBe(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"50\" height=\"25\">" +
                "<rect x=\"15\" y=\"20\" width=\"50\" height=\"25\" " +
                "stroke-width=\"0\" " +
                "stroke=\"black\" " +
                "fill=\"steelblue\" " +
                "stroke-dasharray=\"\"></rect></svg>"
        );
    });


    test("draw a line", () => {
        const painter = new Painter();
        painter.moveTo(15, 20);
        painter.drawLine(50, 25, style);

        const svgCode = writer.write(painter.figure);

        expect(svgCode).toBe(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"50\" height=\"25\">" +
                "<line x1=\"15\" y1=\"20\" x2=\"65\" y2=\"45\" " +
                "stroke-width=\"0\" " +
                "stroke=\"black\" " +
                "stroke-dasharray=\"\"></line></svg>"
        );
    });


    test("write a text", () => {
        const painter = new Painter();
        painter.moveTo(15, 20);
        painter.writeText("Bonjour", 50, 25, style);

        const svgCode = writer.write(painter.figure);

        expect(svgCode).toBe(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"50\" height=\"25\">" +
                "<svg x=\"15\" y=\"20\" width=\"50\" height=\"25\">" +
                "<text x=\"25\" y=\"12.5\" " +
                "font-family=\"sans-serif\" " +
                "font-size=\"12pt\" " +
                "font-weight=\"normal\" "+
                "text-anchor=\"middle\" " +
                "dominant-baseline=\"middle\" " +
                "fill=\"steelblue\">Bonjour</text></svg></svg>"
         );
    });

});
