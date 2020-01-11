# RPP &mdash; Rapid Project Plan

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
$ rpp gantt -p "samples/epic.yaml" -o epic.gantt.svg

``` 

RPP consumes a description of the project in a separate YAML file, see
for instance `samples/epic.yaml`. This file specifies the project
structure in term of tasks and work packages. For instance:

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

For instance, the 'samples/epic.yaml' yields the following Gantt
Chart:

![Sample Gantt Chart](https://raw.github.com/fchauvel/rpp/master/samples/epic.gantt.svg?sanitize=true)

## Verification of Project Structure

RPP can also run sanity checks on your project description. To do so,
use the following command:

```console
$ rpp verify -p samples/erroneous.yaml
 1. WARNING: Work package 'First Package' is empty.
   -> Have we forgotten some tasks or work packages there?

 2. ERROR: Milestone 'First milestone' comes after project end.
   -> Check the milestone date

 3. WARNING: T 1 (First Tasks) has no deliverable
   -> Do we miss some?

2 warning(s), 1 error(s).
```

RPP checks for the following:

*   Empty work package, that is, work packages that do not contain any
	tasks or work packages.
	
*   Single activity work packages, that is, work packages that contain a
    single task or work package.

*   Discontinuity in work packages, that is, tasks in work packages that
	are neither overlapping nor contiguous in time. In other words, RPP
	search for work packages, that are idle at some point.

*   Tasks without any deliberable.

*   Deliverable due outside the task period.

*   Milestones set outside the project period.

