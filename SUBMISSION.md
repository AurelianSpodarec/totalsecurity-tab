# Submission Notes

## Key Decisions

- Cleaned up comments, retaining only those that explain non-obvious logic, key decisions, or important structural choices.
- Set up ESLint and switched the code style from Allman to K&R as a pragmatic trade-off, since it is faster and simpler to configure and enforce consistently for this assessment.
- Moved away from a flat project structure as the codebase grew, since it was becoming unclear what belonged where. Reorganised the code into UI atoms and feature-based modules, and renamed components (eg `WindowCard` to `TabList`) to better reflect their actual responsibilities.

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
