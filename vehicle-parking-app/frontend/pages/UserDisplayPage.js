export default {
    props :['id'],
    template :`
    <div class="jumbotron">
        <h2>User Name: {{user.name}} </h2>
        <p>User ID: {{user.id}} </p>
        <p>Email: {{user.email}} </p>
        <hr>
        
    </div>
    `,
    data(){
        return{
            user : {}
        }
    },
    async mounted(){
        const res = await fetch(`${location.origin}/api/users/${this.id}`,{
            headers : {
                "Authentication-Token" : this.$store.state.auth_token
            }
        })
        if (res.ok){
            this.user = await res.json()
        }

    }
}