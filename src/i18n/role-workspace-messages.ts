import type { Locale } from "./messages";

export const roleWorkspaceMessages: Record<Locale, {
  loading: string;
  retry: string;
  trainerTitle: string;
  trainerHint: string;
  materials: string;
  processed: string;
  generatedAssessments: string;
  generatedQuestions: string;
  recentMaterials: string;
  assessmentLibrary: string;
  status: string;
  created: string;
  questions: string;
  source: string;
  noMaterials: string;
  noAssessments: string;
  systemTitle: string;
  systemHint: string;
  overallStatus: string;
  release: string;
  supabase: string;
  aiRuntime: string;
  providerCredential: string;
  externalCatalogs: string;
  ready: string;
  unavailable: string;
  notRequired: string;
  mock: string;
  configured: string;
  accessDenied: string;
  adminPrivacyTitle: string;
  adminPrivacyHint: string;
}> = {
  en: {
    loading: "Loading live workspace data…", retry: "Retry", trainerTitle: "Trainer content workspace", trainerHint: "This workspace shows only learning materials and AI-generated assessments owned by your signed-in trainer account.", materials: "Materials", processed: "Processed", generatedAssessments: "Generated assessments", generatedQuestions: "Generated questions", recentMaterials: "Recent learning materials", assessmentLibrary: "Generated assessment library", status: "Status", created: "Created", questions: "Questions", source: "Source", noMaterials: "No trainer-owned learning materials yet.", noAssessments: "No trainer-owned generated assessments yet.", systemTitle: "System health console", systemHint: "Live deployment readiness and integration-mode signals. This console does not expose secrets or another user's data.", overallStatus: "Overall status", release: "Release", supabase: "Supabase", aiRuntime: "AI runtime", providerCredential: "Provider credential", externalCatalogs: "External catalog adapters", ready: "Ready", unavailable: "Unavailable", notRequired: "Not required", mock: "Mock", configured: "Configured", accessDenied: "This workspace is not available for your authenticated role.", adminPrivacyTitle: "Aggregate-only analytics", adminPrivacyHint: "Organization analytics are computed behind the ADMIN/SUPER_ADMIN server boundary and intentionally exclude names, emails and row-level learner records."
  },
  hi: {
    loading: "लाइव कार्यक्षेत्र डेटा लोड हो रहा है…", retry: "फिर प्रयास करें", trainerTitle: "प्रशिक्षक सामग्री कार्यक्षेत्र", trainerHint: "यह कार्यक्षेत्र केवल आपके साइन-इन प्रशिक्षक खाते की शिक्षण सामग्री और AI-जनित आकलन दिखाता है।", materials: "सामग्री", processed: "प्रसंस्कृत", generatedAssessments: "जनित आकलन", generatedQuestions: "जनित प्रश्न", recentMaterials: "हाल की शिक्षण सामग्री", assessmentLibrary: "जनित आकलन लाइब्रेरी", status: "स्थिति", created: "निर्मित", questions: "प्रश्न", source: "स्रोत", noMaterials: "अभी प्रशिक्षक-स्वामित्व वाली सामग्री नहीं है।", noAssessments: "अभी प्रशिक्षक-स्वामित्व वाले जनित आकलन नहीं हैं।", systemTitle: "सिस्टम स्वास्थ्य कंसोल", systemHint: "लाइव परिनियोजन तत्परता और एकीकरण-मोड संकेत। यह कंसोल रहस्य या किसी अन्य उपयोगकर्ता का डेटा उजागर नहीं करता।", overallStatus: "समग्र स्थिति", release: "रिलीज़", supabase: "Supabase", aiRuntime: "AI रनटाइम", providerCredential: "प्रदाता क्रेडेंशियल", externalCatalogs: "बाहरी कैटलॉग एडेप्टर", ready: "तैयार", unavailable: "अनुपलब्ध", notRequired: "आवश्यक नहीं", mock: "मॉक", configured: "कॉन्फ़िगर", accessDenied: "यह कार्यक्षेत्र आपकी प्रमाणित भूमिका के लिए उपलब्ध नहीं है।", adminPrivacyTitle: "केवल समेकित विश्लेषण", adminPrivacyHint: "संगठन विश्लेषण ADMIN/SUPER_ADMIN सर्वर सीमा के पीछे गणना किए जाते हैं और जानबूझकर नाम, ईमेल तथा पंक्ति-स्तरीय शिक्षार्थी रिकॉर्ड शामिल नहीं करते।"
  },
  te: {
    loading: "లైవ్ వర్క్‌స్పేస్ డేటా లోడ్ అవుతోంది…", retry: "మళ్లీ ప్రయత్నించండి", trainerTitle: "ట్రైనర్ కంటెంట్ వర్క్‌స్పేస్", trainerHint: "ఈ వర్క్‌స్పేస్ మీ సైన్-ఇన్ ట్రైనర్ ఖాతాకు చెందిన లెర్నింగ్ మెటీరియల్స్ మరియు AI-జనరేటెడ్ అసెస్‌మెంట్లను మాత్రమే చూపుతుంది.", materials: "మెటీరియల్స్", processed: "ప్రాసెస్ చేసినవి", generatedAssessments: "జనరేటెడ్ అసెస్‌మెంట్లు", generatedQuestions: "జనరేటెడ్ ప్రశ్నలు", recentMaterials: "ఇటీవలి లెర్నింగ్ మెటీరియల్స్", assessmentLibrary: "జనరేటెడ్ అసెస్‌మెంట్ లైబ్రరీ", status: "స్థితి", created: "సృష్టించిన తేదీ", questions: "ప్రశ్నలు", source: "సోర్స్", noMaterials: "ఇంకా ట్రైనర్‌కు చెందిన లెర్నింగ్ మెటీరియల్స్ లేవు.", noAssessments: "ఇంకా ట్రైనర్‌కు చెందిన జనరేటెడ్ అసెస్‌మెంట్లు లేవు.", systemTitle: "సిస్టమ్ హెల్త్ కన్సోల్", systemHint: "లైవ్ డిప్లాయ్‌మెంట్ రెడీనెస్ మరియు ఇంటిగ్రేషన్ మోడ్ సంకేతాలు. ఈ కన్సోల్ సీక్రెట్లు లేదా ఇతర వినియోగదారుల డేటాను చూపదు.", overallStatus: "మొత్తం స్థితి", release: "రిలీజ్", supabase: "Supabase", aiRuntime: "AI రన్‌టైమ్", providerCredential: "ప్రొవైడర్ క్రెడెన్షియల్", externalCatalogs: "ఎక్స్‌టర్నల్ క్యాటలాగ్ అడాప్టర్లు", ready: "సిద్ధం", unavailable: "అందుబాటులో లేదు", notRequired: "అవసరం లేదు", mock: "మాక్", configured: "కాన్ఫిగర్ అయింది", accessDenied: "ఈ వర్క్‌స్పేస్ మీ ధృవీకరించిన పాత్రకు అందుబాటులో లేదు.", adminPrivacyTitle: "అగ్రిగేట్ విశ్లేషణ మాత్రమే", adminPrivacyHint: "సంస్థ విశ్లేషణలు ADMIN/SUPER_ADMIN సర్వర్ పరిమితి వెనుక లెక్కించబడతాయి; పేర్లు, ఇమెయిల్స్ మరియు వ్యక్తిగత లెర్నర్ రికార్డులు ఉద్దేశపూర్వకంగా ఇవ్వబడవు."
  }
};
