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
        <title>EZ CMP IS GREAT!</title>
        <script src="https://dropmania.github.io/ezCmp.js/ezCmp.js"></script>
    </head>
    <body>
    </body>
    <script>
        new ezCmp({
            mount: 'body',
            state: {
                curTodo: '',
                todos: ['do', 'eat', 'sleep']
            },
            watch:{
                todos(newVal, oldVal){
                    // return false to prevent the state from being updated
                    if(newVal.includes('badword')){
                        return false
                    }
                }
            },
            computed:{
                boldTodos(){
                    return this.state.todos.map(todo => `
                        <b>${todo}</b>
                    `)
                },
                todoCount(){
                    return this.state.todos.length
                },
                gt5(){
                    return this.state.todos.length >= 5
                }
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
                    this.state.todos = this.state.todos.filter((v,i)=>i!=index)
                }
            },
            render: `
                {curTodo}<br>
                <input oninput="setCurTodo(event)" value="{curTodo}" onkeyup="enterTodo(event)"/> 
                <button onclick="addTodo()">Add todo</button><br>
                {todoCount}.
                <ul>
                    <loop boldTodos_todo_idx> 
                        <li>
                            {todo}
                            <button onclick="removeTodo({idx})" style="color:red">X</button>
                        </li>
                    </loop>        
                </ul>
                <if gt5>
                    Tooo much!
                </if>
            `
        })
    </script>
</html>
```
have fun ;)
