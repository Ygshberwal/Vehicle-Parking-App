console.log("App.js loaded");

import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"

const app = new Vue({
    el : '#app',                // element to mount to, id='app' in index.html
    template : `
        <div>
            <Navbar />
            <router-view> </router-view>
        </div>
    `,
    components : {
        Navbar,
    },
    router,

})

