/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { format } from "./utils"



export interface Output {

    log(text: string);

}


export class Terminal {

    private _output: Output;

    constructor(output: Output) {
        this._output = output;
    }


    private write(text: string) {
        this._output.log(text);
    }


    show_version(version: string, commit: string) {
        if (commit != null) {
            this.write(format(this.VERSION_WITH_HASH,
                              version,
                              commit.substring(0, this.HASH_LENGTH)));
        } else {
            this.write(format(this.VERSION, version));
        }
    }

    readonly HASH_LENGTH = 7;
    readonly VERSION = "RPP v{0}"
    readonly VERSION_WITH_HASH = "RPP v{0}+git.{1}"


    show_help(help: string) {
        this.write(help);
    }


    invalid_arguments(message: string, error: Error) {
        this.write("Error");
        this.write(message);
    }


}
