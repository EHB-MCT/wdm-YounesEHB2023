# Conversations Storage

This directory contains all conversations with the AI assistant during development sessions.

## Purpose
- Track development decisions and problem-solving approaches
- Maintain a knowledge base of technical discussions
- Provide reference for future development work
- Document the evolution of the project

## File Naming Convention
Files are named using the format: `YYYY-MM-DD_session-N.txt`

- `YYYY-MM-DD`: Date of the conversation
- `session-N`: Session number for that day (starts at 1)
- `.txt`: Plain text format for universal compatibility

## File Structure
Each conversation file includes the following metadata header:

```
Session: YYYY-MM-DD_session-N
Start: [timestamp]
End: [timestamp]
Topics: [list of main topics discussed]
Key Decisions: [summary of important decisions]
Files Modified: [list of files changed during session]

--- CONVERSATION START ---
[full conversation content]
--- CONVERSATION END ---
```

## Usage Guidelines
- Each new conversation session should create a new file
- Update session number if multiple conversations occur on the same day
- Include accurate timestamps and metadata
- Keep conversations complete and unedited for historical accuracy
- Files are tracked in git for version control

## Benefits
- Searchable history of development decisions
- Reference for solving similar problems in the future
- Documentation of project evolution
- Knowledge transfer for team members