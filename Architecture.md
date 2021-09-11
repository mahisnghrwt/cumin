# Architecture

## Questions
1. What if multiple users update the Roadmap simultaneously?
Features that define Roadmap:
	- Epic
	- Path [Dependency]
Let's say only Project Manager can "directly" update the Roadmap of a project.
Naturally, we do not expect a whole lot of Project Managers in a single project.
If there are multiple project managers, changes are always made to their isolated view. It must be accepted by all other project managers to actually change the "main view" of the roadmap.