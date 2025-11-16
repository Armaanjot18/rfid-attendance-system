# Leave Request System

## Overview
The Leave Request System allows students to submit leave applications with supporting documents (PDF files) that teachers can view, approve, or reject from their dashboard.

## Features

### For Students
1. **Submit Leave Requests**
   - Navigate to student portal after login
   - Fill out the "Submit Leave Application" form
   - Select leave type (Medical/Duty)
   - Specify date range (From - To)
   - Provide reason for leave
   - Upload supporting document (PDF, images, etc.)
   - Click "Submit Application"

2. **File Upload**
   - System accepts all common file types (PDF, JPG, PNG, etc.)
   - Files are converted to base64 and stored with the request
   - Maximum file size depends on browser limitations (typically up to 10MB)

### For Teachers
1. **View Leave Requests**
   - Login to teacher dashboard
   - Scroll to "Pending Leave Requests" panel
   - See all pending leave applications with:
     - Student name
     - Leave type (Medical/Duty) with color coding
     - Date range
     - Reason for leave
     - Upload time

2. **Download Documents**
   - Click "📄 Download Document" button
   - File downloads with original filename
   - View/verify supporting documentation

3. **Approve/Reject Requests**
   - Click "✓ Approve" to approve the request
   - Click "✗ Reject" to reject (will prompt for optional reason)
   - Status updates immediately
   - Approved/rejected requests are removed from pending list

## Technical Details

### API Endpoints

#### Submit Leave Request
```
POST /api/attendance/leave
Headers: Authorization: Bearer <token>
Body: {
  studentId: string,
  studentName: string,
  startDate: string (YYYY-MM-DD),
  endDate: string (YYYY-MM-DD),
  reason: string,
  type: string (medical|duty),
  documentData: string (base64),
  documentName: string
}
```

#### Get All Leave Requests
```
GET /api/attendance/leave-requests
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  count: number,
  data: [leaveRequest...]
}
```

#### Get Leave Requests by Student
```
GET /api/attendance/leave-requests/:studentId
Headers: Authorization: Bearer <token>
```

#### Update Leave Status
```
PUT /api/attendance/leave-requests/:id
Headers: Authorization: Bearer <token>
Body: {
  status: string (approved|rejected),
  remarks: string (optional)
}
```

### Data Storage
- Leave requests are currently stored in memory (`leaveRequests` array)
- For production, consider migrating to:
  - Excel file (using existing excelHandler)
  - Database (MongoDB, PostgreSQL, etc.)
  - JSON file with fs module

### Auto-Refresh
- Teacher dashboard auto-refreshes leave requests every 10 seconds
- Ensures teachers see new submissions in real-time

## Student Login Credentials

| Student Name | Username | Password | Student ID |
|--------------|----------|----------|------------|
| Armaanjot Singh | armaanjo | armaan123 | STU-8814 |
| Prabhdeep Singh | prabhdeep | prabh123 | STU-7743 |
| Rajveer Singh | rajveer | rajveer123 | STU-7655 |

## Teacher Login Credentials

| Teacher | Username | Password | Subject |
|---------|----------|----------|---------|
| PPS Teacher | pps-teacher | pps123 | PPS |
| Mathematics Teacher | maths-teacher | maths123 | Mathematics |
| Physics Teacher | physics-teacher | physics123 | Physics |

## Testing the System

### Test as Student
1. Open `armaanjo-login.html` (or any student login page)
2. Login with credentials
3. Scroll to "Submit Leave Application" section
4. Fill out form:
   - Leave Type: Duty
   - From: Today's date
   - To: Tomorrow's date
   - Reason: "Attending university workshop"
   - Upload: Any PDF or image file
5. Click "Submit Application"
6. Check for success message

### Test as Teacher
1. Open `pps-teacher-login.html` (or any teacher login page)
2. Login with credentials
3. Navigate to teacher dashboard (`teacher-data-access.html`)
4. Scroll to "Pending Leave Requests" panel
5. Verify the student's request appears
6. Click "Download Document" to verify file download
7. Click "Approve" or "Reject" to update status
8. Verify request disappears from pending list

## Future Enhancements
- [ ] Add leave history view for students
- [ ] Email notifications when status changes
- [ ] Integration with calendar/attendance system
- [ ] File size validation and restrictions
- [ ] Multiple file uploads per request
- [ ] Leave balance tracking
- [ ] Export leave reports
- [ ] Mobile-responsive improvements
