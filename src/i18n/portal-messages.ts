import type { Locale } from "./messages";

export type PortalCopy = {
  government: string;
  ministry: string;
  font: string;
  contrast: string;
  language: string;
  portalSubtitle: string;
  demoRole: string;
  learner: string;
  trainerRole: string;
  administrator: string;
  superAdministrator: string;
  signOut: string;
  openNavigation: string;
  closeNavigation: string;
  primaryNavigation: string;
  menuLabel: string;
  home: string;
  dashboard: string;
  framework: string;
  assessment: string;
  advisor: string;
  learningPath: string;
  igot: string;
  generator: string;
  trainerHub: string;
  workforceAnalytics: string;
  systemConsole: string;
  reports: string;
  profile: string;
  demoNotice: string;
  homeBadge: string;
  homeTitle: string;
  homeText: string;
  assessSkills: string;
  exploreLearning: string;
  aiGenerator: string;
  loopTitle: string;
  loopSteps: string[];
  notifications: string;
  closeNotifications: string;
  noNotifications: string;
  assessmentDue: string;
  assessmentDueHint: string;
  priorityGapAlert: string;
  priorityGapAlertHint: string;
  learningReminder: string;
  learningReminderHint: string;
  roleWorkspaceReady: string;
  roleWorkspaceReadyHint: string;
  competencyDomains: string;
  skillsMapped: string;
  learningCatalog: string;
  activeOfficials: string;
  groundedAssessment: string;
  averageGain: string;
  illustrativeMetric: string;
  howBadge: string;
  howTitle: string;
  howText: string;
  workflow: Array<[string, string]>;
  featureNames: string[];
  featureText: string;
  dashboardBadge: string;
  goodMorning: string;
  dashboardText: string;
  takeAssessment: string;
  learningAdvisor: string;
  overallCompetency: string;
  skillGaps: string;
  learningProgress: string;
  learningHours: string;
  assessments: string;
  measuredCapability: string;
  noMeasuredGaps: string;
  noLearningItems: string;
  unavailable: string;
  competencyRadar: string;
  currentVsRequired: string;
  priorityGaps: string;
  bridgeGaps: string;
  viewPath: string;
  recommendedLearning: string;
  fullRoadmap: string;
  latestInsight: string;
  noAssessmentInsight: string;
  frameworkBadge: string;
  frameworkTitle: string;
  frameworkText: string;
  proficiencyModel: string;
  current: string;
  required: string;
  assessmentBadge: string;
  assessmentTitle: string;
  assessmentText: string;
  advisorBadge: string;
  advisorTitle: string;
  advisorText: string;
  whyCourse: string;
  enrollContinue: string;
  learningBadge: string;
  learningTitle: string;
  learningText: string;
  notStarted: string;
  complete: string;
  igotBadge: string;
  igotTitle: string;
  igotText: string;
  mockSyncHealthy: string;
  mockAdapters: string;
  viewLearningItem: string;
  generatorBadge: string;
  generatorTitle: string;
  generatorText: string;
  pipeline: string[];
  trainerBadge: string;
  trainerTitle: string;
  trainerText: string;
  trainerDemo: string;
  adminBadge: string;
  adminTitle: string;
  adminText: string;
  adminUnavailable: string;
  superBadge: string;
  superTitle: string;
  superText: string;
  reportsBadge: string;
  reportsTitle: string;
  reportsText: string;
  preview: string;
  export: string;
  profileBadge: string;
  profileText: string;
  editProfile: string;
  officialDetails: string;
  designation: string;
  department: string;
  cadre: string;
  assignment: string;
  qualification: string;
  experience: string;
  notProvided: string;
  competencyLearningSummary: string;
  priorTrainingHistory: string;
  groundedAssistant: string;
  assistantTitle: string;
  assistantText: string;
  askGrounded: string;
  generatePractice: string;
  viewCompetencyGaps: string;
  aiDisclaimer: string;
  authSecure: string;
  authCreate: string;
  authCreateHint: string;
  authStoryBadge: string;
  authStoryTitle: string;
  authStoryText: string;
  authFeatures: Array<[string, string]>;
  designationLabel: string;
  departmentLabel: string;
  cadreLabel: string;
  careerContext: string;
  optionalRecommended: string;
  assignmentLabel: string;
  qualificationLabel: string;
  experienceLabel: string;
  priorTrainingLabel: string;
  demoPrivacy: string;
};

const en: PortalCopy = {
  government: "GOVERNMENT OF INDIA", ministry: "Ministry of Statistics & Programme Implementation (MoSPI)", font: "Font", contrast: "Contrast", language: "Language", portalSubtitle: "National Competency & Learning Portal for Official Statistics", demoRole: "Demo role", learner: "Learner", trainerRole: "Trainer / Faculty", administrator: "Administrator", superAdministrator: "Super Administrator", signOut: "Sign out", openNavigation: "Open navigation", closeNavigation: "Close navigation", primaryNavigation: "Primary navigation", menuLabel: "Menu",
  home: "Home", dashboard: "Dashboard", framework: "Competency Framework", assessment: "Assessment", advisor: "AI Advisor", learningPath: "Learning Path", igot: "iGOT Karmayogi", generator: "AI Assessment Generator", trainerHub: "Trainer Hub", workforceAnalytics: "Workforce Analytics", systemConsole: "System Console", reports: "Reports", profile: "Profile", demoNotice: "Illustrative demo data — not an authenticated learner record",
  homeBadge: "AI-powered capacity building for India's Official Statistical System", homeTitle: "Build a future-ready statistical workforce with measurable competency intelligence.", homeText: "Assess capabilities, identify skill gaps, recommend personalized iGOT and NSSTA learning, generate grounded assessments, and continuously measure improvement.", assessSkills: "Assess my skills", exploreLearning: "Explore learning pathways", aiGenerator: "AI assessment generator", loopTitle: "360° competency improvement loop", loopSteps: ["Official profile", "Competencies", "Skill gaps", "iGOT learning", "AI assessment", "Score growth"], notifications: "Notifications", closeNotifications: "Close notifications", noNotifications: "You are up to date.", assessmentDue: "Establish your baseline", assessmentDueHint: "Complete an assessment to measure your current competency level.", priorityGapAlert: "Priority gaps need attention", priorityGapAlertHint: "{count} high-priority gaps have recommended learning available.", learningReminder: "Continue your learning path", learningReminderHint: "{count} enrolled items are not complete.", roleWorkspaceReady: "Role workspace ready", roleWorkspaceReadyHint: "Open your live role-specific workspace and review current activity.", competencyDomains: "Competency domains", skillsMapped: "Official skills mapped", learningCatalog: "Learning catalog", activeOfficials: "Active officials", groundedAssessment: "Grounded assessment", averageGain: "Average gain", illustrativeMetric: "Illustrative national demo metric",
  howBadge: "Systematic capacity building", howTitle: "How StatSkill AI closes the competency loop", howText: "Individual development is linked to official role expectations, departmental priorities and future skill demand.", workflow: [["Build Profile", "Designation, cadre, department, qualifications, experience and current assignments."], ["Assess Competencies", "Benchmark statistical, technical, digital-governance and behavioural proficiency."], ["Identify Gaps", "Compare current proficiency with role-specific target competency levels."], ["Personalize Learning", "Prioritize iGOT, NSSTA and TPAC learning with explainable scoring."], ["Reassess & Update", "Generate grounded quizzes, score securely and refresh the competency profile."]], featureNames: ["Competency intelligence", "Explainable learning advisor", "Grounded AI assessment", "Timed quiz player", "Trainer QA console", "Workforce analytics", "Multilingual access", "Accessibility controls"], featureText: "Integrated into one role-aware national capacity-building experience.",
  dashboardBadge: "Official cadre workspace", goodMorning: "Good morning", dashboardText: "Your competency and learning overview is aligned to your current role and assignments.", takeAssessment: "Take skill assessment", learningAdvisor: "AI learning advisor", overallCompetency: "Overall competency", skillGaps: "Skill gaps", learningProgress: "Learning progress", learningHours: "Learning hours", assessments: "Assessments", measuredCapability: "Current measured capability", noMeasuredGaps: "No measured competency gaps are available yet.", noLearningItems: "No enrolled learning items are available yet.", unavailable: "Not available", competencyRadar: "Competency radar profile", currentVsRequired: "Current vs required", priorityGaps: "Prioritized competency gaps", bridgeGaps: "Bridge gaps", viewPath: "View path", recommendedLearning: "Your learning progress", fullRoadmap: "Full roadmap", latestInsight: "Latest assessment insight", noAssessmentInsight: "Complete an assessment to see measured strengths and improvement areas.",
  frameworkBadge: "Official Statistics competency framework", frameworkTitle: "Role-aligned capability matrix", frameworkText: "Explore current vs required proficiency across the domains expected in India's Official Statistical System.", proficiencyModel: "Five-level proficiency model", current: "current", required: "required", assessmentBadge: "Assess & update", assessmentTitle: "Competency assessment", assessmentText: "Complete source-grounded and role-aligned assessments. Successful results feed back into your competency profile.",
  advisorBadge: "Explainable recommendations", advisorTitle: "AI learning advisor", advisorText: "Recommendations combine gap severity, role relevance, career trajectory, department priorities, prior learning and future demand.", whyCourse: "Why this course?", enrollContinue: "Enroll / continue", learningBadge: "Personalized roadmap", learningTitle: "Your learning path", learningText: "Sequenced modules bridge prerequisite gaps before advanced official-statistics capability.", notStarted: "Not started", complete: "complete",
  igotBadge: "External learning ecosystem", igotTitle: "iGOT Karmayogi & NSSTA hub", igotText: "Catalog, enrolment, completion and competency sync are represented through adapters. Demo entries are clearly marked until official API credentials are supplied.", mockSyncHealthy: "Mock sync healthy", mockAdapters: "Mock adapters", viewLearningItem: "View learning item",
  generatorBadge: "Grounded on-device AI", generatorTitle: "AI assessment generator & learning-material assistant", generatorText: "Upload approved material, extract source chunks, search evidence, ask grounded questions and generate private assessments. The AI runtime runs locally in supported browsers with no paid provider.", pipeline: ["Upload", "Semantic chunking", "Topic extraction", "Source verification", "Assessment"],
  trainerBadge: "NSSTA faculty console", trainerTitle: "Trainer & question-bank QA hub", trainerText: "Review generated questions, verify source grounding, diagnose cohort weak topics and curate training activity.", trainerDemo: "Trainer analytics below are illustrative demo data until trainer workflows are connected to production records.", adminBadge: "Enterprise capacity intelligence", adminTitle: "Workforce analytics", adminText: "Aggregate, privacy-preserving workforce insight for MoSPI capacity-building leaders.", adminUnavailable: "Your authenticated account does not have administrator privileges. Illustrative demo analytics are shown separately.", superBadge: "Controlled system operations", superTitle: "Super administrator console", superText: "Integration health, audit posture and demo adapter controls. Demo controls never bypass production authorization.",
  reportsBadge: "Evidence & reporting", reportsTitle: "Reports center", reportsText: "Generate learner and organisation reports for competency, assessment and learning progress.", preview: "Preview", export: "Export", profileBadge: "Official identity & career profile", profileText: "Keep designation, assignment, qualifications and experience current so recommendations stay role-relevant.", editProfile: "Edit profile", officialDetails: "Official details", designation: "Designation", department: "Department", cadre: "Cadre / Service", assignment: "Current assignment", qualification: "Highest qualification", experience: "Experience", notProvided: "Not provided", competencyLearningSummary: "Competency & learning summary", priorTrainingHistory: "Prior training & learning history",
  groundedAssistant: "Grounded assistant", assistantTitle: "Ask your learning material", assistantText: "The production assistant uses only evidence from your owner-scoped learning materials and runs locally on supported browsers.", askGrounded: "Ask a grounded question", generatePractice: "Generate practice quiz", viewCompetencyGaps: "View competency gaps", aiDisclaimer: "AI output is validated before use. When evidence is insufficient, the assistant should abstain.",
  authSecure: "Secure official access", authCreate: "Create your competency profile", authCreateHint: "Register your official profile. Optional career details improve future recommendations.", authStoryBadge: "Building a future-ready statistical workforce", authStoryTitle: "One secure platform to assess, learn, practice and grow.", authStoryText: "Map role-specific competency gaps, receive explainable learning recommendations, use approved learning material for grounded AI assistance, and measure improvement through secure assessments.", authFeatures: [["Competency intelligence", "Statistical, technical, digital-governance and behavioural capability mapping."], ["iGOT + NSSTA learning", "Personalized pathways through adapter-based catalog integration."], ["Grounded local AI", "Private learning-material assistance and quiz generation without a paid AI provider."]], designationLabel: "Designation", departmentLabel: "Department / Organisation", cadreLabel: "Cadre / Service", careerContext: "Add career & learning context", optionalRecommended: "Optional, recommended", assignmentLabel: "Current role / assignment", qualificationLabel: "Highest qualification", experienceLabel: "Years of experience", priorTrainingLabel: "Prior training", demoPrivacy: "Demo/hackathon environment. Do not upload confidential or restricted government material."
};

const hi: PortalCopy = {
  ...en,
  government: "भारत सरकार", ministry: "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)", font: "अक्षर", contrast: "उच्च कंट्रास्ट", language: "भाषा", portalSubtitle: "आधिकारिक सांख्यिकी के लिए राष्ट्रीय दक्षता एवं शिक्षण पोर्टल", demoRole: "डेमो भूमिका", learner: "शिक्षार्थी", trainerRole: "प्रशिक्षक / संकाय", administrator: "प्रशासक", superAdministrator: "सुपर प्रशासक", signOut: "साइन आउट", openNavigation: "नेविगेशन खोलें", closeNavigation: "नेविगेशन बंद करें", primaryNavigation: "मुख्य नेविगेशन", menuLabel: "मेनू",
  home: "मुखपृष्ठ", dashboard: "डैशबोर्ड", framework: "दक्षता ढाँचा", assessment: "मूल्यांकन", advisor: "AI सलाहकार", learningPath: "शिक्षण पथ", generator: "AI मूल्यांकन जनरेटर", trainerHub: "प्रशिक्षक केंद्र", workforceAnalytics: "कार्यबल विश्लेषण", systemConsole: "सिस्टम कंसोल", reports: "रिपोर्ट", profile: "प्रोफ़ाइल", demoNotice: "उदाहरणात्मक डेमो डेटा — प्रमाणित शिक्षार्थी रिकॉर्ड नहीं",
  homeBadge: "भारत की आधिकारिक सांख्यिकी प्रणाली के लिए AI-सक्षम क्षमता निर्माण", homeTitle: "मापनीय दक्षता बुद्धिमत्ता के साथ भविष्य के लिए तैयार सांख्यिकीय कार्यबल बनाएँ।", homeText: "क्षमताओं का आकलन करें, कौशल अंतर पहचानें, व्यक्तिगत iGOT/NSSTA सीखने की सिफारिशें पाएँ और प्रगति को लगातार मापें।", assessSkills: "कौशल का आकलन करें", exploreLearning: "शिक्षण पथ देखें", aiGenerator: "AI मूल्यांकन बनाएँ", loopTitle: "360° दक्षता सुधार चक्र", loopSteps: ["अधिकारी प्रोफ़ाइल", "दक्षताएँ", "कौशल अंतर", "iGOT शिक्षण", "AI मूल्यांकन", "स्कोर वृद्धि"], notifications: "सूचनाएँ", closeNotifications: "सूचनाएँ बंद करें", noNotifications: "आपकी सभी गतिविधियाँ अद्यतन हैं।", assessmentDue: "अपना आधार स्तर मापें", assessmentDueHint: "वर्तमान दक्षता स्तर जानने के लिए मूल्यांकन पूरा करें।", priorityGapAlert: "प्राथमिकता वाले अंतर पर ध्यान दें", priorityGapAlertHint: "{count} उच्च-प्राथमिकता अंतर के लिए सीखने की सिफारिशें उपलब्ध हैं।", learningReminder: "अपना शिक्षण पथ जारी रखें", learningReminderHint: "{count} नामांकित पाठ्यक्रम अभी पूरे नहीं हुए हैं।", roleWorkspaceReady: "भूमिका कार्यक्षेत्र तैयार है", roleWorkspaceReadyHint: "अपना लाइव भूमिका-विशिष्ट कार्यक्षेत्र खोलें।", competencyDomains: "दक्षता क्षेत्र", skillsMapped: "मैप किए गए कौशल", learningCatalog: "शिक्षण कैटलॉग", activeOfficials: "सक्रिय अधिकारी", groundedAssessment: "स्रोत-आधारित मूल्यांकन", averageGain: "औसत वृद्धि", illustrativeMetric: "उदाहरणात्मक राष्ट्रीय डेमो आँकड़ा",
  howBadge: "व्यवस्थित क्षमता निर्माण", howTitle: "StatSkill AI दक्षता चक्र कैसे पूरा करता है", howText: "व्यक्तिगत विकास को भूमिका अपेक्षाओं, विभागीय प्राथमिकताओं और भविष्य की कौशल मांग से जोड़ा जाता है।", workflow: [["प्रोफ़ाइल बनाएँ", "पद, कैडर, विभाग, योग्यता, अनुभव और वर्तमान दायित्व।"], ["दक्षता जाँचें", "सांख्यिकीय, तकनीकी, डिजिटल शासन और व्यवहारिक दक्षता मापें।"], ["अंतर पहचानें", "वर्तमान स्तर को भूमिका-आधारित लक्ष्य से तुलना करें।"], ["व्यक्तिगत सीख", "व्याख्यायोग्य स्कोर से iGOT, NSSTA और TPAC सीख को प्राथमिकता दें।"], ["फिर जाँचें", "स्रोत-आधारित क्विज़, सुरक्षित स्कोरिंग और प्रोफ़ाइल अपडेट।"]], featureNames: ["दक्षता बुद्धिमत्ता", "व्याख्यायोग्य सीख सलाहकार", "स्रोत-आधारित AI मूल्यांकन", "समयबद्ध क्विज़", "प्रशिक्षक QA", "कार्यबल विश्लेषण", "बहुभाषी पहुँच", "सुगम्यता नियंत्रण"], featureText: "एक भूमिका-सचेत राष्ट्रीय क्षमता निर्माण अनुभव में एकीकृत।",
  dashboardBadge: "अधिकारी कार्यक्षेत्र", goodMorning: "सुप्रभात", dashboardText: "आपका दक्षता और शिक्षण सारांश आपकी वर्तमान भूमिका और दायित्वों के अनुरूप है।", takeAssessment: "कौशल मूल्यांकन दें", learningAdvisor: "AI शिक्षण सलाहकार", overallCompetency: "कुल दक्षता", skillGaps: "कौशल अंतर", learningProgress: "शिक्षण प्रगति", learningHours: "शिक्षण घंटे", assessments: "मूल्यांकन", measuredCapability: "वर्तमान मापी गई क्षमता", noMeasuredGaps: "अभी कोई मापा हुआ दक्षता अंतर उपलब्ध नहीं है।", noLearningItems: "अभी कोई नामांकित शिक्षण सामग्री उपलब्ध नहीं है।", unavailable: "उपलब्ध नहीं", competencyRadar: "दक्षता रडार प्रोफ़ाइल", currentVsRequired: "वर्तमान बनाम आवश्यक", priorityGaps: "प्राथमिक दक्षता अंतर", bridgeGaps: "अंतर कम करें", viewPath: "पथ देखें", recommendedLearning: "आपकी शिक्षण प्रगति", fullRoadmap: "पूरा रोडमैप", latestInsight: "नवीनतम मूल्यांकन अंतर्दृष्टि", noAssessmentInsight: "मापी गई ताकत और सुधार क्षेत्र देखने के लिए मूल्यांकन पूरा करें।",
  frameworkBadge: "आधिकारिक सांख्यिकी दक्षता ढाँचा", frameworkTitle: "भूमिका-संरेखित क्षमता मैट्रिक्स", frameworkText: "आधिकारिक सांख्यिकी प्रणाली के अपेक्षित क्षेत्रों में वर्तमान और आवश्यक दक्षता देखें।", proficiencyModel: "पाँच-स्तरीय दक्षता मॉडल", current: "वर्तमान", required: "आवश्यक", assessmentBadge: "आकलन और अपडेट", assessmentTitle: "दक्षता मूल्यांकन", assessmentText: "भूमिका-संरेखित और स्रोत-आधारित मूल्यांकन पूरा करें; परिणाम आपकी दक्षता प्रोफ़ाइल अपडेट करते हैं।",
  advisorBadge: "व्याख्यायोग्य सिफारिशें", advisorTitle: "AI शिक्षण सलाहकार", advisorText: "सिफारिशें कौशल अंतर, भूमिका, करियर, विभागीय प्राथमिकता, पूर्व शिक्षण और भविष्य की मांग को जोड़ती हैं।", whyCourse: "यह पाठ्यक्रम क्यों?", enrollContinue: "नामांकन / जारी रखें", learningBadge: "व्यक्तिगत रोडमैप", learningTitle: "आपका शिक्षण पथ", learningText: "क्रमबद्ध मॉड्यूल उन्नत आधिकारिक-सांख्यिकी क्षमता से पहले आवश्यक अंतर कम करते हैं।", notStarted: "शुरू नहीं", complete: "पूर्ण",
  igotBadge: "बाहरी शिक्षण पारिस्थितिकी", igotTitle: "iGOT कर्मयोगी एवं NSSTA केंद्र", igotText: "कैटलॉग, नामांकन और पूर्णता एडाप्टर के माध्यम से दर्शाए गए हैं; आधिकारिक API मिलने तक डेमो प्रविष्टियाँ स्पष्ट रूप से चिह्नित हैं।", mockSyncHealthy: "मॉक सिंक स्वस्थ", mockAdapters: "मॉक एडाप्टर", viewLearningItem: "शिक्षण सामग्री देखें", generatorBadge: "डिवाइस पर स्रोत-आधारित AI", generatorTitle: "AI मूल्यांकन जनरेटर एवं शिक्षण सहायक", generatorText: "अनुमोदित सामग्री अपलोड करें, स्रोत खोजें, प्रश्न पूछें और निजी मूल्यांकन बनाएँ। समर्थित ब्राउज़र में AI स्थानीय रूप से चलता है।", pipeline: ["अपलोड", "सेमांटिक खंड", "विषय पहचान", "स्रोत सत्यापन", "मूल्यांकन"],
  trainerBadge: "NSSTA संकाय कंसोल", trainerTitle: "प्रशिक्षक एवं प्रश्न-बैंक QA केंद्र", trainerText: "जनरेट प्रश्नों की समीक्षा, स्रोत सत्यापन और समूह के कमजोर विषयों का विश्लेषण करें।", trainerDemo: "नीचे के प्रशिक्षक आँकड़े डेमो हैं; उत्पादन रिकॉर्ड से जुड़ने तक इन्हें वास्तविक डेटा न मानें।", adminBadge: "कार्यबल क्षमता बुद्धिमत्ता", adminTitle: "कार्यबल विश्लेषण", adminText: "MoSPI क्षमता निर्माण नेतृत्व के लिए गोपनीयता-सुरक्षित समेकित अंतर्दृष्टि।", adminUnavailable: "आपके खाते में प्रशासक अधिकार नहीं हैं; नीचे अलग से उदाहरणात्मक डेमो विश्लेषण दिखाया गया है।", superBadge: "नियंत्रित सिस्टम संचालन", superTitle: "सुपर प्रशासक कंसोल", superText: "एकीकरण स्वास्थ्य, ऑडिट और डेमो एडाप्टर नियंत्रण; डेमो नियंत्रण उत्पादन प्राधिकरण को नहीं बदलते।",
  reportsBadge: "साक्ष्य एवं रिपोर्टिंग", reportsTitle: "रिपोर्ट केंद्र", reportsText: "दक्षता, मूल्यांकन और शिक्षण प्रगति की व्यक्तिगत और संगठन रिपोर्ट बनाएँ।", preview: "पूर्वावलोकन", export: "निर्यात", profileBadge: "आधिकारिक पहचान एवं करियर प्रोफ़ाइल", profileText: "पद, दायित्व, योग्यता और अनुभव अद्यतन रखें ताकि सिफारिशें भूमिका-संगत रहें।", editProfile: "प्रोफ़ाइल संपादित करें", officialDetails: "आधिकारिक विवरण", designation: "पद", department: "विभाग", cadre: "कैडर / सेवा", assignment: "वर्तमान दायित्व", qualification: "उच्चतम योग्यता", experience: "अनुभव", notProvided: "दिया नहीं गया", competencyLearningSummary: "दक्षता एवं शिक्षण सारांश", priorTrainingHistory: "पूर्व प्रशिक्षण एवं शिक्षण इतिहास",
  groundedAssistant: "स्रोत-आधारित सहायक", assistantTitle: "अपनी शिक्षण सामग्री से पूछें", assistantText: "उत्पादन सहायक केवल आपके खाते की शिक्षण सामग्री के प्रमाण का उपयोग करता है और समर्थित ब्राउज़र में स्थानीय रूप से चलता है।", askGrounded: "स्रोत-आधारित प्रश्न पूछें", generatePractice: "अभ्यास क्विज़ बनाएँ", viewCompetencyGaps: "दक्षता अंतर देखें", aiDisclaimer: "AI आउटपुट उपयोग से पहले सत्यापित होता है; प्रमाण अपर्याप्त हो तो सहायक उत्तर से परहेज़ करता है।",
  authSecure: "सुरक्षित अधिकारी प्रवेश", authCreate: "अपनी दक्षता प्रोफ़ाइल बनाएँ", authCreateHint: "आधिकारिक प्रोफ़ाइल दर्ज करें। वैकल्पिक करियर विवरण बेहतर सिफारिशों में मदद करते हैं।", authStoryBadge: "भविष्य के लिए तैयार सांख्यिकीय कार्यबल", authStoryTitle: "आकलन, सीख, अभ्यास और विकास के लिए एक सुरक्षित मंच।", authStoryText: "भूमिका-विशिष्ट कौशल अंतर मैप करें, व्याख्यायोग्य सीख सिफारिशें पाएँ और सुरक्षित मूल्यांकन से सुधार मापें।", authFeatures: [["दक्षता बुद्धिमत्ता", "सांख्यिकीय, तकनीकी, डिजिटल शासन और व्यवहारिक क्षमता मैपिंग।"], ["iGOT + NSSTA शिक्षण", "एडाप्टर-आधारित कैटलॉग से व्यक्तिगत शिक्षण पथ।"], ["स्थानीय स्रोत-आधारित AI", "भुगतान वाले AI प्रदाता के बिना निजी सामग्री सहायता और क्विज़।"]], designationLabel: "पद", departmentLabel: "विभाग / संगठन", cadreLabel: "कैडर / सेवा", careerContext: "करियर एवं शिक्षण संदर्भ जोड़ें", optionalRecommended: "वैकल्पिक, अनुशंसित", assignmentLabel: "वर्तमान भूमिका / दायित्व", qualificationLabel: "उच्चतम योग्यता", experienceLabel: "अनुभव के वर्ष", priorTrainingLabel: "पूर्व प्रशिक्षण", demoPrivacy: "डेमो/हैकाथॉन वातावरण। गोपनीय या प्रतिबंधित सरकारी सामग्री अपलोड न करें।"
};

const te: PortalCopy = {
  ...en,
  government: "భారత ప్రభుత్వం", ministry: "గణాంకాలు మరియు కార్యక్రమ అమలు మంత్రిత్వ శాఖ (MoSPI)", font: "అక్షరం", contrast: "అధిక కాంట్రాస్ట్", language: "భాష", portalSubtitle: "అధికారిక గణాంకాల జాతీయ సామర్థ్య & అభ్యాస పోర్టల్", demoRole: "డెమో పాత్ర", learner: "అభ్యాసకుడు", trainerRole: "శిక్షకుడు / ఫ్యాకల్టీ", administrator: "నిర్వాహకుడు", superAdministrator: "సూపర్ అడ్మిన్", signOut: "సైన్ అవుట్", openNavigation: "నావిగేషన్ తెరవండి", closeNavigation: "నావిగేషన్ మూసివేయండి", primaryNavigation: "ప్రధాన నావిగేషన్", menuLabel: "మెనూ",
  home: "హోమ్", dashboard: "డ్యాష్‌బోర్డ్", framework: "సామర్థ్య ఫ్రేమ్‌వర్క్", assessment: "మూల్యాంకనం", advisor: "AI సలహాదారు", learningPath: "అభ్యాస మార్గం", generator: "AI మూల్యాంకన జనరేటర్", trainerHub: "ట్రైనర్ హబ్", workforceAnalytics: "వర్క్‌ఫోర్స్ విశ్లేషణ", systemConsole: "సిస్టమ్ కన్సోల్", reports: "రిపోర్టులు", profile: "ప్రొఫైల్", demoNotice: "ఉదాహరణ డెమో డేటా — ధృవీకరించిన అభ్యాసకుడి రికార్డు కాదు",
  homeBadge: "భారత అధికారిక గణాంక వ్యవస్థకు AI ఆధారిత సామర్థ్య నిర్మాణం", homeTitle: "కొలిచే సామర్థ్య మేధస్సుతో భవిష్యత్‌కు సిద్ధమైన గణాంక వర్క్‌ఫోర్స్‌ను నిర్మించండి.", homeText: "సామర్థ్యాలను అంచనా వేసి, నైపుణ్య లోటులను గుర్తించి, వ్యక్తిగత iGOT/NSSTA అభ్యాసాన్ని సిఫారసు చేసి, పురోగతిని నిరంతరం కొలవండి.", assessSkills: "నా నైపుణ్యాలను అంచనా వేయండి", exploreLearning: "అభ్యాస మార్గాలు చూడండి", aiGenerator: "AI మూల్యాంకనం రూపొందించండి", loopTitle: "360° సామర్థ్య మెరుగుదల చక్రం", loopSteps: ["అధికారి ప్రొఫైల్", "సామర్థ్యాలు", "నైపుణ్య లోటులు", "iGOT అభ్యాసం", "AI మూల్యాంకనం", "స్కోర్ వృద్ధి"], notifications: "నోటిఫికేషన్లు", closeNotifications: "నోటిఫికేషన్లు మూసివేయండి", noNotifications: "మీ కార్యకలాపాలు తాజాగా ఉన్నాయి.", assessmentDue: "మీ ప్రాథమిక స్థాయిని కొలవండి", assessmentDueHint: "ప్రస్తుత సామర్థ్య స్థాయిని తెలుసుకోవడానికి మూల్యాంకనం పూర్తి చేయండి.", priorityGapAlert: "ప్రాధాన్య లోటులపై దృష్టి పెట్టండి", priorityGapAlertHint: "{count} అధిక ప్రాధాన్య లోటులకు అభ్యాస సిఫారసులు అందుబాటులో ఉన్నాయి.", learningReminder: "మీ అభ్యాస మార్గాన్ని కొనసాగించండి", learningReminderHint: "{count} నమోదు చేసిన అంశాలు ఇంకా పూర్తి కాలేదు.", roleWorkspaceReady: "పాత్ర వర్క్‌స్పేస్ సిద్ధంగా ఉంది", roleWorkspaceReadyHint: "మీ ప్రత్యక్ష పాత్ర-ఆధారిత వర్క్‌స్పేస్‌ను తెరవండి.", competencyDomains: "సామర్థ్య రంగాలు", skillsMapped: "మ్యాప్ చేసిన నైపుణ్యాలు", learningCatalog: "అభ్యాస క్యాటలాగ్", activeOfficials: "క్రియాశీల అధికారులు", groundedAssessment: "ఆధారిత మూల్యాంకనం", averageGain: "సగటు వృద్ధి", illustrativeMetric: "ఉదాహరణ జాతీయ డెమో మెట్రిక్",
  howBadge: "వ్యవస్థీకృత సామర్థ్య నిర్మాణం", howTitle: "StatSkill AI సామర్థ్య చక్రాన్ని ఎలా పూర్తి చేస్తుంది", howText: "వ్యక్తిగత అభివృద్ధిని పాత్ర అవసరాలు, విభాగ ప్రాధాన్యతలు మరియు భవిష్యత్ నైపుణ్య డిమాండ్‌తో అనుసంధానిస్తుంది.", workflow: [["ప్రొఫైల్ నిర్మించండి", "హోదా, కేడర్, విభాగం, అర్హతలు, అనుభవం మరియు ప్రస్తుత బాధ్యతలు."], ["సామర్థ్యాలను అంచనా వేయండి", "గణాంక, సాంకేతిక, డిజిటల్ గవర్నెన్స్ మరియు ప్రవర్తనా సామర్థ్యాన్ని కొలవండి."], ["లోటులను గుర్తించండి", "ప్రస్తుత స్థాయిని పాత్రకు అవసరమైన లక్ష్యంతో పోల్చండి."], ["వ్యక్తిగత అభ్యాసం", "వివరణాత్మక స్కోర్‌తో iGOT, NSSTA, TPAC అభ్యాసానికి ప్రాధాన్యత ఇవ్వండి."], ["మళ్లీ అంచనా వేయండి", "ఆధారిత క్విజ్, సురక్షిత స్కోరింగ్ మరియు ప్రొఫైల్ నవీకరణ."]], featureNames: ["సామర్థ్య మేధస్సు", "వివరణాత్మక అభ్యాస సలహా", "ఆధారిత AI మూల్యాంకనం", "సమయపరిమితి క్విజ్", "ట్రైనర్ QA", "వర్క్‌ఫోర్స్ విశ్లేషణ", "బహుభాషా యాక్సెస్", "యాక్సెసిబిలిటీ నియంత్రణలు"], featureText: "పాత్రకు అనుగుణమైన ఒకే జాతీయ సామర్థ్య నిర్మాణ అనుభవంలో సమీకరించబడింది.",
  dashboardBadge: "అధికారి వర్క్‌స్పేస్", goodMorning: "శుభోదయం", dashboardText: "మీ సామర్థ్య మరియు అభ్యాస సారాంశం మీ ప్రస్తుత పాత్ర మరియు బాధ్యతలకు అనుగుణంగా ఉంటుంది.", takeAssessment: "నైపుణ్య మూల్యాంకనం చేయండి", learningAdvisor: "AI అభ్యాస సలహాదారు", overallCompetency: "మొత్తం సామర్థ్యం", skillGaps: "నైపుణ్య లోటులు", learningProgress: "అభ్యాస పురోగతి", learningHours: "అభ్యాస గంటలు", assessments: "మూల్యాంకనలు", measuredCapability: "ప్రస్తుతం కొలిచిన సామర్థ్యం", noMeasuredGaps: "ఇంకా కొలిచిన సామర్థ్య లోటులు లేవు.", noLearningItems: "ఇంకా నమోదు చేసిన అభ్యాస అంశాలు లేవు.", unavailable: "అందుబాటులో లేదు", competencyRadar: "సామర్థ్య రాడార్ ప్రొఫైల్", currentVsRequired: "ప్రస్తుత vs అవసరం", priorityGaps: "ప్రాధాన్యత సామర్థ్య లోటులు", bridgeGaps: "లోటు తగ్గించండి", viewPath: "మార్గం చూడండి", recommendedLearning: "మీ అభ్యాస పురోగతి", fullRoadmap: "పూర్తి రోడ్‌మ్యాప్", latestInsight: "తాజా మూల్యాంకన అంతర్దృష్టి", noAssessmentInsight: "కొలిచిన బలాలు మరియు మెరుగుదల ప్రాంతాలను చూడటానికి మూల్యాంకనం పూర్తి చేయండి.",
  frameworkBadge: "అధికారిక గణాంక సామర్థ్య ఫ్రేమ్‌వర్క్", frameworkTitle: "పాత్రకు అనుగుణమైన సామర్థ్య మ్యాట్రిక్స్", frameworkText: "అధికారిక గణాంక వ్యవస్థలో ఆశించే రంగాలలో ప్రస్తుత మరియు అవసరమైన స్థాయులను చూడండి.", proficiencyModel: "ఐదు-స్థాయి ప్రావీణ్య నమూనా", current: "ప్రస్తుత", required: "అవసరం", assessmentBadge: "అంచనా & నవీకరణ", assessmentTitle: "సామర్థ్య మూల్యాంకనం", assessmentText: "పాత్రకు అనుగుణమైన, మూల ఆధారిత మూల్యాంకనాలను పూర్తి చేయండి; ఫలితాలు మీ సామర్థ్య ప్రొఫైల్‌ను నవీకరిస్తాయి.",
  advisorBadge: "వివరణాత్మక సిఫారసులు", advisorTitle: "AI అభ్యాస సలహాదారు", advisorText: "సిఫారసులు లోటు తీవ్రత, పాత్ర, కెరీర్, విభాగ ప్రాధాన్యతలు, పూర్వ అభ్యాసం మరియు భవిష్యత్ డిమాండ్‌ను కలుపుతాయి.", whyCourse: "ఈ కోర్సు ఎందుకు?", enrollContinue: "నమోదు / కొనసాగించండి", learningBadge: "వ్యక్తిగత రోడ్‌మ్యాప్", learningTitle: "మీ అభ్యాస మార్గం", learningText: "క్రమబద్ధమైన మాడ్యూల్స్ అధునాతన అధికారిక గణాంక సామర్థ్యానికి ముందు అవసరమైన లోటులను తగ్గిస్తాయి.", notStarted: "ప్రారంభించలేదు", complete: "పూర్తి",
  igotBadge: "బాహ్య అభ్యాస ఎకోసిస్టమ్", igotTitle: "iGOT కర్మయోగి & NSSTA హబ్", igotText: "క్యాటలాగ్, నమోదు మరియు పూర్తి స్థితి అడాప్టర్ల ద్వారా చూపబడతాయి; అధికారిక API వచ్చే వరకు డెమో అంశాలు స్పష్టంగా గుర్తించబడతాయి.", mockSyncHealthy: "మాక్ సింక్ ఆరోగ్యంగా ఉంది", mockAdapters: "మాక్ అడాప్టర్లు", viewLearningItem: "అభ్యాస అంశం చూడండి", generatorBadge: "డివైస్‌పై ఆధారిత AI", generatorTitle: "AI మూల్యాంకన జనరేటర్ & అభ్యాస సహాయకుడు", generatorText: "ఆమోదిత మెటీరియల్ అప్‌లోడ్ చేసి, ఆధారాలను శోధించి, ప్రశ్నలు అడిగి, ప్రైవేట్ మూల్యాంకనాలు రూపొందించండి. మద్దతు ఉన్న బ్రౌజర్‌లో AI స్థానికంగా నడుస్తుంది.", pipeline: ["అప్‌లోడ్", "సెమాంటిక్ చంకింగ్", "విషయ గుర్తింపు", "మూల ధృవీకరణ", "మూల్యాంకనం"],
  trainerBadge: "NSSTA ఫ్యాకల్టీ కన్సోల్", trainerTitle: "ట్రైనర్ & ప్రశ్న బ్యాంక్ QA హబ్", trainerText: "రూపొందించిన ప్రశ్నలను సమీక్షించి, మూలాలను ధృవీకరించి, కోహార్ట్ బలహీన అంశాలను విశ్లేషించండి.", trainerDemo: "క్రింది ట్రైనర్ గణాంకాలు డెమో మాత్రమే; ఉత్పత్తి రికార్డులతో కలిసే వరకు నిజమైన డేటాగా పరిగణించవద్దు.", adminBadge: "వర్క్‌ఫోర్స్ సామర్థ్య మేధస్సు", adminTitle: "వర్క్‌ఫోర్స్ విశ్లేషణ", adminText: "MoSPI సామర్థ్య నిర్మాణ నాయకత్వానికి గోప్యతను కాపాడే సమగ్ర అంతర్దృష్టి.", adminUnavailable: "మీ ఖాతాకు అడ్మిన్ హక్కులు లేవు; ఉదాహరణ డెమో విశ్లేషణను వేరుగా చూపుతున్నాం.", superBadge: "నియంత్రిత సిస్టమ్ కార్యకలాపాలు", superTitle: "సూపర్ అడ్మిన్ కన్సోల్", superText: "ఇంటిగ్రేషన్ ఆరోగ్యం, ఆడిట్ మరియు డెమో అడాప్టర్ నియంత్రణలు; ఇవి ఉత్పత్తి అనుమతులను దాటవు.",
  reportsBadge: "ఆధారం & రిపోర్టింగ్", reportsTitle: "రిపోర్ట్ సెంటర్", reportsText: "సామర్థ్యం, మూల్యాంకనం మరియు అభ్యాస పురోగతికి వ్యక్తిగత మరియు సంస్థ రిపోర్టులు రూపొందించండి.", preview: "ప్రివ్యూ", export: "ఎగుమతి", profileBadge: "అధికారిక గుర్తింపు & కెరీర్ ప్రొఫైల్", profileText: "సిఫారసులు పాత్రకు అనుగుణంగా ఉండేందుకు హోదా, బాధ్యత, అర్హత మరియు అనుభవాన్ని తాజాగా ఉంచండి.", editProfile: "ప్రొఫైల్ సవరించండి", officialDetails: "అధికారిక వివరాలు", designation: "హోదా", department: "విభాగం", cadre: "కేడర్ / సేవ", assignment: "ప్రస్తుత బాధ్యత", qualification: "అత్యున్నత అర్హత", experience: "అనుభవం", notProvided: "ఇవ్వలేదు", competencyLearningSummary: "సామర్థ్య & అభ్యాస సారాంశం", priorTrainingHistory: "పూర్వ శిక్షణ & అభ్యాస చరిత్ర",
  groundedAssistant: "ఆధారిత సహాయకుడు", assistantTitle: "మీ అభ్యాస మెటీరియల్‌ను అడగండి", assistantText: "ఉత్పత్తి సహాయకుడు మీ ఖాతాకు చెందిన మెటీరియల్ ఆధారాలను మాత్రమే ఉపయోగించి మద్దతు ఉన్న బ్రౌజర్‌లో స్థానికంగా నడుస్తుంది.", askGrounded: "ఆధారిత ప్రశ్న అడగండి", generatePractice: "అభ్యాస క్విజ్ రూపొందించండి", viewCompetencyGaps: "సామర్థ్య లోటులు చూడండి", aiDisclaimer: "AI అవుట్‌పుట్ ఉపయోగానికి ముందు ధృవీకరించబడుతుంది; ఆధారం సరిపోకపోతే సమాధానాన్ని నివారిస్తుంది.",
  authSecure: "సురక్షిత అధికారిక ప్రవేశం", authCreate: "మీ సామర్థ్య ప్రొఫైల్ సృష్టించండి", authCreateHint: "మీ అధికారిక ప్రొఫైల్ నమోదు చేయండి. ఐచ్ఛిక కెరీర్ వివరాలు మెరుగైన సిఫారసులకు సహాయపడతాయి.", authStoryBadge: "భవిష్యత్‌కు సిద్ధమైన గణాంక వర్క్‌ఫోర్స్", authStoryTitle: "అంచనా, అభ్యాసం, సాధన మరియు వృద్ధికి ఒక సురక్షిత వేదిక.", authStoryText: "పాత్ర-ప్రత్యేక నైపుణ్య లోటులను మ్యాప్ చేసి, వివరణాత్మక అభ్యాస సిఫారసులు పొంది, సురక్షిత మూల్యాంకనాలతో మెరుగుదలను కొలవండి.", authFeatures: [["సామర్థ్య మేధస్సు", "గణాంక, సాంకేతిక, డిజిటల్ గవర్నెన్స్ మరియు ప్రవర్తనా సామర్థ్య మ్యాపింగ్."], ["iGOT + NSSTA అభ్యాసం", "అడాప్టర్ ఆధారిత క్యాటలాగ్ ద్వారా వ్యక్తిగత అభ్యాస మార్గాలు."], ["స్థానిక ఆధారిత AI", "చెల్లింపు AI ప్రొవైడర్ లేకుండా ప్రైవేట్ మెటీరియల్ సహాయం మరియు క్విజ్ జనరేషన్."]], designationLabel: "హోదా", departmentLabel: "విభాగం / సంస్థ", cadreLabel: "కేడర్ / సేవ", careerContext: "కెరీర్ & అభ్యాస సందర్భం జోడించండి", optionalRecommended: "ఐచ్ఛికం, సిఫారసు", assignmentLabel: "ప్రస్తుత పాత్ర / బాధ్యత", qualificationLabel: "అత్యున్నత అర్హత", experienceLabel: "అనుభవ సంవత్సరాలు", priorTrainingLabel: "పూర్వ శిక్షణ", demoPrivacy: "డెమో/హ్యాకథాన్ వాతావరణం. గోప్యమైన లేదా పరిమిత ప్రభుత్వ మెటీరియల్ అప్‌లోడ్ చేయవద్దు."
};

export const portalMessages: Record<Locale, PortalCopy> = { en, hi, te };
