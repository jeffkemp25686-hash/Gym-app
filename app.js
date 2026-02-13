// ==========================
// ALANA TRAINING APP v1
// UI FOUNDATION
// ==========================

const app = document.getElementById("app");

// ---------- NAVIGATION ----------
function showTab(tab){

  if(tab === "today") renderToday();
  if(tab === "run") renderRun();
  if(tab === "nutrition") renderNutrition();
  if(tab === "progress") renderProgress();

}

window.showTab = showTab;


// ---------- TODAY ----------
function renderToday(){
  app.innerHTML = `
    <div class="card">
      <h2>Today's Workout</h2>
      <p>Lower Body Strength</p>

      <label>Back Squat Weight</label>
      <input placeholder="kg">

      <label>RPE</label>
      <input placeholder="1–10">

      <button>Save Workout</button>
    </div>
  `;
}


// ---------- RUN ----------
function renderRun(){
  app.innerHTML = `
    <div class="card">
      <h2>Running</h2>
      <p>Target: Easy Run</p>

      <label>Run Time</label>
      <input placeholder="28:30">

      <button>Save Run</button>
    </div>
  `;
}


// ---------- NUTRITION ----------
function renderNutrition(){
  app.innerHTML = `
    <div class="card">
      <h2>Daily Nutrition Check</h2>

      <label>Protein Goal Hit?</label>
      <button>✅ Yes</button>

      <label>Water Goal Hit?</label>
      <button>✅ Yes</button>

      <label>Vegetables Today?</label>
      <button>✅ Yes</button>

      <label>Energy Level (1-5)</label>
      <input placeholder="1–5">
    </div>
  `;
}


// ---------- PROGRESS ----------
function renderProgress(){
  app.innerHTML = `
    <div class="card">
      <h2>Progress</h2>
      <p>Graphs coming next step.</p>
    </div>
  `;
}


// INITIAL LOAD
renderToday();
