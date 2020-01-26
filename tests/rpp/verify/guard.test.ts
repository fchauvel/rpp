/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */



import { Blueprint } from "../../../src/rpp";
import { Guard } from "../../../src/rpp/verify/guard";
import { Codes } from "../../../src/rpp/verify/rules/commons";
import { SampleProject } from "../../../tests/sample";



describe("The guard should", () => {

    const sampleProject = new SampleProject();
    const guard = new Guard();


    function check(blueprint: Blueprint,
                   expectedErrors: Array<[string, number]>): void {
        const report = guard.scrutinize(blueprint);
        const expectedTotal = expectedErrors.reduce(
            (sum, [error, count]) => sum + count,
            0);
        expect(report.issues).toHaveLength(expectedTotal);
        for (const [eachCode, expectedCount] of expectedErrors) {
            const actualCount =
                report.issues.filter(
                    (i) => i.code === eachCode,
                ).length;
            expect(actualCount).toBe(expectedCount);
        }
    }

    test("not report issues when there is none", () => {
        check(
            sampleProject.asIs,
            [],
        );
    });

    test("report empty project", () => {
        check(
            sampleProject.withoutAnyActivity,
            [
                [Codes.EMPTY_PROJECT, 1],
            ],
        );
    });

    test("report empty work packages", () => {
        check(
            sampleProject.withEmptyWP3,
            [
                [Codes.EMPTY_WORK_PACKAGE, 1],
            ],
        );
    });

    test("warn about work packages that have only one activity", () => {
        check(
            sampleProject.withoutActivity32,
            [
                [ Codes.SINGLE_TASK_WORK_PACKAGE, 1],
            ],
        );
    });

    test("report milestones after the project end", () => {
        check(
            sampleProject.withAMilestoneAfterProjectEnd,
            [
                [ Codes.MILESTONE_AFTER_PROJECT_END, 1],
            ],
        );
    });

    test("report milestones before the project start", () => {
        check(
            sampleProject.withAMilestoneBeforeProjectStart,
            [
                [Codes.MILESTONE_BEFORE_PROJECT_START, 1],
            ],
        );
    });

    test("warn about tasks without deliverables", () => {
        check(
            sampleProject.withActivity1WithoutDeliverable,
            [
                [ Codes.TASK_WITHOUT_DELIVERABLE, 1 ],
            ],
        );
    });

    test("report deliverables due after task ends", () => {
        check(
            sampleProject.withD111DueAfterA1,
            [
                [ Codes.WRONG_DELIVERABLE_DATE, 1],
            ],
        );

    });

    test("report deliverables due before task starts", () => {
        check(
            sampleProject.withD21BeforeA2,
            [
                [ Codes.WRONG_DELIVERABLE_DATE, 1],
            ],
        );
    });


    test("report discontinuous work packages", () => {
        check(
            sampleProject.withDiscontinuityInA3,
            [
                [ Codes.DISCONTINUITY_IN_WORK_PACKAGE, 1 ],
            ],
        );
    });


    test("report tasks without contributors", () => {
        check(
            sampleProject.withoutContributorToTask1,
            [
                [ Codes.NO_LEADER, 1 ],
                [ Codes.NO_CONTRIBUTOR, 1 ],
            ],
        );
    });

    test("report work packages without contributors", () => {
        check(
            sampleProject.withoutContributorToWP3,
            [
                [ Codes.NO_LEADER, 3 ],
                [ Codes.NO_CONTRIBUTOR, 3],
            ],
        );
    });


    test("report tasks without leaders", () => {
        check(
            sampleProject.withoutLeaderOfTask2,
            [
                [ Codes.NO_LEADER, 1 ],
            ],
        );
    });

    test("report work packages without leaders", () => {
        check(
            sampleProject.withoutLeaderOfWP3,
            [
                [ Codes.NO_LEADER, 1 ],
            ],
        );
    });

    test("report empty teams", () => {
        check(
            sampleProject.withoutAnyone,
            [
                [ Codes.NO_LEADER, 5 ],
                [ Codes.NO_CONTRIBUTOR, 5],
                [ Codes.EMPTY_TEAM, 1],
            ],
        );
    });

    test("report idle person", () => {
        check(
            sampleProject.withExtraIdlePerson,
            [
                [ Codes.NO_ROLE, 1 ],
            ],
        );
    });

    test.todo("report 1-partner teams");

    test.todo("teams that do not lead anything");

    test("report duplicated task leaders", () => {
        check(
            sampleProject.withTwoLeadersForA1,
            [
                [ Codes.DUPLICATE_LEADER, 1 ],
            ],
        );
    });

    test("report duplicated work package leaders", () => {
        check(
            sampleProject.withTwoLeadersForA3,
            [
                [ Codes.DUPLICATE_LEADER, 1 ],
            ],
        );
    });

});
