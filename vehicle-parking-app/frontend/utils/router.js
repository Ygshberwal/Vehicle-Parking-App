const Home = {
    template : `<h1> this is home </h1>`
}
import LoginPage from "../pages/LoginPage.js";
import LotListPage from "../pages/LotListPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import LotDisplayPage from "../pages/LotDisplayPage.js";

const routes = [
    {path : '/',component: Home},
    {path:'/login', component: LoginPage},
    {path:'/register', component : RegisterPage},
    {path:'/lots', component : LotListPage},
    {path:'/lots/:id', component : LotDisplayPage, props : true},
]

const router =  new VueRouter({
    routes
})

export default router;