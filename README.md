# Cumin
![!](https://i.imgur.com/TZ9xQWd.jpeg "Roadmap Page screenshot")


## Upcoming features
- [x] ~"Add row" button on last canvas row.~
- [x] Sync path between Epics
- [x] Detect cycles in Roadmap
	- ~[ ] Suggestions to resolve cycles~
- ~[ ] Delete row~
	- ~*Add a delete button next to row label*~
- [ ] Show progress of Epic (Using progress bar)
- [ ] Epic Page
- [ ] Issue Page
- [ ] Spinner
- [ ] Highlight blocked Epics.


## Upcoming QoL
- [x] Color palette for Epics
- [ ] Disable form until submission-event finishes.
- [x] Indicate current day in Roadmap Canvas
- [ ] Highlight current grid (row and current date) mouse is over.
- [ ] Collapse empty rows in Roadmap.
- [ ] Show key points about Epic *on hover*. 
- [ ] Subhighlight indirectly blocked Epics.
- [ ] Highlight path *on hover*.
- [ ] Project selection in Navbar

## Bugs
- [x] Remove dragData, *child cannot update the prop even if it is a ref*

## Performance Drops
- [ ] Drag event handler in InteractiveLayer in Canvas.

### Sidebar in Roadmap
- Default
	- Create Epic
- Epic
	- Intermediate (Epic | Issue)
	- Create Issue
	- Update Epic
	- Epic Details
		- List of Issues