# Student Leave Application Status Feature

## What's New

### For Students
Students can now see the status of their leave applications directly on their portal!

## Features Added

### 1. "My Leave Applications" Section
- Shows all leave applications submitted by the student
- Displays in reverse chronological order (newest first)
- Updates automatically every 10 seconds

### 2. Application Status Display
Each application shows:
- **Leave Type** (Duty Leave / Medical Leave)
- **Status** with color coding:
  - 🟡 **Pending** - Waiting for teacher approval
  - 🟢 **Approved** - Application approved
  - 🔴 **Rejected** - Application rejected
- **Date Range** - From date to To date
- **Reason** - Your submitted reason
- **Rejection Remarks** - If rejected, shows teacher's comments
- **Submission Time** - When you submitted the application

### 3. Real-time Updates
- Automatically fetches new status every 10 seconds
- After submitting a new application, the list refreshes immediately
- No need to reload the page

## How It Works

### Student View
1. Login to student portal (e.g., `armaanjo-login.html`)
2. Scroll to "My Leave Applications" section
3. See all your applications with current status
4. Submit new applications in "Submit Leave Application" section below
5. New applications appear immediately in the list with "pending" status

### Teacher Approval Flow
1. Teacher sees your application in their dashboard
2. Teacher reviews your document and details
3. Teacher clicks "Approve" or "Reject"
4. Your status updates automatically within 10 seconds
5. If rejected, you can see the teacher's reason

## Technical Details

### New API Endpoint Used
```
GET /api/attendance/leave-requests/:studentId
```
Returns all leave applications for a specific student.

### Status Colors
- **Pending**: Yellow/Orange background
- **Approved**: Green background
- **Rejected**: Red background

### Auto-refresh
- Leave applications list refreshes every 10 seconds
- Student attendance data refreshes every 5 seconds

## Testing

### Test the Feature
1. Login as student: `armaanjo` / `armaan123`
2. Submit a leave application
3. Check "My Leave Applications" section - should show as "pending"
4. Login as teacher: `pps-teacher` / `pps123`
5. Approve or reject the application
6. Go back to student portal - status should update automatically

### Server Status
- Server must be running: `cd rfid_backend && node server.js`
- Check status: Open `system-status-check.html`

## Files Modified
- `student-portal.html` - Added leave applications display section and fetch logic
- `system-status-check.html` - Updated to test student-specific endpoint

## No Changes Needed To
- Backend API (already supports student-specific requests)
- Teacher portal (already functional)
- Authentication system (already working)

Everything is ready to use! 🎉
