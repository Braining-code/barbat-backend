#!/usr/bin/env bash
set -e

echo "🟦 Installing Chrome for Puppeteer (Render)..."

apt-get update
apt-get install -y wget gnupg

wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'

apt-get update
apt-get install -y google-chrome-stable

echo "✔ Chrome installed at: $(which google-chrome-stable)"
echo "✔ Version: $(google-chrome-stable --version)"
