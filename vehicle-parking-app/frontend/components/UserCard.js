export default {
    name : "UserCard",
    props : ['user_id', 'user_name', 'email'],
    template : `
    <div class = "jumbotron" style = "width: 300">
        <h2 @click="$router.push('/users/' + user_id)" > {{ user_name}} </h2>
        <p> User ID: {{ user_id }} </p>
        <p> Email: {{ email }} </p>
    </div>
    `,

}