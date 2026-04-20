---
title: GitHub Pages
tags: [documentation, github-pages]
---

# SaneGit GitHub Pages

This directory contains the GitHub Pages website for SaneGit.

## Structure

- `index.html` - Main landing page with features, commands, and quick start guide
- `_config.yml` - Jekyll configuration for GitHub Pages

## Accessing the Site

The site is automatically published at:
**https://ntufar.github.io/sanegit**

## How It Works

GitHub Pages automatically serves:
1. `index.html` as the homepage
2. Static assets and styling included inline
3. Responsive design for desktop, tablet, and mobile

## Building Locally

To test the site locally (requires Jekyll):

```bash
# Install Jekyll
gem install bundler jekyll

# Run locally
jekyll serve
# Visit http://localhost:4000
```

## Customizing

- Edit `index.html` to change the content and styling
- Update `_config.yml` for Jekyll settings
- Push changes to the `master` branch to auto-publish

## Deployment

The site is automatically deployed whenever you push changes to the `docs/` folder on the `master` branch in GitHub.
