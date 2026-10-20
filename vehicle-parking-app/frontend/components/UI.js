import {feedback, dismiss, closeDialog} from '../utils/feedback.js';
import {number} from '../utils/api.js';

const icons = {
    arrow: 'M5 12h14m-6-6 6 6-6 6', back: 'M19 12H5m6-6-6 6 6 6',
    search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    chart: 'M4 4v16h17M8 15v-4m5 4V7m5 8V3',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    calendar: 'M4 5h16v16H4zM8 2v6m8-6v6M4 11h16',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.87a4 4 0 0 1 0 7.75',
    download: 'M21 15v5H3v-5m9-13v13m-5-5 5 5 5-5',
    plus: 'M12 5v14M5 12h14', check: 'm5 12 4 4L19 6',
    close: 'm6 6 12 12M6 18 18 6', menu: 'M3 6h18M3 12h18M3 18h18',
    clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Zm-3 3 5 5',
    logout: 'M9 21H3V3h6m6 4 5 5-5 5M8 12h12',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    info: 'M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

export const AppIcon = {
    props: {name: String, size: {default: 18}},
    computed: {path() { return icons[this.name] || icons.grid; }},
    template: `<svg class="app-icon" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="path" /></svg>`,
};
export const PageHeader = {
    props: ['eyebrow', 'title', 'description'],
    template: `<header class="page-header"><div><p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p v-if="description" class="page-description">{{ description }}</p></div><div v-if="$slots.default" class="page-actions"><slot /></div></header>`,
};
export const AppState = {
    props: {loading: Boolean, error: String, title: String, description: String, icon: {default: 'grid'}},
    template: `<div class="app-state" :class="{'app-state-error': error}" :role="error ? 'alert' : 'status'" :aria-busy="loading ? 'true' : 'false'"><span v-if="loading" class="app-spinner" aria-hidden="true"></span><span v-else class="state-icon"><AppIcon :name="error ? 'info' : icon" size="24" /></span><h2>{{ loading ? 'Loading your workspace…' : error ? 'We couldn’t load this page' : title }}</h2><p>{{ loading ? 'This should only take a moment.' : error || description }}</p><button v-if="error" class="btn btn-outline-secondary" @click="$emit('retry')">Try again</button><slot v-else-if="!loading" /></div>`,
};
export const StatCard = {
    props: ['label', 'value', 'detail', 'icon'],
    template: `<div class="stat-card"><div class="stat-top"><span>{{ label }}</span><AppIcon v-if="icon" :name="icon" /></div><strong>{{ value }}</strong><span class="stat-detail">{{ detail }}</span></div>`,
};
export const AppPagination = {
    props: {page: Number, total: Number, size: {default: 12}},
    computed: {
        pages() { return Math.max(1, Math.ceil(this.total / this.size)); },
        from() { return this.total ? (this.page - 1) * this.size + 1 : 0; },
        to() { return Math.min(this.page * this.size, this.total); },
    },
    watch: {pages(value) { if (this.page > value) this.$emit('change', value); }},
    methods: {
        number,
        change(page) {
            this.$emit('change', page);
            this.$nextTick(() => {
                if (this.$el.nodeType !== 1) return;
                const results = this.$el.closest('.surface') || this.$el.parentElement;
                results.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
            });
        },
    },
    template: `<nav v-if="total" class="app-pagination" aria-label="Results pagination"><span>Showing <strong>{{ number(from) }}–{{ number(to) }}</strong> of {{ number(total) }}</span><div class="pagination-controls"><button class="btn btn-outline-secondary btn-sm" :disabled="page <= 1" @click="change(page - 1)" aria-label="Previous page"><AppIcon name="back" /> <span>Previous</span></button><span class="page-indicator">{{ page }} / {{ pages }}</span><button class="btn btn-outline-secondary btn-sm" :disabled="page >= pages" @click="change(page + 1)" aria-label="Next page"><span>Next</span> <AppIcon name="arrow" /></button></div></nav>`,
};
export const FeedbackLayer = {
    data() { return {feedback, previousFocus: null}; },
    methods: {
        dismiss, closeDialog,
        onKey(event) {
            if (!this.feedback.dialog) return;
            if (event.key === 'Escape') this.closeDialog(false);
            if (event.key === 'Tab') {
                const buttons = this.$refs.dialog.querySelectorAll('button');
                const first = buttons[0], last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        },
    },
    watch: {
        'feedback.dialog'(value) {
            if (value) {
                this.previousFocus = document.activeElement;
                document.body.classList.add('dialog-open');
                this.$nextTick(() => this.$refs.cancel.focus());
            } else {
                document.body.classList.remove('dialog-open');
                this.$nextTick(() => { if (this.previousFocus && this.previousFocus.isConnected) this.previousFocus.focus(); });
            }
            document.querySelectorAll('.app-navigation, #main-content, .demo-banner').forEach(element => { element.inert = Boolean(value); });
        },
    },
    mounted() { document.addEventListener('keydown', this.onKey); },
    beforeDestroy() { document.removeEventListener('keydown', this.onKey); document.body.classList.remove('dialog-open'); },
    template: `<div><div class="notice-stack" aria-live="polite" aria-atomic="false"><div v-for="notice in feedback.notices" :key="notice.id" class="app-notice" :class="'notice-' + notice.type" role="status"><AppIcon :name="notice.type === 'error' ? 'info' : 'check'" /><span>{{ notice.message }}</span><button class="icon-button" @click="dismiss(notice.id)" aria-label="Dismiss notification"><AppIcon name="close" /></button></div></div><div v-if="feedback.dialog" class="dialog-overlay" @click.self="closeDialog(false)"><section class="app-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description" ref="dialog"><span class="state-icon" :class="{'text-danger': feedback.dialog.danger}"><AppIcon name="info" size="24" /></span><h2 id="dialog-title">{{ feedback.dialog.title }}</h2><p id="dialog-description">{{ feedback.dialog.message }}</p><div class="dialog-actions"><button ref="cancel" class="btn btn-outline-secondary" @click="closeDialog(false)">Cancel</button><button class="btn" :class="feedback.dialog.danger ? 'btn-danger' : 'btn-primary'" @click="closeDialog(true)">{{ feedback.dialog.confirmLabel }}</button></div></section></div></div>`,
};
