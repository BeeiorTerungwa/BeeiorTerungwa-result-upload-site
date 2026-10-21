// Pure functions: no DOM access, so they can be tested in Node.js.
const MATRIC_PATTERN = /^\d{2}\/\d{9}$/;
const COURSE_PATTERN = /^[A-Za-z]{3}\d{3}$/;

// Convert a score (0-100) to a letter grade.
function gradeFor(score) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

// Check one result entry and return an object of error messages (empty if valid).
function validateResult(entry, existing) {
  const errors = {};
  const name = (entry.name || '').trim();
  const matric = (entry.matric || '').trim();
  const course = (entry.course || '').trim().toUpperCase();
  const scoreText = String(entry.score === undefined ? '' : entry.score).trim();

  if (name.length < 3) errors.name = 'Name must be at least 3 characters.';

  if (!matric) errors.matric = 'Matric number is required.';
  else if (!MATRIC_PATTERN.test(matric)) errors.matric = 'Use the format 23/095244109.';

  if (!course) errors.course = 'Course code is required.';
  else if (!COURSE_PATTERN.test(course)) errors.course = 'Use a course code like CSC301.';

  if (scoreText === '') errors.score = 'Score is required.';
  else if (!/^\d+$/.test(scoreText) || Number(scoreText) > 100) errors.score = 'Score must be a whole number from 0 to 100.';

  if (!errors.matric && !errors.course && isDuplicate(existing, matric, course)) {
    errors.course = 'A result for this student and course already exists.';
  }
  return errors;
}

// True if the same matric number already has a result for the same course.
function isDuplicate(results, matric, course) {
  return results.some(r => r.matric === matric && r.course === course.toUpperCase());
}

// Build a clean result record from validated form values.
function buildResult(entry) {
  const score = Number(entry.score);
  return {
    name: entry.name.trim(),
    matric: entry.matric.trim(),
    course: entry.course.trim().toUpperCase(),
    score: score,
    grade: gradeFor(score)
  };
}

// Return all results for one matric number.
function findByMatric(results, matric) {
  return results.filter(r => r.matric === matric.trim());
}

// Average score of a list of results (0 if the list is empty).
function averageScore(results) {
  if (results.length === 0) return 0;
  let total = 0;
  for (const r of results) total += r.score;
  return Math.round((total / results.length) * 10) / 10;
}

if (typeof module !== 'undefined') {
  module.exports = { gradeFor, validateResult, isDuplicate, buildResult, findByMatric, averageScore };
}
