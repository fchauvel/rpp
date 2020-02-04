# Generate a Gantt Chart

Now you have described your [work plan](workplan.md) in a YAML or JSON
file.

You can now generate a Gantt chart as an SVG file using the command:

```shell-session
$ rpp gantt -p workplan.yml -o gantt.svg
```

Provided you also have a description of the team, you can enter:

```shell-session
$ rpp gantt -p workplan.yaml -t team.yaml -o gantt.svg
```

For instance, the description of the [EPIC project](samples/epic) yields the following Gantt chart:

![EPIC Gantt chart](samples/epic/gantt.svg)
