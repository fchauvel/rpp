# RPP &mdash; Rapid Project Plan

[![NPM Version](https://img.shields.io/npm/v/@fchauvel/rpp)](https://www.npmjs.com/package/@fchauvel/rpp)
[![Build Status](https://travis-ci.org/fchauvel/rpp.svg?branch=master)](https://travis-ci.org/fchauvel/rpp)
[![Test Coverage](https://img.shields.io/codecov/c/github/fchauvel/rpp)](https://codecov.io/gh/fchauvel/rpp/branch/master)
[![Code Grade](https://img.shields.io/codacy/grade/bd70b010385c4f18a31d24dd44de4580.svg)](https://app.codacy.com/manual/fchauvel/rpp/dashboard)

A simple CLI tool to quickly generate project plans including Gantt
charts.

## Installation

```console
$ npm install @fchauvel/rpp
```

## Usage

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
