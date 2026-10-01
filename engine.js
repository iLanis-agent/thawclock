(function (root) {
  'use strict';
  var KG_TO_LB = 2.20462262;
  var HOUR = 3600000, DAY = 86400000;
  // USDA FSIS "Turkey Basics: Safe Thawing" refrigerator table (days) by turkey weight band (lb)
  var FRIDGE_BANDS = [
    { max: 12, lo: 1, hi: 3 }, { max: 16, lo: 3, hi: 4 }, { max: 20, lo: 4, hi: 5 }, { max: 24, lo: 5, hi: 6 }
  ];
  function toLb(w, unit) { return unit === 'kg' ? w * KG_TO_LB : w; }
  function toKg(lb) { return lb / KG_TO_LB; }
  // Refrigerator: turkey uses the USDA table; other items use 24 h per 5 lb, at least one day (rule of thumb)
  function fridgeDays(lb, kind) {
    if (kind !== 'turkey') { var d = Math.max(1, Math.ceil(lb / 5)); return { lo: d, hi: d, extrapolated: false }; }
    if (lb < 4) return { lo: 1, hi: 1, extrapolated: false };
    for (var i = 0; i < FRIDGE_BANDS.length; i++) if (lb <= FRIDGE_BANDS[i].max) return { lo: FRIDGE_BANDS[i].lo, hi: FRIDGE_BANDS[i].hi, extrapolated: false };
    return { lo: Math.ceil(lb / 5), hi: Math.ceil(lb / 4), extrapolated: true };
  }
  // Cold water: about 30 minutes per pound, water changed every 30 minutes
  function coldMinutes(lb) { return Math.max(30, Math.round(lb * 30)); }
  function waterChanges(minutes) { return Math.max(0, Math.ceil(minutes / 30) - 1); }
  // Table of cold-water hours USDA publishes for turkeys, for display
  function coldBand(lb) {
    if (lb < 4) return null;
    if (lb <= 12) return { lo: 2, hi: 6 }; if (lb <= 16) return { lo: 6, hi: 8 };
    if (lb <= 20) return { lo: 8, hi: 10 }; if (lb <= 24) return { lo: 10, hi: 12 }; return null;
  }
  // Plan backwards from the time you want to start cooking (ms since epoch)
  function plan(cookAt, method, lb, kind) {
    if (method === 'fridge') {
      var f = fridgeDays(lb, kind);
      return { method: 'fridge', days: f, startLatest: cookAt - f.hi * DAY, startEarliest: cookAt - (f.lo + 2) * DAY, thawedBy: cookAt, holdDays: 2, extrapolated: f.extrapolated };
    }
    var m = coldMinutes(lb);
    return { method: 'cold', minutes: m, changes: waterChanges(m), startLatest: cookAt - m * 60000, startEarliest: null, thawedBy: cookAt };
  }
  // Counter check: food out of the fridge more than 2 hours (1 hour above 90 F) is past the limit
  function counterLimitHours(tempF) { return tempF > 90 ? 1 : 2; }
  function counterCheck(hoursOut, tempF) {
    var lim = counterLimitHours(tempF);
    if (hoursOut > lim) return { status: 'over', limit: lim, left: 0 };
    return { status: 'ok', limit: lim, left: lim - hoursOut };
  }
  function cToF(c) { return c * 9 / 5 + 32; }
  var api = { KG_TO_LB: KG_TO_LB, HOUR: HOUR, DAY: DAY, toLb: toLb, toKg: toKg, fridgeDays: fridgeDays, coldMinutes: coldMinutes, waterChanges: waterChanges, coldBand: coldBand, plan: plan, counterLimitHours: counterLimitHours, counterCheck: counterCheck, cToF: cToF };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Thaw = api;
})(typeof window !== 'undefined' ? window : this);
