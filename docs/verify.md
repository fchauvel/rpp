# How to Verify your Project?

As your project grows in size and complexity, it becomes quickly
difficult to get every moving part right. Small things becomes
inconsitent such as the roles of participants, empty work packages,
orphans tasks, etc.

## Key Commands
To avoid this, just use the `rpp verify` command, as follows:

```shell-session
$ rpp verify -p workplan.yaml
0 warning(s), 0 error(s).
```

By default, RPP only check the consistency of the workplan, but if you
project also includes a team description, it will check it as well.

```shell-session
$ rpp verify -p workplan.yaml -t team.yaml
0 warning(s), 0 error(s).
```

## Example: Inconsistent Workplan
Let us consider [a project whose workplan is inconsistent](). Using
`rpp verify` yields the following:

```shell-session
$ rpp verify -p erroneous/workplan.yaml
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

Looking at the YAML file, we can see where the following issues come
from. Work Package 2 is empty (see `breakdown: []`) and the given
milestone falls outside the diration of the project, which is derived
from the project breakdown.

```yaml {highlight: [9, 12]}
project:
  name: Erroneous
  origin: "2020-09-16"
  breakdown:
    - name: First Tasks
      start: 5
      duration: 7
    - name: First Package
      breakdown: []
  milestones:
    - name: First milestone
      date: 18
```

## Consistency Checks

RPP includes a command to gi through the model an spot the following
issues:

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
