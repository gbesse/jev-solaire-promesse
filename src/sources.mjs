import { getJson, document } from "./io.mjs";
import { finite, str as text } from "./helpers.mjs";
export function normalizePvgis(
  raw,
  { siteId, uri, at = new Date().toISOString().slice(0, 10) } = {},
) {
  text(siteId);
  const a = raw?.inputs?.location,
    b = raw?.inputs?.pv_module,
    c = raw?.inputs?.mounting_system?.fixed;
  const annual = raw?.outputs?.totals?.fixed?.E_y;
  finite(annual, 0);
  if (!a || !b || !c) throw new TypeError("Paramètres PVGIS incomplets");
  const slope = c.slope?.value,
    azimuth = c.azimuth?.value;
  finite(slope, 0, 90);
  finite(azimuth, -180, 180);
  finite(b.peak_power, 0);
  finite(b.system_loss, 0, 100);
  const assumptions = `Puissance ${b.peak_power} kWc, azimut PVGIS ${azimuth} degrés (0 = sud), inclinaison ${slope} degrés, pertes ${b.system_loss} %.`;
  const textValue = JSON.stringify(raw) + "\n" + assumptions;
  return {
    simulation: { docId: "pvgis", siteId, annualKwh: annual, assumptions },
    document: document("pvgis", textValue, {
      uri,
      date: at,
      kind: "simulation-pvgis",
      licence: "Vérifier les conditions de réutilisation JRC",
    }),
  };
}
export async function fetchPvgis(
  { siteId, lat, lon, peakpower, angle, aspect, loss = 14 },
  { fetchImpl, signal } = {},
) {
  text(siteId);
  finite(lat, -90, 90);
  finite(lon, -180, 180);
  finite(peakpower, 0.01, 100000);
  finite(angle, 0, 90);
  finite(aspect, -180, 180);
  finite(loss, 0, 100);
  const url = new URL("https://re.jrc.ec.europa.eu/api/v5_3/PVcalc");
  for (const [k, v] of Object.entries({
    lat,
    lon,
    peakpower,
    angle,
    aspect,
    loss,
    outputformat: "json",
  }))
    url.searchParams.set(k, v);
  const raw = await getJson(url.href, { fetchImpl, signal });
  return normalizePvgis(raw, { siteId, uri: url.href });
}
