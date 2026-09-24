const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const outDir = path.resolve("./public/curriculum-pdfs");
fs.mkdirSync(outDir, { recursive: true });

const pdfDefinitions = [
  {
    fileName: "quadratic_equations_notes.pdf",
    title: "Quadratic Equations Mastery Notes",
    subject: "Mathematics (SSS 1)",
    color: [37, 99, 235],
    pages: [
      {
        title: "1. Fundamentals of Quadratic Equations",
        sections: [
          {
            heading: "Standard Form & Definition",
            body: "A quadratic equation is a second-degree polynomial equation involving a single variable x. The standard algebraic form is:\nax² + bx + c = 0 (where a ≠ 0, and a, b, c are real numbers).\n\nRoots or solutions represent the x-intercepts of the quadratic parabola where y = 0."
          },
          {
            heading: "Core Solution Methods",
            body: "1. Factorization Method: Used when ax² + bx + c can be factored into (px + q)(rx + s) = 0.\n2. Completing the Square: Moving constant c to RHS, adding (b/2a)² to both sides.\n3. Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a).\n4. Graphical Resolution: Plotting parabola and reading off points where curve intersects x-axis."
          }
        ]
      },
      {
        title: "2. Discriminant & Nature of Roots",
        sections: [
          {
            heading: "Discriminant Rule: Δ = b² - 4ac",
            body: "• If Δ > 0: Two distinct real roots.\n• If Δ = 0: Two coincident/equal real roots.\n• If Δ < 0: No real roots (roots are complex conjugate).\n• If Δ is a perfect square: Roots are rational numbers."
          },
          {
            heading: "Worked Example: 2x² - 7x + 3 = 0",
            body: "Given: a = 2, b = -7, c = 3.\nΔ = (-7)² - 4(2)(3) = 49 - 24 = 25.\nx = [-(-7) ± √25] / (2 × 2) = (7 ± 5) / 4.\nx₁ = (7 + 5)/4 = 3\nx₂ = (7 - 5)/4 = 0.5\nFinal roots: x = 3 or x = 1/2."
          }
        ]
      },
      {
        title: "3. Practice Exercises & Exam Strategies",
        sections: [
          {
            heading: "Practice Questions",
            body: "1. Solve by factorization: 3x² - 10x + 8 = 0.\n2. If α and β are roots of x² - 5x + 6 = 0, find the value of α² + β².\n3. Find the value of k for which x² - kx + 9 = 0 has equal roots."
          },
          {
            heading: "High-Yield WAEC & JAMB Tips",
            body: "• Remember that (α + β) = -b/a and αβ = c/a.\n• Watch your signs! Subtracting a negative b creates a positive numerator.\n• When completing the square, ensure the leading coefficient a is normalized to 1 first."
          }
        ]
      }
    ]
  },
  {
    fileName: "number_bases_guide.pdf",
    title: "Number Bases & Modular Arithmetic Guide",
    subject: "Mathematics (SSS 1)",
    color: [37, 99, 235],
    pages: [
      {
        title: "1. Number Base Representation & Conversions",
        sections: [
          {
            heading: "Base System Foundations",
            body: "A number system is defined by its base (radix) b. A numeral in base b employs digits from 0 to (b - 1).\nBase 10 = Decimal (Denary)\nBase 2 = Binary (used in computing)\nBase 8 = Octal, Base 16 = Hexadecimal."
          },
          {
            heading: "Conversion Methods",
            body: "• Any Base to Base 10: Expand each digit by multiplying with base raised to its place value.\nExample: 1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13₁₀.\n\n• Base 10 to Any Base: Continuous division by target base and collecting remainders in reverse order."
          }
        ]
      },
      {
        title: "2. Binary Arithmetic & Modular Arithmetic",
        sections: [
          {
            heading: "Binary Addition Rules",
            body: "0 + 0 = 0\n0 + 1 = 1\n1 + 0 = 1\n1 + 1 = 10₂ (0 carry 1)\n1 + 1 + 1 = 11₂ (1 carry 1)"
          },
          {
            heading: "Modular (Clock) Arithmetic",
            body: "In arithmetic modulo n, numbers wrap around after reaching n.\na ≡ b (mod n) means that (a - b) is evenly divisible by n.\nExample: In modulo 7 (Days of the week), 15 (mod 7) = 1 because 15 = 2×7 + 1."
          }
        ]
      },
      {
        title: "3. Examination Questions & Solutions",
        sections: [
          {
            heading: "Sample Problem",
            body: "Solve for x if 24_x = 18_10.\nSolution: 2(x¹) + 4(x⁰) = 18\n2x + 4 = 18\n2x = 14 => x = 7.\nVerify: In base 7, digits 2 and 4 are valid since both are less than 7."
          },
          {
            heading: "Quick Reference Tips",
            body: "• The maximum digit in base n is always (n - 1).\n• Multiplicative inverse of a modulo m exists if and only if gcd(a, m) = 1."
          }
        ]
      }
    ]
  },
  {
    fileName: "algebraic_expressions_workbook.pdf",
    title: "Algebraic Expressions & Factorization",
    subject: "Mathematics (SSS 1)",
    color: [37, 99, 235],
    pages: [
      {
        title: "1. Expansion & Special Products",
        sections: [
          {
            heading: "Key Algebraic Identities",
            body: "• (a + b)² = a² + 2ab + b²\n• (a - b)² = a² - 2ab + b²\n• Difference of Two Squares: a² - b² = (a - b)(a + b)\n• (a + b)³ = a³ + 3a²b + 3ab² + b³"
          },
          {
            heading: "Expanding Polynomials",
            body: "Use the distributive law for multiplying expressions:\n(2x + 3)(3x - 4) = 6x² - 8x + 9x - 12 = 6x² + x - 12."
          }
        ]
      },
      {
        title: "2. Factorization Techniques",
        sections: [
          {
            heading: "Factorization by Grouping",
            body: "For 4-term expressions: ax + ay + bx + by = a(x + y) + b(x + y) = (a + b)(x + y)."
          },
          {
            heading: "Simplifying Algebraic Fractions",
            body: "To simplify algebraic fractions, factorize numerator and denominator completely, then cancel common factors. Never cancel individual terms across addition or subtraction signs."
          }
        ]
      }
    ]
  },
  {
    fileName: "english_grammar_concord.pdf",
    title: "English Concord & Grammar Workbook",
    subject: "English Language (SSS 1 & 2)",
    color: [147, 51, 234],
    pages: [
      {
        title: "1. Subject-Verb Concord Rules",
        sections: [
          {
            heading: "The Basic Principle",
            body: "A singular subject takes a singular verb, whereas a plural subject takes a plural verb.\nExample: The student reads books daily. / The students read books daily."
          },
          {
            heading: "Proximity Rule & Parenthetical Expressions",
            body: "Words introduced by phrases like 'as well as', 'together with', 'in addition to', 'accompanied by' do not affect the grammatical subject.\nExample: The teacher, together with her students, IS attending the conference."
          }
        ]
      },
      {
        title: "2. Correlative Conjunctions & Indefinite Pronouns",
        sections: [
          {
            heading: "Either/Neither Agreement",
            body: "With 'Either...or' and 'Neither...nor', the verb agrees with the closer subject.\nExample: Neither the principal nor the teachers were present.\nNeither the teachers nor the principal was present."
          },
          {
            heading: "Indefinite Pronouns",
            body: "'Each', 'Everyone', 'Somebody', 'Nobody', 'Either' universally take singular verbs in formal English.\nExample: Each of the candidates is qualified."
          }
        ]
      }
    ]
  },
  {
    fileName: "physics_motion_mechanics.pdf",
    title: "Newtonian Mechanics & Motion Handbook",
    subject: "Physics (SSS 1 & 2)",
    color: [13, 148, 136],
    pages: [
      {
        title: "1. Kinematics: Equations of Linear Motion",
        sections: [
          {
            heading: "The 4 Equations of Uniform Acceleration",
            body: "1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as\n4. s = [(u + v)/2] × t\n\nWhere u = initial velocity (m/s), v = final velocity (m/s), a = acceleration (m/s²), t = time (s), s = displacement (m)."
          },
          {
            heading: "Motion Under Gravity",
            body: "For bodies moving vertically upward: a = -g (-9.8 m/s² or -10 m/s²).\nAt maximum height, vertical velocity v = 0 m/s."
          }
        ]
      },
      {
        title: "2. Newton's Laws of Motion & Momentum",
        sections: [
          {
            heading: "Newton's Three Laws",
            body: "First Law (Inertia): A body continues in its state of rest or uniform motion unless acted upon by an external net force.\nSecond Law: F = dp/dt = ma (Force equals mass times acceleration).\nThird Law: Action and reaction are equal in magnitude and opposite in direction."
          },
          {
            heading: "Conservation of Linear Momentum",
            body: "Total momentum before collision = Total momentum after collision:\nm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂."
          }
        ]
      }
    ]
  },
  {
    fileName: "chemistry_matter_bonding.pdf",
    title: "Atomic Structure & Chemical Bonding Digest",
    subject: "Chemistry (SSS 1)",
    color: [225, 29, 72],
    pages: [
      {
        title: "1. Atomic Structure & Electron Configuration",
        sections: [
          {
            heading: "Subatomic Particles",
            body: "• Protons: Mass = 1 amu, Charge = +1, located in nucleus.\n• Neutrons: Mass = 1 amu, Charge = 0, located in nucleus.\n• Electrons: Mass ≈ 1/1840 amu, Charge = -1, orbit in shells (K, L, M, N)."
          },
          {
            heading: "Valence & Octet Rule",
            body: "Atoms tend to gain, lose, or share electrons to achieve a stable electronic configuration of 8 valence electrons (or 2 for Helium)."
          }
        ]
      },
      {
        title: "2. Types of Chemical Bonds",
        sections: [
          {
            heading: "Electrovalent (Ionic) Bonding",
            body: "Occurs between metals and non-metals via complete transfer of electrons (e.g. NaCl, MgO).\nProperties: High melting/boiling points, conduct electricity in molten or aqueous state."
          },
          {
            heading: "Covalent & Coordinate Bonding",
            body: "Formed when atoms share electron pairs (e.g. H₂O, CH₄, NH₃).\nDative (Coordinate) bond: Both shared electrons are provided by one atom."
          }
        ]
      }
    ]
  },
  {
    fileName: "biology_cell_structure.pdf",
    title: "Organization of Life & Cell Biology Handbook",
    subject: "Biology (SSS 1)",
    color: [22, 163, 74],
    pages: [
      {
        title: "1. Levels of Organization of Life",
        sections: [
          {
            heading: "Hierarchical Structure",
            body: "1. Cell: Smallest basic unit of life (e.g. Amoeba, Paramecium).\n2. Tissue: Group of similar cells performing a specific function (e.g. xylem, blood).\n3. Organ: Group of tissues working together (e.g. leaf, heart).\n4. System: Group of organs functioning together (e.g. digestive, circulatory system).\n5. Organism: The complete living entity."
          },
          {
            heading: "Cell Theory",
            body: "Formulated by Schleiden and Schwann:\n• All living things are composed of one or more cells.\n• The cell is the structural and functional unit of life.\n• All cells arise from pre-existing cells."
          }
        ]
      },
      {
        title: "2. Plant vs Animal Cells & Organelles",
        sections: [
          {
            heading: "Key Organelles & Their Functions",
            body: "• Nucleus: Controls cellular activities and houses genetic material (DNA).\n• Mitochondria: Powerhouse of the cell; site of ATP generation via respiration.\n• Ribosomes: Sites of protein synthesis.\n• Chloroplasts: Contain chlorophyll for photosynthesis (plants only)."
          },
          {
            heading: "Differences Between Plant and Animal Cells",
            body: "• Plant Cells: Possess rigid cellulose cell wall, large central vacuole, and chloroplasts.\n• Animal Cells: Lack cell walls and chloroplasts; possess centrioles and small scattered vacuoles."
          }
        ]
      }
    ]
  }
];

pdfDefinitions.forEach((def) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  def.pages.forEach((p, idx) => {
    if (idx > 0) doc.addPage();

    // Top Brand Bar
    doc.setFillColor(def.color[0], def.color[1], def.color[2]);
    doc.rect(0, 0, pageWidth, 52, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("iGrades Academic Curriculum", 36, 32);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(def.subject, pageWidth - 36, 32, { align: "right" });

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(p.title || def.title, 36, 84);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Page " + (idx + 1) + " of " + def.pages.length + "  •  Official WAEC & JAMB Syllabus Guide",
      36,
      102
    );

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(36, 112, pageWidth - 36, 112);

    // Sections
    let y = 134;
    p.sections.forEach((sec) => {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(36, y - 14, pageWidth - 72, 22, 4, 4, "F");
      doc.setTextColor(def.color[0], def.color[1], def.color[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(sec.heading, 44, y);
      y += 24;

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(sec.body, pageWidth - 72);
      doc.text(lines, 36, y);
      y += lines.length * 14 + 18;
    });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(36, pageHeight - 38, pageWidth - 36, pageHeight - 38);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("© 2026 iGrades • Official Student Academic Material", 36, pageHeight - 22);
    doc.text(
      "Page " + (idx + 1) + " of " + def.pages.length,
      pageWidth - 36,
      pageHeight - 22,
      { align: "right" }
    );
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));
  const outPath = path.join(outDir, def.fileName);
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", def.fileName, "Size:", buffer.length, "bytes");
});
