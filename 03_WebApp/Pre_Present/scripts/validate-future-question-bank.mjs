import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const bankPath = join(appRoot, "data", "question_bank_1000.json");
const bank = JSON.parse(await readFile(bankPath, "utf8"));
const errors = [];
const items = Array.isArray(bank.items) ? bank.items : [];
const ids = new Set();
const allowedDimensions = new Set(["R", "I", "A", "S", "E", "C", "CONTEXT"]);

if (bank.meta?.totalItems !== 1000) errors.push("meta.totalItems must be 1000");
if (items.length !== 1000) errors.push(`items must contain 1000 records, found ${items.length}`);

for (const [index, item] of items.entries()) {
  const label = item?.id || `item ${index + 1}`;
  if (typeof item?.id !== "string" || !item.id) errors.push(`${label}: missing id`);
  else if (ids.has(item.id)) errors.push(`${label}: duplicate id`);
  else ids.add(item.id);

  if (!allowedDimensions.has(item?.dimension)) errors.push(`${label}: invalid dimension`);
  if (typeof item?.text?.en !== "string" || !item.text.en.trim()) {
    errors.push(`${label}: missing English text`);
  }
  if (typeof item?.text?.th !== "string" || !item.text.th.trim()) {
    errors.push(`${label}: missing Thai field`);
  } else if (!/[\u0E00-\u0E7F]/u.test(item.text.th)) {
    errors.push(`${label}: Thai field contains no Thai characters`);
  }
  if (typeof item?.source?.framework !== "string" || !item.source.framework.trim()) {
    errors.push(`${label}: missing source framework`);
  }
  if (typeof item?.source?.citation !== "string" || !item.source.citation.trim()) {
    errors.push(`${label}: missing source citation`);
  }
}

for (const item of items) {
  for (const key of ["nextOnHigh", "nextOnLow", "nextOnNeutral"]) {
    const target = item?.branching?.[key];
    if (typeof target !== "string" || !ids.has(target)) {
      errors.push(`${item?.id || "unknown"}: ${key} points to missing item ${String(target)}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Future question-bank validation failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Future question bank structurally valid: ${items.length} unique bilingual items and all branch targets resolve. Research-only until content validation is complete.`,
  );
}
