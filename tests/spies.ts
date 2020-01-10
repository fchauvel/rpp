/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Output } from "../src/terminal";

export class SpyOutput implements Output {

    public text: string;

    public log(text: string): void {
        this.text += text;
    }

    public reset(): void {
        this.text = "";
    }
}
