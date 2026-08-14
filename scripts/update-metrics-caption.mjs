#!/usr/bin/env node
// Copies the "Last updated ..." line out of the generated github-metrics.svg
// and into the caption under the image in README.md. The card itself hides its
// footer (see extras_css in .github/workflows/metrics.yaml), so this keeps that
// information visible without duplicating it inside the card.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("../github-metrics.svg", import.meta.url));
const readmePath = fileURLToPath(new URL("../README.md", import.meta.url));

const svg = readFileSync(svgPath, "utf8");
const caption = svg.match(/<span>(Last updated [^<]*)<\/span>/)?.[1];
if (!caption) throw new Error("no 'Last updated' line found in github-metrics.svg");

const readme = readFileSync(readmePath, "utf8");
const markers = /(<!--metrics-caption-->)[\s\S]*?(<!--\/metrics-caption-->)/;
if (!markers.test(readme)) throw new Error("metrics-caption markers not found in README.md");

const updated = readme.replace(markers, `$1${caption}$2`);
writeFileSync(readmePath, updated);
console.log(`README caption updated: ${caption}`);
