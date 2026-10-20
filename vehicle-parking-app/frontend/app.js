import Navbar from './components/Navbar.js';
import router from './utils/router.js';
import store from './utils/store.js';
import {notify} from './utils/feedback.js';
import {AppIcon, PageHeader, AppState, StatCard, AppPagination, FeedbackLayer} from './components/UI.js';

for (const [name, component] of Object.entries({AppIcon, PageHeader, AppState, StatCard, AppPagination})) {
    Vue.component(name, component);
}
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
    const response = await originalFetch(input, options);
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    if (url.origin === location.origin && response.status === 401 && url.pathname !== '/login') {
        if (store.state.loggedIn) {
            store.commit('logout');
            notify('Your session has expired. Please sign in again.', 'error');
        }
    }
    return response;
};

new Vue({
    el: '#app', router, store,
    components: {Navbar, FeedbackLayer},
    methods: {focusMain() { document.getElementById('main-content').focus(); }},
    template: `<div class="app-root"><a class="skip-link" href="#main-content" @click.prevent="focusMain">Skip to content</a><Navbar /><div id="main-content" class="app-content" tabindex="-1"><router-view :key="$route.fullPath" /></div><FeedbackLayer /></div>`,
});

router.afterEach(to => {
    document.title = (to.meta.title ? to.meta.title + ' · ' : '') + 'ParkingApp';
    Vue.nextTick(() => { const main = document.getElementById('main-content'); if (main) main.focus({preventScroll: true}); });
});
router.onReady(() => { document.title = (router.currentRoute.meta.title ? router.currentRoute.meta.title + ' · ' : '') + 'ParkingApp'; });
