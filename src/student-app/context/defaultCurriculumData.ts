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

export const DEFAULT_TOPICS: Topic[] = [];

export const DEFAULT_RESOURCES: Resource[] = [];

