/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


export function format(template: string, ...args: any[]): string {
    let result = template;
    for (const index in args) {
	const pattern = new RegExp("\\{" + index + "\\}", "g");
	result = result.replace(pattern, args[index]);
    }
    const remaining_slots = result.match(/\{(\d+)\}/g);
    if (remaining_slots) {
	throw Error("Invalid indexes: " + remaining_slots);
    }
    return result;
}
