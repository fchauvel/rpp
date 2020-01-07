/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Project } from "../src/wbs";
import { Storage, DataSource } from "../src/storage";
import { Format } from "../src/storage/adapters";


class FakeFormat extends Format {

    constructor() {
        super("SVG", [".svg"]);
    }


    public parseProject(content: string): Project {
        return null;
    }

}



describe("A format should", () => {

    const format = new FakeFormat();

    test("detect files it parses", () => {
        expect(format.accept("myfile.svg")).toBe(true);
    });

    test("detect files it cannot parse", () => {
        expect(format.accept("myfile.cannot")).toBe(false);
    });

});



class FakeSource extends DataSource {

    private readonly json: string =
        "{ \"project\": {"
        + "      \"name\": \"Dummy\", "
        + "      \"breakdown\": ["
        + "         { \"name\": \"Task 1\","
        + "           \"start\": 1,"
        + "           \"duration\": 10 }, "
        + "         { \"name\": \"Task 2\", "
        + "           \"start\":  5, "
        + "           \"duration\": 7 }"
        + "       ]"
        + "}}";

    private readonly yaml: string =
        "project: \n" +
        "  name: Dummy\n" +
        "  breakdown:\n" +
        "    - name: Task 1\n" +
        "      start: 1\n" +
        "      duration: 10\n" +
        "    - name: Task 2\n" +
        "      start: 5\n" +
        "      duration: 7\n" +
        "      deliverables:\n" +
        "        - name: Dummy Report\n" +
        "          kind: Report\n" +
        "          due: 6\n"
    ;


    private _contents: { [extension: string]: string };

    constructor () {
        super();
        this._contents = {};
        this._contents[".json"] = this.json;
        this._contents[".yml" ] = this.yaml;
        this._contents[".yaml" ] = this.yaml;
    }


    public fetch(resource: string): string {
        const marker = ".";
        const lastMarker = resource.lastIndexOf(marker);
        const extension = resource.substr(lastMarker);
        return this._contents[extension];
    }

}


describe("The storage should", () => {

    const source = new FakeSource();
    const storage = new Storage([ source ]);

    test("Reject resources whose format is not supported", () => {
        expect(() => {
            storage.loadProject("location.unknown");
        }).toThrow();
    });


    test("Read project from JSON file", () => {
        const project = storage.loadProject("whatever.json");

        expect(project.name).toBe("Dummy");
        expect(project.breakdown.length).toBe(2);
        expect(project.breakdown[1].name).toBe("Task 2");
    });


    test("Read project from YAML file", () => {
        const project = storage.loadProject("whatever.yaml");

        expect(project.name).toBe("Dummy");
        expect(project.breakdown.length).toBe(2);
        expect(project.breakdown[1].name).toBe("Task 2");
        expect(project.deliverables).toHaveLength(1);
    });


});
