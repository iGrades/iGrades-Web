/**
 * Universal Auto-Translation Service
 * Translates every letter, word, component, and page in the application.
 */

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
  { code: "ak", name: "Akan / Twi", nativeName: "Akan (Twi)" },
  { code: "ff", name: "Fulfulde", nativeName: "Fulfulde" },
  { code: "wo", name: "Wolof", nativeName: "Wolof" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
];

// Offline built-in dictionary for instant translation with 0ms latency
const BUILTIN_DICTIONARY: Record<string, Record<string, string>> = {
  ha: {
    "Dashboard": "Gidan Gudanarwa",
    "Home": "Gida",
    "Quiz": "Tambayoyi",
    "Quizzes": "Tambayoyi",
    "Learn": "Koyi",
    "Settings": "Saituna",
    "Students": "Dalibai",
    "Student": "Dalibi",
    "My Classes": "Darussana na",
    "Active Classes": "Darussa Masu Aiki",
    "Registered Courses": "Darussan Rajista",
    "Recent Activity": "Ayyukan Kwanan Nan",
    "Welcome": "Barka da zuwa",
    "Hello": "Sannu",
    "You are doing great": "Kuna yin babban aiki",
    "Login": "Shiga",
    "Log In": "Shiga",
    "Logout": "Fita",
    "Log Out": "Fita",
    "Register": "Yi Rajista",
    "Create Account": "Buɗe Asusun",
    "Sign Up": "Yi Rajista",
    "Sign In": "Shiga",
    "Submit": "Aika",
    "Cancel": "Soke",
    "Save": "Ajiye",
    "Save Changes": "Ajiye Canje-canje",
    "Delete": "Goge",
    "Edit": "Gyara",
    "Update": "Sabunta",
    "Close": "Rufe",
    "Confirm": "Tabbatar",
    "Start Quiz": "Fara Tambayoyi",
    "Start Quiz Now": "Fara Tambayoyi Yanzu",
    "Start Now": "Fara Yanzu",
    "Continue": "Ci gaba",
    "Next": "Na gaba",
    "Previous": "Na baya",
    "Back": "Baya",
    "Finish": "Kammala",
    "Score": "Maki",
    "Points": "Maki",
    "Rewards": "Lada",
    "Rewards Store": "Shagon Lada",
    "Exam Readiness": "Shirin Jarabawa",
    "Study Notes": "Bayanin Karatu",
    "Past Questions": "Tambayoyin Baya",
    "Mathematics": "Lissafi",
    "English Language": "Harshen Turanci",
    "Biology": "Ilimin Halittu",
    "Chemistry": "Sinadarai",
    "Physics": "Kimiyyar Fiziks",
    "Economics": "Tattalin Arziki",
    "Government": "Gwamnati",
    "Literature in English": "Adabin Turanci",
    "Commerce": "Kasuwanci",
    "Accounting": "Kidayar Kudi",
    "Agricultural Science": "Kimiyyar Noma",
    "Geography": "Yanayin Kasa",
    "History": "Tarihi",
    "Civic Education": "Ilimin Kasa da Jama'a",
    "Computer Studies": "Karatun Kwamfuta",
    "Search": "Nema",
    "Filter": "Tace",
    "Download": "Sauke",
    "Notifications": "Sanarwa",
    "Profile": "Fasalin Mai Amfani",
    "Account": "Asusu",
    "Security": "Tsaro",
    "Subscription": "Biyan Kuɗi",
    "Help & Support": "Taimako da Tallafi",
    "Weekly Learning Report": "Rahoton Koyo na Mako",
    "Parent Intelligence": "Fahimtar Iyaye",
    "Subject Performance": "Ayyukan Darussa",
    "Total Points": "Jimillar Maki",
    "Available Credit": "Kudin da ke Akwai",
    "Accuracy": "Daidaito",
    "Questions": "Tambayoyi",
    "Time Remaining": "Lokacin da ya Rage",
    "Explanation": "Bayanai",
    "Correct": "Daidai",
    "Incorrect": "Ba daidai ba",
    "View Progress": "Duba Ci gaba",
    "View Details": "Duba Cikakkun Bayanai",
    "All rights reserved": "An kiyaye duk hakkoki",
    "Terms of Service": "Sharuɗɗan Sabis",
    "Privacy Policy": "Manufar Sirri",
    "Contact Us": "Tuntube Mu",
    "About Us": "Game da Mu",
    "Features": "Ayyuka",
    "Pricing": "Farashi",
    "Get Started": "Fara Yanzu",
    "Learn More": "Koyi Ƙari"
  },
  yo: {
    "Dashboard": "Dasibodu",
    "Home": "Ile",
    "Quiz": "Idanwo Kekere",
    "Quizzes": "Awọn Idanwo",
    "Learn": "Kọ ẹkọ",
    "Settings": "Ètò",
    "Students": "Awọn Akẹkọọ",
    "Student": "Akẹkọọ",
    "My Classes": "Awọn Kilasi Mi",
    "Active Classes": "Awọn Kilasi Ti Nṣiṣẹ",
    "Registered Courses": "Awọn Iwe-ẹkọ Ti O Forukọsilẹ",
    "Recent Activity": "Iṣẹ-ṣiṣe Laipẹ",
    "Welcome": "Kaabọ",
    "Hello": "Pẹlẹ o",
    "You are doing great": "O n ṣe daadaa",
    "Login": "Wọle",
    "Log In": "Wọle",
    "Logout": "Jade",
    "Log Out": "Jade",
    "Register": "Forukọsilẹ",
    "Create Account": "Ṣẹda Akọọlẹ",
    "Sign Up": "Forukọsilẹ",
    "Sign In": "Wọle",
    "Submit": "Firanṣẹ",
    "Cancel": "Fagilee",
    "Save": "Fipamọ",
    "Save Changes": "Fipamọ Awọn Iyipada",
    "Delete": "Pa rẹ",
    "Edit": "Ṣatunkọ",
    "Update": "Ṣe Imudojuiwọn",
    "Close": "Paade",
    "Confirm": "Fi idi rẹ mulẹ",
    "Start Quiz": "Bẹrẹ Idanwo",
    "Start Quiz Now": "Bẹrẹ Idanwo Bayi",
    "Start Now": "Bẹrẹ Bayi",
    "Continue": "Tesiwaju",
    "Next": "Itele",
    "Previous": "Ti tẹlẹ",
    "Back": "Pada",
    "Finish": "Pari",
    "Score": "Dimegilio",
    "Points": "Awọn Ojuami",
    "Rewards": "Awọn Ere",
    "Rewards Store": "Ile itaja Ere",
    "Exam Readiness": "Ipalẹmọ Idanwo",
    "Study Notes": "Awọn Akọsilẹ Ẹkọ",
    "Past Questions": "Awọn Ibeere Ti O Kọja",
    "Mathematics": "Iṣiro",
    "English Language": "Ede Gẹẹsi",
    "Biology": "Iseda",
    "Chemistry": "Kemistri",
    "Physics": "Fisiksi",
    "Economics": "Iṣowo",
    "Government": "Ijoba",
    "Literature in English": "Iwe Kika ni Ede Geesi",
    "Commerce": "Iṣowo ati Titaja",
    "Accounting": "Iṣiro Owo",
    "Agricultural Science": "Imọ-jinlẹ Iṣẹ-ogbin",
    "Geography": "Ẹkọ nipa Ilẹ",
    "History": "Itan",
    "Civic Education": "Ẹkọ Ilu",
    "Computer Studies": "Ẹkọ Kọmputa",
    "Search": "Ṣawari",
    "Filter": "Ajọ",
    "Download": "Gba wọle",
    "Notifications": "Awọn Ifitonileti",
    "Profile": "Profaili",
    "Account": "Akọọlẹ",
    "Security": "Aabo",
    "Subscription": "Iforukọsilẹ Sanwo",
    "Help & Support": "Iranlọwọ & Atilẹyin",
    "Weekly Learning Report": "Ijabọ Ẹkọ Ọsẹ",
    "Parent Intelligence": "Oye Awọn Obi",
    "Subject Performance": "Iṣe Koko-ọrọ",
    "Total Points": "Lapapọ Awọn Ojuami",
    "Available Credit": "Kirẹditi Ti O Wa",
    "Accuracy": "Yiye",
    "Questions": "Awọn ibeere",
    "Time Remaining": "Akoko Ti O Ku",
    "Explanation": "Alaye",
    "Correct": "Ti o pe",
    "Incorrect": "Ti ko tọ",
    "View Progress": "Wo Ilọsiwaju",
    "View Details": "Wo Awọn alaye",
    "All rights reserved": "Gbogbo awọn ẹtọ wa ni ipamọ",
    "Terms of Service": "Awọn Ofin Iṣẹ",
    "Privacy Policy": "Eto Afihan Asiri",
    "Contact Us": "Pe Wa",
    "About Us": "Nipa Wa",
    "Features": "Awọn ẹya ara ẹrọ",
    "Pricing": "Iye owo",
    "Get Started": "Bẹrẹ Bayi",
    "Learn More": "Kọ ẹkọ diẹ si"
  },
  ig: {
    "Dashboard": "Dashboard",
    "Home": "Ụlọ",
    "Quiz": "Ajụjụ",
    "Quizzes": "Ajụjụ Niile",
    "Learn": "Mụta",
    "Settings": "Ntọala",
    "Students": "Ụmụ Akwụkwọ",
    "Student": "Nwa Akwụkwọ",
    "My Classes": "Klas M Niile",
    "Active Classes": "Klas Na-arụ Ọrụ",
    "Registered Courses": "Ihe Ọmụmụ Edebanyere Aha",
    "Recent Activity": "Ihe Emere Na Nso Nso A",
    "Welcome": "Nnọọ",
    "Hello": "Ndewo",
    "You are doing great": "Ị na-eme nke ọma",
    "Login": "Banye",
    "Log In": "Banye",
    "Logout": "Pụọ",
    "Log Out": "Pụọ",
    "Register": "Debanye aha",
    "Create Account": "Mepụta Akaụntụ",
    "Sign Up": "Debanye aha",
    "Sign In": "Banye",
    "Submit": "Nyefee",
    "Cancel": "Kagbuo",
    "Save": "Chekwaa",
    "Save Changes": "Chekwaa Mgbanwe",
    "Delete": "Hichapụ",
    "Edit": "Dezie",
    "Update": "Mmelite",
    "Close": "Mechie",
    "Confirm": "Kwenye",
    "Start Quiz": "Malite Ajụjụ",
    "Start Quiz Now": "Malite Ajụjụ Ugbu a",
    "Start Now": "Malite Ugbu a",
    "Continue": "Gaa n'ihu",
    "Next": "Osote",
    "Previous": "Nke gara aga",
    "Back": "Azụ",
    "Finish": "Mechaa",
    "Score": "Akara",
    "Points": "Isi Ihe",
    "Rewards": "Ụgwọ Ọrụ",
    "Rewards Store": "Ụlọ Ahịa Ụgwọ Ọrụ",
    "Exam Readiness": "Nkwadebe Nlele",
    "Study Notes": "Ihe Odide Ọmụmụ",
    "Past Questions": "Ajụjụ Ndị Gara Aga",
    "Mathematics": "Mgbakọ na Mwepụ",
    "English Language": "Asụsụ Bekee",
    "Biology": "Bioloji",
    "Chemistry": "Kemistri",
    "Physics": "Fiziks",
    "Economics": "Ọmụmụ Akụ na Ụba",
    "Government": "Gọọmenti",
    "Literature in English": "Agụmagụ Bekee",
    "Commerce": "Azụmahịa",
    "Accounting": "Ndekọ Ego",
    "Agricultural Science": "Sayensị Ugbo",
    "Geography": "Jografi",
    "History": "Akụkọ Ihe Mere Eme",
    "Civic Education": "Ọzụzụ Obodo",
    "Computer Studies": "Ọmụmụ Kọmputa",
    "Search": "Chọọ",
    "Filter": "Iyo",
    "Download": "Budata",
    "Notifications": "Ọkwa",
    "Profile": "Profaịlụ",
    "Account": "Akaụntụ",
    "Security": "Nchedo",
    "Subscription": "Ndebanye aha",
    "Help & Support": "Enyemaka & Nkwado",
    "Weekly Learning Report": "Akụkọ Ọmụmụ Izu",
    "Parent Intelligence": "Ọgụgụ Isi Nne na Nna",
    "Subject Performance": "Ọrụ Isiokwu",
    "Total Points": "Ngụkọta Isi Ihe",
    "Available Credit": "Ego Dị",
    "Accuracy": "Izi Ezi",
    "Questions": "Ajụjụ",
    "Time Remaining": "Oge Fọdụrụ",
    "Explanation": "Nkọwa",
    "Correct": "Ziri ezi",
    "Incorrect": "Ezighi ezi",
    "View Progress": "Lelee Ọganihu",
    "View Details": "Lelee Nkọwa",
    "All rights reserved": "Ikike niile echekwabara",
    "Terms of Service": "Usoro Ọrụ",
    "Privacy Policy": "Iwu Nzuzo",
    "Contact Us": "Kpọtụrụ Anyị",
    "About Us": "Gbasara Anyị",
    "Features": "Njirimara",
    "Pricing": "Ọnụ Ahịa",
    "Get Started": "Malite Ugbu a",
    "Learn More": "Mụtakwuo"
  },
  ak: {
    "Dashboard": "Dashboard",
    "Home": "Fie",
    "Quiz": "Nsɛmmisa",
    "Quizzes": "Nsɛmmisa Ahorow",
    "Learn": "Sua Ade",
    "Settings": "Nsesamu",
    "Students": "Asuafo",
    "Student": "Osuani",
    "My Classes": "Me Klas Ahorow",
    "Active Classes": "Adesuakuw a Ɛrekɔ So",
    "Registered Courses": "Adesua a Wɔakyerɛw Din",
    "Recent Activity": "Nneyɛe a Ɛbaa Nnansa Yi",
    "Welcome": "Akwaaba",
    "Hello": "Mema wo akye",
    "You are doing great": "Wo reyɛ adwuma pa",
    "Login": "Wura Mu",
    "Log In": "Wura Mu",
    "Logout": "Fi Mu",
    "Log Out": "Fi Mu",
    "Register": "Kyerɛw Wo Din",
    "Create Account": "Bɔ Akawnt Foforo",
    "Sign Up": "Kyerɛw Wo Din",
    "Sign In": "Wura Mu",
    "Submit": "Fa Kɔ",
    "Cancel": "Twa Mu",
    "Save": "Kora So",
    "Save Changes": "Kora Nsesamu So",
    "Delete": "Pepa",
    "Edit": "Siesie",
    "Update": "Yɛ Foforo",
    "Close": "To Mu",
    "Confirm": "Si So Dua",
    "Start Quiz": "Fi Ase Nsɛmmisa",
    "Start Quiz Now": "Fi Ase Nsɛmmisa Seesei",
    "Start Now": "Fi Ase Seesei",
    "Continue": "Kɔ So",
    "Next": "Nea Edi Hɔ",
    "Previous": "Nea Etwaam",
    "Back": "San Kɔ Akyi",
    "Finish": "Wie",
    "Score": "Nkontabuo",
    "Points": "Akatua Nkontabuo",
    "Rewards": "Akatua",
    "Rewards Store": "Akatua Sotɔɔ",
    "Exam Readiness": "Sɔhwɛ Ahosiesie",
    "Study Notes": "Adesua Nsɛm",
    "Past Questions": "Nsɛmmisa a Atwam",
    "Mathematics": "Akontaabu",
    "English Language": "Borɔfo Kasa",
    "Biology": "Abɔde Ahorow Ho Adesua",
    "Chemistry": "Kɛmistri",
    "Physics": "Fisiksi",
    "Economics": "Sikasɛm",
    "Government": "Aban Nsɛm",
    "Literature in English": "Borɔfo Nwoma",
    "Commerce": "Aguadi",
    "Accounting": "Akontabuo Dwuma",
    "Agricultural Science": "Kuayɛ Ho Nyansahu",
    "Geography": "Asase Ho Adesua",
    "History": "Abakɔsɛm",
    "Civic Education": "Ɔman Mma Ntetee",
    "Computer Studies": "Kɔmputa Adesua",
    "Search": "Hwehwɛ",
    "Filter": "Sɔne So",
    "Download": "Twe Gu So",
    "Notifications": "Nkaebɔ Ahorow",
    "Profile": "Wo Ho Nsɛm",
    "Account": "Akawnt",
    "Security": "Ahobammbɔ",
    "Subscription": "Akatua Twa",
    "Help & Support": "Mmoa",
    "Weekly Learning Report": "Dapɛn Biara Adesua Amanneɛbɔ",
    "Parent Intelligence": "Awofo Nyansa",
    "Subject Performance": "Adesua Nkɔso",
    "Total Points": "Akatua Nyinaa",
    "Available Credit": "Sika a Aka",
    "Accuracy": "Pɛpɛɛpɛyɛ",
    "Questions": "Nsɛmmisa",
    "Time Remaining": "Bere a Aka",
    "Explanation": "Nkyerɛkyerɛmu",
    "Correct": "Ɛteɛ",
    "Incorrect": "Ɛnteɛ",
    "View Progress": "Hwɛ Nkɔso",
    "View Details": "Hwɛ Nsɛm Nyinaa",
    "All rights reserved": "Hokwan nyinaa yɛ yɛn dea",
    "Terms of Service": "Ɔsom Ho Nhyehyɛe",
    "Privacy Policy": "Kokoamsɛm Ho Nhyehyɛe",
    "Contact Us": "Frɛ Yɛn",
    "About Us": "Yɛn Ho Nsɛm",
    "Features": "Nneɛma a Ɛwɔ Mu",
    "Pricing": "Boɔ",
    "Get Started": "Fi Ase Seesei",
    "Learn More": "Sua Pii Ka Ho"
  },
  ff: {
    "Dashboard": "Dashboard",
    "Home": "Suudu",
    "Quiz": "Jarribo",
    "Quizzes": "Jarribooji",
    "Learn": "Ekko",
    "Settings": "Teeltol",
    "Students": "Almuɓɓe",
    "Student": "Almuudo",
    "My Classes": "Kalaasuuji am",
    "Active Classes": "Kalaasuuji gollayɗi",
    "Registered Courses": "Kooruuji winnditiiɗi",
    "Recent Activity": "Gollal ɓooyiiɗo",
    "Welcome": "A jaaraama",
    "Hello": "Jam tan",
    "You are doing great": "Aɗa gollude ko wooɗi",
    "Login": "Naatu",
    "Log In": "Naatu",
    "Logout": "Yaltu",
    "Log Out": "Yaltu",
    "Register": "Winndito",
    "Create Account": "Sos Kont",
    "Sign Up": "Winndito",
    "Sign In": "Naatu",
    "Submit": "Neldu",
    "Cancel": "Haaytu",
    "Save": "Danndu",
    "Save Changes": "Danndu waylooji",
    "Delete": "Momtu",
    "Edit": "Taƴto",
    "Update": "Hesɗitin",
    "Close": "Uddu",
    "Confirm": "Goongɗin",
    "Start Quiz": "Fuɗɗo Jarribo",
    "Start Quiz Now": "Fuɗɗo Jarribo Jaaɓi",
    "Start Now": "Fuɗɗo Jaaɓi",
    "Continue": "Jokku",
    "Next": "Gaddano",
    "Previous": "Caggal",
    "Back": "Rutto",
    "Finish": "Timmin",
    "Score": "Limmere",
    "Points": "Poyte",
    "Rewards": "Mbarjaari",
    "Rewards Store": "Bitik Mbarjaari",
    "Exam Readiness": "Keeɓgol Eksam",
    "Study Notes": "Ɗereeji Jannde",
    "Past Questions": "Naamne Ɓennuɗe",
    "Mathematics": "Hiisawal",
    "English Language": "Ɗemngal Enkele",
    "Biology": "Ngurndam",
    "Chemistry": "Simi",
    "Physics": "Fisik",
    "Economics": "Faggudu",
    "Government": "Laamu",
    "Literature in English": "Binndol Enkele",
    "Commerce": "Njeeygu",
    "Accounting": "Hiisa Jawdi",
    "Agricultural Science": "Ndemri e Ngaynaaka",
    "Geography": "Jowrafi",
    "History": "Daartol",
    "Civic Education": "Needi Siwil",
    "Computer Studies": "Jannde Odinateer",
    "Search": "Yiylo",
    "Filter": "Suɓo",
    "Download": "Aawto",
    "Notifications": "Tintine",
    "Profile": "Porfil",
    "Account": "Kont",
    "Security": "Kisal",
    "Subscription": "Njobdi",
    "Help & Support": "Ballal",
    "Weekly Learning Report": "Jaŋtol Jannde Yontere",
    "Parent Intelligence": "Hakkilantaagal Mawɓe",
    "Subject Performance": "Keeɓal Faandaare",
    "Total Points": "Poyte Fuu",
    "Available Credit": "Kaalis Gondotooɗo",
    "Accuracy": "Pewndam",
    "Questions": "Naamne",
    "Time Remaining": "Sahaa heddiiɗo",
    "Explanation": "Faandurol",
    "Correct": "Ko goonga",
    "Incorrect": "Wonaa goonga",
    "View Progress": "Yiy Ɓamtaare",
    "View Details": "Yiy Cariiɗe",
    "All rights reserved": "Hakkeeji fof ko reenaaɗi",
    "Terms of Service": "Sartuuji Gollal",
    "Privacy Policy": "Kisal Suturo",
    "Contact Us": "Jokkondir e Amen",
    "About Us": "Ko faati e Amen",
    "Features": "Gollaliji",
    "Pricing": "Coggu",
    "Get Started": "Fuɗɗo Jaaɓi",
    "Learn More": "Ɓeydu Janngude"
  },
  wo: {
    "Dashboard": "Tablo Dashboard",
    "Home": "Kër ga",
    "Quiz": "Laaj yi",
    "Quizzes": "Téere Laaj yi",
    "Learn": "Jàng",
    "Settings": "Tànneef yi",
    "Students": "Jàngkat yi",
    "Student": "Jàngkat",
    "My Classes": "Sama Kalaas yi",
    "Active Classes": "Kalaas yiy dox",
    "Registered Courses": "Koor yiñ bindu",
    "Recent Activity": "Jëf yi mujj",
    "Welcome": "Dalal ak jamm",
    "Hello": "Nanga def",
    "You are doing great": "Yangi liggey bu baax",
    "Login": "Duggu",
    "Log In": "Duggu",
    "Logout": "Genn",
    "Log Out": "Genn",
    "Register": "Bindu",
    "Create Account": "Sos Sàq",
    "Sign Up": "Bindu",
    "Sign In": "Duggu",
    "Submit": "Yónnee",
    "Cancel": "Bàyyi",
    "Save": "Denc",
    "Save Changes": "Denc coppite yi",
    "Delete": "Far",
    "Edit": "Soppi",
    "Update": "Yeesal",
    "Close": "Tëj",
    "Confirm": "Wóorale",
    "Start Quiz": "Tambali Laaj yi",
    "Start Quiz Now": "Tambali Laaj yi Léegi",
    "Start Now": "Tambali Léegi",
    "Continue": "Wéy",
    "Next": "Bi ci tegu",
    "Previous": "Bi jiitu",
    "Back": "Dellu ginnaaw",
    "Finish": "Jeexal",
    "Score": "Natt",
    "Points": "Poñ yi",
    "Rewards": "Neexal yi",
    "Rewards Store": "Bitiiku Neexal yi",
    "Exam Readiness": "Wàjjal Eksaame",
    "Study Notes": "Kaye Njàngat yi",
    "Past Questions": "Laaj yi weesu",
    "Mathematics": "Kaloor",
    "English Language": "Làkku Angale",
    "Biology": "Biyolosii",
    "Chemistry": "Simi",
    "Physics": "Fisig",
    "Economics": "Koomeers ak Kom",
    "Government": "Njiit ak Nguur",
    "Literature in English": "Mbindum Angale",
    "Commerce": "Koom-koom",
    "Accounting": "Xayma Alal",
    "Agricultural Science": "Xam-xamu Mbay",
    "Geography": "Jowlaafi",
    "History": "Taariix",
    "Civic Education": "Yar ak Tegeen",
    "Computer Studies": "Xam-xamu Kàmpiyutéer",
    "Search": "Seet",
    "Filter": "Tànn",
    "Download": "Yeb",
    "Notifications": "Yégle yi",
    "Profile": "Jëmm",
    "Account": "Sàq",
    "Security": "Kaaraange",
    "Subscription": "Fay ak Duggu",
    "Help & Support": "Ndimbal",
    "Weekly Learning Report": "Rappooru Njàngum Ayi-bess",
    "Parent Intelligence": "Xam-xamu Waajur",
    "Subject Performance": "Jëfum Matiyeer yi",
    "Total Points": "Mbooleem Poñ yi",
    "Available Credit": "Xaalis bi fi nekk",
    "Accuracy": "Dëggu",
    "Questions": "Laaj yi",
    "Time Remaining": "Waxtu bi des",
    "Explanation": "Fàramfàcce",
    "Correct": "Baax na",
    "Incorrect": "Jàddu na",
    "View Progress": "Xool Yokkute gi",
    "View Details": "Xool lépp",
    "All rights reserved": "Sañ-sañ yépp denc nañu leen",
    "Terms of Service": "Sartu Kër gi",
    "Privacy Policy": "Kumpa ak Sutura",
    "Contact Us": "Jokkoo ak Nun",
    "About Us": "Li jëm ci Nun",
    "Features": "Mànk yi",
    "Pricing": "Njëg yi",
    "Get Started": "Tambali Léegi",
    "Learn More": "Gën a Jàng"
  },
  fr: {
    "Dashboard": "Tableau de bord",
    "Home": "Accueil",
    "Quiz": "Quiz",
    "Quizzes": "Quiz",
    "Learn": "Apprendre",
    "Settings": "Paramètres",
    "Students": "Élèves",
    "Student": "Élève",
    "My Classes": "Mes Cours",
    "Active Classes": "Cours Actifs",
    "Registered Courses": "Cours Enregistrés",
    "Recent Activity": "Activité Récente",
    "Welcome": "Bienvenue",
    "Hello": "Bonjour",
    "You are doing great": "Vous vous en sortez très bien",
    "Login": "Se connecter",
    "Log In": "Se connecter",
    "Logout": "Se déconnecter",
    "Log Out": "Se déconnecter",
    "Register": "S'inscrire",
    "Create Account": "Créer un compte",
    "Sign Up": "S'inscrire",
    "Sign In": "Se connecter",
    "Submit": "Soumettre",
    "Cancel": "Annuler",
    "Save": "Enregistrer",
    "Save Changes": "Enregistrer les modifications",
    "Delete": "Supprimer",
    "Edit": "Modifier",
    "Update": "Mettre à jour",
    "Close": "Fermer",
    "Confirm": "Confirmer",
    "Start Quiz": "Commencer le quiz",
    "Start Quiz Now": "Commencer le quiz maintenant",
    "Start Now": "Commencer maintenant",
    "Continue": "Continuer",
    "Next": "Suivant",
    "Previous": "Précédent",
    "Back": "Retour",
    "Finish": "Terminer",
    "Score": "Score",
    "Points": "Points",
    "Rewards": "Récompenses",
    "Rewards Store": "Boutique de récompenses",
    "Exam Readiness": "Préparation aux examens",
    "Study Notes": "Notes d'étude",
    "Past Questions": "Annales d'examens",
    "Mathematics": "Mathématiques",
    "English Language": "Langue Anglaise",
    "Biology": "Biologie",
    "Chemistry": "Chimie",
    "Physics": "Physique",
    "Economics": "Économie",
    "Government": "Gouvernement",
    "Literature in English": "Littérature Anglaise",
    "Commerce": "Commerce",
    "Accounting": "Comptabilité",
    "Agricultural Science": "Sciences Agricoles",
    "Geography": "Géographie",
    "History": "Histoire",
    "Civic Education": "Éducation Civique",
    "Computer Studies": "Informatique",
    "Search": "Rechercher",
    "Filter": "Filtrer",
    "Download": "Télécharger",
    "Notifications": "Notifications",
    "Profile": "Profil",
    "Account": "Compte",
    "Security": "Sécurité",
    "Subscription": "Abonnement",
    "Help & Support": "Aide et Support",
    "Weekly Learning Report": "Rapport d'apprentissage hebdomadaire",
    "Parent Intelligence": "Intelligence Parentale",
    "Subject Performance": "Performance par matière",
    "Total Points": "Total des points",
    "Available Credit": "Crédit disponible",
    "Accuracy": "Précision",
    "Questions": "Questions",
    "Time Remaining": "Temps restant",
    "Explanation": "Explication",
    "Correct": "Correct",
    "Incorrect": "Incorrect",
    "View Progress": "Voir la progression",
    "View Details": "Voir les détails",
    "All rights reserved": "Tous droits réservés",
    "Terms of Service": "Conditions d'utilisation",
    "Privacy Policy": "Politique de confidentialité",
    "Contact Us": "Contactez-nous",
    "About Us": "À propos de nous",
    "Features": "Fonctionnalités",
    "Pricing": "Tarifs",
    "Get Started": "Commencer",
    "Learn More": "En savoir plus"
  },
  pt: {
    "Dashboard": "Painel de Controle",
    "Home": "Início",
    "Quiz": "Questionário",
    "Quizzes": "Questionários",
    "Learn": "Aprender",
    "Settings": "Configurações",
    "Students": "Alunos",
    "Student": "Aluno",
    "My Classes": "Minhas Aulas",
    "Active Classes": "Aulas Ativas",
    "Registered Courses": "Cursos Cadastrados",
    "Recent Activity": "Atividade Recente",
    "Welcome": "Bem-vindo",
    "Hello": "Olá",
    "You are doing great": "Você está indo muito bem",
    "Login": "Entrar",
    "Log In": "Entrar",
    "Logout": "Sair",
    "Log Out": "Sair",
    "Register": "Cadastrar",
    "Create Account": "Criar Conta",
    "Sign Up": "Cadastrar-se",
    "Sign In": "Entrar",
    "Submit": "Enviar",
    "Cancel": "Cancelar",
    "Save": "Salvar",
    "Save Changes": "Salvar Alterações",
    "Delete": "Excluir",
    "Edit": "Editar",
    "Update": "Atualizar",
    "Close": "Fechar",
    "Confirm": "Confirmar",
    "Start Quiz": "Iniciar Questionário",
    "Start Quiz Now": "Começar Teste Agora",
    "Start Now": "Começar Agora",
    "Continue": "Continuar",
    "Next": "Próximo",
    "Previous": "Anterior",
    "Back": "Voltar",
    "Finish": "Finalizar",
    "Score": "Pontuação",
    "Points": "Pontos",
    "Rewards": "Recompensas",
    "Rewards Store": "Loja de Recompensas",
    "Exam Readiness": "Prontidão para Exames",
    "Study Notes": "Anotações de Estudo",
    "Past Questions": "Provas Anteriores",
    "Mathematics": "Matemática",
    "English Language": "Língua Inglesa",
    "Biology": "Biologia",
    "Chemistry": "Química",
    "Physics": "Física",
    "Economics": "Economia",
    "Government": "Governo",
    "Literature in English": "Literatura Inglesa",
    "Commerce": "Comércio",
    "Accounting": "Contabilidade",
    "Agricultural Science": "Ciências Agrárias",
    "Geography": "Geografia",
    "History": "História",
    "Civic Education": "Educação Cívica",
    "Computer Studies": "Informática",
    "Search": "Pesquisar",
    "Filter": "Filtrar",
    "Download": "Baixar",
    "Notifications": "Notificações",
    "Profile": "Perfil",
    "Account": "Conta",
    "Security": "Segurança",
    "Subscription": "Assinatura",
    "Help & Support": "Ajuda e Suporte",
    "Weekly Learning Report": "Relatório Semanal de Aprendizagem",
    "Parent Intelligence": "Inteligência Parental",
    "Subject Performance": "Desempenho por Disciplina",
    "Total Points": "Pontos Totais",
    "Available Credit": "Crédito Disponível",
    "Accuracy": "Precisão",
    "Questions": "Perguntas",
    "Time Remaining": "Tempo Restante",
    "Explanation": "Explicação",
    "Correct": "Correto",
    "Incorrect": "Incorreto",
    "View Progress": "Ver Progresso",
    "View Details": "Ver Detalhes",
    "All rights reserved": "Todos os direitos reservados",
    "Terms of Service": "Termos de Serviço",
    "Privacy Policy": "Política de Privacidade",
    "Contact Us": "Fale Conosco",
    "About Us": "Sobre Nós",
    "Features": "Recursos",
    "Pricing": "Preços",
    "Get Started": "Começar",
    "Learn More": "Saiba Mais"
  }
};

const IGNORED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "SVG",
  "CANVAS",
  "AUDIO",
  "VIDEO",
  "OBJECT",
  "EMBED"
]);

class UniversalAutoTranslator {
  private currentLang: string = "en";
  private isTranslating: boolean = false;
  private observer: MutationObserver | null = null;
  private originalTextMap = new WeakMap<Node, string>();
  private memoryCache: Map<string, string> = new Map();
  private pendingTexts: Set<string> = new Set();
  private batchTimer: any = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appLanguage") || "en";
      this.currentLang = saved;
      this.loadStorageCache(saved);
    }
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined" || !document.body) return;
    this.isInitialized = true;

    // Listen for custom appLanguageChanged events
    window.addEventListener("appLanguageChanged", (e: any) => {
      const newLang = e.detail?.lang;
      if (newLang && newLang !== this.currentLang) {
        this.setLanguage(newLang);
      }
    });

    // Cross-tab sync
    window.addEventListener("storage", (e) => {
      if (e.key === "appLanguage" && e.newValue && e.newValue !== this.currentLang) {
        this.setLanguage(e.newValue);
      }
    });

    // Start observing DOM changes
    this.startObserver();

    // If current language is not English, execute initial translation pass
    if (this.currentLang !== "en") {
      setTimeout(() => {
        this.translateEntireDOM();
      }, 50);
    }
  }

  private loadStorageCache(lang: string) {
    if (lang === "en" || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`app_tr_cache_${lang}`);
      if (raw) {
        const obj = JSON.parse(raw);
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === "string") {
            this.memoryCache.set(`${lang}:${k}`, v);
          }
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  private saveStorageCache(lang: string) {
    if (lang === "en" || typeof window === "undefined") return;
    try {
      const obj: Record<string, string> = {};
      const prefix = `${lang}:`;
      for (const [k, v] of this.memoryCache.entries()) {
        if (k.startsWith(prefix)) {
          obj[k.slice(prefix.length)] = v;
        }
      }
      localStorage.setItem(`app_tr_cache_${lang}`, JSON.stringify(obj));
    } catch {
      // local storage might be full or private mode
    }
  }

  public getLanguage(): string {
    return this.currentLang;
  }

  public setLanguage(newLang: string) {
    if (this.currentLang === newLang) return;
    const oldLang = this.currentLang;
    this.currentLang = newLang;
    if (typeof window !== "undefined") {
      localStorage.setItem("appLanguage", newLang);
      this.loadStorageCache(newLang);
    }

    if (newLang === "en") {
      this.restoreEnglish();
    } else {
      this.translateEntireDOM();
    }

    // Dispatch global event for any listening UI components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("appLanguageUpdate", { detail: { lang: newLang, oldLang } }));
    }
  }

  private startObserver() {
    if (this.observer || typeof window === "undefined" || !document.body) return;

    this.observer = new MutationObserver((mutations) => {
      if (this.isTranslating || this.currentLang === "en") return;

      let shouldTranslate = false;
      const nodesToProcess: Node[] = [];

      for (const m of mutations) {
        if (m.type === "childList") {
          for (let i = 0; i < m.addedNodes.length; i++) {
            nodesToProcess.push(m.addedNodes[i]);
            shouldTranslate = true;
          }
        } else if (m.type === "characterData") {
          const target = m.target;
          if (target && target.nodeType === Node.TEXT_NODE) {
            // Check if it was mutated by React back to English
            const currentVal = target.nodeValue || "";
            const orig = this.originalTextMap.get(target);
            if (!orig || currentVal !== this.memoryCache.get(`${this.currentLang}:${orig.trim()}`)) {
              nodesToProcess.push(target);
              shouldTranslate = true;
            }
          }
        }
      }

      if (shouldTranslate) {
        this.scheduleProcessNodes(nodesToProcess);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private scheduleProcessNodes(nodes: Node[]) {
    requestAnimationFrame(() => {
      if (this.currentLang === "en") return;
      for (const node of nodes) {
        this.walkAndTranslateNode(node);
      }
    });
  }

  public translateEntireDOM() {
    if (typeof document === "undefined" || !document.body || this.currentLang === "en") return;
    this.walkAndTranslateNode(document.body);
  }

  public restoreEnglish() {
    if (typeof document === "undefined" || !document.body) return;
    this.isTranslating = true;
    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (this.originalTextMap.has(node)) {
          const orig = this.originalTextMap.get(node)!;
          if (node.nodeValue !== orig) {
            node.nodeValue = orig;
          }
        }
        node = walker.nextNode();
      }

      // Restore attributes
      const withAttrs = document.querySelectorAll("[data-orig-placeholder], [data-orig-aria-label], [data-orig-title]");
      withAttrs.forEach((el) => {
        const ph = el.getAttribute("data-orig-placeholder");
        if (ph !== null) el.setAttribute("placeholder", ph);
        const al = el.getAttribute("data-orig-aria-label");
        if (al !== null) el.setAttribute("aria-label", al);
        const tt = el.getAttribute("data-orig-title");
        if (tt !== null) el.setAttribute("title", tt);
      });
    } finally {
      this.isTranslating = false;
    }
  }

  private walkAndTranslateNode(root: Node) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      this.translateTextNode(root as Text);
      return;
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
      const el = root as HTMLElement;
      const tag = el.tagName ? el.tagName.toUpperCase() : "";
      if (IGNORED_TAGS.has(tag) || el.classList?.contains("no-translate")) {
        return;
      }

      this.translateElementAttributes(el);

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const p = node.parentElement;
          if (p && (IGNORED_TAGS.has(p.tagName) || p.classList?.contains("no-translate"))) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      let textNode = walker.nextNode();
      while (textNode) {
        this.translateTextNode(textNode as Text);
        textNode = walker.nextNode();
      }
    }
  }

  private translateElementAttributes(el: HTMLElement) {
    // Translate placeholder
    const ph = el.getAttribute("placeholder");
    if (ph && ph.trim()) {
      let origPh = el.getAttribute("data-orig-placeholder");
      if (!origPh) {
        origPh = ph;
        el.setAttribute("data-orig-placeholder", origPh);
      }
      const trans = this.lookupTranslation(origPh.trim());
      if (trans && el.getAttribute("placeholder") !== trans) {
        el.setAttribute("placeholder", trans);
      } else if (!trans) {
        this.queueForTranslation(origPh.trim());
      }
    }

    // Translate aria-label
    const al = el.getAttribute("aria-label");
    if (al && al.trim()) {
      let origAl = el.getAttribute("data-orig-aria-label");
      if (!origAl) {
        origAl = al;
        el.setAttribute("data-orig-aria-label", origAl);
      }
      const trans = this.lookupTranslation(origAl.trim());
      if (trans && el.getAttribute("aria-label") !== trans) {
        el.setAttribute("aria-label", trans);
      } else if (!trans) {
        this.queueForTranslation(origAl.trim());
      }
    }

    // Translate title
    const tt = el.getAttribute("title");
    if (tt && tt.trim()) {
      let origTt = el.getAttribute("data-orig-title");
      if (!origTt) {
        origTt = tt;
        el.setAttribute("data-orig-title", origTt);
      }
      const trans = this.lookupTranslation(origTt.trim());
      if (trans && el.getAttribute("title") !== trans) {
        el.setAttribute("title", trans);
      } else if (!trans) {
        this.queueForTranslation(origTt.trim());
      }
    }
  }

  private translateTextNode(node: Text) {
    const raw = node.nodeValue || "";
    const trimmed = raw.trim();

    // Skip empty or numbers-only strings (e.g. "12", "100%", "$50", "2024")
    if (!trimmed || /^[\d\s.,:;%\-+*\/=()#@!$&'"—–]+$/.test(trimmed)) {
      return;
    }

    // Store original text
    if (!this.originalTextMap.has(node)) {
      this.originalTextMap.set(node, raw);
    }

    const origRaw = this.originalTextMap.get(node) || raw;
    const origTrimmed = origRaw.trim();

    const translated = this.lookupTranslation(origTrimmed);
    if (translated) {
      const leading = origRaw.match(/^\s*/)?.[0] || "";
      const trailing = origRaw.match(/\s*$/)?.[0] || "";
      const targetVal = leading + translated + trailing;

      if (node.nodeValue !== targetVal) {
        this.isTranslating = true;
        try {
          node.nodeValue = targetVal;
        } finally {
          this.isTranslating = false;
        }
      }
    } else {
      this.queueForTranslation(origTrimmed);
    }
  }

  private lookupTranslation(text: string): string | null {
    if (!text || this.currentLang === "en") return text;

    const cacheKey = `${this.currentLang}:${text}`;
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // Check built-in dictionary
    const dict = BUILTIN_DICTIONARY[this.currentLang];
    if (dict && dict[text]) {
      this.memoryCache.set(cacheKey, dict[text]);
      return dict[text];
    }

    // Case-insensitive check on built-in dictionary
    if (dict) {
      const lower = text.toLowerCase();
      for (const [k, v] of Object.entries(dict)) {
        if (k.toLowerCase() === lower) {
          this.memoryCache.set(cacheKey, v);
          return v;
        }
      }
    }

    return null;
  }

  private queueForTranslation(text: string) {
    if (!text || this.currentLang === "en") return;
    const cacheKey = `${this.currentLang}:${text}`;
    if (this.memoryCache.has(cacheKey)) return;

    this.pendingTexts.add(text);

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.flushBatch();
    }, 60);
  }

  private async flushBatch() {
    if (this.pendingTexts.size === 0 || this.currentLang === "en") return;

    const textsToTranslate = Array.from(this.pendingTexts).slice(0, 50);
    this.pendingTexts.clear();

    const targetLang = this.currentLang;

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLang,
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data && data.translations) {
        for (const [orig, translated] of Object.entries(data.translations)) {
          if (typeof translated === "string") {
            this.memoryCache.set(`${targetLang}:${orig}`, translated);
          }
        }
        this.saveStorageCache(targetLang);

        // Update DOM if user is still on this language
        if (this.currentLang === targetLang) {
          this.translateEntireDOM();
        }
      }
    } catch {
      // Translation network error handled gracefully
    }
  }
}

export const autoTranslator = new UniversalAutoTranslator();

/**
 * Global helper function to change language across the entire app
 */
export function setGlobalLanguage(newLang: string) {
  autoTranslator.setLanguage(newLang);
  if (typeof window !== "undefined") {
    localStorage.setItem("appLanguage", newLang);
    window.dispatchEvent(new CustomEvent("appLanguageChanged", { detail: { lang: newLang } }));
  }
}
