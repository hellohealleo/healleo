// Symptom checker + doctor specialty reference data.

export const BODY_AREAS = ["Head","Eyes","Ears","Nose/Throat","Chest","Abdomen","Back","Arms/Hands","Legs/Feet","Skin","General/Whole Body","Mental/Emotional"];

export const SYMPTOM_MAP = {
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

export const DOCTOR_SPECIALTIES = [
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
