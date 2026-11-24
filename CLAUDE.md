# Lucas Mathis Art — site Jekyll

Site vitrine de Lucas Mathis, photographe de mariages, de couples et de portraits en Alsace (Saverne, Strasbourg). Jekyll 4.4 sur GitHub Pages, domaine `www.lucathis.art`. Tout le contenu est en français.

Le `README.md` documente déjà les commandes, la structure, les conventions CSS, l'ajout d'un article, le visualiseur de photos et le référencement. Il fait foi : ne pas dupliquer ici.

## Règles de travail (prioritaires)

- Ne jamais lancer `git commit`, `git push`, `git merge`, `git rebase` ni `git reset`. Lucas relit lui-même les `git diff` et commite lui-même. À la fin d'une tâche, laisser les modifications dans l'arbre de travail et lister les fichiers modifiés.
- Ne pas faire non plus de `git add`, pour que `git diff` montre les changements sans manipulation.
- Travailler sur la branche courante (`dev`). Ne pas changer de branche sans demander.
- Ne supprimer aucun fichier sans demande explicite.
- Répondre en français.
- Ne modifier que ce qui est demandé. Signaler les autres constats au lieu de les corriger.
- Soigner l'orthographe et les accents des textes : Lucas y est attentif.

## Lancer et vérifier

- `bundle exec jekyll serve --livereload`, puis http://127.0.0.1:4000. Lucas lance en général le serveur lui-même. Jekyll régénère le site à chaque modification ; redémarrer après un changement de `_config.yml`.
- `_site/` et `.jekyll-cache/` sont générés : ne pas les éditer ni les commiter.
- Contrôler le rendu à trois largeurs : 1440 px, 800 px (limite mobile) et 375 px.

## Conventions de design à respecter

- Direction artistique : éditoriale et sobre. Les photos sont les vedettes, l'interface s'efface.
- Polices : EB Garamond (titres et texte), Source Sans 3 (étiquettes, boutons, liens d'action). Fond ivoire `#f8f6f1` avec texture papier, titres `#3d3630`, texte `#6a6056`. Utiliser les variables de `_sass/_tokens.scss`, pas de couleurs en dur.
- Points de rupture : mobile jusqu'à 800 px, tablette jusqu'à 1400 px, desktop au-delà (`_sass/_breakpoints.scss`). La limite de 800 px doit rester alignée avec `assets/js/script.js`.
- Flèches des liens : → pour les liens internes, ↗ uniquement pour les liens externes (Instagram). Décidé le 24 novembre 2026.
- En-tête de l'accueil : le lien Contact est un bouton (`.split-cta`). Le menu latéral des pages intérieures garde des liens simples, et le menu mobile est inchangé.
- Carrousel d'accueil : Glide 3.7.1 + `assets/js/home-carousel.js`, photos dans `_data/home_slides.yml`. La première photo est centrée en CSS (`--first-slide-ratio`) avant que le script monte le carrousel.
- Le contenu des pages et des articles est du HTML écrit à la main, sans CMS.

## Publication

D'après le README, le workflow GitHub Actions construit les pull requests et les pushes sur `migration/jekyll` et `main`, et ne déploie que `main`. Vérifier `.github/workflows/pages.yml` avant de supposer le comportement de `dev`.

Attention : Jekyll copie dans le site publié les fichiers `.md` placés à la racine, sauf s'ils sont listés dans `exclude` de `_config.yml`. Ajouter `CLAUDE.md` à cette liste, sinon ce fichier serait accessible sur `lucathis.art/CLAUDE.md`.
