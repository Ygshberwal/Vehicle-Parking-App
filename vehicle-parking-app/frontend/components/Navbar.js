export default {
    data() { return {open: false}; },
    computed: {
        user() { return this.$store.state; },
        initials() { return (this.user.name || '').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); },
        links() {
            if (!this.user.loggedIn) return [{to: '/', text: 'Home'}, {to: '/login', text: 'Sign in'}];
            if (this.user.role === 'admin') return [
                {to: '/admin-dashboard', text: 'Overview', icon: 'grid'},
                {to: '/lots', text: 'Parking lots', icon: 'pin'},
                {to: '/user-dashboard/' + this.user.user_id, text: 'Bookings', icon: 'calendar'},
                {to: '/users', text: 'Users', icon: 'users'},
                {to: '/all-stats', text: 'Analytics', icon: 'chart'},
            ];
            return [
                {to: '/lots', text: 'Find parking', icon: 'pin'},
                {to: '/user-dashboard/' + this.user.user_id, text: 'My bookings', icon: 'calendar'},
                {to: '/user-stats/' + this.user.user_id, text: 'My insights', icon: 'chart'},
            ];
        },
    },
    watch: {'$route'() { this.open = false; }},
    template: `<header class="app-navigation"><nav class="nav-inner" aria-label="Main navigation"><router-link class="app-brand" to="/" aria-label="ParkingApp home"><span class="brand-symbol" aria-hidden="true">P<span></span></span><span>Parking<span class="brand-light">App</span></span></router-link><button class="nav-toggle icon-button" @click="open = !open" :aria-expanded="open ? 'true' : 'false'" aria-controls="main-navigation" :aria-label="open ? 'Close navigation' : 'Open navigation'"><AppIcon :name="open ? 'close' : 'menu'" size="22" /></button><div id="main-navigation" class="nav-content" :class="{'is-open': open}"><div class="nav-links"><router-link v-for="link in links" :key="link.to" :to="link.to" :exact="link.to === '/'" class="nav-link-item" active-class="is-active"><AppIcon v-if="link.icon" :name="link.icon" size="17" />{{ link.text }}</router-link></div><div v-if="user.loggedIn" class="nav-account"><span class="user-avatar" aria-hidden="true">{{ initials }}</span><div class="nav-identity"><strong>{{ user.name }}</strong><span>{{ user.role === 'admin' ? 'Admin workspace' : 'Driver account' }}</span></div><button class="icon-button" @click="$store.commit('logout')" aria-label="Sign out" title="Sign out"><AppIcon name="logout" /></button></div><router-link v-else to="/register" class="btn btn-primary btn-sm">Create an account <AppIcon name="arrow" size="16" /></router-link></div></nav></header>`,
};
