import type { Locale } from "./messages";

export const learnerInsightMessages: Record<Locale, {
  loading: string;
  retry: string;
  frameworkTitle: string;
  frameworkHint: string;
  currentScore: string;
  targetScore: string;
  gap: string;
  notAssessed: string;
  targetMet: string;
  measured: string;
  latestAssessment: string;
  noAssessment: string;
  completedOn: string;
  score: string;
  profileTitle: string;
  profileHint: string;
  edit: string;
  cancel: string;
  save: string;
  saved: string;
  saveFailed: string;
  fullName: string;
  designation: string;
  department: string;
  cadre: string;
  assignment: string;
  qualification: string;
  experience: string;
  priorTraining: string;
  reportsTitle: string;
  reportsHint: string;
  competencyReport: string;
  assessmentReport: string;
  learningReport: string;
  preview: string;
  exportCsv: string;
  close: string;
  rows: string;
  noData: string;
}> = {
  en: {
    loading: "Loading live learner data…", retry: "Retry", frameworkTitle: "Your competency framework", frameworkHint: "Current scores and gaps come from your authenticated assessment record. The current MVP target is 70/100.", currentScore: "Current score", targetScore: "Target", gap: "Gap", notAssessed: "Not assessed", targetMet: "Target met", measured: "Measured", latestAssessment: "Latest assessment insight", noAssessment: "Complete an assessment to create your first measured insight.", completedOn: "Completed", score: "Score", profileTitle: "Official profile", profileHint: "Keep your role context current so recommendations can use the correct department, assignment and prior-learning signals.", edit: "Edit profile", cancel: "Cancel", save: "Save changes", saved: "Profile updated.", saveFailed: "Profile could not be updated.", fullName: "Full name", designation: "Designation", department: "Department", cadre: "Cadre / service", assignment: "Current assignment", qualification: "Qualification", experience: "Experience (years)", priorTraining: "Prior training", reportsTitle: "My reports", reportsHint: "Preview or export the records available to your own signed-in account. Exports never include another learner's data.", competencyReport: "Competency profile", assessmentReport: "Assessment performance", learningReport: "Learning completion", preview: "Preview", exportCsv: "Export CSV", close: "Close", rows: "rows", noData: "No records are available yet."
  },
  hi: {
    loading: "लाइव शिक्षार्थी डेटा लोड हो रहा है…", retry: "फिर प्रयास करें", frameworkTitle: "आपका दक्षता ढाँचा", frameworkHint: "वर्तमान स्कोर और अंतर आपके प्रमाणित आकलन रिकॉर्ड से आते हैं। वर्तमान MVP लक्ष्य 70/100 है।", currentScore: "वर्तमान स्कोर", targetScore: "लक्ष्य", gap: "अंतर", notAssessed: "आकलन नहीं हुआ", targetMet: "लक्ष्य पूरा", measured: "मापा गया", latestAssessment: "नवीनतम आकलन अंतर्दृष्टि", noAssessment: "अपनी पहली मापी गई अंतर्दृष्टि बनाने के लिए आकलन पूरा करें।", completedOn: "पूरा हुआ", score: "स्कोर", profileTitle: "आधिकारिक प्रोफ़ाइल", profileHint: "अपनी भूमिका की जानकारी अद्यतन रखें ताकि सिफारिशें सही विभाग, कार्य और पूर्व प्रशिक्षण संकेतों का उपयोग कर सकें।", edit: "प्रोफ़ाइल संपादित करें", cancel: "रद्द करें", save: "परिवर्तन सहेजें", saved: "प्रोफ़ाइल अपडेट हो गई।", saveFailed: "प्रोफ़ाइल अपडेट नहीं हो सकी।", fullName: "पूरा नाम", designation: "पदनाम", department: "विभाग", cadre: "कैडर / सेवा", assignment: "वर्तमान कार्य", qualification: "योग्यता", experience: "अनुभव (वर्ष)", priorTraining: "पूर्व प्रशिक्षण", reportsTitle: "मेरी रिपोर्टें", reportsHint: "अपने साइन-इन खाते में उपलब्ध रिकॉर्ड का पूर्वावलोकन या निर्यात करें। निर्यात में किसी अन्य शिक्षार्थी का डेटा शामिल नहीं होता।", competencyReport: "दक्षता प्रोफ़ाइल", assessmentReport: "आकलन प्रदर्शन", learningReport: "अधिगम पूर्णता", preview: "पूर्वावलोकन", exportCsv: "CSV निर्यात", close: "बंद करें", rows: "पंक्तियाँ", noData: "अभी कोई रिकॉर्ड उपलब्ध नहीं है।"
  },
  te: {
    loading: "లైవ్ లెర్నర్ డేటా లోడ్ అవుతోంది…", retry: "మళ్లీ ప్రయత్నించండి", frameworkTitle: "మీ సామర్థ్య ఫ్రేమ్‌వర్క్", frameworkHint: "ప్రస్తుత స్కోర్లు, గ్యాప్‌లు మీ ధృవీకరించిన అసెస్‌మెంట్ రికార్డ్ నుంచి వస్తాయి. ప్రస్తుత MVP లక్ష్యం 70/100.", currentScore: "ప్రస్తుత స్కోర్", targetScore: "లక్ష్యం", gap: "గ్యాప్", notAssessed: "అసెస్ చేయలేదు", targetMet: "లక్ష్యం చేరింది", measured: "కొలిచినది", latestAssessment: "తాజా అసెస్‌మెంట్ ఇన్‌సైట్", noAssessment: "మీ మొదటి కొలిచిన ఇన్‌సైట్ కోసం అసెస్‌మెంట్ పూర్తి చేయండి.", completedOn: "పూర్తయింది", score: "స్కోర్", profileTitle: "అధికారిక ప్రొఫైల్", profileHint: "సిఫార్సులు సరైన విభాగం, అసైన్‌మెంట్ మరియు పూర్వ శిక్షణ సంకేతాలను ఉపయోగించేందుకు మీ పాత్ర సమాచారాన్ని తాజాగ ఉంచండి.", edit: "ప్రొఫైల్ సవరించండి", cancel: "రద్దు", save: "మార్పులు సేవ్ చేయండి", saved: "ప్రొఫైల్ నవీకరించబడింది.", saveFailed: "ప్రొఫైల్ నవీకరించలేకపోయాం.", fullName: "పూర్తి పేరు", designation: "హోదా", department: "విభాగం", cadre: "కేడర్ / సేవ", assignment: "ప్రస్తుత అసైన్‌మెంట్", qualification: "అర్హత", experience: "అనుభవం (సంవత్సరాలు)", priorTraining: "పూర్వ శిక్షణ", reportsTitle: "నా నివేదికలు", reportsHint: "మీ సైన్-ఇన్ ఖాతాకు అందుబాటులో ఉన్న రికార్డులను ప్రివ్యూ లేదా ఎగుమతి చేయండి. ఎగుమతుల్లో ఇతర లెర్నర్ డేటా ఉండదు.", competencyReport: "సామర్థ్య ప్రొఫైల్", assessmentReport: "అసెస్‌మెంట్ పనితీరు", learningReport: "లెర్నింగ్ పూర్తి", preview: "ప్రివ్యూ", exportCsv: "CSV ఎగుమతి", close: "మూసివేయండి", rows: "వరుసలు", noData: "ఇంకా రికార్డులు లేవు."
  }
};
