const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');

// In-memory data store
let todos = [
  { id: '1', title: 'Learn GraphQL', completed: false },
  { id: '2', title: 'Build a Todo app', completed: false },
  { id: '3', title: 'Deploy to production', completed: false }
];

// GraphQL Schema
const schema = buildSchema(`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    addTodo(title: String!): Todo!
    updateTodo(id: ID!, completed: Boolean!): Todo!
    deleteTodo(id: ID!): ID!
  }
`);

// Root resolver
const root = {
  // Queries
  todos: () => {
    return todos;
  },
  
  todo: ({ id }) => {
    return todos.find(todo => todo.id === id);
  },

  // Mutations
  addTodo: ({ title }) => {
    const newTodo = {
      id: String(Date.now()),
      title,
      completed: false
    };
    todos.push(newTodo);
    return newTodo;
  },

  updateTodo: ({ id, completed }) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    todo.completed = completed;
    return todo;
  },

  deleteTodo: ({ id }) => {
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Todo not found');
    }
    todos.splice(index, 1);
    return id;
  }
};

// Create Express server
const app = express();

// Enable CORS for all routes
app.use(cors());

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enable GraphiQL interface
}));

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 GraphQL server running at http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphiQL interface available at http://localhost:${PORT}/graphql`);
});