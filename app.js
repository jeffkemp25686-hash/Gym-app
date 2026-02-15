// --------------------------
// RUN COMPLETION CHECK (LOCK FINISH BUTTON)
// --------------------------
function runKey(date, field) {
  return `run_${date}_${field}`;
}

// Run is "logged" ONLY if today's distance + time exist (prevents carryover)
function isRunLogged() {
  const distance = (localStorage.getItem("run_distance") || "").trim();
  const time = (localStorage.getItem("run_time") || "").trim();
  const date = todayDateStr();
  const distance = (localStorage.getItem(runKey(date, "distance")) || "").trim();
  const time = (localStorage.getItem(runKey(date, "time")) || "").trim();
return !!(distance && time);
}


// --------------------------
// PROGRAM STRUCTURE
// --------------------------
@@ -415,20 +422,23 @@
// RUN TAB (NO RE-RENDER TYPING)
// --------------------------
function renderRun() {
  const distance = localStorage.getItem("run_distance") || "";
  const time = localStorage.getItem("run_time") || "";
  const effort = localStorage.getItem("run_effort") || "Easy";
  const notes = localStorage.getItem("run_notes") || "";
  const date = todayDateStr();

  const distance = localStorage.getItem(runKey(date, "distance")) || "";
  const time = localStorage.getItem(runKey(date, "time")) || "";
  const effort = localStorage.getItem(runKey(date, "effort")) || "Easy";
  const notes = localStorage.getItem(runKey(date, "notes")) || "";

app.innerHTML = `
   <div class="card">
     <h2>Run Log</h2>
      <p style="color:#666;margin-top:-6px;">Saving for: <strong>${date}</strong></p>

     <label>Distance (km)</label>
      <input id="runDistance" value="${distance}">
      <input id="runDistance" value="${distance}" inputmode="decimal">

     <label>Time (mm:ss)</label>
      <input id="runTime" placeholder="28:30" value="${time}">
      <input id="runTime" placeholder="28:30" value="${time}" inputmode="text">

     <label>Effort</label>
     <select id="runEffort">
@@ -458,27 +468,29 @@
paceDisplay.textContent = pace || "--";
}

  // Save LIVE to today’s keys (no carryover to future run days)
distInput.addEventListener("input", () => {
    localStorage.setItem("run_distance", distInput.value);
    localStorage.setItem(runKey(date, "distance"), distInput.value);
updatePace();
});

timeInput.addEventListener("input", () => {
    localStorage.setItem("run_time", timeInput.value);
    localStorage.setItem(runKey(date, "time"), timeInput.value);
updatePace();
});

effortSelect.addEventListener("change", () => {
    localStorage.setItem("run_effort", effortSelect.value);
    localStorage.setItem(runKey(date, "effort"), effortSelect.value);
});

notesInput.addEventListener("input", () => {
    localStorage.setItem("run_notes", notesInput.value);
    localStorage.setItem(runKey(date, "notes"), notesInput.value);
});

updatePace();
}


// --------------------------
// RUN SYNC (HISTORY ROWS, NEVER OVERWRITE)
// Sheet tab: "Runs"
@@ -487,18 +499,22 @@
// --------------------------
async function syncRun() {
const ts = new Date().toISOString();
  const date = todayDateStr();

  const distance = localStorage.getItem("run_distance") || "";
  const time = localStorage.getItem("run_time") || "";
  const effort = localStorage.getItem("run_effort") || "";
  const notes = localStorage.getItem("run_notes") || "";
  const distance = (localStorage.getItem(runKey(date, "distance")) || "").trim();
  const time = (localStorage.getItem(runKey(date, "time")) || "").trim();
  const effort = (localStorage.getItem(runKey(date, "effort")) || "").trim();
  const notes = (localStorage.getItem(runKey(date, "notes")) || "").trim();

const pace = calculatePace(distance, time);
  if (!distance && !time) return;
  if (!distance || !time) return;

  // Unique RowID = every run keeps history
const rowId = `${ATHLETE}|RUN|${ts}`;

const runRows = [[rowId, ts, ATHLETE, distance, time, effort, notes, pace]];

  // Save locally for graphs/history
runRows.forEach((r) => upsertRowIntoHistory(RUNS_LOG_KEY, r));

const payload = JSON.stringify({
@@ -518,479 +534,489 @@
headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
body: "payload=" + encodeURIComponent(payload),
});

if (el) el.textContent = "✅ Run synced!";

    // ✅ Reset the Run tab inputs AFTER sync so it doesn't carry over.
    // (Keeps the saved run for today's date, but clears the form for next time she opens Run tab)
    localStorage.removeItem(runKey(date, "distance"));
    localStorage.removeItem(runKey(date, "time"));
    localStorage.removeItem(runKey(date, "effort"));
    localStorage.removeItem(runKey(date, "notes"));

    // Refresh Run tab + unlock Finish Workout if on run day
    renderRun();
    renderToday();
} catch (err) {
console.error(err);
if (el) el.textContent = "❌ Sync failed.";
}

  // unlock Finish Workout on run days
  renderToday();
}
window.syncRun = syncRun;


// --------------------------
// NUTRITION TAB (DAILY HABITS + STEPS)
// --------------------------
function renderNutrition() {
const date = localStorage.getItem("nutri_date") || todayDateStr();
const key = (k) => `nutri_${date}_${k}`;

const energy = localStorage.getItem(key("energy")) || "";
const notes = localStorage.getItem(key("notes")) || "";

app.innerHTML = `
   <div class="card">
     <h2>Nutrition (Daily Check)</h2>

     <div style="background:#f7f7f7;border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
       <h3 style="margin:0 0 8px 0;">Today's Targets</h3>

       <strong>Protein:</strong> ${NUTRITION_TARGETS.protein_g}g<br>
       <small style="color:#555;">Protein every meal + snack</small><br><br>

       <strong>Water:</strong> ${NUTRITION_TARGETS.water_l_min}-${NUTRITION_TARGETS.water_l_max}L<br>
       <small style="color:#555;">Add extra on run days</small><br><br>

       <strong>Veg:</strong> ${NUTRITION_TARGETS.veg_serves}+ serves<br>
       <small style="color:#555;">2 fists veg lunch + dinner</small><br><br>

       <strong>Steps:</strong> ${NUTRITION_TARGETS.steps.toLocaleString()}+
     </div>

     <div style="background:#fff;border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
       <h3 style="margin:0 0 8px 0;">Protein Cheatsheet 🍗</h3>
       <div style="line-height:1.6;color:#444;">
         <strong>≈30g protein examples:</strong><br>
         ✅ 150g chicken breast<br>
         ✅ 200g Greek yogurt<br>
         ✅ Whey shake + milk<br>
         ✅ 4 eggs + egg whites<br>
         ✅ 150g lean beef<br>
         ✅ Tuna + rice cakes<br><br>
         <small style="color:#666;">
           Goal = ~4 protein feeds/day → hits ${NUTRITION_TARGETS.protein_g}g automatically.
         </small>
       </div>
     </div>

     <label>Date</label>
     <input id="nutriDate" type="date" value="${date}" />

     <hr style="margin:12px 0;">

     <div style="display:flex;gap:10px;flex-wrap:wrap;">
       <button id="btnProtein" type="button"></button>
       <button id="btnWater" type="button"></button>
       <button id="btnVeg" type="button"></button>
       <button id="btnSteps" type="button"></button>
     </div>

     <div style="margin-top:12px;">
       <label>Steps (optional number)</label>
       <input id="nutriStepsCount" placeholder="e.g. 10350">
     </div>

     <div style="margin-top:12px;">
       <label>Energy (1–5)</label>
       <input id="nutriEnergy" inputmode="numeric" placeholder="1–5" value="${energy}">
     </div>

     <div style="margin-top:8px;">
       <label>Notes</label>
       <input id="nutriNotes" placeholder="Hunger/sleep/stress etc" value="${notes}">
     </div>

     <div style="margin-top:12px;">
       <button onclick="syncNutrition()">Sync Nutrition to Coach 🍎</button>
       <p id="nutriSyncStatus" style="color:#666;"></p>
     </div>

     <p style="color:green;">✓ Auto saved</p>
   </div>
 `;

const nutriDate = document.getElementById("nutriDate");
const btnProtein = document.getElementById("btnProtein");
const btnWater = document.getElementById("btnWater");
const btnVeg = document.getElementById("btnVeg");
const btnSteps = document.getElementById("btnSteps");

const inpStepsCount = document.getElementById("nutriStepsCount");
const inpEnergy = document.getElementById("nutriEnergy");
const inpNotes = document.getElementById("nutriNotes");

function setBtn(btn, label, val) {
const yes = val === "Yes";
btn.textContent = `${label} ${yes ? "✅" : "❌"}`;
btn.style.background = yes ? "#111" : "#fff";
btn.style.color = yes ? "#fff" : "#111";
btn.style.border = "1px solid #111";
}

function toggle(field) {
const cur = localStorage.getItem(key(field)) || "No";
localStorage.setItem(key(field), cur === "Yes" ? "No" : "Yes");
refresh();
}

function refresh() {
setBtn(btnProtein, "Protein", localStorage.getItem(key("protein")) || "No");
setBtn(btnWater, "Water", localStorage.getItem(key("water")) || "No");
setBtn(btnVeg, "Veg", localStorage.getItem(key("veg")) || "No");
setBtn(btnSteps, "Steps", localStorage.getItem(key("steps")) || "No");
inpStepsCount.value = localStorage.getItem(key("stepsCount")) || "";
}

nutriDate.addEventListener("change", () => {
localStorage.setItem("nutri_date", nutriDate.value);
renderNutrition();
});

btnProtein.onclick = () => toggle("protein");
btnWater.onclick = () => toggle("water");
btnVeg.onclick = () => toggle("veg");
btnSteps.onclick = () => toggle("steps");

inpStepsCount.oninput = () => localStorage.setItem(key("stepsCount"), inpStepsCount.value);
inpEnergy.oninput = () => localStorage.setItem(key("energy"), inpEnergy.value);
inpNotes.oninput = () => localStorage.setItem(key("notes"), inpNotes.value);

refresh();
}

// --------------------------
// BODY TAB
// --------------------------
function renderBody() {
const date = localStorage.getItem("body_date") || todayDateStr();
const key = (k) => `body_${date}_${k}`;

const weight = localStorage.getItem(key("weight")) || "";
const waist = localStorage.getItem(key("waist")) || "";
const hips = localStorage.getItem(key("hips")) || "";
const notes = localStorage.getItem(key("notes")) || "";

app.innerHTML = `
   <div class="card">
     <h2>Body Tracking</h2>

     <div style="background:#f7f7f7;border:1px solid #ddd;border-radius:12px;padding:12px;margin-bottom:12px;">
       <strong>Coach Goal</strong><br>
       Lean muscle gain while improving 5K endurance.<br>
       Track weekly trends — not daily fluctuations.
     </div>

     <label>Date</label>
     <input id="bodyDate" type="date" value="${date}">

     <label>Bodyweight (kg)</label>
     <input id="bodyWeight" placeholder="56.0" value="${weight}">

     <label>Waist (cm)</label>
     <input id="bodyWaist" placeholder="Optional" value="${waist}">

     <label>Hips (cm)</label>
     <input id="bodyHips" placeholder="Optional" value="${hips}">

     <label>Notes</label>
     <input id="bodyNotes" placeholder="Sleep, cycle, stress etc" value="${notes}">

     <button onclick="syncBody()">Sync Body to Coach 📊</button>
     <p id="bodySyncStatus" style="color:#666;"></p>

     <p style="color:green;">✓ Auto saved</p>
   </div>
 `;

const dateInput = document.getElementById("bodyDate");
const weightInput = document.getElementById("bodyWeight");
const waistInput = document.getElementById("bodyWaist");
const hipsInput = document.getElementById("bodyHips");
const notesInput = document.getElementById("bodyNotes");

dateInput.addEventListener("change", () => {
localStorage.setItem("body_date", dateInput.value);
renderBody();
});

weightInput.oninput = () => localStorage.setItem(key("weight"), weightInput.value);
waistInput.oninput = () => localStorage.setItem(key("waist"), waistInput.value);
hipsInput.oninput = () => localStorage.setItem(key("hips"), hipsInput.value);
notesInput.oninput = () => localStorage.setItem(key("notes"), notesInput.value);
}

// --------------------------
// NUTRITION SYNC
// Sheet tab: "Nutrition"
// Headers recommended:
// RowID | Date | Athlete | Protein | Water | Veg | Steps | StepsCount | Energy | Notes | Timestamp
// --------------------------
async function syncNutrition() {
const ts = new Date().toISOString();
const date = localStorage.getItem("nutri_date") || todayDateStr();
const key = (k) => `nutri_${date}_${k}`;

const protein = localStorage.getItem(key("protein")) || "No";
const water = localStorage.getItem(key("water")) || "No";
const veg = localStorage.getItem(key("veg")) || "No";
const steps = localStorage.getItem(key("steps")) || "No";
const stepsCount = (localStorage.getItem(key("stepsCount")) || "").trim();
const energy = (localStorage.getItem(key("energy")) || "").trim();
const notes = (localStorage.getItem(key("notes")) || "").trim();

const rowId = `${ATHLETE}|NUTRITION|${date}`;

const nutritionRows = [[
rowId, date, ATHLETE, protein, water, veg, steps, stepsCount, energy, notes, ts
]];

nutritionRows.forEach((r) => upsertRowIntoHistory(NUTRI_LOG_KEY, r));

const payload = JSON.stringify({
setRows: [],
runRows: [],
nutritionRows,
bodyRows: [],
});

const el = document.getElementById("nutriSyncStatus");
if (el) el.textContent = "Syncing…";

try {
await fetch(SHEETS_URL, {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
body: "payload=" + encodeURIComponent(payload),
});
if (el) el.textContent = "✅ Nutrition synced!";
} catch (err) {
console.error(err);
if (el) el.textContent = "❌ Sync failed.";
}
}
window.syncNutrition = syncNutrition;

// --------------------------
// BODY SYNC
// Sheet tab: "Body"
// Headers recommended:
// RowID | Date | Athlete | WeightKg | WaistCm | HipsCm | Notes | Timestamp
// --------------------------
async function syncBody() {
const ts = new Date().toISOString();
const date = localStorage.getItem("body_date") || todayDateStr();
const key = (k) => `body_${date}_${k}`;

const weight = (localStorage.getItem(key("weight")) || "").trim();
const waist = (localStorage.getItem(key("waist")) || "").trim();
const hips = (localStorage.getItem(key("hips")) || "").trim();
const notes = (localStorage.getItem(key("notes")) || "").trim();

if (!weight && !waist && !hips) return;

const rowId = `${ATHLETE}|BODY|${date}`;

const bodyRows = [[rowId, date, ATHLETE, weight, waist, hips, notes, ts]];
bodyRows.forEach((r) => upsertRowIntoHistory(BODY_LOG_KEY, r));

const payload = JSON.stringify({
setRows: [],
runRows: [],
nutritionRows: [],
bodyRows,
});

const el = document.getElementById("bodySyncStatus");
if (el) el.textContent = "Syncing…";

try {
await fetch(SHEETS_URL, {
method: "POST",
mode: "no-cors",
headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
body: "payload=" + encodeURIComponent(payload),
});

if (el) el.textContent = "✅ Body stats synced!";
} catch (err) {
console.error(err);
if (el) el.textContent = "❌ Sync failed.";
}
}
window.syncBody = syncBody;

// --------------------------
// PROGRESS TAB (SUMMARY + CHARTS)
// --------------------------
function loadChartJs() {
return new Promise((resolve, reject) => {
if (window.Chart) return resolve();
const s = document.createElement("script");
s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
s.onload = resolve;
s.onerror = () => reject(new Error("Chart.js failed to load"));
document.head.appendChild(s);
});
}

function lastNDates(n) {
const out = [];
const d = new Date();
for (let i = 0; i < n; i++) {
const x = new Date(d);
x.setDate(d.getDate() - i);
out.push(x.toISOString().slice(0, 10));
}
return out.reverse();
}

let runChartInst = null;
let strengthChartInst = null;

function renderProgress() {
app.innerHTML = `
   <div class="card">
     <h2>Progress</h2>

     <div style="background:#f7f7f7;border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
       <h3 style="margin:0 0 8px 0;">Last 7 Days (Habits)</h3>
       <div id="habitSummary" style="line-height:1.7;color:#333;"></div>
     </div>

     <div style="border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
       <h3 style="margin:0 0 8px 0;">Run Pace Trend</h3>
       <canvas id="runPaceChart" height="180"></canvas>
     </div>

     <div style="border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0;">
       <h3 style="margin:0 0 8px 0;">Strength Trend</h3>
       <label>Select exercise</label>
       <select id="exSelect" style="padding:8px;min-width:220px;"></select>
       <canvas id="strengthChart" height="180" style="margin-top:10px;"></canvas>
     </div>

     <p style="color:#666;font-size:13px;">
       Tip: If charts look empty, do 1 sync for Sets/Run/Nutrition/Body so history is stored.
     </p>
   </div>
 `;

renderHabitSummary();
renderCharts();
}

function renderHabitSummary() {
const dates = lastNDates(7);
const keyFor = (date, k) => `nutri_${date}_${k}`;

let proteinYes = 0, waterYes = 0, vegYes = 0, stepsYes = 0;

dates.forEach((date) => {
if ((localStorage.getItem(keyFor(date, "protein")) || "No") === "Yes") proteinYes++;
if ((localStorage.getItem(keyFor(date, "water")) || "No") === "Yes") waterYes++;
if ((localStorage.getItem(keyFor(date, "veg")) || "No") === "Yes") vegYes++;
if ((localStorage.getItem(keyFor(date, "steps")) || "No") === "Yes") stepsYes++;
});

const el = document.getElementById("habitSummary");
if (!el) return;

el.innerHTML = `
   Protein: <strong>${proteinYes}/7</strong><br>
   Water: <strong>${waterYes}/7</strong><br>
   Veg: <strong>${vegYes}/7</strong><br>
   Steps: <strong>${stepsYes}/7</strong>
 `;
}

async function renderCharts() {
try {
await loadChartJs();
} catch (e) {
console.error(e);
return;
}

// ===== RUN PACE CHART =====
const runRows = getLogArr(RUNS_LOG_KEY);
const runLabels = runRows.map((r) => String(r[1] || "").slice(0, 10));
const runPaceMin = runRows.map((r) => {
const dist = parseFloat(r[3]);
const mins = timeToMinutes(r[4]);
if (!dist || mins == null) return null;
return mins / dist;
});

const runCtx = document.getElementById("runPaceChart")?.getContext("2d");
if (runCtx) {
if (runChartInst) runChartInst.destroy();
runChartInst = new Chart(runCtx, {
type: "line",
data: {
labels: runLabels,
datasets: [{ label: "Pace (min/km)", data: runPaceMin, spanGaps: true, tension: 0.25 }],
},
options: { responsive: true, plugins: { legend: { display: true } } },
});
}

// ===== STRENGTH CHART =====
const exSelect = document.getElementById("exSelect");
if (!exSelect) return;

const names = [];
program.forEach((day) =>
day.exercises.forEach((ex) => {
if (!names.includes(ex.name) && ex.sets > 1) names.push(ex.name);
})
);

exSelect.innerHTML = names.map((n) => `<option value="${n}">${n}</option>`).join("");
exSelect.value = exSelect.value || names[0] || "";

function drawStrength(exName) {
const setRows = getLogArr(SETS_LOG_KEY);

const map = new Map(); // date -> {sum,count}
setRows.forEach((r) => {
if (String(r[4]) !== exName) return;
const date = String(r[1] || "").slice(0, 10);
const w = parseFloat(r[7]);
if (!date || !Number.isFinite(w)) return;

if (!map.has(date)) map.set(date, { sum: 0, count: 0 });
const o = map.get(date);
o.sum += w;
o.count += 1;
});

const dates = [...map.keys()].sort();
const avg = dates.map((d) => {
const o = map.get(d);
return o.count ? o.sum / o.count : null;
});

const ctx = document.getElementById("strengthChart")?.getContext("2d");
if (!ctx) return;

if (strengthChartInst) strengthChartInst.destroy();
strengthChartInst = new Chart(ctx, {
type: "line",
data: {
labels: dates,
datasets: [{ label: `${exName} avg weight (kg)`, data: avg, spanGaps: true, tension: 0.25 }],
},
options: { responsive: true, plugins: { legend: { display: true } } },
});
}

drawStrength(exSelect.value);
exSelect.addEventListener("change", () => drawStrength(exSelect.value));
}
window.renderProgress = renderProgress;

// --------------------------
// INITIAL LOAD
// --------------------------
