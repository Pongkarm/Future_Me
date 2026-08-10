import packed from "@/data/programmes.json";
import { DIMENSIONS, type Dimension } from "@/lib/decision-engine/types";

/**
 * Unpacks the programme index.
 *
 * A programme's RIASEC vector is its ISCED-F field's vector, and those are
 * measured — the mean interest profile of the O*NET occupations in that field,
 * rescaled to 0..1. They are no longer weights anybody chose. The one
 * judgement left in the chain is which occupations belong to a field, and that
 * is recorded per field in build/crosswalk_audit.md.
 */

interface Packed {
  meta: {
    programmes: number;
    institutions: number;
    fields: number;
    level: string;
    riasecSource: string;
    riasecStatus: string;
    costNote: string;
    missing: string[];
    coverageNote: string;
    source: string[];
  };
  /** [iscedCode, title, [R,I,A,S,E,C], occupations behind the mean] */
  fields: [string, string, number[], number][];
  /** [id, nameTh, provinceIso, provinceTh, tuitionBand] */
  institutions: [string, string, string, string, string][];
  titles: string[];
  /** [titleIndex, institutionIndex, fieldIndex, seats, productionCost] */
  programmes: [number, number, number, number | null, number | null][];
}

const data = packed as unknown as Packed;

export interface Programme {
  title: string;
  institutionId: string;
  institutionTh: string;
  provinceIso: string;
  provinceTh: string;
  tuitionBand: string;
  /** ISCED-F 2013 detailed field code, e.g. "0613" */
  isced: string;
  iscedTitle: string;
  /**
   * How many O*NET occupations the field's measured vector averages over.
   * A field resting on one occupation is not wrong, but it is thin, and the
   * trace shows the number rather than leaving a reader to assume it is many.
   */
  iscedOccupations: number;
  riasec: Record<Dimension, number>;
  seatsPlanned: number | null;
  /**
   * What the institution spends per student per year — NOT what the learner
   * pays. At a public university the learner pays a fraction of it. Never
   * render this as a tuition figure.
   */
  productionCost: number | null;
}

export const PROGRAMME_META = data.meta;

let cache: Programme[] | null = null;

export function allProgrammes(): Programme[] {
  if (cache) return cache;

  const vectors = data.fields.map(([, , values]) => {
    const vec = {} as Record<Dimension, number>;
    DIMENSIONS.forEach((d, i) => {
      vec[d] = values[i];
    });
    return vec;
  });

  cache = data.programmes.map(([titleIndex, instIndex, fieldIndex, seats, cost]) => {
    const [id, nameTh, provinceIso, provinceTh, tuitionBand] = data.institutions[instIndex];
    const [isced, iscedTitle, , iscedOccupations] = data.fields[fieldIndex];
    return {
      title: data.titles[titleIndex],
      institutionId: id,
      institutionTh: nameTh,
      provinceIso,
      provinceTh,
      tuitionBand,
      isced,
      iscedTitle,
      iscedOccupations,
      riasec: vectors[fieldIndex],
      seatsPlanned: seats,
      productionCost: cost,
    };
  });

  return cache;
}
