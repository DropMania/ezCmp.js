## Welcome to ezCmp.js

The worst Component framework you can think of ;D
#### Features:
- Veeery slow and imperformant
- really buggy
- kinda easy to use ;)

### Todo example
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://dropmania.github.io/ezCmp.js/ezCmp.js"></script>
    <style>
        .checked{
            text-decoration: line-through;
        }
    </style>
</head>
<body>
</body>
<script>
    new ezCmp({
        mount:'body',
        state:{
            curTodo: '',
            todos:[
                {text:'eat', state:'checked'},
                {text:'work',state:''},
                {text:'sleep',state:''}
            ]
        },
        computed:{
            todoCount(){
                return this.state.todos.length
            },
            is5(){
                return this.state.todos.length == 5
            }
        },
        watch:{
            todos: newval => newval.length <= 5
        },
        methods:{
            setCurTodo(e){
                this.state.curTodo = e.target.value
            },
            addTodo(){
                if(this.state.curTodo != ''){
                    this.state.todos = [...this.state.todos, {text:this.state.curTodo}]
                    this.state.curTodo = ''
                }
            },
            pressTodo(e){
                if(e.keyCode == 13){
                    this.addTodo()
                }
            },
            setChecked(e,i){
                let val = e.target.checked
                this.state.todos[i].state = val ? 'checked' : ''
                this.state.todos = this.state.todos
            }
        },
        render: `
            <h1>Todo EZCMP</h1>
            <input value="{curTodo}" oninput="setCurTodo(event)" onkeyup="pressTodo(event)" />
            <button onclick="addTodo()">Add Todo</button><br>
            {todoCount} todos
            <ul>
                <loop todos_todo_i>
                    <li class="{todo.state}">
                        {todo.text}
                        <input type="checkbox" {todo.state} onchange="setChecked(event,{i})">
                    </li>
                </loop>
            </ul>
            <if is5>
                Todos full!
            </if>
        `
    })
</script>
</html>
```
have fun ;)
