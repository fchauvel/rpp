/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Duration, Durations, Period } from "../../../time";
import { Activity, Deliverable, Package, Path, Project, Task, Visitor } from "../../../wbs";
import { Figure, Painter, Point } from "./shape";
import { Style } from "./style";

export class Tags {
    public static readonly BAR = "bar";
    public static readonly NAME = "name";
    public static readonly IDENTIFIER = "identifier";
    public static readonly TIME_AXIS = "time_axis";
    public static readonly DELIVERABLE = "deliverable";
}

class PainterVisitor extends Visitor {

    private _painter: GanttPainter;

    constructor(painter: GanttPainter) {
        super();
        this._painter = painter;
    }

    public onTask(task: Task): void {
        this._painter.drawActivity(task, this.path);
    }

    public onPackage(wp: Package): void {
        this._painter.drawActivity(wp, this.path, true);
    }

    public onDeliverable(d: Deliverable): void {
        this._painter.drawDeliverable(d, this.path);
    }

}

type PeriodFormatter = (index, Period) => string;

export class GanttPainter extends Painter {

    private durations = [
        {
            unit: Durations.CALENDAR_YEAR,
            name: (i, p): string => String(p.start.getFullYear()),
            isShownUpper: true,
            isShownLower: false,
            isGrid: true,
        },
        {
            unit: Durations.QUARTER,
            name: (i, p): string => "Q" + i,
            isShownUpper: true,
            isShownLower: false,
            isGrid: true,
        },
        {
            unit: Durations.MONTH,
            name: (i, p): string => String(i),
            isShownUpper: true,
            isShownLower: true,
            isGrid: false,
        },
    ];

    private _layout: Layout;
    private _project: Project;

    constructor(layout: Layout) {
        super();
        this._layout = layout;
        this._project = null;
    }

    public draw(project: Project): Figure {
        this.moveTo(this._layout.LEFT_MARGIN,
                    this._layout.TOP_MARGIN);

        this._project = project;

        this.drawUpperTimeLine();
        this.drawActivities();
        this.drawLowerTimeLine();
        this.drawGrid();
        return this.figure;
    }

    public drawActivity(activity: Activity,
                        path: Path,
                        isPackage= false): void {
        this.moveDownBy(this._layout.spaceBeforeActivity(path));
        this.drawActivityIdentifier(path, isPackage);
        this.drawActivityName(activity, path, isPackage);
        this.drawActivityDuration(activity, path, isPackage);
        this.moveDownBy(this._layout.TASK_HEIGHT);
    }

    public drawDeliverable(deliverable: Deliverable, path: Path): void {
        const text = deliverable.kind.charAt(0).toUpperCase();
        const ratio = (deliverable.dueDate - 0.5) / this._project.duration;
        const xPosition = this._layout.placeDeliverable(ratio);
        this.moveHorizontallyTo(xPosition);
        this.moveUpBy(this._layout.TASK_HEIGHT);
        this.writeText(text,
                       this._layout.DELIVERABLE_WIDTH,
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.deliverable,
                       [
                           path.asIdentifier("D"),
                           Tags.DELIVERABLE,
                       ]);
        this.moveDownBy(this._layout.TASK_HEIGHT);
    }

    private drawUpperTimeLine(): void {
        for (const [index, duration] of this.durations.entries()) {
            if (duration.isShownUpper) {
                this.drawPeriod(duration.unit,
                                this.styleSheet.timeLabels.level(index + 1),
                                duration.name);
            }
        }
        this.drawTimeAxis();
    }

    private drawLowerTimeLine(): void {
        this.drawTimeAxis();
        for (const [index, duration] of this.durations.entries()) {
            if (duration.isShownLower) {
                this.drawPeriod(duration.unit,
                                this.styleSheet.timeLabels.level(index + 1),
                                duration.name);
            }
        }
    }

    private drawActivities(): void {
        this._project.accept(new PainterVisitor(this));
        this.moveDownBy(this._layout.SPACE_BEFORE_ACTIVITY);
    }

    private moveToTimeAxisStart() {
        this.moveHorizontallyTo(this._layout.timeAxisStart.x);
    }

    private drawPeriod(period: Duration, style, format: PeriodFormatter): void {
        this.moveToTimeAxisStart();
        for (const [index, eachPeriod]
             of this._project.period.splitBy(period).entries()) {
            const start = this._project.period.normalize(eachPeriod.start);
            const end = this._project.period.normalize(eachPeriod.end);
            const width = (end - start) * this._layout.TIME_AXIS_LENGTH;
            this.writeText(format(index + 1, eachPeriod),
                           width,
                           this._layout.TASK_HEIGHT,
                           style,
                           [ "M" + (index + 1) ]);
            this.moveRightBy(width);
        }
        this.moveDownBy(this._layout.TASK_HEIGHT);
    }

    private drawTimeAxis(): void {
        this.moveToTimeAxisStart();
        this.drawLine(this._layout.TIME_AXIS_LENGTH,
                      0,
                      this.styleSheet.timeAxis,
                      [Tags.TIME_AXIS]);
    }

    private drawGrid(): void {
        for (const [index, duration] of this.durations.entries()) {
            if (duration.isGrid) {
                this.drawTimeGrid(duration.unit,
                                  this.styleSheet.grids.level(index + 1),
                                  2 - index);
            }
        }
    }

    private drawTimeGrid(period: Duration, style: Style, overflow= 0): void {
        this.moveToTimeAxisStart();
        const top = this._layout.timeAxisStart.y;
        const height = -1 *
            (this.position.y - (top - overflow * this._layout.TASK_HEIGHT));

        for (const eachPeriod of this._project.period.splitBy(period)) {
            this.drawLine(0, height, style, []);
            const end = this._project.period.normalize(eachPeriod.end);
            this.moveHorizontallyTo(this._layout.scaleDate(end));
        }
        this.drawLine(0, height, style, []);

    }

    private drawActivityIdentifier(path: Path, isPackage: boolean): void {
        const identifier = this._layout.identifier(path, isPackage);
        this.moveHorizontallyTo(this._layout.activityIdentifierStart(path));
        this.writeText(identifier,
                       this._layout.TASK_IDENTIFIER_WIDTH,
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.activity(path.depth).identifier,
                       [
                           identifier,
                           Tags.IDENTIFIER,
                       ]);
    }

    private drawActivityName(activity: Activity, path: Path, isPackage): void {
        this.moveHorizontallyTo(this._layout.taskNameStart(path));
        this.writeText(activity.name,
                       this._layout.taskNameWidth(path),
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.activity(path.depth).label,
                       [
                           this._layout.identifier(path, isPackage),
                           Tags.NAME,
                       ]);
    }

    private drawActivityDuration(activity: Activity,
                                 path: Path,
                                 isPackage: boolean): void {
        this.moveToTimeAxisStart();
        const start = (activity.start - 1) / this._project.duration;
        const end = activity.end / this._project.duration;
        this.moveHorizontallyTo(this._layout.scaleDate(start));
        this.drawRectangle(this._layout.scaleDuration(end - start),
                           this._layout.TASK_HEIGHT,
                           this.styleSheet.activity(path.depth).bar,
                           [
                               this._layout.identifier(path, isPackage),
                               Tags.BAR,
                           ]);
    }

}

export class Layout {

    public get timeAxisStart(): Point {
        const x = this.LEFT_MARGIN
            + this.TASK_LABEL_WIDTH
            + this.SEPARATOR;
        const y = this.TOP_MARGIN + 2 * this.TASK_HEIGHT;
        return new Point(x, y);
    }

    public readonly TOP_MARGIN = 5;
    public readonly LEFT_MARGIN = 5;
    public readonly TASK_IDENTIFIER_WIDTH = 50;
    public readonly TASK_LABEL_WIDTH = 300;
    public readonly TASK_HEIGHT = 20;
    public readonly TIME_AXIS_LENGTH = 900;

    public readonly DELIVERABLE_WIDTH = 50;

    public readonly SPACE_BEFORE_ACTIVITY = 20;
    public readonly SEPARATOR = 5;
    public readonly INDENTATION = 10;

    public spaceBeforeActivity(path: Path): number {
        return this.SPACE_BEFORE_ACTIVITY / path.depth;
    }

    public activityIdentifierStart(path: Path): number {
        return this.LEFT_MARGIN + this.indentation(path);
    }

    public taskNameStart(path): number {
        return this.activityIdentifierStart(path)
            + this.TASK_IDENTIFIER_WIDTH
            + this.SEPARATOR;
    }

    public taskNameWidth(path: Path): number {
        return this.TASK_LABEL_WIDTH
            - this.indentation(path)
            - this.SEPARATOR
            - this.TASK_IDENTIFIER_WIDTH;
    }

    public identifier(path: Path, isPackage: boolean): string {
        if (isPackage) {
            return path.asIdentifier("WP");
        }
        return path.asIdentifier("T");
    }

    public placeDeliverable(relativeDate: number): number {
        return this.LEFT_MARGIN
            + this.TASK_LABEL_WIDTH
            + this.SEPARATOR
            + (relativeDate * this.TIME_AXIS_LENGTH)
            - (this.DELIVERABLE_WIDTH / 2);
    }

    public scaleDate(date: number): number {
        return this.timeAxisStart.x + this.scaleDuration(date);
    }

    public scaleDuration(duration: number): number {
        return this.TIME_AXIS_LENGTH * duration;
    }

    private indentation(path: Path): number {
        return this.INDENTATION * (path.depth - 1);
    }

}
