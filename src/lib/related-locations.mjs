// Rotating window of sibling city pages, so inbound internal links spread
// evenly across every location instead of all pointing at the alphabetically
// first few (ported from clayboicardi.com's related-industries pattern).
//
// all: Array<{ id, data: { city } }>  ·  currentId: this page's id
export function relatedLocations(all, currentId, limit = 3) {
  const sorted = [...all].sort((a, b) => a.data.city.localeCompare(b.data.city, "en"));
  const idx = sorted.findIndex((e) => e.id === currentId);
  if (idx === -1) return [];
  const out = [];
  for (let i = 1; i < sorted.length && out.length < limit; i++) {
    out.push(sorted[(idx + i) % sorted.length]); // never wraps onto self
  }
  return out;
}
