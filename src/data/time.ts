// Anchored "now" for the demo so timestamps are deterministic across reloads.
export const NOW = new Date("2026-04-28T15:00:00.000Z");

export const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86400000).toISOString();

export const daysFromNow = (n: number) =>
  new Date(NOW.getTime() + n * 86400000).toISOString();

export const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3600000).toISOString();
