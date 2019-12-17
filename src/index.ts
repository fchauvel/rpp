#!/usr/bin/env node

import * as infos from "../package.json";

let commit: string = infos.commit
let version: string = infos.version;
if (commit !== null) {
    const max = 7;
    version =  version + "+git." + commit.substring(max);
}

console.log("RPP v" + version);
console.log("Thanks!");
