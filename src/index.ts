#!/usr/bin/env node

import * as infos from "../package.json";

const commit: string = infos.commit
let version: string = infos.version;
if (commit !== null) {
    const hash_length = 7;
    version =  version + "+git." + commit.substring(hash_length);
}

console.log("RPP v" + version);
console.log("Thanks!");
