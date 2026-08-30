export type Locale = "en" | "hi" | "te";

export const messages: Record<Locale, Record<string,string>> = {
  en: { dashboard:"Dashboard", skills:"My Skills", learning:"Learning", assessments:"Assessments", assistant:"AI Assistant", goodMorning:"Good morning", competency:"Overall competency", priority:"Priority skills to improve", recommended:"Recommended next", language:"Language", continue:"Continue learning" },
  hi: { dashboard:"डैशबोर्ड", skills:"मेरे कौशल", learning:"सीखना", assessments:"मूल्यांकन", assistant:"AI सहायक", goodMorning:"सुप्रभात", competency:"समग्र दक्षता", priority:"सुधारने के लिए प्राथमिक कौशल", recommended:"अगला सुझाव", language:"भाषा", continue:"सीखना जारी रखें" },
  te: { dashboard:"డాష్‌బోర్డ్", skills:"నా నైపుణ్యాలు", learning:"అభ్యాసం", assessments:"మూల్యాంకనాలు", assistant:"AI సహాయకుడు", goodMorning:"శుభోదయం", competency:"మొత్తం సామర్థ్యం", priority:"మెరుగుపరచాల్సిన ప్రాధాన్య నైపుణ్యాలు", recommended:"తదుపరి సిఫార్సు", language:"భాష", continue:"అభ్యాసాన్ని కొనసాగించండి" }
};

export function t(locale: Locale, key: string) {
  return messages[locale]?.[key] ?? messages.en[key] ?? key;
}
