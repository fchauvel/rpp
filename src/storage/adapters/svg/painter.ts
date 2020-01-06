/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Figure, Painter } from "./shape";
import { Project, Task, Package, Path, Visitor, Activity } from "../../../wbs";
import { Period, Durations, Duration } from "../../../time";



export class Tags {
    public static readonly BAR = "bar";
    public static readonly NAME = "name";
    public static readonly IDENTIFIER = "identifier";
    public static readonly TIME_AXIS = "time_axis";
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

}


export class GanttPainter extends Painter {

    private _layout: Layout;
    private _project: Project;

    constructor (layout: Layout) {
        super();
        this._layout = layout;
        this._project = null;
    }


    public draw(project: Project): Figure {
        this.moveTo(this._layout.LEFT_MARGIN,
                    this._layout.TOP_MARGIN);

        this._project = project;
        this.drawTimeLine();
        project.accept(new PainterVisitor(this));
        this.moveDownBy(this._layout.SPACE_BEFORE_ACTIVITY);
        this.drawTimeAxis();
        this.drawPeriod(Durations.MONTH);
        return this.figure;
    }


    private drawTimeLine(): void {
        this.drawPeriod(Durations.YEAR, "Y");
        this.drawPeriod(Durations.QUARTER, "Q");
        this.drawPeriod(Durations.MONTH);
        this.drawTimeAxis();
    }


    private drawPeriod(period: Duration, prefix=""): void {
        this.moveHorizontallyTo(this._layout.LEFT_MARGIN);
        this.moveRightBy(this._layout.TASK_LABEL_WIDTH
                         + this._layout.SEPARATOR);
        const projectSpan = new Period(
            this._project.origin,
            Durations.MONTH.times(this._project.duration())
                .from(this._project.origin)
        );
        for (const [index, eachMonth] of projectSpan.splitBy(period).entries()) {
            const start = projectSpan.normalize(eachMonth.start);
            const end = projectSpan.normalize(eachMonth.end);
            const width = (end - start) * this._layout.TIME_AXIS_LENGTH;
            this.writeText(prefix + String(index+1),
                           width,
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.axis,
                       [
                           "M" + (index + 1)
                       ]);
            this.moveRightBy(width);
        }
        this.moveDownBy(this._layout.TASK_HEIGHT);
    }


    private drawTimeAxis(): void {
        this.moveHorizontallyTo(this._layout.LEFT_MARGIN);
        this.moveRightBy(this._layout.TASK_LABEL_WIDTH
                         + this._layout.SEPARATOR * 2);
        this.drawLine(this._layout.TIME_AXIS_LENGTH,
                      0,
                      this.styleSheet.axis,
                      [Tags.TIME_AXIS]);
    }


    public drawActivity(activity: Activity,
                        path: Path,
                        isPackage=false): void {
        this.moveHorizontallyTo(this._layout.LEFT_MARGIN);
        this.moveDownBy(this._layout.spaceBeforeActivity(path));
        this.moveRightBy(this._layout.indentation(path));
        this.drawActivityIdentifier(path, isPackage);
        this.moveRightBy(this._layout.TASK_IDENTIFIER_WIDTH +
                         this._layout.SEPARATOR);
        this.drawActivityName(activity, path, isPackage);
        this.moveRightBy(this._layout.taskNameWidth(path)
                        + this._layout.SEPARATOR);
        this.drawActivityDuration(activity, path, isPackage);
        this.moveDownBy(this._layout.TASK_HEIGHT);
    }


    private drawActivityIdentifier(path: Path, isPackage: boolean): void {
        const identifier = this._layout.identifier(path, isPackage);
        this.writeText(identifier,
                       this._layout.TASK_IDENTIFIER_WIDTH,
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.activity(path.depth).identifier,
                       [
                           identifier,
                           Tags.IDENTIFIER
                       ]);
    }


    private drawActivityName(activity: Activity, path: Path, isPackage): void {
        this.writeText(activity.name,
                       this._layout.taskNameWidth(path),
                       this._layout.TASK_HEIGHT,
                       this.styleSheet.activity(path.depth).label,
                       [
                           this._layout.identifier(path, isPackage),
                           Tags.NAME
                       ]);
    }


    private drawActivityDuration(activity: Activity,
                                path: Path,
                                isPackage: boolean): void {
        const start = (activity.start()-1) / this._project.duration();
        const end = activity.end() / this._project.duration();
        this.moveRightBy(this._layout.TIME_AXIS_LENGTH * start);
        this.drawRectangle(this._layout.TIME_AXIS_LENGTH * (end - start),
                           this._layout.TASK_HEIGHT,
                           this.styleSheet.activity(path.depth).bar,
                           [
                               this._layout.identifier(path, isPackage),
                               Tags.BAR
                           ]);
    }

}



export class Layout {

    public readonly TOP_MARGIN = 5;
    public readonly LEFT_MARGIN = 5;
    public readonly TASK_IDENTIFIER_WIDTH = 50;
    public readonly TASK_LABEL_WIDTH = 300;
    public readonly TASK_HEIGHT = 20;
    public readonly TIME_AXIS_LENGTH = 750;

    public readonly SPACE_BEFORE_ACTIVITY = 20;
    public readonly SEPARATOR = 5;
    public readonly INDENTATION = 10;


    public spaceBeforeActivity(path: Path): number {
        return this.SPACE_BEFORE_ACTIVITY / path.depth;
    }


    public indentation(path: Path): number {
        return this.INDENTATION * (path.depth - 1);
    }


    public taskNameWidth(path: Path): number {
        return this.TASK_LABEL_WIDTH
            - this.indentation(path)
            - this.TASK_IDENTIFIER_WIDTH;
    }


    public identifier(path: Path, isPackage: boolean): string {
        if (isPackage) {
            return path.asIdentifier("WP");
        }
        return path.asIdentifier("T");
    }

}
