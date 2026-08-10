import packed from "@/data/programmes.json";
import routesData from "@/data/routes.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";

/**
 * Unpacks the programme index and gives each programme its RIASEC vector.
 *
 * The vector is computed here from routes.json rather than stored alongside
 * the programme, so the twelve route vectors exist once in the workspace. A
 * stored copy is a copy that drifts.
 */

interface Packed {
  meta: {
    programmes: number;
    institutions: number;
    level: string;
    missing: string[];
    coverageNote: string;
    source: string[];
  };
  routeIds: string[];
  /** [id, nameTh, provinceIso, provinceTh, tuitionBand] */
  institutions: [string, string, string, string, string][];
  titles: string[];
  /** [titleIndex, institutionIndex, routeMask, seats] */
  programmes: [number, number, number, number | null][];
}

const data = packed as unknown as Packed;

export interface Programme {
  title: string;
  institutionId: string;
  institutionTh: string;
  provinceIso: string;
  provinceTh: string;
  tuitionBand: string;
  routes: string[];
  riasec: Record<Dimension, number>;
  seatsPlanned: number | null;
}

export const PROGRAMME_META = data.meta;

const ROUTE_WEIGHTS = new Map<string, Record<string, number>>(
  routesData.routes.map((r) => [r.id, r.interestWeights as Record<string, number>]),
);

function vectorFor(routes: string[]): Record<Dimension, number> {
  const vec = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) vec[d] = 0;
  for (const route of routes) {
    const weights = ROUTE_WEIGHTS.get(route);
    if (!weights) continue;
    // Mean of the matched routes' vectors. Averaging rather than picking keeps
    // a joint programme honest about sitting between two fields instead of
    // being forced into one.
    for (const d of DIMENSIONS) vec[d] += (weights[d] ?? 0) / routes.length;
  }
  return vec;
}

let cache: Programme[] | null = null;

export function allProgrammes(): Programme[] {
  if (cache) return cache;

  const vectors = new Map<number, Record<Dimension, number>>();
  const routeLists = new Map<number, string[]>();

  cache = data.programmes.map(([titleIndex, instIndex, mask, seats]) => {
    let routes = routeLists.get(mask);
    if (!routes) {
      routes = data.routeIds.filter((_, i) => (mask & (1 << i)) !== 0);
      routeLists.set(mask, routes);
    }
    let riasec = vectors.get(mask);
    if (!riasec) {
      riasec = vectorFor(routes);
      vectors.set(mask, riasec);
    }
    const [id, nameTh, provinceIso, provinceTh, tuitionBand] = data.institutions[instIndex];
    return {
      title: data.titles[titleIndex],
      institutionId: id,
      institutionTh: nameTh,
      provinceIso,
      provinceTh,
      tuitionBand,
      routes,
      riasec,
      seatsPlanned: seats,
    };
  });

  return cache;
}
