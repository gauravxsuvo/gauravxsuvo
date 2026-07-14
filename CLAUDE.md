# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is `gauravxsuvo`'s GitHub profile README repository (repo name matches the username, so GitHub renders `README.md` on the profile page). There is no application code — it's a static profile page plus one automated pipeline.

## Commands

There is no build step, lint config, or test suite in this repo — it's markdown + one GitHub Actions workflow.

## Architecture

- **`README.md`** is the profile page itself: intro/bio, a table pairing the metrics chart with contact links, and an "Articles" section maintained by hand (no auto-fetch — links are added manually, one markdown entry per line under the `<!-- Add your articles below -->` comment).
- **`.github/workflows/metrics.yaml`** runs the third-party `lowlighter/metrics` action (no local code) on a daily cron plus `push`/`workflow_dispatch`, regenerating `github-metrics.svg`, which `README.md` embeds directly via an `<img>` tag, and auto-committing the result back to `main`. Requires the `METRICS_TOKEN` secret to be set in the repo's GitHub Actions secrets.

There used to be a second pipeline (`feed.py` + `blog.yaml`) that auto-fetched blog posts via RSS; it was removed since articles are added manually instead.
