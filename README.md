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

## Current pages and design

- `index.html`: scrollable homepage with the manual slideshow, introduction, About excerpt and shared contact section.
- `articles.html`: curated Portfolio with manually written feature summaries.
- `archives.html`: automatically generated archive, newest `publication_order` first, with category filters and batches of 12.
- `prestations.html`: hand-authored services page; About and Contact share the profile layout.

Homepage photographs are configured in `_data/home_slides.yml`. Portraits and landscapes use the same selection at every screen size and share one row height while retaining their proportions. `assets/js/slideshow.js` handles neighbour clicks, keyboard navigation, swipes and reduced-motion-aware transitions; there is no autoplay. `_sass/_landing.scss` styles homepage content; `_sass/_header.scss` styles the shared and split mastheads.

Navigation labels and destinations come from `_data/navigation.yml`, including the homepage's split links. Large screens retain the lateral navigation on internal pages; tablet and mobile use the shared dialog menu. The shared contact invitation is `_includes/contact-invitation.html`.

The active design uses warm ivory, brown charcoal text and an earthy menu background with the shared paper texture. Shared colours, typography, spacing and texture size live in `_sass/_tokens.scss`; saved palette comparisons remain in `_design/palettes.json` as references only.

For new articles, set a unique numeric `publication_order` in front matter. Archives update automatically; Portfolio feature selection remains manual. `heading` supplies the article title in its page, Portfolio card and archive entry. `category`, `location`, `cover_image` and `cover_alt` provide supporting metadata. Image includes and the article template remain available for future content.

The archive retains the `theme` URL parameter, progressive batches and a complete list without JavaScript. Its implementation lives in `_sass/_archive.scss` and `assets/js/archive.js`.

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

## Search and sharing metadata

`_includes/head.html` emits canonical URLs, descriptions, Open Graph and Twitter cards for every page. Titles and descriptions use page front matter, with site defaults as a fallback. Sharing images are chosen in this order: `og_image`, `cover_image`, `hero_image`, then the site's default image. Article layouts automatically use `og:type=article`; other pages use `website`. Existing `og_title`, `og_description`, `og_type` and `og_image_alt` overrides remain supported. Supply an accurate `og_image_alt` when selecting a custom sharing photograph.

`sitemap.xml` automatically includes pages with layouts except those marked `noindex`; `robots.txt` points to it. Keep the legal page's `noindex` metadata rather than blocking crawling, so search engines can read that directive. Canonicals use `site.url` and `site.baseurl`. Verify production URLs with `JEKYLL_ENV=production bundle exec jekyll build`; local preview builds may use localhost URLs.

### Validated typography

The site locally hosts EB Garamond for headings and reading text, and Source Sans 3 for supporting text and controls. Normal and italic variable files cover the declared weights; each family retains its license. `assets/css/fonts.css` registers them, and `_sass/_tokens.scss` defines the active families, shared paragraph sizing and brand scale. Retired Cormorant Garamond and DM Sans assets have been removed.
