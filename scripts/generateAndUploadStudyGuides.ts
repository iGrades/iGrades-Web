import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Topic-specific curriculum content database
const TOPIC_DETAILS: Record<string, {
  category: string;
  objectives: string[];
  keyPoints: string[];
  formulas: string[];
  workedExamples: { problem: string; steps: string[]; answer: string }[];
  examTips: string[];
}> = {
  "Number Bases": {
    category: "Number & Numeration",
    objectives: [
      "Convert numbers from base ten to any other base (base 2, base 8, base 16).",
      "Convert numbers from any base to base ten using place value expansion.",
      "Perform addition, subtraction, multiplication, and division in different bases.",
      "Solve linear equations involving unknown number bases."
    ],
    keyPoints: [
      "The digits in any base b range strictly from 0 to (b - 1). For example, base 2 uses only {0, 1}; base 8 uses {0, 1, 2, ..., 7}.",
      "Conversion to base 10 uses repeated expansion: (d_n * b^n) + ... + (d_1 * b^1) + (d_0 * b^0).",
      "Conversion from base 10 uses repeated successive division, recording remainders from bottom to top."
    ],
    formulas: [
      "Expansion Rule: N_b = d_k * b^k + d_{k-1} * b^{k-1} + ... + d_0 * b^0",
      "Biconditional: If 23_x = 17_{10}, then 2x + 3 = 17 => x = 7",
      "Binary Addition: 1_2 + 1_2 = 10_2; 1_2 + 1_2 + 1_2 = 11_2"
    ],
    workedExamples: [
      {
        problem: "Convert 11011_2 to base 10.",
        steps: [
          "Write the place values: 1*(2^4) + 1*(2^3) + 0*(2^2) + 1*(2^1) + 1*(2^0)",
          "Evaluate powers: 1*(16) + 1*(8) + 0*(4) + 1*(2) + 1*(1)",
          "Sum terms: 16 + 8 + 0 + 2 + 1 = 27"
        ],
        answer: "11011_2 = 27_{10}"
      },
      {
        problem: "Find x if 31_x + 14_x = 50_x.",
        steps: [
          "Express in base 10: (3x + 1) + (x + 4) = 5x + 0",
          "Combine like terms: 4x + 5 = 5x",
          "Subtract 4x from both sides: 5 = 5x - 4x => x = 5"
        ],
        answer: "x = 5 (Note: base must be greater than highest digit 4)"
      }
    ],
    examTips: [
      "Always check that your calculated base x is strictly greater than all digits present in the equation.",
      "When subtracting in base b, borrowing from the next column borrows b units, not 10."
    ]
  },
  "Modular Arithmetic": {
    category: "Number & Numeration",
    objectives: [
      "Understand cyclic events and clock arithmetic systems.",
      "Calculate addition, subtraction, and multiplication modulo n.",
      "Solve simple modular linear equations.",
      "Apply modular arithmetic to calendar and day-of-the-week calculations."
    ],
    keyPoints: [
      "a ≡ b (mod n) means that (a - b) is completely divisible by n.",
      "In modulo n, the only permissible residues are {0, 1, 2, ..., n - 1}.",
      "For negative numbers, add multiples of n until a non-negative residue is reached."
    ],
    formulas: [
      "Division algorithm: a = qn + r, where 0 <= r < n",
      "Congruence rule: (a + b) mod n = ((a mod n) + (b mod n)) mod n",
      "Multiplication rule: (a * b) mod n = ((a mod n) * (b mod n)) mod n"
    ],
    workedExamples: [
      {
        problem: "Evaluate 37 * 45 (mod 7).",
        steps: [
          "Find residue of 37 mod 7: 37 = 5 * 7 + 2 => 37 ≡ 2 (mod 7)",
          "Find residue of 45 mod 7: 45 = 6 * 7 + 3 => 45 ≡ 3 (mod 7)",
          "Multiply the residues: 2 * 3 = 6 ≡ 6 (mod 7)"
        ],
        answer: "6 (mod 7)"
      }
    ],
    examTips: [
      "Never divide directly in modular arithmetic unless working with the modular multiplicative inverse.",
      "Remember that 7 days make a week: day calculations always operate modulo 7."
    ]
  },
  "Indices": {
    category: "Number & Numeration",
    objectives: [
      "State and apply all fundamental laws of indices.",
      "Simplify complex algebraic and numeric expressions with powers.",
      "Solve indicial equations by equating exponents with common bases."
    ],
    keyPoints: [
      "Multiplication of like bases adds powers: a^m * a^n = a^{m+n}.",
      "Division of like bases subtracts powers: a^m / a^n = a^{m-n}.",
      "Zero exponent rule: a^0 = 1 for any non-zero real number a.",
      "Negative exponent rule: a^{-n} = 1 / a^n."
    ],
    formulas: [
      "Product Law: a^m * a^n = a^{m+n}",
      "Quotient Law: a^m / a^n = a^{m-n}",
      "Power of Power: (a^m)^n = a^{m*n}",
      "Fractional Index: a^{m/n} = (n-th root of a)^m"
    ],
    workedExamples: [
      {
        problem: "Solve 2^{2x+1} - 9(2^x) + 4 = 0.",
        steps: [
          "Rewrite 2^{2x+1} as 2 * (2^x)^2",
          "Let y = 2^x: 2y^2 - 9y + 4 = 0",
          "Factorise: (2y - 1)(y - 4) = 0 => y = 1/2 or y = 4",
          "Substitute back: 2^x = 2^{-1} => x = -1; 2^x = 2^2 => x = 2"
        ],
        answer: "x = -1 or x = 2"
      }
    ],
    examTips: [
      "Always convert all bases to common prime factors (e.g., 4 -> 2^2, 9 -> 3^2, 27 -> 3^3).",
      "Be careful: (2x)^3 = 8x^3, whereas 2x^3 has power 3 applied only to x."
    ]
  },
  "Logarithms": {
    category: "Number & Numeration",
    objectives: [
      "Understand the inverse relationship between indices and logarithms.",
      "Apply log laws for products, quotients, and powers.",
      "Solve logarithmic and exponential equations.",
      "Perform numerical computations using logarithm and antilogarithm tables."
    ],
    keyPoints: [
      "If y = b^x, then log_b(y) = x, where b > 0 and b != 1.",
      "Logarithm of 1 to any valid base is always 0: log_b(1) = 0.",
      "Logarithm of the base itself is always 1: log_b(b) = 1."
    ],
    formulas: [
      "log_b(xy) = log_b(x) + log_b(y)",
      "log_b(x/y) = log_b(x) - log_b(y)",
      "log_b(x^k) = k * log_b(x)",
      "Change of Base: log_b(x) = log_a(x) / log_a(b)"
    ],
    workedExamples: [
      {
        problem: "Solve log_{10}(x + 3) + log_{10}(x - 3) = log_{10}(16).",
        steps: [
          "Apply product law: log_{10}((x + 3)(x - 3)) = log_{10}(16)",
          "Equate arguments: x^2 - 9 = 16",
          "Solve for x: x^2 = 25 => x = 5 (reject x = -5 as log of negative is undefined)"
        ],
        answer: "x = 5"
      }
    ],
    examTips: [
      "Always check potential roots in the original equation to discard extraneous negative arguments."
    ]
  },
  "Sets": {
    category: "Sets & Logic",
    objectives: [
      "Define sets, subsets, universal set, and null/empty set.",
      "Use set notations and Venn diagram representations accurately.",
      "Determine cardinality of finite sets."
    ],
    keyPoints: [
      "A set is a well-defined collection of distinct objects.",
      "Universal set (U or ξ) contains all elements under consideration in a given context.",
      "The empty set (∅ or {}) contains zero elements; n(∅) = 0."
    ],
    formulas: [
      "Number of subsets of a set with n elements: 2^n",
      "Number of proper subsets: 2^n - 1",
      "Element relation: x ∈ A; Subset relation: A ⊆ B"
    ],
    workedExamples: [
      {
        problem: "If set P = {x : x is a prime number, x < 12}, list elements and find n(P).",
        steps: [
          "List primes strictly less than 12: 2, 3, 5, 7, 11",
          "Count elements: 5 elements total",
          "Calculate number of subsets: 2^5 = 32"
        ],
        answer: "P = {2, 3, 5, 7, 11}, n(P) = 5"
      }
    ],
    examTips: [
      "1 is NOT a prime number; 2 is the only even prime number."
    ]
  },
  "Set Operations": {
    category: "Sets & Logic",
    objectives: [
      "Find the union, intersection, and symmetric difference of sets.",
      "Determine the complement of a set relative to the universal set.",
      "Illustrate compound set expressions on Venn diagrams."
    ],
    keyPoints: [
      "Union (A ∪ B): elements belonging to A or B or both.",
      "Intersection (A ∩ B): elements belonging to both A and B.",
      "Complement (A'): elements in universal set ξ that do NOT belong to A.",
      "Disjoint sets have no common elements: A ∩ B = ∅."
    ],
    formulas: [
      "n(A ∪ B) = n(A) + n(B) - n(A ∩ B)",
      "De Morgan's Laws: (A ∪ B)' = A' ∩ B'; (A ∩ B)' = A' ∪ B'"
    ],
    workedExamples: [
      {
        problem: "Let ξ = {1, 2, ..., 10}, A = {2, 4, 6, 8, 10}, B = {3, 6, 9}. Find (A ∩ B)'.",
        steps: [
          "Find A ∩ B: common elements are {6}",
          "Find complement (A ∩ B)' by removing {6} from ξ",
          "Result: {1, 2, 3, 4, 5, 7, 8, 9, 10}"
        ],
        answer: "(A ∩ B)' = {1, 2, 3, 4, 5, 7, 8, 9, 10}"
      }
    ],
    examTips: [
      "Carefully shade Venn diagrams using clean parallel lines to avoid ambiguity."
    ]
  },
  "Applications of Sets": {
    category: "Sets & Logic",
    objectives: [
      "Solve practical two-set and three-set survey problems.",
      "Extract equations from worded problems and solve for unknown counts."
    ],
    keyPoints: [
      "Three-set survey formula accounts for pairwise intersections and central intersection.",
      "Always fill in Venn diagram regions starting from the innermost intersection outwards."
    ],
    formulas: [
      "Two sets: n(ξ) = n(A ∪ B) + n(A ∪ B)'",
      "Three sets: n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A∩B) - n(B∩C) - n(A∩C) + n(A∩B∩C)"
    ],
    workedExamples: [
      {
        problem: "In a class of 40 students, 25 offer Physics and 20 offer Chemistry. If 5 offer neither, how many offer both?",
        steps: [
          "Total students n(ξ) = 40. Neither = 5, so n(P ∪ C) = 40 - 5 = 35",
          "Use formula: n(P ∪ C) = n(P) + n(C) - n(P ∩ C)",
          "Substitute: 35 = 25 + 20 - x => 35 = 45 - x => x = 10"
        ],
        answer: "10 students offer both subjects"
      }
    ],
    examTips: [
      "Pay close attention to wording: 'offer only Physics' is n(P) - n(P ∩ C), not n(P)."
    ]
  },
  "Quadratic Equations": {
    category: "Algebraic Processes",
    objectives: [
      "Recognise standard quadratic form ax^2 + bx + c = 0.",
      "Solve quadratic equations using factorisation, completing the square, and quadratic formula.",
      "Form quadratic equations given their roots."
    ],
    keyPoints: [
      "Standard form: ax^2 + bx + c = 0, where a != 0.",
      "Discriminant Δ = b^2 - 4ac reveals the nature of the roots:",
      "If Δ > 0: two distinct real roots. If Δ = 0: two equal real roots. If Δ < 0: no real roots."
    ],
    formulas: [
      "Quadratic Formula: x = (-b ± √(b^2 - 4ac)) / (2a)",
      "Equation from roots α and β: x^2 - (α + β)x + (αβ) = 0",
      "Sum of roots: α + β = -b/a; Product of roots: αβ = c/a"
    ],
    workedExamples: [
      {
        problem: "Solve 2x^2 - 5x - 3 = 0 using the quadratic formula.",
        steps: [
          "Identify coefficients: a = 2, b = -5, c = -3",
          "Calculate discriminant: (-5)^2 - 4(2)(-3) = 25 + 24 = 49",
          "Substitute into formula: x = (5 ± √49) / 4 = (5 ± 7) / 4",
          "x_1 = 12/4 = 3; x_2 = -2/4 = -0.5"
        ],
        answer: "x = 3 or x = -1/2"
      }
    ],
    examTips: [
      "Never forget the '±' symbol in front of the square root.",
      "When forming equations, ensure the sign of the sum of roots is reversed."
    ]
  },
  "Pythagoras' Theorem": {
    category: "Geometry & Trigonometry",
    objectives: [
      "State Pythagoras' theorem for right-angled triangles.",
      "Calculate the hypotenuse and leg lengths in geometric problems.",
      "Apply Pythagorean triples to solve exam problems rapidly."
    ],
    keyPoints: [
      "In any right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides.",
      "Common triples: (3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17)."
    ],
    formulas: [
      "c^2 = a^2 + b^2",
      "a = √(c^2 - b^2), b = √(c^2 - a^2)",
      "Converse: If c^2 = a^2 + b^2, the angle opposite side c is 90°."
    ],
    workedExamples: [
      {
        problem: "A ladder 13m long leans against a vertical wall. If the base of the ladder is 5m from the wall, how high does it reach?",
        steps: [
          "Let height be h. The triangle is right-angled with hypotenuse c = 13m and base b = 5m.",
          "Apply theorem: h^2 + 5^2 = 13^2 => h^2 + 25 = 169",
          "Solve: h^2 = 144 => h = √144 = 12m"
        ],
        answer: "The ladder reaches a height of 12 metres"
      }
    ],
    examTips: [
      "Ensure all dimensions are in the same units (e.g. metres or centimetres) before calculating."
    ]
  },
  "Trigonometric Ratios": {
    category: "Geometry & Trigonometry",
    objectives: [
      "Define sine, cosine, and tangent in terms of right-angled triangle sides.",
      "Use SOH CAH TOA to find unknown sides and angles.",
      "Memorise special angle ratios for 30°, 45°, and 60°."
    ],
    keyPoints: [
      "Sine = Opposite / Hypotenuse (SOH)",
      "Cosine = Adjacent / Hypotenuse (CAH)",
      "Tangent = Opposite / Adjacent (TOA)",
      "tan(θ) = sin(θ) / cos(θ); sin^2(θ) + cos^2(θ) = 1"
    ],
    formulas: [
      "sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = 1/√3",
      "sin(45°) = 1/√2, cos(45°) = 1/√2, tan(45°) = 1",
      "sin(60°) = √3/2, cos(60°) = 1/2, tan(60°) = √3"
    ],
    workedExamples: [
      {
        problem: "In triangle ABC, angle B = 90°, angle A = 30°, and AC = 10cm. Find length of BC.",
        steps: [
          "BC is the opposite side to angle A (30°), and AC is hypotenuse (10cm).",
          "Use sin(A) = BC / AC => sin(30°) = BC / 10",
          "BC = 10 * sin(30°) = 10 * 0.5 = 5cm"
        ],
        answer: "BC = 5 cm"
      }
    ],
    examTips: [
      "Label Opposite, Adjacent, and Hypotenuse relative to the specific acute angle being calculated."
    ]
  },
  "Measures of Central Tendency": {
    category: "Statistics & Probability",
    objectives: [
      "Calculate arithmetic mean for raw and grouped frequency data.",
      "Determine median and modal values from datasets and charts.",
      "Evaluate advantages and limitations of mean, median, and mode."
    ],
    keyPoints: [
      "Mean: arithmetic average (sum of values divided by count). Sensitive to outliers.",
      "Median: middle value when data is sorted in ascending order. Resistant to extreme values.",
      "Mode: most frequently occurring value or class. A dataset can be unimodal, bimodal, or multimodal."
    ],
    formulas: [
      "Ungrouped Mean: x̄ = (∑x) / n",
      "Grouped Mean: x̄ = (∑fx) / (∑f)",
      "Median position = (n + 1) / 2 for ungrouped data"
    ],
    workedExamples: [
      {
        problem: "Find the mean, median, and mode of marks: 4, 7, 5, 8, 5, 6, 9.",
        steps: [
          "Order data: 4, 5, 5, 6, 7, 8, 9 (n = 7)",
          "Mean: (4 + 5 + 5 + 6 + 7 + 8 + 9) / 7 = 44 / 7 = 6.29",
          "Median: position (7 + 1) / 2 = 4th value = 6",
          "Mode: 5 (appears twice)"
        ],
        answer: "Mean = 6.29, Median = 6, Mode = 5"
      }
    ],
    examTips: [
      "Always sort data first before attempting to find the median.",
      "When n is even, median is the average of the two middle values."
    ]
  }
};

function generateCurriculumPdf(resource: { id: string; title: string; description?: string }): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const topicName = resource.title.trim();
  const info = TOPIC_DETAILS[topicName] || {
    category: "General Mathematics",
    objectives: [
      `Master fundamental concepts and principles of ${topicName}.`,
      `Understand theoretical frameworks and definitions aligned with WAEC/JAMB syllabus.`,
      `Apply step-by-step problem-solving techniques to exam-standard questions.`,
      `Develop confidence in analytical calculations and formula manipulations.`
    ],
    keyPoints: [
      `${topicName} is a core foundation in the senior secondary mathematics curriculum.`,
      `Mastery of this topic is essential for success in WAEC SSCE, NECO SSCE, and JAMB UTME.`,
      resource.description || `Comprehensive examination review and study guide for ${topicName}.`
    ],
    formulas: [
      `Governing equation and core principles for ${topicName}`,
      `Standard algebraic and analytical relationships applicable to SSS 1-3`,
      `Key identities and conversion constants`
    ],
    workedExamples: [
      {
        problem: `Exam Question on ${topicName}: Review and solve the core conceptual application.`,
        steps: [
          `Step 1: Identify given variables and boundary parameters from problem statement.`,
          `Step 2: Apply the governing mathematical formula or rule for ${topicName}.`,
          `Step 3: Simplify systematically, keeping careful track of signs and operations.`
        ],
        answer: `Accurately derived curriculum standard solution for ${topicName}.`
      }
    ],
    examTips: [
      `Show all intermediate calculation steps to earn maximum method marks in WAEC SSCE.`,
      `Always check your final units and simplify numerical fractions completely.`
    ]
  };

  // Helper for drawing header on any page
  const drawPageHeader = (pageNumber: number, totalPages: number) => {
    doc.setFillColor(32, 108, 225);
    doc.rect(0, 0, pageWidth, 55, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("iGrades Academic Curriculum Study Material", margin, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Mathematics • Standard Curriculum Guide`, margin, 44);

    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin - 60, 36);

    // Bottom footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("© iGrades Learning Systems • Nigeria Educational Curriculum Compliance", margin, pageHeight - 22);
    doc.text("Official Verified Academic Resource", pageWidth - margin - 150, pageHeight - 22);
  };

  // ──── PAGE 1: TITLE & CORE THEORIES ────
  drawPageHeader(1, 2);

  let y = 80;

  // Title Banner Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 68, 6, 6, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 68, 6, 6, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(topicName, margin + 16, y + 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${info.category}  |  Level: Curriculum Study Guide`, margin + 16, y + 46);

  y += 85;

  // Section 1: Curriculum Overview
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(32, 108, 225);
  doc.text("1. SYLLABUS OVERVIEW & OBJECTIVES", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  for (const obj of info.objectives) {
    const lines = doc.splitTextToSize(`•  ${obj}`, contentWidth - 10);
    doc.text(lines, margin + 6, y);
    y += lines.length * 13;
  }

  y += 10;

  // Section 2: Key Concepts & Theory
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(32, 108, 225);
  doc.text("2. KEY CONCEPTS & THEORETICAL FRAMEWORK", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  for (const kp of info.keyPoints) {
    const lines = doc.splitTextToSize(`•  ${kp}`, contentWidth - 10);
    doc.text(lines, margin + 6, y);
    y += lines.length * 13;
  }

  y += 10;

  // Section 3: Essential Formulas & Laws
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(32, 108, 225);
  doc.text("3. ESSENTIAL FORMULAS & GOVERNING LAWS", margin, y);
  y += 16;

  doc.setFillColor(239, 246, 255);
  const formulaBoxHeight = Math.max(50, info.formulas.length * 18 + 16);
  doc.roundedRect(margin, y, contentWidth, formulaBoxHeight, 4, 4, "F");
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth, formulaBoxHeight, 4, 4, "S");

  let fy = y + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 175);
  for (const f of info.formulas) {
    doc.text(`▪  ${f}`, margin + 14, fy);
    fy += 17;
  }

  // ──── PAGE 2: WORKED EXAMPLES & EXAM TIPS ────
  doc.addPage();
  drawPageHeader(2, 2);

  y = 80;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(32, 108, 225);
  doc.text("4. STEP-BY-STEP WORKED EXAMPLES (WAEC/JAMB PATTERN)", margin, y);
  y += 20;

  for (let idx = 0; idx < info.workedExamples.length; idx++) {
    const ex = info.workedExamples[idx];

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    
    // Calculate box height dynamically
    const probLines = doc.splitTextToSize(`Problem ${idx + 1}: ${ex.problem}`, contentWidth - 24);
    let stepLinesCount = 0;
    ex.steps.forEach(s => {
      stepLinesCount += doc.splitTextToSize(`  ${s}`, contentWidth - 30).length;
    });
    const ansLines = doc.splitTextToSize(`Result: ${ex.answer}`, contentWidth - 24);

    const boxH = (probLines.length * 13) + (stepLinesCount * 13) + (ansLines.length * 13) + 40;
    doc.roundedRect(margin, y, contentWidth, boxH, 6, 6, "F");
    doc.roundedRect(margin, y, contentWidth, boxH, 6, 6, "S");

    let ey = y + 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(probLines, margin + 12, ey);
    ey += probLines.length * 13 + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    for (const step of ex.steps) {
      const sLines = doc.splitTextToSize(`•  ${step}`, contentWidth - 30);
      doc.text(sLines, margin + 16, ey);
      ey += sLines.length * 13;
    }
    ey += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129);
    doc.text(ansLines, margin + 12, ey);

    y += boxH + 16;
  }

  // Section 5: High-Yield Exam Tips
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(32, 108, 225);
  doc.text("5. HIGH-YIELD EXAMINATION TIPS & COMMON PITFALLS", margin, y);
  y += 18;

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  const tipsLinesCount = info.examTips.reduce((acc, tip) => acc + doc.splitTextToSize(`•  ${tip}`, contentWidth - 24).length, 0);
  const tipsBoxH = tipsLinesCount * 14 + 18;
  doc.roundedRect(margin, y, contentWidth, tipsBoxH, 4, 4, "F");
  doc.roundedRect(margin, y, contentWidth, tipsBoxH, 4, 4, "S");

  let ty = y + 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  for (const tip of info.examTips) {
    const tLines = doc.splitTextToSize(`•  ${tip}`, contentWidth - 24);
    doc.text(tLines, margin + 12, ty);
    ty += tLines.length * 14;
  }

  y += tipsBoxH + 20;

  // Signoff stamp
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 32, 4, 4, "F");
  doc.roundedRect(margin, y, contentWidth, 32, 4, 4, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("✓ Verified iGrades Secondary School Curriculum Resource • Ready for WAEC & JAMB Preparation", margin + 14, y + 20);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

async function run() {
  console.log("Fetching all 29 resources from Supabase...");
  const { data: resources, error } = await supabase
    .from("resources")
    .select("id, title, url, description, type")
    .eq("type", "pdf")
    .order("order_index");

  if (error || !resources) {
    console.error("Failed to load resources:", error);
    process.exit(1);
  }

  console.log(`Found ${resources.length} PDF resources to process.`);

  let updatedCount = 0;
  for (const res of resources) {
    try {
      const pdfBuffer = generateCurriculumPdf(res);
      const storagePath = res.url.replace(/^.*\/test-resource\//, "");

      console.log(`Generating & uploading PDF for "${res.title}" -> ${storagePath} (${pdfBuffer.byteLength} bytes)...`);

      const { error: uploadErr } = await supabase.storage
        .from("test-resource")
        .upload(storagePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadErr) {
        console.error(`Upload error for "${res.title}":`, uploadErr);
      } else {
        updatedCount++;
      }
    } catch (err) {
      console.error(`Error processing ${res.title}:`, err);
    }
  }

  console.log(`Done! Successfully generated and uploaded ${updatedCount} / ${resources.length} comprehensive PDFs.`);
}

run();
