import LoginPage from '../pages/LoginPage.js';
import LotListPage from '../pages/LotListPage.js';
import RegisterPage from '../pages/RegisterPage.js';
import LotDisplayPage from '../pages/LotDisplayPage.js';
import HomePage from '../pages/HomePage.js';
import AdminDashboardPage from '../pages/AdminDashboardPage.js';
import UserDashboardPage from '../pages/UserDashboardPage.js';
import AddParkingLot from '../pages/AddParkingLot.js';
import UpdateParkingLot from '../pages/UpdateParkingLot.js';
import AllUsersPage from '../pages/AllUsersPage.js';
import UserDisplayPage from '../pages/UserDisplayPage.js';
import UserStatsPage from '../pages/UserStatsPage.js';
import AllStatsPage from '../pages/AllStatsPage.js';
import store from './store.js';

const routes = [
    {path: '/', component: HomePage, meta: {title: 'Parking made simpler'}},
    {path: '/login', component: LoginPage, meta: {title: 'Sign in'}},
    {path: '/register', component: RegisterPage, meta: {title: 'Create an account'}},
    {path: '/lots', component: LotListPage, meta: {requiresLogin: true, title: 'Parking lots'}},
    {path: '/lots/:id', component: LotDisplayPage, props: true, meta: {requiresLogin: true, title: 'Lot details'}},
    {path: '/admin-dashboard', component: AdminDashboardPage, meta: {requiresLogin: true, role: 'admin', title: 'Overview'}},
    {path: '/users', component: AllUsersPage, meta: {requiresLogin: true, role: 'admin', title: 'Users'}},
    {path: '/users/:id', component: UserDisplayPage, props: true, meta: {requiresLogin: true, role: 'admin', title: 'User details'}},
    {path: '/user-dashboard/:id', component: UserDashboardPage, props: true, meta: {requiresLogin: true, title: 'Bookings'}},
    {path: '/add-lot', component: AddParkingLot, meta: {requiresLogin: true, role: 'admin', title: 'Add parking lot'}},
    {path: '/lots/:id/update-lot', component: UpdateParkingLot, meta: {requiresLogin: true, role: 'admin', title: 'Edit parking lot'}},
    {path: '/user-stats/:id', component: UserStatsPage, props: true, meta: {requiresLogin: true, title: 'Parking insights'}},
    {path: '/all-stats', component: AllStatsPage, meta: {requiresLogin: true, role: 'admin', title: 'Analytics'}},
    {path: '*', component: {template: `<main class="workspace"><AppState title="This page isn’t here" description="The link may have changed. Let’s get you back on track."><router-link class="btn btn-primary" to="/">Back to home</router-link></AppState></main>`}, meta: {title: 'Page not found'}},
];

const router = new VueRouter({routes, scrollBehavior: () => ({x: 0, y: 0})});
router.beforeEach((to, from, next) => {
    if (to.meta.requiresLogin && !store.state.loggedIn) next({path: '/login', query: {redirect: to.fullPath}});
    else if (to.meta.role && to.meta.role !== store.state.role) next(store.state.role === 'admin' ? '/admin-dashboard' : '/lots');
    else next();
});
export default router;
