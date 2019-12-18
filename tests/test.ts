/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Project } from "../src/wbs"


describe("A project", () => {

    it("should expose its name", () => {
        const name = "Dummy project";
        const project = new Project(name);

        expect(project.name).toBe(name);
    });

});
