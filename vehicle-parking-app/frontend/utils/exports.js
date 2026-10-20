// Hosted demos download directly; local development keeps Celery exports.
export async function downloadExport(kind, token) {
    const headers = {'Authentication-Token': token};
    const created = await fetch(`/${kind}-create`, {headers});
    const data = await created.json();
    if (!created.ok) throw new Error(data.message || 'Unable to start export');

    let response;
    if (data.download_url) {
        response = await fetch(data.download_url, {headers});
    } else {
        const deadline = Date.now() + 120000;
        while (Date.now() < deadline) {
            response = await fetch(`/${kind}-download/${data.task_id}`, {headers});
            if (response.status !== 202) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    if (!response || response.status === 202) throw new Error('Export timed out. Is the Celery worker running?');
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Export failed');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `${kind}_data.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
