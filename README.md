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
- `assets/css/` and `assets/js/`: original styling and behaviour.
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
