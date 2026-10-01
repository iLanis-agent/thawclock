var E = require('./engine.js'), n = 0, bad = 0;
function eq(a, b, m, tol) { n++; tol = tol || 0; if (!(Math.abs(a - b) <= tol)) { bad++; console.log('FAIL', m, a, b); } }
// USDA FSIS turkey refrigerator thawing table: 4-12 lb 1-3 d, 12-16 3-4 d, 16-20 4-5 d, 20-24 5-6 d
[[4, 1, 3], [8, 1, 3], [12, 1, 3], [12.5, 3, 4], [14, 3, 4], [16, 3, 4], [17, 4, 5], [20, 4, 5], [21, 5, 6], [24, 5, 6]].forEach(function (r) {
  var f = E.fridgeDays(r[0], 'turkey'); eq(f.lo, r[1], 'lo ' + r[0]); eq(f.hi, r[2], 'hi ' + r[0]); eq(f.extrapolated ? 1 : 0, 0, 'ext ' + r[0]);
});
// the "24 hours per 4 to 5 lb" rule agrees with the table at band edges
[12, 16, 20, 24].forEach(function (lb) { eq(E.fridgeDays(lb, 'turkey').hi, lb / 4, 'hi = lb/4 at ' + lb); });
[20, 24].forEach(function (lb) { eq(E.fridgeDays(lb, 'turkey').lo >= Math.ceil(lb / 5) ? 1 : 0, 1, 'lo>=lb/5 ' + lb); });
eq(E.fridgeDays(3, 'turkey').hi, 1, 'under 4 lb'); eq(E.fridgeDays(28, 'turkey').hi, 7, '28 lb extrap hi'); eq(E.fridgeDays(28, 'turkey').lo, 6, '28 lb extrap lo'); eq(E.fridgeDays(28, 'turkey').extrapolated ? 1 : 0, 1, 'extrap flag');
// other items: 24 h per 5 lb, at least a day
eq(E.fridgeDays(1, 'other').hi, 1, 'ground 1 lb'); eq(E.fridgeDays(5, 'other').hi, 1, '5 lb'); eq(E.fridgeDays(5.1, 'other').hi, 2, '5.1 lb'); eq(E.fridgeDays(10, 'other').hi, 2, '10 lb');
// cold water: 30 min per lb. USDA table: 4-12 lb 2-6 h, 12-16 6-8, 16-20 8-10, 20-24 10-12
eq(E.coldMinutes(4), 120, '4 lb'); eq(E.coldMinutes(12), 360, '12 lb'); eq(E.coldMinutes(16), 480, '16 lb'); eq(E.coldMinutes(20), 600, '20 lb'); eq(E.coldMinutes(24), 720, '24 lb'); eq(E.coldMinutes(1), 30, '1 lb'); eq(E.coldMinutes(0.2), 30, 'min 30');
[[4, 2, 6], [12, 2, 6], [13, 6, 8], [16, 6, 8], [18, 8, 10], [22, 10, 12]].forEach(function (r) { var b = E.coldBand(r[0]); eq(b.lo, r[1], 'cb lo ' + r[0]); eq(b.hi, r[2], 'cb hi ' + r[0]); });
[[4, 2], [12, 6], [16, 8], [20, 10], [24, 12]].forEach(function (r) { eq(E.coldMinutes(r[0]) / 60, r[1], 'minutes match band edge ' + r[0]); });
eq(E.coldBand(2) === null ? 1 : 0, 1, 'cb small'); eq(E.coldBand(30) === null ? 1 : 0, 1, 'cb big');
// water changes: every 30 minutes until thawed
eq(E.waterChanges(120), 3, 'chg 2h'); eq(E.waterChanges(30), 0, 'chg 30m'); eq(E.waterChanges(360), 11, 'chg 6h'); eq(E.waterChanges(45), 1, 'chg 45m');
// units
eq(E.toLb(10, 'lb'), 10, 'lb'); eq(E.toLb(5, 'kg'), 11.0231, 'kg', 1e-4); eq(E.toKg(22.0462262), 10, 'toKg', 1e-6);
// planning: cook Thursday Nov 26 2026 15:00 UTC for a 16 lb turkey
var cook = Date.UTC(2026, 10, 26, 15, 0);
var p = E.plan(cook, 'fridge', 16, 'turkey'); eq(p.startLatest, cook - 4 * 86400000, 'latest start'); eq(p.startEarliest, cook - 5 * 86400000, 'earliest start (3 d + 2 d hold)'); eq(p.holdDays, 2, 'hold');
var q = E.plan(cook, 'cold', 16, 'turkey'); eq(q.startLatest, cook - 8 * 3600000, 'cold start'); eq(q.changes, 15, 'changes 16 lb'); eq(q.startEarliest === null ? 1 : 0, 1, 'no earliest for cold');
var s = E.plan(cook, 'fridge', 10, 'other'); eq(s.startLatest, cook - 2 * 86400000, 'other 10 lb');
// counter limits: 2 hours, 1 hour at 90 F and above
eq(E.counterLimitHours(70), 2, '70F'); eq(E.counterLimitHours(89.9), 2, '89.9F'); eq(E.counterLimitHours(90), 2, '90F exactly'); eq(E.counterLimitHours(90.1), 1, '90.1F'); eq(E.counterLimitHours(E.cToF(32)), 2, '32C is 89.6F');
eq(E.counterCheck(1.5, 70).status === 'ok' ? 1 : 0, 1, '1.5h ok'); eq(E.counterCheck(2, 70).status === 'ok' ? 1 : 0, 1, '2h exactly ok'); eq(E.counterCheck(2.1, 70).status === 'over' ? 1 : 0, 1, '2.1h over');
eq(E.counterCheck(1.1, 95).status === 'over' ? 1 : 0, 1, '1.1h at 95F over'); eq(E.counterCheck(0.5, 95).left, 0.5, 'left at 95F'); eq(E.counterCheck(0.5, 70).left, 1.5, 'left at 70F');
eq(E.cToF(0), 32, 'cToF'); eq(E.cToF(100), 212, 'cToF100'); eq(E.cToF(32.2), 90, 'cToF 32.2', 0.05);
console.log(n + ' assertions, ' + bad + ' failed'); process.exit(bad ? 1 : 0);
