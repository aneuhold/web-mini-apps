# Bulk close-out — Jun 28 → end of Aug 2026

## Outcome

| | |
| --- | --- |
| Start (6/28) | 180.5 lb |
| End (trend, 8/31) | 188.6 lb |
| Total | +8.1 lb (+4.5%) over 9 weeks |
| Measured rate | **+0.30%/wk** (least-squares over 41 weigh-ins) |

Inside the RP bulk band (0.25–0.5%/wk), toward the lower end. No mid-phase
calorie correction was applied, and none was warranted.

Read the rate from a regression over the whole phase, not from week-to-week
deltas in `nutrition:targets`. Several windows in this log hold only 2–4
entries, which produced swings of ±1.3–1.6%/wk that the full series shows
are noise. The last-month slope was +0.53%/wk; the 9-week slope was
+0.30%/wk.

## Measured maintenance

Bulk intake averaged 2469 cal/day (5×2540 training + 2×2290 rest). Against
the observed +0.56 lb/wk that implies a 280 cal/day surplus, so:

- **Implied maintenance ≈ 2189 cal/day**
- RP Table 10.1 blend at this bodyweight ≈ 2129 cal/day

The table is within ~60 cal/day of measured, so it can be trusted for this
person. The configured maintenance templates (2200 / 2500 / 1950) sit
~60 cal/day under measured maintenance — a drift of roughly −0.12 lb/wk,
which is acceptable entering a maintenance block after a bulk.

Assumes target adherence and little use of the camping day type.

## Open: cutting templates are infeasible at this bodyweight

`Cutting · NonTraining` cannot be satisfied as configured. At 188.6 lb the
RP floors alone exceed the calorie target:

    P 1.2 g/lb = 226 g = 905 cal
    F 0.3 g/lb =  57 g = 509 cal
                       = 1414 cal   before a single gram of carbs

    configured 1400 -> carbs  -4 g
    RP-rec'd   1243 -> carbs -43 g

So a 0.75%/wk cut is not reachable on non-training days without breaking
RP's own floors. This was already latent at the old pinned 183 lb (7 g of
carbs); raising the bodyweight only made it visible.

Resolve before the next cut starts, at that phase's actual bodyweight:

1. Raise the non-training target to ~1500–1600 (21–46 g carbs) and accept a
   slower cut rate than 0.75%/wk.
2. Drop cutting protein from 1.2 to ~1.1 g/lb — still inside RP's cutting
   range, frees ~75 cal.
3. Shift more of the weekly deficit onto training days. Cuts against the
   profile's note that weekend hunger tolerance is higher, so it's the
   least attractive of the three.

Option 1 is the honest one: the rate target is what's unaffordable here.

## Watch: RP band edge at 190.5 lb

188.6 lb is 1.9 lb below the 176–190 → 191–210 boundary. Crossing it steps
Table 10.1 up 100 cal (Light 2200→2300, NonTraining 1950→2000), so the
`recommended` column on the stats page will jump by 100 with no change in
plan. Configured calorie targets are hand-authored and won't follow on
their own — that's deliberate.
