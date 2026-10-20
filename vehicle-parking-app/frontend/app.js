console.log("App.js loaded");

import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js";

// Stale tokens after a demo reset should return to login, not break dashboards.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
    const response = await originalFetch(input, options);
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    if (url.origin === location.origin && response.status === 401 && url.pathname !== '/login') {
        store.commit('logout');
    }
    return response;
};

const app = new Vue({
    el : '#app',                // element to mount to, id='app' in index.html
    template : `
        <div>
            <Navbar />
            <router-view> </router-view>       <!-- change to whatever component router is pointing to -->
            
        </div>
    `,
    components : {
        Navbar,
    },
    router,
    store,

})
