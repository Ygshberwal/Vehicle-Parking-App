import store from './store.js';

export async function api(path, options = {}) {
    const headers = {'Accept': 'application/json', ...options.headers};
    if (store.state.auth_token) headers['Authentication-Token'] = store.state.auth_token;
    let body = options.body;
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }
    let response;
    try {
        response = await fetch(path, {...options, headers, body});
    } catch (error) {
        throw new Error('We couldn’t reach the server. Check your connection and try again.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || 'Something went wrong. Please try again.');
    return data;
}

export const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Number(value) || 0);
export const number = value => new Intl.NumberFormat('en-IN').format(Number(value) || 0);
export function dateTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}
