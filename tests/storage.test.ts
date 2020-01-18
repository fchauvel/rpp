/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Path } from "../src/rpp/wbs";
import { DataSource, Storage } from "../src/storage";
import { FakeFormat, FakeSource } from "./storage/fakes";



describe("A format should", () => {

    const format = new FakeFormat();

    test("detect files it parses", () => {
        expect(format.accept("myfile.svg")).toBe(true);
    });

    test("detect files it cannot parse", () => {
        expect(format.accept("myfile.cannot")).toBe(false);
    });


    test("reject parsing project by default", () => {
        expect(() => {
            format.parseProject("fake project data");
        }).toThrow();
    });


    test("reject parsing teams by default", () => {
        expect(() => {
            format.parseTeam("fake team data");
        }).toThrow();
    });


    test("reject writting Gantt by default", () => {
        expect(() => {
            format.writeGantt(undefined);
        }).toThrow();
    });

});


describe("A data source should", () => {

    test("Reject storing anything by default", () => {
        expect(() => {
            new class extends DataSource {
                public fetch(location: string): string {
                    return "";
                }
            }().store("myfile.txt", "blabla");
        }).toThrow();
    });

});

describe("The storage should", () => {

    const source = new FakeSource();
    const storage = new Storage([ source ]);

    test("Reject resources whose format is not supported", () => {
        expect(() => {
            storage.loadProject("location.unknown");
        }).toThrow();
    });

    test("Read project from JSON file", () => {
        const file = "project.json";
        source.contentOf[file] =
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

        const project = storage.loadProject(file);

        expect(project.name).toBe("Dummy");
        expect(project.breakdown.length).toBe(2);
        expect(project.breakdown[1].name).toBe("Task 2");
        expect(project.milestones).toHaveLength(0);
    });

    test("Read project from YAML file", () => {
        const file = "project.yaml";
        source.contentOf[file] =
            "project: \n" +
            "  name: Dummy\n" +
            "  milestones: \n" +
            "    - name: MS1\n" +
            "      date: 16\n" +
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

        const project = storage.loadProject(file);

        expect(project.name).toBe("Dummy");
        expect(project.breakdown.length).toBe(2);
        expect(project.breakdown[1].name).toBe("Task 2");
        expect(project.deliverables).toHaveLength(1);
        expect(project.milestones).toHaveLength(1);
    });


    test("Read teams from YAML files", () => {
        const file = "team.yaml";
        source.contentOf[file] =
            "team:\n" +
            "  name: Dummy\n" +
            "  members: \n" +
            "   - firstname: Franck \n" +
            "     lastname: Chauvel \n" +
            "     leads: [WP1, T1.1, T1.2]\n" +
            "     contributes: [WP2, WP3] \n" +
            "   - firstname: Bob\n" +
            "     lastname: Sponge\n" +
            "     leads: [WP5] \n" +
            "   - name: Backup \n" +
            "     members:\n" +
            "      - firstname: Harry\n" +
            "        lastname: Potter\n"
        ;

        const team = storage.loadTeam(file);

        expect(team.name).toBe("Dummy");
        expect(team.members).toHaveLength(3);
        expect(team.members[0].name).toBe("Franck Chauvel");
        expect(team.members[0].contributesTo(new Path([1, 1]))).toBe(true);
        expect(team.members[0].leads(new Path([1, 1]))).toBe(true);
        expect(team.members[0].leads(new Path([1, 2]))).toBe(true);
        expect(team.members[1].leads(new Path([5]))).toBe(true);
    });


    test("Read teams from JSON files", () => {
        const file = "team.json";
        source.contentOf[file] =
            "{ \"team\": {"  +
            "  \"name\": \"Dummy\", " +
            "  \"members\": [" +
            "     { \"firstname\": \"Franck\", " +
            "       \"lastname\": \"Chauvel\", " +
            "       \"leads\": [\"WP1\", \"T1.1\", \"T1.2\"], " +
            "       \"contributes\": [\"WP2\", \"WP3\"] }, " +
            "     { \"firstname\": \"Bob\", " +
            "       \"lastname\": \"Sponge\", " +
            "       \"leads\": [\"WP5\"] }" +
            "  ] } }"
        ;

        const team = storage.loadTeam(file);

        expect(team.name).toBe("Dummy");
        expect(team.members).toHaveLength(2);
        expect(team.members[0].name).toBe("Franck Chauvel");
        expect(team.members[0].contributesTo(new Path([1, 1]))).toBe(true);
        expect(team.members[0].leads(new Path([1, 1]))).toBe(true);
        expect(team.members[0].leads(new Path([1, 2]))).toBe(true);
        expect(team.members[1].leads(new Path([5]))).toBe(true);
    });

});
