# mbm-baseball-training.com

Marketing + booking site for **MBM Baseball Training** (Coach Myles Berniard-Mendez, Long Beach, CA). Static Astro site deployed to Cloudflare.

## Develop
```bash
nvm use            # Node 22 per .nvmrc
npm install
npm run dev        # http://localhost:4321
```

## Build
```bash
npm run build      # outputs dist/
npm run preview
```

## Checks
```bash
npm run check          # astro check (TS + templates)
npm run check:content  # brand-color discipline + data JSON validation
```

## Deploy
Connected to Cloudflare (Workers & Pages) via git integration — pushing to `main` triggers a build + deploy. Custom domain `mbm-baseball-training.com` managed in Cloudflare.

## Structure
- `src/pages/` — index (single-page), 404, privacy, terms
- `src/layouts/` — BaseLayout (meta / OG / JSON-LD schema), LegalLayout
- `src/components/` — section components (Nav, Hero, About, Services, Packages, Booking, Proof, Contact, Footer) + ServiceCard/PackageCard
- `src/data/*.json` — content as data (site, services, packages, testimonials)
- `src/styles/global.css` — Tailwind v4 + daisyUI "mbm" theme (brand palette)
- `src/assets/photos/` — optimized imagery
- `public/` — favicon set, OG image, robots.txt
- `docs/` — design spec, implementation plan, branding + market-research handoffs
