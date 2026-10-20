import {api, number} from '../utils/api.js';
import {notify, confirmAction} from '../utils/feedback.js';
import {downloadExport} from '../utils/exports.js';

export default {
    data() { return {users: [], search: '', filter: 'all', page: 1, loading: true, error: '', exporting: false, updating: null}; },
    computed: {
        active() { return this.users.filter(user => user.active).length; },
        filtered() { const query = this.search.trim().toLowerCase(); return this.users.filter(user =>
            (this.filter === 'all' || Boolean(user.active) === (this.filter === 'active')) && `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query)); },
        visible() { return this.filtered.slice((this.page - 1) * 20, this.page * 20); },
    },
    watch: {search() { this.page = 1; }, filter() { this.page = 1; }},
    mounted() { this.load(); },
    methods: {
        number,
        initials(name) { return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); },
        async load() { this.loading = true; this.error = ''; try { this.users = await api('/api/users'); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
        async toggle(user) {
            if (!await confirmAction({title: (user.active ? 'Block ' : 'Unblock ') + user.name + '?', message: user.active ? 'This user will no longer be able to sign in or make bookings. Their existing booking history will be preserved.' : 'This restores the user’s access to their account and booking features.', confirmLabel: user.active ? 'Block user' : 'Restore access', danger: Boolean(user.active)})) return;
            this.updating = user.id;
            try { const updated = await api('/api/users/' + user.id, {method: 'PUT'}); user.active = updated.active; notify(updated.active ? 'User access restored.' : 'User account blocked.'); }
            catch (error) { notify(error.message, 'error'); } finally { this.updating = null; }
        },
        async exportUsers() { this.exporting = true; try { await downloadExport('users', this.$store.state.auth_token); notify('Your user export is ready.'); } catch (error) { notify(error.message, 'error'); } finally { this.exporting = false; } },
    },
    template: `<main class="workspace"><PageHeader eyebrow="Admin workspace" title="User management" description="Review registered drivers and manage account access."><button class="btn btn-outline-secondary" :disabled="exporting || loading" @click="exportUsers"><AppIcon name="download" />{{ exporting ? 'Preparing export…' : 'Export users' }}</button></PageHeader><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><div class="stats-grid three"><StatCard label="Registered drivers" :value="number(users.length)" detail="Excludes admin accounts" /><StatCard label="Active accounts" :value="number(active)" detail="Can sign in and book" /><StatCard label="Blocked accounts" :value="number(users.length - active)" detail="Access currently restricted" /></div><div class="surface"><div class="surface-heading"><div class="filter-tabs" aria-label="Filter account status"><button @click="filter = 'all'" :aria-pressed="filter === 'all'">All users</button><button @click="filter = 'active'" :aria-pressed="filter === 'active'">Active</button><button @click="filter = 'blocked'" :aria-pressed="filter === 'blocked'">Blocked</button></div><label class="search-field mb-0"><AppIcon name="search" /><input v-model="search" aria-label="Search users" type="search" placeholder="Search name, email or user ID"></label></div><div v-if="visible.length" class="table-wrap"><table class="data-table responsive-table"><caption class="sr-only">Registered drivers and account access</caption><thead><tr><th scope="col">User</th><th scope="col">Email address</th><th scope="col">Status</th><th scope="col">Account access</th></tr></thead><tbody><tr v-for="user in visible" :key="user.id"><td class="identity-cell" data-label="User"><div class="record-name"><span class="user-avatar" aria-hidden="true">{{ initials(user.name) }}</span><div><router-link class="record-primary" :to="'/users/' + user.id">{{ user.name }}</router-link><span class="record-secondary">User #{{ user.id }}</span></div></div></td><td data-label="Email"><span class="break-word">{{ user.email }}</span></td><td data-label="Status"><span class="status-badge" :class="user.active ? '' : 'danger'">{{ user.active ? 'Active' : 'Blocked' }}</span></td><td data-label="Account access"><button class="btn btn-sm" :class="user.active ? 'btn-quiet' : 'btn-outline-secondary'" :disabled="updating === user.id" @click="toggle(user)" :aria-label="(user.active ? 'Block ' : 'Unblock ') + user.name">{{ updating === user.id ? 'Updating…' : user.active ? 'Block user' : 'Unblock user' }}</button></td></tr></tbody></table></div><AppState v-else icon="users" :title="users.length ? 'No matching users' : 'No registered drivers yet'" description="Users will appear here when they create an account."><button v-if="users.length" class="btn btn-outline-secondary" @click="search = ''; filter = 'all'">Clear filters</button></AppState><AppPagination :page="page" :total="filtered.length" :size="20" @change="page = $event" /></div></template></main>`,
};
