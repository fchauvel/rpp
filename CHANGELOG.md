# Version History

## [Unreleased][unreleased]

-   Add support for projects' team

    -   Add reading a team description from either a YAML or JSON file

    -   Add verification rules, including:

        -   Detect tasks and work packages without contributors
        -   Detect tasks and work packages without leader
        -   Detect empty teams
        -   Detect idle partners (without any responsibility)
        -   Detect duplicated leaders

-   Improve formatting of issues reported by `rpp verify`

## [RPP 0.6.0 (Jan. 12, 2020)][v0.6.0]

-   Add project verification, including:

    -   Detect empty projects and work packages
    -   Detect milestones after project end
    -   Report work packages with a single activity
    -   Detect milestones that occur before the project starts
    -   Warn about tasks without deliverable
    -   Detect deliverables due after task end
    -   Detect discontinuities in work packages

-   Add example of erroneous project

-   Document the use of 'rpp verify' in the README

## [RPP 0.5.0 (Jan. 10, 2020)][v0.5.0]

-   Add support for projects' milestones

    -   Read projects' milestones from JSON and YAML
    -   Draw milestones on Gantt charts

-   Add milestones to the EPIC example

## [RPP 0.4.0 (Jan. 9, 2020)][v0.4.0]

-   Add a time-grid on top of Gantt chart

    -   Show calendar years on the Gantt chart
    -   Expose project origin in the JSON/YAML files

-   Fix start and duration of Task 3.2 in EPIC samples

-   Add example of generated Gantt chart

## [RPP 0.3.0 (Jan. 8, 2020)][v0.3.0]

-   Add support for projects' deliverables, including:

    -   Load deliverables from both JSON and YAML files
    -   Draw deliverables on the Gantt chart

-   Use YAML in addition of JSON as EPIC project example

-   Add EPIC's deliverables in EPIC.yaml

## [RPP 0.2.0 (Jan. 7, 2020)][v0.2.0]

-   Add reading projects from YAML files

## [RPP 0.1.0 (Jan. 6, 2020)][v0.1.0]

-   Add command help to show a simple help message
-   Add command version to show the version number
-   Add command gantt to generate an SVG gantt chart
-   Add reading project from JSON file
-   Add how to generate Gantt chart in the README

[unreleased]: https://github.com/fchauvel/rpp/compare/v0.6.0..dev

[v0.6.0]: https://github.com/fchauvel/rpp/compare/v0.5.0...v0.6.0

[v0.5.0]: https://github.com/fchauvel/rpp/compare/v0.4.0...v0.5.0

[v0.4.0]: https://github.com/fchauvel/rpp/compare/v0.3.0...v0.4.0

[v0.3.0]: https://github.com/fchauvel/rpp/compare/v0.2.0...v0.3.0

[v0.2.0]: https://github.com/fchauvel/rpp/compare/v0.1.0...v0.2.0

[v0.1.0]: https://github.com/fchauvel/rpp/compare/v0.0.0...v0.1.0
