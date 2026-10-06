import { fetchPvgis } from "../src/sources.mjs";
if (!process.argv.includes("--live")) {
  console.log(
    "Ajouter --live pour interroger PVGIS sur un site de démonstration.",
  );
} else {
  const result = await fetchPvgis({
    siteId: "DEMO-LYON",
    lat: 45.76,
    lon: 4.84,
    peakpower: 3,
    angle: 30,
    aspect: 0,
  });
  console.log(JSON.stringify(result, null, 2));
}
