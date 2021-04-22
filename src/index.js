const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(
    (user) => user.username === username
  );

  if (!user) {
    return response.status(400).send({
      error: "Username not found!"
    });
  }

  request.user = user;
  
  return next();
}

function checksExistsTodoId(request, response, next) {
  const { user } = request;
  const { id } = request.query;

  const todo = user.todos.find(
    (todo) => todo.id === id
  );

  if (!todo) {
    return response.status(400).send({
      error: "Todo not found!"
    });
  }

  request.todo = todo;
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  users.push({
    id: 'uuid', //uuidv4()
    name: name,
    username: username,
    todos: []
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodoId, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  
  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoId, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoId, (request, response) => {
  const { user } = request;
  const { id } = request.query;
  
  const todoIndex = user.todos.findIndex(
    (todo) => todo.id === id
  );

  user.todos.splice(todoIndex, 1);

  return response.status(204).send(user.todos);
});

module.exports = app;