# RPP — Rapid Project Plan

[![NPM Version](https://img.shields.io/npm/v/@fchauvel/rpp)](https://www.npmjs.com/package/@fchauvel/rpp)
[![NPM Monthly download rate](https://img.shields.io/npm/dm/@fchauvel/rpp)](https://www.npmjs.com/package/@fchauvel/rpp)
[![Build Status](https://travis-ci.org/fchauvel/rpp.svg?branch=master)](https://travis-ci.org/fchauvel/rpp)
[![Test Coverage](https://img.shields.io/codecov/c/github/fchauvel/rpp)](https://codecov.io/gh/fchauvel/rpp/)
[![Code Grade](https://img.shields.io/codacy/grade/bd70b010385c4f18a31d24dd44de4580.svg)](https://app.codacy.com/manual/fchauvel/rpp/dashboard)

A simple CLI tool to quickly generate project plans including Gantt
charts. Project planning for developers in a way.

## Installation

```console
$ npm install @fchauvel/rpp
```

## Gantt Charts

To export the associated Gantt chart, use:

```console
$ rpp gantt -p samples/epic/workplan.yaml -o samples/epic/gantt.svg

```

This yields the following Gantt Chart:

![Sample Gantt Chart](https://raw.github.com/fchauvel/rpp/master/samples/epic/gantt.svg?sanitize=true)

## Project Descriptions

### Work Plan

RPP consumes a description of the project split into multiple YAML
files, one for the woorkplan, one for the teams, etc. See for instance
`samples/epic/workplan.yaml`. This file specifies the work plan (work
packages, tasks, deliverables and milestones) of our sample EPIC
project (see the [workplan schema][workplan-schema]). Here is an excerpt:

```yaml
project:
  name: EPIC
  breakdown:
    - name: Project Management
      breakdown:
        - name: Infrastructure for Communication
          start: 1
          duration: 48
          deliverables:
            - name: Infrastructure for Communication
              kind: Software
              due: 3
        - name: Financial Reporting
          start: 1
          duration: 48
          deliverables:
            - name: Intermediate Financial Report
              kind: Report
              due: 24
            - name: Final Financial Report
              kind: Report
              due: 48
```

### Project Team

RPP also accepts a description of the team, that this, the persons
assigned to the projects with their roles (see the [team
schema][team-schema]). Here is an excerpt of the EPIC team
description.

```yaml
team:
  name: EPIC
  members:
  - name: SINTEF
    members:
      - firstname: Franck
        lastname: Chauvel
        leads: [ WP1, T1.1, T1.2, T3.1, T4.4 ]
      - firstname: Brice
        lastname: Morin
        leads: [ WP3, T2.1, T3.3 ]
      - firstname: Ketil
        lastname: Stølen
        leads: [ T1.3 ]
  - name: UiO
    members:
      - firstname: Olaf
        lastname: Owe
        leads: [ WP4, T2.2, T4.1, T4.2, T4.3, T5.2]
```

You can pass the team to the `rpp gantt` command using `--team|-t`
option, so that the Gantt chart indicates who leads the Tasks. For
instance:

```console
$ cd samples/epic
$ rpp gantt -p workplan.yaml -t team.yaml -o gantt.svg
```

## Sanity Checks

RPP can also run sanity checks on your project description. To do so,
use the following command:

```console
$ npx rpp verify -p samples/erroneous/workplan.yaml
  1. Warning: 'EMPTY WORK PACKAGE' on 'WP 2'
     - Work package 'First Package' is empty.
     - Tip: Have we forgotten some tasks or work packages there?

  2. Warning: 'NO DELIVERABLE' on 'T 1'
     - Task 'First Tasks' has no deliverable
     - Tip: Do we miss some?

  3. Error: 'LATE MILESTONE' on 'MS 1'
     - Milestone 'First milestone' comes after project end.
     - Tip: Check the milestone date

2 warning(s), 1 error(s).
```

Here as well the `-t|--team` option allows us to include the team
description.

RPP checks for the following:

-   Work plan consistency

    -   Empty work package, that is, work packages that do not contain
        any tasks or work packages.

    -   Single activity work packages, that is, work packages that
        contain a single task or work package.

    -   Discontinuity in work packages, that is, activities in work
        packages that are neither overlapping nor contiguous in
        time. In other words, RPP search for work packages that are
        idle at some point.

    -   Tasks without any deliberable.

    -   Deliverable due outside the task period.

    -   Milestones set outside the project period.

-   Teams consistency

    -   Empty teams
    -   Duplicate activity leader
    -   Tasks without contributors
    -   Activities without leader
    -   Idle partners (without any role)


[workplan-schema]: https://github.com/fchauvel/rpp/blob/058f1722d116955bb9a018dcca6287a926044670/src/storage/adapters/schemas.ts#L29

[team-schema]: https://github.com/fchauvel/rpp/blob/058f1722d116955bb9a018dcca6287a926044670/src/storage/adapters/schemas.ts#L111
