import test from "node:test";
import assert from "node:assert/strict";
import { fetchPvgis, normalizePvgis } from "../src/sources.mjs";
const raw = {
  inputs: {
    location: { latitude: 45.76, longitude: 4.84 },
    pv_module: { peak_power: 3, system_loss: 14 },
    mounting_system: { fixed: { slope: { value: 30 }, azimuth: { value: 0 } } },
  },
  outputs: { totals: { fixed: { E_y: 4000 } } },
};
test("PVGIS conserve la source, les paramètres et l’unité kWh", async () => {
  let u;
  const r = await fetchPvgis(
    {
      siteId: "demo",
      lat: 45.76,
      lon: 4.84,
      peakpower: 3,
      angle: 30,
      aspect: 0,
    },
    {
      fetchImpl: async (url) => {
        u = new URL(url);
        return Response.json(raw);
      },
    },
  );
  assert.equal(u.pathname, "/api/v5_3/PVcalc");
  assert.equal(u.searchParams.get("aspect"), "0");
  assert.equal(r.simulation.annualKwh, 4000);
  assert.ok(r.document.text.includes(r.simulation.assumptions));
});
test("Un résultat incomplet est rejeté", () =>
  assert.throws(() => normalizePvgis({}, { siteId: "x", uri: "fixture:x" })));
