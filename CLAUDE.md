# CLAUDE.md — Site de Lucas Mathis Art (lucathis.art)

Site vitrine de Lucas Mathis, photographe de mariages, de couples et de portraits en Alsace (Lucas habite entre Saverne et Strasbourg). Jekyll 4.4 sur GitHub Pages, domaine `www.lucathis.art`. Tout le contenu est en français.

Ce fichier donne à Claude Code le contexte, l'analyse déjà faite et les règles de travail. À lire en entier avant toute modification. Le `README.md` documente déjà les commandes, la structure, les conventions CSS, l'ajout d'un article, le visualiseur de photos et le référencement : il fait foi, ne pas le dupliquer ici. La suite du travail prévu est décrite dans `PASSATION.md`.

## 1. Règles de travail (prioritaires)

### En local (Claude Code sur le Mac de Lucas)

- Ne jamais lancer `git commit`, `git push`, `git merge`, `git rebase` ni `git reset`. Lucas relit lui-même les `git diff` et commite lui-même. À la fin d'une tâche, laisser les modifications dans l'arbre de travail et lister les fichiers modifiés.
- Ne pas faire non plus de `git add`, pour que `git diff` montre les changements sans manipulation.
- Travailler sur la branche courante (`dev`). Ne pas changer de branche sans demander.

### Dans une session cloud (Claude Code sur le web, projets claude.ai)

- Lucas n'a pas d'arbre de travail à relire : travailler sur une branche `claude/…`, par petits commits lisibles, et ouvrir une pull request vers `dev` pour relecture.
- Ne jamais pousser sur `main` ni sur `dev`, ne jamais fusionner une PR, pas de force push.

### Partout

- Ne supprimer aucun fichier sans demande explicite.
- Répondre en français.
- Ne modifier que ce qui est demandé. Signaler les autres constats au lieu de les corriger.
- Soigner l'orthographe et les accents des textes : Lucas y est attentif.
- Ne rien publier ni déployer sans demande explicite (tout ce qui arrive sur `main` est déployé, voir §3).
- Rendre compte brièvement : ce qui a changé, où, ce qu'il reste à valider par Lucas.
- **Ne pas réécrire la voix de Lucas** : on corrige, on structure, on propose. Les nouveaux textes sont soumis à relecture.
- **Ne jamais inventer de faits** : tarifs, durées de couverture, nombre de photos, délais de livraison, références, avis, chiffres. Tout élément inconnu est marqué `[à compléter]` et on interroge Lucas.
- Photos de clients (noms, visages) : ne pas ajouter de données personnelles non déjà publiées.

## 2. Lancer et vérifier

- `bundle exec jekyll serve --livereload`, puis http://127.0.0.1:4000. Lucas lance en général le serveur lui-même. Jekyll régénère le site à chaque modification ; redémarrer après un changement de `_config.yml`.
- `_site/` et `.jekyll-cache/` sont générés : ne pas les éditer ni les commiter.
- Contrôler le rendu à trois largeurs, **mobile d'abord** (les futurs mariés consultent surtout sur téléphone) : 375 px, 800 px (limite mobile) et 1440 px.
- Vérifier les URL de production avec `JEKYLL_ENV=production bundle exec jekyll build`. Aucun lien ne doit pointer vers `http://127.0.0.1:4000/…` (un brouillon de Prestations en contenait ; le dépôt n'en contient aucun au 25 novembre 2026). Les liens internes passent par `relative_url`.

## 3. Techno et publication

- Jekyll 4.4 (`Gemfile`), sans thème gem : layouts dans `_layouts/` (`default`, `page`, `article`, `profile`), morceaux partagés dans `_includes/`, styles Sass dans `_sass/` compilés en `/assets/css/styles.css`, scripts dans `assets/js/`.
- Le contenu des pages et des articles est du HTML écrit à la main, sans CMS. Les articles sont des pages ordinaires (`layout: article`) dans `articles/`, pas des posts Jekyll.
- Données : `_config.yml` (e-mail, Instagram), `_data/navigation.yml` (menu, une liste par langue), `_data/translations.yml` (textes d'interface par langue).
- Version anglaise retirée le 27 novembre 2026 (trop de travail à maintenir pour l'instant ; Lucas la réintroduira peut-être). Le site est en français seulement. La dernière version bilingue est dans le commit `481e3bc` (branche `traduction`) ; une copie avec l'anglais britannique relu est gardée hors du dépôt. Restent, pour pouvoir la rétablir : `lang` dans `_config.yml`, `ref` dans le front matter, textes d'interface et menu rangés sous la clé `fr` (`_data/translations.yml`, `_data/navigation.yml`). Voir la section « English version (removed) » du README.
- Déploiement : `.github/workflows/pages.yml` construit les pushes sur `main` et `migration/jekyll` et les pull requests **vers `main`**, et ne déploie que les pushes sur `main`. Une PR vers `dev` ne déclenche donc pas de build : construire en local pour vérifier.
- Flux de branches observé : travail sur `dev` (ou `article/…`), puis PR `dev` → `main`.
- Jekyll copie dans le site publié les fichiers `.md` placés à la racine, sauf s'ils sont listés dans `exclude` de `_config.yml`. `CLAUDE.md` et `PASSATION.md` y sont listés : faire de même pour tout nouveau document interne.
- Le README mentionne encore la branche `migration/jekyll` (installation, workflow). Elle n'existe plus sur le dépôt : passages obsolètes, à nettoyer un jour.

## 4. Le projet en bref

- **Site :** https://www.lucathis.art/ (nom commercial : « Lucas Mathis Art »).
- **Objectif du site :** rassurer des futurs mariés et des couples, montrer un regard, et les amener à écrire à Lucas (conversion = premier e-mail).
- **Rôle de Claude :** consultant en design graphique et rédaction, puis exécutant des évolutions du site, en gardant la voix et les choix du photographe.

### Structure actuelle

| Page | Fichier / URL | Rôle |
|---|---|---|
| Accueil | `index.html` → `/` | Navigation latérale comme les autres pages, phrase d'accroche, **la une d'un journal** (cathédrale en tête, articles choisis à la main, lien « Tous les reportages »), rangée Prestations, extrait « À propos », invitation à écrire. L'ancien carrousel (Glide) a été supprimé le 25 novembre 2026 ; il reste dans l'historique git |
| (ancien Portfolio) | `articles.html` | Redirige vers `/#a-la-une`, `noindex` |
| Portfolio (ex-Archives) | `portfolio.html` (`archives.html` redirige) | « Au fil des rencontres », en sommaire de magazine (27 novembre 2026) : liste générée automatiquement (tri par `publication_order`), une grande photo pleine largeur puis deux côte à côte, en alternance ; Une variante « mur » sur toute la largeur de la fenêtre a été essayée et écartée par Lucas le 27 novembre 2026. sous chaque photo, catégorie · lieu, titre et une phrase (`accroche` du front matter, reprise des cartes de l’accueil). Plus de filtres ni de lots (`archive.js`, `archive-entry.html` et `_archive.scss` ne servent plus). Images en WebP comme partout sur le site (voir §5, « Images »). Zoom au survol réactivé. Lien « Portfolio » du menu |
| Prestations | `prestations.html` | Trois offres sans tarif : mariage, fiançailles, couple |
| À propos | `a-propos.html` (layout `profile`) | Parcours, approche, formation auprès d'une photographe américaine (Leslie Maron) |
| Contact | `contact.html` (layout `profile`) | E-mail uniquement (`hello@lucathis.art`) + Instagram `@lucasmathisart` |
| Mentions légales | `mentions-legales.html` | `noindex`, non analysée |

Articles (`articles/`, catégorie entre parenthèses) :
1. `mariage-laure-et-nicolas.html` (Mariage) : portraits de couple entre la cérémonie et la fête (palais Rohan)
2. `fiancailles-orangerie.html` (Fiançailles) : Julie et Adrien, parc de l'Orangerie
3. `mariage-cathedrale-strasbourg.html` (Mariage) : cérémonie de Laure et Nicolas à la cathédrale (crypte / chapelle Saint-Laurent)
4. `portraits-en-automne.html` (Séance de couple) : Mathilde et Tanguy, Neustadt, avec une grossesse

Le bloc d'invitation commun à toutes les pages est `_includes/contact-invitation.html`.

## 5. Conventions de design à respecter

- Direction artistique : éditoriale et sobre. Les photos sont les vedettes, l'interface s'efface.
- Polices : EB Garamond (titres et texte), Source Sans 3 (étiquettes, boutons, liens d'action). Fond ivoire `#f8f6f1` avec texture papier, titres `#3d3630`, texte `#6a6056`. Utiliser les variables de `_sass/_tokens.scss`, pas de couleurs en dur.
- Points de rupture du contenu : mobile jusqu'à 800 px, tablette jusqu'à 1400 px, desktop au-delà (`_sass/_breakpoints.scss`). La limite de 800 px doit rester alignée avec `assets/js/script.js`.
- Navigation (décidée le 26 novembre 2026, `_sass/_breakpoints.scss`, `_header.scss`, `_navigation.scss`) : à toutes les largeurs, l'en-tête présente le titre centré dans la fenêtre, avec Accueil, Portfolio et Prestations à sa gauche, À propos et Contact à sa droite, Contact en bouton (27 novembre 2026 ; clés `side` et `cta` de `_data/navigation.yml`). Jusqu'à 1200 px (limite alignée avec `assets/js/script.js`), les liens laissent place au bouton du menu mobile, toujours à droite ; en dessous, les liens ne tiendraient pas à côté du titre centré. Dans cette plage (décidé le 26 novembre 2026), le titre passe à gauche et le bouton du menu reste à droite ; sur l'accueil, le sous-titre se place sous le titre, au-dessus du filet, et la réduction ne fait que le replier et amincir l'en-tête (le titre garde sa taille et sa place). Le menu latéral et la disposition « en ligne » avec titre à gauche ont été abandonnés.
- Flèches des liens : → pour les liens internes, ↗ uniquement pour les liens externes (Instagram). Décidé le 24 novembre 2026.
- Typographie fine (26 novembre 2026) : `_plugins/typographie.rb` transforme chaque page à la construction, sans toucher aux sources. Partout, l'apostrophe droite entre deux lettres devient ’ ; sur les pages en français, les espaces déjà présentes avant `;` `!` `?` `»` et après `«` deviennent des espaces fines insécables, et celle avant `:` une espace insécable. On peut donc écrire les textes simplement. Chiffres elzéviriens dans le texte courant, césure légère sur mobile (`_base.scss`). Redémarrer `jekyll serve` après une modification du plugin.
- Rythme vertical (26 novembre 2026) : une seule échelle dans `_sass/_tokens.scss` (`--space-section`, `--space-section-inner`, `--space-block`, `--space-heading`, `--space-heading-after`), réduite sur mobile. L'utiliser pour tout nouvel espacement entre parties. Les filets de séparation occupent toute la largeur du contenu.
- Détails (26 novembre 2026, revus le 27) : les cartes de l'accueil et du portfolio ne sont pas cliquables en entier, un indice de survol n'apparaît que sur le lien survolé (le titre change seulement de couleur ; la photo grossit légèrement quand on la survole elle-même). Les liens texte (`.text-link`) : au survol, le soulignement se rétracte vers le début des mots et la flèche avance un peu. En fin d'article, où toute la carte est un lien, le titre se souligne au survol de la carte ; la série des reportages y boucle (à partir de trois). Tous les boutons partagent la transition `--button-transition` (`_tokens.scss`) ; un bouton plein signifie un contact. Voir `_motion.scss`, sans mouvement si l'animation réduite est demandée. Deux filets (un court au-dessus d'un long, `ornament.html type="filets"`) closent chaque article ; ils remplacent le fleuron le 27 novembre 2026.
- En-tête : toutes les pages, accueil compris, utilisent le même en-tête et la même navigation (voir ci-dessus). Depuis le 26 novembre 2026, cet en-tête est fixé en haut de la fenêtre (`_sass/_masthead.scss`, `initializeMasthead` dans `assets/js/script.js`). Sur l'accueil seulement, il s'ouvre en grand format : titre en Cormorant Garamond, traversé à mi-hauteur par le filet qui s'interrompt de chaque côté, et sous-titre « Photographe de mariages et de couples en Alsace » en Source Sans, qui est le H1 de l'accueil ; dès le défilement, il s'affine et le sous-titre s'efface. Sur toutes les autres pages, il est d'emblée dans sa version fine, sans sous-titre, pour ne pas concurrencer le H1 de la page. Titres de pages et d'articles (H1, cartes, liste du Portfolio, fin d'article) en Cormorant Garamond graisse 500 (`--font-display`) ; intertitres et texte en EB Garamond. L'en-tête du menu mobile reprend la disposition de l'en-tête (sélecteur, titre, bouton de fermeture à la place du bouton de menu), ainsi que sa hauteur et la taille de son titre au moment de l'ouverture. L'ancien en-tête d'accueil à liens partagés et bouton Contact (`.split-cta`) a été supprimé le 25 novembre 2026, avec le carrousel Glide.
- Images (27 novembre 2026) : chaque JPEG de `images/` a ses versions WebP (`photo-800.webp`, `-1600`, `-2400`), faites par `scripts/vignettes.sh` (à lancer pour tout nouvel article ; nécessite `brew install webp`). `_plugins/images-webp.rb` ajoute à la construction `srcset`, `sizes` et `data-viewer-src` à chaque `<img>` : on continue d'écrire `src="…jpg"`. Le JPEG reste la version de secours et l'image Open Graph. Les anciennes `-800.jpg` et `-1600.jpg` des couvertures ont été supprimées le 27 novembre 2026. **Qualité de compression WebP : jamais en dessous de 80** (règle de Lucas, 27 novembre 2026). Un essai à 62 (jusqu'à 800 px) et 72 (au-delà) a été jugé trop dégradé à l'écran et annulé.
- Accessibilité et SEO : un seul H1 par page, méta-descriptions uniques, Open Graph cohérents (gérés par `_includes/head.html` à partir du front matter), liens explicites.
- Référencement local (27 novembre 2026) : viser « Strasbourg » plutôt que « Alsace » dans les titres, H1 et descriptions (bien plus recherché) ; garder « partout en Alsace » pour la zone couverte. Dans les textes de présentation, Lucas est « installé près de Strasbourg » (il habite entre Saverne et Strasbourg).
- Données structurées (27 novembre 2026) : `_includes/schema.html` (appelé par `head.html`) produit le JSON-LD de chaque page : site, entreprise (`ProfessionalService` à zone desservie, sans adresse publiée), Lucas (`Person`), reportage (`BlogPosting`) sur les articles, fil d'Ariane hors accueil et pages `noindex`. Les informations de l'entreprise (nom, zones, tarifs) sont sous `business` dans `_config.yml` : les garder identiques à la future fiche Google Business Profile. Chaque article porte `date:` (AAAA-MM-JJ, date de son premier commit, non affichée) et peut recevoir `last_modified_at:` : repris dans le JSON-LD et en `<lastmod>` dans `sitemap.xml`. À renseigner pour tout nouvel article. Première photo de chaque page en `fetchpriority="high"`. Page `404.html` en français (`noindex`).
- **Textes alternatifs** : ceux du site sont exemplaires (précis, descriptifs). En écrire de même niveau pour tout nouveau visuel.

## 6. Ce que le site essaie de faire

Un site de photographe de mariage orienté **relation** plutôt que démonstration : le client achète d'abord une personne, discrète et bienveillante. Thèse récurrente : photographier la manière dont deux personnes se regardent, se touchent, se tiennent (regards, gestes, mains, complicité). Le portfolio « en journal » et le vocabulaire (« reportage », « Au fil des rencontres ») portent une promesse d'**intention artistique + narration journalistique**.

## 7. Analyse de consultant (faite en conversation, sur le texte seul)

Cette analyse repose sur le **texte** public des pages (structure, copie, alt). Le **rendu visuel** (couleurs, typographie, grille, rythme, mobile, performance perçue) n'a **pas** encore été évalué.

### Points forts
- Positionnement lisible dès la page d'accueil.
- Voix très cohérente : chaleureuse, posée, première personne, vouvoiement.
- Textes alternatifs des images exemplaires.
- Titres d'articles en questions qui répondent à de vraies interrogations de futurs mariés.
- Page Contact très bonne : elle dit quoi écrire (date, lieu, envies, hésitations) et lève la peur de ne pas savoir poser.
- Idée forte du **portfolio en une de journal**, cohérente avec la promesse journalistique.
- Le **reportage de la cathédrale** est l'article le plus abouti : narratif, descriptif, avec un paragraphe pratique sourcé. Il montre une aisance rare dans les mariages religieux traditionnels (créneau différenciant en Alsace, aujourd'hui sous-exploité).
- Bases SEO saines (méta-descriptions, Open Graph, canoniques, sitemap).

### Points faibles
1. **Prestations** : aucun tarif, aucune formule, aucun délai, aucun déroulé. Une version avec prix « à partir de » est prête (annexe de `PASSATION.md`).
2. **Contact** : e-mail seul. Pas de formulaire guidé, pas d'engagement de délai de réponse.
3. **Aucune preuve sociale** : ni avis ni témoignage ni chiffre.
4. **Peu de contenu** : 4 articles, dont 2 sur le même couple (Laure et Nicolas), soit 3 histoires de couple. Les archives proposent filtres par thème et chargement par lots pour un volume qui ne le justifie pas encore.
5. **Le portfolio met en une un portrait de couple**, pas un reportage de mariage. Pour un visiteur qui cherche un photographe de mariage, l'ordre est inversé.
6. **Aucun reportage de mariage complet** (préparatifs → cérémonie → vin d'honneur → soirée). Celui de la cathédrale ne couvre que la cérémonie.
7. **« Portraits » a disparu** : `_config.yml` (description, pied de page) annonce « mariages, couples et portraits », les prestations n'offrent que mariage, fiançailles et couple.
8. **Formules qui se répètent** d'un article à l'autre (« Je crois profondément que… », « les photos prennent de la valeur avec les années », « vous reconnaître »).
9. **Le même bloc d'invitation** (`contact-invitation.html`) est repris mot pour mot partout et ne s'adapte pas à l'article.
10. **Le hero est un carrousel**, souvent peu regardé au-delà de la première image (il n'y a pas de défilement automatique). Réglé le 25 novembre 2026 : l'accueil ouvre sur la une du journal.
11. **Les articles de conseil ne sont pas du reportage** : les tons diffèrent (pédagogique vs narratif). À séparer ou à assumer.

### Constats techniques (lecture du dépôt)
- `images/` pèse environ 29 Mo : 51 JPEG, versions WebP et `srcset` sur toutes les pages depuis le 27 novembre 2026 (environ 75 % de poids d'images en moins).
- Polices auto-hébergées en TTF variables (environ 2,6 Mo) : un passage en WOFF2 allégerait nettement.
- Données structurées JSON-LD ajoutées le 27 novembre 2026 (voir §5). Favicon ajouté le même jour : « L » ivoire sur charbon en Cormorant Garamond (`favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` à la racine, autres tailles dans `assets/icons/`, liens dans `head.html`).

### Coquilles

Corrigées par la PR #28 (`dev` → `main`, ouverte au 25 novembre 2026) : « un petit mot **de** ce que » dans le bloc d'invitation ; dans `prestations.html` « profondément », « lors d'une promenade », « ou un lieu » ; « célébrer » dans le portfolio. « donnaient à » était déjà juste.

Corrigées le 25 novembre 2026 dans l'arbre de travail local, avec un scan complet du site (« séance de fiançailles », « arrière-plan », « portrait en pied », « par-dessus », « bulles de savon », « donnaient à », « regard : je suis », « rue du Moulin », minuscule après les deux-points du titre de Laure et Nicolas). Liste d'origine :
- `articles/fiancailles-orangerie.html` : « suffisament » → suffisamment ; **« +1. » parasite** après « promenade à deux… » ; « couleurs des parc » → parcs ; « tout aussi important » → « tout aussi importante » (rapporté à « la décision »).
- `articles/portraits-en-automne.html` : « Mathile » → Mathilde (2 alts) ; « Ginko » → Ginkgo (alt) ; « chercher a fabriquer » → « à fabriquer ».
- `articles/mariage-laure-et-nicolas.html` : « ballustrade » → balustrade (alt).
- `articles/mariage-cathedrale-strasbourg.html` : « receuillement » → recueillement (alt) ; « chefs-d'oeuvre » → chefs-d'œuvre ; « Choeur » → Chœur (alt).
- `archives.html` : « étincellants » → étincelants.
- Faire aussi un passage global (alts, méta-descriptions, `og:description`, `_config.yml`).

## 8. Guide de ton et de rédaction

- **Vouvoiement**, première personne (« je »), phrases douces et concrètes.
- Vocabulaire du site : lien, regard, gestes, complicité, faire connaissance, prendre le temps, se reconnaître, discret, bienveillant, soucieux du détail.
- **Varier** les formules récurrentes. Garder « Je crois… » là où il compte, pas à chaque page.
- Typographie française : accents sur les majuscules (À, É), apostrophes typographiques (’), guillemets « », espaces insécables avant `:` `;` `?` `!` : ajoutées automatiquement à la construction (voir §5, « Typographie fine »), il suffit d'écrire une espace ordinaire.
- Différencier **conseil** (articles pédagogiques) et **reportage** (récit d'une journée).
- Tarifs confirmés : **Reportage de mariage « à partir de 950 € »**, **Séance de fiançailles « à partir de 150 € »**, **Séance de couple « à partir de 150 € »**.

### Faits confirmés par Lucas (25 novembre 2026)

Seules informations utilisables sur les prestations ; tout le reste reste à demander.

- **Mariage :** forfait de base de 950 € pour 6 h : cérémonie, photos officielles et vin d'honneur. Au-delà, **100 € par heure supplémentaire** (préparatifs, soirée), jusqu'à 12 h environ.
- **Séances (fiançailles, couple) :** environ une heure.
- **Volume :** une centaine de photos par heure de couverture, pour chaque offre.
- **Livraison :** sous 4 semaines, galerie numérique privée protégée par mot de passe, liens de téléchargement en taille web et en haute résolution. Toujours en couleurs et en noir et blanc. Les clients utilisent les photos comme ils le veulent.
- **Premier e-mail :** réponse sous 48 h.
- **Faire connaissance :** un appel ou un échange par SMS ; pour un mariage, Lucas conseille une rencontre dans un café.
- **Déplacements hors Alsace :** frais sur devis.
- **Droits sur les photos :** les photos restent la propriété de Lucas ; les clients peuvent en faire ce qu'ils veulent. Ne jamais écrire qu'elles « appartiennent » aux clients ni parler de cession de droits. Lucas a le statut d'artisan (pas artiste-auteur) et doit vérifier lui-même le cadre juridique avant toute formulation plus précise.
- **Ton :** Lucas trouve lourdes les formulations administratives (« jusqu'à environ le double ») : préférer des phrases à la première personne, simples et chaleureuses, comme le reste du site.
- **Réservation :** le plus tôt possible pour s'assurer qu'il est libre, mais dans le doute il suffit de demander.

## 9. Priorités d'évolution (par ordre)

1. **Passe de correction** : coquilles restantes (§7).
2. **Page Prestations** : nouvelle version intégrée le 25 novembre 2026 (sommaire des offres, « Ce qui est inclus », « Comment ça se passe », FAQ repliable), rendu validé par Lucas. Le lien « Lire le détail d'un mariage pas à pas » est en commentaire dans `prestations.html`, à réactiver quand la page existera. La classe `.a-completer` (`_sass/_services.scss`) signale visiblement une information manquante.
3. **Contact** : formulaire guidé (date, lieu, type de projet, message) en gardant l'e-mail ; engagement de délai de réponse. Le site est statique sur GitHub Pages : le traitement du formulaire passe par un service tiers (à choisir avec Lucas : anti-spam, RGPD).
4. **Pages explicatives** (« Un mariage pas à pas », « Séance de fiançailles : à quoi s'attendre », « Séance de couple : à quoi s'attendre »), qui reçoivent les liens « Découvrir… ».
5. **Preuve sociale** : témoignages réels de couples (avec leur accord), sur l'accueil et Prestations.
6. **Contenu** : un **reportage de mariage complet** en récit ; le remonter en une du portfolio ; diversifier les couples ; équilibrer l'automne et les autres saisons.
7. **Cohérence « portraits »** : nouvelle offre ou retrait de la mention.
8. **Identité visuelle** : faire de la signature « gestes et regards » un fil graphique ; revoir le hero ; vérifier palette et typographie **après audit visuel**.
9. **Performance et référencement** : images responsives (WebP, `srcset`), polices WOFF2, JSON-LD.
10. **Archives** : fait le 27 novembre 2026 (portfolio en sommaire de magazine, sans filtres).

## 10. Questions ouvertes (à poser à Lucas, pas à deviner)

- A-t-il des témoignages de couples, et leur accord pour les publier ?
- Souhaite-t-il mettre en avant son aisance dans les mariages religieux traditionnels ?
- Formulaire de contact : acceptable ? Quel service et quelles contraintes RGPD ?
- Fiche Google Business Profile : Lucas la créera plus tard (vérification par vidéo en attente) ; en zone desservie, mêmes nom, e-mail et zones que `business` dans `_config.yml`.

Réglé : **« portraits »** (25 novembre 2026) : Lucas ne communique pas encore sur ce service. La mention est retirée des titres, du pied de page, de `_config.yml` et de la présentation de l'accueil. Il reste des mentions dans `a-propos.html`, `contact.html` et la méta-description d'`archives.html`, à traiter avec lui.

Réglé : durées, volume de photos, livraison, délai de réponse, déplacements et réservation (voir §8, « Faits confirmés »). La techno (Jekyll 4.4), le dépôt (`lucathis67/lucathis67.github.io`) et le déploiement (GitHub Actions, `main` uniquement) sont décrits en §3.
