const STATS_KEY = 'easyeats_stats';

const defaultStats = {
  mealsMade: 0,
  itemsSaved: 0,
  moneySaved: 0,
  co2Saved: 0,
};

export function getStats() {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : defaultStats;
  } catch {
    return defaultStats;
  }
}

export function recordScan(ingredients) {
  const stats = getStats();
  const urgentCount = ingredients.filter(i => i.days_left <= 5).length;

  const updated = {
    mealsMade:  stats.mealsMade + 1,
    itemsSaved: stats.itemsSaved + urgentCount,
    moneySaved: parseFloat((stats.moneySaved + urgentCount * 0.5).toFixed(2)),
    co2Saved:   parseFloat((stats.co2Saved + urgentCount * 0.25).toFixed(2)),
  };

  localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
}