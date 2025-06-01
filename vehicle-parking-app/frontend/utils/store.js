// vuex to share data between components

const store =  new Vuex.Store({
    state :{
        // data that everyone can access
        auth_token : null,
        role : null,
        loggedIn : false,
        user_id : null,
    },
    mutations :{
        // functions that can change the state
        setUser(state){
            try{
                if(JSON.parse(localStorage.getItem('user'))){
                    const user =JSON.parse(localStorage.getItem('user'));
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedIn =  true;
                    state.user_id = user.id;
                }
            }
            catch{
                console.warn('not logged in')
            }
        },

        logout(state){
            auth_token = null;
            role = null;
            loggedIn = false;
            user_id = null;

            localStorage.removeItem('user')
        }
    },
    actions : {

    },
})

store.commit('setUser')       // once the page got loaded this setUser will run once

export default store;