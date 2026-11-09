# Lucas Mathis Art — Jekyll

The existing design is now a local Jekyll theme: layouts, includes, CSS and JavaScript live in this repository. No theme gem, CMS or runtime server is required in production. Page and article bodies remain hand-authored HTML.

## Local setup

Install a recent Ruby (the migration was verified with Ruby 4.0) and Bundler, then:

```sh
cd /Users/lucasmathis/lucathis67.github.io
git switch migration/jekyll
bundle config set --local path vendor/bundle
bundle install
```

Dependencies stay in the ignored `vendor/bundle` folder. Commit `Gemfile.lock`, not `vendor/` or `.bundle/`.

## Preview and build

```sh
bundle exec jekyll serve --livereload
```

Open http://127.0.0.1:4000. Stop with Ctrl+C. Restart after editing `_config.yml`.

```sh
bundle exec jekyll build
bundle exec jekyll doctor
bundle exec jekyll clean
```

`build` writes the publishable static site to `_site/`. `clean` removes generated output and caches, not your source files. Do not commit `_site/`. To test a repository subpath:

```sh
bundle exec jekyll serve --baseurl /preview
```

Open http://127.0.0.1:4000/preview/.

## Where to edit

- `_config.yml`: domain, baseurl, contact details and shared text.
- `_data/navigation.yml`: menu labels and destinations; active-page styling is automatic.
- `_layouts/default.html`: shared document shell.
- `_layouts/home.html`, `page.html`, `article.html`, `profile.html`: page variants.
- `_includes/`: metadata, header, navigation, footer, profile banner, homepage cards and optional image component.
- `assets/css/styles.scss` and `_sass/`: styling, compiled by Jekyll into `/assets/css/styles.css`.
- `assets/js/`: existing behaviour.
- `index.html`: manually selected homepage cards and HTML introductions.
- `a-propos.html`, `contact.html`, `mentions-legales.html`: metadata followed by editable HTML content.
- `articles/*.html`: metadata followed by editable HTML reportage content.
- `articles.html`: an automatically generated index of pages using `layout: article`.

The `title` field is the browser/search title; `heading` is the visible page heading. `permalink` controls the public URL. Existing URLs are retained. The fiançailles canonical now matches the actual ASCII filename.

## Add an article

```sh
cp templates/article.html articles/mon-reportage.html
mkdir -p images/mon-reportage
```

Update its metadata, image paths and HTML. Replace the placeholder images with actual files. Use a unique permalink matching the article filename. There is no date-based filename requirement: articles are ordinary HTML pages, not Jekyll posts.

Write image rows and text blocks directly in HTML, including your own attributes. For repeated image markup, the optional helper is:

```liquid
{% include image.html src="/images/mon-reportage/photo-02.jpg"
   alt="Description" width=1600 height=1067 loading="lazy" %}
```

It supports `class`, `sizes` and `srcset`; srcset URLs are supplied literally, so include the correct deployment base path yourself when using them. For full control, use an ordinary `<img>` element. Wrap internal `href` and `src` paths with `relative_url`, for example:

```html
<a href="{{ '/contact.html' | relative_url }}">Me contacter</a>
```

The article appears automatically on `/articles.html`. To feature it on the homepage, copy an existing `capture` + `article-card.html` include in `index.html` and update its fields and HTML summary. Selection and ordering remain manual.

## Add a standard page

Create `ma-page.html` with front matter:

```yaml
---
layout: page
title: "Ma page | Lucas Mathis Art"
heading: "Ma page"
permalink: /ma-page.html
---
```

Write its body in HTML below the closing `---`. Add an entry in `_data/navigation.yml` if it belongs in the main menu. For the About/Contact presentation, copy an existing profile page, including its `main_class`, `hero_image` and profile panel HTML.

## GitHub Pages

The included workflow builds pull requests and pushes to `migration/jekyll` and `main`, and deploys **only pushes to main**. Nothing is published by local builds or by pushing the migration branch.

When ready to publish the migration, select **Settings → Pages → Build and deployment → Source → GitHub Actions** in the repository, then merge into `main`. Do not publish the repository source as plain HTML: Jekyll must generate `_site` first. `CNAME` and the configured custom domain are retained. Check that your existing GitHub custom-domain and DNS settings remain correct.

## Routine commands

```sh
git switch -c article/mon-reportage
bundle exec jekyll serve --livereload
# After editing and checking:
bundle exec jekyll build
git status
git add articles/mon-reportage.html images/mon-reportage index.html
git commit -m "Add new reportage"
git push -u origin article/mon-reportage
```

Use your usual review/merge process. These commands do not merge or publish anything on their own.

## Styling system

Edit `assets/css/styles.scss` only to change the stylesheet's module order. Jekyll's existing Sass support compiles it automatically; no npm command or additional dependency is needed. The public stylesheet URL remains `/assets/css/styles.css`. Do not recreate a source `styles.css` alongside `styles.scss`, because both would target the same output file.

| Source | Responsibility |
| --- | --- |
| `assets/css/fonts.css` | Local font declarations, included in the compiled stylesheet |
| `_sass/_tokens.scss` | Shared colours, border, fonts, spacing scale, content width and mobile gutter |
| `_sass/_breakpoints.scss` | Shared responsive mixins: `mobile`, `tablet-and-below`, `tablet-only` |
| `_sass/_base.scss` | Document flow, typography, links and footer |
| `_sass/_header.scss` | Branding and normal/homepage headers |
| `_sass/_navigation.scss` | Desktop menu and inline navigation fallback |
| `_sass/_editorial.scss` | Homepage cards, article text and photograph arrangements |
| `_sass/_profile.scss` | About/Contact hero, panel and portrait |
| `_sass/_mobile-menu.scss` | Mobile dialog, controls and keyboard focus |
| `_sass/_closing.scss` | Shared closing invitation, primary action and footer |
| `_sass/_motion.scss` | Animation keyframes and content animation |

### Conventions

- Keep selectors flat. Existing HTML class names remain supported, so articles can still be composed manually.
- Keep responsive overrides beside the component they change, using the shared mixins rather than copying breakpoint numbers.
- The layout is desktop-first: tablet-and-below applies through 1400px, mobile through 800px, and tablet-only from 801px through 1400px. Keep the 800px boundary aligned with `assets/js/script.js`.
- Use `var(--color-...)`, `var(--border-default)` and `var(--space-...)` for shared design decisions. The spacing scale is 5, 10, 15, 20, 24, 30, 32, 40 and 48px. The mobile gutter is 24px and the reading width is capped at 680px. Type sizes, image ratios and component-specific geometry remain explicit rather than borrowing spacing values.
- The root font size stays at 16px across breakpoints. Reading text uses rem; headings adapt with clamp(). Review all three layouts when changing typography.
- The `photo-row` class provides equal-width images. `photo-row-vh` and `photo-row-hv` use portrait/landscape flex weights to align their heights on desktop; all variants stack on mobile.
- Header/navigation selectors and JavaScript state classes (`has-mobile-menu`, `article-warm`, `is-closing`, `pointer-open`, `menu-open`) are part of the existing behaviour. Keep those contracts when extending components.
- Preserve focus indicators, the no-JavaScript navigation fallback and reduced-motion rules.

For a new component with responsive styles:

```scss
@use "breakpoints" as bp;

.my-component {
  padding: var(--space-6);
}

@include bp.mobile {
  .my-component {
    padding: var(--gutter-mobile);
  }
}
```

Add its module to `assets/css/styles.scss` with `@use`. Component modules follow the foundations; mobile-menu enhancements follow navigation. Preview with `bundle exec jekyll serve --livereload`, and run `bundle exec jekyll build` before publishing.

## Editorial design preview (dev)

The large-screen navigation remains fixed in the left margin above 1400px, with a fine rule and an active-page marker. Tablet navigation sits in the header; the mobile menu retains its existing behaviour. Card copy and image arrangements are still manually editable HTML.

Article metadata now supports `category`, `location`, `intro`, `display_title`, `cover_image` and `cover_alt`. The full `heading` stays on the article; `display_title` is used in the visual reportages index. Homepage titles and summaries are still chosen manually in `index.html`. Image loading defaults to lazy, with the featured homepage image explicitly eager.

`_includes/contact-invitation.html` provides the shared closing section for the homepage, reportages index, articles and About page. Edit this one file to change its invitation. Contact retains the direct email action instead of inviting visitors back to the same page.

The design keeps the local fonts, ivory/olive palette and original image files. Publication settings and workflows have not changed.

### Light mint palette experiment

The first green variant uses white (`#ffffff`), warm taupe (`#74605a`), and the soft mint (`#a6d2b9`) from the photographic proposal. Large panels use a diluted mint (`#edf6f0`); buttons use dark green text (`#354e43`) for readability. The mobile menu also uses a light surface.

For the previous ivory appearance, restore the five original colour tokens in `_sass/_tokens.scss`: background `#f8f6f1`, warm surface `#eeebe3`, heading `#37392f`, text `#68695e`, border `#d8d7cc`. To return the button/menu treatment too, use the corresponding uncommitted changes in `_sass/_closing.scss` and `_sass/_mobile-menu.scss` as the comparison. Homepage headings, teasers and reading-link labels have been restored to the author's original wording; the introduction row is slimmer (18px vertical padding on desktop, 16px on mobile).

### Palette preferences and second green preview

Ivory remains the preferred overall direction. The ivory, first green and second green palettes are recorded in `_design/palettes.json`, including subtitle, button and menu treatments. This is a design reference, not a public page or runtime switcher; `_sass/` controls the active preview.

Green v2 keeps white and pale mint surfaces, uses the dark taupe heading colour for shared borders (including buttons), darkens body text to `#514b47`, and replaces the homepage subtitle's surrounding rules with a mint band. Its text is dark green because white on this light mint has insufficient contrast. All original homepage titles and teasers remain unchanged.

Active choice: restored the ivory palette and original ruled subtitle treatment. The slimmer introductory row, author’s original homepage copy and layout refinements are retained. Both green experiments remain saved in `_design/palettes.json`.

### Articles navigation and publication order

The shared navigation includes **Articles**, linking to `/articles.html`. The index sorts article pages by numeric `publication_order`, highest first. The existing sequence follows the homepage: fiançailles à l’Orangerie (3), mariage à la cathédrale (2), portraits d’automne (1). These are relative publication positions, not invented dates.

When publishing a new article, set `publication_order` to the next unused number (4 for the next article, then 5, etc.). The article template includes this field. Keep values unique; the index updates automatically. The homepage remains manually curated.

## Article archive

`articles.html` uses the archive layout, with entries rendered by `_includes/archive-entry.html`. Archive styles live in `_sass/_archive.scss`; the optional page-specific script is `assets/js/archive.js`.

The index is generated from pages using `layout: article`, with `publication_order` descending, always newest first. The only controls are the category filters. Categories and their counts are generated from article metadata, so use consistent category names.

The selected theme is saved in the page URL (`theme`) for shareable links and refresh persistence. Results are revealed in batches of 12. After showing more, keyboard focus moves to the first newly revealed title. The complete ordered list exists in the generated HTML; without the archive script, all entries remain readable and controls stay hidden.

The existing articles have no fabricated publication dates. A real `published_on: YYYY-MM-DD` field can be displayed when supplied; `publication_order` still determines ordering. The ivory palette, fixed navigation and original homepage content are unchanged.

### Consistent article titles

`heading` is the single visible title for the article, its homepage card and its archive entry. Homepage cards look up the article by URL and use `article.heading`; teaser paragraphs remain manual HTML. The archive now shows only photographs and linked titles. Categories remain available in the side filters, while per-entry teasers, location labels and repeated reading links have been removed. The earlier short `display_title` metadata has been retired.

## Fine-art photograph viewer

Article pages automatically collect the images inside `.reportage-content` in their existing reading order. Clicking a photograph, or focusing it and pressing Enter/Space, opens that article's own slideshow. No separate image list is required. The album wraps at either end and supports previous/next buttons, arrow keys, Home/End, Escape, background-click dismissal and horizontal touch swipes.

The native modal dialog makes the background inert. Tab and Shift+Tab remain within its controls; closing returns focus to the original photograph without scrolling. Without JavaScript or native dialog support, article photographs retain their normal static presentation. The viewer script loads only for `layout: article` pages.

- `_includes/photo-viewer.html`: shared dialog and controls.
- `assets/js/photo-viewer.js`: album collection, loading, keyboard/touch handling and responsive print sizing.
- `_sass/_photo-viewer.scss`: theme-coloured dark backdrop and white print mat.

Images remain uncropped. The mat takes up approximately 20% of the print's width in total (10% on each side), with equal physical padding on all four edges. Adjust `matRatio` in `photo-viewer.js` to change the proportion; 0.125 corresponds to that 20% total. Print sizing respects the available stage in landscape and portrait layouts. White paper remains white regardless of the selected site palette; the dark backdrop uses `--color-viewer-backdrop` (a neutral, earthy charcoal).

Optional manual HTML attributes:

```html
<img src="{{ '/images/example.jpg' | relative_url }}"
     data-viewer-src="{{ '/images/example-full-size.jpg' | relative_url }}"
     alt="Description" width="1600" height="1067">
```

`data-viewer-src` selects an alternative full-size image. Add `data-no-viewer` to opt an image out. Images already inside links or buttons keep their authored actions and are not turned into gallery triggers.

The viewer is enabled only at viewport widths of **800px and above**. Below 800px, the photographs retain their original attributes and normal cursor, and do not open the viewer. Resizing an open viewer below that threshold closes it and restores page scrolling; growing the window enables the controls again without a reload. The independent mobile navigation breakpoint remains unchanged.

The white mat has a very faint, seamless paper grain from `assets/textures/fine-art-paper.svg`. It is applied only as the paper container’s background; the image has its own solid white backing, with no texture overlay, blend mode or colour filter. The texture is generated locally with SVG noise and adds no external requests or dependencies. Its intensity can be adjusted through the SVG’s component-transfer values.

The print boundaries are slightly softened: a subpixel white halo on the paper edge, and a 0.85px opacity feather around the photograph. The image centre remains sharp, with no blur filter and no modification to the source file. Adjust `--print-edge-feather` in `_sass/_photo-viewer.scss` to tune the photograph boundary. Browsers without intersecting CSS masks keep a normal image edge.
