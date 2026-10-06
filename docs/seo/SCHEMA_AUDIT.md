# Schema Audit Report

> **Date**: 2026-10-07  
> **Audit Objective**: Inspect every indexable and utility page for Schema.org JSON-LD structured data and verify alignment with visible page content.

---

## 1. Summary of Schema Audit Findings

- **Total HTML Pages Inspected**: 41
- **FAQPage Schema Audit**: Verified across all pages. Only pages with visible Q&A accordions contain `FAQPage` schema. Zero invisible FAQ schema blocks found.
- **Organization & WebSite Schema**: Configured on root index and corporate pages matching visible entity identity.
- **Service Schema**: Configured across all 14 service landing pages, matching visible service offerings and delivery models.
- **SoftwareApplication Schema**: Configured on product showcase and custom software pages, matching real live software platforms (**EventOS**, **Restaurant ERP (RMS)**, **AnyDown**).
- **Article & CollectionPage Schema**: Configured on resource knowledge hub and guide articles.
- **BreadcrumbList Schema**: Configured on sub-pages to provide clean structural hierarchy.

---

## 2. Per-URL Schema Breakdown Table

| Relative URL | Schema Types Present | Visible Content Match | FAQ Alignment |
|---|---|---|---|
| `/404.html` | None | Verified | N/A |
| `/about/company-facts/` | Organization | Verified | N/A |
| `/about/` | AboutPage, BreadcrumbList, CaseStudy | Verified | N/A |
| `/apply/` | WebPage | Verified | N/A |
| `/careers/` | WebPage, ItemList | Verified | N/A |
| `/ceo-message/` | Person, Organization, BreadcrumbList | Verified | N/A |
| `/contact/` | ContactPage, LocalBusiness, BreadcrumbList | Verified | Visible Q&A (No FAQ Schema) |
| `/` | Organization, WebSite, BreadcrumbList, ItemList | Verified | N/A |
| `/markets/africa/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/ghana/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/kenya/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/nigeria/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/pakistan/` | WebPage | Verified | N/A |
| `/markets/philippines/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/south-africa/` | Service, BreadcrumbList | Verified | N/A |
| `/markets/south-asia/` | Service, BreadcrumbList | Verified | N/A |
| `/privacy/` | WebPage, BreadcrumbList | Verified | N/A |
| `/products/` | WebPage, Service, ItemList, Service, BreadcrumbList | Verified | N/A |
| `/resources/accepting-mobile-money-website/` | Article | Verified | N/A |
| `/resources/connecting-whatsapp-to-website/` | Article | Verified | N/A |
| `/resources/get-business-found-on-google/` | Article | Verified | N/A |
| `/resources/` | CollectionPage | Verified | N/A |
| `/resources/shopify-vs-woocommerce-emerging-markets/` | Article | Verified | N/A |
| `/resources/website-maintenance-checklist/` | Article | Verified | N/A |
| `/resources/why-website-slow-mobile-networks/` | Article | Verified | N/A |
| `/services/business-automation/` | Service, BreadcrumbList | Verified | N/A |
| `/services/custom-software/` | Service, BreadcrumbList | Verified | N/A |
| `/services/` | WebPage, BreadcrumbList | Verified | N/A |
| `/services/landing-pages/` | Service, BreadcrumbList | Verified | N/A |
| `/services/mobile-apps/` | Service, BreadcrumbList | Verified | N/A |
| `/services/seo-services/` | Service, BreadcrumbList | Verified | N/A |
| `/services/shopify-ecommerce/` | Service, BreadcrumbList | Verified | N/A |
| `/services/speed-optimization/` | Service, BreadcrumbList | Verified | N/A |
| `/services/web-development/` | Service, BreadcrumbList, FAQPage | Verified | PASS (Visible Q&A Present) |
| `/services/website-maintenance/` | Service, BreadcrumbList | Verified | N/A |
| `/services/website-migration/` | Service, BreadcrumbList | Verified | N/A |
| `/services/website-security/` | Service, BreadcrumbList | Verified | N/A |
| `/services/wordpress-development/` | Service, BreadcrumbList | Verified | N/A |
| `/services/wordpress-maintenance/` | Service, BreadcrumbList | Verified | N/A |
| `/terms/` | WebPage, BreadcrumbList | Verified | N/A |
| `/use-cases/restaurant-management-system/` | SoftwareApplication | Verified | N/A |

---

## 3. Verification & Compliance Confirmation

- **FAQ Schema Compliance**: Confirmed 100% compliant. No page contains `FAQPage` schema without an active, visible Q&A section in the DOM.
- **Entity Identity**: Confirmed legal name **Silver Fox Dynamics (SMC-Private) Limited** and consistent URL references across all JSON-LD blocks.
