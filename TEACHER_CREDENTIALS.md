# Teacher Login Credentials

## All teachers use the SAME INTERFACE (teacher-data-access.html)

### Teacher Credentials:

1. **PPS Teacher (Programming for Problem Solving)**
   - Login Page: `pps-teacher-login.html`
   - Username: `pps-teacher`
   - Password: `pps123`
   - Subject: PPS
   - Department: Computer Science

2. **Mathematics Teacher**
   - Login Page: `maths-teacher-login.html`
   - Username: `maths-teacher`
   - Password: `maths123`
   - Subject: Mathematics
   - Department: Mathematics

3. **Physics Teacher**
   - Login Page: `physics-teacher-login.html`
   - Username: `physics-teacher`
   - Password: `physics123`
   - Subject: Physics
   - Department: Physics

4. **Science Teacher (Original)**
   - Login Page: `applied-science-login.html`
   - Username: `science-user`
   - Password: `password`
   - Subject: Science
   - Department: Applied Science

---

## How It Works:

1. Each teacher has their own login page with unique styling
2. All teachers are redirected to the SAME dashboard: `teacher-data-access.html`
3. The dashboard displays: "Welcome, [Teacher Name] - [Subject] Teacher"
4. All teachers can:
   - View all students from the Excel file
   - Add new students
   - Update student records
   - Delete students
   - Export data to CSV/PDF
   - View AI predictions for at-risk students
5. All changes are saved to `students.xlsx` in real-time
6. The frontend auto-refreshes every 5 seconds to show Excel updates
7. Student portal automatically reflects all changes made by any teacher

---

## Files Created:
- `pps-teacher-login.html` - PPS teacher login (orange theme)
- `maths-teacher-login.html` - Maths teacher login (purple theme)
- `physics-teacher-login.html` - Physics teacher login (orange theme)

## Files Modified:
- `rfid_backend/routes/auth.js` - Added 3 new teacher accounts
- `teacher-data-access.html` - Updated to show teacher's subject in welcome message
- `rfid_backend/utils/excelHandler.js` - Now uses root-level students.xlsx

---

## Testing:

1. Start backend: `cd rfid_backend; node server.js`
2. Open any teacher login page in browser
3. Login with credentials above
4. All teachers will see the same dashboard interface
5. Any changes made will update students.xlsx
6. Changes will appear in student portal automatically
