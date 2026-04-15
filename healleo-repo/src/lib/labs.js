// Lab categories, reference ranges, and flagging helper.

export const LAB_CATEGORIES = [
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

export const LAB_RANGES = {
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

export function getLabFlag(name, value) {
  const range = LAB_RANGES[name];
  if (!range || isNaN(value)) return null;
  const v = parseFloat(value);
  if (range.critical_low && v <= range.critical_low) return "CRITICAL LOW";
  if (range.critical_high && v >= range.critical_high) return "CRITICAL HIGH";
  if (v < range.low) return "LOW";
  if (range.high < 900 && v > range.high) return "HIGH";
  return "NORMAL";
}
