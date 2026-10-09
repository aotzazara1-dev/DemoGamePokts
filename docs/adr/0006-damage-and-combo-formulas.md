# Damage and Combo Resolution Formulas

We adopted classic TS Online damage arithmetic: a subtractive physical formula `Damage = max(1, ATK * 2 - DEF) * ElementalFactor * ComboFactor` with element factors of 1.5x (advantage), 1.0x (neutral), and 0.7x (disadvantage). Combo attacks trigger cooperatively when allied units target the same opponent and their AGI difference is within 15 points.
