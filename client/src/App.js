import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const GRID_SIZE = 10;

const App = () => {
  const [token, setToken] = useState(null);
  const [objects, setObjects] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await axios.post('/login', { email, password });
      setToken(res.data.token);
    } catch (err) {
      alert('Login failed. Check email or password.');
      console.error(err);
    }
  };

  const fetchGrid = async () => {
    const res = await axios.get('/grid', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setObjects(res.data);
  };

  const saveGrid = async () => {
    await axios.post('/grid', { objects }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  useEffect(() => {
    if (token) fetchGrid();
  }, [token]);

  const handleAddObject = (x, y) => {
    const newObj = { type: 'O', x, y, metadata: {} };
    setObjects((prev) => [...prev.filter(o => o.x !== x || o.y !== y), newObj]);
  };

  const handleDragStart = (e, obj) => {
    e.dataTransfer.setData('application/json', JSON.stringify(obj));
  };

  const handleDrop = (e, x, y) => {
    const obj = JSON.parse(e.dataTransfer.getData('application/json'));
    setObjects(prev => [
      ...prev.filter(o => o.x !== obj.x || o.y !== obj.y),
      { ...obj, x, y }
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      {!token ? (
        <div>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <>
          <button onClick={saveGrid}>Save Grid</button>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)`,
              gap: '4px',
              marginTop: 20
            }}
          >
            {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const obj = objects.find(o => o.x === x && o.y === y);
              return (
                <div
                  key={i}
                  onClick={() => !obj && handleAddObject(x, y)}
                  onDrop={(e) => handleDrop(e, x, y)}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid gray',
                    background: obj ? 'blue' : 'white',
                    textAlign: 'center',
                    verticalAlign: 'middle'
                  }}
                >
                  {obj && (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, obj)}
                      style={{
                        width: '100%',
                        height: '100%',
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {obj.type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
