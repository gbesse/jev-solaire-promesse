import type { Document } from "./index.mjs";
export interface Simulation {
  docId: string;
  siteId: string;
  annualKwh: number;
  assumptions: string;
}
export function normalizePvgis(
  raw: unknown,
  options: { siteId: string; uri: string; at?: string },
): { simulation: Simulation; document: Document };
export function fetchPvgis(
  parameters: {
    siteId: string;
    lat: number;
    lon: number;
    peakpower: number;
    angle: number;
    aspect: number;
    loss?: number;
  },
  options?: { fetchImpl?: typeof fetch; signal?: AbortSignal },
): Promise<ReturnType<typeof normalizePvgis>>;
