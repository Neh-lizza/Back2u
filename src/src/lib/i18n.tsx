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