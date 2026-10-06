# SEO Overhaul Phase Plan

## Phase 0 — Audit (read-only)
- **Status**: Done
- **Description**: Inspect repo, framework, routing, components, metadata, sitemap, robots, schema, analytics, navigation, products, contact mechanism, deployment config, existing pages/content worth keeping, and the live site. Output /docs/seo/AUDIT.md: current state, weaknesses, risks, what must not change. No app-code changes.
- **Notes/Decisions**: Audit completed. Created /docs/seo/AUDIT.md detailing tech stack (HTML/CSS/JS + Vercel Functions), strengths, weaknesses (robots.txt blocking CSS/JS, lack of dedicated service routes, hidden hashtag divs), and preservation requirements.

## Phase 1 — Strategy and information architecture
- **Status**: Not started
- **Description**: Output /docs/seo/STRATEGY.md: final service list and URL map (reuse the existing routing), which pages are kept/improved/new/redirected, the market plan (regional hubs plus the country-page shortlist, with the unique value of each, based on web research), a keyword/intent map per page (commercial intent first), the internal-linking map, the recurring-service ladder, and risks. Treat STRATEGY.md as the binding plan for later phases.
- **Notes/Decisions**: Pending execution.

## Phase 2 — Technical SEO foundation
- **Status**: Not started
- **Description**: Central metadata system, canonical and trailing-slash consistency, sitemap (all indexable pages, no private/duplicate routes), robots.txt, 404 handling, redirects (only if needed), OG/Twitter defaults, favicon/identity check, Organization + WebSite schema, analytics audit (do not invent IDs; record what is missing).
- **Notes/Decisions**: Pending execution.

## Phase 3 — Homepage and navigation
- **Status**: Not started
- **Description**: Improve messaging (who we are, global remote-first service, services, own products, contact) without a wall of text; add a Services entry to navigation in the existing style; keep products prominent.
- **Notes/Decisions**: Pending execution.

## Phase 4 — Website development services
- **Status**: Not started
- **Description**: Business website, WordPress, Shopify, WooCommerce, e-commerce, landing pages, redesign. Build a reusable service-page template from existing components first, then the pages.
- **Notes/Decisions**: Pending execution.

## Phase 5 — Website care services (recurring)
- **Status**: Not started
- **Description**: Website maintenance, WordPress/Shopify maintenance, security, backups and monitoring, speed/performance, migration.
- **Notes/Decisions**: Pending execution.

## Phase 6 — Growth and business technology services
- **Status**: Not started
- **Description**: SEO, local SEO, technical SEO, e-commerce SEO, Google Business Profile, custom software, web apps, mobile apps, business automation, SaaS, API integration, custom portals. Link relevant products.
- **Notes/Decisions**: Pending execution.

## Phase 7 — Market and use-case pages
- **Status**: Not started
- **Description**: Regional hubs and the country-page shortlist from STRATEGY.md, one light Pakistan page, and a few use-case pages only if differentiated (restaurants, clinics, real estate, event venues, booking sites, digital menus).
- **Notes/Decisions**: Pending execution.

## Phase 8 — Content and FAQs
- **Status**: Not started
- **Description**: Visible FAQs on service pages; 5–8 quality articles in the existing blog/resources section (create the section only if sensible). Topics should serve the emphasized markets, e.g. Shopify vs WooCommerce for emerging-market stores, accepting mobile-money and online payments, connecting WhatsApp to a website, website maintenance checklist, why a site is slow on mobile networks, how to get a business found on Google.
- **Notes/Decisions**: Pending execution.

## Phase 9 — Internal linking, structured data and AI discoverability
- **Status**: Not started
- **Description**: Service/Product/Breadcrumb/FAQ schema pass validated against visible content, related-services and product links, About/company-facts page, optional /llms.txt.
- **Notes/Decisions**: Pending execution.

## Phase 10 — QA
- **Status**: Not started
- **Description**: Production build, lint, all old and new routes, links, images/alt text, metadata uniqueness, schema validity, sitemap, robots, canonicals, mobile and desktop, light and dark mode, forms/contact, console errors, Lighthouse/Core Web Vitals check. Fix everything found.
- **Notes/Decisions**: Pending execution.

## Phase 11 — Final report and manual checklists
- **Status**: Not started
- **Description**: Write /docs/seo/FINAL_REPORT.md covering: current-site audit, new positioning, information architecture (retained/modified/new/redirected pages), SEO improvements, AI discoverability, Pakistan layer, emphasized-market strategy, global coverage, recurring-service strategy, and technical QA results. Add exact step-by-step checklists with the real URLs and values from this implementation for Google Search Console, Bing Webmaster Tools (including whether to add IndexNow and why — do not implement anything needing my credentials without asking), analytics, and ongoing monitoring. Finish with a short "How to publish" section for me: the exact git commands to push the `seo-overhaul` branch to my GitHub repository (given that this folder may or may not have a remote configured), how to check the Vercel preview for that branch, and how to merge to main once I approve. State that the branch is ready for my review.
- **Notes/Decisions**: Pending execution.
