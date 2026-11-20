@AGENTS.md

# Portfolio de Stéphane Konan

**Langue : toujours répondre en français**, y compris dans les messages de
fin de tâche et les résumés. Commentaires, commits et textes en français.

## Ce qu'il faut savoir avant de toucher au site

- **L'accueil est une application en un seul écran, sans cadre, sans défilement de
  page et sans en-tête** (`src/components/desk/`). Tout passe par des
  écrans adressés par le fragment d'URL (`#/realisations/resi/trace`) :
  `Desk.tsx` (transitions, Échap), `Home.tsx` (plan de travail, fiches
  cliquables, thème et langue au-dessus du titre, « Je » du titre qui
  ouvre le profil), `Dock.tsx` (juste sous le contenu, pas collé en bas :
  trois rubriques et « Plus », qui ouvre
  une fenêtre avec les huit),
  `screens.tsx` (`renderScreen` : un écran par adresse), `kit.tsx`
  (cadre d'écran, fil d'Ariane, `CardLink`). Un nouveau contenu s'ajoute
  comme un écran, jamais comme une section à faire défiler. L'accueil
  lui-même n'est pas une zone défilante.
- **Design « Atelier »** (jetons et composants dans
  `src/styles/global.css`) : plan clair sur grille technique fine, couleur principale **cyan** (`--signal` : `#0891b2` en clair, `#22d3ee` en sombre, texte posé dessus en `--on-signal` ; plus aucun bleu), cyan clair `--accent` / `chip-accent` pour les repères techniques, cartes blanches à filet
  gris, `folder`, `tile`, `chip`, `segmented`, `btn` / `btn-primary`,
  `field` ; une seule couleur d'action, le cyan. Pas de bordure noire épaisse ni d'ombre
  décalée.
- **Fiches Play Store** : `src/data/stores.ts` est généré depuis les
  `design/play-store*/fiche.txt` de Wadibu (mobile, livreur) et de Resi
  (pro, client) ; visuels compressés dans `public/stores/<appli>/`.
- Textes FR/EN dans `src/i18n/ui.ts` (le français fixe le type, l'anglais
  doit suivre clé pour clé).
- Vérifier avant de committer : `npm run typecheck` et `npm run lint`.
