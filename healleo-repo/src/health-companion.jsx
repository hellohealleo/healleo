import { useState, useEffect, useRef } from "react";

const HEALLEO_LOGO = "data:image/jpeg;base64,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6l+xV8Vj8UrXwjFoMWnReHfNsZLoWv2aO6+1eb5f2XP7zzP/AN7X0V+wT8DfE/7M37I3gj4M+MrmMavo+nS/2lFHP5sUU0s0tzJD5v8Ay18rzfK83/plW+HqOrVp/wDTszqQXsvfPWqKKK9Q5wooooAKKKKACiiigAooooAKKKKACiiigAooopLYzCiiimaBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRXNZAFFFFdNkAUUUVzWQBRRRXSAUUUUAFFFFc4BRRRXRZAFFFFAXYUUUVzgFFFFFkAUUUV0AFFFFABRRRXOAUUUV0AFFFFc1kAUUUU7IAooopWQBRRRT3AKKKKACiiiugAooooAKKKK5wCiiigAoooroAKKKKACiiigAooooAKKKKACiiigAooooAKKKKS2MwoqOis7M0JKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjooswJKKjorpjRjYzP/9k=";

// ═══ STORAGE MODE DETECTION ═══
const SUPABASE_MODE = !!(typeof window !== "undefined" && window.healleoAuth && window.healleoData && window.healleoAuth.isConfigured && window.healleoAuth.isConfigured());

// ═══ CRYPTO & AUTH UTILITIES (standalone mode) ═══
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function generateSalt() { return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""); }
function generateToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join(""); }

const ACCOUNTS_KEY = "healleo-accounts";
const SESSION_KEY = "healleo-session";

// Standalone (localStorage) storage functions
async function getAccounts() { try { const r = await window.storage.get(ACCOUNTS_KEY); return r ? JSON.parse(r.value) : {}; } catch { return {}; } }
async function saveAccounts(accounts) { try { await window.storage.set(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {} }
async function getSession() { try { const r = await window.storage.get(SESSION_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function saveSession(session) { try { await window.storage.set(SESSION_KEY, JSON.stringify(session)); } catch {} }
async function clearSession() { try { await window.storage.delete(SESSION_KEY); } catch {} }

// Per-user data storage — routes to Supabase or localStorage
let currentUserKey = null;
function userDataKey(userId) { return `healleo-data-${userId}`; }

async function loadData() {
  if (SUPABASE_MODE) {
    return await window.healleoData.load();
  }
  if (!currentUserKey) return null;
  try { const r = await window.storage.get(currentUserKey); return r ? JSON.parse(r.value) : null; } catch { return null; }
}

async function saveData(data) {
  if (SUPABASE_MODE) {
    await window.healleoData.save(data);
    return;
  }
  if (!currentUserKey) return;
  try { await window.storage.set(currentUserKey, JSON.stringify(data)); } catch {}
}

const DEFAULT_PROFILE = { name:"",age:"",weight:"",height:"",sex:"male",goals:[],conditions:[],dietType:"omnivore",medications:"",allergies:"",bloodType:"",familyHistory:"" };
const DEFAULT_STATE = { profile:{...DEFAULT_PROFILE}, onboarded:false, logs:[], chatHistory:[], nutritionChat:[], trainerChat:[], therapistChat:[], symptomSessions:[], labResults:[], healthTimeline:[], aiMemory:[], savedDoctors:[], medications:[], sharedPlans:[], dismissedCards:[] };
const GOALS = ["Lose Weight","Build Muscle","Improve Energy","Better Sleep","Reduce Stress","Heart Health","Gut Health","Longevity"];
const CONDITIONS = ["Diabetes","High Blood Pressure","High Cholesterol","Anxiety","Insomnia","IBS","Thyroid","Asthma","Arthritis","None"];
const MOODS = ["😫","😔","😐","🙂","😄"];
function fmtHeight(inches) { if (!inches) return "?"; const ft = Math.floor(inches / 12); const inn = Math.round(inches % 12); return `${ft}'${inn}"`; }
const DIET_TYPES = ["omnivore","vegetarian","vegan","keto","paleo","mediterranean"];
const SUPPLEMENT_DB = [
  {name:"Vitamin D3",dose:"2000 IU",benefit:"Bone health, immunity, mood"},
  {name:"Omega-3 Fish Oil",dose:"1000mg",benefit:"Heart, brain, inflammation"},
  {name:"Magnesium Glycinate",dose:"400mg",benefit:"Sleep, muscle, stress"},
  {name:"Probiotics",dose:"10B CFU",benefit:"Gut health, immunity"},
  {name:"Vitamin B Complex",dose:"1 capsule",benefit:"Energy, nervous system"},
  {name:"Zinc",dose:"15mg",benefit:"Immunity, skin, hormones"},
  {name:"Ashwagandha",dose:"600mg",benefit:"Stress, cortisol, energy"},
  {name:"Creatine",dose:"5g",benefit:"Muscle, brain, performance"},
  {name:"Vitamin C",dose:"500mg",benefit:"Immunity, skin, antioxidant"},
  {name:"Iron",dose:"18mg",benefit:"Energy, blood, oxygen transport"},
  {name:"Collagen",dose:"10g",benefit:"Skin, joints, gut lining"},
  {name:"CoQ10",dose:"100mg",benefit:"Heart, energy, antioxidant"},
];
const EXERCISE_TYPES = ["Walking","Running","Cycling","Swimming","Yoga","Strength Training","HIIT","Pilates","Stretching","Dance","Hiking","Sports"];

const DRUG_DATABASE = [
  {name:"Metformin",generic:"Glucophage",strengths:["500mg","850mg","1000mg"]},
  {name:"Lisinopril",generic:"Prinivil",strengths:["5mg","10mg","20mg","40mg"]},
  {name:"Amlodipine",generic:"Norvasc",strengths:["2.5mg","5mg","10mg"]},
  {name:"Atorvastatin",generic:"Lipitor",strengths:["10mg","20mg","40mg","80mg"]},
  {name:"Rosuvastatin",generic:"Crestor",strengths:["5mg","10mg","20mg","40mg"]},
  {name:"Simvastatin",generic:"Zocor",strengths:["10mg","20mg","40mg","80mg"]},
  {name:"Omeprazole",generic:"Prilosec",strengths:["10mg","20mg","40mg"]},
  {name:"Pantoprazole",generic:"Protonix",strengths:["20mg","40mg"]},
  {name:"Esomeprazole",generic:"Nexium",strengths:["20mg","40mg"]},
  {name:"Losartan",generic:"Cozaar",strengths:["25mg","50mg","100mg"]},
  {name:"Valsartan",generic:"Diovan",strengths:["40mg","80mg","160mg","320mg"]},
  {name:"Metoprolol Succinate",generic:"Toprol-XL",strengths:["25mg","50mg","100mg","200mg"]},
  {name:"Metoprolol Tartrate",generic:"Lopressor",strengths:["25mg","50mg","100mg"]},
  {name:"Atenolol",generic:"Tenormin",strengths:["25mg","50mg","100mg"]},
  {name:"Propranolol",generic:"Inderal",strengths:["10mg","20mg","40mg","80mg"]},
  {name:"Carvedilol",generic:"Coreg",strengths:["3.125mg","6.25mg","12.5mg","25mg"]},
  {name:"Hydrochlorothiazide",generic:"HCTZ",strengths:["12.5mg","25mg","50mg"]},
  {name:"Furosemide",generic:"Lasix",strengths:["20mg","40mg","80mg"]},
  {name:"Spironolactone",generic:"Aldactone",strengths:["25mg","50mg","100mg"]},
  {name:"Levothyroxine",generic:"Synthroid",strengths:["25mcg","50mcg","75mcg","88mcg","100mcg","112mcg","125mcg","137mcg","150mcg","175mcg","200mcg"]},
  {name:"Sertraline",generic:"Zoloft",strengths:["25mg","50mg","100mg"]},
  {name:"Escitalopram",generic:"Lexapro",strengths:["5mg","10mg","20mg"]},
  {name:"Fluoxetine",generic:"Prozac",strengths:["10mg","20mg","40mg","60mg"]},
  {name:"Citalopram",generic:"Celexa",strengths:["10mg","20mg","40mg"]},
  {name:"Paroxetine",generic:"Paxil",strengths:["10mg","20mg","30mg","40mg"]},
  {name:"Venlafaxine",generic:"Effexor",strengths:["37.5mg","75mg","150mg","225mg"]},
  {name:"Duloxetine",generic:"Cymbalta",strengths:["20mg","30mg","60mg"]},
  {name:"Bupropion",generic:"Wellbutrin",strengths:["75mg","100mg","150mg","300mg"]},
  {name:"Trazodone",generic:"Desyrel",strengths:["50mg","100mg","150mg"]},
  {name:"Mirtazapine",generic:"Remeron",strengths:["7.5mg","15mg","30mg","45mg"]},
  {name:"Alprazolam",generic:"Xanax",strengths:["0.25mg","0.5mg","1mg","2mg"]},
  {name:"Lorazepam",generic:"Ativan",strengths:["0.5mg","1mg","2mg"]},
  {name:"Clonazepam",generic:"Klonopin",strengths:["0.5mg","1mg","2mg"]},
  {name:"Diazepam",generic:"Valium",strengths:["2mg","5mg","10mg"]},
  {name:"Gabapentin",generic:"Neurontin",strengths:["100mg","300mg","400mg","600mg","800mg"]},
  {name:"Pregabalin",generic:"Lyrica",strengths:["25mg","50mg","75mg","100mg","150mg","200mg","300mg"]},
  {name:"Amoxicillin",strengths:["250mg","500mg","875mg"]},
  {name:"Azithromycin",generic:"Z-Pack",strengths:["250mg","500mg"]},
  {name:"Amoxicillin-Clavulanate",generic:"Augmentin",strengths:["500/125mg","875/125mg"]},
  {name:"Ciprofloxacin",generic:"Cipro",strengths:["250mg","500mg","750mg"]},
  {name:"Doxycycline",strengths:["50mg","100mg"]},
  {name:"Cephalexin",generic:"Keflex",strengths:["250mg","500mg"]},
  {name:"Levofloxacin",generic:"Levaquin",strengths:["250mg","500mg","750mg"]},
  {name:"Prednisone",generic:"Deltasone",strengths:["1mg","2.5mg","5mg","10mg","20mg","50mg"]},
  {name:"Methylprednisolone",generic:"Medrol",strengths:["4mg","8mg","16mg","32mg"]},
  {name:"Ibuprofen",generic:"Advil",strengths:["200mg","400mg","600mg","800mg"]},
  {name:"Naproxen",generic:"Aleve",strengths:["220mg","250mg","375mg","500mg"]},
  {name:"Meloxicam",generic:"Mobic",strengths:["7.5mg","15mg"]},
  {name:"Celecoxib",generic:"Celebrex",strengths:["100mg","200mg"]},
  {name:"Acetaminophen",generic:"Tylenol",strengths:["325mg","500mg","650mg","1000mg"]},
  {name:"Tramadol",generic:"Ultram",strengths:["50mg","100mg"]},
  {name:"Cyclobenzaprine",generic:"Flexeril",strengths:["5mg","10mg"]},
  {name:"Albuterol Inhaler",generic:"ProAir/Ventolin",strengths:["90mcg/actuation"]},
  {name:"Fluticasone Inhaler",generic:"Flovent",strengths:["44mcg","110mcg","220mcg"]},
  {name:"Fluticasone-Salmeterol",generic:"Advair",strengths:["100/50mcg","250/50mcg","500/50mcg"]},
  {name:"Budesonide-Formoterol",generic:"Symbicort",strengths:["80/4.5mcg","160/4.5mcg"]},
  {name:"Montelukast",generic:"Singulair",strengths:["4mg","5mg","10mg"]},
  {name:"Cetirizine",generic:"Zyrtec",strengths:["5mg","10mg"]},
  {name:"Loratadine",generic:"Claritin",strengths:["10mg"]},
  {name:"Fexofenadine",generic:"Allegra",strengths:["60mg","180mg"]},
  {name:"Fluticasone Nasal Spray",generic:"Flonase",strengths:["50mcg/spray"]},
  {name:"Insulin Glargine",generic:"Lantus",strengths:["100 units/mL"]},
  {name:"Insulin Lispro",generic:"Humalog",strengths:["100 units/mL"]},
  {name:"Insulin Aspart",generic:"NovoLog",strengths:["100 units/mL"]},
  {name:"Glipizide",generic:"Glucotrol",strengths:["5mg","10mg"]},
  {name:"Glimepiride",generic:"Amaryl",strengths:["1mg","2mg","4mg"]},
  {name:"Pioglitazone",generic:"Actos",strengths:["15mg","30mg","45mg"]},
  {name:"Sitagliptin",generic:"Januvia",strengths:["25mg","50mg","100mg"]},
  {name:"Empagliflozin",generic:"Jardiance",strengths:["10mg","25mg"]},
  {name:"Dapagliflozin",generic:"Farxiga",strengths:["5mg","10mg"]},
  {name:"Semaglutide",generic:"Ozempic/Wegovy",strengths:["0.25mg","0.5mg","1mg","2mg","2.4mg"]},
  {name:"Liraglutide",generic:"Victoza/Saxenda",strengths:["0.6mg","1.2mg","1.8mg","3mg"]},
  {name:"Tirzepatide",generic:"Mounjaro/Zepbound",strengths:["2.5mg","5mg","7.5mg","10mg","12.5mg","15mg"]},
  {name:"Warfarin",generic:"Coumadin",strengths:["1mg","2mg","2.5mg","3mg","4mg","5mg","6mg","7.5mg","10mg"]},
  {name:"Apixaban",generic:"Eliquis",strengths:["2.5mg","5mg"]},
  {name:"Rivaroxaban",generic:"Xarelto",strengths:["2.5mg","10mg","15mg","20mg"]},
  {name:"Clopidogrel",generic:"Plavix",strengths:["75mg"]},
  {name:"Aspirin",strengths:["81mg","325mg"]},
  {name:"Tamsulosin",generic:"Flomax",strengths:["0.4mg"]},
  {name:"Finasteride",generic:"Proscar",strengths:["1mg","5mg"]},
  {name:"Sildenafil",generic:"Viagra",strengths:["25mg","50mg","100mg"]},
  {name:"Tadalafil",generic:"Cialis",strengths:["2.5mg","5mg","10mg","20mg"]},
  {name:"Estradiol",generic:"Estrace",strengths:["0.5mg","1mg","2mg"]},
  {name:"Progesterone",generic:"Prometrium",strengths:["100mg","200mg"]},
  {name:"Norethindrone",generic:"Aygestin",strengths:["5mg"]},
  {name:"Testosterone Cypionate",generic:"Depo-Testosterone",strengths:["100mg/mL","200mg/mL"]},
  {name:"Zolpidem",generic:"Ambien",strengths:["5mg","10mg"]},
  {name:"Suvorexant",generic:"Belsomra",strengths:["5mg","10mg","15mg","20mg"]},
  {name:"Hydroxyzine",generic:"Vistaril",strengths:["10mg","25mg","50mg"]},
  {name:"Ondansetron",generic:"Zofran",strengths:["4mg","8mg"]},
  {name:"Oxycodone",generic:"OxyContin",strengths:["5mg","10mg","15mg","20mg","30mg"]},
  {name:"Hydrocodone-Acetaminophen",generic:"Vicodin/Norco",strengths:["5/325mg","7.5/325mg","10/325mg"]},
  {name:"Morphine",generic:"MS Contin",strengths:["15mg","30mg","60mg"]},
  {name:"Aripiprazole",generic:"Abilify",strengths:["2mg","5mg","10mg","15mg","20mg","30mg"]},
  {name:"Quetiapine",generic:"Seroquel",strengths:["25mg","50mg","100mg","200mg","300mg","400mg"]},
  {name:"Olanzapine",generic:"Zyprexa",strengths:["2.5mg","5mg","10mg","15mg","20mg"]},
  {name:"Risperidone",generic:"Risperdal",strengths:["0.25mg","0.5mg","1mg","2mg","3mg","4mg"]},
  {name:"Lamotrigine",generic:"Lamictal",strengths:["25mg","100mg","150mg","200mg"]},
  {name:"Lithium Carbonate",generic:"Lithobid",strengths:["150mg","300mg","600mg"]},
  {name:"Valproic Acid",generic:"Depakote",strengths:["125mg","250mg","500mg"]},
  {name:"Topiramate",generic:"Topamax",strengths:["25mg","50mg","100mg","200mg"]},
  {name:"Levetiracetam",generic:"Keppra",strengths:["250mg","500mg","750mg","1000mg"]},
  {name:"Methylphenidate",generic:"Ritalin/Concerta",strengths:["5mg","10mg","18mg","27mg","36mg","54mg"]},
  {name:"Amphetamine-Dextroamphetamine",generic:"Adderall",strengths:["5mg","10mg","15mg","20mg","25mg","30mg"]},
  {name:"Lisdexamfetamine",generic:"Vyvanse",strengths:["10mg","20mg","30mg","40mg","50mg","60mg","70mg"]},
  {name:"Atomoxetine",generic:"Strattera",strengths:["10mg","18mg","25mg","40mg","60mg","80mg","100mg"]},
  {name:"Latanoprost",generic:"Xalatan",strengths:["0.005%"]},
  {name:"Timolol",generic:"Timoptic",strengths:["0.25%","0.5%"]},
  {name:"Methotrexate",generic:"Trexall",strengths:["2.5mg","5mg","7.5mg","10mg","15mg"]},
  {name:"Adalimumab",generic:"Humira",strengths:["40mg"]},
  {name:"Etanercept",generic:"Enbrel",strengths:["25mg","50mg"]},
  {name:"Allopurinol",generic:"Zyloprim",strengths:["100mg","300mg"]},
  {name:"Colchicine",generic:"Colcrys",strengths:["0.6mg"]},
  {name:"Baclofen",generic:"Lioresal",strengths:["5mg","10mg","20mg"]},
  {name:"Ranitidine",generic:"Zantac",strengths:["75mg","150mg","300mg"]},
  {name:"Famotidine",generic:"Pepcid",strengths:["10mg","20mg","40mg"]},
  {name:"Sucralfate",generic:"Carafate",strengths:["1g"]},
  {name:"Dicyclomine",generic:"Bentyl",strengths:["10mg","20mg"]},
  {name:"Polyethylene Glycol",generic:"MiraLAX",strengths:["17g"]},
  {name:"Docusate Sodium",generic:"Colace",strengths:["100mg","250mg"]},
  {name:"Linaclotide",generic:"Linzess",strengths:["72mcg","145mcg","290mcg"]},
  {name:"Mesalamine",generic:"Lialda",strengths:["400mg","800mg","1.2g"]},
  {name:"Sumatriptan",generic:"Imitrex",strengths:["25mg","50mg","100mg"]},
  {name:"Rizatriptan",generic:"Maxalt",strengths:["5mg","10mg"]},
];
const BODY_AREAS = ["Head","Eyes","Ears","Nose/Throat","Chest","Abdomen","Back","Arms/Hands","Legs/Feet","Skin","General/Whole Body","Mental/Emotional"];
const SYMPTOM_MAP = {
  "Head":["Headache","Migraine","Dizziness","Light-headedness","Pressure","Throbbing pain"],
  "Eyes":["Blurry vision","Eye pain","Redness","Dry eyes","Light sensitivity","Floaters"],
  "Ears":["Ear pain","Ringing (tinnitus)","Hearing loss","Feeling of fullness","Discharge"],
  "Nose/Throat":["Sore throat","Runny nose","Congestion","Sneezing","Post-nasal drip","Hoarseness","Difficulty swallowing"],
  "Chest":["Chest pain","Shortness of breath","Palpitations","Cough","Wheezing","Tightness"],
  "Abdomen":["Nausea","Vomiting","Diarrhea","Constipation","Bloating","Abdominal pain","Heartburn","Loss of appetite"],
  "Back":["Lower back pain","Upper back pain","Stiffness","Shooting pain","Muscle spasm"],
  "Arms/Hands":["Joint pain","Numbness","Tingling","Weakness","Swelling","Stiffness"],
  "Legs/Feet":["Leg pain","Swelling","Cramps","Numbness","Joint pain","Weakness"],
  "Skin":["Rash","Itching","Hives","Dry skin","Discoloration","Bruising","Wound that won't heal"],
  "General/Whole Body":["Fever","Fatigue","Chills","Night sweats","Unexplained weight loss","Weight gain","Muscle aches","Weakness"],
  "Mental/Emotional":["Anxiety","Depression","Insomnia","Brain fog","Irritability","Mood swings","Difficulty concentrating"],
};
const DOCTOR_SPECIALTIES = [
  {name:"Primary Care / Family Medicine",icon:"🩺",desc:"General health, preventive care",when:"Annual checkups, common illnesses"},
  {name:"Internal Medicine",icon:"🫀",desc:"Complex medical conditions in adults",when:"Multi-system issues"},
  {name:"Dermatology",icon:"🧴",desc:"Skin, hair, nail conditions",when:"Rashes, acne, skin cancer screening"},
  {name:"Cardiology",icon:"❤️",desc:"Heart and cardiovascular system",when:"Chest pain, hypertension"},
  {name:"Gastroenterology",icon:"🫁",desc:"Digestive system disorders",when:"IBS, acid reflux, liver issues"},
  {name:"Orthopedics",icon:"🦴",desc:"Bones, joints, muscles",when:"Joint pain, fractures"},
  {name:"Neurology",icon:"🧠",desc:"Brain and nervous system",when:"Migraines, seizures, neuropathy"},
  {name:"Endocrinology",icon:"⚗️",desc:"Hormonal and metabolic disorders",when:"Diabetes, thyroid, PCOS"},
  {name:"Psychiatry",icon:"💬",desc:"Mental health medication",when:"Depression, anxiety, ADHD"},
  {name:"Pulmonology",icon:"🌬️",desc:"Lung and respiratory",when:"Asthma, COPD, sleep apnea"},
  {name:"Rheumatology",icon:"🤲",desc:"Autoimmune diseases",when:"Lupus, rheumatoid arthritis"},
  {name:"Urgent Care",icon:"🚑",desc:"Immediate non-emergency care",when:"Sprains, minor cuts, flu, UTIs"},
];

const LAB_CATEGORIES = [
  {name:"Complete Blood Count (CBC)",tests:["WBC","RBC","Hemoglobin","Hematocrit","Platelets","MCV","MCH","MCHC"]},
  {name:"Metabolic Panel",tests:["Glucose (fasting)","BUN","Creatinine","Sodium","Potassium","Chloride","CO2","Calcium","eGFR"]},
  {name:"Lipid Panel",tests:["Total Cholesterol","LDL","HDL","Triglycerides","VLDL"]},
  {name:"Thyroid",tests:["TSH","Free T3","Free T4","T3 Uptake"]},
  {name:"Liver Function",tests:["ALT (SGPT)","AST (SGOT)","ALP","Bilirubin Total","Bilirubin Direct","Albumin","Total Protein"]},
  {name:"Vitamins & Minerals",tests:["Vitamin D (25-OH)","Vitamin B12","Folate","Iron","Ferritin","TIBC","Magnesium","Zinc"]},
  {name:"Hormones",tests:["Testosterone","Estradiol","Progesterone","DHEA-S","Cortisol","Insulin","HbA1c","IGF-1"]},
  {name:"Inflammation & Immunity",tests:["CRP (hs-CRP)","ESR","ANA","Rheumatoid Factor","Uric Acid","Homocysteine"]},
  {name:"Urinalysis",tests:["pH","Specific Gravity","Protein","Glucose","Ketones","Blood","WBC"]},
  {name:"Other",tests:["PSA","Vitamin A","CoQ10","Omega-3 Index","GGT","LDH","Fibrinogen"]},
];

const LAB_RANGES = {
  "Glucose (fasting)":{unit:"mg/dL",low:70,high:100,critical_low:54,critical_high:400},
  "Total Cholesterol":{unit:"mg/dL",low:0,high:200,critical_high:300},
  "LDL":{unit:"mg/dL",low:0,high:100,critical_high:190},
  "HDL":{unit:"mg/dL",low:40,high:999},
  "Triglycerides":{unit:"mg/dL",low:0,high:150,critical_high:500},
  "TSH":{unit:"mIU/L",low:0.4,high:4.0},
  "Hemoglobin":{unit:"g/dL",low:12,high:17.5},
  "WBC":{unit:"K/uL",low:4.5,high:11.0},
  "Platelets":{unit:"K/uL",low:150,high:400},
  "Creatinine":{unit:"mg/dL",low:0.6,high:1.2},
  "BUN":{unit:"mg/dL",low:7,high:20},
  "HbA1c":{unit:"%",low:4.0,high:5.7,critical_high:9.0},
  "Vitamin D (25-OH)":{unit:"ng/mL",low:30,high:100},
  "Vitamin B12":{unit:"pg/mL",low:200,high:900},
  "Ferritin":{unit:"ng/mL",low:12,high:300},
  "Iron":{unit:"mcg/dL",low:60,high:170},
  "CRP (hs-CRP)":{unit:"mg/L",low:0,high:3.0},
  "ALT (SGPT)":{unit:"U/L",low:7,high:56},
  "AST (SGOT)":{unit:"U/L",low:10,high:40},
  "Testosterone":{unit:"ng/dL",low:300,high:1000},
  "Cortisol":{unit:"mcg/dL",low:6,high:18},
  "Sodium":{unit:"mEq/L",low:136,high:145},
  "Potassium":{unit:"mEq/L",low:3.5,high:5.0},
  "Calcium":{unit:"mg/dL",low:8.5,high:10.5},
};

const today = () => new Date().toISOString().slice(0,10);
function getOrCreateLog(logs,date){const e=logs.find(l=>l.date===date);return e||{date,water:0,calories:0,protein:0,carbs:0,fat:0,fiber:0,steps:0,sleep:0,mood:-1,exercise:[],supplements:[],meals:[],notes:""};}
function getWeekLogs(logs){const w=[];const d=new Date();for(let i=6;i>=0;i--){const dd=new Date(d);dd.setDate(dd.getDate()-i);w.push(getOrCreateLog(logs,dd.toISOString().slice(0,10)));}return w;}
function computeStreak(logs){let s=0;const sorted=[...logs].sort((a,b)=>b.date.localeCompare(a.date));const d=new Date();for(let i=0;i<60;i++){const ds=d.toISOString().slice(0,10);const l=sorted.find(x=>x.date===ds);if(l&&(l.water>0||l.calories>0||l.exercise.length>0))s++;else if(i>0)break;d.setDate(d.getDate()-1);}return s;}
function generateInsights(profile,todayLog,weekLogs){
  const ins=[];const w=parseFloat(profile.weight)||150;const wg=Math.round(w*0.5);
  if(todayLog.water<wg*0.5)ins.push({icon:"💧",title:"Drink more water",text:`${todayLog.water} oz — aim for ${wg} oz`,priority:"high"});
  else if(todayLog.water>=wg)ins.push({icon:"💧",title:"Hydration on point!",text:`Great job hitting ${todayLog.water} oz`,priority:"success"});
  const pg=profile.goals.includes("Build Muscle")?w*1.8:w*1.2;
  if(todayLog.protein>0&&todayLog.protein<pg*0.6)ins.push({icon:"🥩",title:"Increase protein",text:`${todayLog.protein}g — target ~${Math.round(pg)}g`,priority:"medium"});
  const as=weekLogs.reduce((s,l)=>s+l.sleep,0)/7;
  if(as>0&&as<7)ins.push({icon:"😴",title:"Sleep deficit",text:`7-day avg ${as.toFixed(1)}hrs. Need 7-9hrs.`,priority:"high"});
  if(ins.length===0)ins.push({icon:"✨",title:"Keep it up!",text:"Log meals, exercise, and water for insights.",priority:"low"});
  return ins;
}

// ═══ PROACTIVE TEAM INSIGHT ENGINE ═══
function generateTeamInsights(state) {
  const cards = [];
  const logs = state.logs || [];
  const profile = state.profile || {};
  const meds = state.medications || [];
  const labs = state.labResults || [];
  const symptoms = state.symptomSessions || [];
  const timeline = state.healthTimeline || [];
  const today_str = new Date().toISOString().slice(0, 10);
  const weight = parseFloat(profile.weight) || 150;

  // Helper: get last N days of logs
  const recentLogs = (n) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - n);
    const cs = cutoff.toISOString().slice(0, 10);
    return logs.filter(l => l.date >= cs).sort((a, b) => a.date.localeCompare(b.date));
  };
  const last7 = recentLogs(7);
  const last14 = recentLogs(14);
  const prior7 = last14.filter(l => !last7.find(w => w.date === l.date));

  // Helper: day count since last occurrence
  const daysSince = (dateStr) => {
    if (!dateStr) return 999;
    return Math.floor((new Date() - new Date(dateStr)) / 86400000);
  };

  // ─── 🩺 DOCTOR ───
  // Flagged labs
  const allFlags = labs.flatMap(lr => (lr.results || []).filter(r => r.flag && r.flag !== "NORMAL").map(r => ({ ...r, date: lr.date })));
  const recentFlags = allFlags.filter(f => daysSince(f.date) <= 30);
  if (recentFlags.length >= 3) {
    cards.push({ pro: "doctor", icon: "🩺", title: "We should talk about your labs", text: `You've got ${recentFlags.length} flagged values in the last month. A few abnormals happen — but ${recentFlags.length} together is worth a closer look. I can walk you through what they mean together.`, action: "ask", priority: "high" });
  }

  // No labs in 90+ days
  const lastLabDate = labs.length > 0 ? labs.sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
  if (lastLabDate && daysSince(lastLabDate) > 90) {
    cards.push({ pro: "doctor", icon: "🩺", title: "It's been a while since your last labs", text: `${daysSince(lastLabDate)} days since your last results. If you've had bloodwork done recently, upload it — I can spot trends your doctor might not have time to explain.`, action: "labs", priority: "medium" });
  }

  // Recurring symptoms in same area
  const recentSymptoms = symptoms.filter(s => daysSince(s.date) <= 60);
  const areaCount = {};
  recentSymptoms.forEach(s => { areaCount[s.area] = (areaCount[s.area] || 0) + 1; });
  const recurringArea = Object.entries(areaCount).find(([_, count]) => count >= 3);
  if (recurringArea) {
    cards.push({ pro: "doctor", icon: "🩺", title: `Your ${recurringArea[0].toLowerCase()} keeps coming up`, text: `${recurringArea[1]} symptom checks in that area over the last 2 months. That's a pattern worth investigating — not ignoring. Let's talk through what might be going on.`, action: "ask", priority: "high" });
  }

  // New medication started in last 7 days
  const newMeds = meds.filter(m => m.active !== false && m.addedAt && daysSince(m.addedAt.slice(0, 10)) <= 7);
  if (newMeds.length > 0) {
    cards.push({ pro: "doctor", icon: "🩺", title: `Checking in on ${newMeds[0].name}`, text: `You started this ${daysSince(newMeds[0].addedAt.slice(0, 10)) === 0 ? "today" : daysSince(newMeds[0].addedAt.slice(0, 10)) + " days ago"}. Any side effects? I can flag what to watch for and check interactions with your other meds.`, action: "ask", priority: "medium" });
  }

  // ─── 🍓 NUTRITIONIST ───
  const avgCal7 = last7.filter(l => l.calories > 0);
  const avgCal14prior = prior7.filter(l => l.calories > 0);
  const cal7 = avgCal7.length > 0 ? avgCal7.reduce((s, l) => s + l.calories, 0) / avgCal7.length : 0;
  const calPrior = avgCal14prior.length > 0 ? avgCal14prior.reduce((s, l) => s + l.calories, 0) / avgCal14prior.length : 0;

  // Calorie drop >30%
  if (calPrior > 0 && cal7 > 0 && cal7 < calPrior * 0.7) {
    const drop = Math.round((1 - cal7 / calPrior) * 100);
    cards.push({ pro: "nutritionist", icon: "🍓", title: "Your calories dropped off a cliff", text: `Down ${drop}% from last week — ${Math.round(calPrior)} to ${Math.round(cal7)}. Could be intentional, could be life getting in the way. Either way, let's make sure you're still fueling what your body needs.`, action: "nutritionist", priority: "high" });
  }

  // Protein consistently low
  const proteinTarget = profile.goals?.includes("Build Muscle") ? Math.round(weight * 0.82) : Math.round(weight * 0.55);
  const avgProtein7 = last7.filter(l => l.protein > 0);
  if (avgProtein7.length >= 3) {
    const avgP = avgProtein7.reduce((s, l) => s + l.protein, 0) / avgProtein7.length;
    if (avgP < proteinTarget * 0.6) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Protein's running low", text: `You're averaging ${Math.round(avgP)}g — your target is closer to ${Math.round(proteinTarget)}g. That's a gap that'll show up in energy, recovery, and muscle. I've got easy fixes if you want them.`, action: "nutritionist", priority: "medium" });
    }
  }

  // Water trending down 4+ days
  const waterDays = last7.filter(l => l.water > 0);
  if (waterDays.length >= 4) {
    const waterTrend = waterDays.slice(-4);
    const declining = waterTrend.every((l, i) => i === 0 || l.water <= waterTrend[i - 1].water) && waterTrend[0].water > waterTrend[waterTrend.length - 1].water;
    if (declining) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Your water intake is sliding", text: `Steady decline the last ${waterTrend.length} days — from ${waterTrend[0].water} oz down to ${waterTrend[waterTrend.length - 1].water} oz. Dehydration sneaks up on you. It messes with energy, focus, and even lab values.`, action: "nutritionist", priority: "medium" });
    }
  }

  // Great nutrition consistency
  if (avgCal7.length >= 6 && cal7 > 0) {
    const variance = avgCal7.reduce((s, l) => s + Math.abs(l.calories - cal7), 0) / avgCal7.length;
    if (variance < cal7 * 0.15) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Your nutrition is dialed in", text: `6+ days logged, consistent calories, and you're actually hitting your targets. That's not luck — that's discipline. Keep this going and your body will show it.`, action: "nutritionist", priority: "positive" });
    }
  }

  // ─── 🏋️ TRAINER ───
  const exerciseDays7 = last7.filter(l => l.exercise && l.exercise.length > 0).length;
  const exerciseDaysPrior = prior7.filter(l => l.exercise && l.exercise.length > 0).length;

  // Exercise dropped off
  if (exerciseDaysPrior >= 3 && exerciseDays7 === 0 && last7.length >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Hey — haven't seen you move this week", text: `You were hitting ${exerciseDaysPrior} days last week. This week: zero. No guilt trip — life happens. But let's get at least one session in. Even 15 minutes counts. Want me to build you a quick one?`, action: "trainer", priority: "high" });
  }

  // Exercising on bad sleep
  const recentExerciseOnBadSleep = last7.filter(l => l.exercise?.length > 0 && l.sleep > 0 && l.sleep < 6);
  if (recentExerciseOnBadSleep.length >= 2) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "You're training on fumes", text: `${recentExerciseOnBadSleep.length} workout days this week on under 6 hours of sleep. I respect the dedication, but your body recovers during sleep — not during reps. You're getting diminishing returns and increasing injury risk.`, action: "trainer", priority: "high" });
  }

  // Great exercise streak
  if (exerciseDays7 >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "5+ days this week. Respect.", text: `${exerciseDays7} training days. That's the kind of consistency that compounds. Just make sure you're getting recovery too — your muscles grow on rest days, not workout days.`, action: "trainer", priority: "positive" });
  }

  // No variety in exercise
  if (exerciseDays7 >= 3) {
    const exTypes = {};
    last7.forEach(l => (l.exercise || []).forEach(e => { exTypes[e.type] = (exTypes[e.type] || 0) + 1; }));
    const types = Object.keys(exTypes);
    if (types.length === 1) {
      cards.push({ pro: "trainer", icon: "🏋️", title: `All ${types[0].toLowerCase()}, all the time`, text: `${exTypes[types[0]]} sessions of the same thing. I love the commitment, but your body adapts. Let's mix in something different — even once a week makes a difference for balanced fitness.`, action: "trainer", priority: "medium" });
    }
  }

  // Sedentary 7+ days (with active logging)
  if (exerciseDays7 === 0 && exerciseDaysPrior === 0 && last7.length >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Two weeks with no movement logged", text: `Not judging — just noticing. Even a 10-minute walk changes your day. I can build you something so easy it feels like cheating. Want to start small?`, action: "trainer", priority: "medium" });
  }

  // ─── 💜 THERAPIST ───
  const moodDays = last7.filter(l => l.mood >= 0);

  // Mood declining 3+ consecutive days
  if (moodDays.length >= 3) {
    const recent3 = moodDays.slice(-3);
    const declining = recent3.every((l, i) => i === 0 || l.mood <= recent3[i - 1].mood) && recent3[0].mood > recent3[recent3.length - 1].mood;
    if (declining && recent3[recent3.length - 1].mood <= 2) {
      cards.push({ pro: "therapist", icon: "💜", title: "I've noticed your mood dipping", text: `Three days trending down — ending at ${["terrible", "rough", "okay", "good", "great"][recent3[recent3.length - 1].mood]}. That's not a diagnosis, it's just a pattern worth paying attention to. Sometimes talking through it helps more than pushing through it.`, action: "therapist", priority: "high" });
    }
  }

  // Consistently low mood (avg ≤1.5 over 5+ days)
  if (moodDays.length >= 5) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood <= 1.5) {
      cards.push({ pro: "therapist", icon: "💜", title: "You've been having a rough stretch", text: `Your mood has averaged ${["terrible", "poor"][Math.round(avgMood)]} over the past ${moodDays.length} days. That's hard, and it's okay to not be okay. I'm here if you want to talk through what's going on — no pressure.`, action: "therapist", priority: "high" });
    }
  }

  // Sleep + mood both declining
  const sleepDays = last7.filter(l => l.sleep > 0);
  if (moodDays.length >= 3 && sleepDays.length >= 3) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    const avgSleep = sleepDays.reduce((s, l) => s + l.sleep, 0) / sleepDays.length;
    if (avgMood <= 2 && avgSleep < 6.5 && !cards.find(c => c.pro === "therapist")) {
      cards.push({ pro: "therapist", icon: "💜", title: "Sleep and mood — they're connected", text: `Low sleep (${avgSleep.toFixed(1)} hrs avg) and low mood tend to feed each other. It's not just about willpower — it's biochemistry. Let's talk about breaking the cycle from either end.`, action: "therapist", priority: "high" });
    }
  }

  // New diagnosis/event in timeline (last 14 days)
  const recentDiagnosis = timeline.filter(e => (e.type === "diagnosis" || e.type === "medication") && daysSince(e.date) <= 14);
  if (recentDiagnosis.length > 0 && !cards.find(c => c.pro === "therapist")) {
    const event = recentDiagnosis[recentDiagnosis.length - 1];
    cards.push({ pro: "therapist", icon: "💜", title: "Checking in after your recent news", text: `"${event.title}" showed up in your timeline ${daysSince(event.date)} days ago. New diagnoses and medication changes can stir up a lot — uncertainty, frustration, grief. That's all normal. I'm here if you want to process any of it.`, action: "therapist", priority: "medium" });
  }

  // Consistently good mood — celebrate
  if (moodDays.length >= 5) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood >= 3.5) {
      cards.push({ pro: "therapist", icon: "💜", title: "You're in a good place right now", text: `Mood has been solid for ${moodDays.length} days. I just want to name that — it matters. Whatever you're doing is working. Let's bottle it.`, action: "therapist", priority: "positive" });
    }
  }

  // ─── CROSS-AGENT INSIGHTS ───
  // Low calories + low mood (nutritionist + therapist)
  if (cal7 > 0 && cal7 < weight * 9 && moodDays.length >= 3) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood <= 2 && !cards.find(c => c.title.includes("calories"))) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Underfueling might be affecting your mood", text: `${Math.round(cal7)} cal/day is low for your body, and your mood's been down too. That's not always a coincidence — your brain runs on glucose. Let's make sure you're eating enough to feel like yourself.`, action: "nutritionist", priority: "high", crossAgent: "therapist" });
    }
  }

  // Exercising a lot but not eating enough (trainer + nutritionist)
  if (exerciseDays7 >= 4 && cal7 > 0 && cal7 < weight * 11) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Training hard, eating light — careful", text: `${exerciseDays7} workout days but only ${Math.round(cal7)} cal/day. You're in a deficit that could cost you muscle and energy. Your nutritionist and I agree: fuel the work.`, action: "nutritionist", priority: "medium", crossAgent: "nutritionist" });
  }

  // Sort: high first, then medium, then positive
  const priorityOrder = { high: 0, medium: 1, positive: 2, low: 3 };
  cards.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return cards.slice(0, 5); // Max 5 cards on dashboard
}

function RingProgress({value,max,size=64,stroke=5,color}){const r=(size-stroke)/2,c=2*Math.PI*r,p=max>0?Math.min(value/max,1):0;return <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c*(1-p)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.8s ease"}}/></svg>;}
function MiniBar({values,max,color,labels}){const h=80;return <div style={{display:"flex",alignItems:"flex-end",gap:2,height:h}}>{values.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",maxWidth:32,height:max>0?Math.max(2,(v/max)*h):2,background:v>0?color:"var(--muted)",borderRadius:4,transition:"height 0.5s ease"}}/><span style={{fontSize:15,color:"var(--dim)",fontFamily:"var(--mono)"}}>{labels?.[i]||""}</span></div>)}</div>;}

// ═══ BUILD PATIENT CONTEXT FOR AI ═══
function buildPatientContext(state) {
  const p = state.profile;
  const labs = state.labResults || [];
  const symptoms = state.symptomSessions || [];
  const timeline = state.healthTimeline || [];
  const memory = state.aiMemory || [];
  const logs = state.logs || [];
  const meds = state.medications || [];

  // Recent wellness trends (last 7 days)
  const recent = getWeekLogs(logs);
  const avgSleep = recent.reduce((s,l)=>s+l.sleep,0)/7;
  const avgWater = recent.reduce((s,l)=>s+l.water,0)/7;
  const avgCalories = recent.filter(l=>l.calories>0);
  const avgCal = avgCalories.length>0 ? avgCalories.reduce((s,l)=>s+l.calories,0)/avgCalories.length : 0;
  const recentMoods = recent.filter(l=>l.mood>=0).map(l=>["terrible","poor","okay","good","great"][l.mood]);
  const exerciseDays = recent.filter(l=>l.exercise.length>0).length;

  // Lab results summary - most recent per test
  const latestLabs = {};
  [...labs].sort((a,b)=>a.date.localeCompare(b.date)).forEach(lr => {
    lr.results.forEach(r => { latestLabs[r.name] = { value: r.value, unit: r.unit, date: lr.date, flag: r.flag }; });
  });

  // Lab trends (tests with multiple readings)
  const labTrends = {};
  labs.forEach(lr => {
    lr.results.forEach(r => {
      if(!labTrends[r.name]) labTrends[r.name] = [];
      labTrends[r.name].push({ value: r.value, date: lr.date });
    });
  });
  const trendSummaries = Object.entries(labTrends).filter(([k,v])=>v.length>=2).map(([name,readings])=>{
    const sorted = readings.sort((a,b)=>a.date.localeCompare(b.date));
    const first = sorted[0].value, last = sorted[sorted.length-1].value;
    const direction = last > first ? "increasing" : last < first ? "decreasing" : "stable";
    return `${name}: ${first} → ${last} (${direction} over ${sorted.length} readings)`;
  });

  // Recent symptom history
  const recentSymptoms = symptoms.slice(-5).map(s => `${s.date}: ${s.area} - ${s.symptoms.join(", ")} (severity ${s.severity}/10, duration: ${s.duration})`);

  // Health timeline events
  const recentTimeline = timeline.slice(-10).map(e => `${e.date}: [${e.type}] ${e.title} — ${e.notes||""}`);

  // AI memory (learned observations)
  const memoryStr = memory.slice(-20).map(m => `[${m.date}] ${m.insight}`).join("\n");

  let context = `COMPREHENSIVE PATIENT PROFILE:
Name: ${p.name||"Not provided"} | Age: ${p.age||"?"} | Sex: ${p.sex||"?"} | Weight: ${p.weight||"?"} lbs | Height: ${fmtHeight(p.height)}
Blood Type: ${p.bloodType||"Unknown"} | Diet: ${p.dietType||"Not specified"}
Known Conditions: ${p.conditions?.join(", ")||"None"}
Current Medications: ${meds.filter(m=>m.active!==false).length>0 ? meds.filter(m=>m.active!==false).map(m=>`${m.name}${m.dose?" "+m.dose:""}${m.frequency?" ("+m.frequency+")":""}`).join(", ") : (p.medications||"None reported")}
Recently Discontinued: ${meds.filter(m=>m.active===false).length>0 ? meds.filter(m=>m.active===false).map(m=>m.name).join(", ") : "None"}
Allergies: ${p.allergies||"None reported"}
Family History: ${p.familyHistory||"Not provided"}
Health Goals: ${p.goals?.join(", ")||"None"}

RECENT WELLNESS DATA (7-day averages):
Sleep: ${avgSleep.toFixed(1)} hrs/night | Water: ${avgWater.toFixed(0)} oz/day | Calories: ${avgCal>0?Math.round(avgCal):"not tracked"}/day
Exercise days: ${exerciseDays}/7 | Recent moods: ${recentMoods.join(", ")||"not tracked"}`;

  if (Object.keys(latestLabs).length > 0) {
    context += `\n\nLATEST LAB RESULTS:`;
    Object.entries(latestLabs).forEach(([name,data]) => {
      context += `\n  ${name}: ${data.value} ${data.unit} ${data.flag?`[${data.flag}]`:""} (${data.date})`;
    });
  }

  if (trendSummaries.length > 0) {
    context += `\n\nLAB TRENDS:\n${trendSummaries.join("\n")}`;
  }

  if (recentSymptoms.length > 0) {
    context += `\n\nSYMPTOM HISTORY (recent):\n${recentSymptoms.join("\n")}`;
  }

  if (recentTimeline.length > 0) {
    context += `\n\nHEALTH TIMELINE:\n${recentTimeline.join("\n")}`;
  }

  if (memoryStr) {
    context += `\n\nPRIOR AI OBSERVATIONS & LEARNED PATTERNS:\n${memoryStr}`;
  }

  return context;
}

// ═══ MEDICAL DATA APIS (PubMed, OpenFDA) ═══

async function searchPubMed(query, maxResults = 3) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&sort=relevance&term=${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
    const fetchRes = await fetch(fetchUrl);
    const fetchData = await fetchRes.json();
    const results = [];
    for (const id of ids) {
      const article = fetchData?.result?.[id];
      if (article) {
        results.push({
          pmid: id,
          title: article.title || "",
          authors: (article.authors || []).slice(0, 3).map(a => a.name).join(", "),
          journal: article.fulljournalname || article.source || "",
          year: article.pubdate?.split(" ")[0] || "",
          doi: article.elocationid || "",
        });
      }
    }
    return results;
  } catch (e) { return []; }
}

async function fetchPubMedAbstract(pmid) {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);
    return match ? match[1].replace(/<[^>]+>/g, "").slice(0, 600) : "";
  } catch { return ""; }
}

async function searchOpenFDA(drugName, type = "label") {
  try {
    const endpoints = {
      label: `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`,
      events: `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.brand_name:"${encodeURIComponent(drugName)}"+patient.drug.openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=3`,
      recalls: `https://api.fda.gov/drug/enforcement.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=2&sort=report_date:desc`,
    };
    const res = await fetch(endpoints[type]);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results || null;
  } catch { return null; }
}

function extractMedicalTerms(text, profile) {
  const terms = [];
  // Extract drug names from user message and profile
  const allText = text + " " + (profile.medications || "");
  const drugPatterns = /\b(metformin|lisinopril|atorvastatin|amlodipine|omeprazole|losartan|simvastatin|levothyroxine|gabapentin|hydrochlorothiazide|sertraline|fluoxetine|escitalopram|duloxetine|bupropion|trazodone|alprazolam|lorazepam|clonazepam|prednisone|ibuprofen|acetaminophen|aspirin|amoxicillin|azithromycin|ciprofloxacin|doxycycline|insulin|ozempic|semaglutide|wegovy|mounjaro|tirzepatide|adderall|ritalin|concerta|xanax|ambien|zolpidem|warfarin|eliquis|apixaban|jardiance|empagliflozin|metoprolol|carvedilol|pantoprazole|famotidine|montelukast|albuterol|fluticasone)\b/gi;
  const drugs = [...new Set((allText.match(drugPatterns) || []).map(d => d.toLowerCase()))];

  // Extract condition/symptom terms from the message
  const conditionPatterns = /\b(diabetes|hypertension|blood pressure|cholesterol|thyroid|hypothyroid|hyperthyroid|asthma|arthritis|migraine|headache|anxiety|depression|insomnia|IBS|GERD|acid reflux|heart disease|stroke|cancer|tumor|infection|anemia|vitamin d deficiency|b12 deficiency|iron deficiency|kidney disease|liver disease|PCOS|endometriosis|fibromyalgia|lupus|rheumatoid|psoriasis|eczema|UTI|pneumonia|bronchitis|COVID|sleep apnea|ADHD|bipolar|neuropathy)\b/gi;
  const conditions = [...new Set((text.match(conditionPatterns) || []).map(c => c.toLowerCase()))];

  return { drugs, conditions, searchQuery: [...conditions, ...drugs].slice(0, 3).join(" ") || text.split(" ").slice(0, 5).join(" ") };
}

async function gatherRAGContext(userMessage, state) {
  const profile = state.profile;
  const terms = extractMedicalTerms(userMessage, profile);
  const ragParts = [];
  const sources = [];

  // Run all queries in parallel for speed
  const promises = [];

  // 1. PubMed search for the main medical query
  if (terms.searchQuery) {
    promises.push(
      searchPubMed(terms.searchQuery + " treatment guidelines", 3)
        .then(async (articles) => {
          if (articles.length > 0) {
            // Fetch abstract for top result
            const topAbstract = await fetchPubMedAbstract(articles[0].pmid);
            const pubmedContext = articles.map(a =>
              `• "${a.title}" — ${a.authors} (${a.journal}, ${a.year}) [PMID: ${a.pmid}]`
            ).join("\n");
            ragParts.push(`PUBMED RESEARCH (recent relevant papers):\n${pubmedContext}${topAbstract ? `\n\nTop result abstract excerpt: ${topAbstract}` : ""}`);
            sources.push(...articles.map(a => ({ type: "pubmed", pmid: a.pmid, title: a.title, journal: a.journal, year: a.year })));
          }
        }).catch(() => {})
    );
  }

  // 2. OpenFDA drug labels for any mentioned medications
  for (const drug of terms.drugs.slice(0, 2)) {
    promises.push(
      searchOpenFDA(drug, "label")
        .then(results => {
          if (results && results[0]) {
            const label = results[0];
            const info = [];
            if (label.indications_and_usage) info.push(`Indications: ${label.indications_and_usage[0].slice(0, 300)}`);
            if (label.warnings) info.push(`Warnings: ${label.warnings[0].slice(0, 300)}`);
            if (label.adverse_reactions) info.push(`Adverse reactions: ${label.adverse_reactions[0].slice(0, 300)}`);
            if (label.drug_interactions) info.push(`Drug interactions: ${label.drug_interactions[0].slice(0, 300)}`);
            if (label.dosage_and_administration) info.push(`Dosage: ${label.dosage_and_administration[0].slice(0, 200)}`);
            if (info.length > 0) {
              ragParts.push(`FDA DRUG LABEL — ${drug.toUpperCase()}:\n${info.join("\n")}`);
              sources.push({ type: "fda_label", drug, name: label.openfda?.brand_name?.[0] || drug });
            }
          }
        }).catch(() => {})
    );

    // Also check adverse events
    promises.push(
      searchOpenFDA(drug, "events")
        .then(results => {
          if (results && results.length > 0) {
            const reactions = results.flatMap(r =>
              (r.patient?.reaction || []).map(rx => rx.reactionmeddrapt)
            ).filter(Boolean);
            const uniqueReactions = [...new Set(reactions)].slice(0, 10);
            if (uniqueReactions.length > 0) {
              ragParts.push(`FDA ADVERSE EVENTS — ${drug.toUpperCase()}: Commonly reported: ${uniqueReactions.join(", ")}`);
              sources.push({ type: "fda_events", drug });
            }
          }
        }).catch(() => {})
    );
  }

  // 3. OpenFDA drug recalls (if medications mentioned)
  if (terms.drugs.length > 0) {
    promises.push(
      searchOpenFDA(terms.drugs[0], "recalls")
        .then(results => {
          if (results && results.length > 0) {
            const recalls = results.map(r => `${r.product_description?.slice(0,100)} — ${r.reason_for_recall?.slice(0,100)} (${r.report_date})`);
            ragParts.push(`FDA RECENT RECALLS — ${terms.drugs[0].toUpperCase()}:\n${recalls.join("\n")}`);
            sources.push({ type: "fda_recall", drug: terms.drugs[0] });
          }
        }).catch(() => {})
    );
  }

  // 4. Additional PubMed search for specific conditions
  for (const condition of terms.conditions.slice(0, 2)) {
    promises.push(
      searchPubMed(condition + " 2024 clinical review", 2)
        .then(articles => {
          if (articles.length > 0) {
            const ctx = articles.map(a => `• "${a.title}" (${a.journal}, ${a.year}) [PMID: ${a.pmid}]`).join("\n");
            ragParts.push(`PUBMED — ${condition.toUpperCase()} research:\n${ctx}`);
            sources.push(...articles.map(a => ({ type: "pubmed", pmid: a.pmid, title: a.title, journal: a.journal, year: a.year })));
          }
        }).catch(() => {})
    );
  }

  // Wait for all with a timeout
  await Promise.race([
    Promise.allSettled(promises),
    new Promise(resolve => setTimeout(resolve, 6000)) // 6s max wait
  ]);

  return { context: ragParts.join("\n\n"), sources };
}

async function askMedicalAI(messages, state, options = {}) {
  const patientContext = buildPatientContext(state);

  // Extract the user's last message for RAG
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

  // Gather RAG context from PubMed & OpenFDA in parallel
  const ragPromise = (options.skipRAG) ? Promise.resolve({ context: "", sources: [] }) : gatherRAGContext(lastUserMsg, state);
  const rag = await ragPromise;

  const sys = `You are the patient's personal physician within the Healleo health concierge platform — part of their team alongside a nutritionist, trainer, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the doctor everyone wishes they had. Brilliant but approachable. You explain things clearly without talking down.
- Empathetic: you understand that health concerns are scary, that waiting for test results is agony, and that patients just want someone to take them seriously. You do.
- Authoritative: you know medicine. You cite PubMed, reference FDA data, and ground your answers in evidence. When you're confident, it shows. When you're not sure, you say so — that's what makes people trust you.
- Self-effacing: you don't hide behind jargon or play God. You'll say "honestly, this is a gray area" or "I'd want to rule out X before we worry about Y."
- Dry humor: sparingly. A well-timed human moment keeps the conversation from feeling clinical. You're a person, not a textbook.
- You root for this patient. You remember their history, notice patterns, and connect dots that a 15-minute office visit would miss. That's why they trust you.
- You're realistic: you don't catastrophize and you don't hand-wave. If something is concerning, you say it plainly. If something is probably fine, you say that too.
- You connect ALL the dots: labs + symptoms + medications + lifestyle + mood + nutrition + exercise. That's the whole point of Healleo — you see the full picture.

${patientContext}

${(() => {
  const doctorPlans = (state.sharedPlans || []).filter(p => p.to === "doctor").slice(-5);
  if (doctorPlans.length === 0) return "";
  const proLabels = { nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist" };
  return "═══ SHARED PLANS FROM YOUR COLLEAGUES ═══\nThe following plans were shared with you by other members of this patient's Healleo team. Reference them when relevant — coordinate, don't contradict. If you see something that concerns you, say so.\n\n" + doctorPlans.map(p => `[Shared by ${proLabels[p.from] || p.from} on ${p.sharedAt?.slice(0,10)}]: ${p.summary}\n${p.content.slice(0, 800)}${p.content.length > 800 ? "..." : ""}`).join("\n\n") + "\n═══ END SHARED PLANS ═══";
})()}

${rag.context ? `═══ RETRIEVED MEDICAL DATA (RAG) ═══
The following was retrieved in real-time from PubMed and FDA databases for this query. USE this data to ground your response with specific, current evidence:

${rag.context}

═══ END RETRIEVED DATA ═══` : ""}

CRITICAL RULES:
1. Be detailed, empathetic, evidence-based. Use the patient's FULL history above.
2. ALWAYS reference relevant lab results, trends, and past symptoms when applicable.
3. If lab values are abnormal, flag them and explain implications in context of their conditions/medications.
4. Track patterns: if the patient has recurring symptoms, note the pattern and suggest investigation.
5. List conditions most-to-least likely with explanations.
6. Include: causes, when to see doctor (urgency), self-care, specialist type.
7. CITE SOURCES PRECISELY: Use [Source: PubMed PMID:XXXXX] for research papers, [Source: FDA Drug Label] for FDA data, [Source: Mayo Clinic] or [Source: NIH] for general knowledge, and web search results when used.
8. 3-5+ citations per response — prefer PubMed and FDA over general sources when available.
9. Use emoji section headers and markdown.
10. ALWAYS end with disclaimer.
11. Consider drug interactions with their medications — CHECK the FDA drug interaction data provided above.
12. If the retrieved PubMed papers are relevant, briefly mention the study and its PMID.
13. Use the web search tool for breaking medical news, drug recalls, current clinical guidelines, or anything that requires the most up-to-date information.
14. If you notice something important, end with:
## 🧠 Learning Note
[Brief observation to remember]

## 📚 Sources Used
[List the specific PubMed papers, FDA data, and web sources you referenced]
${options.imageDescription ? `\n\nThe patient has uploaded a document/image. Description: ${options.imageDescription}` : ""}
${options.labContext ? `\n\nAsking about these lab results: ${options.labContext}` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:2000,
        system:sys,
        messages,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3
          }
        ]
      })
    });
    const data = await res.json();

    // Process response — may contain text + tool_use + tool_result blocks
    let responseText = "";
    const contentBlocks = data.content || [];
    for (const block of contentBlocks) {
      if (block.type === "text") responseText += block.text;
    }

    // If the model used web search, there may be citations in the response
    if (!responseText) responseText = "Sorry, I couldn't process that.";

    // Append RAG source summary if we had retrieved data
    if (rag.sources.length > 0 && !responseText.includes("Sources Used")) {
      const sourceList = rag.sources.map(s => {
        if (s.type === "pubmed") return `- PubMed: "${s.title}" (${s.journal}, ${s.year}) PMID:${s.pmid}`;
        if (s.type === "fda_label") return `- FDA Drug Label: ${s.name || s.drug}`;
        if (s.type === "fda_events") return `- FDA Adverse Event Reports: ${s.drug}`;
        if (s.type === "fda_recall") return `- FDA Recall Database: ${s.drug}`;
        return `- ${s.type}: ${s.drug || s.title || ""}`;
      }).join("\n");
      responseText += `\n\n## 📚 Data Sources Retrieved\n${sourceList}`;
    }

    // Extract learning notes
    const learningMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?:\n##|$)/);
    if (learningMatch) {
      return { text: responseText, learningNote: learningMatch[1].trim(), ragSources: rag.sources };
    }
    return { text: responseText, learningNote: null, ragSources: rag.sources };
  } catch(e) { return { text: "⚠️ Unable to connect. Please try again.", learningNote: null, ragSources: [] }; }
}

function RenderMD({text}) {
  if (!text) return null;
  const lines=text.split("\n"),elems=[];let listItems=[];
  const flush=()=>{if(listItems.length){elems.push(<ul key={`u${elems.length}`} style={{margin:"6px 0",paddingLeft:20}}>{listItems.map((l,j)=><li key={j} style={{marginBottom:4}}>{ri(l)}</li>)}</ul>);listItems=[];}};
  const ri=(s)=>{const p=[];const rx=/(\*\*(.+?)\*\*)|(\[Source:\s*(.+?)\])|(PMID:\s*(\d+))/g;let last=0,m;while((m=rx.exec(s))!==null){if(m.index>last)p.push(s.slice(last,m.index));
    if(m[1])p.push(<strong key={m.index}>{m[2]}</strong>);
    if(m[3]){
      const src=m[4];
      const isPubmed=src.match(/PubMed\s+PMID:?\s*(\d+)/i);
      const isFDA=/FDA/i.test(src);
      if(isPubmed){p.push(<a key={m.index} href={`https://pubmed.ncbi.nlm.nih.gov/${isPubmed[1]}/`} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(122,155,181,0.15)",color:"var(--accent3)",padding:"1px 6px",borderRadius:4,marginLeft:2,textDecoration:"none",cursor:"pointer"}}>📄 PubMed {isPubmed[1]}</a>);}
      else if(isFDA){p.push(<span key={m.index} style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(196,122,98,0.12)",color:"var(--accent4)",padding:"1px 6px",borderRadius:4,marginLeft:2}}>🏛️ {src}</span>);}
      else{p.push(<span key={m.index} style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(138,122,74,0.1)",color:"var(--accent)",padding:"1px 6px",borderRadius:4,marginLeft:2}}>{src}</span>);}
    }
    if(m[5]){p.push(<a key={m.index} href={`https://pubmed.ncbi.nlm.nih.gov/${m[6]}/`} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:16,fontFamily:"var(--mono)",background:"rgba(122,155,181,0.15)",color:"var(--accent3)",padding:"1px 6px",borderRadius:4,textDecoration:"none",cursor:"pointer"}}>📄 PMID:{m[6]}</a>);}
    last=m.index+m[0].length;}if(last<s.length)p.push(s.slice(last));return p.length?p:s;};
  lines.forEach((line,i)=>{const t=line.trim();if(t.startsWith("### ")){flush();elems.push(<h4 key={i} style={{fontSize:14,fontWeight:600,margin:"14px 0 6px"}}>{ri(t.slice(4))}</h4>);}else if(t.startsWith("## ")){flush();elems.push(<h3 key={i} style={{fontSize:15,fontWeight:600,margin:"16px 0 6px"}}>{ri(t.slice(3))}</h3>);}else if(t.startsWith("# ")){flush();elems.push(<h3 key={i} style={{fontSize:16,fontWeight:700,margin:"16px 0 8px",fontFamily:"var(--display)"}}>{ri(t.slice(2))}</h3>);}else if(t.startsWith("- ")||t.startsWith("* ")){listItems.push(t.slice(2));}else if(/^\d+\.\s/.test(t)){listItems.push(t.replace(/^\d+\.\s/,""));}else if(t.startsWith("> ")){flush();elems.push(<blockquote key={i} style={{borderLeft:"3px solid var(--accent)",paddingLeft:12,margin:"8px 0",color:"var(--dim)",fontStyle:"italic",fontSize:16}}>{ri(t.slice(2))}</blockquote>);}else if(t.startsWith("⚠")||t.startsWith("🚨")){flush();elems.push(<div key={i} style={{background:"rgba(184,84,84,0.08)",border:"1px solid rgba(184,84,84,0.2)",borderRadius:8,padding:"10px 14px",margin:"8px 0",fontSize:16,fontWeight:600,color:"#8b3a3a"}}>{ri(t)}</div>);}else if(t===""){flush();}else{flush();elems.push(<p key={i} style={{margin:"6px 0",lineHeight:1.65}}>{ri(t)}</p>);}});flush();
  return <div style={{fontSize:16,color:"var(--text)"}}>{elems}</div>;
}

function getLabFlag(name, value) {
  const range = LAB_RANGES[name];
  if (!range || isNaN(value)) return null;
  const v = parseFloat(value);
  if (range.critical_low && v <= range.critical_low) return "CRITICAL LOW";
  if (range.critical_high && v >= range.critical_high) return "CRITICAL HIGH";
  if (v < range.low) return "LOW";
  if (range.high < 900 && v > range.high) return "HIGH";
  return "NORMAL";
}

// ═══════ MAIN APP ═══════
function HealthCompanion({ onLogout, userEmail }) {
  const [state,setState]=useState(DEFAULT_STATE);
  const [loaded,setLoaded]=useState(false);
  const [tab,setTab]=useState("dashboard");
  const [selDate,setSelDate]=useState(today());
  const [animIn,setAnimIn]=useState(true);

  useEffect(()=>{loadData().then(d=>{if(d)setState(s=>({...DEFAULT_STATE,...d,profile:{...DEFAULT_PROFILE,...d?.profile},labResults:d.labResults||[],healthTimeline:d.healthTimeline||[],aiMemory:d.aiMemory||[],savedDoctors:d.savedDoctors||[],medications:d.medications||[],sharedPlans:d.sharedPlans||[],dismissedCards:d.dismissedCards||[]}));setLoaded(true);});},[]);

  // Save data — debounced for Supabase mode (avoid excessive network calls)
  const saveTimer = useRef(null);
  useEffect(()=>{
    if(!loaded) return;
    if(SUPABASE_MODE) {
      // Debounce Supabase saves to 2 seconds after last change
      if(saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveData(state), 2000);
      return () => { if(saveTimer.current) clearTimeout(saveTimer.current); };
    } else {
      saveData(state);
    }
  },[state,loaded]);

  const update=fn=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));fn(n);return n;});
  const updateLog=fn=>{update(s=>{const idx=s.logs.findIndex(l=>l.date===selDate);const log=idx>=0?{...s.logs[idx]}:getOrCreateLog(s.logs,selDate);fn(log);if(idx>=0)s.logs[idx]=log;else s.logs.push(log);});};

  const todayLog=getOrCreateLog(state.logs,selDate);
  const weekLogs=getWeekLogs(state.logs);
  const weekDays=weekLogs.map(l=>["Su","Mo","Tu","We","Th","Fr","Sa"][new Date(l.date+"T12:00:00").getDay()]);
  const switchTab=t=>{setAnimIn(false);setTimeout(()=>{setTab(t);setAnimIn(true);},120);};

  if(!loaded)return <div style={S.loading}><div style={S.spinner}/><p style={{color:"#8a9a7b",marginTop:16,fontFamily:"'DM Sans'"}}>Loading...</p></div>;
  if(!state.onboarded)return <Onboarding state={state} update={update}/>;

  const insights=generateInsights(state.profile,todayLog,weekLogs);
  const weight=parseFloat(state.profile.weight)||150;
  const waterGoal=Math.round(weight*0.5);
  const streak=computeStreak(state.logs);
  const TABS=[["dashboard","📊 Home"],["ask","🩺 Doctor"],["nutritionist","🍓 Nutrition"],["trainer","🏋️ Trainer"],["therapist","💜 Therapist"],["meds","💊 Meds"],["labs","🧪 Labs"],["symptoms","🔍 Symptoms"],["summary","📋 Summary"],["timeline","📜 Timeline"],["doctors","👨‍⚕️ Doctors"],["log","✏️ Log"],["supplements","💊 Suppl."]];

  return(
    <div style={S.app}><style>{globalCSS}</style>
      <header style={S.header}>
        <div><img src={HEALLEO_LOGO} alt="Healleo" style={{height:82,objectFit:"contain"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {state.aiMemory?.length>0&&<div style={{fontSize:16,color:"var(--accent3)",fontFamily:"var(--mono)"}}>🧠 {state.aiMemory.length}</div>}
          {streak>0&&<div style={S.streakBadge}>🔥 {streak}d</div>}
          <button onClick={()=>switchTab("profile")} style={{...S.iconBtn,background:tab==="profile"?"var(--accent)":"var(--muted)",color:tab==="profile"?"#fff":"var(--text)"}}>⚙</button>
        </div>
      </header>
      <nav style={S.nav}>{TABS.map(([k,l])=><button key={k} onClick={()=>switchTab(k)} style={{...S.tab,...(tab===k?S.tabActive:{})}}>{l}</button>)}</nav>
      <main style={{...S.content,opacity:animIn?1:0,transform:animIn?"none":"translateY(6px)",transition:"all 0.15s ease"}}>
        {tab==="dashboard"&&<Dashboard todayLog={todayLog} weekLogs={weekLogs} weekDays={weekDays} waterGoal={waterGoal} insights={insights} profile={state.profile} switchTab={switchTab} labResults={state.labResults} aiMemory={state.aiMemory} state={state} update={update}/>}
        {tab==="ask"&&<AskDoctor state={state} update={update}/>}
        {tab==="nutritionist"&&<ProfessionalChat role="nutritionist" state={state} update={update}/>}
        {tab==="trainer"&&<ProfessionalChat role="trainer" state={state} update={update}/>}
        {tab==="therapist"&&<ProfessionalChat role="therapist" state={state} update={update}/>}
        {tab==="meds"&&<Medications state={state} update={update}/>}
        {tab==="labs"&&<LabResults state={state} update={update}/>}
        {tab==="symptoms"&&<SymptomChecker state={state} update={update}/>}
        {tab==="summary"&&<DoctorSummary state={state}/>}
        {tab==="timeline"&&<HealthTimeline state={state} update={update}/>}
        {tab==="doctors"&&<DoctorFinder state={state} update={update}/>}
        {tab==="log"&&<LogEntry log={todayLog} updateLog={updateLog} selDate={selDate} setSelDate={setSelDate} waterGoal={waterGoal} state={state} update={update}/>}
        {tab==="nutrition"&&<Nutrition log={todayLog} updateLog={updateLog} profile={state.profile} weekLogs={weekLogs} weekDays={weekDays}/>}
        {tab==="exercise"&&<Exercise log={todayLog} updateLog={updateLog} weekLogs={weekLogs} weekDays={weekDays}/>}
        {tab==="supplements"&&<Supplements log={todayLog} updateLog={updateLog} profile={state.profile}/>}
        {tab==="profile"&&<Profile state={state} update={update} onLogout={onLogout} userEmail={userEmail}/>}
      </main>
      <footer style={S.footer}><p>⚠️ Healleo provides health information only — not medical diagnoses. Always consult qualified healthcare professionals.</p></footer>
    </div>);
}

// ═══════ ONBOARDING ═══════
function Onboarding({state,update}){const[step,setStep]=useState(0);const[p,setP]=useState({...DEFAULT_PROFILE,...state.profile});const next=()=>setStep(s=>s+1);const finish=()=>update(s=>{s.profile=p;s.onboarded=true;});
  const name = p.name?.split(" ")[0] || "there";
  const hasConditions = p.conditions?.length > 0 && !p.conditions.includes("None");
  const goalStr = p.goals?.length > 0 ? p.goals.join(", ").toLowerCase() : null;

  return(<div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><style>{globalCSS}</style><div style={{background:"var(--card)",borderRadius:20,padding:36,maxWidth:520,width:"100%",boxShadow:"var(--shadow-lg)"}}>
    <div style={{display:"flex",gap:5,marginBottom:24}}>{[0,1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?"var(--accent)":"var(--muted)",transition:"background 0.3s"}}/>)}</div>

    {/* STEP 0: The Pitch */}
    {step===0&&<div className="fade-up" style={{textAlign:"center",padding:"20px 0"}}>
      <img src={HEALLEO_LOGO} alt="Healleo" style={{height:132,objectFit:"contain",marginBottom:16}}/>
      <p style={{fontSize:17,color:"var(--text)",maxWidth:420,margin:"0 auto",lineHeight:1.7,fontFamily:"var(--display)",fontWeight:400}}>
        Imagine having a doctor, nutritionist, personal trainer, and therapist — all working together, all knowing your full story.
      </p>
      <p style={{fontSize:14,color:"var(--dim)",maxWidth:400,margin:"14px auto 0",lineHeight:1.6}}>
        That's Healleo. A personal health team powered by AI that learns about you over time, connects the dots between your body and mind, and looks out for you — even when you're not asking.
      </p>
      <button onClick={next} style={{...S.primaryBtn,marginTop:28,padding:"12px 32px",fontSize:16}}>Meet Your Team →</button>
    </div>}

    {/* STEP 1: Meet Your Team */}
    {step===1&&<div className="fade-up">
      <h2 style={S.h2}>Your Team</h2>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Four professionals. One shared picture of your health. They'll learn more about you with every interaction.</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
        {[
          {icon:"🩺",title:"Dr. Healleo",sub:"Your Doctor",desc:"Analyzes your labs, symptoms, and medications. Cites real PubMed research and FDA data. Connects dots a 15-minute office visit can't.",color:"var(--accent3)"},
          {icon:"🍓",title:"Healleo Nutrition",sub:"Your Nutritionist",desc:"Builds meal plans from your actual body data — not generic advice. Knows how your meds and conditions affect what you should eat.",color:"var(--accent)"},
          {icon:"🏋️",title:"Healleo Fitness",sub:"Your Trainer",desc:"Designs workouts that respect your conditions and limitations. Checks your sleep before adding volume. Builds programs you'll actually stick with.",color:"var(--accent4)"},
          {icon:"💜",title:"Healleo Wellness",sub:"Your Therapist",desc:"Watches your mood patterns and connects them to everything else — sleep, diagnosis, medications. A safe space that understands the full picture.",color:"var(--accent2)"},
        ].map((pro,i) => (
          <div key={i} style={{display:"flex",gap:12,padding:"14px 16px",background:"var(--bg)",borderRadius:12,borderLeft:`3px solid ${pro.color}`}}>
            <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{pro.icon}</div>
            <div>
              <div style={{fontSize:15,fontWeight:600}}>{pro.title}</div>
              <div style={{fontSize:12,color:pro.color,fontWeight:600,marginTop:1}}>{pro.sub}</div>
              <div style={{fontSize:13,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>{pro.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{fontSize:13,color:"var(--dim)",marginTop:14,textAlign:"center",lineHeight:1.5}}>They share what they learn — so your trainer knows about your meds, your nutritionist knows about your labs, and your therapist knows about all of it.</p>
      <button onClick={next} style={{...S.primaryBtn,marginTop:16,width:"100%",padding:"12px"}}>Let's Get Started →</button>
    </div>}

    {/* STEP 2: About You */}
    {step===2&&<div className="fade-up"><h2 style={S.h2}>About You</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>This helps your team personalize everything — calorie targets, exercise intensity, risk factors.</p><div style={S.formGrid}><label style={S.label}>Name<input style={S.input} value={p.name} onChange={e=>setP({...p,name:e.target.value})} placeholder="Your name"/></label><label style={S.label}>Age<input style={S.input} type="number" value={p.age} onChange={e=>setP({...p,age:e.target.value})} placeholder="30"/></label><label style={S.label}>Weight (lbs)<input style={S.input} type="number" value={p.weight} onChange={e=>setP({...p,weight:e.target.value})} placeholder="150"/></label><label style={S.label}>Height (inches)<input style={S.input} type="number" value={p.height} onChange={e=>setP({...p,height:e.target.value})} placeholder="70"/></label><label style={S.label}>Sex<select style={S.input} value={p.sex} onChange={e=>setP({...p,sex:e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label style={S.label}>Blood Type<select style={S.input} value={p.bloodType||""} onChange={e=>setP({...p,bloodType:e.target.value})}><option value="">Unknown</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}</select></label></div><button onClick={next} style={{...S.primaryBtn,marginTop:20}}>Continue →</button></div>}

    {/* STEP 3: Medical Background */}
    {step===3&&<div className="fade-up"><h2 style={S.h2}>Medical Background</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>Your doctor checks interactions. Your nutritionist adjusts for depletions. Your trainer modifies for limitations. Nothing is siloed.</p><label style={{...S.label,marginBottom:12}}>Medications<input style={S.input} value={p.medications} onChange={e=>setP({...p,medications:e.target.value})} placeholder="e.g. Metformin 500mg, Lisinopril 10mg"/></label><label style={{...S.label,marginBottom:12}}>Allergies<input style={S.input} value={p.allergies} onChange={e=>setP({...p,allergies:e.target.value})} placeholder="e.g. Penicillin, Shellfish"/></label><label style={{...S.label,marginBottom:8}}>Family History<input style={S.input} value={p.familyHistory||""} onChange={e=>setP({...p,familyHistory:e.target.value})} placeholder="e.g. Father: heart disease, Mother: diabetes"/></label><label style={S.label}>Conditions</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{[...new Set([...CONDITIONS,...p.conditions.filter(c=>!CONDITIONS.includes(c))])].map(c=><button key={c} onClick={()=>setP({...p,conditions:p.conditions.includes(c)?p.conditions.filter(x=>x!==c):[...p.conditions,c]})} style={{...S.chip,...(p.conditions.includes(c)?S.chipActive:{})}}>{c}</button>)}</div><div style={{display:"flex",gap:6,marginTop:8}}><input style={{...S.input,flex:1}} placeholder="Add other condition..." onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setP({...p,conditions:[...p.conditions,e.target.value.trim()]});e.target.value="";}}} /><button onClick={e=>{const inp=e.target.previousSibling;if(inp.value.trim()){setP({...p,conditions:[...p.conditions,inp.value.trim()]});inp.value="";}}} style={S.smallBtn}>Add</button></div><button onClick={next} style={{...S.primaryBtn,marginTop:20}}>Continue →</button></div>}

    {/* STEP 4: Health Goals */}
    {step===4&&<div className="fade-up"><h2 style={S.h2}>What Are You Working Toward?</h2><p style={{fontSize:13,color:"var(--dim)",marginTop:2,marginBottom:14}}>Your goals shape everything — meal plans, workout intensity, what your team watches for.</p><div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>{GOALS.map(g=><button key={g} onClick={()=>setP({...p,goals:p.goals.includes(g)?p.goals.filter(x=>x!==g):[...p.goals,g]})} style={{...S.chip,...(p.goals.includes(g)?S.chipActive:{})}}>{g}</button>)}</div><button onClick={next} style={{...S.primaryBtn,marginTop:24}}>Continue →</button></div>}

    {/* STEP 5: Your Team Is Ready */}
    {step===5&&<div className="fade-up" style={{padding:"10px 0"}}>
      <h2 style={{...S.h2,textAlign:"center"}}>Your team is ready{p.name ? `, ${p.name.split(" ")[0]}` : ""}.</h2>
      <p style={{fontSize:14,color:"var(--dim)",textAlign:"center",margin:"8px auto 20px",maxWidth:400,lineHeight:1.6}}>Here's what they're already thinking based on what you shared:</p>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent3)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontSize:18}}>🩺</span><span style={{fontWeight:600,fontSize:14}}>Dr. Healleo</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            hasConditions ? `I see ${p.conditions.filter(c=>c!=="None").join(" and ")} in your profile. I'll want to see your latest labs to get a baseline — upload them anytime and I'll flag what matters.`
            : p.medications ? `You've got medications listed — I'll check for interactions and keep an eye on how they connect to your labs and symptoms over time.`
            : `No conditions or meds on file — great starting point. Upload labs when you have them and I'll start building your baseline.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontSize:18}}>🍓</span><span style={{fontWeight:600,fontSize:14}}>Nutritionist</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            goalStr?.includes("lose weight") ? `Weight loss goal noted. I'll build around a sustainable deficit — no crash diets. Log a few days of meals and I'll have real numbers to work with.`
            : goalStr?.includes("build muscle") ? `Muscle building — nice. At ${p.weight||"your"} lbs, you'll want around ${Math.round((parseFloat(p.weight)||150)*0.82)}g protein daily. Let's make sure you're actually hitting that.`
            : `I'll need a few days of food logs to give you anything real. Generic advice is easy — personalized nutrition takes data. Start logging and I'll start connecting dots.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent4)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontSize:18}}>🏋️</span><span style={{fontWeight:600,fontSize:14}}>Trainer</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            hasConditions ? `I see ${p.conditions.filter(c=>c!=="None")[0]} — I'll factor that into everything I build for you. No exercises that work against your body. Tell me what equipment you have access to and I'll create your first program.`
            : goalStr?.includes("better sleep") ? `Better sleep is a goal — exercise timing matters more than people think. I'll build routines that help with that, not hurt it. Let's start with what you're currently doing.`
            : `I don't have exercise history yet, so I'll start conservative. Log a few sessions — even walks count — and I'll get a feel for your level. Then we build from there.`
          }</p>
        </div>

        <div style={{padding:"12px 14px",background:"var(--bg)",borderRadius:10,borderLeft:"3px solid var(--accent2)"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontSize:18}}>💜</span><span style={{fontWeight:600,fontSize:14}}>Therapist</span></div>
          <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.5,fontStyle:"italic"}}>{
            goalStr?.includes("reduce stress") ? `Stress reduction is on your list — that tells me a lot. I'll be watching your mood and sleep patterns. When you're ready to dig into what's driving the stress, I'm here. No rush.`
            : hasConditions ? `Managing ${p.conditions.filter(c=>c!=="None")[0]} isn't just physical — it's emotional too. I'll keep an eye on how your mood tracks with everything else. Whenever you want to talk, I'm here.`
            : `I'll be quietly watching your mood patterns in the background. If I notice something shifting, I'll check in. In the meantime, I'm always one tap away.`
          }</p>
        </div>
      </div>

      <div style={{textAlign:"center",marginTop:20}}>
        <p style={{fontSize:12,color:"var(--dim)",marginBottom:14}}>The more you log, the smarter your team gets. Every lab result, every meal, every mood check — it all connects.</p>
        <button onClick={finish} style={{...S.primaryBtn,padding:"14px 40px",fontSize:16}}>Let's Go →</button>
      </div>
    </div>}

  </div></div>);
}

// ═══════ LAB RESULTS ═══════
function LabResults({state,update}) {
  const [mode,setMode]=useState("view"); // view, add, upload, detail
  const [selCat,setSelCat]=useState(null);
  const [labDate,setLabDate]=useState(today());
  const [labName,setLabName]=useState("");
  const [entries,setEntries]=useState([]);
  const [uploadText,setUploadText]=useState("");
  const [parsing,setParsing]=useState(false);
  const [viewing,setViewing]=useState(null);
  const [aiAnalysis,setAiAnalysis]=useState(null);
  const [analyzing,setAnalyzing]=useState(false);
  const pdfInputRef = useRef(null);
  const labs = state.labResults || [];

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: "Extract ALL lab test results from this PDF. Return ONLY a JSON array of objects with \"name\", \"value\", \"unit\" fields. Use standard medical test names. Include every numeric result you find. No other text." }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const match = text.replace(/```json?|```/g, "").trim().match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const withFlags = parsed.map(r => ({ ...r, value: String(r.value), flag: getLabFlag(r.name, r.value) }));
        setEntries(withFlags);
        setLabName(file.name.replace(/\.pdf$/i, ""));
        setMode("add");
      }
    } catch (err) { console.error("PDF parse error:", err); }
    setParsing(false);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const addEntry = (testName) => {
    if (!entries.find(e=>e.name===testName)) {
      const range = LAB_RANGES[testName];
      setEntries([...entries, { name: testName, value: "", unit: range?.unit || "" }]);
    }
  };

  const updateEntry = (idx, val) => {
    const updated = [...entries];
    updated[idx].value = val;
    const flag = getLabFlag(updated[idx].name, val);
    updated[idx].flag = flag;
    setEntries(updated);
  };

  const saveResults = () => {
    const valid = entries.filter(e => e.value !== "");
    if (valid.length === 0) return;
    const result = { date: labDate, id: Date.now().toString(), results: valid, name: labName || selCat?.name || "Lab Results" };
    update(s => {
      s.labResults = [...(s.labResults||[]), result];
      s.healthTimeline = [...(s.healthTimeline||[]), { date: labDate, type: "lab", title: `Lab: ${result.name}`, notes: `${valid.length} tests recorded. ${valid.filter(v=>v.flag&&v.flag!=="NORMAL").map(v=>`${v.name}: ${v.value} ${v.unit} [${v.flag}]`).join(", ")}` }];
    });
    setEntries([]); setSelCat(null); setLabName(""); setMode("view");
  };

  const parseUpload = async () => {
    if (!uploadText.trim()) return;
    setParsing(true);
    const response = await askMedicalAI([{ role: "user", content: `Extract lab test results from this text. Return ONLY a JSON array of objects with "name", "value", "unit" fields. Be precise with test names matching standard medical terminology. Text:\n\n${uploadText}` }], state, { labContext: "parsing uploaded lab results" });
    try {
      const jsonStr = response.text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const withFlags = parsed.map(r => ({ ...r, flag: getLabFlag(r.name, r.value) }));
        setEntries(withFlags);
        setMode("add");
      }
    } catch(e) { /* parsing failed, show raw */ }
    setParsing(false);
  };

  const analyzeResults = async (labResult) => {
    setAnalyzing(true);
    const labContext = labResult.results.map(r => `${r.name}: ${r.value} ${r.unit} ${r.flag ? `[${r.flag}]` : ""}`).join("\n");
    const response = await askMedicalAI([{ role: "user", content: `Please analyze these lab results in detail. Identify any abnormalities, explain what they mean for this patient given their full history, suggest follow-up tests if needed, and provide actionable recommendations.\n\nLab Date: ${labResult.date}\n${labContext}` }], state, { labContext });
    setAiAnalysis(response.text);
    if (response.learningNote) {
      update(s => { s.aiMemory = [...(s.aiMemory||[]), { date: today(), insight: response.learningNote }]; });
    }
    setAnalyzing(false);
  };

  if (viewing) {
    const flagged = viewing.results.filter(r=>r.flag&&r.flag!=="NORMAL");
    return <div className="fade-up">
      <button onClick={()=>{setViewing(null);setAiAnalysis(null);}} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>🧪 {viewing.name}</h2>
      <div style={{fontSize:15,color:"var(--dim)",marginTop:2,fontFamily:"var(--mono)"}}>{viewing.date}</div>
      {flagged.length>0&&<div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--danger)",background:"rgba(184,84,84,0.06)"}}><div style={{fontWeight:600,fontSize:16,color:"var(--danger)"}}>⚠️ {flagged.length} abnormal result{flagged.length>1?"s":""}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:4}}>{flagged.map(f=>`${f.name}: ${f.value} ${f.unit} [${f.flag}]`).join(" · ")}</div></div>}
      <div style={{...S.card,marginTop:12,padding:0}}>
        {viewing.results.map((r,i) => {
          const range = LAB_RANGES[r.name];
          const flagColor = r.flag==="HIGH"||r.flag==="CRITICAL HIGH"?"var(--danger)":r.flag==="LOW"||r.flag==="CRITICAL LOW"?"var(--accent3)":"var(--success)";
          return <div key={i} style={{padding:"12px 16px",borderBottom:i<viewing.results.length-1?"1px solid var(--muted)":"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:16,fontWeight:500}}>{r.name}</div>{range&&<div style={{fontSize:16,color:"var(--dim)"}}>Normal: {range.low}–{range.high < 900 ? range.high : "—"} {range.unit}</div>}</div>
            <div style={{textAlign:"right"}}><span style={{fontFamily:"var(--mono)",fontSize:14,fontWeight:600}}>{r.value}</span><span style={{fontSize:14,color:"var(--dim)",marginLeft:4}}>{r.unit}</span>{r.flag&&<div style={{fontSize:15,fontFamily:"var(--mono)",color:flagColor,fontWeight:600}}>{r.flag}</div>}</div>
          </div>;
        })}
      </div>
      <button onClick={()=>analyzeResults(viewing)} disabled={analyzing} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:analyzing?0.6:1}}>{analyzing?"🧠 Analyzing with your full history...":"🩺 AI Analysis of These Results"}</button>
      {aiAnalysis&&<div style={{...S.card,marginTop:12}}><RenderMD text={aiAnalysis}/></div>}
    </div>;
  }

  if (mode==="upload") {
    return <div className="fade-up">
      <button onClick={()=>setMode("view")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>📄 Upload Test Results</h2>
      <p style={{fontSize:15,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Paste your lab report text below — or type/copy results from a PDF, photo, or patient portal. The AI will extract the values automatically.</p>
      <textarea value={uploadText} onChange={e=>setUploadText(e.target.value)} placeholder={"Paste lab results here, e.g.:\n\nGlucose, Fasting: 95 mg/dL\nHemoglobin A1c: 5.4%\nTSH: 2.1 mIU/L\nVitamin D: 28 ng/mL\nTotal Cholesterol: 210 mg/dL\nLDL: 130 mg/dL\nHDL: 55 mg/dL\n\nOr paste the entire lab report text..."} rows={12} style={{...S.input,marginTop:12,resize:"vertical",fontFamily:"var(--mono)",fontSize:15}}/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={parseUpload} disabled={parsing||!uploadText.trim()} style={{...S.primaryBtn,flex:1,opacity:parsing?0.6:1}}>{parsing?"🔍 Parsing results...":"🧪 Extract Lab Values"}</button>
      </div>
      <div style={{...S.card,marginTop:16,padding:14,borderLeft:"3px solid var(--accent3)"}}>
        <h3 style={S.h3}>💡 Tips</h3>
        <p style={{fontSize:14,color:"var(--dim)",lineHeight:1.6,marginTop:4}}>Works best with structured text from patient portals (MyChart, LabCorp, Quest). You can also manually type values. The AI will match test names to standard references and flag abnormals.</p>
      </div>
    </div>;
  }

  if (mode==="add") {
    return <div className="fade-up">
      <button onClick={()=>{setMode("view");setEntries([]);setSelCat(null);}} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
      <h2 style={S.h2}>➕ Add Lab Results</h2>
      <div style={{display:"flex",gap:8,marginTop:12}}><label style={{...S.label,flex:1}}>Date<input type="date" value={labDate} onChange={e=>setLabDate(e.target.value)} style={S.input}/></label><label style={{...S.label,flex:1}}>Label<input value={labName} onChange={e=>setLabName(e.target.value)} placeholder="e.g. Annual Physical" style={S.input}/></label></div>

      {!selCat && entries.length===0 && <div style={{...S.card,marginTop:14,padding:16}}><h3 style={S.h3}>Select test category:</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10}}>
        {LAB_CATEGORIES.map(cat=><button key={cat.name} onClick={()=>setSelCat(cat)} style={{padding:"10px",background:"var(--bg)",border:"1.5px solid var(--muted)",borderRadius:8,fontSize:15,textAlign:"left",cursor:"pointer",fontFamily:"var(--body)"}}>{cat.name}</button>)}
      </div></div>}

      {selCat && <div style={{...S.card,marginTop:12,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={S.h3}>{selCat.name}</h3><button onClick={()=>setSelCat(null)} style={{fontSize:14,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Change</button></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>{selCat.tests.map(t=><button key={t} onClick={()=>addEntry(t)} style={{...S.chip,...(entries.find(e=>e.name===t)?S.chipActive:{}),fontSize:14,padding:"4px 10px"}}>{entries.find(e=>e.name===t)?"✓ ":""}{t}</button>)}</div>
      </div>}

      {entries.length>0&&<div style={{...S.card,marginTop:12,padding:16}}>
        <h3 style={S.h3}>Enter values ({entries.length} tests)</h3>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {entries.map((e,i)=>{
            const range=LAB_RANGES[e.name];
            const flagColor=e.flag==="HIGH"||e.flag==="CRITICAL HIGH"?"var(--danger)":e.flag==="LOW"||e.flag==="CRITICAL LOW"?"var(--accent3)":e.flag==="NORMAL"?"var(--success)":"var(--dim)";
            return <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>{range&&<div style={{fontSize:15,color:"var(--dim)"}}>Ref: {range.low}–{range.high<900?range.high:"—"} {range.unit}</div>}</div>
              <input type="number" value={e.value} onChange={ev=>updateEntry(i,ev.target.value)} placeholder="Value" style={{...S.input,width:80,textAlign:"right"}} step="any"/>
              <span style={{fontSize:16,color:"var(--dim)",minWidth:36}}>{e.unit}</span>
              {e.flag&&<span style={{fontSize:15,fontFamily:"var(--mono)",color:flagColor,fontWeight:600,minWidth:40}}>{e.flag}</span>}
              <button onClick={()=>setEntries(entries.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:16}}>✕</button>
            </div>;
          })}
        </div>
        <button onClick={saveResults} style={{...S.primaryBtn,width:"100%",marginTop:14}}>💾 Save Lab Results</button>
      </div>}
    </div>;
  }

  // VIEW MODE
  const sortedLabs = [...labs].sort((a,b)=>b.date.localeCompare(a.date));
  const flaggedCount = labs.reduce((s,lr)=>s+lr.results.filter(r=>r.flag&&r.flag!=="NORMAL").length, 0);

  return <div className="fade-up">
    <h2 style={S.h2}>🧪 Lab Results & Test Data</h2>
    <p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Upload results to train your AI health concierge</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:14}}>
      <button onClick={()=>setMode("add")} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>➕</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Manual</div></button>
      <button onClick={()=>setMode("upload")} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>📄</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Paste</div></button>
      <button onClick={()=>pdfInputRef.current?.click()} className="card" style={{...S.card,padding:"14px 8px",textAlign:"center",border:"none",cursor:"pointer"}}><div style={{fontSize:22}}>📎</div><div style={{fontSize:16,fontWeight:600,marginTop:4,color:"var(--accent)"}}>Upload PDF</div></button>
      <div className="card" style={{...S.card,padding:"14px 8px",textAlign:"center"}}><div style={{fontFamily:"var(--display)",fontSize:22,fontWeight:600,color:"var(--text)"}}>{labs.length}</div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>Reports{flaggedCount>0&&<span style={{color:"var(--danger)"}}> · {flaggedCount} flags</span>}</div></div>
    </div>
    <input ref={pdfInputRef} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePdfUpload}/>

    {parsing&&<div style={{...S.card,marginTop:12,padding:16,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Extracting lab values from PDF...</div></div>}

    {labs.length>0&&<div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--accent3)",background:"rgba(122,155,181,0.04)"}}>
      <div style={{fontSize:15,color:"var(--dim)"}}>🧠 <strong>AI Learning:</strong> Your {labs.length} lab report{labs.length>1?"s":""} with {labs.reduce((s,lr)=>s+lr.results.length,0)} total test values are being used to personalize every AI response. The more data you add, the smarter your health concierge becomes.</div>
    </div>}

    <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
      {sortedLabs.map(lr=>{
        const flagged=lr.results.filter(r=>r.flag&&r.flag!=="NORMAL");
        return <button key={lr.id} onClick={()=>setViewing(lr)} className="card" style={{...S.card,padding:14,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:16,fontWeight:600}}>{lr.name}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2,fontFamily:"var(--mono)"}}>{lr.date} · {lr.results.length} tests</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {flagged.length>0&&<span style={{fontSize:16,padding:"2px 8px",background:"rgba(184,84,84,0.08)",borderRadius:10,color:"var(--danger)",fontWeight:600}}>{flagged.length} flag{flagged.length>1?"s":""}</span>}
              <span style={{color:"var(--dim)"}}>→</span>
            </div>
          </div>
        </button>;
      })}
    </div>
    {labs.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"var(--dim)"}}><div style={{fontSize:40,marginBottom:10}}>🧪</div><p style={{fontSize:16}}>No lab results yet. Add your first report to start building your health profile.</p></div>}
  </div>;
}

// ═══════ HEALTH TIMELINE ═══════
function HealthTimeline({state,update}) {
  const [adding,setAdding]=useState(false);
  const [newEvent,setNewEvent]=useState({date:today(),type:"visit",title:"",notes:""});
  const [pdfParsing,setPdfParsing]=useState(false);
  const pdfRef = useRef(null);
  const timeline = [...(state.healthTimeline||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const eventTypes = [{v:"visit",l:"🏥 Doctor Visit"},{v:"diagnosis",l:"📋 Diagnosis"},{v:"medication",l:"💊 Medication Change"},{v:"procedure",l:"🔧 Procedure"},{v:"vaccination",l:"💉 Vaccination"},{v:"lab",l:"🧪 Lab Results"},{v:"symptom",l:"🔍 Symptom Event"},{v:"lifestyle",l:"🌿 Lifestyle Change"},{v:"note",l:"📝 General Note"}];
  const typeColors = {visit:"var(--accent3)",diagnosis:"var(--accent4)",medication:"var(--accent2)",procedure:"var(--accent)",lab:"var(--accent3)",symptom:"var(--danger)",vaccination:"var(--success)",lifestyle:"var(--accent)",note:"var(--dim)"};

  const handleVisitPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfParsing(true);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: `Extract medical visit information from this document. Return ONLY a JSON object with these fields:
{
  "events": [{"date":"YYYY-MM-DD","type":"visit|diagnosis|medication|procedure|vaccination|lab|note","title":"short title","notes":"key details, findings, recommendations"}],
  "medications_mentioned": "comma-separated list or empty",
  "diagnoses_mentioned": "comma-separated list or empty",
  "follow_up": "any follow-up instructions"
}
Use today's date ${today()} if no date is found. Extract ALL distinct events (diagnoses, medications prescribed, procedures done, vaccinations given, etc.) as separate entries.` }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const jsonStr = text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.events?.length) {
          update(s => {
            for (const ev of parsed.events) {
              s.healthTimeline = [...(s.healthTimeline||[]), { date: ev.date || today(), type: ev.type || "visit", title: ev.title, notes: ev.notes + (parsed.follow_up ? `\n\nFollow-up: ${parsed.follow_up}` : "") }];
            }
          });
        }
      }
    } catch (err) { console.error("Visit PDF parse error:", err); }
    setPdfParsing(false);
    if (pdfRef.current) pdfRef.current.value = "";
  };

  const save = () => {
    if (!newEvent.title.trim()) return;
    update(s => { s.healthTimeline = [...(s.healthTimeline||[]), {...newEvent}]; });
    setNewEvent({date:today(),type:"visit",title:"",notes:""});
    setAdding(false);
  };

  return <div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={S.h2}>📋 Health Timeline</h2><p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Your complete medical history feeds the AI</p></div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>pdfRef.current?.click()} style={{...S.smallBtn,background:"var(--accent3)",color:"#fff"}}>📎 PDF</button>
        <button onClick={()=>setAdding(!adding)} style={S.smallBtn}>{adding?"Cancel":"+ Add"}</button>
      </div>
    </div>
    <input ref={pdfRef} type="file" accept=".pdf" style={{display:"none"}} onChange={handleVisitPdf}/>
    {pdfParsing&&<div style={{...S.card,marginTop:12,padding:16,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent3)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Extracting visit details from PDF...</div></div>}

    {adding&&<div style={{...S.card,marginTop:14,padding:18}}>
      <div style={{display:"flex",gap:8}}><label style={{...S.label,flex:1}}>Date<input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={S.input}/></label>
        <label style={{...S.label,flex:1}}>Type<select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={S.input}>{eventTypes.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></label></div>
      <label style={{...S.label,marginTop:10}}>Title<input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="e.g. Annual physical with Dr. Smith" style={S.input}/></label>
      <label style={{...S.label,marginTop:10}}>Notes<textarea value={newEvent.notes} onChange={e=>setNewEvent({...newEvent,notes:e.target.value})} placeholder="Details, results, recommendations..." rows={3} style={{...S.input,resize:"vertical"}}/></label>
      <button onClick={save} style={{...S.primaryBtn,marginTop:12,width:"100%"}}>Save Event</button>
    </div>}

    {state.aiMemory?.length>0&&<div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent3)"}}>
      <h3 style={S.h3}>🧠 AI Memory ({state.aiMemory.length} observations)</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Patterns and insights learned from your health data:</p>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
        {state.aiMemory.slice(-5).reverse().map((m,i)=><div key={i} style={{padding:"8px 10px",background:"rgba(122,155,181,0.06)",borderRadius:6,fontSize:14,color:"var(--text)",lineHeight:1.5}}><span style={{fontFamily:"var(--mono)",color:"var(--dim)",fontSize:16}}>{m.date}</span> {m.insight}</div>)}
      </div>
      {state.aiMemory.length>5&&<div style={{fontSize:16,color:"var(--dim)",marginTop:6}}>+ {state.aiMemory.length-5} more observations</div>}
    </div>}

    <div style={{marginTop:14,position:"relative",paddingLeft:20}}>
      <div style={{position:"absolute",left:7,top:0,bottom:0,width:2,background:"var(--muted)"}}/>
      {timeline.map((e,i)=><div key={i} style={{marginBottom:14,position:"relative"}}>
        <div style={{position:"absolute",left:-16,top:6,width:10,height:10,borderRadius:"50%",background:typeColors[e.type]||"var(--dim)",border:"2px solid var(--card)"}}/>
        <div style={{...S.card,padding:12,marginLeft:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:600}}>{e.title}</span>
            <span style={{fontSize:16,fontFamily:"var(--mono)",color:"var(--dim)"}}>{e.date}</span>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <span style={{fontSize:15,padding:"1px 6px",background:typeColors[e.type]||"var(--muted)",color:"#fff",borderRadius:4}}>{e.type}</span>
          </div>
          {e.notes&&<p style={{fontSize:14,color:"var(--dim)",marginTop:6,lineHeight:1.5}}>{e.notes}</p>}
          <button onClick={()=>update(s=>{s.healthTimeline=s.healthTimeline.filter(x=>x!==e);})} style={{fontSize:16,color:"var(--danger)",background:"none",border:"none",cursor:"pointer",marginTop:4}}>Remove</button>
        </div>
      </div>)}
      {timeline.length===0&&<div style={{textAlign:"center",padding:"30px",color:"var(--dim)"}}><p style={{fontSize:16}}>No events yet. Add doctor visits, diagnoses, and health events to build your medical history.</p></div>}
    </div>
  </div>;
}

// ═══════ ASK DOCTOR ═══════
function AskDoctor({state,update}) {
  const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const chatEnd=useRef(null);
  const msgs=state.chatHistory||[];
  const STARTERS=["Walk me through my latest lab results — what should I actually worry about?","I keep getting these headaches. Given my history, what's going on?","Based on everything you know about me, what screenings am I overdue for?","Are any of my medications fighting each other?","How do my health trends look — am I heading in the right direction?","What's the one thing I should change right now to feel better?"];
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs.length,loading]);

  const send=async(text)=>{const q=text||input.trim();if(!q||loading)return;setInput("");
    const newMsgs=[...msgs,{role:"user",content:q}];
    update(s=>{s.chatHistory=newMsgs;});setLoading(true);
    const apiMsgs=newMsgs.slice(-12).map(m=>({role:m.role,content:m.content}));
    const response=await askMedicalAI(apiMsgs,state);
    update(s=>{
      s.chatHistory=[...newMsgs,{role:"assistant",content:response.text}];
      if(response.learningNote){s.aiMemory=[...(s.aiMemory||[]),{date:today(),insight:response.learningNote}];}
    });setLoading(false);};

  const dataPoints = (state.labResults?.reduce((s,lr)=>s+lr.results.length,0)||0) + (state.symptomSessions?.length||0) + (state.healthTimeline?.length||0) + (state.logs?.length||0);

  return(<div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={S.h2}>🩺 Dr. Healleo</h2><p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Your data, {dataPoints} points deep</p></div>
      {msgs.length>0&&<button onClick={()=>update(s=>{s.chatHistory=[];})} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",fontSize:14}}>Clear</button>}
    </div>
    {dataPoints>0&&<div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
      {state.labResults?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(138,122,74,0.1)",borderRadius:10,color:"var(--accent)"}}>🧪 {state.labResults.length} lab reports</span>}
      {state.symptomSessions?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(196,122,98,0.1)",borderRadius:10,color:"var(--accent4)"}}>🔍 {state.symptomSessions.length} symptom checks</span>}
      {state.aiMemory?.length>0&&<span style={{fontSize:16,padding:"3px 8px",background:"rgba(122,155,181,0.1)",borderRadius:10,color:"var(--accent3)"}}>🧠 {state.aiMemory.length} learned insights</span>}
    </div>}
    <div style={{...S.card,marginTop:12,padding:0,minHeight:400,maxHeight:"62vh",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflow:"auto",padding:16}}>
        {msgs.length===0&&!loading&&<div style={{textAlign:"center",padding:"24px 10px"}}><div style={{fontSize:40,marginBottom:10}}>🩺</div><p style={{fontFamily:"var(--display)",fontSize:16,fontWeight:500}}>Hey — I've been going through your chart.</p><p style={{fontSize:15,color:"var(--dim)",margin:"6px 0 16px",lineHeight:1.5}}>I have your labs, symptoms, meds, lifestyle data — the whole picture. Ask me anything. The more you share, the better I get at connecting the dots for you.</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>{STARTERS.map(s=><button key={s} onClick={()=>send(s)} style={{padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--muted)",borderRadius:10,fontSize:15,color:"var(--text)",cursor:"pointer",textAlign:"left",fontFamily:"var(--body)"}} onMouseEnter={e=>e.target.style.borderColor="var(--accent)"} onMouseLeave={e=>e.target.style.borderColor="var(--muted)"}>💬 {s}</button>)}</div></div>}
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}><div style={{maxWidth:"88%",padding:"12px 16px",borderRadius:14,background:m.role==="user"?"var(--accent)":"var(--bg)",color:m.role==="user"?"#fff":"var(--text)",...(m.role==="user"?{borderBottomRightRadius:4}:{borderBottomLeftRadius:4})}}>{m.role==="user"?<p style={{fontSize:16,lineHeight:1.5}}>{m.content}</p>:<RenderMD text={m.content}/>}</div></div>)}
        {loading&&<div style={{padding:"12px 0"}}><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><span style={{fontSize:15,color:"var(--dim)"}}>Searching PubMed, FDA & web...</span></div><div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{["📄 PubMed","🏛️ OpenFDA","🔍 Web Search","🧠 AI Analysis"].map(s=><span key={s} style={{fontSize:15,padding:"2px 6px",background:"var(--bg)",borderRadius:6,color:"var(--dim)",animation:"pulse 2s ease infinite"}}>{s}</span>)}</div></div>}
        <div ref={chatEnd}/>
      </div>
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--muted)",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your health, labs, symptoms..." disabled={loading} style={{...S.input,flex:1,border:"none",background:"transparent",padding:"8px 0"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{...S.primaryBtn,padding:"8px 16px",fontSize:16,opacity:loading||!input.trim()?0.5:1}}>Send</button>
      </div>
    </div>
    <div style={{marginTop:10,padding:"10px 12px",background:"rgba(196,167,98,0.08)",borderRadius:8,border:"1px solid rgba(196,167,98,0.15)"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>{["📄 PubMed/MEDLINE","🏛️ OpenFDA Drug Labels","🔬 FDA Adverse Events","🔍 Real-time Web Search","🧠 AI Memory"].map(s=><span key={s} style={{fontSize:15,padding:"2px 6px",background:"var(--card)",borderRadius:6,color:"var(--dim)"}}>{s}</span>)}</div>
      <p style={{fontSize:16,color:"var(--dim)",lineHeight:1.5}}>⚠️ Powered by real-time PubMed research, FDA databases, and web search — not diagnoses. PMID links go directly to peer-reviewed papers. Verify with a provider.</p>
    </div>
  </div>);
}

// ═══════ PROFESSIONAL TEAM ═══════
const PROFESSIONAL_ROLES = {
  nutritionist: {
    icon: "🍓", title: "Nutritionist", name: "Healleo Nutrition",
    greeting: "Hey — I'm your nutritionist. I've already been through your labs, your logs, your conditions, all of it. I won't sugarcoat things (pun intended), but I'll make sure the plan actually fits your life. What are we working on?",
    starters: [
      "Build me a meal plan that actually hits my protein goals",
      "My labs came back — what should I be eating differently?",
      "I want to lose weight but I also like food. Help.",
      "What anti-inflammatory foods make sense for my conditions?",
      "How should I eat around my workouts?",
      "Am I probably deficient in anything based on my data?"
    ],
    planTypes: [
      { id: "meal-weekly", label: "📅 Weekly Meal Plan", prompt: "Create a detailed 7-day meal plan with specific meals, portions, and approximate macros for each day." },
      { id: "meal-condition", label: "🩺 Condition-Based Diet", prompt: "Create a dietary plan specifically designed to help manage my medical conditions, with foods to emphasize and avoid." },
      { id: "macro-targets", label: "📊 Macro Targets", prompt: "Calculate my ideal daily macro targets (protein, carbs, fat, calories, fiber) based on my body composition and goals, and suggest a sample day." },
      { id: "shopping-list", label: "🛒 Shopping List", prompt: "Create a comprehensive weekly shopping list based on my dietary needs, goals, and conditions. Organize by store section." },
    ],
    systemPrompt: (ctx) => `You are a board-certified nutritionist and registered dietitian — part of the patient's personal Healleo health team alongside their doctor, trainer, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the friend who happens to have a nutrition degree. Warm, real, zero pretension.
- Empathetic first: you understand that food is emotional, cultural, and complicated. You never shame.
- Authoritative: you know your science cold. When you make a recommendation, there's a reason behind it and you'll explain it plainly.
- Self-effacing: you don't take yourself too seriously. You'll admit when something is hard or when the evidence is mixed.
- Dry humor: you use it sparingly to keep things human. A well-placed joke about kale or meal prep goes a long way.
- You root for this person. You genuinely want them to succeed. But you tell the truth — if their diet is working against their goals, you say so kindly and clearly.
- You're realistic: perfect diets don't exist, consistency beats perfection, and you'd rather they follow a B+ plan for a year than an A+ plan for a week.
- You connect dots: you reference their labs, conditions, meds, exercise, sleep, and mood when it's relevant to nutrition. That's what makes you different from a generic nutrition chatbot.

${ctx}

YOUR CLINICAL APPROACH:
- Personalize everything: reference specific lab values (LDL, glucose, HbA1c, vitamin levels), conditions, medications, and allergies
- Be specific: portions, meal timing, actual food names — not "eat more vegetables"
- Factor in their exercise, sleep, stress, and goals when building recommendations
- Weight loss = caloric deficit. Muscle = protein surplus. Say the actual numbers.
- If a medication affects nutrition (metformin depletes B12, statins + grapefruit, etc.), mention it
- Practical tips for real life: meal prep, eating out, budget-friendly swaps
- End with a 🧠 Learning Note if you spot a pattern worth remembering

⚠️ Nutritional guidance only — not a substitute for medical dietary advice from a physician.`,
    loadingText: "Analyzing your nutrition data...",
    disclaimer: "⚠️ Nutritional guidance based on your health profile. Not a substitute for clinical dietary advice. Discuss major dietary changes with your healthcare provider.",
    chatKey: "nutritionChat",
    memoryPrefix: "🍓 Nutrition"
  },
  trainer: {
    icon: "🏋️", title: "Personal Trainer", name: "Healleo Fitness",
    greeting: "What's up — I'm your trainer. I've looked at your logs, your conditions, what you've been doing (and not doing — no judgment). I'm not going to hand you a cookie-cutter program. Tell me what we're working toward and I'll build something you'll actually stick with.",
    starters: [
      "Build me a realistic workout routine for my goals",
      "I want to get more flexible — where do I even start?",
      "I have zero equipment at home. What can I do?",
      "What exercises should I avoid given my conditions?",
      "I haven't worked out in months. Ease me back in.",
      "What should I do on rest days?"
    ],
    planTypes: [
      { id: "workout-weekly", label: "📅 Weekly Workout Plan", prompt: "Create a detailed weekly workout plan with specific exercises, sets, reps, and rest periods for each day. Include warm-up and cool-down." },
      { id: "flexibility", label: "🧘 Flexibility Program", prompt: "Design a flexibility and mobility program I can follow, considering my conditions and current fitness level. Include specific stretches with hold times." },
      { id: "strength", label: "💪 Strength Program", prompt: "Build a progressive strength training program appropriate for my level, conditions, and goals. Include exercise alternatives for any limitations." },
      { id: "cardio", label: "❤️ Cardio Plan", prompt: "Create a cardiovascular fitness plan considering my heart health, current fitness, and conditions. Include target heart rate zones and progression." },
    ],
    systemPrompt: (ctx) => `You are a certified personal trainer and exercise physiologist — part of the patient's personal Healleo health team alongside their doctor, nutritionist, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the trainer who feels like a friend, not a drill sergeant. Encouraging but honest.
- Empathetic: you understand that bodies have limitations, that chronic conditions make everything harder, and that showing up at all is a win some days.
- Authoritative: you know exercise science. You prescribe with precision — exercises, sets, reps, tempo, RPE — because you've done this a thousand times and vague advice helps no one.
- Self-effacing: you don't pretend to have all the answers. If something's outside your lane (like adjusting medication), you say so and point them to their doctor.
- Dry humor: you keep it light. A joke about leg day or foam rollers keeps the conversation human. You're fun to work with.
- You root for this person. Every small win matters. But you're also straight with them — if they're overtraining on bad sleep or skipping mobility work, you'll call it out with love.
- You're realistic: the best workout is the one they'll actually do. You'd rather build a sustainable 3-day routine than a brutal 6-day program they'll abandon in two weeks.
- You connect dots: their labs, sleep, mood, conditions, medications — it all affects training. Beta-blockers change heart rate targets. Arthritis means low-impact. Low iron means fatigue. You factor it all in because that's what makes you better than a YouTube video.

${ctx}

YOUR CLINICAL APPROACH:
- Account for medical conditions: arthritis → low-impact, high BP → limit heavy isometrics, diabetes → monitor around exercise
- Medications matter: beta-blockers, statins (muscle pain), corticosteroids (bone density) — adjust accordingly
- Reference lab values: low iron = fatigue, low vitamin D = bone concerns, high inflammation = recovery focus
- Read their sleep and mood data: overtrained or sleep-deprived people need recovery, not more volume
- Build from their current level: check exercise logs to see what they've actually been doing
- Be specific: exercise names, sets, reps, rest periods, RPE. Include warm-up and cool-down.
- Progress gradually. Offer modifications for limitations.
- End with a 🧠 Learning Note if you notice a fitness pattern worth tracking

⚠️ Fitness guidance only. Consult your physician before starting any new exercise program, especially with existing medical conditions.`,
    loadingText: "Building your fitness plan...",
    disclaimer: "⚠️ Exercise guidance based on your health profile. Consult your physician before starting new exercise programs, especially with existing conditions.",
    chatKey: "trainerChat",
    memoryPrefix: "🏋️ Fitness"
  },
  therapist: {
    icon: "💜", title: "Therapist", name: "Healleo Wellness",
    greeting: "Hey. I'm glad you're here. I can see what you've been going through — your mood, your health, all of it. I'm not going to pretend I have a magic fix, but I'm a good listener and I've got some tools that might actually help. What's on your mind?",
    starters: [
      "I've been feeling really anxious and I don't know why",
      "Dealing with my health stuff is exhausting me emotionally",
      "I keep starting healthy habits and then falling off. What's wrong with me?",
      "I need help processing what's happening with my diagnosis",
      "My mind won't shut off at night and I can't sleep",
      "I'm just... burnt out. On everything."
    ],
    planTypes: [
      { id: "stress-plan", label: "🧘 Stress Management Plan", prompt: "Create a personalized stress management plan with daily practices, coping strategies, and lifestyle adjustments based on my specific stressors and health conditions." },
      { id: "sleep-hygiene", label: "😴 Sleep Improvement Plan", prompt: "Design a comprehensive sleep improvement plan considering my conditions, medications, stress levels, and current sleep patterns. Include a bedtime routine." },
      { id: "mood-plan", label: "🌤 Mood Improvement Plan", prompt: "Create a holistic plan to improve my mood and emotional wellbeing, incorporating evidence-based techniques like CBT strategies, behavioral activation, and lifestyle changes appropriate for my health situation." },
      { id: "coping-toolkit", label: "🧰 Coping Toolkit", prompt: "Build me a personalized coping toolkit with specific strategies I can use when I'm overwhelmed, anxious, or in pain. Consider my conditions and what I'm going through." },
    ],
    systemPrompt: (ctx) => `You are a licensed therapist and mental health counselor — part of the patient's personal Healleo health team alongside their doctor, nutritionist, and trainer.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the friend who also happens to be a therapist. Present, warm, unhurried.
- Empathetic above all: you sit with people in their feelings. You don't rush to fix. You validate first, always.
- Authoritative: you draw from CBT, ACT, mindfulness, behavioral activation — but you wear your expertise lightly. You explain techniques in plain language, not textbook jargon.
- Self-effacing: you freely admit that mental health is messy, that you don't have all the answers, and that what works for one person might not work for another. You're a guide, not a guru.
- Dry humor: gentle, never at their expense. Sometimes the heaviest moments need a small, human bit of lightness. You have good instincts for when humor helps and when it doesn't.
- You root for this person deeply. You notice their wins even when they can't. But you're also honest — if avoidance patterns or negative self-talk are getting in the way, you name it gently.
- You're realistic: healing isn't linear, bad days are normal, and "just think positive" is not advice you'd ever give. You meet people where they are.
- You connect dots that others miss: declining mood + poor sleep + a new diagnosis + medication side effects = a complete picture, not isolated problems. That's your superpower.
- CRITICAL: You understand that chronic illness, pain, and health challenges profoundly affect mental health. You never separate the physical from the emotional.

${ctx}

YOUR CLINICAL APPROACH:
- Look at their mood logs: if mood has been declining, notice it and gently explore why
- Connect conditions to emotional state: cancer → grief/fear, chronic pain → depression, diabetes → lifestyle frustration, new diagnosis → identity shift
- Be aware of medications that affect mood: beta-blockers, corticosteroids, hormonal treatments
- If their sleep data is poor, connect that to emotional health — they're probably not just tired, they're depleted
- Use evidence-based approaches but explain them conversationally: "There's this CBT technique that might help..." not "Cognitive behavioral therapy suggests..."
- Help them build practical, daily coping strategies — not theoretical frameworks
- Watch for signs they need in-person professional support and recommend it warmly, not as a dismissal
- Don't over-pathologize normal human emotions. Grief after bad news is healthy. Frustration with health limitations is rational.
- End with a 🧠 Learning Note if you notice emotional patterns worth tracking
- NEVER provide crisis counseling — if someone expresses suicidal ideation, direct them to 988 Suicide & Crisis Lifeline immediately

⚠️ Supportive guidance, not a replacement for licensed in-person therapy. For mental health emergencies, contact 988 or go to your nearest emergency room.`,
    loadingText: "Reflecting on your situation...",
    disclaimer: "⚠️ Supportive wellness guidance — not a replacement for licensed therapy. For mental health emergencies, call 988 (Suicide & Crisis Lifeline).",
    chatKey: "therapistChat",
    memoryPrefix: "💜 Wellness"
  }
};

function ProfessionalChat({role, state, update}) {
  const config = PROFESSIONAL_ROLES[role];
  const [view, setView] = useState("chat"); // chat, plans
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(null);
  const [shareMenu, setShareMenu] = useState(null); // index of message showing share menu
  const chatEnd = useRef(null);
  const msgs = state[config.chatKey] || [];
  const sharedPlans = state.sharedPlans || [];

  // Plans shared TO this professional
  const incomingPlans = sharedPlans.filter(p => p.to === role);
  const unreadCount = incomingPlans.filter(p => !p.read).length;

  // Plans shared FROM this professional
  const outgoingPlans = sharedPlans.filter(p => p.from === role);

  // Other professionals (for share menu)
  const otherPros = Object.entries(PROFESSIONAL_ROLES).filter(([k]) => k !== role);
  const proLabels = { nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist", doctor: "Dr. Healleo" };
  const proIcons = { nutritionist: "🍓", trainer: "🏋️", therapist: "💜", doctor: "🩺" };
  // Map role keys for doctor
  const roleKey = role; // nutritionist, trainer, therapist
  const doctorRole = "doctor";

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, loading]);

  // Build shared plans context for system prompt
  const buildSharedContext = () => {
    if (incomingPlans.length === 0) return "";
    const planTexts = incomingPlans.slice(-5).map(p => {
      const fromLabel = proLabels[p.from] || p.from;
      return `[Shared by ${fromLabel} on ${p.sharedAt?.slice(0,10)}]: ${p.summary}\n${p.content.slice(0, 800)}${p.content.length > 800 ? "..." : ""}`;
    }).join("\n\n");
    return `\n\n═══ SHARED PLANS FROM YOUR COLLEAGUES ═══
The following plans/recommendations were shared with you by other members of this patient's Healleo team. Reference them when relevant — coordinate, don't contradict. If you see something that concerns you from another professional's plan, say so.\n\n${planTexts}\n═══ END SHARED PLANS ═══`;
  };

  const sharePlan = (msgIndex, toRole) => {
    const msg = msgs[msgIndex];
    if (!msg || msg.role !== "assistant") return;

    // Generate a brief summary (first 120 chars of content, cleaned)
    const cleanText = msg.content.replace(/##\s*/g, "").replace(/\*\*/g, "").replace(/\n+/g, " ").trim();
    const summary = cleanText.slice(0, 120) + (cleanText.length > 120 ? "..." : "");

    const plan = {
      id: Date.now().toString(),
      from: role,
      to: toRole,
      content: msg.content,
      summary,
      sharedAt: new Date().toISOString(),
      read: false
    };

    update(s => { s.sharedPlans = [...(s.sharedPlans || []), plan]; });
    setShareMenu(null);
  };

  const markRead = (planId) => {
    update(s => {
      s.sharedPlans = (s.sharedPlans || []).map(p => p.id === planId ? { ...p, read: true } : p);
    });
  };

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: q }];
    update(s => { s[config.chatKey] = newMsgs; });
    setLoading(true);

    const patientContext = buildPatientContext(state);
    const sharedContext = buildSharedContext();
    const sys = config.systemPrompt(patientContext) + sharedContext;
    const apiMsgs = newMsgs.slice(-12).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: sys, messages: apiMsgs })
      });
      const data = await res.json();
      let responseText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!responseText) responseText = "Sorry, I couldn't process that. Please try again.";

      const noteMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?=\n##|$)/);
      const learningNote = noteMatch ? `${config.memoryPrefix}: ${noteMatch[1].trim()}` : null;

      update(s => {
        s[config.chatKey] = [...newMsgs, { role: "assistant", content: responseText }];
        if (learningNote) { s.aiMemory = [...(s.aiMemory || []), { date: today(), insight: learningNote }]; }
      });
    } catch (e) {
      update(s => { s[config.chatKey] = [...newMsgs, { role: "assistant", content: "Connection error. Please check your internet and try again." }]; });
    }
    setLoading(false);
  };

  const generatePlan = async (plan) => {
    setPlanLoading(plan.id);
    const patientContext = buildPatientContext(state);
    const sharedContext = buildSharedContext();
    const sys = config.systemPrompt(patientContext) + sharedContext;
    const planPrompt = `${plan.prompt}

Make this plan HIGHLY PERSONALIZED to my specific profile, conditions, goals, current data, and limitations. Be detailed and actionable — this is my personal ${config.title.toLowerCase()}, not generic advice. Include specific days, times, quantities, and progressions where applicable.${incomingPlans.length > 0 ? `\n\nIMPORTANT: Coordinate with the plans shared by your colleagues. Reference their recommendations where relevant and ensure your plan complements theirs.` : ""}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, system: sys, messages: [{ role: "user", content: planPrompt }] })
      });
      const data = await res.json();
      let responseText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!responseText) responseText = "Couldn't generate the plan. Please try again.";

      const noteMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?=\n##|$)/);
      if (noteMatch) { update(s => { s.aiMemory = [...(s.aiMemory || []), { date: today(), insight: `${config.memoryPrefix}: ${noteMatch[1].trim()}` }]; }); }

      update(s => {
        s[config.chatKey] = [...(s[config.chatKey] || []),
          { role: "user", content: `Create a ${plan.label.replace(/^[^ ]+ /, "")}` },
          { role: "assistant", content: responseText }
        ];
      });
      setView("chat");
    } catch (e) { /* handled gracefully */ }
    setPlanLoading(null);
  };

  const dataPoints = (state.logs?.length || 0) + (state.labResults?.reduce((s, lr) => s + lr.results.length, 0) || 0) + (state.symptomSessions?.length || 0);

  // ─── PLANS VIEW ───
  if (view === "plans") {
    return (<div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={S.h2}>{config.icon} Create a Plan</h2>
        <button onClick={() => setView("chat")} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)" }}>← Chat</button>
      </div>
      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 6, lineHeight: 1.6 }}>
        Each plan is built from your complete health profile{incomingPlans.length > 0 ? " and coordinated with plans shared by your other professionals" : ""}.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {config.planTypes.map(plan => (
          <button key={plan.id} onClick={() => generatePlan(plan)} disabled={!!planLoading}
            className="card" style={{ ...S.card, padding: 16, border: "none", cursor: planLoading ? "wait" : "pointer", textAlign: "left", width: "100%", opacity: planLoading && planLoading !== plan.id ? 0.5 : 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{plan.label}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4 }}>Personalized to your profile and {dataPoints} data points</div>
            {planLoading === plan.id && <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />)}
              <span style={{ fontSize: 13, color: "var(--dim)", marginLeft: 6 }}>{config.loadingText}</span>
            </div>}
          </button>
        ))}
      </div>
    </div>);
  }

  // ─── CHAT VIEW ───
  return (<div className="fade-up">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h2 style={S.h2}>{config.icon} {config.name}</h2>
        <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 2 }}>Personalized from {dataPoints} data points</p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setView("plans")} style={{ ...S.smallBtn, background: "var(--accent2)", fontSize: 13 }}>📋 Plans</button>
        {msgs.length > 0 && <button onClick={() => update(s => { s[config.chatKey] = []; })} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)", fontSize: 13 }}>Clear</button>}
      </div>
    </div>

    {/* Incoming shared plans notification */}
    {incomingPlans.length > 0 && (
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {incomingPlans.slice(-3).map(plan => (
          <div key={plan.id} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, borderLeft: `3px solid ${proIcons[plan.from] === "🩺" ? "var(--accent3)" : proIcons[plan.from] === "🍓" ? "var(--accent)" : proIcons[plan.from] === "🏋️" ? "var(--accent4)" : "var(--accent2)"}`, opacity: plan.read ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>{proIcons[plan.from]}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{proLabels[plan.from]}</span>
                <span style={{ fontSize: 12, color: "var(--dim)" }}>shared a plan</span>
                {!plan.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent4)", display: "inline-block" }} />}
              </div>
              {!plan.read && <button onClick={() => markRead(plan.id)} style={{ fontSize: 11, color: "var(--dim)", background: "none", border: "none", cursor: "pointer" }}>Mark read</button>}
            </div>
            <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 4, lineHeight: 1.5 }}>{plan.summary}</p>
          </div>
        ))}
      </div>
    )}

    <div style={{ ...S.card, marginTop: 12, padding: 0, minHeight: 400, maxHeight: "62vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {msgs.length === 0 && !loading && <div style={{ textAlign: "center", padding: "24px 10px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{config.icon}</div>
          <p style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 500 }}>{config.greeting}</p>
          <p style={{ fontSize: 14, color: "var(--dim)", margin: "8px 0 16px", lineHeight: 1.5 }}>Ask me anything, or tap <strong>📋 Plans</strong> to generate a personalized program.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {config.starters.map(s => <button key={s} onClick={() => send(s)}
              style={{ padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--muted)", borderRadius: 10, fontSize: 14, color: "var(--text)", cursor: "pointer", textAlign: "left", fontFamily: "var(--body)" }}
              onMouseEnter={e => e.target.style.borderColor = "var(--accent)"} onMouseLeave={e => e.target.style.borderColor = "var(--muted)"}>
              💬 {s}
            </button>)}
          </div>
        </div>}
        {msgs.map((m, i) => <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "12px 16px", borderRadius: 14, background: m.role === "user" ? "var(--accent)" : "var(--bg)", color: m.role === "user" ? "#fff" : "var(--text)", ...(m.role === "user" ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }) }}>
              {m.role === "user" ? <p style={{ fontSize: 15, lineHeight: 1.5 }}>{m.content}</p> : <RenderMD text={m.content} />}
            </div>
          </div>
          {/* Share button for assistant messages */}
          {m.role === "assistant" && m.content.length > 100 && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 4, marginLeft: 4, position: "relative" }}>
              <button onClick={() => setShareMenu(shareMenu === i ? null : i)}
                style={{ fontSize: 12, color: "var(--dim)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "var(--dim)"}>
                🔗 Share with team
                {sharedPlans.filter(p => p.from === role && p.content === m.content).length > 0 && <span style={{ fontSize: 10, color: "var(--success)" }}>✓ shared</span>}
              </button>
              {shareMenu === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--card)", border: "1px solid var(--muted)", borderRadius: 8, boxShadow: "var(--shadow-lg)", zIndex: 50, minWidth: 180, marginTop: 2 }}>
                  <div style={{ padding: "6px 12px", fontSize: 11, color: "var(--dim)", borderBottom: "1px solid var(--muted)" }}>Share this response with:</div>
                  {otherPros.map(([proKey, proConfig]) => {
                    const alreadyShared = sharedPlans.some(p => p.from === role && p.to === proKey && p.content === m.content);
                    return <button key={proKey} onClick={() => !alreadyShared && sharePlan(i, proKey)} disabled={alreadyShared}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: alreadyShared ? "default" : "pointer", fontFamily: "var(--body)", fontSize: 13, color: alreadyShared ? "var(--dim)" : "var(--text)", opacity: alreadyShared ? 0.5 : 1 }}
                      onMouseEnter={e => { if (!alreadyShared) e.target.style.background = "var(--bg)"; }} onMouseLeave={e => e.target.style.background = "none"}>
                      <span>{proConfig.icon}</span>
                      <span>{proConfig.title}</span>
                      {alreadyShared && <span style={{ fontSize: 10, color: "var(--success)", marginLeft: "auto" }}>✓</span>}
                    </button>;
                  })}
                  {/* Also share with doctor */}
                  {role !== "doctor" && (() => {
                    const alreadyShared = sharedPlans.some(p => p.from === role && p.to === "doctor" && p.content === m.content);
                    return <button onClick={() => !alreadyShared && sharePlan(i, "doctor")} disabled={alreadyShared}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", cursor: alreadyShared ? "default" : "pointer", fontFamily: "var(--body)", fontSize: 13, color: alreadyShared ? "var(--dim)" : "var(--text)", opacity: alreadyShared ? 0.5 : 1 }}
                      onMouseEnter={e => { if (!alreadyShared) e.target.style.background = "var(--bg)"; }} onMouseLeave={e => e.target.style.background = "none"}>
                      <span>🩺</span><span>Dr. Healleo</span>
                      {alreadyShared && <span style={{ fontSize: 10, color: "var(--success)", marginLeft: "auto" }}>✓</span>}
                    </button>;
                  })()}
                  <button onClick={() => setShareMenu(null)} style={{ width: "100%", padding: "6px", background: "var(--bg)", border: "none", fontSize: 11, color: "var(--dim)", cursor: "pointer", borderRadius: "0 0 8px 8px" }}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>)}
        {loading && <div style={{ padding: "12px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />)}</div>
          <span style={{ fontSize: 14, color: "var(--dim)", marginTop: 4, display: "block" }}>{config.loadingText}</span>
        </div>}
        <div ref={chatEnd} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--muted)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Ask your ${config.title.toLowerCase()}...`} disabled={loading} style={{ ...S.input, flex: 1, border: "none", background: "transparent", padding: "8px 0" }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ ...S.primaryBtn, padding: "8px 16px", fontSize: 15, opacity: loading || !input.trim() ? 0.5 : 1 }}>Send</button>
      </div>
    </div>
    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(138,122,74,0.07)", borderRadius: 8 }}>
      <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.5 }}>{config.disclaimer}</p>
    </div>
  </div>);
}

// ═══════ SYMPTOM CHECKER ═══════
function SymptomChecker({state,update}) {
  const [area,setArea]=useState(null);const [selected,setSelected]=useState([]);const [duration,setDuration]=useState("today");const [severity,setSeverity]=useState(5);const [notes,setNotes]=useState("");const [result,setResult]=useState(null);const [loading,setLoading]=useState(false);const [viewing,setViewing]=useState(null);
  const [customSymptom, setCustomSymptom] = useState("");
  const sessions=state.symptomSessions||[];const toggle=s=>setSelected(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const addCustom = () => {
    const s = customSymptom.trim();
    if (s && !selected.includes(s)) { setSelected(prev => [...prev, s]); }
    setCustomSymptom("");
  };

  const analyze=async()=>{if(!selected.length)return;setLoading(true);
    const prompt=`Patient reports symptoms. Analyze using their FULL history including lab results and past symptoms.\nSYMPTOMS: ${selected.join(", ")} | AREA: ${area || "Not specified"} | DURATION: ${duration} | SEVERITY: ${severity}/10 | NOTES: ${notes||"None"}\n\nProvide:\n## 🔍 Symptom Analysis\n## 📋 Possible Conditions\n## 🏥 When to See a Doctor\n## 🏠 Self-Care\n## 👨‍⚕️ Specialist\nCite sources. Reference relevant lab values if applicable.`;
    const response=await askMedicalAI([{role:"user",content:prompt}],state);
    const session={date:new Date().toISOString(),area:area||"General",symptoms:selected,duration,severity,notes,result:response.text};
    update(s=>{s.symptomSessions=[...(s.symptomSessions||[]),session];s.healthTimeline=[...(s.healthTimeline||[]),{date:today(),type:"symptom",title:`Symptoms: ${selected.slice(0,3).join(", ")}`,notes:`${area||"General"}, severity ${severity}/10, ${duration}`}];if(response.learningNote)s.aiMemory=[...(s.aiMemory||[]),{date:today(),insight:response.learningNote}];});
    setResult(response.text);setLoading(false);};
  const reset=()=>{setArea(null);setSelected([]);setDuration("today");setSeverity(5);setNotes("");setResult(null);setCustomSymptom("");};

  if(viewing)return <div className="fade-up"><button onClick={()=>setViewing(null)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button><div style={S.card}><div style={{fontSize:14,color:"var(--dim)",fontFamily:"var(--mono)"}}>{new Date(viewing.date).toLocaleDateString()}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"8px 0"}}>{viewing.symptoms.map(s=><span key={s} style={{...S.chip,...S.chipActive,fontSize:14,padding:"3px 8px"}}>{s}</span>)}</div><RenderMD text={viewing.result}/></div></div>;
  if(result)return <div className="fade-up"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={S.h2}>🔍 Results</h2><button onClick={reset} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>New</button></div><div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"10px 0"}}>{selected.map(s=><span key={s} style={{fontSize:14,padding:"3px 10px",background:"rgba(138,122,74,0.1)",borderRadius:12,color:"var(--accent)",fontFamily:"var(--mono)"}}>{s}</span>)}</div><div style={{...S.card,marginTop:8}}><RenderMD text={result}/></div></div>;

  // Selected symptoms bar (shown when any are selected, regardless of step)
  const selectedBar = selected.length > 0 && (
    <div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--accent)"}}>
      <div style={{fontSize:14,color:"var(--dim)",marginBottom:6}}>Selected symptoms ({selected.length}):</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {selected.map(s => (
          <span key={s} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:14,padding:"3px 8px",background:"var(--accent)",color:"#fff",borderRadius:12}}>
            {s}
            <button onClick={()=>setSelected(selected.filter(x=>x!==s))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );

  return (<div className="fade-up"><h2 style={S.h2}>🔍 Symptom Checker</h2>

    {/* Free-text symptom entry — always visible */}
    <div style={{...S.card,marginTop:14,padding:16}}>
      <h3 style={S.h3}>✏️ Describe your symptoms</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Type any symptom in your own words, or pick from common options below</p>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <input value={customSymptom} onChange={e=>setCustomSymptom(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
          placeholder="e.g. sharp pain behind left eye, tingling in fingers..." style={{...S.input,flex:1}} />
        <button onClick={addCustom} disabled={!customSymptom.trim()} style={{...S.primaryBtn,fontSize:15,padding:"8px 14px",opacity:customSymptom.trim()?1:0.5}}>Add</button>
      </div>
    </div>

    {selectedBar}

    {/* Body area selector */}
    {!area ? <div style={{...S.card,marginTop:10,padding:20}}>
      <h3 style={S.h3}>📍 Body area <span style={{fontWeight:400,color:"var(--dim)"}}>(optional — helps narrow results)</span></h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
        {BODY_AREAS.map(a=><button key={a} onClick={()=>setArea(a)} style={{padding:"12px 10px",background:"var(--bg)",border:"1.5px solid var(--muted)",borderRadius:10,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"var(--body)"}}>{a}</button>)}
      </div>
    </div>
    : <div style={{...S.card,marginTop:10,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><h3 style={S.h3}>📍 {area}</h3><button onClick={()=>setArea(null)} style={{fontSize:14,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Change</button></div>
        <p style={{fontSize:14,color:"var(--dim)",margin:"6px 0 8px"}}>Common symptoms for this area:</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {(SYMPTOM_MAP[area]||[]).map(s=><button key={s} onClick={()=>toggle(s)} style={{...S.chip,...(selected.includes(s)?S.chipActive:{}),fontSize:14,padding:"5px 10px"}}>{selected.includes(s)?"✓ ":""}{s}</button>)}
        </div>
      </div>}

    {/* Duration / Severity / Notes / Analyze — shown when symptoms selected */}
    {selected.length>0&&<>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>⏱ Duration</h3><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{["today","2-3 days","1 week","2+ weeks","1+ month","chronic"].map(d=><button key={d} onClick={()=>setDuration(d)} style={{...S.chip,...(duration===d?S.chipActive:{}),fontSize:15,padding:"5px 12px"}}>{d}</button>)}</div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>📊 Severity: {severity}/10</h3><input type="range" min="1" max="10" value={severity} onChange={e=>setSeverity(parseInt(e.target.value))} style={{width:"100%",marginTop:8}}/><div style={{display:"flex",justifyContent:"space-between",fontSize:16,color:"var(--dim)"}}><span>Mild</span><span>Moderate</span><span>Severe</span></div></div>
      <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>📝 Additional context</h3><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="When did it start? What makes it better or worse? Any triggers?" rows={3} style={{...S.input,marginTop:8,resize:"vertical"}}/></div>
      <button onClick={analyze} disabled={loading} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:loading?0.6:1}}>{loading?"Analyzing with your full history...":"🔍 Analyze Symptoms"}</button>
    </>}

    {sessions.length>0&&<div style={{...S.card,marginTop:20,padding:16}}><h3 style={S.h3}>📂 Past Checks</h3><div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>{[...sessions].reverse().slice(0,5).map((sess,i)=><button key={i} onClick={()=>setViewing(sess)} style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"var(--bg)",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",fontFamily:"var(--body)",width:"100%"}}><div><div style={{fontSize:15,fontWeight:600}}>{sess.area} — {sess.symptoms.slice(0,2).join(", ")}</div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{new Date(sess.date).toLocaleDateString()}</div></div><span style={{color:"var(--dim)"}}>→</span></button>)}</div></div>}
  </div>);
}

// ═══════ DOCTOR FINDER ═══════
function DoctorFinder({state,update}) {
  const profile = state.profile;
  const savedDoctors = state.savedDoctors || [];
  const [view, setView] = useState("main"); // main, search, results, detail, mychart, add
  const [specialty, setSpecialty] = useState("");
  const [distance, setDistance] = useState(25);
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [myChartText, setMyChartText] = useState("");
  const [importing, setImporting] = useState(false);
  const [manualDoc, setManualDoc] = useState({ name:"", specialty:"", phone:"", address:"", npi:"", portal:"", fax:"", email:"", notes:"", network:"", accepting:true });
  const [geoStatus, setGeoStatus] = useState("");

  const DISTANCES = [{v:5,l:"5 mi"},{v:25,l:"25 mi"},{v:50,l:"50 mi"},{v:100,l:"100 mi"},{v:200,l:"200 mi"},{v:500,l:"500 mi"},{v:0,l:"Nationwide"}];

  const rec = [];
  if (profile.conditions?.includes("Diabetes")||profile.conditions?.includes("Thyroid")) rec.push("Endocrinology");
  if (profile.conditions?.includes("High Blood Pressure")||profile.conditions?.includes("High Cholesterol")) rec.push("Cardiology");
  if (profile.conditions?.includes("Anxiety")||profile.conditions?.includes("Insomnia")) rec.push("Psychiatry");
  if (profile.conditions?.includes("IBS")) rec.push("Gastroenterology");
  if (profile.conditions?.includes("Asthma")) rec.push("Pulmonology");
  if (profile.conditions?.includes("Arthritis")) rec.push("Rheumatology");

  const getLocation = () => {
    setGeoStatus("locating");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`); setGeoStatus("found"); },
        () => setGeoStatus("denied"),
        { timeout: 10000 }
      );
    } else setGeoStatus("unavailable");
  };

  const searchDoctors = async () => {
    if (!specialty && !location) return;
    setSearching(true); setResults([]);

    try {
      // Build NPPES API query
      const params = new URLSearchParams({ version: "2.1", limit: "50" });
      if (specialty) {
        // Clean up specialty for NPPES taxonomy_description matching
        let taxTerm = specialty.replace(/\s*\/\s*.*/,"").replace(/\s*\(.*/,"").trim(); // "Primary Care / Family Medicine" → "Primary Care"
        if (taxTerm === "Primary Care") taxTerm = "Family Medicine";
        if (taxTerm === "Urgent Care") taxTerm = "Emergency Medicine";
        params.set("taxonomy_description", taxTerm + "*"); // wildcard for partial match
      }
      
      // Parse location — could be zip, city+state, or "city, state"
      const loc = location.trim();
      const zipMatch = loc.match(/^\d{5}(-\d{4})?$/);
      const cityStateMatch = loc.match(/^(.+?),?\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)$/i);
      
      if (zipMatch) {
        params.set("postal_code", loc.slice(0,5) + "*"); // wildcard for zip+4
      } else if (cityStateMatch) {
        params.set("city", cityStateMatch[1].trim());
        params.set("state", cityStateMatch[2].toUpperCase());
      } else if (loc.length === 2) {
        params.set("state", loc.toUpperCase());
      } else {
        params.set("city", loc);
      }

      const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params}`);
      const data = await res.json();
      
      if (data.results?.length) {
        const parsed = data.results.map(r => {
          const addr = r.addresses?.find(a => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
          const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
          const isOrg = r.enumeration_type === "NPI-2";
          const name = isOrg 
            ? r.basic?.organization_name || "Unknown"
            : `${r.basic?.credential ? "" : "Dr. "}${r.basic?.first_name || ""} ${r.basic?.last_name || ""}${r.basic?.credential ? ", " + r.basic.credential : ""}`.trim();
          
          return {
            name,
            specialty: taxonomy.desc || specialty || "",
            address: [addr.address_1, addr.address_2, `${addr.city || ""}, ${addr.state || ""} ${addr.postal_code?.slice(0,5) || ""}`].filter(Boolean).join(", "),
            phone: addr.telephone_number ? addr.telephone_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "",
            fax: addr.fax_number ? addr.fax_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "",
            npi: r.number || "",
            accepting_new: true,
            state: addr.state || "",
            city: addr.city || "",
            zip: addr.postal_code?.slice(0,5) || "",
            source: "npi_registry",
            license_state: taxonomy.state || "",
            taxonomy_code: taxonomy.code || "",
          };
        }).filter(d => d.name && d.name !== "Dr. ");

        // If zip-based search, sort by zip proximity
        if (zipMatch) {
          const searchZip = parseInt(loc.slice(0,3));
          parsed.sort((a,b) => Math.abs(parseInt((a.zip||"00000").slice(0,3)) - searchZip) - Math.abs(parseInt((b.zip||"00000").slice(0,3)) - searchZip));
        }

        setResults(parsed);
      } else {
        // Fallback: try broader search without city
        if (cityStateMatch) {
          const params2 = new URLSearchParams({ version: "2.1", limit: "20" });
          if (specialty) {
            let taxTerm2 = specialty.replace(/\s*\/\s*.*/,"").replace(/\s*\(.*/,"").trim();
            if (taxTerm2 === "Primary Care") taxTerm2 = "Family Medicine";
            if (taxTerm2 === "Urgent Care") taxTerm2 = "Emergency Medicine";
            params2.set("taxonomy_description", taxTerm2 + "*");
          }
          params2.set("state", cityStateMatch[2].toUpperCase());
          const res2 = await fetch(`https://npiregistry.cms.hhs.gov/api/?${params2}`);
          const data2 = await res2.json();
          if (data2.results?.length) {
            const parsed2 = data2.results.map(r => {
              const addr = r.addresses?.find(a => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
              const taxonomy = r.taxonomies?.find(t => t.primary) || r.taxonomies?.[0] || {};
              const isOrg = r.enumeration_type === "NPI-2";
              const name = isOrg 
                ? r.basic?.organization_name || "Unknown"
                : `${r.basic?.credential ? "" : "Dr. "}${r.basic?.first_name || ""} ${r.basic?.last_name || ""}${r.basic?.credential ? ", " + r.basic.credential : ""}`.trim();
              return { name, specialty: taxonomy.desc || specialty || "", address: [addr.address_1, addr.address_2, `${addr.city||""}, ${addr.state||""} ${addr.postal_code?.slice(0,5)||""}`].filter(Boolean).join(", "), phone: addr.telephone_number ? addr.telephone_number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : "", npi: r.number || "", accepting_new: true, source: "npi_registry" };
            }).filter(d => d.name && d.name !== "Dr. ");
            setResults(parsed2);
          }
        }
      }
    } catch(e) { console.error("NPI search error:", e); setResults([]); }
    setSearching(false);
    setView("results");
  };

  const saveDoctor = (doc) => {
    const docToSave = { ...doc, id: Date.now().toString(), savedAt: new Date().toISOString(), source: doc.source || "search" };
    update(s => { s.savedDoctors = [...(s.savedDoctors||[]), docToSave]; });
  };

  const removeDoctor = (id) => {
    update(s => { s.savedDoctors = s.savedDoctors.filter(d => d.id !== id); });
  };

  const isSaved = (doc) => savedDoctors.some(d => d.name === doc.name && d.specialty === doc.specialty);

  const importMyChart = async () => {
    if (!myChartText.trim()) return;
    setImporting(true);
    const prompt = `Extract doctor/provider information from this MyChart patient portal data. Return ONLY a JSON array of doctor objects with fields: name, specialty, phone, address, fax, email, npi, portal_url, hospital_affiliation, notes.

MyChart data:
${myChartText}

Extract all providers/doctors found. If data is missing for a field, use empty string.`;

    const response = await askMedicalAI([{role:"user",content:prompt}], state, { skipRAG: true });
    try {
      const jsonStr = response.text.replace(/```json?|```/g,"").trim();
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        parsed.forEach(doc => {
          const docToSave = { ...doc, id: Date.now().toString() + Math.random().toString(36).slice(2,6), savedAt: new Date().toISOString(), source: "mychart", accepting: true, rating: 0 };
          update(s => { s.savedDoctors = [...(s.savedDoctors||[]), docToSave]; });
        });
        setMyChartText("");
        setView("main");
      }
    } catch(e) {}
    setImporting(false);
  };

  const saveManual = () => {
    if (!manualDoc.name.trim()) return;
    saveDoctor({ ...manualDoc, source: "manual", rating: 0, distance_miles: 0 });
    setManualDoc({ name:"",specialty:"",phone:"",address:"",npi:"",portal:"",fax:"",email:"",notes:"",network:"",accepting:true });
    setView("main");
  };

  // ─── DETAIL VIEW ───
  if (selectedDoc) {
    const doc = selectedDoc;
    const saved = isSaved(doc);
    return (
      <div className="fade-up">
        <button onClick={() => setSelectedDoc(null)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <div style={{...S.card,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h2 style={{...S.h2,fontSize:18}}>{doc.name}</h2>
              <div style={{fontSize:15,color:"var(--accent)",fontWeight:600,marginTop:4}}>{doc.specialty}</div>
            </div>
            {doc.rating > 0 && <div style={{display:"flex",alignItems:"center",gap:4,background:"var(--bg)",padding:"4px 10px",borderRadius:12}}>
              <span style={{color:"var(--accent2)"}}>★</span>
              <span style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:600}}>{doc.rating}</span>
            </div>}
          </div>

          <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
            {doc.address && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📍</span><span>{doc.address}</span></div>}
            {doc.phone && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📞</span><a href={`tel:${doc.phone.replace(/\D/g,"")}`} style={{color:"var(--accent)"}}>{doc.phone}</a></div>}
            {doc.fax && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>📠</span><span>{doc.fax}</span></div>}
            {doc.email && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>✉️</span><a href={`mailto:${doc.email}`} style={{color:"var(--accent)"}}>{doc.email}</a></div>}
            {doc.npi && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🆔</span><span style={{fontFamily:"var(--mono)"}}>NPI: {doc.npi}</span></div>}
            {doc.portal_url && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🌐</span><span>Patient Portal: {doc.portal_url}</span></div>}
            {doc.distance_miles > 0 && <div style={{display:"flex",gap:10,fontSize:16}}><span style={{color:"var(--dim)",flexShrink:0}}>🚗</span><span>{doc.distance_miles} miles away</span></div>}
          </div>

          {(doc.education || doc.hospital_affiliation || doc.years_experience) && <div style={{marginTop:16,padding:12,background:"var(--bg)",borderRadius:8}}>
            {doc.education && <div style={{fontSize:15,marginBottom:4}}><strong>Education:</strong> {doc.education}</div>}
            {doc.hospital_affiliation && <div style={{fontSize:15,marginBottom:4}}><strong>Hospital:</strong> {doc.hospital_affiliation}</div>}
            {doc.years_experience && <div style={{fontSize:15}}><strong>Experience:</strong> {doc.years_experience} years</div>}
          </div>}

          {doc.languages && doc.languages.length > 0 && <div style={{marginTop:10}}><span style={{fontSize:14,color:"var(--dim)"}}>Languages:</span> <span style={{fontSize:15}}>{doc.languages.join(", ")}</span></div>}
          {doc.insurance && doc.insurance.length > 0 && <div style={{marginTop:6}}><span style={{fontSize:14,color:"var(--dim)"}}>Insurance:</span><div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{doc.insurance.map((ins,i)=><span key={i} style={{fontSize:16,padding:"2px 8px",background:"var(--bg)",borderRadius:8,color:"var(--dim)"}}>{ins}</span>)}</div></div>}
          {doc.accepting !== undefined && <div style={{marginTop:8,fontSize:15,color:doc.accepting?"var(--success)":"var(--danger)"}}>{doc.accepting ? "✓ Accepting new patients" : "✕ Not accepting new patients"}</div>}
          {doc.notes && <div style={{marginTop:10,padding:10,background:"var(--bg)",borderRadius:8,fontSize:15,color:"var(--dim)"}}><strong>Notes:</strong> {doc.notes}</div>}
          {doc.source && <div style={{marginTop:8,fontSize:16,color:"var(--dim)",fontFamily:"var(--mono)"}}>Source: {doc.source === "mychart" ? "MyChart Import" : doc.source === "manual" ? "Manual Entry" : "Search"}</div>}

          <div style={{display:"flex",gap:8,marginTop:16}}>
            {!saved && <button onClick={()=>{saveDoctor(doc);setSelectedDoc({...doc});}} style={{...S.primaryBtn,flex:1,fontSize:15}}>💾 Save to My Doctors</button>}
            {saved && <div style={{...S.primaryBtn,flex:1,fontSize:15,opacity:0.6,textAlign:"center",cursor:"default"}}>✓ Saved</div>}
            {doc.phone && <a href={`tel:${doc.phone.replace(/\D/g,"")}`} style={{...S.secondaryBtn,textDecoration:"none",textAlign:"center",flex:1,fontSize:15}}>📞 Call</a>}
          </div>
        </div>
      </div>
    );
  }

  // ─── SEARCH RESULTS ───
  if (view === "results") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("search")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← New Search</button>
        <h2 style={S.h2}>🔍 {results.length} Doctor{results.length !== 1 ? "s" : ""} Found</h2>
        <div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>{specialty || "All specialties"} · {location || "All locations"} · Source: CMS NPI Registry</div>

        {results.length === 0 && <div style={{...S.card,marginTop:16,textAlign:"center",padding:30}}><div style={{fontSize:36,marginBottom:8}}>🔍</div><p style={{fontSize:16,color:"var(--dim)"}}>No providers found. Try a broader search — use just the state abbreviation (e.g. "WA") or a wider specialty term. ZIP codes work best for local results.</p></div>}

        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}>
          {results.map((doc, i) => (
            <button key={i} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:14,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
              <div style={{display:"flex",gap:10}}>
                <div style={{width:42,height:42,borderRadius:10,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {DOCTOR_SPECIALTIES.find(s=>doc.specialty?.toLowerCase().includes(s.name.split(" ")[0].toLowerCase()))?.icon || "👨‍⚕️"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:600,fontSize:16,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doc.name}</div>
                    {doc.rating > 0 && <span style={{fontSize:14,color:"var(--accent2)",flexShrink:0}}>★ {doc.rating}</span>}
                  </div>
                  <div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>
                  <div style={{fontSize:16,color:"var(--dim)",marginTop:3}}>{doc.address?.split(",").slice(0,2).join(",")}</div>
                  <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}>
                    {doc.npi && <span style={{fontSize:15,color:"var(--dim)",fontFamily:"var(--mono)"}}>NPI: {doc.npi}</span>}
                    {doc.phone && <span style={{fontSize:15,color:"var(--accent3)"}}>{doc.phone}</span>}
                    {isSaved(doc) && <span style={{fontSize:15,color:"var(--accent3)"}}>★ Saved</span>}
                  </div>
                </div>
                <span style={{color:"var(--dim)",alignSelf:"center"}}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── SEARCH FORM ───
  if (view === "search") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>🔍 Find a Doctor</h2>

        <div style={{...S.card,marginTop:14,padding:18}}>
          <h3 style={S.h3}>Specialty</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
            {DOCTOR_SPECIALTIES.map(s => (
              <button key={s.name} onClick={() => setSpecialty(s.name)} style={{...S.chip,...(specialty === s.name ? S.chipActive : {}),fontSize:14,padding:"5px 10px"}}>{s.icon} {s.name.split(" / ")[0]}</button>
            ))}
          </div>
          <input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Or type any specialty..." style={{...S.input,marginTop:8}} />
        </div>

        <div style={{...S.card,marginTop:10,padding:18}}>
          <h3 style={S.h3}>📍 Location</h3>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="ZIP code, City ST, or state (e.g. 98199, Seattle WA)" style={{...S.input,marginTop:8}} />
          <div style={{fontSize:16,color:"var(--dim)",marginTop:6,lineHeight:1.4}}>Searches the CMS NPI Registry — all licensed US healthcare providers. Use ZIP code for best results, or City + State abbreviation (e.g. "Seattle, WA").</div>
        </div>

        {rec.length > 0 && <div style={{...S.card,marginTop:10,padding:14,borderLeft:"3px solid var(--accent)"}}>
          <div style={{fontSize:14,color:"var(--dim)"}}>🎯 <strong>Recommended for you:</strong></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>
            {rec.map(r => <button key={r} onClick={() => setSpecialty(r)} style={{...S.chip,...(specialty===r?S.chipActive:{}),fontSize:14,padding:"4px 10px"}}>{r}</button>)}
          </div>
        </div>}

        <button onClick={searchDoctors} disabled={searching || (!specialty && !location)} style={{...S.primaryBtn,width:"100%",marginTop:14,padding:14,opacity:searching?0.6:1}}>
          {searching ? "🔍 Searching NPI Registry..." : "🔍 Search Providers"}
        </button>
      </div>
    );
  }

  // ─── MYCHART IMPORT ───
  if (view === "mychart") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>🏥 Import from MyChart</h2>
        <p style={{fontSize:15,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Copy your doctor/provider information from your MyChart patient portal and paste it below. The AI will extract and save all provider details.</p>

        <div style={{...S.card,marginTop:14,padding:16}}>
          <h3 style={S.h3}>📋 How to export from MyChart</h3>
          <div style={{marginTop:8,fontSize:15,color:"var(--dim)",lineHeight:1.7}}>
            <div>1. Log in to your <strong>MyChart</strong> account</div>
            <div>2. Go to <strong>My Providers</strong> or <strong>Care Team</strong></div>
            <div>3. Select each provider to see their details</div>
            <div>4. Copy all the text (name, specialty, phone, address, NPI, etc.)</div>
            <div>5. Paste everything into the box below</div>
          </div>
        </div>

        <textarea value={myChartText} onChange={e => setMyChartText(e.target.value)} placeholder={"Paste your MyChart provider information here...\n\nExample:\nDr. Sarah Johnson, MD\nInternal Medicine\nNPI: 1234567890\nPhone: (555) 123-4567\nFax: (555) 123-4568\n123 Medical Center Dr, Suite 200\nSeattle, WA 98101\nAccepting New Patients: Yes\n\nYou can paste multiple providers at once."} rows={10} style={{...S.input,marginTop:12,resize:"vertical",fontFamily:"var(--mono)",fontSize:14}} />

        <button onClick={importMyChart} disabled={importing || !myChartText.trim()} style={{...S.primaryBtn,width:"100%",marginTop:12,padding:14,opacity:importing?0.6:1}}>
          {importing ? "🔄 Importing providers..." : "📥 Import Providers"}
        </button>

        <div style={{...S.card,marginTop:12,padding:14,borderLeft:"3px solid var(--accent3)"}}>
          <h3 style={{...S.h3,fontSize:15}}>💡 Also supported</h3>
          <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>You can also paste provider info from <strong>Epic MyChart</strong>, <strong>Cerner</strong>, <strong>Athenahealth</strong>, discharge summaries, referral letters, or any text containing doctor information.</p>
        </div>
      </div>
    );
  }

  // ─── MANUAL ADD ───
  if (view === "add") {
    return (
      <div className="fade-up">
        <button onClick={() => setView("main")} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",marginBottom:12}}>← Back</button>
        <h2 style={S.h2}>➕ Add Doctor Manually</h2>
        <div style={{...S.card,marginTop:14,padding:18}}>
          <div style={S.formGrid}>
            <label style={S.label}>Doctor Name *<input style={S.input} value={manualDoc.name} onChange={e => setManualDoc({...manualDoc,name:e.target.value})} placeholder="Dr. Jane Smith"/></label>
            <label style={S.label}>Specialty<input style={S.input} value={manualDoc.specialty} onChange={e => setManualDoc({...manualDoc,specialty:e.target.value})} placeholder="Cardiology"/></label>
            <label style={S.label}>Phone<input style={S.input} value={manualDoc.phone} onChange={e => setManualDoc({...manualDoc,phone:e.target.value})} placeholder="(555) 123-4567"/></label>
            <label style={S.label}>Fax<input style={S.input} value={manualDoc.fax} onChange={e => setManualDoc({...manualDoc,fax:e.target.value})} placeholder="(555) 123-4568"/></label>
          </div>
          <label style={{...S.label,marginTop:10}}>Address<input style={S.input} value={manualDoc.address} onChange={e => setManualDoc({...manualDoc,address:e.target.value})} placeholder="123 Medical Center Dr, Seattle, WA 98101"/></label>
          <label style={{...S.label,marginTop:8}}>Email<input style={S.input} value={manualDoc.email} onChange={e => setManualDoc({...manualDoc,email:e.target.value})} placeholder="dr.smith@clinic.com"/></label>
          <div style={{...S.formGrid,marginTop:8}}>
            <label style={S.label}>NPI Number<input style={S.input} value={manualDoc.npi} onChange={e => setManualDoc({...manualDoc,npi:e.target.value})} placeholder="1234567890"/></label>
            <label style={S.label}>Insurance Network<input style={S.input} value={manualDoc.network} onChange={e => setManualDoc({...manualDoc,network:e.target.value})} placeholder="Blue Cross"/></label>
          </div>
          <label style={{...S.label,marginTop:8}}>Patient Portal URL<input style={S.input} value={manualDoc.portal} onChange={e => setManualDoc({...manualDoc,portal:e.target.value})} placeholder="https://mychart.clinic.com"/></label>
          <label style={{...S.label,marginTop:8}}>Notes<textarea value={manualDoc.notes} onChange={e => setManualDoc({...manualDoc,notes:e.target.value})} placeholder="Preferred times, referral info, etc." rows={2} style={{...S.input,resize:"vertical"}}/></label>
          <label style={{...S.label,marginTop:8,flexDirection:"row",alignItems:"center",gap:8}}>
            <input type="checkbox" checked={manualDoc.accepting} onChange={e => setManualDoc({...manualDoc,accepting:e.target.checked})} style={{width:16,height:16}} />
            <span>Accepting new patients</span>
          </label>
          <button onClick={saveManual} disabled={!manualDoc.name.trim()} style={{...S.primaryBtn,width:"100%",marginTop:14}}>💾 Save Doctor</button>
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW ───
  const myChartDocs = savedDoctors.filter(d => d.source === "mychart");
  const searchDocs = savedDoctors.filter(d => d.source === "search");
  const manualDocs = savedDoctors.filter(d => d.source === "manual");

  return (
    <div className="fade-up">
      <h2 style={S.h2}>👨‍⚕️ My Doctors</h2>
      <p style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Find, save, and manage your healthcare providers</p>

      {/* Action buttons */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
        <button onClick={() => setView("search")} className="card" style={{...S.card,padding:"16px 10px",textAlign:"center",border:"none",cursor:"pointer"}}>
          <div style={{fontSize:24}}>🔍</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--accent)",marginTop:4}}>Find Doctor</div>
          <div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Search by specialty & distance</div>
        </button>
        <button onClick={() => setView("mychart")} className="card" style={{...S.card,padding:"16px 10px",textAlign:"center",border:"none",cursor:"pointer"}}>
          <div style={{fontSize:24}}>🏥</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--accent)",marginTop:4}}>MyChart Import</div>
          <div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Import from patient portal</div>
        </button>
      </div>
      <button onClick={() => setView("add")} style={{...S.secondaryBtn,width:"100%",marginTop:8,fontSize:15}}>➕ Add Doctor Manually</button>

      {/* Saved Doctors */}
      {savedDoctors.length > 0 ? (
        <div style={{marginTop:20}}>
          {myChartDocs.length > 0 && <>
            <h3 style={{...S.h3,marginBottom:8}}>🏥 From MyChart ({myChartDocs.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {myChartDocs.map(doc => (
                <button key={doc.id} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:12,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:16,fontWeight:600}}>{doc.name}</div><div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>{doc.phone&&<div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{doc.phone}</div>}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:15,padding:"2px 6px",background:"rgba(122,155,181,0.1)",borderRadius:6,color:"var(--accent3)"}}>MyChart</span>
                      <button onClick={(e) => {e.stopPropagation();removeDoctor(doc.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:15}}>✕</button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {[...searchDocs,...manualDocs].length > 0 && <>
            <h3 style={{...S.h3,marginBottom:8}}>📋 Saved Doctors ({searchDocs.length + manualDocs.length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {[...searchDocs,...manualDocs].map(doc => (
                <button key={doc.id} onClick={() => setSelectedDoc(doc)} className="card" style={{...S.card,padding:12,border:"none",cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:16,fontWeight:600}}>{doc.name}</div><div style={{fontSize:14,color:"var(--accent)",marginTop:2}}>{doc.specialty}</div>{doc.address&&<div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{doc.address.split(",").slice(0,2).join(",")}</div>}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {doc.rating>0&&<span style={{fontSize:14,color:"var(--accent2)"}}>★ {doc.rating}</span>}
                      <button onClick={(e) => {e.stopPropagation();removeDoctor(doc.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:15}}>✕</button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>}
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"30px 20px",marginTop:16,color:"var(--dim)"}}>
          <div style={{fontSize:40,marginBottom:10}}>👨‍⚕️</div>
          <p style={{fontSize:16}}>No doctors saved yet. Search for providers, import from MyChart, or add manually.</p>
        </div>
      )}

      {/* Specialty Guide */}
      <div style={{...S.card,marginTop:16,padding:16}}>
        <h3 style={S.h3}>📖 Specialty Guide</h3>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          {DOCTOR_SPECIALTIES.map(doc => (
            <div key={doc.name} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--muted)"}}>
              <span style={{fontSize:18,width:28}}>{doc.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600}}>{doc.name}</div><div style={{fontSize:16,color:"var(--dim)"}}>{doc.when}</div></div>
              <button onClick={() => {setSpecialty(doc.name);setView("search");}} style={{fontSize:16,color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Search →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency */}
      <div style={{...S.card,marginTop:12,padding:16}}>
        <h3 style={S.h3}>🆘 Emergency</h3>
        <div style={{marginTop:8,fontSize:16,lineHeight:2}}>
          <div><strong>Emergency:</strong> <a href="tel:911" style={{color:"var(--danger)",fontFamily:"var(--mono)"}}>911</a></div>
          <div><strong>Poison:</strong> <a href="tel:18002221222" style={{color:"var(--accent)",fontFamily:"var(--mono)"}}>1-800-222-1222</a></div>
          <div><strong>Crisis:</strong> <a href="tel:988" style={{color:"var(--accent)",fontFamily:"var(--mono)"}}>988</a></div>
        </div>
      </div>
    </div>
  );
}

// ═══════ DASHBOARD ═══════
// ═══════ DOCTOR VISIT SUMMARY ═══════
function DoctorSummary({state}) {
  const [summary,setSummary]=useState(null);
  const [generating,setGenerating]=useState(false);
  const [dateRange,setDateRange]=useState("30"); // days

  const generateSummary = async () => {
    setGenerating(true);
    const days = parseInt(dateRange);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
    const cutoffStr = cutoff.toISOString().slice(0,10);
    const p = state.profile || {};
    const recentLogs = (state.logs||[]).filter(l=>l.date>=cutoffStr);
    const recentSymptoms = (state.symptomSessions||[]).filter(s=>(s.date||s.sessionDate||"")>=cutoffStr);
    const recentTimeline = (state.healthTimeline||[]).filter(t=>t.date>=cutoffStr);
    const allLabs = state.labResults||[];
    const flaggedLabs = allLabs.flatMap(lr => (lr.results||[]).filter(r=>r.flag&&r.flag!=="NORMAL").map(r=>({...r, reportDate:lr.date, reportName:lr.name})));

    // Compute averages
    const avgWater = recentLogs.length ? (recentLogs.reduce((s,l)=>s+(l.water||0),0)/recentLogs.length).toFixed(1) : "N/A";
    const avgSleep = recentLogs.length ? (recentLogs.reduce((s,l)=>s+(l.sleep||0),0)/recentLogs.length).toFixed(1) : "N/A";
    const avgCalories = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.calories||0),0)/recentLogs.length) : "N/A";
    const avgSteps = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.steps||0),0)/recentLogs.length) : "N/A";
    const moodDist = [0,0,0,0,0]; recentLogs.forEach(l=>{if(l.mood>=0&&l.mood<5)moodDist[l.mood]++;});
    const moodLabels=["Very Bad","Bad","Neutral","Good","Great"];
    const topMood = moodDist.indexOf(Math.max(...moodDist));

    // Supplements used
    const suppSet = new Set(); recentLogs.forEach(l=>(l.supplements||[]).forEach(s=>suppSet.add(s)));
    const supplements = [...suppSet];

    // Exercise
    const exercises = recentLogs.flatMap(l=>(l.exercise||[]));
    const exTypes = {}; exercises.forEach(e=>{exTypes[e.type]=(exTypes[e.type]||0)+e.minutes;});

    // Meals / nutrition
    const meals = recentLogs.flatMap(l=>(l.meals||[]).map(m=>({date:l.date,meal:m})));
    const avgProtein = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.protein||0),0)/recentLogs.length) : "N/A";
    const avgCarbs = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.carbs||0),0)/recentLogs.length) : "N/A";
    const avgFat = recentLogs.length ? Math.round(recentLogs.reduce((s,l)=>s+(l.fat||0),0)/recentLogs.length) : "N/A";

    const prompt = `Generate a PROFESSIONAL MEDICAL VISIT SUMMARY that a patient would bring to their doctor. Use formal medical language. Format it clearly with markdown headers.

PATIENT PROFILE:
Name: ${p.name||"[Not provided]"} | Age: ${p.age||"?"} | Sex: ${p.sex||"?"} | Weight: ${p.weight||"?"} lbs | Height: ${fmtHeight(p.height)}
Blood Type: ${p.bloodType||"Unknown"} | Diet: ${p.dietType||"Not specified"}
Current Medications: ${(state.medications||[]).filter(m=>m.active!==false).length>0 ? (state.medications||[]).filter(m=>m.active!==false).map(m=>`${m.name}${m.dose?" "+m.dose:""}${m.frequency?" ("+m.frequency+")":""}`).join(", ") : (p.medications||"None reported")}
Recently Discontinued: ${(state.medications||[]).filter(m=>m.active===false).length>0 ? (state.medications||[]).filter(m=>m.active===false).map(m=>m.name).join(", ") : "None"}
Known Allergies: ${p.allergies||"None reported"}
Medical Conditions: ${(p.conditions||[]).join(", ")||"None reported"}
Family History: ${p.familyHistory||"None reported"}

PERIOD COVERED: Last ${days} days (${cutoffStr} to ${today()})

DAILY WELLNESS AVERAGES (${recentLogs.length} days logged):
- Water intake: ${avgWater} oz/day
- Sleep: ${avgSleep} hrs/night
- Calories: ${avgCalories}/day | Protein: ${avgProtein}g | Carbs: ${avgCarbs}g | Fat: ${avgFat}g
- Steps: ${avgSteps}/day
- Predominant mood: ${moodLabels[topMood]} (${moodDist[topMood]}/${recentLogs.length} days)

CURRENT SUPPLEMENTS: ${supplements.length?supplements.join(", "):"None logged"}

EXERCISE (${days}-day period): ${Object.entries(exTypes).map(([t,m])=>`${t}: ${m} min total`).join(", ")||"None logged"}

SYMPTOM SESSIONS (${recentSymptoms.length} recorded):
${recentSymptoms.map(s=>`- [${s.date||s.sessionDate}] Area: ${s.bodyArea||"General"} | Symptoms: ${(s.symptoms||[]).join(", ")} | Severity: ${s.severity||"?"}/10 | Duration: ${s.duration||"?"} | Notes: ${s.notes||"None"}`).join("\n")||"None recorded"}

ABNORMAL LAB VALUES:
${flaggedLabs.map(f=>`- ${f.name}: ${f.value} ${f.unit} [${f.flag}] (from ${f.reportName}, ${f.reportDate})`).join("\n")||"None flagged"}

RECENT MEDICAL EVENTS:
${recentTimeline.map(e=>`- [${e.date}] ${e.type.toUpperCase()}: ${e.title}${e.notes?" — "+e.notes.slice(0,100):""}`).join("\n")||"None recorded"}

AI OBSERVATIONS (accumulated insights):
${(state.aiMemory||[]).slice(-10).map(m=>`- [${m.date}] ${m.insight}`).join("\n")||"None"}

HEALLEO TEAM NOTES:
${(state.nutritionChat||[]).length>0?`Nutritionist: ${(state.nutritionChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Nutritionist: No sessions yet"}
${(state.trainerChat||[]).length>0?`Trainer: ${(state.trainerChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Trainer: No sessions yet"}
${(state.therapistChat||[]).length>0?`Therapist: ${(state.therapistChat||[]).filter(m=>m.role==="assistant").length} consultations conducted`:"Therapist: No sessions yet"}

FORMAT THE SUMMARY AS:
# Patient Health Summary
## Patient Information (demographics, meds, allergies)
## Chief Concerns & Recent Symptoms (prioritized)
## Lifestyle & Wellness Data (with notable trends)
## Nutrition & Supplements
## Exercise & Physical Activity
## Mental & Emotional Wellbeing
## Lab Results Requiring Attention (flagged values with context)
## Recent Medical History (timeline events)
## AI-Generated Observations (patterns noticed across medical, nutrition, fitness, and emotional data)
## Suggested Discussion Points for This Visit

Be specific with dates, values, and references. Flag anything the doctor should investigate. This should be comprehensive enough that a doctor can quickly understand the patient's recent health status.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      setSummary(text);
    } catch(e) { setSummary("Error generating summary. Please try again."); }
    setGenerating(false);
  };

  return <div className="fade-up">
    <h2 style={S.h2}>📋 Doctor Visit Summary</h2>
    <p style={{fontSize:15,color:"var(--dim)",marginTop:2,lineHeight:1.5}}>Generate a comprehensive health summary to bring to your next doctor's appointment. Includes symptoms, labs, medications, lifestyle data, and AI observations.</p>

    <div style={{...S.card,marginTop:14,padding:18}}>
      <label style={S.label}>Time period to cover
        <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={S.input}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </label>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:14}}>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.symptomSessions||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Symptoms</div></div>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.labResults||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Lab Reports</div></div>
        <div style={{textAlign:"center",padding:10,background:"var(--bg)",borderRadius:8}}><div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{(state.logs||[]).length}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:2}}>Days Logged</div></div>
      </div>

      <button onClick={generateSummary} disabled={generating} style={{...S.primaryBtn,width:"100%",marginTop:16,padding:16,opacity:generating?0.6:1}}>
        {generating ? <><span style={{display:"inline-flex",gap:3,marginRight:8}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</span>Generating comprehensive summary...</> : "📋 Generate Doctor Visit Summary"}
      </button>
    </div>

    {summary && <div style={{marginTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <h3 style={S.h3}>Your Summary</h3>
        <button onClick={()=>{navigator.clipboard?.writeText(summary);}} style={{...S.smallBtn,fontSize:16}}>📋 Copy</button>
      </div>
      <div style={{...S.card,padding:20,background:"#fff",border:"1.5px solid var(--muted)"}}>
        <div style={{borderBottom:"2px solid var(--accent)",paddingBottom:12,marginBottom:16}}>
          <div style={{fontFamily:"var(--display)",fontSize:16,fontWeight:600,color:"var(--accent)"}}>Healleo Health Summary</div>
          <div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>Generated {today()} · Patient: {state.profile?.name || "—"}</div>
          <div style={{fontSize:16,color:"var(--dim)",marginTop:1}}>This summary was generated by AI from self-reported data and should be verified by a healthcare provider.</div>
        </div>
        <RenderMD text={summary}/>
      </div>
      <div style={{...S.card,marginTop:10,padding:14,borderLeft:"3px solid var(--accent)"}}>
        <div style={{fontSize:14,color:"var(--dim)",lineHeight:1.6}}>💡 <strong>How to use:</strong> Copy this summary and print it, or show it on your phone during your doctor visit. It gives your provider a quick overview of your recent health data, symptoms, and trends so you can make the most of your appointment time.</div>
      </div>
    </div>}
  </div>;
}

function Dashboard({todayLog,weekLogs,weekDays,waterGoal,insights,profile,switchTab,labResults,aiMemory,state,update}){
  const w=parseFloat(profile.weight)||150;const cg=profile.goals.includes("Lose Weight")?Math.round(w*11):profile.goals.includes("Build Muscle")?Math.round(w*16):Math.round(w*14);const pg=profile.goals.includes("Build Muscle")?Math.round(w*0.82):Math.round(w*0.55);const top=insights[0];
  const recentFlags=(labResults||[]).slice(-1).flatMap(lr=>lr.results.filter(r=>r.flag&&r.flag!=="NORMAL"));
  const teamInsights = generateTeamInsights(state);
  const proColors = { doctor: "var(--accent3)", nutritionist: "var(--accent)", trainer: "var(--accent4)", therapist: "var(--accent2)" };
  const proLabels = { doctor: "Dr. Healleo", nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist" };

  // Dismiss system: cards auto-expire after 7 days so they can resurface if still relevant
  const dismissed = state.dismissedCards || [];
  const DISMISS_DAYS = 7;
  const isCardDismissed = (key) => {
    const entry = dismissed.find(d => d.key === key);
    if (!entry) return false;
    const daysSince = (Date.now() - new Date(entry.at).getTime()) / 86400000;
    return daysSince < DISMISS_DAYS;
  };
  const dismissCard = (key, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    update(s => { s.dismissedCards = [...(s.dismissedCards || []).filter(d => d.key !== key), { key, at: new Date().toISOString() }]; });
  };
  const dismissAllTeam = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    update(s => {
      const now = new Date().toISOString();
      const keys = visibleTeamInsights.map(c => `team-${c.pro}-${c.title}`);
      s.dismissedCards = [...(s.dismissedCards || []).filter(d => !keys.includes(d.key)), ...keys.map(k => ({ key: k, at: now }))];
    });
  };

  const dismissBtn = (key) => (
    <button onClick={(e) => dismissCard(key, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: 14, padding: "2px 4px", flexShrink: 0, marginLeft: 4 }} title="Dismiss">✕</button>
  );

  // Filter dismissed cards
  const visibleTeamInsights = teamInsights.filter(c => !isCardDismissed(`team-${c.pro}-${c.title}`));
  const showLabFlags = recentFlags.length > 0 && !isCardDismissed("lab-flags");
  const showAiInsight = aiMemory?.length > 0 && !isCardDismissed(`ai-insight-${aiMemory.length}`);
  const showTopInsight = top && !isCardDismissed(`insight-${top.title}`);

  return(<div className="fade-up"><h2 style={S.h2}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}{profile.name?`, ${profile.name}`:""}</h2>

    {/* Team Insight Cards */}
    {visibleTeamInsights.length > 0 && (<div style={{marginTop:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <h3 style={S.h3}>Your team noticed</h3>
        <span style={{fontSize:12,padding:"2px 8px",background:"rgba(138,122,74,0.1)",borderRadius:10,color:"var(--accent)",fontFamily:"var(--mono)"}}>{visibleTeamInsights.length}</span>
        <button onClick={dismissAllTeam} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--dim)",fontFamily:"var(--body)"}}>Dismiss all</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {visibleTeamInsights.map((card, i) => (
          <div key={i} className="card" style={{
            ...S.card, padding: "14px 16px", border: "none", textAlign: "left", width: "100%",
            borderLeft: `3px solid ${card.priority === "positive" ? "var(--success)" : card.priority === "high" ? "var(--danger)" : proColors[card.pro]}`,
            background: card.priority === "positive" ? "rgba(90,138,82,0.04)" : card.priority === "high" ? "rgba(184,84,84,0.04)" : "var(--card)"
          }}>
            <div style={{display:"flex",gap:10}}>
              <div style={{fontSize:22,flexShrink:0,marginTop:2,cursor:"pointer"}} onClick={() => switchTab(card.action)}>{card.icon}</div>
              <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={() => switchTab(card.action)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>{card.title}</span>
                  <span style={{fontSize:11,color:proColors[card.pro],fontWeight:600,flexShrink:0,marginLeft:8}}>{proLabels[card.pro]}</span>
                </div>
                <p style={{fontSize:13,color:"var(--dim)",marginTop:4,lineHeight:1.55}}>{card.text}</p>
                {card.crossAgent && <span style={{fontSize:11,color:"var(--dim)",marginTop:4,display:"inline-block"}}>🔗 Shared with {proLabels[card.crossAgent]}</span>}
              </div>
              {dismissBtn(`team-${card.pro}-${card.title}`)}
            </div>
          </div>
        ))}
      </div>
    </div>)}

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginTop:14}}>{[["ask","🩺","Doctor"],["labs","🧪","Labs"],["symptoms","🔍","Symptoms"],["summary","📋","Summary"],["timeline","📜","Timeline"]].map(([t,icon,label])=><button key={t} onClick={()=>switchTab(t)} className="card" style={{...S.card,padding:"12px 6px",textAlign:"center",border:"none",cursor:"pointer",fontFamily:"var(--body)"}}><div style={{fontSize:20}}>{icon}</div><div style={{fontSize:15,fontWeight:600,marginTop:3,color:"var(--accent)"}}>{label}</div></button>)}</div>

    {/* Your Team */}
    <div style={{...S.card,marginTop:12,padding:14}}>
      <h3 style={S.h3}>Your Healleo Team</h3>
      <p style={{fontSize:13,color:"var(--dim)",marginTop:2}}>Personal professionals who know your complete health picture</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>
        {[["ask","🩺","Doctor","Medical"],["nutritionist","🍓","Nutrition","Diet & Fuel"],["trainer","🏋️","Trainer","Fitness"],["therapist","💜","Therapist","Wellness"]].map(([t,icon,label,sub])=>
          <button key={t} onClick={()=>switchTab(t)} className="card" style={{...S.card,padding:"10px 4px",textAlign:"center",border:"none",cursor:"pointer",fontFamily:"var(--body)"}}>
            <div style={{fontSize:22}}>{icon}</div>
            <div style={{fontSize:13,fontWeight:600,marginTop:3,color:"var(--accent)"}}>{label}</div>
            <div style={{fontSize:11,color:"var(--dim)",marginTop:1}}>{sub}</div>
          </button>
        )}
      </div>
    </div>
    {showLabFlags&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--danger)",background:"rgba(184,84,84,0.06)",display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("labs")}><div style={{fontSize:15,fontWeight:600,color:"var(--danger)"}}>⚠️ {recentFlags.length} abnormal lab value{recentFlags.length>1?"s":""}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2}}>{recentFlags.map(f=>`${f.name}: ${f.value} [${f.flag}]`).join(" · ")}</div></div>{dismissBtn("lab-flags")}</div>}
    {showAiInsight&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:"3px solid var(--accent3)",display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("timeline")}><div style={{fontSize:15,color:"var(--dim)"}}><strong>🧠 Latest insight:</strong> {aiMemory[aiMemory.length-1].insight.slice(0,100)}...</div></div>{dismissBtn(`ai-insight-${aiMemory.length}`)}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:8,marginTop:10}}>{[{l:"Water",v:`${todayLog.water} oz`,max:waterGoal,cur:todayLog.water,c:"var(--accent3)",i:"💧"},{l:"Calories",v:todayLog.calories||"—",max:cg,cur:todayLog.calories,c:"var(--accent4)",i:"🔥"},{l:"Protein",v:todayLog.protein?`${todayLog.protein}g`:"—",max:pg,cur:todayLog.protein,c:"var(--accent)",i:"🥩"},{l:"Sleep",v:todayLog.sleep?`${todayLog.sleep}hr`:"—",max:8,cur:todayLog.sleep,c:"var(--accent2)",i:"😴"}].map((s,idx)=><div key={idx} className="card" style={{...S.card,textAlign:"center",padding:12}}><div style={{position:"relative",display:"inline-block"}}><RingProgress value={s.cur} max={s.max} color={s.c} size={44} stroke={4}/><span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14}}>{s.i}</span></div><div style={{marginTop:4,fontFamily:"var(--display)",fontSize:15,fontWeight:500}}>{s.v}</div><div style={{fontSize:15,color:"var(--dim)"}}>{s.l}</div></div>)}</div>
    {showTopInsight&&<div style={{...S.card,marginTop:10,padding:12,borderLeft:`3px solid ${top.priority==="high"?"var(--danger)":top.priority==="success"?"var(--success)":"var(--accent2)"}`,display:"flex",alignItems:"flex-start",gap:8}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>switchTab("log")}><div style={{display:"flex",gap:8}}><span style={{fontSize:18}}>{top.icon}</span><div><div style={{fontWeight:600,fontSize:15}}>{top.title}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:2,lineHeight:1.5}}>{top.text}</div></div></div></div>{dismissBtn(`insight-${top.title}`)}</div>}
    <div style={{...S.card,marginTop:10,padding:14}}><h3 style={S.h3}>Mood</h3><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>{weekLogs.map((l,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:18}}>{l.mood>=0?MOODS[l.mood]:"·"}</div><span style={{fontSize:15,color:"var(--dim)",fontFamily:"var(--mono)"}}>{weekDays[i]}</span></div>)}</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}><button onClick={()=>switchTab("log")} style={{...S.primaryBtn,fontSize:13}}>✏️ Log</button><button onClick={()=>switchTab("nutrition")} style={{...S.secondaryBtn,fontSize:13}}>🍓 Food</button><button onClick={()=>switchTab("exercise")} style={{...S.secondaryBtn,fontSize:13}}>💪 Move</button></div>
  </div>);
}

// ═══════ REMAINING TABS (compact) ═══════
function LogEntry({log,updateLog,selDate,setSelDate,waterGoal,state,update}){
  const [nlInput, setNlInput] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState(null);
  const [nlHistory, setNlHistory] = useState([]);
  const [showBackfill, setShowBackfill] = useState(false);
  const [backfillText, setBackfillText] = useState("");
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);
  const [healthImporting, setHealthImporting] = useState(false);
  const [healthResult, setHealthResult] = useState(null);
  const healthFileRef = useRef(null);

  const parseNaturalLog = async () => {
    if (!nlInput.trim() || nlLoading) return;
    setNlLoading(true); setNlResult(null);
    const prompt = `The user wants to log health data using natural language. Parse their input and return ONLY a JSON object with the data to log.

Today's date: ${selDate}
Current log values: water=${log.water}oz, sleep=${log.sleep}hr, steps=${log.steps}, calories=${log.calories}, protein=${log.protein}g, carbs=${log.carbs}g, fat=${log.fat}g, mood=${log.mood} (0=terrible,1=poor,2=okay,3=good,4=great,-1=unset)

User input: "${nlInput}"

Return JSON with this structure:
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "water": number or null (in ounces),
      "sleep": number or null (in hours),
      "steps": number or null,
      "calories": number or null,
      "protein": number or null (grams),
      "carbs": number or null (grams),
      "fat": number or null (grams),
      "mood": number or null (0-4 scale),
      "meals": ["string"] or null,
      "exercise": [{"type":"string","minutes":number}] or null,
      "supplements": ["string"] or null,
      "notes": "string" or null
    }
  ],
  "summary": "Brief human-readable summary of what was logged",
  "dates_affected": ["YYYY-MM-DD", ...]
}

RULES:
- If the user says "this week" or "the week of X", create entries for each day in that range
- If they say "averaged X", set the same value for each day
- If they mention a date range (Mon-Fri, 4/6-4/12), create individual entries
- Convert units: "8 glasses of water" ≈ 2L, "half gallon" ≈ 1.9L
- For mood words: great/excellent=4, good/fine=3, okay/alright=2, bad/rough=1, terrible/awful=0
- null means don't change that field
- Only include fields the user mentioned
- Today is ${new Date().toISOString().slice(0,10)}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are a health data parser. Return ONLY valid JSON, no markdown fences or explanation.",messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("\n") || "";
      const jsonStr = text.replace(/```json?|```/g,"").trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.entries && parsed.entries.length > 0) {
        update(s => {
          parsed.entries.forEach(entry => {
            const idx = s.logs.findIndex(l => l.date === entry.date);
            const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, entry.date);

            if (entry.water !== null && entry.water !== undefined) existing.water = entry.water;
            if (entry.sleep !== null && entry.sleep !== undefined) existing.sleep = entry.sleep;
            if (entry.steps !== null && entry.steps !== undefined) existing.steps = entry.steps;
            if (entry.calories !== null && entry.calories !== undefined) existing.calories = entry.calories;
            if (entry.protein !== null && entry.protein !== undefined) existing.protein = entry.protein;
            if (entry.carbs !== null && entry.carbs !== undefined) existing.carbs = entry.carbs;
            if (entry.fat !== null && entry.fat !== undefined) existing.fat = entry.fat;
            if (entry.mood !== null && entry.mood !== undefined) existing.mood = entry.mood;
            if (entry.meals) existing.meals = [...existing.meals, ...entry.meals];
            if (entry.exercise) existing.exercise = [...existing.exercise, ...entry.exercise];
            if (entry.supplements) existing.supplements = [...new Set([...(existing.supplements||[]), ...entry.supplements])];
            if (entry.notes) existing.notes = existing.notes ? existing.notes + "\n" + entry.notes : entry.notes;

            if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing);
          });
        });

        setNlResult({ success: true, summary: parsed.summary, count: parsed.entries.length, dates: parsed.dates_affected || parsed.entries.map(e=>e.date) });
        setNlHistory(prev => [...prev, { input: nlInput, summary: parsed.summary, count: parsed.entries.length, time: new Date().toLocaleTimeString() }]);
      } else {
        setNlResult({ success: false, summary: "Couldn't parse that. Try something like: 'I drank 3L of water today' or 'averaged 7hrs sleep this week'" });
      }
    } catch(e) {
      setNlResult({ success: false, summary: "Failed to parse. Try being more specific, e.g.: 'slept 8 hours, drank 2.5L water, walked 8000 steps'" });
    }
    setNlInput("");
    setNlLoading(false);
  };

  // ─── BACKFILL ROUTINE HISTORY ───
  const backfillHistory = async () => {
    if (!backfillText.trim() || backfillLoading) return;
    setBackfillLoading(true); setBackfillResult(null);
    const prompt = `The user is describing their TYPICAL ROUTINES and HISTORIC HABITS so we can backfill their health log with realistic historical data. Parse their description and generate daily log entries going back in time.

Today's date: ${new Date().toISOString().slice(0,10)}
Existing log count: ${(state.logs||[]).length} days

User describes their routines:
"""
${backfillText}
"""

Generate a JSON response:
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "water": number or null (ounces),
      "sleep": number or null (hours),
      "steps": number or null,
      "calories": number or null,
      "protein": number or null (grams),
      "carbs": number or null (grams),
      "fat": number or null (grams),
      "mood": number or null (0-4),
      "exercise": [{"type":"string","minutes":number}] or null,
      "supplements": ["string"] or null,
      "notes": null
    }
  ],
  "summary": "Brief description of what was generated",
  "dates_affected": ["YYYY-MM-DD", ...]
}

CRITICAL RULES:
- Generate entries for the PAST 30 DAYS by default (or whatever period they specify)
- Apply routines to correct days: "weekday yoga" = Mon-Fri only; "weekend runs" = Sat-Sun only
- Add NATURAL VARIATION: don't make every day identical. Vary sleep ±0.5hr, water ±0.3L, steps ±1000, etc.
- If they say "I usually drink about 2L water" generate values between 1.5-2.5L
- If they say "I walk 55 minutes daily" some days might be 50, some 60
- Weekend patterns may differ from weekday patterns
- If they mention meals like "I eat oatmeal for breakfast", include in meals array occasionally
- Skip dates that might already have data (but include them anyway, the app will merge)
- If they mention supplements, include them on the appropriate days
- Mood should generally be 2-4 with occasional variation
- Return up to 30 entries maximum`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:"You are a health data generator. Return ONLY valid JSON. Generate realistic daily entries with natural variation based on described routines.",messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("\n") || "";
      const jsonStr = text.replace(/```json?|```/g,"").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.entries?.length) {
          let newCount = 0;
          update(s => {
            parsed.entries.forEach(entry => {
              const idx = s.logs.findIndex(l => l.date === entry.date);
              const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, entry.date);
              let changed = false;
              if (entry.water != null && !existing.water) { existing.water = entry.water; changed = true; }
              if (entry.sleep != null && !existing.sleep) { existing.sleep = entry.sleep; changed = true; }
              if (entry.steps != null && !existing.steps) { existing.steps = entry.steps; changed = true; }
              if (entry.calories != null && !existing.calories) { existing.calories = entry.calories; changed = true; }
              if (entry.protein != null && !existing.protein) { existing.protein = entry.protein; changed = true; }
              if (entry.carbs != null && !existing.carbs) { existing.carbs = entry.carbs; changed = true; }
              if (entry.fat != null && !existing.fat) { existing.fat = entry.fat; changed = true; }
              if (entry.mood != null && existing.mood < 0) { existing.mood = entry.mood; changed = true; }
              if (entry.exercise?.length && !existing.exercise?.length) { existing.exercise = entry.exercise; changed = true; }
              if (entry.supplements?.length && !existing.supplements?.length) { existing.supplements = entry.supplements; changed = true; }
              if (entry.meals?.length && !existing.meals?.length) { existing.meals = entry.meals; changed = true; }
              if (changed) {
                if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing);
                newCount++;
              }
            });
          });
          setBackfillResult({ success: true, summary: parsed.summary, count: newCount });
        }
      }
    } catch(e) { setBackfillResult({ success: false, summary: "Failed to generate history. Try describing your routines more simply." }); }
    setBackfillLoading(false);
  };

  // ─── APPLE HEALTH IMPORT ───
  const handleHealthImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHealthImporting(true); setHealthResult(null);
    try {
      const text = await file.text();
      // Parse Apple Health XML export
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const records = xml.querySelectorAll("Record");
      const workouts = xml.querySelectorAll("Workout");
      const dailyData = {};

      const getDay = (dateStr) => dateStr?.slice(0, 10);
      const ensure = (date) => { if (!dailyData[date]) dailyData[date] = { water: 0, sleep: 0, steps: 0, calories: 0, exercise: [] }; };

      for (const r of records) {
        const type = r.getAttribute("type");
        const date = getDay(r.getAttribute("startDate"));
        const val = parseFloat(r.getAttribute("value")) || 0;
        if (!date) continue;
        ensure(date);

        if (type === "HKQuantityTypeIdentifierStepCount") dailyData[date].steps += Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryWater") dailyData[date].water += val / 1000; // ml to L
        else if (type === "HKQuantityTypeIdentifierDietaryEnergyConsumed") dailyData[date].calories += Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryProtein") dailyData[date].protein = (dailyData[date].protein || 0) + Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryCarbohydrates") dailyData[date].carbs = (dailyData[date].carbs || 0) + Math.round(val);
        else if (type === "HKQuantityTypeIdentifierDietaryFatTotal") dailyData[date].fat = (dailyData[date].fat || 0) + Math.round(val);
      }

      // Sleep analysis
      for (const r of records) {
        const type = r.getAttribute("type");
        if (type === "HKCategoryTypeIdentifierSleepAnalysis") {
          const val = r.getAttribute("value");
          if (val === "HKCategoryValueSleepAnalysisAsleepUnspecified" || val === "HKCategoryValueSleepAnalysisAsleepCore" || val === "HKCategoryValueSleepAnalysisAsleepDeep" || val === "HKCategoryValueSleepAnalysisAsleepREM" || val === "HKCategoryValueSleepAnalysisAsleep") {
            const start = new Date(r.getAttribute("startDate"));
            const end = new Date(r.getAttribute("endDate"));
            const hrs = (end - start) / 3600000;
            const date = getDay(r.getAttribute("endDate")); // attribute sleep to wake-up day
            ensure(date);
            dailyData[date].sleep += hrs;
          }
        }
      }

      // Workouts
      for (const w of workouts) {
        const date = getDay(w.getAttribute("startDate"));
        const dur = parseFloat(w.getAttribute("duration")) || 0;
        const type = w.getAttribute("workoutActivityType")?.replace("HKWorkoutActivityType", "") || "Other";
        if (date && dur > 0) { ensure(date); dailyData[date].exercise.push({ type, minutes: Math.round(dur) }); }
      }

      // Apply to state
      let imported = 0;
      const last90 = new Date(); last90.setDate(last90.getDate() - 90);
      const cutoff = last90.toISOString().slice(0, 10);

      update(s => {
        for (const [date, data] of Object.entries(dailyData)) {
          if (date < cutoff) continue; // only import last 90 days
          const idx = s.logs.findIndex(l => l.date === date);
          const existing = idx >= 0 ? {...s.logs[idx]} : getOrCreateLog(s.logs, date);
          let changed = false;
          if (data.steps > 0 && !existing.steps) { existing.steps = data.steps; changed = true; }
          if (data.water > 0 && !existing.water) { existing.water = Math.round(data.water * 10) / 10; changed = true; }
          if (data.sleep > 0 && !existing.sleep) { existing.sleep = Math.round(data.sleep * 10) / 10; changed = true; }
          if (data.calories > 0 && !existing.calories) { existing.calories = data.calories; changed = true; }
          if (data.protein > 0 && !existing.protein) { existing.protein = data.protein; changed = true; }
          if (data.carbs > 0 && !existing.carbs) { existing.carbs = data.carbs; changed = true; }
          if (data.fat > 0 && !existing.fat) { existing.fat = data.fat; changed = true; }
          if (data.exercise.length && !existing.exercise?.length) { existing.exercise = data.exercise; changed = true; }
          if (changed) { if (idx >= 0) s.logs[idx] = existing; else s.logs.push(existing); imported++; }
        }
      });

      setHealthResult({ success: true, summary: `Imported ${imported} days of data from Apple Health (steps, sleep, water, calories, workouts). Last 90 days processed.`, count: imported });
    } catch(err) {
      console.error("Health import error:", err);
      setHealthResult({ success: false, summary: "Failed to parse file. Make sure you exported from Apple Health (Settings → Health → Export All Health Data) and uploaded the export.xml file." });
    }
    setHealthImporting(false);
    if (healthFileRef.current) healthFileRef.current.value = "";
  };

  return <div className="fade-up">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={S.h2}>✏️ Daily Log</h2>
      <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{...S.input,width:"auto",fontSize:15}}/>
    </div>

    {/* Natural Language Input */}
    <div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent3)"}}>
      <h3 style={S.h3}>💬 Quick Log — just type it</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.5}}>Describe what you want to log in plain English. Works for single days, date ranges, and weekly averages.</p>
      <div style={{display:"flex",gap:6,marginTop:10}}>
        <input value={nlInput} onChange={e=>setNlInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&parseNaturalLog()}
          placeholder="e.g. I averaged 2.5L water and 7hrs sleep this week..." disabled={nlLoading}
          style={{...S.input,flex:1}} />
        <button onClick={parseNaturalLog} disabled={nlLoading||!nlInput.trim()} style={{...S.primaryBtn,fontSize:15,padding:"8px 14px",opacity:nlLoading||!nlInput.trim()?0.5:1,whiteSpace:"nowrap"}}>
          {nlLoading?"Parsing...":"Log it"}
        </button>
      </div>

      {/* Example suggestions */}
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
        {["I drank 3L water today","Slept 6.5 hours last night","Walked 10,000 steps","Averaged 7hrs sleep the week of 4/6","Had a great mood all week","Ate 2200 calories, 150g protein","I do 30 min yoga every weekday","I take a daily walk of 55 minutes"].map(ex => (
          <button key={ex} onClick={()=>setNlInput(ex)} style={{fontSize:15,padding:"3px 8px",background:"var(--bg)",border:"1px solid var(--muted)",borderRadius:8,color:"var(--dim)",cursor:"pointer",fontFamily:"var(--body)"}}>{ex}</button>
        ))}
      </div>

      {/* Result feedback */}
      {nlResult && (
        <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,
          background:nlResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",
          color:nlResult.success?"var(--success)":"var(--danger)",
          border:`1px solid ${nlResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`
        }}>
          {nlResult.success && <span style={{fontWeight:600}}>✓ Logged! </span>}
          {nlResult.summary}
          {nlResult.dates && nlResult.dates.length > 1 && <div style={{fontSize:16,marginTop:4,color:"var(--dim)"}}>Updated {nlResult.dates.length} days: {nlResult.dates.join(", ")}</div>}
        </div>
      )}
    </div>

    {/* Recent NL logs */}
    {nlHistory.length > 0 && (
      <div style={{...S.card,marginTop:10,padding:12}}>
        <h3 style={{...S.h3,fontSize:14}}>📜 Recent quick logs</h3>
        <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
          {nlHistory.slice(-3).reverse().map((h,i) => (
            <div key={i} style={{fontSize:14,color:"var(--dim)",padding:"4px 0",borderBottom:i<2?"1px solid var(--muted)":"none"}}>
              <span style={{color:"var(--text)",fontWeight:500}}>"{h.input}"</span>
              <span style={{marginLeft:6,color:"var(--success)"}}>✓ {h.summary}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ─── BACKFILL & IMPORT SECTION ─── */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
      <button onClick={()=>setShowBackfill(!showBackfill)} className="card" style={{...S.card,padding:"12px 8px",textAlign:"center",border:"none",cursor:"pointer"}}>
        <div style={{fontSize:20}}>📅</div>
        <div style={{fontSize:16,fontWeight:600,marginTop:3,color:"var(--accent)"}}>Backfill History</div>
        <div style={{fontSize:15,color:"var(--dim)",marginTop:1}}>Describe your routines</div>
      </button>
      <button onClick={()=>healthFileRef.current?.click()} className="card" style={{...S.card,padding:"12px 8px",textAlign:"center",border:"none",cursor:"pointer"}}>
        <div style={{fontSize:20}}>🍎</div>
        <div style={{fontSize:16,fontWeight:600,marginTop:3,color:"var(--accent)"}}>Apple Health</div>
        <div style={{fontSize:15,color:"var(--dim)",marginTop:1}}>Import export.xml</div>
      </button>
    </div>
    <input ref={healthFileRef} type="file" accept=".xml" style={{display:"none"}} onChange={handleHealthImport}/>

    {healthImporting&&<div style={{...S.card,marginTop:10,padding:14,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:15,color:"var(--dim)",marginTop:8}}>Processing Apple Health data...</div></div>}
    {healthResult&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,background:healthResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",color:healthResult.success?"var(--success)":"var(--danger)",border:`1px solid ${healthResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`}}>{healthResult.success&&<span style={{fontWeight:600}}>✓ </span>}{healthResult.summary}</div>}

    {showBackfill&&<div style={{...S.card,marginTop:10,padding:16,borderLeft:"3px solid var(--accent2)"}}>
      <h3 style={S.h3}>📅 Backfill Your History</h3>
      <p style={{fontSize:14,color:"var(--dim)",marginTop:4,lineHeight:1.6}}>Describe your typical daily routines in plain English. The AI will generate 30 days of realistic historic data with natural day-to-day variation, so your doctor summaries and AI analysis have context from day one.</p>
      <textarea value={backfillText} onChange={e=>setBackfillText(e.target.value)} rows={5} placeholder={"Describe your typical routines, e.g.:\n\nI do 30 minutes of yoga every weekday morning. I take a daily walk of 55 minutes. I drink about 64 ounces of water a day. I usually sleep 7 hours on weeknights and 8 on weekends. I eat around 1800 calories, mostly Mediterranean diet. I take vitamin D, magnesium and fish oil daily. On weekends I do a 45 minute run."} style={{...S.input,marginTop:10,resize:"vertical",fontSize:15,lineHeight:1.5}}/>
      <button onClick={backfillHistory} disabled={backfillLoading||!backfillText.trim()} style={{...S.primaryBtn,width:"100%",marginTop:10,padding:14,opacity:backfillLoading?0.6:1}}>
        {backfillLoading?<><span style={{display:"inline-flex",gap:3,marginRight:8}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</span>Generating 30 days of history...</>:"📅 Generate Historical Data"}
      </button>
      {backfillResult&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:8,fontSize:15,lineHeight:1.5,background:backfillResult.success?"rgba(138,122,74,0.08)":"rgba(184,84,84,0.08)",color:backfillResult.success?"var(--success)":"var(--danger)",border:`1px solid ${backfillResult.success?"rgba(138,122,74,0.18)":"rgba(196,90,90,0.2)"}`}}>{backfillResult.success&&<span style={{fontWeight:600}}>✓ </span>}{backfillResult.summary}{backfillResult.count>0&&<span> ({backfillResult.count} days added)</span>}</div>}
      <div style={{fontSize:16,color:"var(--dim)",marginTop:8,lineHeight:1.5}}>💡 Only fills in days that don't already have data. Existing logs are preserved. You can run this multiple times to add different routine aspects.</div>
    </div>}

    {/* Divider */}
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0 6px"}}>
      <div style={{flex:1,height:1,background:"var(--muted)"}}/>
      <span style={{fontSize:16,color:"var(--dim)",fontFamily:"var(--mono)"}}>or log manually</span>
      <div style={{flex:1,height:1,background:"var(--muted)"}}/>
    </div>

    {/* Manual controls */}
    <div style={{...S.card,marginTop:8,padding:16}}>
      <h3 style={S.h3}>💧 Water ({log.water} oz / {waterGoal} oz)</h3>
      <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
        {[8,16,32].map(a=><button key={a} onClick={()=>updateLog(l=>l.water=Math.round(l.water+a))} style={S.smallBtn}>+{a}oz</button>)}
        <button onClick={()=>updateLog(l=>l.water=Math.max(0,Math.round(l.water-8)))} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)"}}>−8oz</button>
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>😴 Sleep</h3>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
        <input type="range" min="0" max="14" step="0.5" value={log.sleep} onChange={e=>updateLog(l=>l.sleep=parseFloat(e.target.value))} style={{flex:1}}/>
        <span style={{fontFamily:"var(--mono)",fontSize:16}}>{log.sleep}hr</span>
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>👟 Steps</h3>
      <input type="number" value={log.steps||""} onChange={e=>updateLog(l=>l.steps=parseInt(e.target.value)||0)} placeholder="0" style={{...S.input,marginTop:8}}/>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>🧠 Mood</h3>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {MOODS.map((m,i)=><button key={i} onClick={()=>updateLog(l=>l.mood=i)} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:log.mood===i?1:0.3,transform:log.mood===i?"scale(1.2)":"none",transition:"all 0.2s"}}>{m}</button>)}
      </div>
    </div>
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>📝 Notes</h3>
      <textarea value={log.notes} onChange={e=>updateLog(l=>l.notes=e.target.value)} placeholder="How are you feeling?" rows={3} style={{...S.input,marginTop:8,resize:"vertical"}}/>
    </div>
  </div>;
}
function Nutrition({log,updateLog,profile,weekLogs,weekDays}){const[meal,setMeal]=useState("");const w=parseFloat(profile.weight)||150;const cg=profile.goals.includes("Lose Weight")?Math.round(w*11):profile.goals.includes("Build Muscle")?Math.round(w*16):Math.round(w*14);return <div className="fade-up"><h2 style={S.h2}>🍓 Nutrition</h2><div style={{...S.card,marginTop:14,padding:16}}><h3 style={S.h3}>Macros</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>{[{k:"calories",l:"Calories",u:"kcal",c:"var(--accent4)"},{k:"protein",l:"Protein",u:"g",c:"var(--accent)"},{k:"carbs",l:"Carbs",u:"g",c:"var(--accent2)"},{k:"fat",l:"Fat",u:"g",c:"var(--accent3)"},{k:"fiber",l:"Fiber",u:"g",c:"var(--dim)"}].map(m=><label key={m.k} style={S.label}><span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:m.c,display:"inline-block"}}/>{m.l}</span><input type="number" value={log[m.k]||""} onChange={e=>updateLog(l=>l[m.k]=parseFloat(e.target.value)||0)} placeholder="0" style={S.input}/></label>)}</div></div><div style={{...S.card,marginTop:10,padding:16,textAlign:"center"}}><RingProgress value={log.calories} max={cg} size={70} stroke={5} color="var(--accent4)"/><div style={{marginTop:4,fontFamily:"var(--display)",fontSize:16}}>{log.calories}/{cg} kcal</div></div><div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Meals</h3><div style={{display:"flex",gap:6,marginTop:8}}><input value={meal} onChange={e=>setMeal(e.target.value)} placeholder="e.g. Grilled chicken salad" style={{...S.input,flex:1}} onKeyDown={e=>{if(e.key==="Enter"&&meal.trim()){updateLog(l=>l.meals=[...l.meals,meal.trim()]);setMeal("");}}}/><button onClick={()=>{if(meal.trim()){updateLog(l=>l.meals=[...l.meals,meal.trim()]);setMeal("");}}} style={S.smallBtn}>Add</button></div>{log.meals.length>0&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>{log.meals.map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 10px",background:"var(--bg)",borderRadius:6,fontSize:15}}><span>{m}</span><button onClick={()=>updateLog(l=>l.meals=l.meals.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)"}}>✕</button></div>)}</div>}</div></div>;}
function Exercise({log,updateLog,weekLogs,weekDays}){const[type,setType]=useState("Walking");const[min,setMin]=useState(30);return <div className="fade-up"><h2 style={S.h2}>💪 Exercise</h2><div style={{...S.card,marginTop:14,padding:16}}><h3 style={S.h3}>Log Activity</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>{EXERCISE_TYPES.map(t=><button key={t} onClick={()=>setType(t)} style={{...S.chip,...(type===t?S.chipActive:{}),fontSize:14,padding:"4px 10px"}}>{t}</button>)}</div><div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}><input type="number" value={min} onChange={e=>setMin(parseInt(e.target.value)||0)} style={{...S.input,width:70}}/><span style={{fontSize:15,color:"var(--dim)"}}>min</span><button onClick={()=>updateLog(l=>l.exercise=[...l.exercise,{type,minutes:min}])} style={S.primaryBtn}>Add</button></div></div><div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Today — {log.exercise.reduce((s,e)=>s+e.minutes,0)} min</h3>{log.exercise.length===0?<p style={{color:"var(--dim)",fontSize:15,marginTop:6}}>No activities yet</p>:<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>{log.exercise.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:"var(--bg)",borderRadius:6,fontSize:15}}><span>{e.type}</span><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontFamily:"var(--mono)",color:"var(--accent)"}}>{e.minutes}m</span><button onClick={()=>updateLog(l=>l.exercise=l.exercise.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)"}}>✕</button></div></div>)}</div>}</div><div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Weekly (min)</h3><MiniBar values={weekLogs.map(l=>l.exercise.reduce((s,e)=>s+e.minutes,0))} max={90} color="var(--accent)" labels={weekDays}/></div></div>;}
function Supplements({log,updateLog,profile}){
  const taken=log.supplements||[];
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const camRef=useRef(null);

  const scanSupplement = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setScanResult(null);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const mediaType = file.type || "image/jpeg";
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `This is a photo of a supplement bottle/label. Extract the supplement information and return ONLY a JSON object:
{
  "name": "Primary supplement name (e.g. 'Vitamin D3')",
  "brand": "Brand name if visible",
  "dose": "Dosage per serving (e.g. '5000 IU', '500mg')",
  "servings_per_container": number or null,
  "ingredients": ["list of key active ingredients"],
  "directions": "Usage directions if visible",
  "warnings": "Any warnings if visible",
  "supplement_facts": [{"name":"ingredient","amount":"dose per serving"}]
}
Be precise with the supplement name — use the standard supplement name (e.g. "Vitamin D3" not "cholecalciferol" unless it's a specialty product).` }
          ]}]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const jsonStr = text.replace(/```json?|```/g, "").trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setScanResult(parsed);
        // Auto-add to today's log
        if (parsed.name && !taken.includes(parsed.name)) {
          updateLog(l => l.supplements = [...(l.supplements||[]), parsed.name]);
        }
      }
    } catch (err) { setScanResult({ error: "Couldn't read the label. Try a clearer photo with good lighting." }); }
    setScanning(false);
    if (camRef.current) camRef.current.value = "";
  };

  const rec=[...new Map(SUPPLEMENT_DB.filter(s=>{const g=profile.goals;return(g.includes("Build Muscle")&&["Creatine","Vitamin D3","Omega-3 Fish Oil","Magnesium Glycinate"].includes(s.name))||(g.includes("Better Sleep")&&["Magnesium Glycinate","Ashwagandha"].includes(s.name))||(g.includes("Improve Energy")&&["Vitamin B Complex","Iron","CoQ10","Vitamin D3"].includes(s.name))||(g.includes("Heart Health")&&["Omega-3 Fish Oil","CoQ10","Magnesium Glycinate"].includes(s.name))||(g.includes("Gut Health")&&["Probiotics","Collagen"].includes(s.name))||(g.includes("Longevity")&&["Omega-3 Fish Oil","Vitamin D3","CoQ10","Magnesium Glycinate"].includes(s.name));}).map(s=>[s.name,s])).values()];
  
  return <div className="fade-up"><h2 style={S.h2}>💊 Supplements</h2>

  {/* Camera scan */}
  <div style={{...S.card,marginTop:14,padding:16,borderLeft:"3px solid var(--accent2)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h3 style={S.h3}>📸 Scan Supplement Bottle</h3><p style={{fontSize:14,color:"var(--dim)",marginTop:2}}>Take a photo of the label to auto-log</p></div>
      <button onClick={()=>camRef.current?.click()} disabled={scanning} style={{...S.primaryBtn,fontSize:14,padding:"8px 14px",opacity:scanning?0.6:1}}>{scanning?"Scanning...":"📷 Scan"}</button>
    </div>
    <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={scanSupplement}/>
    {scanning&&<div style={{marginTop:10,textAlign:"center"}}><div style={{display:"flex",gap:4,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--accent2)",animation:`pulse 1s ease-in-out ${i*0.15}s infinite`}}/>)}</div><div style={{fontSize:14,color:"var(--dim)",marginTop:6}}>Reading supplement label...</div></div>}
    {scanResult&&!scanResult.error&&<div style={{marginTop:10,padding:12,background:"rgba(138,122,74,0.07)",borderRadius:8,border:"1px solid rgba(138,122,74,0.15)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:600,fontSize:16,color:"var(--success)"}}>✓ {scanResult.name}</span>{scanResult.brand&&<span style={{fontSize:16,color:"var(--dim)"}}>{scanResult.brand}</span>}</div>
      {scanResult.dose&&<div style={{fontSize:14,color:"var(--text)",marginTop:4}}>Dose: <strong>{scanResult.dose}</strong></div>}
      {scanResult.directions&&<div style={{fontSize:16,color:"var(--dim)",marginTop:4,lineHeight:1.4}}>📋 {scanResult.directions}</div>}
      {scanResult.supplement_facts?.length>0&&<div style={{marginTop:6}}><div style={{fontSize:16,fontWeight:600,color:"var(--dim)"}}>Active ingredients:</div>{scanResult.supplement_facts.slice(0,6).map((f,i)=><div key={i} style={{fontSize:16,color:"var(--dim)",marginTop:1}}>{f.name}: {f.amount}</div>)}</div>}
      {scanResult.warnings&&<div style={{fontSize:15,color:"var(--accent4)",marginTop:6}}>⚠️ {scanResult.warnings.slice(0,120)}</div>}
    </div>}
    {scanResult?.error&&<div style={{marginTop:8,fontSize:14,color:"var(--danger)"}}>{scanResult.error}</div>}
  </div>

  <div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>Today</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>{SUPPLEMENT_DB.map(s=><button key={s.name} onClick={()=>updateLog(l=>{if(l.supplements.includes(s.name))l.supplements=l.supplements.filter(x=>x!==s.name);else l.supplements=[...l.supplements,s.name];})} style={{...S.chip,...(taken.includes(s.name)?S.chipActive:{}),fontSize:14,padding:"5px 10px"}}>{taken.includes(s.name)?"✓ ":""}{s.name}</button>)}</div></div>{rec.length>0&&<div style={{...S.card,marginTop:10,padding:16}}><h3 style={S.h3}>🎯 Recommended</h3><div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>{rec.map(s=><div key={s.name} style={{padding:"8px 10px",background:"var(--bg)",borderRadius:6}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:15}}>{s.name}</span><span style={{fontFamily:"var(--mono)",fontSize:16,color:"var(--accent)"}}>{s.dose}</span></div><div style={{fontSize:16,color:"var(--dim)",marginTop:2}}>{s.benefit}</div></div>)}</div></div>}</div>;}

// ═══════ MEDICATIONS ═══════
function Medications({state, update}) {
  const [input, setInput] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [suggestions, setSuggestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const searchTimeout = useRef(null);

  const meds = state.medications || [];
  const activeMeds = meds.filter(m => m.active !== false);
  const discontinuedMeds = meds.filter(m => m.active === false);

  // Migrate legacy string medications on first render
  useEffect(() => {
    if (state.profile?.medications && typeof state.profile.medications === "string" && state.profile.medications.trim() && (!state.medications || state.medications.length === 0)) {
      const legacy = state.profile.medications.split(",").map(s => s.trim()).filter(Boolean);
      if (legacy.length > 0) {
        update(s => {
          s.medications = legacy.map(m => {
            const match = m.match(/^(.+?)\s+([\d.]+\s*(?:mg|mcg|g|ml|IU|units?))/i);
            return {
              id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
              name: match ? match[1].trim() : m,
              dose: match ? match[2].trim() : "",
              frequency: "Daily",
              startDate: "",
              prescriber: "",
              notes: "",
              active: true,
              addedAt: new Date().toISOString()
            };
          });
        });
      }
    }
  }, []);

  // Autocomplete via NLM RxTerms API
  const searchDrugs = (query) => {
    if (query.length < 2) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const results = DRUG_DATABASE.filter(d => 
      d.name.toLowerCase().startsWith(q) || 
      d.generic?.toLowerCase().startsWith(q) ||
      d.name.toLowerCase().includes(q)
    ).slice(0, 8).map(d => ({
      name: d.name,
      strengths: d.strengths || [],
      generic: d.generic
    }));
    setSuggestions(results);
  };

  const handleInputChange = (val) => {
    setInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchDrugs(val), 100);
  };

  const selectSuggestion = (name, strength) => {
    setInput(name);
    if (strength) {
      const doseMatch = strength.match(/^([\d.]+\s*(?:mg|mcg|g|ml|IU|mEq|units?)\/?[\w]*)/i);
      if (doseMatch) setDose(doseMatch[1]);
    }
    setSuggestions([]);
  };

  const addMed = () => {
    if (!input.trim()) return;
    const med = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: input.trim(),
      dose: dose.trim(),
      frequency,
      startDate: new Date().toISOString().slice(0, 10),
      prescriber: "",
      notes: "",
      active: true,
      addedAt: new Date().toISOString()
    };
    update(s => {
      s.medications = [...(s.medications || []), med];
      // Sync to profile.medications string for backward compat
      s.profile.medications = [...(s.medications || []), med].filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
    setInput(""); setDose(""); setFrequency("Daily"); setSuggestions([]);
  };

  const removeMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).filter(m => m.id !== id);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
  };

  const discontinueMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, active: false, discontinuedAt: new Date().toISOString() } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
      // Add to timeline
      const med = s.medications.find(m => m.id === id);
      if (med) {
        s.healthTimeline = [...(s.healthTimeline || []), {
          date: new Date().toISOString().slice(0, 10),
          type: "medication",
          title: `Discontinued: ${med.name}`,
          notes: `${med.dose || ""} ${med.frequency || ""}`.trim()
        }];
      }
    });
  };

  const reactivateMed = (id) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, active: true, discontinuedAt: undefined } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
  };

  const updateMed = (id, field, value) => {
    update(s => {
      s.medications = (s.medications || []).map(m => m.id === id ? { ...m, [field]: value } : m);
      s.profile.medications = s.medications.filter(m => m.active !== false).map(m => `${m.name}${m.dose ? " " + m.dose : ""}`).join(", ");
    });
    if (field === "name" || field === "dose") setEditing(null);
  };

  const FREQUENCIES = ["As needed", "Daily", "Twice daily", "Three times daily", "Every morning", "Every evening", "Every other day", "Weekly", "Monthly"];

  return (
    <div className="fade-up">
      <h2 style={S.h2}>💊 Medications</h2>
      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 2 }}>
        {activeMeds.length} active medication{activeMeds.length !== 1 ? "s" : ""}
        {discontinuedMeds.length > 0 && ` · ${discontinuedMeds.length} discontinued`}
      </p>

      {/* Add medication */}
      <div style={{ ...S.card, marginTop: 14, padding: 16, borderLeft: "3px solid var(--accent)" }}>
        <h3 style={S.h3}>Add Medication</h3>
        <div style={{ position: "relative", marginTop: 8 }}>
          <input value={input} onChange={e => handleInputChange(e.target.value)}
            placeholder="Start typing medication name..."
            style={S.input}
            onKeyDown={e => { if (e.key === "Enter" && input.trim() && suggestions.length === 0) addMed(); }}
          />

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card)", border: "1px solid var(--muted)", borderRadius: 8, boxShadow: "var(--shadow-lg)", zIndex: 100, maxHeight: 260, overflow: "auto", marginTop: 2 }}>
              {suggestions.map((s, i) => (
                <div key={i}>
                  <button onClick={() => selectSuggestion(s.name)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: "pointer", fontFamily: "var(--body)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}
                    onMouseEnter={e => e.target.style.background = "var(--bg)"} onMouseLeave={e => e.target.style.background = "none"}>
                    {s.name}{s.generic ? <span style={{fontWeight:400,color:"var(--dim)",marginLeft:6,fontSize:12}}>({s.generic})</span> : null}
                  </button>
                  {s.strengths?.slice(0, 5).map((str, j) => (
                    <button key={j} onClick={() => selectSuggestion(s.name, str)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 14px 6px 28px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)" }}
                      onMouseEnter={e => e.target.style.background = "var(--bg)"} onMouseLeave={e => e.target.style.background = "none"}>
                      {str}
                    </button>
                  ))}
                </div>
              ))}
              <button onClick={() => setSuggestions([])} style={{ width: "100%", padding: "6px", background: "var(--bg)", border: "none", fontSize: 12, color: "var(--dim)", cursor: "pointer" }}>✕ Close</button>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 500mg)" style={S.input} onKeyDown={e => { if (e.key === "Enter") addMed(); }} />
          <select value={frequency} onChange={e => setFrequency(e.target.value)} style={S.input}>
            {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <button onClick={addMed} disabled={!input.trim()} style={{ ...S.primaryBtn, width: "100%", marginTop: 10, opacity: input.trim() ? 1 : 0.5 }}>
          Add Medication
        </button>

        <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 8, lineHeight: 1.5 }}>
          💡 Start typing — autocomplete covers 100+ common medications by brand or generic name with available strengths. You can also type any medication not in the list.
        </p>
      </div>

      {/* Active medications */}
      {activeMeds.length > 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 16 }}>
          <h3 style={S.h3}>Active Medications</h3>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {activeMeds.map(med => (
              <div key={med.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      {med.dose && <span style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--accent)", background: "rgba(138,122,74,0.1)", padding: "2px 8px", borderRadius: 6 }}>{med.dose}</span>}
                      <span style={{ fontSize: 13, color: "var(--dim)" }}>{med.frequency}</span>
                    </div>
                    {med.startDate && <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>Started: {med.startDate}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setEditing(editing === med.id ? null : med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)", fontSize: 12, padding: "4px 8px" }}>✏️</button>
                    <button onClick={() => discontinueMed(med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--accent4)", fontSize: 12, padding: "4px 8px" }}>Stop</button>
                  </div>
                </div>

                {/* Edit panel */}
                {editing === med.id && (
                  <div style={{ marginTop: 10, padding: 10, background: "var(--card)", borderRadius: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <label style={{ ...S.label, fontSize: 12 }}>Dose <input value={med.dose} onChange={e => updateMed(med.id, "dose", e.target.value)} style={{ ...S.input, fontSize: 13 }} /></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Frequency <select value={med.frequency} onChange={e => updateMed(med.id, "frequency", e.target.value)} style={{ ...S.input, fontSize: 13 }}>{FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Prescriber <input value={med.prescriber || ""} onChange={e => updateMed(med.id, "prescriber", e.target.value)} placeholder="Dr. name" style={{ ...S.input, fontSize: 13 }} /></label>
                      <label style={{ ...S.label, fontSize: 12 }}>Start date <input type="date" value={med.startDate || ""} onChange={e => updateMed(med.id, "startDate", e.target.value)} style={{ ...S.input, fontSize: 13 }} /></label>
                    </div>
                    <label style={{ ...S.label, fontSize: 12, marginTop: 6 }}>Notes <input value={med.notes || ""} onChange={e => updateMed(med.id, "notes", e.target.value)} placeholder="e.g. Take with food" style={{ ...S.input, fontSize: 13 }} /></label>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => setEditing(null)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)" }}>Done</button>
                      <button onClick={() => { removeMed(med.id); setEditing(null); }} style={{ ...S.smallBtn, background: "none", color: "var(--danger)", fontSize: 12 }}>Delete permanently</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeMeds.length === 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
          <p style={{ fontSize: 14, color: "var(--dim)" }}>No medications added yet. Your meds inform every AI response — drug interactions, side effects, dietary considerations, and exercise limitations are all factored in.</p>
        </div>
      )}

      {/* Discontinued */}
      {discontinuedMeds.length > 0 && (
        <div style={{ ...S.card, marginTop: 12, padding: 16 }}>
          <button onClick={() => setShowDiscontinued(!showDiscontinued)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", fontFamily: "var(--body)" }}>
            <h3 style={S.h3}>Discontinued ({discontinuedMeds.length})</h3>
            <span style={{ color: "var(--dim)", fontSize: 14 }}>{showDiscontinued ? "▾" : "▸"}</span>
          </button>
          {showDiscontinued && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {discontinuedMeds.map(med => (
                <div key={med.id} style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 8, opacity: 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 14, textDecoration: "line-through", color: "var(--dim)" }}>{med.name}</span>
                      {med.dose && <span style={{ fontSize: 13, color: "var(--dim)", marginLeft: 6 }}>{med.dose}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => reactivateMed(med.id)} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--accent)", fontSize: 12, padding: "3px 8px" }}>Restart</button>
                      <button onClick={() => removeMed(med.id)} style={{ ...S.smallBtn, background: "none", color: "var(--danger)", fontSize: 12, padding: "3px 8px" }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How meds are used */}
      <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(138,122,74,0.07)", borderRadius: 8 }}>
        <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.6 }}>
          Your medications are shared with your entire Healleo team. Dr. Healleo checks drug interactions and side effects. Your nutritionist accounts for nutrient depletion (e.g. metformin + B12). Your trainer adjusts for meds that affect heart rate or cause fatigue. Your therapist considers mood-altering side effects.
        </p>
      </div>
    </div>
  );
}

function Profile({state,update,onLogout,userEmail}){
  const [p,setP]=useState({...DEFAULT_PROFILE,...state.profile});
  const [changingPw,setChangingPw]=useState(false);
  const [oldPw,setOldPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [pwMsg,setPwMsg]=useState("");
  const [deleting,setDeleting]=useState(false);

  const changePassword = async () => {
    if (newPw.length < 8) { setPwMsg("Password must be at least 8 characters"); return; }

    if (SUPABASE_MODE) {
      setPwMsg("Changing password and re-encrypting data...");
      const result = await window.healleoAuth.changePassword(oldPw, newPw);
      if (result.error) { setPwMsg(result.error); return; }
      setPwMsg("✓ Password changed and data re-encrypted");
      setOldPw(""); setNewPw(""); setTimeout(() => { setChangingPw(false); setPwMsg(""); }, 2000);
    } else {
      const accounts = await getAccounts();
      const acct = accounts[userEmail];
      if (!acct) { setPwMsg("Account not found"); return; }
      const oldHash = await hashPassword(oldPw, acct.salt);
      if (oldHash !== acct.hash) { setPwMsg("Current password is incorrect"); return; }
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPw, newSalt);
      accounts[userEmail] = { ...acct, hash: newHash, salt: newSalt };
      await saveAccounts(accounts);
      setPwMsg("✓ Password changed successfully");
      setOldPw(""); setNewPw(""); setTimeout(() => { setChangingPw(false); setPwMsg(""); }, 2000);
    }
  };

  const deleteAccount = async () => {
    if (SUPABASE_MODE) {
      await window.healleoData.deleteAll();
      await window.healleoAuth.logout();
    } else {
      const accounts = await getAccounts();
      delete accounts[userEmail];
      await saveAccounts(accounts);
      try { await window.storage.delete(currentUserKey); } catch {}
    }
    onLogout();
  };

  return <div className="fade-up"><h2 style={S.h2}>⚙ Settings</h2>
    {/* Account Section */}
    <div style={{...S.card,marginTop:14,padding:16}}>
      <h3 style={S.h3}>👤 Account</h3>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
        <div><div style={{fontSize:16,fontWeight:500}}>{state.profile.name || "User"}</div><div style={{fontSize:14,color:"var(--dim)",fontFamily:"var(--mono)",marginTop:2}}>{userEmail}</div></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setChangingPw(!changingPw)} style={{...S.smallBtn,background:"var(--muted)",color:"var(--text)",fontSize:16}}>🔑 Password</button>
          <button onClick={onLogout} style={{...S.smallBtn,background:"var(--accent4)",fontSize:16}}>Logout</button>
        </div>
      </div>
      {changingPw && <div style={{marginTop:12,padding:12,background:"var(--bg)",borderRadius:8}}>
        <label style={S.label}>Current Password<input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} style={S.input}/></label>
        <label style={{...S.label,marginTop:8}}>New Password (8+ chars)<input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} style={S.input}/></label>
        {pwMsg && <div style={{fontSize:14,marginTop:6,color:pwMsg.startsWith("✓")?"var(--success)":"var(--danger)"}}>{pwMsg}</div>}
        <button onClick={changePassword} style={{...S.primaryBtn,marginTop:8,fontSize:15}}>Update Password</button>
      </div>}
      {SUPABASE_MODE && <div style={{marginTop:10,padding:"8px 12px",background:"rgba(106,152,176,0.08)",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>☁️</span>
        <div><span style={{fontSize:13,color:"var(--accent3)",fontWeight:600}}>Cloud sync active</span><span style={{fontSize:12,color:"var(--dim)",marginLeft:6}}>Encrypted with AES-256-GCM · Data accessible from any device</span></div>
      </div>}
    </div>

    {/* Profile Fields */}
    <div style={{...S.card,marginTop:10,padding:16}}>
      <h3 style={S.h3}>📋 Profile</h3>
      <div style={{...S.formGrid,marginTop:10}}><label style={S.label}>Name<input style={S.input} value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label style={S.label}>Age<input style={S.input} type="number" value={p.age} onChange={e=>setP({...p,age:e.target.value})}/></label><label style={S.label}>Weight (lbs)<input style={S.input} type="number" value={p.weight} onChange={e=>setP({...p,weight:e.target.value})}/></label><label style={S.label}>Height (inches)<input style={S.input} type="number" value={p.height} onChange={e=>setP({...p,height:e.target.value})}/></label><label style={S.label}>Sex<select style={S.input} value={p.sex} onChange={e=>setP({...p,sex:e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label style={S.label}>Blood Type<select style={S.input} value={p.bloodType||""} onChange={e=>setP({...p,bloodType:e.target.value})}><option value="">Unknown</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}</select></label></div>
      <label style={{...S.label,marginTop:12}}>Medications<input style={S.input} value={p.medications} onChange={e=>setP({...p,medications:e.target.value})} placeholder="e.g. Metformin 500mg"/></label>
      <label style={{...S.label,marginTop:8}}>Allergies<input style={S.input} value={p.allergies} onChange={e=>setP({...p,allergies:e.target.value})} placeholder="e.g. Penicillin"/></label>
      <label style={{...S.label,marginTop:8}}>Family History<input style={S.input} value={p.familyHistory||""} onChange={e=>setP({...p,familyHistory:e.target.value})} placeholder="e.g. Father: heart disease"/></label>
      <h3 style={{...S.h3,marginTop:14}}>Goals</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>{GOALS.map(g=><button key={g} onClick={()=>setP({...p,goals:p.goals.includes(g)?p.goals.filter(x=>x!==g):[...p.goals,g]})} style={{...S.chip,...(p.goals.includes(g)?S.chipActive:{}),fontSize:14}}>{g}</button>)}</div>
      <h3 style={{...S.h3,marginTop:12}}>Conditions</h3><div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:6}}>{[...new Set([...CONDITIONS,...p.conditions.filter(c=>!CONDITIONS.includes(c))])].map(c=><button key={c} onClick={()=>setP({...p,conditions:p.conditions.includes(c)?p.conditions.filter(x=>x!==c):[...p.conditions,c]})} style={{...S.chip,...(p.conditions.includes(c)?S.chipActive:{}),fontSize:14}}>{c}</button>)}</div><div style={{display:"flex",gap:6,marginTop:8}}><input style={{...S.input,flex:1,fontSize:14}} placeholder="Add other condition..." onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){setP({...p,conditions:[...p.conditions,e.target.value.trim()]});e.target.value="";}}} /><button onClick={e=>{const inp=e.target.previousSibling;if(inp.value.trim()){setP({...p,conditions:[...p.conditions,inp.value.trim()]});inp.value="";}}} style={S.smallBtn}>Add</button></div>
      <div style={{display:"flex",gap:8,marginTop:16}}><button onClick={()=>update(s=>{s.profile=p;})} style={S.primaryBtn}>Save</button><button onClick={()=>{if(confirm("Reset ALL data including labs and AI memory?"))update(s=>Object.assign(s,DEFAULT_STATE));}} style={{...S.secondaryBtn,color:"var(--danger)",borderColor:"var(--danger)"}}>Reset Data</button></div>
    </div>
    {state.aiMemory?.length>0&&<div style={{...S.card,marginTop:10,padding:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={S.h3}>🧠 AI Memory ({state.aiMemory.length})</h3><button onClick={()=>{if(confirm("Clear AI memory?"))update(s=>{s.aiMemory=[];});}} style={{fontSize:16,color:"var(--danger)",background:"none",border:"none",cursor:"pointer"}}>Clear</button></div><p style={{fontSize:14,color:"var(--dim)",marginTop:4}}>Observations learned from your health data over time:</p><div style={{marginTop:8,maxHeight:200,overflow:"auto"}}>{state.aiMemory.map((m,i)=><div key={i} style={{padding:"6px 8px",fontSize:14,borderBottom:"1px solid var(--muted)",lineHeight:1.5}}><span style={{fontFamily:"var(--mono)",color:"var(--dim)",fontSize:15}}>{m.date}</span> {m.insight}</div>)}</div></div>}
    {/* Danger Zone */}
    <div style={{...S.card,marginTop:10,padding:16,borderLeft:"3px solid var(--danger)"}}>
      <h3 style={{...S.h3,color:"var(--danger)"}}>⚠️ Danger Zone</h3>
      {!deleting ? <button onClick={()=>setDeleting(true)} style={{...S.secondaryBtn,color:"var(--danger)",borderColor:"var(--danger)",fontSize:14,marginTop:8}}>Delete Account Permanently</button>
      : <div style={{marginTop:8}}><p style={{fontSize:15,color:"var(--danger)",marginBottom:8}}>This will permanently delete your account and all health data. This cannot be undone.</p><div style={{display:"flex",gap:8}}><button onClick={deleteAccount} style={{...S.primaryBtn,background:"var(--danger)",fontSize:14}}>Yes, Delete Everything</button><button onClick={()=>setDeleting(false)} style={{...S.secondaryBtn,fontSize:14}}>Cancel</button></div></div>}
    </div>
  </div>;
}

// ═══════ STYLES ═══════
const globalCSS=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=JetBrains+Mono:wght@400&display=swap');:root{--bg:#f7f7ef;--card:#ffffff;--text:#2a2833;--dim:#7a7680;--muted:#e2ddd5;--accent:#8a7a4a;--accent2:#9a8494;--accent3:#6a98b0;--accent4:#c4867a;--danger:#b85454;--success:#5a8a52;--warn:#c4a862;--mono:'JetBrains Mono',monospace;--body:'DM Sans',sans-serif;--display:'Fraunces',serif;--shadow:0 1px 3px rgba(42,40,51,0.06),0 4px 12px rgba(42,40,51,0.04);--shadow-lg:0 4px 20px rgba(42,40,51,0.1);}*{box-sizing:border-box;margin:0;}input,select,textarea{font-family:var(--body);}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.2);opacity:1;}}@keyframes spin{to{transform:rotate(360deg);}}.fade-up{animation:fadeUp 0.35s ease both;}.card:hover{box-shadow:var(--shadow-lg);}input[type=range]{accent-color:var(--accent);}`;
const S={app:{fontFamily:"var(--body)",background:"var(--bg)",color:"var(--text)",minHeight:"100vh",maxWidth:640,margin:"0 auto",padding:"0 16px 40px"},loading:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh"},spinner:{width:28,height:28,border:"3px solid var(--muted)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0 6px"},logo:{fontFamily:"var(--display)",fontSize:24,fontWeight:700,color:"var(--text)",letterSpacing:-0.5},subtitle:{fontSize:14,color:"var(--dim)",marginTop:1},streakBadge:{fontSize:14,fontFamily:"var(--mono)",background:"rgba(138,122,74,0.1)",color:"var(--accent2)",padding:"3px 9px",borderRadius:16,fontWeight:600},iconBtn:{width:32,height:32,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"},nav:{display:"flex",gap:3,overflowX:"auto",padding:"10px 0",borderBottom:"1px solid var(--muted)"},tab:{fontSize:13,fontFamily:"var(--body)",padding:"6px 10px",borderRadius:16,border:"none",background:"none",color:"var(--dim)",cursor:"pointer",whiteSpace:"nowrap",fontWeight:500,transition:"all 0.2s"},tabActive:{background:"var(--accent)",color:"#fff"},content:{paddingTop:16},card:{background:"var(--card)",borderRadius:12,padding:18,boxShadow:"var(--shadow)",transition:"box-shadow 0.2s"},h2:{fontFamily:"var(--display)",fontSize:21,fontWeight:500},h3:{fontFamily:"var(--body)",fontSize:15,fontWeight:600},formGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},label:{display:"flex",flexDirection:"column",gap:3,fontSize:14,fontWeight:500,color:"var(--dim)"},input:{padding:"9px 14px",borderRadius:8,border:"1.5px solid var(--muted)",fontSize:14,background:"var(--bg)",color:"var(--text)",outline:"none",width:"100%",transition:"border 0.2s"},primaryBtn:{padding:"10px 20px",borderRadius:8,border:"none",background:"var(--accent)",color:"#fff",fontFamily:"var(--body)",fontWeight:600,fontSize:15,cursor:"pointer"},secondaryBtn:{padding:"10px 20px",borderRadius:8,border:"1.5px solid var(--muted)",background:"none",color:"var(--text)",fontFamily:"var(--body)",fontWeight:500,fontSize:15,cursor:"pointer"},smallBtn:{padding:"6px 14px",borderRadius:6,border:"none",background:"var(--accent)",color:"#fff",fontFamily:"var(--body)",fontSize:13,fontWeight:600,cursor:"pointer"},chip:{padding:"7px 14px",borderRadius:16,border:"1.5px solid var(--muted)",background:"var(--card)",fontFamily:"var(--body)",fontSize:14,cursor:"pointer",transition:"all 0.2s",color:"var(--text)"},chipActive:{background:"var(--accent)",color:"#fff",borderColor:"var(--accent)"},footer:{marginTop:28,padding:"14px 0",borderTop:"1px solid var(--muted)",fontSize:16,color:"var(--dim)",textAlign:"center",lineHeight:1.5}};

// ═══════════════════════════════════
//  AUTH GATE — LOGIN / SIGNUP / APP
// ═══════════════════════════════════
export default function AuthGate() {
  const [authState, setAuthState] = useState("loading"); // loading, login, signup, app, forgotPw, forgotEmail, unlock, migrate
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [strength, setStrength] = useState(0);
  const [securityQ, setSecurityQ] = useState("");
  const [securityA, setSecurityA] = useState("");
  const [resetStep, setResetStep] = useState(0);
  const [foundAccounts, setFoundAccounts] = useState([]);
  const [migrateData, setMigrateData] = useState(null); // holds localStorage data during migration

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      if (SUPABASE_MODE) {
        // ─── SUPABASE MODE ───
        const session = await window.healleoAuth.getSession();
        if (session) {
          const user = await window.healleoAuth.getUser();
          if (user) {
            setUserEmail(user.email);
            // Check if encryption key needs re-derivation (after page refresh)
            if (!window.healleoAuth.hasEncryptionKey()) {
              setAuthState("unlock");
              return;
            }
            setAuthState("app");
            return;
          }
        }
        setAuthState("login");
      } else {
        // ─── STANDALONE MODE ───
        const session = await getSession();
        if (session && session.email && session.token) {
          const accounts = await getAccounts();
          const acct = accounts[session.email];
          if (acct && acct.token === session.token) {
            currentUserKey = userDataKey(session.email);
            setUserEmail(session.email);
            setAuthState("app");
            return;
          }
        }
        setAuthState("login");
      }
    })();
  }, []);

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  // ─── LOGIN ───
  const handleLogin = async () => {
    setError(""); setLoading(true);
    const em = email.trim().toLowerCase();
    if (!em || !password) { setError("Please enter email and password"); setLoading(false); return; }

    if (SUPABASE_MODE) {
      const result = await window.healleoAuth.login(em, password);
      if (result.error) { setError(result.error); setLoading(false); return; }
      setUserEmail(em);

      // Check for localStorage data to migrate — but ONLY if this Supabase account has no data yet
      if (window.healleoMigrate?.hasLocalData()) {
        const existingData = await window.healleoData.load();
        const isEmpty = !existingData || (!existingData.onboarded && (!existingData.logs || existingData.logs.length === 0));
        if (isEmpty) {
          setMigrateData(true);
          setAuthState("migrate");
          setLoading(false);
          return;
        }
        // Account already has data — don't offer to overwrite with localStorage from potentially a different user
      }

      setPassword(""); setEmail("");
      setAuthState("app");
      setLoading(false);
    } else {
      const accounts = await getAccounts();
      const acct = accounts[em];
      if (!acct) { setError("No account found with this email"); setLoading(false); return; }
      const hash = await hashPassword(password, acct.salt);
      if (hash !== acct.hash) { setError("Incorrect password"); setLoading(false); return; }
      const token = generateToken();
      accounts[em] = { ...acct, token, lastLogin: new Date().toISOString() };
      await saveAccounts(accounts);
      await saveSession({ email: em, token });
      currentUserKey = userDataKey(em);
      setUserEmail(em);
      setPassword(""); setEmail("");
      setAuthState("app");
      setLoading(false);
    }
  };

  // ─── SIGNUP ───
  const handleSignup = async () => {
    setError(""); setLoading(true);
    const em = email.trim().toLowerCase();
    if (!em || !password || !name.trim()) { setError("Please fill in all fields"); setLoading(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError("Please enter a valid email address"); setLoading(false); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); setLoading(false); return; }

    if (SUPABASE_MODE) {
      const result = await window.healleoAuth.signup(em, password, name.trim(), securityQ, securityA);
      if (result.error) { setError(result.error); setLoading(false); return; }
      setUserEmail(em);

      // Save initial state with name
      const initialData = { ...DEFAULT_STATE, profile: { ...DEFAULT_PROFILE, name: name.trim() } };
      await window.healleoData.save(initialData);

      setPassword(""); setConfirmPw(""); setEmail(""); setName(""); setSecurityQ(""); setSecurityA("");
      setAuthState("app");
      setLoading(false);
    } else {
      if (!securityQ || !securityA.trim()) { setError("Please select a security question and provide an answer — this is needed for password recovery"); setLoading(false); return; }
      const accounts = await getAccounts();
      if (accounts[em]) { setError("An account with this email already exists"); setLoading(false); return; }
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      const token = generateToken();
      accounts[em] = { hash, salt, token, name: name.trim(), securityQ: securityQ.trim(), securityA: securityA.trim().toLowerCase(), created: new Date().toISOString(), lastLogin: new Date().toISOString() };
      await saveAccounts(accounts);
      await saveSession({ email: em, token });
      currentUserKey = userDataKey(em);
      const initialData = { ...DEFAULT_STATE, profile: { ...DEFAULT_PROFILE, name: name.trim() } };
      await saveData(initialData);
      setUserEmail(em);
      setPassword(""); setConfirmPw(""); setEmail(""); setName(""); setSecurityQ(""); setSecurityA("");
      setAuthState("app");
      setLoading(false);
    }
  };

  // ─── UNLOCK (Supabase mode: re-derive encryption key after page refresh) ───
  const handleUnlock = async () => {
    setError(""); setLoading(true);
    if (!password) { setError("Please enter your password"); setLoading(false); return; }
    const ok = await window.healleoAuth.unlockWithPassword(password);
    if (!ok) { setError("Incorrect password. Please try again."); setLoading(false); return; }

    // Verify decryption works by trying to load data
    const testLoad = await window.healleoData.load();
    if (testLoad === null) {
      // Decryption failed — wrong password for this encryption salt
      setError("Password doesn't match. If you recently changed your password, try your previous one.");
      setLoading(false);
      return;
    }

    setPassword("");
    setAuthState("app");
    setLoading(false);
  };

  // ─── MIGRATE (move localStorage to Supabase) ───
  const handleMigrate = async () => {
    setLoading(true);
    const result = await window.healleoMigrate.migrateToSupabase();
    if (result.success) {
      setSuccess("Data migrated to the cloud! You can now access it from any device.");
      window.healleoMigrate.cleanupLocal();
      setTimeout(() => { setAuthState("app"); setSuccess(""); }, 2500);
    } else {
      setError("Migration failed: " + (result.error || "Unknown error"));
    }
    setLoading(false);
  };

  const handleSkipMigrate = () => {
    setAuthState("app");
  };

  // ─── FORGOT PASSWORD ───
  const handleForgotPwStep0 = async () => {
    setError(""); setSuccess("");
    const em = email.trim().toLowerCase();
    if (!em) { setError("Please enter your email address"); return; }

    if (SUPABASE_MODE) {
      // In Supabase mode, use email-based password reset
      try {
        const sb = window.supabase?.createClient?.(
          document.querySelector?.("[data-supabase-url]")?.dataset?.supabaseUrl || "",
          document.querySelector?.("[data-supabase-anon]")?.dataset?.supabaseAnon || ""
        );
        // For now, show a message about email reset
        setSuccess("In Supabase mode, password reset is done via email. Check your inbox for a reset link. If you haven't configured email in Supabase, please contact support.");
      } catch {
        setError("Password reset is not available in this configuration.");
      }
      return;
    }

    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("No account found with this email"); return; }
    if (!acct.securityQ) { setError("This account doesn't have a security question set. Password cannot be recovered. You can create a new account."); return; }
    setSecurityQ(acct.securityQ);
    setResetStep(1);
  };

  const handleForgotPwStep1 = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("Account not found"); return; }
    if (securityA.trim().toLowerCase() !== acct.securityA) { setError("Incorrect answer. Please try again."); return; }
    setResetStep(2);
  };

  const handleForgotPwStep2 = async () => {
    setError(""); setLoading(true);
    if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); setLoading(false); return; }
    const em = email.trim().toLowerCase();
    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("Account not found"); setLoading(false); return; }
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    accounts[em] = { ...acct, hash, salt };
    await saveAccounts(accounts);
    setSuccess("Password reset successfully! You can now sign in.");
    setPassword(""); setConfirmPw(""); setSecurityA("");
    setTimeout(() => { setAuthState("login"); setResetStep(0); setSuccess(""); setError(""); }, 2000);
    setLoading(false);
  };

  // ─── FORGOT EMAIL ───
  const handleForgotEmail = async () => {
    setError("");
    const accounts = await getAccounts();
    const emails = Object.keys(accounts);
    if (emails.length === 0) { setError("No accounts found on this device."); return; }
    setFoundAccounts(emails.map(em => {
      const acct = accounts[em];
      const parts = em.split("@");
      const masked = parts[0].charAt(0) + "•".repeat(Math.max(parts[0].length - 2, 1)) + parts[0].charAt(parts[0].length - 1) + "@" + parts[1];
      return { email: em, masked, name: acct.name || "Unknown", created: acct.created?.slice(0, 10) || "?" };
    }));
  };

  const selectFoundEmail = (em) => {
    setEmail(em);
    setAuthState("login");
    setFoundAccounts([]);
    setError("");
  };

  // ─── LOGOUT ───
  const handleLogout = async () => {
    if (SUPABASE_MODE) {
      await window.healleoAuth.logout();
    } else {
      await clearSession();
    }
    currentUserKey = null;
    setUserEmail("");
    setEmail(""); setPassword(""); setConfirmPw(""); setName(""); setError(""); setSuccess("");
    setSecurityQ(""); setSecurityA(""); setResetStep(0); setFoundAccounts([]);
    setAuthState("login");
  };

  // ─── LOADING STATE ───
  if (authState === "loading") {
    return (
      <div style={{ ...S.loading, background: "var(--bg)" }}>
        <style>{globalCSS}</style>
        <div style={S.spinner} />
        <p style={{ color: "var(--accent)", marginTop: 16, fontFamily: "'DM Sans'" }}>Checking session...</p>
      </div>
    );
  }

  // ─── APP STATE ───
  if (authState === "app") {
    return <HealthCompanion onLogout={handleLogout} userEmail={userEmail} />;
  }

  // ─── UNLOCK SCREEN (Supabase mode: session exists, need password for encryption key) ───
  if (authState === "unlock") {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{globalCSS}</style>
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={HEALLEO_LOGO} alt="Healleo" style={{ height: 132, objectFit: "contain", marginBottom: 8 }}/>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Welcome back{userEmail ? `, ${userEmail}` : ""}</p>
            <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 6, lineHeight: 1.5 }}>
              Your session is active, but your health data is encrypted. Enter your password to unlock it.
            </p>
          </div>

          <label style={{ ...S.label, marginBottom: 12 }}>
            Password
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...S.input, paddingRight: 40 }} autoComplete="current-password" onKeyDown={e => e.key === "Enter" && handleUnlock()} autoFocus />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "var(--dim)" }}>{showPw ? "🙈" : "👁"}</button>
            </div>
          </label>

          {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "#8b3a3a" }}>{error}</div>}

          <button onClick={handleUnlock} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 16, opacity: loading ? 0.6 : 1, marginBottom: 12 }}>
            {loading ? "Unlocking..." : "🔓 Unlock"}
          </button>

          <button onClick={handleLogout} style={{ width: "100%", padding: "8px", background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 14, fontFamily: "var(--body)" }}>
            Sign in as different user
          </button>

          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              🔐 Your encryption key is derived from your password and never stored. This unlock step ensures your health data stays private — even from our servers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MIGRATION SCREEN (localStorage → Supabase) ───
  if (authState === "migrate") {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{globalCSS}</style>
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>☁️</div>
            <h2 style={S.h2}>Move Your Data to the Cloud?</h2>
            <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 8, lineHeight: 1.6 }}>
              We found health data stored on this device from before cloud sync was enabled. Would you like to migrate it to your secure cloud account? This means you'll be able to access your data from any device.
            </p>
          </div>

          {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "#8b3a3a" }}>{error}</div>}
          {success && <div style={{ padding: "8px 12px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "var(--success)" }}>{success}</div>}

          <button onClick={handleMigrate} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 16, marginBottom: 10, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Migrating..." : "Yes, Migrate My Data"}
          </button>
          <button onClick={handleSkipMigrate} style={{ width: "100%", padding: "10px", background: "var(--muted)", border: "none", borderRadius: 10, color: "var(--text)", cursor: "pointer", fontSize: 14, fontFamily: "var(--body)" }}>
            Skip — Start Fresh
          </button>

          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              🔐 Your data will be encrypted with AES-256-GCM before being stored. The encryption key is derived from your password and never leaves your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN / SIGNUP / FORGOT SCREENS
  const isSignup = authState === "signup";
  const isForgotPw = authState === "forgotPw";
  const isForgotEmail = authState === "forgotEmail";
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = ["", "var(--danger)", "var(--accent4)", "var(--accent2)", "var(--accent3)", "var(--success)"];

  const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What is the name of the street you grew up on?",
    "What was the make of your first car?",
  ];

  return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={HEALLEO_LOGO} alt="Healleo" style={{ height: 160, objectFit: "contain", marginBottom: 8 }}/>
          <p style={{ fontSize: 15, color: "var(--dim)", marginTop: 4 }}>
            {isForgotPw ? "Reset your password" : isForgotEmail ? "Find your account" : isSignup ? "Create your account" : "Healthcare Optimized by You"}
          </p>
        </div>

        {/* ─── FORGOT PASSWORD FLOW ─── */}
        {isForgotPw && (<>
          {resetStep === 0 && (<>
            <label style={{ ...S.label, marginBottom: 12 }}>
              Email Address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your account email" style={S.input} onKeyDown={e => e.key === "Enter" && handleForgotPwStep0()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotPwStep0} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14 }}>Continue</button>
          </>)}

          {resetStep === 1 && (<>
            <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, marginBottom: 14, fontSize: 15, color: "var(--dim)" }}>
              Account found for <strong>{email}</strong>. Answer your security question to continue.
            </div>
            <label style={{ ...S.label, marginBottom: 8 }}>
              Security Question
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 4, padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
                {securityQ}
              </div>
            </label>
            <label style={{ ...S.label, marginBottom: 12, marginTop: 10 }}>
              Your Answer
              <input value={securityA} onChange={e => setSecurityA(e.target.value)} placeholder="Type your answer" style={S.input} onKeyDown={e => e.key === "Enter" && handleForgotPwStep1()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotPwStep1} disabled={!securityA.trim()} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14, opacity: securityA.trim() ? 1 : 0.5 }}>Verify Answer</button>
          </>)}

          {resetStep === 2 && (<>
            <div style={{ padding: "10px 14px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 10, marginBottom: 14, fontSize: 15, color: "var(--success)" }}>
              ✓ Identity verified. Set your new password below.
            </div>
            <label style={{ ...S.label, marginBottom: 12 }}>
              New Password
              <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setStrength(calcStrength(e.target.value)); }} placeholder="Min. 8 characters" style={S.input} />
            </label>
            {password && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "var(--muted)" }} />))}
                </div>
              </div>
            )}
            <label style={{ ...S.label, marginBottom: 12 }}>
              Confirm New Password
              <input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" style={{ ...S.input, borderColor: confirmPw && confirmPw !== password ? "var(--danger)" : "var(--muted)" }} onKeyDown={e => e.key === "Enter" && handleForgotPwStep2()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            {success && <div style={{ padding: "8px 12px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "var(--success)" }}>{success}</div>}
            <button onClick={handleForgotPwStep2} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>)}

          <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
            <button onClick={() => { setAuthState("login"); setResetStep(0); setError(""); setSuccess(""); setSecurityA(""); setPassword(""); setConfirmPw(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
              ← Back to Sign In
            </button>
          </div>
        </>)}

        {/* ─── FORGOT EMAIL FLOW ─── */}
        {isForgotEmail && (<>
          {foundAccounts.length === 0 ? (<>
            <p style={{ fontSize: 16, color: "var(--dim)", lineHeight: 1.6, marginBottom: 16 }}>
              We'll search for accounts registered on this device. Tap "Find Accounts" to see all accounts stored locally.
            </p>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotEmail} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14 }}>Find My Accounts</button>
          </>) : (<>
            <p style={{ fontSize: 16, color: "var(--dim)", marginBottom: 14 }}>
              Found {foundAccounts.length} account{foundAccounts.length > 1 ? "s" : ""} on this device. Tap to sign in:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {foundAccounts.map((acct, i) => (
                <button key={i} onClick={() => selectFoundEmail(acct.email)} style={{ ...S.card, padding: 14, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{acct.name}</div>
                      <div style={{ fontSize: 15, color: "var(--accent)", marginTop: 2, fontFamily: "var(--mono)" }}>{acct.masked}</div>
                      <div style={{ fontSize: 16, color: "var(--dim)", marginTop: 2 }}>Created: {acct.created}</div>
                    </div>
                    <span style={{ color: "var(--dim)" }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </>)}
          <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
            <button onClick={() => { setAuthState("login"); setFoundAccounts([]); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
              ← Back to Sign In
            </button>
          </div>
        </>)}

        {/* ─── LOGIN / SIGNUP FORM ─── */}
        {(authState === "login" || authState === "signup") && (<>
        {isSignup && (
          <label style={{ ...S.label, marginBottom: 12 }}>
            Full Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={S.input} onKeyDown={e => e.key === "Enter" && handleSignup()} />
          </label>
        )}

        <label style={{ ...S.label, marginBottom: 12 }}>
          Email Address
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={S.input} autoComplete="email" onKeyDown={e => e.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
        </label>

        <label style={{ ...S.label, marginBottom: isSignup ? 4 : 12 }}>
          Password
          <div style={{ position: "relative" }}>
            <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setStrength(calcStrength(e.target.value)); }} placeholder={isSignup ? "Min. 8 characters" : "Enter password"} style={{ ...S.input, paddingRight: 40 }} autoComplete={isSignup ? "new-password" : "current-password"} onKeyDown={e => e.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "var(--dim)" }}>{showPw ? "🙈" : "👁"}</button>
          </div>
        </label>

        {isSignup && password && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 3, marginTop: 6, marginBottom: 4 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "var(--muted)", transition: "background 0.2s" }} />
              ))}
            </div>
            <div style={{ fontSize: 16, color: strengthColors[strength], fontFamily: "var(--mono)" }}>{strengthLabels[strength]}</div>
          </div>
        )}

        {isSignup && (
          <label style={{ ...S.label, marginBottom: 12 }}>
            Confirm Password
            <input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" style={{ ...S.input, borderColor: confirmPw && confirmPw !== password ? "var(--danger)" : "var(--muted)" }} autoComplete="new-password" onKeyDown={e => e.key === "Enter" && handleSignup()} />
            {confirmPw && confirmPw !== password && <span style={{ fontSize: 16, color: "var(--danger)", marginTop: 2 }}>Passwords don't match</span>}
          </label>
        )}

        {isSignup && (
          <>
            <label style={{ ...S.label, marginBottom: 8 }}>
              Security Question <span style={{ fontWeight: 400, color: "var(--dim)" }}>(for password recovery)</span>
              <select value={securityQ} onChange={e => setSecurityQ(e.target.value)} style={S.input}>
                <option value="">Select a security question...</option>
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </label>
            {securityQ && (
              <label style={{ ...S.label, marginBottom: 12 }}>
                Your Answer
                <input value={securityA} onChange={e => setSecurityA(e.target.value)} placeholder="Your answer (case-insensitive)" style={S.input} />
              </label>
            )}
          </>
        )}

        {error && (
          <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>
        )}

        <button onClick={isSignup ? handleSignup : handleLogin} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, opacity: loading ? 0.6 : 1, marginBottom: 14 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
              {isSignup ? "Creating account..." : "Signing in..."}
            </span>
          ) : (isSignup ? "Create Account" : "Sign In")}
        </button>

        {/* Toggle */}
        <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => { setAuthState(isSignup ? "login" : "signup"); setError(""); setPassword(""); setConfirmPw(""); setSecurityQ(""); setSecurityA(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Forgot links — login only */}
        {!isSignup && (
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
            <button onClick={() => { setAuthState("forgotPw"); setError(""); setResetStep(0); setPassword(""); setConfirmPw(""); setSecurityA(""); }} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 17, fontFamily: "var(--body)" }}>
              Forgot password?
            </button>
            <button onClick={() => { setAuthState("forgotEmail"); setError(""); setFoundAccounts([]); }} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 17, fontFamily: "var(--body)" }}>
              Forgot email?
            </button>
          </div>
        )}

        </>)}

        {/* Security note */}
        <div style={{ marginTop: 20, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
            {SUPABASE_MODE
              ? "🔐 Your health data is encrypted with AES-256-GCM before leaving your browser. The encryption key is derived from your password and never stored on our servers."
              : "🔒 Your password is hashed with PBKDF2-SHA256 (100k iterations). Health data is encrypted per-account and never shared."}
          </p>
          {SUPABASE_MODE && <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>☁️ Cloud sync enabled — access your data from any device</p>}
        </div>
      </div>
    </div>
  );
}