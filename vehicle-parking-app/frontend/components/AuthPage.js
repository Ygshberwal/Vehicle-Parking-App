import {api} from '../utils/api.js';
import {notify} from '../utils/feedback.js';

export default {
    props: {register: Boolean},
    data() { return {name: '', email: '', password: '', pincode: '', showPassword: false, pending: false, error: ''}; },
    computed: {demo() { return document.body.dataset.demo === 'true'; }},
    methods: {
        async submit() {
            if (this.pending) return;
            this.error = ''; this.pending = true;
            try {
                if (this.register) {
                    await api('/register', {method: 'POST', body: {name: this.name.trim(), email: this.email.trim(), password: this.password, pincode: this.pincode, role: 'user'}});
                    notify('Your account is ready. Sign in to find your first parking space.');
                    this.$router.push('/login');
                } else {
                    const data = await api('/login', {method: 'POST', body: {email: this.email.trim(), password: this.password}});
                    if (!data.token) throw new Error(data.message || 'Unable to sign in. Please try again.');
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$store.commit('setUser');
                    const redirect = this.$route.query.redirect;
                    this.$router.push(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
                        ? redirect : data.role === 'admin' ? '/admin-dashboard' : '/lots');
                }
            } catch (error) {
                this.error = error.message;
                this.$nextTick(() => { if (this.$refs.error) this.$refs.error.focus(); });
            } finally { this.pending = false; }
        },
        tryDemo(role) {
            this.email = role === 'admin' ? 'admin@parking.com' : 'user01@parking.com';
            this.password = role === 'admin' ? 'admin123' : 'user123';
            this.submit();
        },
    },
    template: `<main class="auth-layout"><section class="auth-intro"><span class="brand-symbol" aria-hidden="true">P</span><p class="eyebrow mt-4">A simpler parking routine</p><h1>A space for your<br>next stop.</h1><p>Find your spot, manage your visits, and keep your parking details in one place.</p><ul class="auth-benefits"><li><AppIcon name="pin" />Find locations and compare hourly rates</li><li><AppIcon name="calendar" />Keep track of every parking session</li><li><AppIcon name="chart" />Understand your parking expenses</li></ul></section><section class="surface auth-card" :aria-busy="pending ? 'true' : 'false'"><h2>{{ register ? 'Create your account' : 'Welcome back' }}</h2><p>{{ register ? 'A few details, and you’re ready to find parking.' : 'Sign in to continue to your workspace.' }}</p><div v-if="error" ref="error" tabindex="-1" class="inline-feedback error" role="alert"><AppIcon name="info" /><span>{{ error }}</span></div><form @submit.prevent="submit"><div v-if="register" class="field"><label for="auth-name">Full name</label><input id="auth-name" class="form-control" v-model.trim="name" autocomplete="name" placeholder="Your full name" maxlength="80" required :disabled="pending"></div><div class="field"><label for="auth-email">Email address</label><input id="auth-email" class="form-control" type="email" v-model.trim="email" autocomplete="username" placeholder="you@example.com" maxlength="254" required :disabled="pending"></div><div class="field"><label for="auth-password">Password</label><div class="input-with-action"><input id="auth-password" class="form-control" :type="showPassword ? 'text' : 'password'" v-model="password" :autocomplete="register ? 'new-password' : 'current-password'" :minlength="register ? 8 : 1" :maxlength="register ? 72 : 128" placeholder="Enter your password" :aria-describedby="register ? 'password-help' : null" required :disabled="pending"><button type="button" class="icon-button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword ? 'true' : 'false'"><AppIcon name="eye" /></button></div><small v-if="register" id="password-help">Use at least 8 characters. Don’t reuse a password from another account.</small></div><div v-if="register" class="field"><label for="auth-pin">PIN code <span class="optional">optional</span></label><input id="auth-pin" class="form-control" v-model="pincode" inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="Six-digit postal code" :disabled="pending"></div><button type="submit" class="btn btn-primary form-submit" :disabled="pending"><span v-if="pending" class="app-spinner" aria-hidden="true"></span>{{ pending ? (register ? 'Creating your account…' : 'Signing in…') : register ? 'Create account' : 'Sign in' }}<AppIcon v-if="!pending" name="arrow" size="16" /></button></form><div v-if="demo && !register" class="demo-signin"><p>JUST EXPLORING? USE A SHARED DEMO ACCOUNT.</p><div><button type="button" class="btn btn-outline-secondary btn-sm" :disabled="pending" @click="tryDemo('user')">Try as driver</button><button type="button" class="btn btn-outline-secondary btn-sm" :disabled="pending" @click="tryDemo('admin')">Try as admin</button></div></div><div class="auth-switch">{{ register ? 'Already have an account?' : 'New to ParkingApp?' }}<router-link :to="register ? '/login' : '/register'">{{ register ? 'Sign in' : 'Create an account' }}</router-link></div></section></main>`,
};
