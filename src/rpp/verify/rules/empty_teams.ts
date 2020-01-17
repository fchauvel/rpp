/* Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Team } from "../../../rpp/team";
import { Codes, Rule } from "./commons";


export class EmptyTeam extends Rule {

    public onTeam(team: Team): void {
        if (team.members.length === 0) {
            this.error(
                `Team ${team.name} has no member.`,
                "Have we forgotten some collaborators?",
                Codes.EMPTY_TEAM,
                `Team ${team.name}`,
            );
        }
    }

}
