/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Person, Role, Team } from "../../src/rpp/team";
import { Path } from "../../src/wbs";



describe("A person should", () => {

    const firstName = "Franck";
    const lastName = "Chauvel";
    const wp1 = new Path([1]);
    const task13 = new Path([1, 3]);
    const task21 = new Path([2, 1]);
    const person = new Person(
        firstName,
        lastName,
        [
            Role.lead(wp1),
            Role.lead(task13),
            Role.contributeTo(task21),
        ],
    );

    test("expose its first name", () => {
        expect(person.firstName).toBe(firstName);
    });

    test("expose its last name", () => {
        expect(person.lastName).toBe(lastName);
    });

    test("expose its name", () => {
        const name = firstName + " " + lastName;
        expect(person.name).toBe(name);
    });

    test("detect the activities to which she contributes", () => {
        const wp2 = new Path([2]);
        expect(person.contributesTo(wp2)).toBe(true);
        expect(person.contributesTo(task21)).toBe(true);
    });

    test("detect the activities to which she does not contributes", () => {
        const task11 = new Path([1, 1]);
        expect(person.contributesTo(task11)).toBe(false);
    });

    test("detect the activities she leads", () => {
        expect(person.leads(wp1)).toBe(true);
        expect(person.leads(task13)).toBe(true);
        expect(person.leads(new Path([1, 3]))).toBe(true);
    });

    test("detect the activities she does not lead", () => {
        const wp3 = new Path([3]);
        expect(person.leads(wp3)).toBe(false);
    });

    test("contributes to the activities she leads", () => {
        expect(person.contributesTo(wp1)).toBe(true);
    });

    test("not lead activities where she only contributes", () => {
        expect(person.leads(task21)).toBe(false);
    });

});


describe("A team should", () => {

    const task12 = new Path([1, 2]);
    const wp2 = new Path([2]);
    const franck = new Person("Franck",
                              "Chauvel",
                              [
                                  Role.contributeTo(task12),
                              ]);
    const brice = new Person("Brice",
                             "Morin",
                             [
                                 Role.lead(wp2),
                                 Role.lead(task12),
                             ]);
    const name = "SINTEF";
    const team = new Team(
        name,
        [ franck, brice ],
    );

    test("expose its name", () => {
        expect(team.name).toBe(name);
    });

    test("expose its members", () => {
        expect(team.members).toHaveLength(2);
        expect(team.members[0]).toBe(franck);
        expect(team.members[1]).toBe(brice);
    });

    test("sum up the contributions of its members", () => {
        expect(team.contributesTo(wp2)).toBe(true);
        expect(team.contributesTo(task12)).toBe(true);
        expect(team.leads(wp2)).toBe(true);
        expect(team.leads(task12)).toBe(true);
        expect(team.leads(new Path([3]))).toBe(false);
    });

});
