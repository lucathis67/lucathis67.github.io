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
| `_sass/_motion.scss` | Animation keyframes and content animation |

### Conventions

- Keep selectors flat. Existing HTML class names remain supported, so articles can still be composed manually.
- Keep responsive overrides beside the component they change, using the shared mixins rather than copying breakpoint numbers.
- The layout is desktop-first: tablet-and-below applies through 1400px, mobile through 800px, and tablet-only from 801px through 1400px. Keep the 800px boundary aligned with `assets/js/script.js`.
- Use `var(--color-...)`, `var(--border-default)` and `var(--space-...)` for shared design decisions. The spacing scale is 5, 10, 15, 20, 24, 30, 32, 40 and 48px. Type sizes, image ratios and component-specific geometry remain explicit rather than borrowing spacing values.
- Responsive root font sizes intentionally retain the original layout. Do not replace fixed spacing with rem without reviewing all three layouts.
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
