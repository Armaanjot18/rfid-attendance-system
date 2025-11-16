# Subject-Specific Attendance System

## Overview
Teachers now update attendance only for their specific subject. When a Math teacher adds manual attendance or duty leave, only the Mathematics attendance is affected on the student portal.

## How It Works:

### For Teachers:

1. **Login with Subject-Specific Credentials:**
   - **PPS Teacher**: Username: `pps-teacher`, Password: `pps123`
   - **Maths Teacher**: Username: `maths-teacher`, Password: `maths123`  
   - **Physics Teacher**: Username: `physics-teacher`, Password: `physics123`

2. **When Adding Manual Attendance or Duty Leave:**
   - The system automatically detects which subject you teach
   - Your entry only updates attendance for YOUR subject
   - Example: If Maths teacher marks attendance, only "Maths %" column in Excel updates

3. **What Updates:**
   - **PPS Teacher** → Updates: `PPS Total`, `PPS Attended`, `PPS %`
   - **Maths Teacher** → Updates: `Maths Total`, `Maths Attended`, `Maths %`
   - **Physics Teacher** → Updates: `Physics Total`, `Physics Attended`, `Physics %`

### Excel File Structure:

The `students.xlsx` file now has these columns:
- Student Name
- Student ID
- Department
- Last Access
- Total Classes (overall)
- Attended Classes (overall)
- Attendance % (overall)
- Prev Attendance % (overall)
- **PPS Total** ← New
- **PPS Attended** ← New
- **PPS %** ← New
- **Maths Total** ← New
- **Maths Attended** ← New
- **Maths %** ← New
- **Physics Total** ← New
- **Physics Attended** ← New
- **Physics %** ← New

### Student Portal:

Students see subject-specific attendance:
- **PPS**: Shows PPS attendance percentage
- **Mathematics**: Shows Maths attendance percentage
- **Physics**: Shows Physics attendance percentage

The student portal auto-refreshes every 5 seconds, so when any teacher updates attendance, students see the change immediately for that specific subject.

## Example Scenario:

1. **Math Teacher logs in** (username: `maths-teacher`)
2. **Selects a student** from the manual entry form
3. **Marks duty leave** for today
4. **System updates:**
   - `Maths Total`: 20 → 21
   - `Maths Attended`: 19 → 20
   - `Maths %`: 95% → 95.2%
5. **Student portal shows:**
   - Mathematics subject card updates to 95.2%
   - PPS and Physics remain unchanged
6. **Excel file** is updated with new Maths attendance values

## Testing:

1. **Start backend**: `cd rfid_backend; node server.js`
2. **Login as Maths Teacher**: Open `maths-teacher-login.html`
3. **Add manual attendance** for a student
4. **Open Excel file**: Check that only Maths columns updated
5. **Open student portal**: See Mathematics attendance updated
6. **Try with Physics Teacher**: Only Physics attendance updates

## API Endpoint:

New endpoint for subject-specific attendance:
```
POST /api/students/:id/subject-attendance
Body: {
  "subject": "Mathematics" | "PPS" | "Physics",
  "attendedClasses": 20,
  "totalClasses": 21
}
```

All changes are synchronized in real-time between:
- Teacher Dashboard
- Excel File
- Student Portal
