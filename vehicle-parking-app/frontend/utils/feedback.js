export const feedback = Vue.observable({notices: [], dialog: null});
let nextId = 0;
let resolveDialog;

export function notify(message, type = 'success') {
    const id = ++nextId;
    feedback.notices.push({id, message, type});
    if (feedback.notices.length > 2) feedback.notices.shift();
    setTimeout(() => dismiss(id), 6500);
}
export function dismiss(id) {
    feedback.notices = feedback.notices.filter(notice => notice.id !== id);
}
export function confirmAction(options) {
    if (resolveDialog) return Promise.resolve(false);
    feedback.dialog = {confirmLabel: 'Confirm', danger: false, ...options};
    return new Promise(resolve => { resolveDialog = resolve; });
}
export function closeDialog(confirmed) {
    const resolve = resolveDialog;
    feedback.dialog = null;
    resolveDialog = null;
    if (resolve) resolve(confirmed);
}
