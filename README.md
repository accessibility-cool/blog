# accessibility.cool SvelteKit Website and Blog

This is our current blog and website template hosted on netlify.

## Features

- ⚡️ **Super fast static site generation with hydration**. Every route is
  compiled down to static HTML and routed with (optional) JavaScript, thanks to
  the SvelteKit static adapter (pre-installed)
- 📦 **Zero-config preloading** for automatic, fast background preloading of all
  top-level pages
- ✍️ **Markdown support** with a pre-configured blog
  - 📑 **Pagination** included (_can customize posts per page_)
  - ✅ **Category pages** included
  - 💬 **Posts JSON API**
- 📝 **mdsvex** pre-installed--use Svelte components inside Markdown!
  - 🔗 **Rehype** plugins are included to generate unique heading IDs, for
    direct linking
- 📱 **Responsive and accessible defaults**; includes a "skip to content" link
  and accessible mobile nav menu
- 🔄 **Page transitions** (_fancy!_)
- 🔎 **Basic SEO** for blog posts (_strongly recommend checking that out for
  yourself, though_)
- 📰 **RSS feed** set up and ready to go (_though it could also likely benefit
  from some optimization_); just update `src/lib/config.js`
- ℹ️ **Fonts included**. (No more built-in Google tracking. & GDPR compliant)

## Quick Start

`pnpm run dev`

## TODO

- preprocess CSS with SCSS
- use shadcn/svelte components
- add hero section
- filter blog posts with tags
- remove mdsvex and use graphql ghost API
- use new container breakpoint queries in css with grid
- refactor animations
- use default light or darkmode based on a users system setting
- add favicon
-
