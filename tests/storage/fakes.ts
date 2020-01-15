/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { DataSource } from "../../src/storage";
import { Format } from "../../src/storage/adapters";
import { Project } from "../../src/wbs";



export class FakeFormat extends Format {

    constructor() {
        super("SVG", [".svg"]);
    }

}


export class FakeSource extends DataSource {

    public contentOf: { [fileName: string]: string };

    constructor() {
        super();
        this.contentOf = {};
    }

    public fetch(resource: string): string {
        return this.contentOf[resource];
    }

}
