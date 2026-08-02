#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');

const accountTag = '10e684a115d2f5e04f0b2a66f9f6cf49';
const siteTag = '0b50ca33e33c4fe88ac7d8dcf76c03dc';
const keychainService = 'spacecat.cloudflare.analytics-read';
const keychainAccount = 'spacecat.watch';

function readToken() {
  if (process.env.CLOUDFLARE_ANALYTICS_TOKEN) {
    return process.env.CLOUDFLARE_ANALYTICS_TOKEN.trim();
  }

  if (process.platform !== 'darwin') {
    throw new Error(
      'Set CLOUDFLARE_ANALYTICS_TOKEN outside macOS; no token is stored in the repository.',
    );
  }

  return execFileSync(
    '/usr/bin/security',
    [
      'find-generic-password',
      '-w',
      '-s',
      keychainService,
      '-a',
      keychainAccount,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  ).trim();
}

function rangeFilter(milliseconds) {
  return {
    siteTag,
    datetime_geq: new Date(Date.now() - milliseconds).toISOString(),
    bot: 0,
  };
}

function normalize(rows) {
  const row = rows?.[0];
  return {
    visits: Number(row?.sum?.visits || 0),
    pageViews: Number(row?.count || 0),
  };
}

async function main() {
  const token = readToken();
  const query = `
    query SpaceCatWebAnalytics(
      $account: string
      $recent: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject
      $day: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject
      $week: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject
    ) {
      viewer {
        accounts(filter: { accountTag: $account }) {
          recent: rumPageloadEventsAdaptiveGroups(filter: $recent, limit: 1) {
            count
            sum { visits }
          }
          day: rumPageloadEventsAdaptiveGroups(filter: $day, limit: 1) {
            count
            sum { visits }
          }
          week: rumPageloadEventsAdaptiveGroups(filter: $week, limit: 1) {
            count
            sum { visits }
          }
        }
      }
    }
  `;
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        account: accountTag,
        recent: rangeFilter(5 * 60 * 1000),
        day: rangeFilter(24 * 60 * 60 * 1000),
        week: rangeFilter(7 * 24 * 60 * 60 * 1000),
      },
    }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const detail = payload.errors?.map((error) => error.message).join('; ')
      || `HTTP ${response.status}`;
    throw new Error(`Cloudflare Analytics query failed: ${detail}`);
  }

  const account = payload.data?.viewer?.accounts?.[0];
  if (!account) throw new Error('Cloudflare returned no matching analytics account.');

  const metrics = {
    generatedAt: new Date().toISOString(),
    botsExcluded: true,
    recentFiveMinutes: normalize(account.recent),
    last24Hours: normalize(account.day),
    last7Days: normalize(account.week),
  };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(metrics, null, 2));
    return;
  }

  const line = (label, data) =>
    `${label.padEnd(19)} ${String(data.visits).padStart(6)} visits  `
    + `${String(data.pageViews).padStart(6)} page views`;

  console.log('SPACE CAT :: WEB ANALYTICS');
  console.log('Bots excluded. Recent activity is not an exact concurrent-user count.');
  console.log(line('LAST 5 MINUTES', metrics.recentFiveMinutes));
  console.log(line('LAST 24 HOURS', metrics.last24Hours));
  console.log(line('LAST 7 DAYS', metrics.last7Days));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
