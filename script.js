// Browser code: reads the form, updates the page and saves data in the browser.
const STORAGE_KEY = 'resultUploadSite.results';
let results = loadResults();

const form = document.getElementById('resultForm');
const fields = ['name', 'matric', 'course', 'score'];
const statusBox = document.getElementById('status');
const summaryBox = document.getElementById('summary');
const body = document.getElementById('resultBody');
const emptyBox = document.getElementById('empty');
const countPill = document.getElementById('count');
const lookupInput = document.getElementById('lookupMatric');

// Load saved results from the browser (falls back to an empty list).
function loadResults() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

// Save the results array to the browser.
function saveResults() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    statusBox.textContent = 'Could not save results in this browser.';
  }
}

// Draw the table for the given list of results.
function render(list) {
  body.innerHTML = '';
  countPill.textContent = String(results.length);
  emptyBox.hidden = list.length > 0;

  list.forEach(function (r) {
    const tr = document.createElement('tr');
    [r.name, r.matric, r.course, String(r.score), r.grade].forEach(function (value, i) {
      const td = document.createElement('td');
      td.textContent = value; // textContent keeps user input from being run as HTML
      if (i === 4) td.className = 'grade grade-' + r.grade;
      tr.appendChild(td);
    });
    const action = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'link';
    btn.textContent = 'Remove';
    btn.addEventListener('click', function () { removeResult(r); });
    action.appendChild(btn);
    tr.appendChild(action);
    body.appendChild(tr);
  });
}

function removeResult(target) {
  results = results.filter(function (r) { return r !== target; });
  saveResults();
  render(results);
  summaryBox.textContent = '';
  statusBox.textContent = 'Removed ' + target.course + ' result for ' + target.matric + '.';
}

function clearErrors() {
  fields.forEach(function (f) { document.getElementById(f + 'Error').textContent = ''; });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  clearErrors();
  const entry = {};
  fields.forEach(function (f) { entry[f] = document.getElementById(f).value; });

  const errors = validateResult(entry, results);
  if (Object.keys(errors).length > 0) {
    fields.forEach(function (f) {
      if (errors[f]) document.getElementById(f + 'Error').textContent = errors[f];
    });
    statusBox.textContent = 'Please correct the highlighted fields.';
    return;
  }

  const result = buildResult(entry);
  results.push(result);
  saveResults();
  render(results);
  form.reset();
  statusBox.textContent = 'Uploaded ' + result.course + ' result for ' + result.name + ' (grade ' + result.grade + ').';
});

document.getElementById('lookupBtn').addEventListener('click', function () {
  const matric = lookupInput.value.trim();
  if (!matric) { summaryBox.textContent = 'Enter a matric number first.'; return; }
  const found = findByMatric(results, matric);
  render(found);
  summaryBox.textContent = found.length === 0
    ? 'No results found for ' + matric + '.'
    : found.length + ' result(s) for ' + matric + '. Average score: ' + averageScore(found) + '.';
});

document.getElementById('showAllBtn').addEventListener('click', function () {
  lookupInput.value = '';
  summaryBox.textContent = '';
  render(results);
});

document.getElementById('clearBtn').addEventListener('click', function () {
  if (results.length === 0) return;
  if (confirm('Remove all uploaded results?')) {
    results = [];
    saveResults();
    render(results);
    summaryBox.textContent = '';
    statusBox.textContent = 'All results cleared.';
  }
});

render(results);
