// vuex to share data between components

const store =  new Vuex.Store({
    state :{
        // data that everyone can access
        auth_token : null,
        role : null,
        name : null,
        loggedIn : false,
        user_id : null,
    },
    mutations :{
        // functions that can change the state
        setUser(state){
            try{
                if(JSON.parse(localStorage.getItem('user'))){
                    const user =JSON.parse(localStorage.getItem('user'));
                    console.log(user)
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.name = user.name;
                    state.loggedIn =  true;
                    state.user_id = user.id;
                }
            }
            catch{
                console.warn('not logged in')
            }
        },

        logout(state){
            state.auth_token = null;
            state.role = null;
            state.name = null;
            state.loggedIn = false;
            state.user_id = null;

            localStorage.removeItem('user')
            console.log("logged out successfully")
        }
    },
    actions : {

    },
})

store.commit('setUser')       // once the page got loaded this setUser will run once

export default store;