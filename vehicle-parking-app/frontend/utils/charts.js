export function monthlyEntries(data = {}) {
    return Object.entries(data).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => [
        new Date(month + '-01T12:00:00').toLocaleDateString('en-IN', {month: 'short', year: '2-digit'}), value,
    ]);
}
export function topEntries(data = {}, limit = 8) {
    return Object.entries(data).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}
