import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(appRoot, "..");
const geoRoot = join(repoRoot, "01_Research", "Geography_and_Access");
const dataRoot = join(geoRoot, "data");
const errors = [];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function check(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function unique(values, label) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  check(duplicates.size === 0, `${label} has duplicate values: ${[...duplicates].slice(0, 5).join(", ")}`);
}

function sameMembers(left, right, label) {
  const a = [...left].sort();
  const b = [...right].sort();
  check(JSON.stringify(a) === JSON.stringify(b), `${label} differs`);
}

const provenance = readJson(join(geoRoot, "PROVENANCE.json"));
const educationRegistry = readJson(join(appRoot, "data", "education-data-registry.json"));
check(ISO_DATE.test(educationRegistry.checkedAt ?? ""), "education registry check date must be an ISO date");

const registryStatuses = new Set(Object.keys(educationRegistry.statusDefinitions ?? {}));
check(registryStatuses.has("verified"), "education registry must define verified");
check(registryStatuses.has("partially-verified"), "education registry must define partially-verified");
check(registryStatuses.has("unavailable"), "education registry must define unavailable");
for (const [domainId, domain] of Object.entries(educationRegistry.domains ?? {})) {
  check(registryStatuses.has(domain.status), `${domainId} has unsupported registry status ${domain.status}`);
  check(typeof domain.decisionUse === "string" && domain.decisionUse.length > 0, `${domainId} has no decision-use rule`);
  check(Array.isArray(domain.availableFields), `${domainId} availableFields must be an array`);
  check(Array.isArray(domain.knownGaps), `${domainId} knownGaps must be an array`);
  check(Array.isArray(domain.sources), `${domainId} sources must be an array`);
  if (domain.status === "unavailable") {
    check(domain.coverage?.localRecords === 0, `${domainId} is unavailable but does not declare zero local records`);
    check(domain.decisionUse === "none", `${domainId} is unavailable but can affect a decision`);
  } else {
    check(domain.sources.length > 0, `${domainId} claims source-backed data without a source`);
  }
  for (const source of domain.sources ?? []) {
    check(/^https:\/\//.test(source.url ?? ""), `${domainId} has a non-HTTPS source URL`);
    check(ISO_DATE.test(source.checkedAt ?? ""), `${domainId} source has no ISO check date`);
  }
}
check(provenance.integrity?.algorithm === "SHA-256", "PROVENANCE integrity algorithm must be SHA-256");
check(
  provenance.integrity?.scope === "UTF-8 bytes with CRLF normalized to LF",
  "PROVENANCE must define cross-platform normalized checksums",
);

const datasets = new Map(provenance.datasets.map((entry) => [entry.file, entry]));

function checkedDataset(relativeFile) {
  const entry = datasets.get(`data/${relativeFile}`);
  check(Boolean(entry), `PROVENANCE is missing data/${relativeFile}`);
  const path = join(dataRoot, relativeFile);
  const rawBytes = readFileSync(path);
  const bytes = Buffer.from(rawBytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
  const hash = createHash("sha256").update(bytes).digest("hex");
  check(Number.isInteger(entry?.bytes), `data/${relativeFile} has no byte count`);
  check(entry?.bytes === bytes.length, `data/${relativeFile} byte count is ${bytes.length}, not ${entry?.bytes}`);
  check(/^[a-f0-9]{64}$/.test(entry?.sha256 ?? ""), `data/${relativeFile} must store a full SHA-256`);
  check(entry?.sha256 === hash, `data/${relativeFile} SHA-256 does not match PROVENANCE`);
  const value = JSON.parse(bytes.toString("utf8"));
  check(Array.isArray(value), `data/${relativeFile} must be a JSON array`);
  check(entry?.rows === value.length, `data/${relativeFile} has ${value.length} rows, not ${entry?.rows}`);
  return value;
}

const provinces = checkedDataset("provinces.json");
const institutions = checkedDataset("institutions.json");
const stations = checkedDataset("stations.json");
const outcomes = checkedDataset("vocational_outcomes.json");
const quarantine = checkedDataset("quarantine_coordinates.json");

check(provinces.length === 77, `expected 77 provinces, found ${provinces.length}`);
unique(provinces.map((row) => row.iso), "province ISO codes");
unique(provinces.map((row) => row.qid), "province Wikidata IDs");
for (const row of provinces) {
  check(/^TH-\d{2}$/.test(row.iso), `invalid province ISO code: ${row.iso}`);
  check(Number.isFinite(row.lat) && row.lat >= -90 && row.lat <= 90, `${row.iso} has an invalid latitude`);
  check(Number.isFinite(row.lon) && row.lon >= -180 && row.lon <= 180, `${row.iso} has an invalid longitude`);
}
const provinceIds = new Set(provinces.map((row) => row.iso));

unique(institutions.map((row) => row.id), "institution IDs");
for (const row of institutions) {
  check(provinceIds.has(row.province_iso), `${row.id} refers to unknown province ${row.province_iso}`);
  const hasLat = Number.isFinite(row.lat);
  const hasLon = Number.isFinite(row.lon);
  check(hasLat === hasLon, `${row.id} has only one coordinate axis`);
  if (hasLat && hasLon) {
    check(row.lat >= -90 && row.lat <= 90, `${row.id} has an invalid latitude`);
    check(row.lon >= -180 && row.lon <= 180, `${row.id} has an invalid longitude`);
  }
}
const institutionIds = new Set(institutions.map((row) => row.id));

const allowedModes = new Set(["air", "bus", "ferry", "metro", "rail"]);
unique(stations.map((row) => row.qid), "station Wikidata IDs");
for (const row of stations) {
  check(allowedModes.has(row.mode), `${row.qid} has unsupported station mode ${row.mode}`);
  check(Number.isFinite(row.lat) && row.lat >= -90 && row.lat <= 90, `${row.qid} has an invalid latitude`);
  check(Number.isFinite(row.lon) && row.lon >= -180 && row.lon <= 180, `${row.qid} has an invalid longitude`);
}

unique(
  outcomes.map((row) => `${row.province_iso}|${row.level}|${row.field_th}`),
  "vocational-outcome composite keys",
);
for (const row of outcomes) {
  const key = `${row.province_iso}|${row.level}|${row.field_th}`;
  check(provinceIds.has(row.province_iso), `${key} refers to an unknown province`);
  check(Number.isInteger(row.graduates) && row.graduates >= 0, `${key} has invalid graduates`);
  check(Number.isInteger(row.tracked) && row.tracked >= 0, `${key} has invalid tracked count`);
  check(row.tracked <= row.graduates, `${key} tracks more people than graduated`);
  const counts = Object.values(row.counts_of_tracked ?? {});
  check(counts.every((value) => Number.isInteger(value) && value >= 0), `${key} has invalid outcome counts`);
  check(counts.reduce((sum, value) => sum + value, 0) === row.tracked, `${key} outcome counts do not sum to tracked`);
  check(row.percentages_suppressed === (row.tracked < 10), `${key} has the wrong suppression flag`);
  check(row.small_sample === (row.tracked < 30), `${key} has the wrong small-sample flag`);
  if (row.percentages_suppressed) {
    check(!("of_tracked_percent" in row), `${key} exposes percentages below the suppression threshold`);
  } else {
    const percentageTotal = Object.values(row.of_tracked_percent ?? {}).reduce((sum, value) => sum + value, 0);
    check(Math.abs(percentageTotal - 100) <= 0.5, `${key} percentages sum to ${percentageTotal}`);
  }
}

unique(quarantine.map((row) => row.id), "quarantined institution IDs");
for (const row of quarantine) {
  check(institutionIds.has(row.id), `${row.id} is quarantined but absent from institutions.json`);
  const institution = institutions.find((item) => item.id === row.id);
  check(institution?.coord_status === "quarantined", `${row.id} is not marked quarantined in institutions.json`);
  check(!Number.isFinite(institution?.lat) && !Number.isFinite(institution?.lon), `${row.id} still exposes coordinates`);
}

const accessDir = join(dataRoot, "province_access");
const accessFiles = readdirSync(accessDir).filter((name) => name.endsWith(".json")).sort();
sameMembers(accessFiles, provinces.map((row) => `${row.iso}.json`), "province-access files and province registry");
const accessMeta = datasets.get("data/province_access/");
check(accessMeta?.files === accessFiles.length, `province_access has ${accessFiles.length} files, not ${accessMeta?.files}`);
const indexRows = readJson(join(dataRoot, "province_index.json"));
unique(indexRows.map((row) => row.iso), "province-index ISO codes");
const indexByIso = new Map(indexRows.map((row) => [row.iso, row]));
const accessByIso = new Map();
let accessOptions = 0;

for (const name of accessFiles) {
  const value = readJson(join(accessDir, name));
  const iso = name.slice(0, -5);
  check(value.summary?.iso === iso, `${name} summary ISO does not match its filename`);
  check(Array.isArray(value.options), `${name} options must be an array`);
  check(value.summary?.options_total === value.options.length, `${name} summary option count is wrong`);
  check(JSON.stringify(indexByIso.get(iso)) === JSON.stringify(value.summary), `${name} does not match province_index.json`);
  unique(value.options.map((row) => row.id), `${name} institution IDs`);
  for (const row of value.options) {
    check(institutionIds.has(row.id), `${name} refers to unknown institution ${row.id}`);
    check(provinceIds.has(row.province_iso), `${name}/${row.id} refers to unknown province ${row.province_iso}`);
  }
  accessOptions += value.options.length;
  accessByIso.set(iso, value);
}
check(accessMeta?.rows === accessOptions, `province_access has ${accessOptions} options, not ${accessMeta?.rows}`);

const nearby = readJson(join(appRoot, "data", "nearby.json"));
const routeCatalogue = readJson(join(appRoot, "data", "routes.json"));
const questions = readJson(join(appRoot, "data", "questions.json"));
const programmeRoutes = readJson(join(dataRoot, "programme_routes.json"));
const routeIds = new Set(routeCatalogue.routes.map((row) => row.id));
sameMembers(Object.keys(nearby), provinceIds, "web nearby data and province registry");
let webOptions = 0;
let mappedWebOptions = 0;
for (const [iso, value] of Object.entries(nearby)) {
  check(value.iso === iso, `${iso} nearby record has the wrong ISO code`);
  check(Array.isArray(value.options), `${iso} nearby options must be an array`);
  unique(value.options.map((row) => row.id), `${iso} web option IDs`);
  const source = accessByIso.get(iso);
  const sourceById = new Map(source.options.map((row) => [row.id, row]));
  const expectedCounts = {
    inside: value.options.filter((row) => row.home).length,
    outside: value.options.filter((row) => !row.home).length,
    within30: value.options.filter((row) => Number.isFinite(row.km) && row.km <= 30).length,
    vocational: value.options.filter((row) => row.offers.includes("ปวช.") || row.offers.includes("ปวส.")).length,
    degree: value.options.filter((row) => row.offers.includes("ปริญญาตรี")).length,
    distanceUnknown: value.options.filter((row) => !Number.isFinite(row.km)).length,
  };
  check(JSON.stringify(value.counts) === JSON.stringify(expectedCounts), `${iso} web counts do not match province access data`);
  for (const row of value.options) {
    const original = sourceById.get(row.id);
    check(Boolean(original), `${iso} web option ${row.id} is absent from province access data`);
    if ("runs" in row) {
      check(Array.isArray(row.runs) && row.runs.length > 0, `${iso} web option ${row.id} has an invalid route mapping`);
      for (const routeId of row.runs ?? []) {
        check(routeIds.has(routeId), `${iso}/${row.id} maps to unknown route ${routeId}`);
      }
      mappedWebOptions += 1;
    }
    if (original) {
      check(row.home === original.in_home_province, `${iso}/${row.id} has the wrong home-province flag`);
      check(row.km === original.road_km, `${iso}/${row.id} has a different road distance from its source`);
    }
  }
  webOptions += value.options.length;
}

const missingCoordinates = institutions.filter((row) => !Number.isFinite(row.lat) || !Number.isFinite(row.lon)).length;
const missingWebsites = institutions.filter((row) => !row.website).length;
const missingThaiStationNames = stations.filter((row) => !row.th).length;
const uniqueWebInstitutions = new Map();
let mappedDisplayRows = 0;
for (const province of Object.values(nearby)) {
  for (const option of province.options) {
    uniqueWebInstitutions.set(option.id, option);
    if (Array.isArray(option.runs) && option.runs.length > 0) mappedDisplayRows += 1;
  }
}
const mappedUniqueInstitutions = [...uniqueWebInstitutions.values()].filter(
  (option) => Array.isArray(option.runs) && option.runs.length > 0,
).length;
const sourceMappedInstitutions = Object.keys(programmeRoutes.institutions ?? {}).length;

check(questions.meta?.id === "futureme-interest-v2", "live questionnaire id is wrong");
check(questions.interest?.length === 30, "live interest-item count is wrong");
check(questions.context?.length === 5, "live context-prompt count is wrong");
check(routeCatalogue.routes.length === 12, "route count is wrong");
check(ISO_DATE.test(routeCatalogue.meta?.dataAsOf ?? ""), "route catalogue has no ISO data date");

const institutionCoverage = educationRegistry.domains?.institution?.coverage ?? {};
check(institutionCoverage.sourceRecords === institutions.length, "registry source institution count is wrong");
check(
  institutionCoverage.displayedUniqueInstitutions === uniqueWebInstitutions.size,
  "registry unique displayed-institution count is wrong",
);
check(institutionCoverage.displayRows === webOptions, "registry institution display-row count is wrong");
const programmeCoverage = educationRegistry.domains?.program?.coverage ?? {};
check(programmeCoverage.sourceMappedInstitutions === sourceMappedInstitutions, "registry source programme-mapping count is wrong");
check(programmeCoverage.displayedMappedInstitutions === mappedUniqueInstitutions, "registry displayed programme-mapping count is wrong");
check(programmeCoverage.mappedDisplayRows === mappedDisplayRows, "registry mapped display-row count is wrong");
check(
  programmeCoverage.displayedInstitutionsWithoutProgramMapping === uniqueWebInstitutions.size - mappedUniqueInstitutions,
  "registry unmapped displayed-institution count is wrong",
);
const locationCoverage = educationRegistry.domains?.location?.coverage ?? {};
check(locationCoverage.provinces === provinces.length, "registry location province count is wrong");
check(locationCoverage.displayRows === webOptions, "registry location display-row count is wrong");
check(locationCoverage.sourceAccessRows === accessOptions, "registry source access-row count is wrong");
check(locationCoverage.recordsWithUnknownCoordinates === missingCoordinates, "registry missing-coordinate count is wrong");

const heldOut = new Set(educationRegistry.recommendationBoundary?.heldOutUntilVerified ?? []);
for (const field of routeCatalogue.meta?.fieldStatus?.unverified ?? []) {
  check(heldOut.has(field), `registry does not hold out unverified route field ${field}`);
}

if (errors.length > 0) {
  console.error(`Research-data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Research data valid: ${provinces.length} provinces, ${institutions.length} institutions, ` +
    `${stations.length} stations, ${outcomes.length} outcome rows, ${accessOptions} access options, ` +
    `${webOptions} web options (${mappedWebOptions} with programme-derived route mappings). ` +
    `Known gaps kept as unknown: ${missingCoordinates} institution coordinates, ` +
    `${missingWebsites} institution websites, ${missingThaiStationNames} Thai station names.`,
);
