/**
 * Sanity Content Watcher
 * Polls Sanity CMS every 10 seconds for content changes.
 * When a change is detected, it touches the data file to trigger an Eleventy rebuild.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01';

if (!projectId) {
  console.log('[sanity-watch] No SANITY_PROJECT_ID found. Watcher disabled.');
  process.exit(0);
}

let lastUpdated = '';
const POLL_INTERVAL = 10000; // 10 seconds
const DATA_FILE = path.join(__dirname, '..', 'src', '_data', 'sanityPosts.js');

async function checkForChanges() {
  try {
    const query = encodeURIComponent('*[_type == "post"] | order(_updatedAt desc)[0]._updatedAt');
    const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`;

    const response = await fetch(url);
    const data = await response.json();
    const latest = data.result;

    if (latest && latest !== lastUpdated) {
      if (lastUpdated !== '') {
        // Content changed — touch the data file to trigger Eleventy rebuild
        const now = new Date();
        fs.utimesSync(DATA_FILE, now, now);
        console.log(`[sanity-watch] ✓ Content changed! Triggering rebuild... (${now.toLocaleTimeString()})`);
      }
      lastUpdated = latest;
    }
  } catch (err) {
    // Silent fail — network issues shouldn't crash the watcher
  }
}

console.log('[sanity-watch] 👀 Watching Sanity for content changes (every 10s)...');
console.log('[sanity-watch] Publish changes in Sanity Studio → site rebuilds automatically!\n');

checkForChanges();
setInterval(checkForChanges, POLL_INTERVAL);
