# Carnet privé : mode d'emploi

Ce dossier est le texte en clair de l'espace privé du portfolio. Il n'est
jamais versionné (le dépôt GitHub est public). Ce qui part en ligne, c'est
`content/carnet.sealed.json`, sa version chiffrée.

## Écrire, relire, publier

1. Modifier les fichiers ici.
2. `npm run dev`, puis ouvrir `http://localhost:3000/<CARNET_PATH>` : en
   développement, les pages lisent ce dossier directement.
3. `npm run carnet:seal` pour chiffrer, puis commit et push de
   `content/carnet.sealed.json`. Sans ce scellement, la production garde
   l'ancienne version.

Sur une autre machine : récupérer `.env.local` (même `CARNET_SECRET`), puis
`npm run carnet:open` recrée ce dossier depuis le fichier scellé.

## Fichiers

- `articles/<slug>.md` : un article, servi à `/<CARNET_PATH>/<slug>`.
- `journal/AAAA-MM-JJ-jour-N.md` : une entrée du journal (voir
  `journal/_modele.md`).
- `chiffres.md` : les indicateurs du lancement et le début du plan de 30 jours.

Un fichier dont le nom commence par `_`, ou dont l'en-tête porte
`draft: true`, n'est pas affiché.

## En-tête d'un article

```yaml
title: "Titre"
description: "Résumé de 150 à 160 caractères, sert aussi de meta description"
date: 2026-10-08
maj: 2026-10-20          # facultatif : date de mise à jour
auteur: Stéphane Konan
ordre: 4                 # position dans l'ordre de lecture
categories: [wadibu, entrepreneuriat]
tags: [Wadibu, Agboville]
og_title: "Titre pour les aperçus de lien"        # facultatif
og_description: "Description pour les aperçus"    # facultatif
```

Catégories d'articles : `entrepreneuriat`, `wadibu`,
`developpement-personnel`, `sante`, `experiences`, `lecons`, `coulisses`.

Catégories du journal : `sante`, `wadibu`, `confiance`, `business`,
`technologie`, `lecons`.

## Blocs spéciaux

S'écrivent comme un bloc de code dont la « langue » donne le composant.

Frise (date, événement, ce que j'ai appris, prochaine étape). Une étape sans
`appris` ni `suite` s'affiche « À venir ». `statut: en-cours` la marque en
safran.

    ```progression
    etapes:
      - date: 2026-10-08
        evenement: Ce qui s'est passé
        appris: Ce que j'en ai tiré
        suite: Ce que je fais ensuite
      - date: Semaine 2
        evenement: Ce qui est prévu
    ```

Boucle d'étapes :

    ```cercle
    etapes:
      - Première étape
      - Deuxième étape
    note: Légende facultative
    ```

Deux colonnes :

    ```colonnes
    colonnes:
      - titre: Moi
        sous_titre: facultatif
        points: [un, deux]
      - titre: Wadibu
        points: [trois, quatre]
    ```

Indicateurs du lancement (lus dans `chiffres.md`), bloc vide :

    ```chiffres
    ```

Encadré de fin, 3 à 5 points :

    ```retiens
    points:
      - Premier point
    ```

## À compléter

`[[texte]]` s'affiche surligné avec la mention « À compléter ». Pour retrouver
tout ce qui reste à remplir : chercher `[[` dans ce dossier.

## Règle

Ne jamais écrire un chiffre, un restaurant, un résultat médical ou un
événement qui n'a pas eu lieu. Une case vide vaut mieux qu'un chiffre faux.
