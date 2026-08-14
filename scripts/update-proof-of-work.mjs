#!/usr/bin/env node
// Regenerates the three stat values in assets/proof-of-work.svg from live GitHub data.
// Copy, layout, and colors in the SVG are hand-authored and untouched by this script.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const username = "gauravxsuvo";
const token = process.env.METRICS_TOKEN;

if (!token) {
  console.error("METRICS_TOKEN is not set");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": username,
};

async function rest(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function graphql(query) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function getContributions() {
  const data = await graphql(`
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }
  `);
  return data.user.contributionsCollection.contributionCalendar.totalContributions;
}

async function getStars() {
  let total = 0;
  for (let page = 1; ; page++) {
    const repos = await rest(`/users/${username}/repos?per_page=100&page=${page}`);
    if (repos.length === 0) break;
    for (const repo of repos) if (!repo.fork) total += repo.stargazers_count;
    if (repos.length < 100) break;
  }
  return total;
}

async function getExternalMerges() {
  const q = encodeURIComponent(`author:${username} type:pr is:merged -user:${username}`);
  const result = await rest(`/search/issues?q=${q}`);
  return result.total_count;
}

const [contributions, stars, merges] = await Promise.all([
  getContributions(),
  getStars(),
  getExternalMerges(),
]);

function replaceValue(svg, x, value) {
  const pattern = new RegExp(`(<text class="value" x="${x}" y="205">)\\d+(</text>)`);
  if (!pattern.test(svg)) throw new Error(`stat value node at x="${x}" not found in proof-of-work.svg`);
  return svg.replace(pattern, `$1${value}$2`);
}

const svgPath = fileURLToPath(new URL("../assets/proof-of-work.svg", import.meta.url));
let svg = readFileSync(svgPath, "utf8");

svg = replaceValue(svg, 56, contributions);
svg = replaceValue(svg, 424, stars);
svg = replaceValue(svg, 792, merges);

const descPattern = /<desc id="desc">.*<\/desc>/;
if (!descPattern.test(svg)) throw new Error("desc node not found in proof-of-work.svg");
svg = svg.replace(
  descPattern,
  `<desc id="desc">${contributions} public contributions in the last twelve months, ${stars} stars across maintained repositories, and ${merges} pull requests merged into other people's projects.</desc>`,
);

writeFileSync(svgPath, svg);
console.log(`proof-of-work.svg updated: ${contributions} contributions, ${stars} stars, ${merges} external merges`);
