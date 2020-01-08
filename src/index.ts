#!/usr/bin/env node

/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Controller } from "./controller";
import { RPP } from "./rpp";
import { Terminal } from "./terminal";

const controller = new Controller(
    new RPP(),
    new Terminal(console));

controller.execute(process.argv.slice(2));
