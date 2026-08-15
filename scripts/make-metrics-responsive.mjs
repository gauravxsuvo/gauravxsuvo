#!/usr/bin/env node
// Makes the generated github-metrics.svg scale down on narrow screens.
//
// lowlighter/metrics emits a root <svg> with a fixed pixel width and height and
// no viewBox. Without a viewBox the SVG has no scalable coordinate system, so
// renderers that don't apply the <img> element's width (notably the GitHub
// mobile app, WebKit) draw it at full size and clip it instead of shrinking it.
//
// Replacing the fixed width/height with width="100%" plus a viewBox makes the
// image adapt to whatever container it lands in, on every renderer. Desktop is
// unaffected: it already filled the README column via the img's width="100%".

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("../github-metrics.svg", import.meta.url));
const svg = readFileSync(svgPath, "utf8");

if (/^<svg[^>]*\bviewBox=/.test(svg)) {
  console.log("github-metrics.svg is already responsive, nothing to do");
  process.exit(0);
}

const size = svg.match(/^<svg[^>]*?\bwidth="(\d+)" height="(\d+)"/);
if (!size) throw new Error("no fixed width/height found on the root <svg> of github-metrics.svg");

const [fixed, width, height] = size;
const responsive = fixed.replace(
  `width="${width}" height="${height}"`,
  `width="100%" viewBox="0 0 ${width} ${height}"`,
);

writeFileSync(svgPath, svg.replace(fixed, responsive));
console.log(`github-metrics.svg made responsive: ${width}x${height} -> width="100%" viewBox="0 0 ${width} ${height}"`);
