import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

// GraphQL queries and mutations
const GET_TODOS = `
  query {
    todos {
      id
      title
      completed
    }
  }
`;

const ADD_TODO = `
  mutation($title: String!) {
    addTodo(title: $title) {
      id
      title
      completed
    }
  }
`;

const UPDATE_TODO = `
  mutation($id: ID!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      title
      completed
    }
  }
`;

const DELETE_TODO = `
  mutation($id: ID!) {
    deleteTodo(id: $id)
  }
`;

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // GraphQL request function
  const graphqlRequest = async (query, variables = {}) => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      return data.data;
    } catch (err) {
      throw new Error(err.message || 'Network error');
    }
  };

  // Check server status
  const checkServer = async () => {
    try {
      await graphqlRequest(GET_TODOS);
      setServerStatus('connected');
      setError('');
    } catch (err) {
      setServerStatus('disconnected');
      setError('Server not running. Start the Node.js server first.');
    }
  };

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await graphqlRequest(GET_TODOS);
      setTodos(data.todos);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add todo
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      setLoading(true);
      const data = await graphqlRequest(ADD_TODO, { title: newTodo });
      setTodos([...todos, data.addTodo]);
      setNewTodo('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && newTodo.trim() && serverStatus === 'connected') {
      handleAddTodo();
    }
  };

  // Toggle todo
  const handleToggleTodo = async (id, completed) => {
    try {
      await graphqlRequest(UPDATE_TODO, { id, completed: !completed });
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id) => {
    try {
      await graphqlRequest(DELETE_TODO, { id });
      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    checkServer();
    const interval = setInterval(() => {
      if (serverStatus === 'disconnected') {
        checkServer();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [serverStatus]);

  useEffect(() => {
    if (serverStatus === 'connected') {
      fetchTodos();
    }
  }, [serverStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Todo App</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected' ? 'bg-green-500' : 
                serverStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-600">
                {serverStatus === 'connected' ? 'GraphQL Connected' : 
                 serverStatus === 'disconnected' ? 'Server Offline' : 'Checking...'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              {serverStatus === 'disconnected' && (
                <p className="text-red-500 text-xs mt-2">
                  Run: <code className="bg-red-100 px-2 py-1 rounded">node server.js</code>
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || serverStatus !== 'connected'}
              />
              <button
                onClick={handleAddTodo}
                disabled={loading || !newTodo.trim() || serverStatus !== 'connected'}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {loading && todos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Loading todos...
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No todos yet. Add one above!
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button
                    onClick={() => handleToggleTodo(todo.id, todo.completed)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
                  </button>
                  
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {todo.title}
                  </span>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Save the server code as <code className="bg-gray-100 px-2 py-0.5 rounded">server.js</code></li>
            <li>Run: <code className="bg-gray-100 px-2 py-0.5 rounded">npm install express express-graphql graphql cors</code></li>
            <li>Start server: <code className="bg-gray-100 px-2 py-0.5 rounded">node server.js</code></li>
            <li>Server runs on <code className="bg-gray-100 px-2 py-0.5 rounded">http://localhost:4000/graphql</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}