console.log("App.js loaded");

import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js";

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

