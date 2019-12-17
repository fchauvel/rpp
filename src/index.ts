#!/usr/bin/env node

import infos = require("../package.json");

let version = infos.version;
if (infos.commit != null) {
    const max = 7;
    version = version + "+git." + infos.commit.substring(max);
}

console.log("RPP v" + version);
console.log("Thanks!");
