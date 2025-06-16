import LoginPage from "../pages/LoginPage.js";
import LotListPage from "../pages/LotListPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import LotDisplayPage from "../pages/LotDisplayPage.js";
import HomePage from "../pages/HomePage.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js"
import UserDashboardPage from "../pages/UserDashboardPage.js";
import AddParkingLot from "../pages/AddParkingLot.js";
import UpdateParkingLot from "../pages/UpdateParkingLot.js";
import store from "./store.js";
import AllUsersPage from "../pages/AllUsersPage.js"
import UserDisplayPage from "../pages/UserDisplayPage.js";

const routes = [
    {path : '/',component: HomePage},
    {path:'/login', component: LoginPage},
    {path:'/register', component : RegisterPage},
    {path:'/lots', component : LotListPage, meta :{requiresLogin : true}},
    {path:'/lots/:id', component : LotDisplayPage, props : true, meta :{requiresLogin : true}},
    {path:'/admin-dashboard', component : AdminDashboardPage, props : true, meta :{requiresLogin : true, role : "admin"}},
    {path:'/users', component : AllUsersPage,  meta :{requiresLogin : true, role : "admin"}},
    {path:'/users/:id', component : UserDisplayPage,  meta :{requiresLogin : true, role : "admin"}},
    {path:'/user-dashboard/:id', component : UserDashboardPage, props : true, meta :{requiresLogin : true, role : "user"}},
    {path:'/add-lot', component : AddParkingLot},
    {path:'/lots/:id/update-lot', component : UpdateParkingLot},
]

const router =  new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {          // run everytime route changes
    // console.log("route is changed or refreshed")
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            console.log("redirecting to login")
            next({path : '/login'})
        }
        else if(to.meta.role && to.meta.role !=store.state.role){
            alert('Role not authorized, redirecting to home')
            next({path : '/'})
        }else{
            next()
        }
    }
    else{
        next()
    }
})



export default router;