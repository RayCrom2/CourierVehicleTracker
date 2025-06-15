// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(null);
  const [objects, setObjects] = useState([]);

  const login = async () => {
    const res = await axios.post('http://localhost:4000/login', { email: 'test@co.com', password: 'test123' });
    setToken(res.data.token);
  };

  const fetchGrid = async () => {
    const res = await axios.get('http://localhost:4000/grid', { headers: { Authorization: `Bearer ${token}` } });
    setObjects(res.data);
  };

  const saveGrid = async () => {
    await axios.post('http://localhost:4000/grid', { objects }, { headers: { Authorization: `Bearer ${token}` } });
  };

  useEffect(() => {
    if (token) fetchGrid();
  }, [token]);

  return (
    <div>
      {!token ? <button onClick={login}>Login</button> : (
        <>
          <button onClick={saveGrid}>Save Grid</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gap: '4px' }}>
            {[...Array(100)].map((_, i) => {
              const x = i % 10;
              const y = Math.floor(i / 10);
              const obj = objects.find(o => o.x === x && o.y === y);
              return (
                <div key={i} style={{ width: 40, height: 40, border: '1px solid gray', background: obj ? 'blue' : 'white' }}>
                  {obj ? obj.type : ''}
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

