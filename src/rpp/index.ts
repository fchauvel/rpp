/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Team } from "./team";
import { Guard } from "./verify/guard";
import { Report } from "./verify/report";
import { Project } from "./wbs";



export class Blueprint {

    private _project: Project;
    private _team: Team;


    constructor(project: Project, team?: Team) {
        this._project = project;
        this._team = team;
    }

    public get project(): Project {
        return this._project;
    }

    public get team(): Team {
        return this._team;
    }

    public accept(visitor: Visitor): void {
        visitor.visitBlueprint(this);
    }

}

export interface Visitor {

    visitBlueprint(blueprint: Blueprint): void;

}


export class RPP {

    public version(): [string, string] {
        return ["0.0.0", "" ];
    }


    public verify(blueprint: Blueprint): Report {
        const guard = new Guard();
        const report = guard.scrutinize(blueprint);
        return report;
    }

}
