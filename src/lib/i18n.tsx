// src/lib/i18n.tsx
// ♻ REPLACE (new file)
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "fr";

export const translations = {
  en: {
    // Nav
    home:       "Home",
    browse:     "Browse",
    report:     "Report",
    dashboard:  "Dashboard",
    messages:   "Messages",
    login:      "Login",
    logout:     "Logout",

    // Homepage hero
    heroHeading:   "Every loss has a story.",
    heroSub:       "Whether it's a phone, a wallet, or a loved one. We can help you find it.",
    reportItem:    "Report Item",
    browseReports: "Browse reports",
    recoveredAcross: "items recovered across Cameroon",

    // Homepage stats
    itemsRecovered:   "Items Recovered",
    communityMembers: "Community Members",
    citiesCovered:    "Cities Covered",
    recoveryRate:     "Recovery Rate",

    // What is Back2U
    whatIsBack2u:     "What is Back2U?",
    whatHeading:      "Over 2000+ items are lost in Cameroon daily.",
    whatHeadingSub:   "Most never come back.",
    exploreBack2u:    "Explore Back2U",

    // How it works
    howItWorks:    "How it works",
    howSub:        "From posting a report to recovering your item, here is exactly what happens.",
    step1Title:    "Post your report",
    step2Title:    "Find possible matches",
    step3Title:    "Verify and connect",
    step4Title:    "Recover and rate",

    // Pricing
    annualPass:    "Annual Pass",
    forLostOwners: "For lost item owners",
    perYear:       "per year",
    getAnnualPass: "Get Annual Pass",
    whyBack2u:     "Why Back2U",
    builtForCameroon: "Built for Cameroon",
    madeForWhere:  "Made for where you live",

    // Testimonials
    testimonials:   "Testimonials",
    whatCommSays:   "What our community says",

    // FAQ
    commonQuestions: "Common questions.",
    faqSub:          "Everything you need to know before getting started.",

    // Report page
    reportLostItem:  "Report a Lost Item",
    reportFoundItem: "Report a Found Item",
    reportMissing:   "Report Missing Person",
    titleLabel:      "Title",
    descLabel:       "Description",
    cityLabel:       "City",
    locationLabel:   "Location",
    photosLabel:     "Photos",
    submitReport:    "Submit Report",

    // Browse page
    searchPlaceholder: "Search reports...",
    allTypes:          "All types",
    lost:              "Lost",
    found:             "Found",
    missing:           "Missing",
    listView:          "List",
    mapView:           "Map",
    noResults:         "No reports found",
    contactOwner:      "Contact",
    viewDetails:       "View details",

    // Dashboard
    myReports:       "My Reports",
    guardianPoints:  "Guardian Points",
    activeReports:   "Active Reports",
    recovered:       "Recovered",
    subscription:    "Subscription",
    active:          "Active",
    expired:         "Expired",
    free:            "Free",
    renewSub:        "Renew Subscription",
    subscribe:       "Subscribe",
    postReport:      "Post Report",
    editReport:      "Edit",
    deleteReport:    "Delete",
    markRecovered:   "Mark Recovered",

    // Chat
    typeMessage:     "Type a message...",
    send:            "Send",
    itemRecovered:   "Item Recovered",
    confirmRecovery: "Item Recovered?",
    confirmText:     "Confirm that this item has been successfully returned. Both parties must confirm before it is marked as recovered.",
    notYet:          "Not Yet",
    yesConfirmed:    "Yes, Confirmed!",

    // Auth
    signIn:          "Sign In",
    createAccount:   "Create Account",
    emailAddress:    "Email address",
    password:        "Password",
    fullName:        "Full name",
    selectCity:      "Select your city",
    forgotPassword:  "Forgot password?",
    alreadyMember:   "Already a member?",
    noAccount:       "No account yet?",

    // Subscribe
    payViaMoMo:      "Pay via Mobile Money",
    phoneNumber:     "Phone number",
    payNow:          "Pay 300 XAF",

    // General
    loading:         "Loading...",
    cancel:          "Cancel",
    save:            "Save",
    back:            "Back",
    next:            "Next",
    done:            "Done",
    close:           "Close",
    confirm:         "Confirm",
    delete:          "Delete",
    edit:            "Edit",
    view:            "View",
    search:          "Search",
    filter:          "Filter",
    madeInCameroon:  "Made in Cameroon",
    // Report page
    reportPageHeading:   "Report a Lost Item",
    reportPageSub:       "Post free. Get matched. Recover faster.",
    whatReporting:       "What are you reporting?",
    whatReportingSub:    "Lost something, found something, or reporting a missing person?",
    missingPersonNote:   "Reporting a Missing Person?",
    missingFree:         "Always free, no fees ever for missing persons",
    iLostSomething:      "I Lost Something",
    iLostDesc:           "Post a lost report and get matched",
    iFoundSomething:     "I Found Something",
    iFoundDesc:          "Help someone recover their item",
    privacyLevel:        "Privacy Level",
    standard:            "Standard",
    standardDesc:        "Visible to all",
    sensitive:           "Sensitive",
    sensitiveDesc:       "Photo blurred",
    highRisk:            "High Risk",
    highRiskDesc:        "Admin review required",
    ownershipVerif:      "Ownership Verification",
    ownershipDesc:       "Optional — claimants must answer before chatting",
    addQuestions:        "Add Questions",
    continueBtn:         "Continue",
    stepOf:              "Step",
    of:                  "of",
    // Browse page
    filterCategory:      "Category",
    filterDate:          "Date",
    filterRadius:        "Radius",
    allCategories:       "All categories",
    // Dashboard
    guardianLevel:       "Guardian Level",
    recentActivity:      "Recent Activity",
    noReports:           "No reports yet",
    postFirstReport:     "Post your first report",
    // Chat
    noChats:             "No conversations yet",
    selectConversation:  "Select a conversation",
    // Auth
    welcomeBack:         "Welcome back",
    getStarted:          "Get started",
    // General UI
    or:                  "or",
    optional:            "Optional",
    required:            "Required",
    characters:          "characters",

    // Hero
    heroSubtitle:    "Whether it's a phone, a wallet, or a loved one. We can help you find it.",
    trustLine:       "items recovered across Cameroon",

    // What is Back2U body
    whatBody1:       "Whether it's taxis, schools, roads or other public spaces. We often assume they were stolen. In many cases, however, the people who find these items simply have no way of returning them to their rightful owners.",
    whatBody2:       "We built a platform where the person who finds your phone, wallet, document, bag, or any lost item can connect safely with the person who lost it. Beyond lost property, Back2U also supports missing-person searches, helping families and communities share information and work together to locate loved ones who have gone missing.",
    whatPoint1Title: "For people who lost something",
    whatPoint1Desc:  "Post a report, get matched, recover it. Your first report is free.",
    whatPoint2Title: "For people who find things",
    whatPoint2Desc:  "Post what you found, completely free forever. You earn trust points for honesty.",
    whatPoint3Title: "For families of missing persons",
    whatPoint3Desc:  "Post for free, no fees ever. Back2U helps surface the right people and information.",

    // ScrollReveal
    scrollHeading:   "Losing something doesn't mean it's gone forever.",
    scrollSub:       "With Back2U, recovery is no longer a matter of chance. Join a community dedicated to helping people recover lost items and reconnect missing loved ones.",

    // How it works steps desc
    step1Desc:       "Fill in a simple form, add photos, and indicate where the item was lost or found. Your first report is always free.",
    step2Desc:       "Back2U automatically looks for reports that may match yours and suggests potential connections.",
    step3Desc:       "Confirm ownership with a few questions, then securely connect with the finder or owner.",
    step4Desc:       "Get your item back, share your experience, and help build a trusted community.",
    howSubtitle:     "From posting a report to recovering your item, here is exactly what happens.",

    // Pricing
    pricingHeading:  "Simple pricing to trust us.",
    pricingSubtitle: "One fair price built for all.",
    pricingFeature1: "Post unlimited lost reports",
    pricingFeature2: "Contact any finder for free",
    pricingFeature3: "Found items always free",
    pricingFeature4: "Missing persons always free",
    pricingFeature5: "First lost report free",
    momoLine:        "MTN MoMo · Orange Money",
    whyReason1:      "First report is always free",
    whyReason2:      "Notified the moment a match is found",
    whyReason3:      "No phone numbers ever shared",
    whyReason4:      "Use Back2U in English or French",
    whyReason5:      "Honesty earns Guardian points",

    // Testimonials label
    testiLabel:      "Testimonials",

    // FAQ
    faqHeading:      "Common questions.",
    faqSubtitle:     "Everything you need to know before getting started.",
    faq1q:           "Is it free to use?",
    faq1a:           "Your first lost report is free. After that, a 300 XAF annual subscription gives you unlimited posts and contacts for 12 months. Found items and missing persons are always free.",
    faq2q:           "What if nobody has posted it yet?",
    faq2a:           "Your report stays active for 6 months. You get notified automatically the moment a match appears, even weeks later.",
    faq3q:           "Do I have to share my phone number?",
    faq3a:           "Never. Everything happens through Back2U private chat until both parties confirm the recovery.",
    faq4q:           "I found something. What should I do?",
    faq4a:           "Post a Found report with a photo and location. It is completely free. You earn 10 Guardian points just for helping.",
    faq5q:           "How does the matching work?",
    faq5a:           "Our system scores reports by keyword similarity, GPS proximity, date, and AI visual image similarity.",
    faq6q:           "What if my item is sensitive?",
    faq6a:           "Mark it Sensitive or High Risk when posting. Photos blur publicly. High Risk items are reviewed by admin before going live.",

    // CTA section
    ctaHeading:      "Lost something or someone?",
    ctaBody:         "First post free. 300 XAF/year for unlimited access. Missing persons always free.",
    ctaPost:         "Post free",

    // Footer
    footerTagline:   "Lost it? Report it. Found it? Return it.",
    footerDesc:      "From lost phones and wallets to missing documents and loved ones, Back2U helps communities across Cameroon reconnect what has been separated through trust, technology, and collective action.",
    footerCopyright: "kindness brings it back",
  },

  fr: {
    // Nav
    home:       "Accueil",
    browse:     "Parcourir",
    report:     "Signaler",
    dashboard:  "Tableau de bord",
    messages:   "Messages",
    login:      "Connexion",
    logout:     "Deconnexion",

    // Homepage hero
    heroHeading:   "Chaque perte a une histoire.",
    heroSub:       "Qu'il s'agisse d'un telephone, d'un portefeuille ou d'un proche. Nous pouvons vous aider a le retrouver.",
    reportItem:    "Signaler un objet",
    browseReports: "Parcourir les signalements",
    recoveredAcross: "objets retrouves au Cameroun",

    // Homepage stats
    itemsRecovered:   "Objets retrouves",
    communityMembers: "Membres de la communaute",
    citiesCovered:    "Villes couvertes",
    recoveryRate:     "Taux de recuperation",

    // What is Back2U
    whatIsBack2u:     "Qu'est-ce que Back2U ?",
    whatHeading:      "Plus de 2000 objets sont perdus au Cameroun chaque jour.",
    whatHeadingSub:   "La plupart ne reviennent jamais.",
    exploreBack2u:    "Explorer Back2U",

    // How it works
    howItWorks:    "Comment ca marche",
    howSub:        "Du depot d'un signalement a la recuperation de votre objet, voici exactement ce qui se passe.",
    step1Title:    "Deposer un signalement",
    step2Title:    "Trouver des correspondances",
    step3Title:    "Verifier et contacter",
    step4Title:    "Recuperer et evaluer",

    // Pricing
    annualPass:    "Abonnement annuel",
    forLostOwners: "Pour les proprietaires d'objets perdus",
    perYear:       "par an",
    getAnnualPass: "Souscrire",
    whyBack2u:     "Pourquoi Back2U",
    builtForCameroon: "Concu pour le Cameroun",
    madeForWhere:  "Fait pour votre region",

    // Testimonials
    testimonials:   "Temoignages",
    whatCommSays:   "Ce que dit notre communaute",

    // FAQ
    commonQuestions: "Questions frequentes.",
    faqSub:          "Tout ce que vous devez savoir avant de commencer.",

    // Report page
    reportLostItem:  "Signaler un objet perdu",
    reportFoundItem: "Signaler un objet trouve",
    reportMissing:   "Signaler une personne disparue",
    titleLabel:      "Titre",
    descLabel:       "Description",
    cityLabel:       "Ville",
    locationLabel:   "Emplacement",
    photosLabel:     "Photos",
    submitReport:    "Soumettre le signalement",

    // Browse page
    searchPlaceholder: "Rechercher des signalements...",
    allTypes:          "Tous les types",
    lost:              "Perdu",
    found:             "Trouve",
    missing:           "Disparu",
    listView:          "Liste",
    mapView:           "Carte",
    noResults:         "Aucun signalement trouve",
    contactOwner:      "Contacter",
    viewDetails:       "Voir les details",

    // Dashboard
    myReports:       "Mes signalements",
    guardianPoints:  "Points Gardien",
    activeReports:   "Signalements actifs",
    recovered:       "Recuperes",
    subscription:    "Abonnement",
    active:          "Actif",
    expired:         "Expire",
    free:            "Gratuit",
    renewSub:        "Renouveler l'abonnement",
    subscribe:       "S'abonner",
    postReport:      "Nouveau signalement",
    editReport:      "Modifier",
    deleteReport:    "Supprimer",
    markRecovered:   "Marquer comme recupere",

    // Chat
    typeMessage:     "Ecrire un message...",
    send:            "Envoyer",
    itemRecovered:   "Objet recupere",
    confirmRecovery: "Objet recupere ?",
    confirmText:     "Confirmez que cet objet a bien ete restitue. Les deux parties doivent confirmer pour que la recuperation soit validee.",
    notYet:          "Pas encore",
    yesConfirmed:    "Oui, confirme !",

    // Auth
    signIn:          "Se connecter",
    createAccount:   "Creer un compte",
    emailAddress:    "Adresse e-mail",
    password:        "Mot de passe",
    fullName:        "Nom complet",
    selectCity:      "Choisissez votre ville",
    forgotPassword:  "Mot de passe oublie ?",
    alreadyMember:   "Deja membre ?",
    noAccount:       "Pas encore de compte ?",

    // Subscribe
    payViaMoMo:      "Payer via Mobile Money",
    phoneNumber:     "Numero de telephone",
    payNow:          "Payer 300 XAF",

    // General
    loading:         "Chargement...",
    cancel:          "Annuler",
    save:            "Enregistrer",
    back:            "Retour",
    next:            "Suivant",
    done:            "Termine",
    close:           "Fermer",
    confirm:         "Confirmer",
    delete:          "Supprimer",
    edit:            "Modifier",
    view:            "Voir",
    search:          "Rechercher",
    filter:          "Filtrer",
    madeInCameroon:  "Fait au Cameroun",
    // Report page
    reportPageHeading:   "Signaler un objet perdu",
    reportPageSub:       "Gratuit. Matched. Recuperez plus vite.",
    whatReporting:       "Que signalez-vous ?",
    whatReportingSub:    "Vous avez perdu quelque chose, trouve quelque chose, ou signalez une personne disparue ?",
    missingPersonNote:   "Signaler une personne disparue ?",
    missingFree:         "Toujours gratuit, sans aucun frais pour les personnes disparues",
    iLostSomething:      "J'ai perdu quelque chose",
    iLostDesc:           "Deposez un signalement et obtenez une correspondance",
    iFoundSomething:     "J'ai trouve quelque chose",
    iFoundDesc:          "Aidez quelqu'un a recuperer son bien",
    privacyLevel:        "Niveau de confidentialite",
    standard:            "Standard",
    standardDesc:        "Visible par tous",
    sensitive:           "Sensible",
    sensitiveDesc:       "Photo floutee",
    highRisk:            "Tres sensible",
    highRiskDesc:        "Verification admin requise",
    ownershipVerif:      "Verification de propriete",
    ownershipDesc:       "Facultatif — les demandeurs doivent repondre avant de discuter",
    addQuestions:        "Ajouter des questions",
    continueBtn:         "Continuer",
    stepOf:              "Etape",
    of:                  "sur",
    // Browse page
    filterCategory:      "Categorie",
    filterDate:          "Date",
    filterRadius:        "Rayon",
    allCategories:       "Toutes les categories",
    // Dashboard
    guardianLevel:       "Niveau Gardien",
    recentActivity:      "Activite recente",
    noReports:           "Aucun signalement pour l'instant",
    postFirstReport:     "Deposer votre premier signalement",
    // Chat
    noChats:             "Aucune conversation pour l'instant",
    selectConversation:  "Selectionnez une conversation",
    // Auth
    welcomeBack:         "Bon retour",
    getStarted:          "Commencer",
    // General UI
    or:                  "ou",
    optional:            "Facultatif",
    required:            "Obligatoire",
    characters:          "caracteres",

    // Hero
    heroSubtitle:    "Qu'il s'agisse d'un telephone, d'un portefeuille ou d'un proche. Nous pouvons vous aider a le retrouver.",
    trustLine:       "objets retrouves au Cameroun",

    // What is Back2U body
    whatBody1:       "Dans les taxis, les ecoles, les routes ou autres espaces publics. On suppose souvent qu'ils ont ete voles. Pourtant, dans bien des cas, les personnes qui trouvent ces objets n'ont simplement aucun moyen de les restituer a leurs proprietaires.",
    whatBody2:       "Nous avons cree une plateforme permettant a la personne qui trouve votre telephone, portefeuille, document ou sac de se connecter en toute securite avec la personne qui l'a perdu. Au-dela des objets perdus, Back2U soutient egalement les recherches de personnes disparues.",
    whatPoint1Title: "Pour les personnes ayant perdu quelque chose",
    whatPoint1Desc:  "Deposez un signalement, obtenez une correspondance, recuperez votre objet. Votre premier signalement est gratuit.",
    whatPoint2Title: "Pour les personnes qui trouvent des objets",
    whatPoint2Desc:  "Postez ce que vous avez trouve, completement gratuit pour toujours. Vous gagnez des points de confiance pour votre honnetete.",
    whatPoint3Title: "Pour les familles de personnes disparues",
    whatPoint3Desc:  "Postez gratuitement, sans aucun frais. Back2U aide a identifier les bonnes personnes et informations.",

    // ScrollReveal
    scrollHeading:   "Perdre quelque chose ne signifie pas le perdre pour toujours.",
    scrollSub:       "Avec Back2U, la recuperation n'est plus une question de chance. Rejoignez une communaute dediee a aider les gens a retrouver leurs objets perdus.",

    // How it works
    step1Desc:       "Remplissez un formulaire simple, ajoutez des photos et indiquez ou l'objet a ete perdu ou trouve. Votre premier signalement est toujours gratuit.",
    step2Desc:       "Back2U recherche automatiquement les signalements susceptibles de correspondre au votre et suggere des connexions potentielles.",
    step3Desc:       "Confirmez la propriete avec quelques questions, puis connectez-vous en toute securite avec le trouveur ou le proprietaire.",
    step4Desc:       "Recuperez votre objet, partagez votre experience et aidez a construire une communaute de confiance.",
    howSubtitle:     "Du depot d'un signalement a la recuperation de votre objet, voici exactement ce qui se passe.",

    // Pricing
    pricingHeading:  "Tarification simple et transparente.",
    pricingSubtitle: "Un prix equitable pour tous.",
    pricingFeature1: "Signalements d'objets perdus illimites",
    pricingFeature2: "Contacter n'importe quel trouveur gratuitement",
    pricingFeature3: "Objets trouves toujours gratuits",
    pricingFeature4: "Personnes disparues toujours gratuites",
    pricingFeature5: "Premier signalement perdu gratuit",
    momoLine:        "MTN MoMo · Orange Money",
    whyReason1:      "Le premier signalement est toujours gratuit",
    whyReason2:      "Notifie des qu'une correspondance est trouvee",
    whyReason3:      "Aucun numero de telephone jamais partage",
    whyReason4:      "Utilisez Back2U en anglais ou en francais",
    whyReason5:      "L'honnetete rapporte des points Gardien",

    // Testimonials
    testiLabel:      "Temoignages",

    // FAQ
    faqHeading:      "Questions frequentes.",
    faqSubtitle:     "Tout ce que vous devez savoir avant de commencer.",
    faq1q:           "Est-ce gratuit ?",
    faq1a:           "Votre premier signalement perdu est gratuit. Ensuite, un abonnement annuel de 300 XAF vous donne des publications et contacts illimites pendant 12 mois.",
    faq2q:           "Que faire si personne n'a encore signale mon objet ?",
    faq2a:           "Votre signalement reste actif pendant 6 mois. Vous etes notifie automatiquement des qu'une correspondance apparait.",
    faq3q:           "Dois-je partager mon numero de telephone ?",
    faq3a:           "Jamais. Tout se passe via le chat prive Back2U jusqu'a ce que les deux parties confirment la recuperation.",
    faq4q:           "J'ai trouve quelque chose. Que dois-je faire ?",
    faq4a:           "Deposez un signalement Trouve avec une photo et une localisation. C'est completement gratuit. Vous gagnez 10 points Gardien.",
    faq5q:           "Comment fonctionne la mise en correspondance ?",
    faq5a:           "Notre systeme evalue les signalements par similarite de mots-cles, proximite GPS, date et similarite d'image par IA.",
    faq6q:           "Que faire si mon objet est sensible ?",
    faq6a:           "Marquez-le comme Sensible ou Tres sensible lors du depot. Les photos sont floutees publiquement.",

    // CTA
    ctaHeading:      "Vous avez perdu quelque chose ou quelqu'un ?",
    ctaBody:         "Premier signalement gratuit. 300 XAF/an pour un acces illimite. Personnes disparues toujours gratuites.",
    ctaPost:         "Signaler gratuitement",

    // Footer
    footerTagline:   "Perdu ? Signalez-le. Trouve ? Rendez-le.",
    footerDesc:      "Des telephones et portefeuilles perdus aux documents et proches disparus, Back2U aide les communautes du Cameroun a se reconnnecter.",
    footerCopyright: "la gentillesse le ramene",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("back2u_lang") as Lang | null;
    if (stored === "en" || stored === "fr") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("back2u_lang", l);
  };

  const t = (key: TranslationKey): string => {
    return (translations[lang] as any)[key] ?? translations.en[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}