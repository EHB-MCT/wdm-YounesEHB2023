# Error Handling & Alert System

## Error Types & Responses

### 1. File Creation Errors
**Error**: Cannot create session file
**Alert**: ❌ ERROR: Could not create session file
**Possible Causes**:
- Directory doesn't exist
- Insufficient permissions
- Disk full
**Immediate Actions**:
- Verify conversations/ directory exists
- Check write permissions
- Check available disk space

### 2. Permission Errors
**Error**: Permission denied when writing
**Alert**: 🚫 PERMISSION DENIED: Cannot write to conversations/
**Immediate Actions**:
- Check directory ownership
- Verify write permissions
- Run as administrator if needed

### 3. Disk Space Errors
**Error**: Insufficient disk space
**Alert**: 💾 WARNING: Low disk space - Cannot save session
**Immediate Actions**:
- Free up disk space
- Choose different save location
- Archive old conversations

### 4. File Lock Errors
**Error**: File is locked by another process
**Alert**: 🔒 FILE LOCKED: Cannot access session file
**Immediate Actions**:
- Close other programs using the file
- Wait and retry
- Restart system if needed

## Alert Format
```
🚨 SESSION SAVE ERROR 🚨
Type: [Error Type]
Message: [Clear description]
Immediate Action: [What to do right now]
Follow-up: [Next steps if immediate action fails]
```

## Recovery Procedures
1. **Retry Mechanism**: Up to 3 automatic retries
2. **Fallback Location**: Try saving to temp directory
3. **Manual Intervention**: Provide clear manual steps
4. **Data Preservation**: Ensure conversation isn't lost

## Success Confirmation
```
✅ Session saved successfully
File: conversations/YYYY-MM-DD_session-N.txt
Size: [file size]
Modified: [timestamp]
```