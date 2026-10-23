// Mock students and admins. Emails use example.com on purpose (not real people).
// No passwords are stored anywhere in the frontend.

export const studentsSeed = [
  { id: "stu-1001", name: "Priya Sharma", email: "priya.sharma@example.com", phone: "98220 14567", batch: "Oct 2026 Weekday", city: "Pune", status: "Active", joinedOn: "2026-09-01" },
  { id: "stu-1002", name: "Aditya Kulkarni", email: "aditya.kulkarni@example.com", phone: "99700 33218", batch: "Oct 2026 Weekday", city: "Pune", status: "Active", joinedOn: "2026-09-02" },
  { id: "stu-1003", name: "Sakshi Patil", email: "sakshi.patil@example.com", phone: "90110 42876", batch: "Sep 2026 Weekend", city: "Mumbai", status: "Active", joinedOn: "2026-08-20" },
  { id: "stu-1004", name: "Omkar Jadhav", email: "omkar.jadhav@example.com", phone: "97650 11094", batch: "Sep 2026 Weekend", city: "Nashik", status: "Active", joinedOn: "2026-08-22" },
  { id: "stu-1005", name: "Neha Shinde", email: "neha.shinde@example.com", phone: "88050 67231", batch: "Oct 2026 Weekday", city: "Pune", status: "Inactive", joinedOn: "2026-09-05" },
  { id: "stu-1006", name: "Rohit Deshpande", email: "rohit.deshpande@example.com", phone: "93250 77810", batch: "Aug 2026 Weekday", city: "Nagpur", status: "Active", joinedOn: "2026-08-01" },
  { id: "stu-1007", name: "Anjali Gaikwad", email: "anjali.gaikwad@example.com", phone: "70200 55642", batch: "Aug 2026 Weekday", city: "Kolhapur", status: "Active", joinedOn: "2026-08-03" },
  { id: "stu-1008", name: "Vikas More", email: "vikas.more@example.com", phone: "95030 28819", batch: "Sep 2026 Weekend", city: "Aurangabad", status: "Active", joinedOn: "2026-08-25" },
];

export const adminsSeed = [
  { id: "adm-01", name: "Shruti Kale", email: "admin@example.com", role: "ADMIN" },
];
