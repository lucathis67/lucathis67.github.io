# PASSATION — Basculement vers Claude Code (site lucathis.art)

Document de transmission entre la session de conseil (Claude, interface chat) et Claude Code. Il contient : l'état d'avancement, les décisions prises, le **premier prompt à coller** dans Claude Code, et en annexe la **nouvelle rédaction de la page Prestations**.

À utiliser avec `CLAUDE.md` (placé à la racine du dépôt du site).

> **Mise à jour du 25 novembre 2026 (Claude Code, avec accès au dépôt)**
>
> - **Étape 1 du premier prompt : faite.** Le site est en Jekyll 4.4 (sans thème gem), déployé sur GitHub Pages par GitHub Actions à chaque push sur `main`. Dépôt : `lucathis67/lucathis67.github.io`. Lancement local : `bundle exec jekyll serve --livereload`. Détails dans `CLAUDE.md` §3 et dans le `README.md`.
> - **Étape 3 : en partie faite.** La PR #28 (`dev` → `main`) corrige le bloc d'invitation, les trois coquilles de `prestations.html` et « célébrer » dans le portfolio. Les coquilles restantes sont listées dans `CLAUDE.md` §7. Aucun lien `127.0.0.1` dans le dépôt.
> - **Étape 2 (audit visuel) et étape 4 (Prestations) : pas commencées.**
> - Le prompt ci-dessous reste valable, mais l'étape 1 peut être sautée.

---

## 1. Où on en est

**Fait (en conversation, avec accès au texte public du site) :**
- Analyse du site : accueil, portfolio (`articles.html`), archives, 4 articles, prestations, à propos, contact.
- Analyse du ton éditorial et de la structure.
- Rédaction d'une **proposition de page Prestations** (annexe ci-dessous), à partir de la version brouillon de Lucas (avec tarifs).
- Liste des coquilles à corriger (voir `CLAUDE.md` §4).

**Pas fait :**
- **Aucune analyse du rendu visuel** (couleurs, typographie, grille, mobile, performance). Le texte seul a été lu.
- Aucune modification du dépôt.
- Les pages explicatives, le formulaire de contact, la preuve sociale, le reportage de mariage complet.

## 2. Décisions prises avec Lucas

- Lucas a écrit lui-même une version de Prestations avec **trois offres** et prix « à partir de » : mariage **950 €**, fiançailles **150 €**, couple **150 €**.
- Le portfolio en « une de journal » est conservé comme concept.
- Lucas envisage d'ajouter des **pages explicatives** (à quoi s'attendre, pas à pas) pour permettre aux futurs mariés de se projeter ; les liens « Découvrir un reportage de… » de Prestations s'y verront mieux.
- Pour l'instant, **seule la page Prestations principale est à réécrire**.

## 3. Choses à vérifier en premier

- Techno du site (le port 4000 suggère Jekyll, non confirmé) et structure du dépôt.
- Les liens de contact du brouillon de Prestations pointent vers `http://127.0.0.1:4000/contact.html` : à remplacer par le lien de production.
- Les éléments marqués `[à compléter]` dans l'annexe : **à demander à Lucas, pas à inventer**.

---

## 4. PREMIER PROMPT (à coller dans Claude Code)

```
Je reprends le travail sur mon site de photographe (lucathis.art) à partir d'une session de conseil précédente. Lis d'abord CLAUDE.md et PASSATION.md à la racine du dépôt : ils contiennent le contexte, l'analyse, le guide de ton et les règles de travail.

Contexte en deux lignes : site statique de photographe de mariages/couples en Alsace, ton chaleureux et posé, vouvoiement, première personne. L'analyse précédente n'a porté que sur le texte des pages ; le rendu visuel n'a pas été évalué.

Procède dans cet ordre, en t'arrêtant à la fin de chaque étape pour me faire un point court :

ÉTAPE 1 — Comprendre le dépôt
- Explore la structure, identifie la techno (je pense à Jekyll mais ne le suppose pas), les gabarits/layouts, les fichiers CSS et la façon dont les pages sont générées.
- Dis-moi comment lancer le site en local (il tourne sur 127.0.0.1:4000 chez moi).
- Ne modifie rien à ce stade.

ÉTAPE 2 — Audit visuel (qui n'a pas pu être fait jusqu'ici)
- Lance le site en local et regarde le rendu de l'accueil, du portfolio, d'un article, de Prestations, À propos et Contact, en version mobile puis desktop.
- Donne-moi un avis de consultant en design graphique : hiérarchie typographique, contraste et lisibilité, grille et rythme, traitement du hero (carrousel), cohérence entre pages, performance perçue des images, accessibilité (contraste, focus, tailles).
- Propose des améliorations priorisées. Ne les applique pas encore.

ÉTAPE 3 — Passe de correction (sans toucher au sens)
- Corrige les coquilles listées dans CLAUDE.md §4 (y compris le « +1. » parasite de l'article des fiançailles) et fais un grep global pour en trouver d'autres, y compris dans les alt, méta-descriptions et balises Open Graph.
- Repère tout lien pointant vers http://127.0.0.1:4000 et dis-moi où ils se trouvent.
- Travaille sur une branche dédiée, avec des commits petits et clairs. Liste-moi à la fin chaque changement.

ÉTAPE 4 — Page Prestations
- Intègre la nouvelle rédaction fournie en annexe de PASSATION.md dans la page Prestations, en respectant le gabarit et le style existants.
- Pour chaque élément marqué [à compléter], ne remplis rien : liste-les-moi sous forme de questions courtes pour que je réponde.
- Utilise le lien de contact de production (https://www.lucathis.art/contact.html), pas le lien local.
- Garde un H1 unique, une méta-description unique et soignée, et des liens explicites.
- Les liens « Comment ça se passe » → « Lire le détail d'un mariage pas à pas » pointent vers une page qui n'existe pas encore : mets un lien provisoire clairement signalé ou masque-le jusqu'à création de la page, et dis-moi lequel tu as choisi.

RÈGLES À RESPECTER TOUT AU LONG
- N'invente aucun fait : tarif, durée, nombre de photos, délai, avis, chiffre. Si une information manque, pose-moi la question.
- Ne réécris pas ma voix : tu corriges, tu structures, tu proposes, et je relis.
- Ne publie rien, ne déploie rien. Pas de force push.
- Mobile d'abord pour toute vérification de rendu.

Commence par l'ÉTAPE 1 et dis-moi ce que tu as compris du dépôt avant d'aller plus loin.
```

---

## 5. Suites prévues (pour les prochains prompts, pas pour le premier)

1. Pages explicatives : « Un mariage pas à pas », « Séance de fiançailles : à quoi s'attendre », « Séance de couple : à quoi s'attendre ».
2. Contact : formulaire guidé (date, lieu, type de projet, message) en conservant l'e-mail, avec engagement de délai de réponse.
3. Preuve sociale : témoignages réels, avec accord des couples.
4. Reportage de mariage complet, narratif, remonté en une du portfolio.
5. Cohérence « portraits » : nouvelle offre ou retrait de la mention.
6. Identité visuelle : faire des gestes et regards un fil graphique, après audit.

---

## ANNEXE — Nouvelle rédaction de la page Prestations

Légende : `[…]` = information à fournir par Lucas, **ne pas inventer**. `CONTACT` = https://www.lucathis.art/contact.html. `PAGE À CRÉER` = page explicative pas encore écrite.

# Des photographies pour les moments qui comptent.

Une cérémonie de mariage, une annonce de fiançailles ou une simple promenade en amoureux. Près de Saverne, à Strasbourg et dans toute l’Alsace, je photographie ces moments de vie avec une approche discrète, bienveillante et soucieuse du détail.

## Reportage de mariage
**À partir de 950 €** · [le tarif varie selon la durée de couverture et le lieu : à préciser]

Il y a les moments attendus, et tous ceux qui se glissent entre eux : un geste de la main, un regard ému au milieu des invités, des retrouvailles, des éclats de rire. Ce sont ces détails, autant que les grands instants, qui donnent à votre mariage son histoire.

Avant le jour J, nous choisissons ensemble les moments que vous souhaitez me confier [par exemple : des préparatifs à la soirée, ou une partie de la journée seulement]. Le jour venu, je photographie ce qui se passe, sans mise en scène, pour vous laisser vivre votre journée. Si vous en avez envie, nous prévoyons aussi un moment à deux, à l’écart de la fête, pour quelques portraits de couple.

**Ce qui est inclus :** [durée de couverture] · [nombre approximatif de photographies] · [galerie en ligne privée, téléchargement] · [délai de livraison]

[Découvrir un reportage de mariage →](https://www.lucathis.art/articles/mariage-cathedrale-strasbourg.html)
[Parler de votre mariage →](CONTACT)

## Séance de fiançailles
**À partir de 150 €**

Une séance pour marquer vos fiançailles ou garder une trace de votre histoire à cette période si particulière. Vous pouvez la réserver seule ou l’ajouter à votre reportage de mariage. Si je vous accompagne le jour J, c’est aussi l’occasion de faire connaissance avant la fête.

Nous choisissons ensemble un lieu et un moment, selon vos envies et la saison. Vous n’avez pas besoin de savoir poser : je vous propose de marcher un peu ensemble, de vous rapprocher, puis je laisse la place à vos échanges et à vos gestes.

**Ce qui est inclus :** [durée de la séance] · [nombre de photographies] · [galerie en ligne] · [délai]

[Découvrir une séance de fiançailles →](https://www.lucathis.art/articles/fiancailles-orangerie.html)
[Parler de vos fiançailles →](CONTACT)

## Séance de couple
**À partir de 150 €**

Il n’est pas nécessaire d’attendre une grande occasion pour s’offrir de belles photographies à deux. Pour vous-mêmes ou pour faire un cadeau, la séance peut prendre la forme d’une promenade, sur un chemin que vous aimez ou dans un quartier où vous avez vos habitudes.

J’aime photographier ces moments simples : une façon de se prendre la main, un fou rire partagé. Ce sont des images qui deviennent très précieuses avec le temps.

**Ce qui est inclus :** [durée] · [nombre de photographies] · [galerie en ligne] · [délai]

[Découvrir une séance de couple →](https://www.lucathis.art/articles/portraits-en-automne.html)
[Parler de votre séance →](CONTACT)

## Comment ça se passe ?

**1. Un premier échange.** Vous m’écrivez, même si votre projet commence tout juste. Je vous réponds [sous 48 h].

**2. Faire connaissance.** Nous parlons de votre histoire, du lieu, de ce que vous aimeriez garder en images. [Un appel, un café ou une rencontre : à préciser.] C’est aussi le moment de poser toutes vos questions.

**3. Le jour J, ou la séance.** Je m’adapte à votre rythme et je reste discret. Pour une séance, tout commence par quelques pas ensemble, le temps que l’appareil s’efface.

**4. Vos photographies.** Vous les recevez [dans un délai de … semaines], [sous forme de galerie en ligne privée], avec [ce que vous pouvez en faire : télécharger, partager, imprimer].

[Lire le détail d’un mariage pas à pas →](PAGE À CRÉER)

## Quelques questions fréquentes

**Faut-il savoir poser ?** Non. Je vous accompagne au début, puis la séance laisse peu à peu place à vos échanges et à vos gestes.

**Peut-on prévoir des photos de couple le jour du mariage ?** Oui. Nous choisissons ensemble un moment qui s’accorde avec le déroulement de la journée, par exemple entre la cérémonie et la fête, pour que vous puissiez en profiter sans vous éloigner trop longtemps de vos invités.

**Vous déplacez-vous hors de l’Alsace ?** Oui, selon les projets. Écrivez-moi pour en parler. [Frais de déplacement : à préciser.]

**Combien de temps à l’avance faut-il réserver ?** [À compléter, en particulier pour les mariages d’été.]

## Et si nous parlions de votre projet ?

Un mariage qui se prépare, des fiançailles ou simplement l’envie de quelques belles photos pour vous-mêmes ou pour offrir ? Racontez-moi ce que vous imaginez, je serai ravi d’en discuter avec vous.

[Me contacter →](CONTACT)

---

### Notes de rédaction (pour Claude Code)

- Les trois offres reprennent presque mot pour mot le texte de Lucas. Les ajouts sont : « Ce qui est inclus », « Comment ça se passe », la FAQ, la précision sur « les moments que vous souhaitez me confier » (jugée floue), et la phrase sur ce qui fait varier le tarif.
- Les intitulés de boutons sont différents pour chaque offre : à conserver.
- La FAQ reprend des éléments déjà publiés sur le site (savoir poser, portrait entre cérémonie et fête, déplacements « dans toute l’Alsace et ailleurs selon les projets »).
- Méta-description à proposer (à valider par Lucas) : reprendre l'idée « mariage, fiançailles et séances de couple en Alsace, avec tarifs et déroulé », sans copier celle de l'accueil.
