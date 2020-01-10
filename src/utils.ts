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
    for (const [index, value] of args.entries()) {
        const pattern = new RegExp("\\{" + index + "\\}", "g");
        result = result.replace(pattern, value);
    }
    const remainingSlots = result.match(/\{(\d+)\}/g);
    if (remainingSlots) {
        throw Error("Invalid indexes: " + remainingSlots);
    }
    return result;
}
