# Design Choices

## Questions
1. What if multiple users update the Roadmap simultaneously?
Features that define Roadmap:
	- Epic
	- Path [Dependency]
Let's say only Project Manager can "directly" update the Roadmap of a project.
Naturally, we do not expect a whole lot of Project Managers in a single project.
If there are multiple project managers, changes are always made to their isolated view. It must be accepted by all other project managers to actually change the "main view" of the roadmap.

2. Fetching and preprocessing Roadmaps in RoadmapPage or Canvas2?
Fetching in Canvas2:
Pros:
- Better code seperation between RoadmapPage and Canvas2.
- Smaller renders on roadmap change.
Cons:
- Relatively more API fetch calls and preprocessing whenever different roadmap is selected.

Fetching in RoadmapPage:
Pors:
- Less API calls
- Preprocessing only once.
Cons:
- Bigger renders on roadmap change.