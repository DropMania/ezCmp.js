## Welcome to ezCmp.js

The worst Component framework you can think of ;D
Features:
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
</head>
<body>
    

</body>
<script>
    new ezCmp({
        mount: 'body',
        state:{
            todos: ['Go', 'Eat', 'Sleep'],
            curTodo: ''
        },
        methods:{
            setCurTodo(evt){
                this.state.curTodo = evt.target.value;
            },
            addTodo(){
                this.state.todos.push(this.state.curTodo);
                this.state.curTodo = '';
            },
            keyTodo(evt){
                if(evt.keyCode === 13){
                    this.addTodo();
                }
            },
            removeTodo(index){
                this.state.todos.splice(index, 1);
                this.state.todos = this.state.todos;
            }
        },
        render: `
        <h3>EZCMP TODO APP</h3>
        
        <input type="text" value="{curTodo}" oninput="setCurTodo(event)" onkeyup="keyTodo(event)">
        <button onclick="addTodo()">Add Todo</button>
        <ul>
            <loop todos_todo_idx>
                <li>{todo} <button onclick="removeTodo({idx})">X</button></li>
            </loop>
        </ul>
        `
    })
</script>
</html>
```
have fun ;)
