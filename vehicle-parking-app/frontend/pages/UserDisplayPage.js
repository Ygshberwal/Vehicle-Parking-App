import {api} from '../utils/api.js';
export default {
    props: ['id'],
    data() { return {user: null, loading: true, error: ''}; },
    mounted() { this.load(); },
    methods: {async load() { this.loading = true; this.error = ''; try { this.user = await api('/api/users/' + this.id); } catch (error) { this.error = error.message; } finally { this.loading = false; } }},
    template: `<main class="workspace"><router-link to="/users" class="breadcrumb-link"><AppIcon name="back" size="15" />Back to users</router-link><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><PageHeader :eyebrow="'User #' + user.id" :title="user.name" description="Account details and parking activity."><router-link :to="'/user-stats/' + user.id" class="btn btn-primary"><AppIcon name="chart" />View parking insights</router-link></PageHeader><section class="surface detail-body"><dl class="detail-facts mb-0"><div><dt>Full name</dt><dd>{{ user.name }}</dd></div><div><dt>Email address</dt><dd class="break-word">{{ user.email }}</dd></div><div><dt>Account status</dt><dd><span class="status-badge" :class="user.active ? '' : 'danger'">{{ user.active ? 'Active' : 'Blocked' }}</span></dd></div><div><dt>User ID</dt><dd>#{{ user.id }}</dd></div></dl></section></template></main>`,
};
