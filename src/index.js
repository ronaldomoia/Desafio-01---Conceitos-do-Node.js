const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
    const user = users.find(user => user.username === username);

    if(!user) {
        return response.status(404).json({ error: "User not found!"})
    }

    request.user = user;
    return next();
}

function checkIfTodoExists(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) {
      return response.status(404).json({ error: "Todo not found!"})
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user)=> user.username === username
  );  

  if(userAlreadyExists){
      return response.status(400).json({error: "User already exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user); 
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos); 
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const { title, deadline } = request.body;

  let newTodo = {}
  user.todos.filter((todo) => {
    if(todo.id === id){
      todo.title = title,
      todo.deadline = deadline
    }
    newTodo = todo
  })

  return response.status(200).json(newTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  let newTodo = {}
  user.todos.filter((todo) => {
    if(todo.id === id){
      todo.done = true
    }
    newTodo = todo
  })

  return response.status(200).json(newTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkIfTodoExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  user.todos.filter((todo) => {
    if(todo.id === id){
      user.todos.splice(user.todos.indexOf(todo),1);
    }
  })

  return response.status(204).send();
});

module.exports = app;