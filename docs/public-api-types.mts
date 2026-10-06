import { analyze, toHtml, type Dossier, type Report } from "../src/index.mjs";
import { createJevClient } from "../src/jev.mjs";
import { importManifest } from "../src/adapters.mjs";
const dossier: Dossier = {
  id: "jev-solaire-promesse-demo",
  tolerancePercent: 10,
  selfConsumptionShare: 0.6,
  retailMilliCents: 25000,
  saleMilliCents: 5000,
  maintenanceCents: 10000,
  quote: {
    docId: "a",
    siteId: "DEMO-TOIT",
    annualKwh: 4000,
    costCents: 600000,
    paybackYears: 12,
    assumptions:
      "Puissance 3 kWc, orientation sud, inclinaison 30 degrés et pertes de 14 %.",
  },
  simulation: {
    docId: "b",
    siteId: "DEMO-TOIT",
    annualKwh: 4000,
    assumptions:
      "Installation de 3 kWc tournée vers le sud, pente 30 degrés, pertes système 14 %.",
  },
  documents: [
    {
      id: "a",
      text: "DEMO-TOIT\n4000\n600000\n12\nPuissance 3 kWc, orientation sud, inclinaison 30 degrés et pertes de 14 %.",
      source: {
        uri: "fixture:a",
        date: "2026-10-06",
        kind: "synthetique",
        licence: "CC0-1.0",
      },
    },
    {
      id: "b",
      text: "DEMO-TOIT\n4000\nInstallation de 3 kWc tournée vers le sud, pente 30 degrés, pertes système 14 %.",
      source: {
        uri: "fixture:b",
        date: "2026-10-06",
        kind: "synthetique",
        licence: "CC0-1.0",
      },
    },
  ],
};
const report: Report = await analyze(dossier, {
  mode: "jev",
  provider: createJevClient({ apiKey: "test-de-type" }),
});
const html: string = toHtml(report);
void html;
const imported: Dossier = await importManifest("examples/manifest.json");
void imported;
// @ts-expect-error Les champs métier sont obligatoires.
await analyze({ id: "vide", documents: [] });
