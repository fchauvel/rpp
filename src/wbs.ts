/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


export class Project {

    private _name: string

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

}
