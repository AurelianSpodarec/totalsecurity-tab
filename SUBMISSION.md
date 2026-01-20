# Submission Notes

There are many valid ways to approach a task like this, and expectations can vary significantly between teams and companies. Depending on context, it’s easy to either over-deliver or under-deliver - depending on exact expectations reviewers have.

From a purely functional perspective, the task itself could be completed quite quickly—especially with modern tooling such as Copilot or Wrap. Given that I hadn’t worked deeply with Chrome extensions recently, I started by familiarising myself with the extension model, lifecycle, and constraints, and put together a very lightweight MVP to validate the basics and ensure everything was wired up correctly.

In a typical work setting, my default approach is pragmatic and tightly scoped:

- One feature per branch
- Any bugs or issues discovered are logged rather than opportunistically fixed
- No refactoring unless it is directly related or a very small incremental improvement
- Test coverage focused primarily on deterministic logic, applied selectively
- Make sure accessability tests passes

After discussing architecture with Tom during the interview, I chose to go slightly beyond the minimum requirements. This was partly to gain more hands-on experience with browser extensions and partly to explore a few architectural decisions in more depth. Although the codebase can be further refactored and improved quality wise.

Over time, I’ve learned that extensions offer multiple UI approaches—for example, using a panel instead of a popup, or embedding an iframe. While iframes are technically viable, they tend to feel dated from a UX perspective, so I opted to place my settings modal directly within the panel.

In a product company environment, I would typically move more conservatively and keep experimentation separate. In this case, I leaned more toward exploration and learning rather than strict scope minimisation.

I fully understand the importance of avoiding over-engineering in a real production setting. When given a task, the priority is to meet the requirement, possibly improve one or two closely related areas, and then move on. You don’t redesign the entire system, unless its a natural, incremental approach, which with the task could argue it could be plausable in a few areas to do that, such as separating Button, Select and similar into an atom folder.

There are certainly areas where the code could be improved further. The CSS has rough edges and duplicates, and parts of the JavaScript could be refactored and tightened up. These are trade-offs I consciously made given the broader scope I chose. Given a little bit more time, Id focus on going back and refactoring these things, that being said, I would have branched them off and done properly the first time.

Following my conversation with Tom, I intentionally went a bit further than strictly necessary, focusing more on improving structure and understanding how Chrome extensions are built, where their constraints are, and how the pieces fit together. In a normal work environment, this kind of exploration would be isolated in a separate branch and kept out of the main delivery path.

Regarding testing, my general approach is to prioritise unit tests for components with clear logic and deterministic behaviour. For example, something like a TabManager, with explicit traversal and state logic, is a strong candidate for unit testing. Areas with well-defined inputs and outputs are where testing provides the most value. Good testing can make code a lot easier to refactor, and let AI know what exactly were expecting, especially if we focus on writing it first - although that too is subjective depending on who we speak, but also what type of work that is.

Hopefully this provides helpful context around my approach and the decisions I made.

## Key Decisions

- Cleaned up comments, retaining only those that explain non-obvious logic, key decisions, or important structural choices.
- Set up ESLint and switched the code style from Allman to K&R as a pragmatic trade-off, since it is faster and simpler to configure and enforce consistently for this assessment.
- Moved away from a flat project structure as the codebase grew, since it was becoming unclear what belonged where. Reorganised the code into UI atoms and feature-based modules, and renamed components (eg `WindowCard` to `TabList`) to better reflect their actual responsibilities.
- Removed certain components that were only used in a single place, as keeping them as standalone components would have added unnecessary abstraction.
- Isolate shared components (e.g. Select, Button, Input etc...) behind a stable component API, allowing the underlying implementation or library to be replaced in one location without impacting the rest of the codebase. This API/component serves as a contract.
- Used ATOMIC Design principle as it scales well and separates the concern of components very well

## Tasks

### Part 1

- A) Select component  
  Start: ~14:42 - End: ~14:47
- B) Window switching  
  Start: ~14:52 - End: ~14:58

### Part 2

- Identified and fixed an existing bug in the starting template where tab reordering caused unexpected state changes.  
  This issue affected core functionality, so it was prioritised before continuing with the main Part 2 task.

## UX Ideas

- When a user selects a tab in the tab manager, automatically scroll to that tab in the extention sidebar.
- Add an indicator for tabs that are playing audio, with the ability to mute or unmute them directly from the extension.
- When a tab plays sound add a sound icon
- Show how many tabs are active, and by what group
- Automatically group all tabs with the same domain under one group
- Add theming that supports different colors, different grouping styles, font family, cool animations
