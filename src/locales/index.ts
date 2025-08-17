import fr from "./fr.json";
import en from "./en.json";

export const translations = {
    fr: {
        ...fr,
        experience: {
            ...fr.experience,
        },
        projects: {
            ...fr.projects
        }
    },
    en: {
        ...en,
        experience: {
            ...en.experience,
        },
        projects: {
            ...en.projects
        }
    }
};

export const t = (lang: "fr" | "en") => translations[lang];
