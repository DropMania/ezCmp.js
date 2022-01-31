## Welcome to ezCmp.js

The worst Component framework you can think of ;D

#### Features:

-   Veeery slow and imperformant
-   really buggy
-   kinda easy to use ;)

### Todo example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="ezCmp.js"></script>
</head>
<body>
    <div class="todos">Hallo</div>
    <my-component>
        <h1>Todo App:</h1>
        <input bind="inputText" onkeyup="pressTodo(event)">
        <button onclick="addTodo()">Add Todo</button>
        <ul class="todos">
            Todos: {todosCount.done}/{todosCount.total}
            <loop for="todos" as="todo" i="i">
                <li>
                    <input type="checkbox" {todo.done} onchange="checkTodo({i})">
                    {todo.text}
                    <if c="todo.done">
                        <button onclick="removeTodo({i})">X</button>
                    </if>
                </li>
            </loop>
        </ul>
    </my-component>
</body>
<script>
    ezCmp.define('my-component',{
        classes:{
            todos:{
                fontSize: '3rem'
            }
        },
        state:{
            inputText: '',
            todos: [
                {text: 'learn Svelte', done: ''},
                {text: 'learn React', done: ''},
                {text: 'learn ezCmp', done: 'checked'},
            ]
        },
        computed:{
            todosCount(){
                return {
                    total: this.state.todos.length,
                    done: this.state.todos.filter(t=>t.done).length
                }
            }
        },
        storage: ['todos','inputText'],
        methods:{
            pressTodo(e){
                if(e.keyCode == 13) this.addTodo()
            },
            addTodo(){
                this.state.todos = [...this.state.todos,{
                    text: this.state.inputText,
                    done: ''
                }]
                this.state.inputText = ''
            },
            checkTodo(i){
                this.state.todos[i].done = this.state.todos[i].done ? '' : 'checked' 
                this.state.todos = this.state.todos
            },
            removeTodo(i){
                this.state.todos = this.state.todos.filter((t,ind)=>ind!=i)
            }
        }
    })
</script>
</html>
```

have fun ;)
