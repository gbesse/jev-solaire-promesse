import {
  str,
  obj,
  arrays,
  rows,
  integer,
  finite,
  safe,
  money,
  sum,
  boolean,
  one,
  refs,
  semantic,
  check,
  date,
  addYears,
} from "./helpers.mjs";
export const LIMIT =
  "PVGIS fournit une estimation, pas une garantie. Le retour simple ignore financement, fiscalité, dégradation et remplacement sauf coûts saisis explicitement.";
export function validateInput(x) {}
export function solarEconomics(kwh, share, retail, sale, maintenance) {
  finite(kwh, 0);
  finite(share, 0, 1);
  integer(retail);
  integer(sale);
  money(maintenance);
  return safe(
    Math.round((kwh * (share * retail + (1 - share) * sale)) / 1000) -
      maintenance,
  );
}
export function prepare(x) {
  obj(x.quote);
  obj(x.simulation);
  str(x.quote.siteId);
  str(x.simulation.siteId);
  finite(x.quote.annualKwh, 0);
  finite(x.simulation.annualKwh, 0);
  finite(x.tolerancePercent ?? 10, 0, 100);
  money(x.quote.costCents);
  finite(x.selfConsumptionShare, 0, 1);
  integer(x.retailMilliCents);
  integer(x.saleMilliCents);
  money(x.maintenanceCents);
  const r = refs(x.quote, x.simulation);
  const max = x.simulation.annualKwh * (1 + (x.tolerancePercent ?? 10) / 100);
  const saving = solarEconomics(
    x.simulation.annualKwh,
    x.selfConsumptionShare,
    x.retailMilliCents,
    x.saleMilliCents,
    x.maintenanceCents,
  );
  const checks = [
    check(
      "site",
      "Même site et installation",
      x.quote.siteId === x.simulation.siteId,
      r,
    ),
    check(
      "production",
      "Production annoncée dans la tolérance de simulation",
      x.quote.annualKwh <= max,
      r,
      "Vérifier puissance, inclinaison, orientation, pertes et ombrage.",
    ),
  ];
  if (x.quote.paybackYears !== undefined) {
    finite(x.quote.paybackYears, 0);
    checks.push(
      check(
        "retour",
        "Retour annoncé compatible avec le calcul simple",
        saving > 0 ? x.quote.paybackYears >= x.quote.costCents / saving : false,
        r,
      ),
    );
  }
  const pairs = [
    semantic(
      "hypotheses",
      "Hypothèses de production cohérentes",
      x.quote.assumptions,
      x.simulation.assumptions,
      r,
      "Les hypothèses de puissance, orientation, inclinaison et pertes sont-elles les mêmes ? Ne déduisez aucune garantie de production.",
      true,
    ),
  ];
  return {
    checks,
    pairs,
    outputs: {
      productionEstimeeKwh: x.simulation.annualKwh,
      gainAnnuelSimpleCentimes: saving,
      retourSimpleAnnees: saving > 0 ? x.quote.costCents / saving : null,
      scenarios: [0.3, 0.6, 0.9].map((s) => ({
        partAutoconsommee: s,
        gainAnnuelCentimes: solarEconomics(
          x.simulation.annualKwh,
          s,
          x.retailMilliCents,
          x.saleMilliCents,
          x.maintenanceCents,
        ),
      })),
    },
  };
}
