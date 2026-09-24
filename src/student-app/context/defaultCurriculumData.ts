// src/student-app/context/defaultCurriculumData.ts
import type { Subject, Class, Topic, Resource } from "./dataContext";

export const DEFAULT_CLASSES: Class[] = [
  { id: "class-jss1", name: "JSS 1", description: "Junior Secondary School 1" },
  { id: "class-jss2", name: "JSS 2", description: "Junior Secondary School 2" },
  { id: "class-jss3", name: "JSS 3", description: "Junior Secondary School 3" },
  { id: "class-sss1", name: "SSS 1", description: "Senior Secondary School 1" },
  { id: "class-sss2", name: "SSS 2", description: "Senior Secondary School 2" },
  { id: "class-sss3", name: "SSS 3", description: "Senior Secondary School 3" },
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-math", name: "Mathematics", display_name: "Mathematics", description: "Core Mathematics curriculum covering Number Systems, Algebra, Geometry, Statistics, and Calculus." },
  { id: "sub-eng", name: "English", display_name: "English Language", description: "Grammar, Lexis and Structure, Oral English, Essay Writing, and Reading Comprehension." },
  { id: "sub-phy", name: "Physics", display_name: "Physics", description: "Mechanics, Heat, Waves, Electricity, Magnetism, Optics, and Modern Physics." },
  { id: "sub-chem", name: "Chemistry", display_name: "Chemistry", description: "Atomic structure, Chemical Bonding, Stoichiometry, Organic Chemistry, and Electrochemistry." },
  { id: "sub-bio", name: "Biology", display_name: "Biology", description: "Living Organisms, Cell Biology, Nutrition, Genetics, Ecology, and Human Physiology." },
  { id: "sub-bsci", name: "Basic Science", display_name: "Basic Science", description: "Fundamental scientific principles, living systems, energy, and physical phenomena." },
  { id: "sub-btech", name: "Basic Technology", display_name: "Basic Technology", description: "Technical drawing, materials processing, tools, mechanics, and electronics basics." },
  { id: "sub-civic", name: "Civic Education", display_name: "Civic Education", description: "Rights and responsibilities, governance, rule of law, and national values." },
  { id: "sub-soc", name: "Social Studies", display_name: "Social Studies", description: "Human environment, culture, social issues, and contemporary institutions." },
  { id: "sub-agric", name: "Agricultural Science", display_name: "Agricultural Science", description: "Crop production, soil science, animal husbandry, and agricultural economics." },
  { id: "sub-econ", name: "Economics", display_name: "Economics", description: "Microeconomics, Macroeconomics, Market Structures, Public Finance, and Trade." },
  { id: "sub-fmath", name: "Further Mathematics", display_name: "Further Mathematics", description: "Advanced Pure Mathematics, Vectors, Mechanics, and Probability Distributions." },
  { id: "sub-comp", name: "Computer Studies", display_name: "Computer Studies", description: "Hardware, Software, Algorithms, Data Processing, and Digital Literacy." },
  { id: "sub-gov", name: "Government", display_name: "Government", description: "Political theories, Nigerian constitutional history, international relations, and public policy." },
  { id: "sub-comm", name: "Commerce", display_name: "Commerce", description: "Trade, banking, warehousing, insurance, transport, and consumer protection." },
  { id: "sub-acc", name: "Accounting", display_name: "Accounting", description: "Bookkeeping, financial statements, cashbooks, control accounts, and ledger balancing." },
  { id: "sub-lit", name: "Literature", display_name: "Literature in English", description: "Prose, Drama, Poetry, Literary Devices, and African and Non-African works." },
  { id: "sub-geo", name: "Geography", display_name: "Geography", description: "Physical geography, map reading, human geography, climate, and environmental studies." },
  { id: "sub-hist", name: "History", display_name: "History", description: "Pre-colonial Africa, Nigerian history, World civilizations, and international treaties." },
  { id: "sub-french", name: "French", display_name: "French", description: "French vocabulary, grammar, reading comprehension, and conversational dialogue." },
];

export const DEFAULT_TOPICS: Topic[] = [
  // Mathematics
  { id: "top-math-1", name: "Number Bases and Modular Arithmetic", subject_id: "sub-math", class_id: "class-sss1", order_index: 1 },
  { id: "top-math-2", name: "Algebraic Expressions & Factorization", subject_id: "sub-math", class_id: "class-sss1", order_index: 2 },
  { id: "top-math-3", name: "Quadratic Equations and Functions", subject_id: "sub-math", class_id: "class-sss1", order_index: 3 },
  { id: "top-math-4", name: "Logarithms and Indices", subject_id: "sub-math", class_id: "class-sss2", order_index: 1 },
  { id: "top-math-5", name: "Trigonometry & Bearing", subject_id: "sub-math", class_id: "class-sss2", order_index: 2 },
  { id: "top-math-6", name: "Calculus: Differentiation & Integration", subject_id: "sub-math", class_id: "class-sss3", order_index: 1 },
  { id: "top-math-7", name: "Whole Numbers & Basic Operations", subject_id: "sub-math", class_id: "class-jss1", order_index: 1 },
  { id: "top-math-8", name: "Fractions, Decimals and Percentages", subject_id: "sub-math", class_id: "class-jss1", order_index: 2 },

  // English
  { id: "top-eng-1", name: "Parts of Speech & Sentence Construction", subject_id: "sub-eng", class_id: "class-sss1", order_index: 1 },
  { id: "top-eng-2", name: "Reading Comprehension & Summary Skills", subject_id: "sub-eng", class_id: "class-sss1", order_index: 2 },
  { id: "top-eng-3", name: "Lexis, Concord & Idiomatic Expressions", subject_id: "sub-eng", class_id: "class-sss2", order_index: 1 },
  { id: "top-eng-4", name: "Phonology, Vowel and Consonant Sounds", subject_id: "sub-eng", class_id: "class-sss3", order_index: 1 },

  // Physics
  { id: "top-phy-1", name: "Units, Dimensions & Physical Quantities", subject_id: "sub-phy", class_id: "class-sss1", order_index: 1 },
  { id: "top-phy-2", name: "Motion, Speed, Velocity & Acceleration", subject_id: "sub-phy", class_id: "class-sss1", order_index: 2 },
  { id: "top-phy-3", name: "Newton's Laws of Motion & Momentum", subject_id: "sub-phy", class_id: "class-sss1", order_index: 3 },
  { id: "top-phy-4", name: "Waves, Sound, Optics & Light Reflection", subject_id: "sub-phy", class_id: "class-sss2", order_index: 1 },
  { id: "top-phy-5", name: "Electric Current, Resistance & Circuits", subject_id: "sub-phy", class_id: "class-sss2", order_index: 2 },
  { id: "top-phy-6", name: "Atomic & Nuclear Physics", subject_id: "sub-phy", class_id: "class-sss3", order_index: 1 },

  // Chemistry
  { id: "top-chem-1", name: "Nature of Matter & Periodic Table", subject_id: "sub-chem", class_id: "class-sss1", order_index: 1 },
  { id: "top-chem-2", name: "Chemical Reactions, Acids, Bases & Salts", subject_id: "sub-chem", class_id: "class-sss1", order_index: 2 },
  { id: "top-chem-3", name: "Gas Laws and Stoichiometry", subject_id: "sub-chem", class_id: "class-sss2", order_index: 1 },
  { id: "top-chem-4", name: "Hydrocarbons & Organic Chemistry", subject_id: "sub-chem", class_id: "class-sss3", order_index: 1 },

  // Biology
  { id: "top-bio-1", name: "Organization of Life & Cell Structure", subject_id: "sub-bio", class_id: "class-sss1", order_index: 1 },
  { id: "top-bio-2", name: "Plant & Animal Nutrition", subject_id: "sub-bio", class_id: "class-sss1", order_index: 2 },
  { id: "top-bio-3", name: "Circulatory & Respiratory Systems", subject_id: "sub-bio", class_id: "class-sss2", order_index: 1 },
  { id: "top-bio-4", name: "Genetics, Heredity & Evolution", subject_id: "sub-bio", class_id: "class-sss3", order_index: 1 },

  // Basic Science
  { id: "top-bsci-1", name: "Living and Non-Living Things", subject_id: "sub-bsci", class_id: "class-jss1", order_index: 1 },
  { id: "top-bsci-2", name: "Energy, Work and Power", subject_id: "sub-bsci", class_id: "class-jss2", order_index: 1 },
  { id: "top-bsci-3", name: "Ecology and Habitat Conservation", subject_id: "sub-bsci", class_id: "class-jss3", order_index: 1 },
];

export const DEFAULT_RESOURCES: Resource[] = [
  {
    id: "res-1",
    title: "Mastering Number Bases & Conversions",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 18,
    type: "video",
    topic_id: "top-math-1",
    order_index: 1,
  },
  {
    id: "res-2",
    title: "Quadratic Equations: Complete Step-by-Step",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 25,
    type: "video",
    topic_id: "top-math-3",
    order_index: 1,
  },
  {
    id: "res-3",
    title: "English Concord & Subject-Verb Agreement",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 15,
    type: "video",
    topic_id: "top-eng-1",
    order_index: 1,
  },
  {
    id: "res-4",
    title: "Newtonian Mechanics & Equations of Motion",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 22,
    type: "video",
    topic_id: "top-phy-2",
    order_index: 1,
  },
  {
    id: "res-5",
    title: "Chemical Bonding and Ionic vs Covalent Compounds",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 20,
    type: "video",
    topic_id: "top-chem-1",
    order_index: 1,
  },
  {
    id: "res-6",
    title: "Cell Structure and Microscopy Walkthrough",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: 19,
    type: "video",
    topic_id: "top-bio-1",
    order_index: 1,
  },
  // ── Curriculum PDF Study Materials ────────────────────────
  {
    id: "res-pdf-1",
    title: "Number Bases & Modular Arithmetic Guide",
    url: "/curriculum-pdfs/number_bases_guide.pdf",
    type: "pdf",
    topic_id: "top-math-1",
    order_index: 2,
    file_size: 12682,
  },
  {
    id: "res-pdf-2",
    title: "Algebraic Expressions & Factorization Workbook",
    url: "/curriculum-pdfs/algebraic_expressions_workbook.pdf",
    type: "pdf",
    topic_id: "top-math-2",
    order_index: 1,
    file_size: 9018,
  },
  {
    id: "res-pdf-3",
    title: "Quadratic Equations Mastery Notes & Practice Sheet",
    url: "/curriculum-pdfs/quadratic_equations_notes.pdf",
    type: "pdf",
    topic_id: "top-math-3",
    order_index: 2,
    file_size: 13410,
  },
  {
    id: "res-pdf-4",
    title: "English Concord & Grammar Workbook",
    url: "/curriculum-pdfs/english_grammar_concord.pdf",
    type: "pdf",
    topic_id: "top-eng-1",
    order_index: 2,
    file_size: 9246,
  },
  {
    id: "res-pdf-5",
    title: "Newtonian Mechanics & Equations of Motion Handbook",
    url: "/curriculum-pdfs/physics_motion_mechanics.pdf",
    type: "pdf",
    topic_id: "top-phy-2",
    order_index: 2,
    file_size: 9258,
  },
  {
    id: "res-pdf-6",
    title: "Atomic Structure & Chemical Bonding Digest",
    url: "/curriculum-pdfs/chemistry_matter_bonding.pdf",
    type: "pdf",
    topic_id: "top-chem-1",
    order_index: 2,
    file_size: 9273,
  },
  {
    id: "res-pdf-7",
    title: "Organization of Life & Cell Biology Handbook",
    url: "/curriculum-pdfs/biology_cell_structure.pdf",
    type: "pdf",
    topic_id: "top-bio-1",
    order_index: 2,
    file_size: 9542,
  },
];
