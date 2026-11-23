# KeyForCars CRM

CRM/ERP van KeyForCars: klanten, gesprekken (e-mail, formulieren), webshopbestellingen uit WooCommerce
(keyforcars.nl, klapsleutels.nl), voorraad, inkoop, verzending, facturen, kassa, rapportages en de
werkplaatsagenda.

Afgesplitst op 23 november 2026 uit de gedeelde codebase met Autosleutel24
(`czterypokoje-lgtm/autoslutel`). Eigen Supabase-project (`lzdwxkhlscsitstxdgar`), eigen Vercel-project,
eigen accounts. De oude geschiedenis staat in die repository.

**Lees eerst `AGENTS.md`**: dit is Next.js 16, de API's wijken af van wat je kent.

```bash
npm ci
npm run dev            # localhost:3000 → /admin
npx tsc --noEmit && npm run build
npm run test:unit
npm run test:pglite
```

- Installatie en Vercel-variabelen: `docs/keyforcars-installatie.md`, `.env.example`
- Databasemigraties: `supabase/migrations/` (volgorde = bestandsnaam); bundel: `npm run kfc:bundle`
- Scheiding van Autosleutel24 (accounts, ElevenLabs, verwerkersovereenkomst): `docs/keyforcars-ayrisma.md`

`src/config/install.ts` kent nog beide installaties (`CRM_INSTALL`); in deze repository is de standaard
`keyforcars`. Code die alleen voor Autosleutel24 bestond (publieke site, monteursnetwerk, klussen,
advertenties, telefoon- en webshopagent) is verwijderd.
