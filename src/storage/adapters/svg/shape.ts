/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { StyleSheet, Style } from "./style";


export class Point {

    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    isAlignedWith(other: Point): boolean {
        return this._x == other.x || this._y == other.y;
    }


    public move(xOffset: number, yOffset: number): Point {
        return this.moveRightBy(xOffset)
            .moveDownBy(yOffset);
    }

    public moveHorizontallyTo(position: number): Point {
        return new Point(position, this._y);
    }


    public moveLeftBy(offset: number): Point {
        return new Point(this._x - offset, this._y);
    }


    public moveRightBy(offset: number): Point {
        return new Point(this._x + offset, this._y);
    }


    public moveVerticallyTo(position: number): Point {
        return new Point(this._x, position);
    }


    public moveUpBy(offset: number): Point {
        return new Point(this._x, this._y - offset);
    }


    public moveDownBy(offset: number): Point {
        return new Point(this._x, this._y + offset);
    }

}


export class Box {

    private _topLeft: Point;
    private _width: number;
    private _height: number;

    constructor (topLeft: Point, width: number, height: number) {
        this._topLeft = topLeft;
        this._width = width;
        this._height = height;
    }


    public overlapWith(other: Box): boolean {
        return this.includes(other.topLeft)
            || this.includes(other.topRight)
            || this.includes(other.bottomLeft)
            || this.includes(other.bottomRight);
    }

    public includes(point: Point): boolean {
        return point.x >= this.left && point.x <= this.right
            && point.y >= this.top && point.y < this.bottom;
    }

    get height(): number {
        return this._height;
    }

    get width(): number {
        return this._width;
    }

    get topLeft(): Point {
        return this._topLeft;
    }

    get topRight(): Point {
        return new Point(this.right, this.top);
    }

    get bottomRight(): Point {
        return new Point(this.right, this.bottom);
    }

    get bottomLeft(): Point {
        return new Point(this.left, this.bottom);
    }

    get top(): number {
        return this._topLeft.y;
    }

    get bottom(): number {
        return this._topLeft.y + this._height;
    }

    get right(): number {
        return this._topLeft.x + this._width;
    }

    get left(): number {
        return this._topLeft.x;
    }

    get center(): Point {
        return new Point(this._topLeft.x + this._width / 2,
                         this._topLeft.y + this._height / 2);
    }

    public toString(): string {
        return `@(${this._topLeft.x}, ${this._topLeft.y}) ${this._width}x${this._height}`;
    }

}



export interface Visitor {

    visitRectangle(rectangle: Rectangle);

    visitText(rectangle: Rectangle);

    visitLine(line: Line);

    visitFigure(figure: Figure);
}



export abstract class Shape {

    private _tags: string[];
    private _style: Style;

    constructor(style: Style, tags: string[]=[]) {
        this._tags = tags;
        this._style = style;
    }


    abstract accept(visitor: Visitor);


    public get style(): Style {
        return this._style;
    }

    public get center(): Point {
        return new Point(0, 0);
    }


    hasTag(tag: string): boolean {
        return this._tags.includes(tag);
    }


    hasAllTags(tags: string[]): boolean {
        return tags.every((tag) => this.hasTag(tag));
    }


    addTag(tag: string): void {
        if (!this.hasTag(tag)) {
            this._tags.push(tag);
        }
    }


    public overlapWith(other: Shape): boolean {
        return this.boundingBox.overlapWith(other.boundingBox);
    }


    public abstract get boundingBox(): Box;


    public toString(): string {
        return this.boundingBox.toString();
    }

}



export class Line extends Shape {

    private _source: Point;
    private _target: Point;


    constructor(source: Point, target: Point, style: Style, tags: string[]) {
        super(style, tags);
        this._source = source;
        this._target = target;
    }


    public accept(visitor: Visitor): void {
        visitor.visitLine(this);
    }

    public get boundingBox(): Box {
        const topLeft = new Point(
            Math.min(this._source.x, this._target.x),
            Math.min(this._source.y, this._target.y)
        );
        const width = Math.max(this._source.x, this._target.x) - topLeft.x;
        const height = Math.max(this._source.y, this._target.y) - topLeft.y;
        return new Box(topLeft, width, height);
    }

}


export class Rectangle extends Shape {

    private _box: Box;

    constructor(box: Box, style: Style, tags: string[]) {
        super(style, tags);
        this._box = box;
    }


    public accept(visitor: Visitor): void {
        visitor.visitRectangle(this);
    }


    public get boundingBox(): Box {
        return this._box;
    }

}


export class Text extends Rectangle {

    private _text: string;

    constructor(text: string, box: Box, style: Style, tags: string[]) {
        super(box, style, tags);
        this._text = text;
    }

    public get text(): string {
        return this._text;
    }

    public accept(visitor: Visitor): void {
        visitor.visitText(this);
    }


}


export class Figure extends Shape {

    private _shapes: Shape[];

    constructor(shapes: Shape[]=[], style: Style=null, tags: string[]=[]) {
        super(style, tags);
        this._shapes = shapes;
    }

    public accept(visitor: Visitor): void {
        visitor.visitFigure(this);
    }

    public get boundingBox(): Box {
        if (this._shapes.length == 0) {
            throw Error("An empty figure has no bounding box!");
        }

        let minX = Number.MAX_VALUE;
        let maxX = 0;
        let minY = Number.MAX_VALUE;
        let maxY = 0;
        for (const anyShape of this._shapes) {
            const boundingBox = anyShape.boundingBox;
            minX = Math.min(minX, boundingBox.left);
            maxX = Math.max(maxX, boundingBox.right);
            minY = Math.min(minY, boundingBox.top);
            maxY = Math.max(maxY, boundingBox.bottom);
        }

        return new Box(new Point(minX, minY),
                       maxX - minX,
                       maxY - minY);
    }

    public get shapes(): Shape[] {
        return this._shapes;
    }

    public add(newShape: Shape): void {
        this._shapes.push(newShape);
    }


    findShapesWithTags(tags: string[]): Shape[] {
        const selectedShapes: Shape[] = [];
        for(const anyShape of this._shapes) {
            if (anyShape.hasAllTags(tags)) {
                selectedShapes.push(anyShape);
            }
        }
        return selectedShapes;
    }

}



export class Painter {

    private _figure: Figure;
    private _position: Point;
    private _styleSheet: StyleSheet;


    constructor() {
        this._figure = new Figure();
        this._position = new Point(0, 0);
        this._styleSheet = new StyleSheet();
    }


    get figure(): Figure {
        return this._figure;
    }


    protected get styleSheet(): StyleSheet {
        return this._styleSheet;
    }


    public moveTo(xOffset: number, yOffset: number): void {
        this._position = this._position.move(xOffset, yOffset);
    }


    public moveVerticallyTo(position: number): void {
        this._position = this._position.moveVerticallyTo(position);
    }


    public moveHorizontallyTo(position: number): void {
        this._position = this._position.moveHorizontallyTo(position);
    }


    public moveLeftBy(offset: number): void {
        this._position = this._position.moveLeftBy(offset);
    }


    public moveRightBy(offset: number): void {
        this._position = this._position.moveRightBy(offset);
    }


    public moveDownBy(offset: number): void {
        this._position = this._position.moveDownBy(offset);
    }


    public moveUpBy(offset: number): void {
        this._position = this._position.moveUpBy(offset);
    }


    public writeText(text: string,
                     width: number,
                     height: number,
                     style: Style,
                     tags: string[]=[]): void {
        this._figure.add(
            new Text(
                text,
                new Box(this._position, width, height),
                style,
                tags
            )
        );
    }

    public drawRectangle(width: number,
                         height: number,
                         style: Style,
                         tags: string[]=[]): void {
        this._figure.add(
            new Rectangle(
                new Box(this._position, width, height),
                style,
                tags
            )
        );
    }

    public drawLine(x: number,
                    y: number,
                    style: Style,
                    tags: string[]=[]): void {
        this._figure.add(
            new Line(this._position,
                     this._position.move(x, y),
                     style,
                     tags)
        );
    }

}
