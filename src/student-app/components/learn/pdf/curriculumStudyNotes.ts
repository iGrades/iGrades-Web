export interface StudyTopicNote {
  category: string;
  level: string;
  summary: string;
  objectives: string[];
  keyFormulas: string[];
  workedExamples: {
    question: string;
    solution: string[];
    answer: string;
  }[];
  examTips: string[];
}

export const CURRICULUM_STUDY_NOTES: Record<string, StudyTopicNote> = {
  "Number Bases": {
    category: "Number & Numeration",
    level: "SSS 1 • Senior Secondary",
    summary: "Number bases describe numeral systems where place value corresponds to powers of a base b. The common system is base 10 (denary), while computers use base 2 (binary), base 8 (octal), and base 16 (hexadecimal).",
    objectives: [
      "Convert numbers from base 10 to any target base by repeated division.",
      "Convert numbers from any base to base 10 by expanded notation.",
      "Perform binary arithmetic (addition, subtraction, multiplication).",
      "Solve unknown base equations (e.g. 23_x = 17_10)."
    ],
    keyFormulas: [
      "Expansion: N_b = d_k · b^k + d_{k-1} · b^{k-1} + ... + d_0 · b^0",
      "Valid Digits in Base b: {0, 1, ..., b - 1}",
      "Binary Addition: 1₂ + 1₂ = 10₂; 1₂ + 1₂ + 1₂ = 11₂"
    ],
    workedExamples: [
      {
        question: "Convert 11011₂ to base 10.",
        solution: [
          "Expand by place values: 1·(2⁴) + 1·(2³) + 0·(2²) + 1·(2¹) + 1·(2⁰)",
          "Evaluate powers: 16 + 8 + 0 + 2 + 1",
          "Sum terms: 27"
        ],
        answer: "11011₂ = 27₁₀"
      },
      {
        question: "Solve for the unknown base x: 31_x + 14_x = 50_x.",
        solution: [
          "Convert to base 10: (3x + 1) + (x + 4) = 5x + 0",
          "Combine like terms: 4x + 5 = 5x",
          "Subtract 4x from both sides: 5 = 5x - 4x => x = 5"
        ],
        answer: "x = 5"
      }
    ],
    examTips: [
      "In WAEC and JAMB, base x must always be strictly greater than any individual digit in the equation.",
      "When subtracting in base b, borrowing from the left column borrows b units, not 10."
    ]
  },
  "Modular Arithmetic": {
    category: "Number & Numeration",
    level: "SSS 1 • Senior Secondary",
    summary: "Modular arithmetic is arithmetic on integers where numbers 'wrap around' upon reaching a given value called the modulus. It governs cyclic systems like clocks, calendars, and cryptography.",
    objectives: [
      "Understand congruent residues modulo n.",
      "Compute addition, subtraction, and multiplication modulo n.",
      "Apply modulo 7 to calendar and day-of-week problems."
    ],
    keyFormulas: [
      "a ≡ b (mod n) ⟺ n divides (a - b)",
      "0 ≤ remainder r < n",
      "(a · b) mod n = [(a mod n) · (b mod n)] mod n"
    ],
    workedExamples: [
      {
        question: "Evaluate 37 × 45 (mod 7).",
        solution: [
          "37 = 5 × 7 + 2  ⟹  37 ≡ 2 (mod 7)",
          "45 = 6 × 7 + 3  ⟹  45 ≡ 3 (mod 7)",
          "Multiply remainders: 2 × 3 = 6 ≡ 6 (mod 7)"
        ],
        answer: "6 (mod 7)"
      }
    ],
    examTips: [
      "Negative numbers in modulo n: add n until you obtain a positive residue (e.g., -2 mod 5 = -2 + 5 = 3)."
    ]
  },
  "Quadratic Equations": {
    category: "Algebraic Processes",
    level: "SSS 1 • Senior Secondary",
    summary: "Quadratic equations are second-degree polynomial equations of the form ax² + bx + c = 0. They have up to two real roots determined by the discriminant.",
    objectives: [
      "Solve quadratic equations using factorisation.",
      "Solve by completing the square and using the quadratic formula.",
      "Determine the nature of roots using the discriminant Δ = b² - 4ac."
    ],
    keyFormulas: [
      "Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)",
      "Discriminant: Δ = b² - 4ac (Δ > 0: 2 real roots; Δ = 0: 1 repeated root; Δ < 0: complex roots)",
      "Roots Relationship: Sum = -b/a, Product = c/a"
    ],
    workedExamples: [
      {
        question: "Solve 2x² - 5x - 3 = 0.",
        solution: [
          "Identify: a = 2, b = -5, c = -3",
          "Discriminant: (-5)² - 4(2)(-3) = 25 + 24 = 49",
          "Roots: x = (5 ± √49) / (2 × 2) = (5 ± 7) / 4",
          "x₁ = (5 + 7)/4 = 3,  x₂ = (5 - 7)/4 = -2/4 = -0.5"
        ],
        answer: "x = 3 or x = -1/2"
      }
    ],
    examTips: [
      "Always write equations in standard form (ax² + bx + c = 0) before identifying coefficients.",
      "Check factorization by expanding mentally before continuing."
    ]
  },
  "Pythagoras' Theorem": {
    category: "Geometry & Trigonometry",
    level: "SSS 1 • Senior Secondary",
    summary: "In a right-angled triangle, the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares on the other two sides.",
    objectives: [
      "State and prove Pythagoras' theorem geometrically.",
      "Calculate unknown side lengths in right triangles.",
      "Apply common Pythagorean triples to save time in JAMB exams."
    ],
    keyFormulas: [
      "c² = a² + b² (where c is the hypotenuse opposite the 90° angle)",
      "a = √(c² - b²),  b = √(c² - a²)",
      "Standard Triples: (3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17)"
    ],
    workedExamples: [
      {
        question: "A 13m ladder rests against a vertical wall with its foot 5m away. How high up the wall does it reach?",
        solution: [
          "Hypotenuse c = 13m, base b = 5m, height = h",
          "Apply theorem: h² + 5² = 13²",
          "h² + 25 = 169  ⟹  h² = 144  ⟹  h = √144 = 12m"
        ],
        answer: "12 metres"
      }
    ],
    examTips: [
      "Ensure all measurements are in identical units (convert cm to m or vice versa) before squaring."
    ]
  }
};

export function getCurriculumNote(title: string, description?: string): StudyTopicNote {
  if (CURRICULUM_STUDY_NOTES[title]) {
    return CURRICULUM_STUDY_NOTES[title];
  }

  // Fallback dynamic note
  return {
    category: "Secondary Mathematics Curriculum",
    level: "SSS 1 • WAEC & JAMB Syllabus",
    summary: description || `Comprehensive academic study notes and curriculum review guide for ${title}.`,
    objectives: [
      `Understand fundamental definitions, principles, and conventions for ${title}.`,
      `Learn step-by-step mathematical derivation and problem-solving methodologies.`,
      `Prepare for WAEC SSCE, NECO SSCE, and JAMB UTME examination patterns.`
    ],
    keyFormulas: [
      `Governing formulas and properties applicable to ${title}`,
      `Standard mathematical relationships for Senior Secondary Mathematics`
    ],
    workedExamples: [
      {
        question: `Standard Examination Problem on ${title}`,
        solution: [
          `Step 1: Identify all given parameters and constraints.`,
          `Step 2: Apply the curriculum-approved formula or theorem.`,
          `Step 3: Simplify and state final units clearly.`
        ],
        answer: `Curriculum standard result for ${title}`
      }
    ],
    examTips: [
      `Show full working steps to secure method and accuracy marks in WAEC SSCE.`,
      `Always check for extraneous solutions and units consistency.`
    ]
  };
}
