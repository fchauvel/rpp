/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */

import { Report } from "./rpp/verify/report";
import { format } from "./utils";

import { Report as SyntaxError } from "@fchauvel/quick-check/dist/issues";


export interface Output {

    log(text: string);

}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}


export class Terminal {

    public readonly HASH_LENGTH = 7;
    public readonly VERSION = "RPP v{0}";
    public readonly VERSION_WITH_HASH = "RPP v{0}+git.{1}";
    public readonly ISSUE_TEMPLATE =
        "{0}. {1}: '{2}' on '{3}'\n" +
        "     - {4}\n" +
        "     - Tip: {5}\n";


    private _output: Output;

    constructor(output: Output) {
        this._output = output;
    }

    public showVersion(version: string, commit: string): void {
        if (commit != null) {
            this.write(format(this.VERSION_WITH_HASH,
                              version,
                              commit.substring(0, this.HASH_LENGTH)));
        } else {
            this.write(format(this.VERSION, version));
        }
    }

    public showHelp(help: string): void {
        this.write(help);
    }

    public showVerificationReport(report: Report): void {
        for (const [index, issue] of report.issues.entries()) {
            const text =
                format(this.ISSUE_TEMPLATE,
                       String(index + 1).padStart(3, " "),
                       capitalize(issue.level),
                       issue.code,
                       issue.location,
                       issue.description,
                       issue.advice);
            this.write(text);
        }
        const summary =
            report.warnings.length + " warning(s), "
            + report.errors.length + " error(s).";
        this.write(summary);
    }

    public showSyntaxErrors(report: SyntaxError): void {
        this.write(report.toString());
    }


    public unexpectedError(error: any): void {
        this.write(error.toString());
    }

    public invalidArguments(message: string, error: Error): void {
        this.write("Error");
        this.write(message);
    }

    private write(text: string): void {
        this._output.log(text);
    }


}
