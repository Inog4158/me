#!/bin/bash
set -e

echo "[*] Building site with Eleventy..."
npx @11ty/eleventy

echo "[*] Adding changes to Git..."
git add -A

datestr=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Build $datestr"

echo "[*] Pushing to GitHub..."
git push origin main

echo "[*] Done!"
