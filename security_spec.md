# Security Specification - The Academy ERP

## Data Invariants
1. **Identity Integrity**: A user can only access their own private profile data.
2. **Role-Based Authority**: 
    - Only `ADMIN` can create or modify `User` profiles and `Timetable` slots.
    - Only `TEACHER` can record `Attendance` and `Marks`.
    - `STUDENT` can only submit `Feedback` and read their own `Attendance`/`Marks`.
3. **Temporal Integrity**: All logs (Announcements, Feedback) must use server-side timestamps.
4. **Relational Consistency**: Attendance and Marks must reference valid scholarly IDs.

## The "Dirty Dozen" Payloads (Deny List)
1. **Self-Promotion**: Student trying to set `role: "ADMIN"` on their profile.
2. **Grade Injection**: Student trying to write to the `marks` collection.
3. **History Alteration**: Student trying to change `attDate` on an existing attendance record.
4. **Ghost Announcement**: Faculty member trying to post an announcement without `ADMIN` role.
5. **Schedule Sabotage**: Student trying to delete a `timetable` slot.
6. **Identity Spoofing**: User trying to create a profile with a `userId` different from their auth UID.
7. **Cross-User Leak**: Student A trying to read Student B's attendance via a direct document GET.
8. **Feedback Spam**: Student trying to submit feedback without a valid `subjectId`.
9. **Status Hijack**: Student trying to change their own status to `ACTIVE` if an admin disabled them.
10. **Shadow Field**: Any user trying to add `isVerified: true` to a profile (not in schema).
11. **Massive Payload**: Attempting to send a 2MB string in the `remarks` field of attendance.
12. **Future Log**: User trying to set `createdAt` to a future date instead of `request.time`.

## Rules Implementation Strategy
- Use `isValidUser()`, `isValidAttendance()`, etc. helpers.
- Use `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role` for RBAC.
- Separate `users` into `public` and `private` if PII is added (currently standard fields).
