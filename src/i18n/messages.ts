export type Locale = "en" | "hi" | "te";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు"
};

export const messages: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: "Dashboard", skills: "My Skills", learning: "Learning", assessments: "Assessments", assistant: "AI Assistant",
    goodMorning: "Good morning", workspace: "Learner workspace", competency: "Overall competency", competencyChange: "+6% since last assessment",
    priority: "Priority skills to improve", recommended: "Recommended next", language: "Language", continue: "Continue learning",
    continueHint: "Continue from where you stopped", learningPath: "Your learning path", highPriority: "High priority", mediumPriority: "Medium priority",
    chooseLanguage: "Choose your preferred language", chooseLanguageHint: "You can change this anytime from the application.", enterWorkspace: "Continue",
    changeLanguage: "Change language", competencyOverview: "Competency overview", complete: "complete",
    signInTitle: "Sign in to continue", signInHint: "Use your StatSkill AI account to access your competency profile and learning path.",
    email: "Email", password: "Password", signIn: "Sign in", createAccount: "Create account", signingIn: "Signing in…",
    creatingAccount: "Creating account…", signOut: "Sign out", checkEmail: "Check your email to confirm your account, then sign in.",
    authError: "We could not complete that request.", liveCatalog: "Live learning catalogue", loading: "Loading…", noCourses: "No localized courses are available yet."
  },
  hi: {
    dashboard: "डैशबोर्ड", skills: "मेरे कौशल", learning: "सीखना", assessments: "मूल्यांकन", assistant: "AI सहायक",
    goodMorning: "सुप्रभात", workspace: "शिक्षार्थी कार्यक्षेत्र", competency: "समग्र दक्षता", competencyChange: "पिछले मूल्यांकन से +6%",
    priority: "सुधारने के लिए प्राथमिक कौशल", recommended: "अगला सुझाव", language: "भाषा", continue: "सीखना जारी रखें",
    continueHint: "जहाँ आपने छोड़ा था वहीं से जारी रखें", learningPath: "आपका सीखने का मार्ग", highPriority: "उच्च प्राथमिकता", mediumPriority: "मध्यम प्राथमिकता",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें", chooseLanguageHint: "आप इसे बाद में कभी भी बदल सकते हैं।", enterWorkspace: "जारी रखें",
    changeLanguage: "भाषा बदलें", competencyOverview: "दक्षता अवलोकन", complete: "पूर्ण",
    signInTitle: "जारी रखने के लिए साइन इन करें", signInHint: "अपनी दक्षता प्रोफ़ाइल और सीखने का मार्ग देखने के लिए StatSkill AI खाते का उपयोग करें।",
    email: "ईमेल", password: "पासवर्ड", signIn: "साइन इन", createAccount: "खाता बनाएँ", signingIn: "साइन इन हो रहा है…",
    creatingAccount: "खाता बनाया जा रहा है…", signOut: "साइन आउट", checkEmail: "खाते की पुष्टि के लिए अपना ईमेल देखें, फिर साइन इन करें।",
    authError: "अनुरोध पूरा नहीं हो सका।", liveCatalog: "लाइव शिक्षण कैटलॉग", loading: "लोड हो रहा है…", noCourses: "इस भाषा में अभी कोई पाठ्यक्रम उपलब्ध नहीं है।"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్", skills: "నా నైపుణ్యాలు", learning: "అభ్యాసం", assessments: "మూల్యాంకనాలు", assistant: "AI సహాయకుడు",
    goodMorning: "శుభోదయం", workspace: "అభ్యాసకుల కార్యస్థలం", competency: "మొత్తం సామర్థ్యం", competencyChange: "గత మూల్యాంకనంతో పోలిస్తే +6%",
    priority: "మెరుగుపరచాల్సిన ప్రాధాన్య నైపుణ్యాలు", recommended: "తదుపరి సిఫార్సు", language: "భాష", continue: "అభ్యాసాన్ని కొనసాగించండి",
    continueHint: "మీరు ఆపిన చోటు నుంచి కొనసాగించండి", learningPath: "మీ అభ్యాస మార్గం", highPriority: "అధిక ప్రాధాన్యం", mediumPriority: "మధ్యస్థ ప్రాధాన్యం",
    chooseLanguage: "మీకు ఇష్టమైన భాషను ఎంచుకోండి", chooseLanguageHint: "దీనిని తరువాత ఎప్పుడైనా మార్చవచ్చు.", enterWorkspace: "కొనసాగించండి",
    changeLanguage: "భాష మార్చండి", competencyOverview: "సామర్థ్య అవలోకనం", complete: "పూర్తి",
    signInTitle: "కొనసాగించడానికి సైన్ ఇన్ చేయండి", signInHint: "మీ సామర్థ్య ప్రొఫైల్ మరియు అభ్యాస మార్గాన్ని చూడటానికి StatSkill AI ఖాతాను ఉపయోగించండి.",
    email: "ఇమెయిల్", password: "పాస్‌వర్డ్", signIn: "సైన్ ఇన్", createAccount: "ఖాతా సృష్టించండి", signingIn: "సైన్ ఇన్ అవుతోంది…",
    creatingAccount: "ఖాతా సృష్టిస్తోంది…", signOut: "సైన్ అవుట్", checkEmail: "ఖాతాను నిర్ధారించడానికి మీ ఇమెయిల్ చూడండి, తరువాత సైన్ ఇన్ చేయండి.",
    authError: "అభ్యర్థనను పూర్తి చేయలేకపోయాము.", liveCatalog: "లైవ్ లెర్నింగ్ క్యాటలాగ్", loading: "లోడ్ అవుతోంది…", noCourses: "ఈ భాషలో ఇంకా కోర్సులు అందుబాటులో లేవు."
  }
};

export function t(locale: Locale, key: string) {
  return messages[locale]?.[key] ?? messages.en[key] ?? key;
}
