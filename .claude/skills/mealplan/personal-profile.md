# Personal Profile & Schedule

Reference document for nutrition coaching context. Covers lifestyle, schedule, and personal constraints only — current training/nutrition plan details live in `app/(routes)/nutrition/plans.ts` and are updated per phase.

---

## Work Schedule

- **Day job**: Weekdays (Mon–Fri), 6AM start
- **Day job end**: 3 PM (workout begins immediately after)
- **Evening "free-time" work**: Starts 5 PM on weekdays, and sometimes weekends as well. Not as important to avoid being hungry during this time.
- **Mentally taxing job** — cognitive performance degrades when hungry during work hours

## Workout Schedule

- **Training days**: Monday through Friday
- **Workout time**: 3 PM (right after day job)
- **Rest days**: Saturday & Sunday

## Meal Timing (Weekdays)

| Time     | Window                   | Notes                                                |
| -------- | ------------------------ | ---------------------------------------------------- |
| 5:30 AM  | Breakfast                | Before work begins — non-negotiable                  |
| 8:30 AM  | Morning break (optional) | Real hunger point; can skip if macro budget is tight |
| 11:00 AM | Lunch                    | Midday work break                                    |
| ~2:40 PM | Pre-workout              | Before 3 PM lifting session                          |
| ~4:50 PM | Post-workout / dinner    | Before 5 PM evening work block                       |
| Evening  | Optional late protein    | Only if genuinely hungry                             |

## Meal Timing (Weekends)

- No fixed schedule — flexible eating windows
- Higher hunger tolerance allows for tighter calorie days when cutting

## Hunger Tolerance Rules

**Hunger is NOT acceptable during:**

- Work hours (6 AM – 3 PM on weekdays) — impairs cognitive performance
- The 8:30 AM break is a known hunger point; skipping is possible but not preferred

**Hunger IS acceptable during:**

- Workouts (~3 PM)
- Evenings after dinner (post-5 PM)
- Overnight
- Full days on weekends

## Coaching Implications

- **Front-load the workday**: breakfast, mid-morning fuel, and lunch need to be satisfying — fats and volume (fibrous veggies) help here
- **Compress carbs around the workout**: pre-workout shake at ~2:40 PM and post-workout meal at ~4:50 PM is the natural carb cluster
- **Cycle calories lower on weekends**: higher hunger tolerance makes rest days a good place to bank a bigger deficit
- **Evening snacks are optional**, never mandatory — used only if hunger genuinely threatens sleep
- **Protein distribution**: 4–5 feedings across the day, spread through the work windows rather than stacked at night

## Coaching Preferences

**Coaching style**

- Values direct, evidence-based coaching with concrete numbers over vague guidance
- Wants honest pushback when stated targets conflict with what the science supports (e.g., the coach should recommend dialing down aggressive cut rates if macro math breaks, rather than silently complying)
- Prefers to see the calculations and tradeoffs, not just the final answer — show the work
- OK with coach explicitly flagging when the user's instinct was wrong (e.g., "your current meal distribution is suboptimal, here's why")

**Food logistics**

- Does not cook outside of one weekly chicken batch (~400g cooked/day available)
- Keeps ~30 lb of whey protein powder on hand at all times — shakes are always available as backup or supplement
- At least 1 shake/day is standard, more as needed to fill protein targets
- "Meals" are assembly, not recipes — no cooking during the week

**Planning defaults**

- When chicken runs out, replace with whey + peanut butter combinations (not with new recipes, until the user says they have new things)
- Canned veggies (green beans preferred, peas/corn occasional) are the go-to for volume/hunger, not fresh produce that requires prep
- Bars (Clif Builders Mini, Kind Thins) are travel/emergency swaps, not daily staples

## Notes for Future Chats

When proposing meal structures or adjustments, default to these windows unless the user says otherwise. If the user asks for a new nutrition plan or phase change, update `app/(routes)/nutrition/plans.ts` but leave this profile document alone — it reflects lifestyle, not phase-specific targets.
