# RPP &mdash; Rapid Project Plan

![NPM Version](https://img.shields.io/npm/v/@fchauvel/rpp)
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

```
$ rpp gantt -p "samples/epic.json" -o epic.gantt.svg

``` 

RPP consumes a description of the project in a separate JSON file see
for instance `samples/epic.json`. This file specifies the project
structure in term of tasks and work packages. For instance:

```json
    "project": {
	"name": "EPIC",
	"breakdown": [
	    {
		"name": "Project Management",
		"breakdown": [
		    {
			"name": "Infrastructure for Communication",
			"start": 1,
			"duration": 48
		    },
		    {
			"name": "Financial Reporting",
			"start": 1,
			"duration": 48
		    },
		    {
			"name": "Quality & Risk Management",
			"start": 1,
			"duration": 48			
		    }
		]
	},

``` 



