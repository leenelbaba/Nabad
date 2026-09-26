// Small date helpers shared by pages and the profile mock API.

// Today's date as "YYYY-MM-DD" in the user's local time zone.
// (toISOString() uses UTC, which can be a different day around midnight in Lebanon.)
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Age in whole years for a "YYYY-MM-DD" date of birth.
// We subtract the years, then take one off if this year's birthday hasn't happened yet.
export function calculateAge(dateOfBirth) {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - year;
  const birthdayPassed =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!birthdayPassed) {
    age -= 1;
  }
  return age;
}
