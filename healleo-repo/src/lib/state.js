// App state shape and today() helper. Extracted from App.jsx.

export const DEFAULT_PROFILE = { name:"",age:"",weight:"",height:"",sex:"male",goals:[],conditions:[],dietType:"omnivore",medications:"",allergies:"",bloodType:"",familyHistory:"",insuranceZip:"",householdIncome:"",householdSize:1,hasEmployerInsurance:false };
export const DEFAULT_STATE = { profile:{...DEFAULT_PROFILE}, onboarded:false, logs:[], chatHistory:[], nutritionChat:[], trainerChat:[], therapistChat:[], symptomSessions:[], labResults:[], healthTimeline:[], aiMemory:[], savedDoctors:[], medications:[], sharedPlans:[], dismissedCards:[], insuranceResults:null };

export const today = () => new Date().toISOString().slice(0,10);
