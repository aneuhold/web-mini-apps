### Macronutrient Calculation Model

**Constants:**

- **Protein ($P$):** 4 calories per gram [1]
- **Carbohydrate ($C$):** 4 calories per gram [1]
- **Fat ($F$):** 9 calories per gram [1]

**Variables:**

- $T$ is the calorie target
- $BW$ is bodyweight
- $P$, $C$, and $F$ are grams of macros

---

### 1. Maintenance Phase (Isocaloric)

**Goal:** Balanced intake for health and performance [2, 3].

- **Step 1 (Protein):** $P\text{ (g)} = 1.0 \times BW\text{ (lb)}$ [2]
- **Step 2 (Carbohydrates):** $C\text{ (g)} = \text{Multiplier} \times BW\text{ (lb)}$
  - _Non-training:_ 0.5
  - _Light Day:_ 1.0
  - _Moderate Day:_ 1.5
  - _Hard Day:_ 2.0
- **Step 3 (Fats):** $F\text{ (g)} = \frac{T - (P \times 4) - (C \times 4)}{9}$
  - _Check:_ Ensure $F$ is at least $0.3 \times BW$.
  - In the text, the fat allocation for the rest of the calories is actually just the default. The cutting phase and the bulking phase just override that.

---

### 2. Cutting Phase (Hypocaloric)

**Goal:** High protein to spare muscle; low fat to maximize performance carbs.

- **Step 1 (Protein):** $P\text{ (g)} = 1.2 \times BW\text{ (lb)}$
  - _Use 1.0g baseline; up to 1.5g for extreme deficits/satiety. Currently choosing 1.2 but can adjust later if needed_
- **Step 2 (Fats):** $F\text{ (g)} = 0.3 \times BW\text{ (lb)}$
  - _Fats are reduced to the health minimum._
- **Step 3 (Carbohydrates):** $C\text{ (g)} = \frac{T - (P \times 4) - (F \times 9)}{4}$

---

### 3. Bulking Phase (Hypercaloric)

**Goal:** Surplus for anabolism; prioritize carbs for training.

1. **Step 1 (Protein):** $P\text{ (g)} = 1.0 \times BW\text{ (lb)}$
2. **Step 2 (Fats):** $F\text{ (g)} = 0.3 \times BW\text{ (lb)}$ (The health floor)
3. **Step 3 (Carbohydrates):** $C\text{ (g)} = \frac{T - (P \times 4) - (F \times 9)}{4}$
   - _Note: This makes Carbs the "remainder" macro to maximize growth ._
   - _Check: Ensure $C$ is at least $1.0 \times BW$._
   - _Adherence Adjustment:_ If volume of food is too high, decrease $C$ and increase $F$ to meet the calorie target ($T$). This is just to be able to eat more calories if you can't stomach all the carbs. If you can eat a sufficient amount of carbs, then do that, as that is ideal.

---

### General Remainder Equation That is used in each Phase

$$\text{Remainder Macro (g)} = \frac{T - (\text{Known Macro A} \times \text{kcal/g}) - (\text{Known Macro B} \times \text{kcal/g})}{\text{kcal/g of Remainder Macro}}$$
