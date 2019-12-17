#!/usr/bin/env node

const infos = require('../package.json');

let version = infos.version;
if (infos.commit != null) {
    version = version + '+git.' + infos.commit.substring(0, 7)
}

console.log('RPP v' + version);
console.log('Thanks!');
