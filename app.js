// Pediatric Dose Calculator - Main Application Logic
'use strict';

// MEDICATION DATABASE
const CATEGORIES = [
  {
    id: "analgesics",
    name: "Analgesics / Antipyretics",
    hint: "Fever & pain management",
    items: [
      {
        id: "paracetamol",
        common: true,
        name: "Paracetamol (Acetaminophen)",
        method: "mgkg_range",
        mgkg_low: 10,
        mgkg_high: 15,
        min_m: 0,
        max_m: 216,
        max_mg: 1000,
        conc_mg_per_ml: 24,
        freq: "Every 4–6 hours PRN (max 4 doses/day)",
        notes: "Max single dose 1g. Max daily: 60-75 mg/kg/day or 4g. Check formulation strength."
      },
      {
        id: "ibuprofen",
        common: true,
        name: "Ibuprofen",
        method: "mgkg_single",
        mgkg: 10,
        min_m: 6,
        max_m: 216,
        max_mg: 600,
        conc_mg_per_ml: 20,
        freq: "Every 6–8 hours PRN",
        notes: "Not <6 months. Avoid in dehydration/renal disease. Max daily: 40 mg/kg/day or 2400mg."
      }
    ]
  },
  {
    id: "antibiotics",
    name: "Antibiotics",
    hint: "Common infections",
    items: [
      {
        id: "amoxicillin",
        common: true,
        name: "Amoxicillin",
        method: "mgkg_single",
        mgkg: 15,
        min_m: 6,
        max_m: 216,
        max_mg: 1000,
        conc_mg_per_ml: 50,
        freq: "Every 8 hours",
        notes: "Dose varies by indication. 25-45 mg/kg/day for OM; 50-90 mg/kg/day for pneumonia."
      },
      {
        id: "amox_clav",
        common: true,
        name: "Amoxicillin/Clavulanate",
        method: "mgkg_single",
        mgkg: 15,
        min_m: 6,
        max_m: 216,
        max_mg: 875,
        conc_mg_per_ml: 42.9,
        freq: "Every 8–12 hours",
        notes: "Dosed on amoxicillin component. Limit clavulanate <10 mg/kg/dose. GI upset common."
      },
      {
        id: "azithromycin",
        common: true,
        name: "Azithromycin",
        method: "mgkg_single",
        mgkg: 10,
        min_m: 6,
        max_m: 216,
        max_mg: 500,
        conc_mg_per_ml: 40,
        freq: "Once daily × 3-5 days",
        notes: "Day 1: 10 mg/kg (max 500mg). Days 2-5: 5 mg/kg (max 250mg)."
      },
      {
        id: "cephalexin",
        common: false,
        name: "Cephalexin",
        method: "mgkg_single",
        mgkg: 12.5,
        min_m: 6,
        max_m: 216,
        max_mg: 500,
        conc_mg_per_ml: 50,
        freq: "Every 6–8 hours",
        notes: "Total daily 25-50 mg/kg/day divided. For skin/soft tissue, UTI."
      },
      {
        id: "cefuroxime",
        common: false,
        name: "Cefuroxime",
        method: "tiered_mgkg",
        tiers: [
          { min_m: 12, max_m: 23, mgkg: 10 },
          { min_m: 24, max_m: 216, mgkg: 15 }
        ],
        min_m: 12,
        max_m: 216,
        max_mg: 500,
        conc_mg_per_ml: 25,
        freq: "Every 12 hours",
        notes: "<2y = 10 mg/kg/dose; ≥2y = 15 mg/kg/dose. Take with food."
      },
      {
        id: "metronidazole",
        common: false,
        name: "Metronidazole",
        method: "mgkg_single",
        mgkg: 7.5,
        min_m: 6,
        max_m: 216,
        max_mg: 500,
        conc_mg_per_ml: 40,
        freq: "Every 8 hours",
        notes: "Anaerobic coverage. Metallic taste. Avoid alcohol. 30-50 mg/kg/day varies by indication."
      },
      {
        id: "erythromycin",
        common: false,
        name: "Erythromycin",
        method: "mgkg_single",
        mgkg: 10,
        min_m: 6,
        max_m: 216,
        max_mg: 500,
        conc_mg_per_ml: 40,
        freq: "Every 6 hours",
        notes: "GI side effects common. Check drug interactions (CYP3A4). Alternative for penicillin allergy."
      }
    ]
  },
  {
    id: "allergy",
    name: "Allergy / Antihistamines",
    hint: "Age restrictions apply",
    items: [
      {
        id: "cetirizine",
        common: true,
        name: "Cetirizine",
        method: "mgkg_single",
        mgkg: 0.25,
        min_m: 6,
        max_m: 216,
        max_mg: 10,
        conc_mg_per_ml: 1,
        freq: "Once daily",
        notes: "6mo-2y: 2.5mg; 2-6y: 2.5-5mg; >6y: 5-10mg daily. Less sedating."
      },
      {
        id: "chlorpheniramine",
        common: true,
        name: "Chlorpheniramine",
        method: "mgkg_single",
        mgkg: 0.1,
        min_m: 24,
        max_m: 216,
        max_mg: 4,
        conc_mg_per_ml: 0.4,
        freq: "Every 6–8 hours PRN",
        notes: "NOT <2 years. Sedation, anticholinergic effects. Caution with other sedatives."
      },
      {
        id: "cough_combo",
        common: true,
        name: "Cough/Cold Combinations",
        method: "caution_manual",
        min_m: 24,
        max_m: 216,
        freq: "Per product label",
        notes: "NOT RECOMMENDED <2 years. Variable concentrations. Limited efficacy evidence."
      }
    ]
  },
  {
    id: "gi",
    name: "Gastrointestinal",
    hint: "Antiemetics, antacids",
    items: [
      {
        id: "ondansetron",
        common: true,
        name: "Ondansetron",
        method: "mgkg_single",
        mgkg: 0.15,
        min_m: 6,
        max_m: 216,
        max_mg: 8,
        conc_mg_per_ml: 0.8,
        freq: "Every 8 hours PRN",
        notes: "8-15kg: 2mg; 15-30kg: 4mg; >30kg: 8mg. Max 3 doses/day. Constipation common."
      },
      {
        id: "omeprazole",
        common: false,
        name: "Omeprazole",
        method: "mgkg_single",
        mgkg: 1,
        min_m: 12,
        max_m: 216,
        max_mg: 40,
        freq: "Once daily (before breakfast)",
        notes: "10-20kg: 10mg; >20kg: 20mg. Take 30min before food."
      },
      {
        id: "lactulose",
        common: false,
        name: "Lactulose",
        method: "mlkg_single",
        mlkg: 1,
        min_m: 0,
        max_m: 216,
        max_ml: 20,
        freq: "Once or twice daily",
        notes: "Laxative. 1-5y: 5mL; 5-10y: 10mL; >10y: 15-20mL. Adjust to stool consistency."
      }
    ]
  },
  {
    id: "respiratory",
    name: "Respiratory",
    hint: "Bronchodilators, steroids",
    items: [
      {
        id: "salbutamol",
        common: true,
        name: "Salbutamol (oral)",
        method: "mgkg_single",
        mgkg: 0.1,
        min_m: 24,
        max_m: 216,
        max_mg: 4,
        conc_mg_per_ml: 0.4,
        freq: "Every 6-8 hours PRN",
        notes: "2-6y: 1-2mg; 6-12y: 2mg; >12y: 2-4mg. Prefer inhaled route. Tremor, tachycardia."
      },
      {
        id: "prednisolone",
        common: true,
        name: "Prednisolone",
        method: "mgkg_single",
        mgkg: 1,
        min_m: 0,
        max_m: 216,
        max_mg: 60,
        conc_mg_per_ml: 3,
        freq: "Once daily (morning) × 3-5 days",
        notes: "Asthma: 1-2 mg/kg/day (max 40-60mg) × 3-5 days. Croup: 0.15-0.6 mg/kg single dose."
      }
    ]
  }
];

// Utility functions
function roundSmart(x) {
  if (x === null || x === undefined || isNaN(x)) return "";
  return (Math.round(x * 10) / 10).toFixed(1);
}

function badge(status, label) {
  const cls = status === "good" ? "b-good" : status === "bad" ? "b-bad" : "b-warn";
  return '<span class="badge ' + cls + '">' + label + '</span>';
}

function calcDose(item, ageM, wtKg, overrideVal) {
  if (!wtKg || wtKg <= 0) {
    return { status: "bad", label: "Enter weight", doseText: "—", notes: item.notes || "" };
  }
  if (wtKg > 150) {
    return { status: "bad", label: "Invalid weight", doseText: "Weight too high", notes: "Verify weight" };
  }
  if (ageM < item.min_m || ageM > item.max_m) {
    return { status: "bad", label: "Age restriction", doseText: "Not indicated", notes: item.notes || "" };
  }

  if (overrideVal !== "" && overrideVal !== null && !isNaN(Number(overrideVal)) && Number(overrideVal) > 0) {
    var val = Number(overrideVal);
    var capMsg = item.max_mg && val > item.max_mg ? " ⚠️ Exceeds max (" + item.max_mg + " mg)" : "";
    return { status: "warn", label: "Manual override", doseText: roundSmart(val) + " mg" + capMsg, notes: item.notes || "" };
  }

  if (item.method === "caution_manual") {
    return { status: "warn", label: "Use caution", doseText: "Enter manually", notes: item.notes || "" };
  }

  if (item.method === "mlkg_single") {
    var ml = item.mlkg * wtKg;
    if (item.max_ml && ml > item.max_ml) {
      ml = item.max_ml;
      return { status: "warn", label: "Max applied", doseText: roundSmart(ml) + " mL (capped)", notes: item.notes || "" };
    }
    return { status: "good", label: "Calculated", doseText: roundSmart(ml) + " mL", notes: item.notes || "" };
  }

  if (item.method === "mgkg_single") {
    var mg = item.mgkg * wtKg;
    if (item.max_mg && mg > item.max_mg) {
      mg = item.max_mg;
      return { status: "warn", label: "Max applied", doseText: roundSmart(mg) + " mg (capped)", notes: item.notes || "" };
    }
    return { status: "good", label: "Calculated", doseText: roundSmart(mg) + " mg", notes: item.notes || "" };
  }

  if (item.method === "mgkg_range") {
    var mg1 = item.mgkg_low * wtKg;
    var mg2 = item.mgkg_high * wtKg;
    var suffix = "";
    if (item.max_mg) {
      var highRaw = mg2;
      if (mg1 > item.max_mg) mg1 = item.max_mg;
      if (mg2 > item.max_mg) mg2 = item.max_mg;
      if (highRaw > item.max_mg) suffix = " (capped)";
    }
    return { status: "good", label: "Calculated", doseText: roundSmart(mg1) + "–" + roundSmart(mg2) + " mg" + suffix, notes: item.notes || "" };
  }

  if (item.method === "tiered_mgkg" && item.tiers) {
    var tier = null;
    for (var i = 0; i < item.tiers.length; i++) {
      if (ageM >= item.tiers[i].min_m && ageM <= item.tiers[i].max_m) {
        tier = item.tiers[i];
        break;
      }
    }
    if (!tier) return { status: "bad", label: "No tier", doseText: "Age outside tiers", notes: item.notes || "" };
    var mg = tier.mgkg * wtKg;
    if (item.max_mg && mg > item.max_mg) {
      mg = item.max_mg;
      return { status: "warn", label: "Max applied", doseText: roundSmart(mg) + " mg (capped)", notes: item.notes || "" };
    }
    return { status: "good", label: "Calculated", doseText: roundSmart(mg) + " mg", notes: item.notes || "" };
  }

  return { status: "warn", label: "Unknown", doseText: "—", notes: item.notes || "" };
}

function formatDoseWithMl(item, doseText, unitPref) {
  var hasConc = !!item.conc_mg_per_ml;
  if (!hasConc || unitPref === "mg") return doseText;

  var nums = doseText.match(/[\d.]+/g);
  if (!nums || nums.length === 0) return doseText;

  if (doseText.includes("–") && nums.length >= 2) {
    var mg1 = Number(nums[0]);
    var mg2 = Number(nums[1]);
    var ml1 = mg1 / item.conc_mg_per_ml;
    var ml2 = mg2 / item.conc_mg_per_ml;
    if (unitPref === "ml") return roundSmart(ml1) + "–" + roundSmart(ml2) + " mL";
    return doseText + "  (~" + roundSmart(ml1) + "–" + roundSmart(ml2) + " mL)";
  } else {
    var mg = Number(nums[0]);
    var ml = mg / item.conc_mg_per_ml;
    if (unitPref === "ml") return roundSmart(ml) + " mL";
    return doseText + "  (~" + roundSmart(ml) + " mL)";
  }
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function currentFiltered() {
  var mode = document.getElementById("viewMode").value;
  var q = normalize(document.getElementById("searchBox").value);
  var out = [];

  for (var i = 0; i < CATEGORIES.length; i++) {
    var cat = CATEGORIES[i];
    var catText = normalize(cat.name + " " + (cat.hint || ""));
    var items = cat.items;

    if (mode === "common") {
      items = items.filter(function(x) { return x.common === true; });
    }

    if (q) {
      items = items.filter(function(x) {
        var txt = normalize(x.name + " " + (x.notes || "") + " " + (x.freq || "") + " " + catText);
        return txt.includes(q);
      });
      if (items.length === 0) continue;
    }

    out.push({ id: cat.id, name: cat.name, hint: cat.hint, items: items });
  }

  return { cats: out, q: q };
}

function buildCategoriesUI(filteredCategories, query) {
  var el = document.getElementById("categories");
  el.innerHTML = "";

  if (filteredCategories.length === 0) {
    el.innerHTML = '<div class="no-results">No medications found. Try a different search.</div>';
    return;
  }

  for (var i = 0; i < filteredCategories.length; i++) {
    var cat = filteredCategories[i];
    var details = document.createElement("details");
    details.open = query.length > 0;

    var count = cat.items.length;
    var summary = document.createElement("summary");
    summary.innerHTML = '<div><div class="cat-title">' + cat.name + '</div><div class="cat-sub">' + (cat.hint || "") + '</div></div><div class="cat-meta">' + count + ' med' + (count === 1 ? '' : 's') + '</div>';
    details.appendChild(summary);

    var body = document.createElement("div");
    body.className = "cat-body";

    for (var j = 0; j < cat.items.length; j++) {
      body.appendChild(renderMedCard(cat.items[j]));
    }

    details.appendChild(body);
    el.appendChild(details);
  }
}

function renderMedCard(med) {
  var y = Number(document.getElementById("ageYears").value || 0);
  var m = Number(document.getElementById("ageMonths").value || 0);
  var wt = Number(document.getElementById("weight").value || 0);
  var ageM = y * 12 + m;
  var unitPref = document.getElementById("unitPref").value;

  var overrideKey = "ov_" + med.id;
  var overrideVal = localStorage.getItem(overrideKey) || "";
  var res = calcDose(med, ageM, wt, overrideVal);
  var finalDose = formatDoseWithMl(med, res.doseText, unitPref);

  var card = document.createElement("div");
  card.className = "med-card";
  
  var html = '<div class="med-header"><div class="med-name">' + med.name + '</div>' + badge(res.status, res.label) + '</div>';
  html += '<div class="dose-display">' + finalDose + '</div>';
  html += '<div class="freq">' + (med.freq || "—") + '</div>';
  html += '<div><input class="override-input" inputmode="decimal" placeholder="Manual override (mg)" value="' + overrideVal + '" data-med-id="' + med.id + '">';
  html += '<div class="small">Override stored locally</div></div>';
  if (med.conc_mg_per_ml) html += '<div class="note">Standard: ' + med.conc_mg_per_ml + ' mg/mL</div>';
  if (res.notes) html += '<div class="note"><strong>Note:</strong> ' + res.notes + '</div>';
  
  card.innerHTML = html;

  var inp = card.querySelector(".override-input");
  inp.addEventListener("input", function(e) {
    localStorage.setItem(overrideKey, e.target.value);
    render();
  });

  return card;
}

function renderSummary() {
  var y = Number(document.getElementById("ageYears").value || 0);
  var m = Number(document.getElementById("ageMonths").value || 0);
  var wt = Number(document.getElementById("weight").value || 0);
  var ageM = y * 12 + m;

  var s = y + " year" + (y === 1 ? "" : "s");
  if (m > 0) s += ", " + m + " month" + (m === 1 ? "" : "s");
  s += " (" + ageM + " mo)";
  if (wt > 0) s += " • " + wt.toFixed(1) + " kg";
  document.getElementById("ageSummary").textContent = s;
}

function render() {
  renderSummary();
  var filtered = currentFiltered();
  buildCategoriesUI(filtered.cats, filtered.q);
}

function setAllDetails(open) {
  var details = document.querySelectorAll("#categories details");
  for (var i = 0; i < details.length; i++) {
    details[i].open = open;
  }
}

// Event listeners
var inputIds = ["ageYears", "ageMonths", "weight", "viewMode", "unitPref", "searchBox"];
for (var i = 0; i < inputIds.length; i++) {
  document.getElementById(inputIds[i]).addEventListener("input", render);
}

document.getElementById("resetBtn").addEventListener("click", function() {
  for (var i = 0; i < CATEGORIES.length; i++) {
    for (var j = 0; j < CATEGORIES[i].items.length; j++) {
      localStorage.removeItem("ov_" + CATEGORIES[i].items[j].id);
    }
  }
  render();
});

document.getElementById("expandAllBtn").addEventListener("click", function() {
  setAllDetails(true);
});

document.getElementById("collapseAllBtn").addEventListener("click", function() {
  setAllDetails(false);
});

// Initial render
render();
