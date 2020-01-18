/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Person } from "../../../rpp/team";
import { Codes, Rule } from "./commons";



export class UselessPartner extends Rule {

    public onPerson(person: Person): void {
        if (person.roles.length === 0) {
            const identifier = person.name;
            this.warn(
                `Partner '${identifier}' has no assigned role.`,
                "Please check her responsibilities.",
                Codes.NO_ROLE,
                identifier);
        }
    }

}
