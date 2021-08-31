new ezCmp({
    mount: '#container',
    state: {
        curTodo: '',
        todos: ['do', 'eat', 'sleep']
    },
    methods: {
        setCurTodo(e){
            this.state.curTodo = e.target.value
        },
        addTodo(){
            if(this.state.curTodo){
                this.state.todos = [...this.state.todos, this.state.curTodo]
                this.state.curTodo = ''
            }
        },
        enterTodo(e){
            if(e.keyCode === 13){
                this.addTodo()
            }
        },
        removeTodo(index){
            this.state.todos.splice(index, 1)
            this.state.todos = this.state.todos
        }
    },
    render: `
        {curTodo}<br>
        <input oninput="setCurTodo(event)" value="{curTodo}" onkeyup="enterTodo(event)"/> 
        <button onclick="addTodo()">Add todo</button><br>
        <ul>
            <loop todos_todo_idx> 
                <li>
                    {todo}
                    <button onclick="removeTodo({idx})" style="color:red">X</button>
                </li>
            </loop>
        </ul>
    `
})

new ezCmp({
    mount: '#container2',
    state: {
        users: [],
        loading: true,
    },
    async onMounted() {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        const data = await response.json()
        this.state.users = data
        this.state.loading = false
    },
    render: `
    <if !loading>
        <loop users_user>
            <div style="background: #eee; width:30%; border-radius: 10px; display: flex; flex-direction:column; align-items:center; justify-content:center; margin-bottom: 10px">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
            </div>
        </loop>
    </if>
    <if loading>
        Loading...
    </if>
    `
})