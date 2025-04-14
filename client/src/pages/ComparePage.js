import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import pokedex from '../data/pokedex';
import '../styles/ComparePage.css';

export default function ComparePage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCollection, setUserCollection] = useState([]);
  const [otherCollection, setOtherCollection] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGen, setSelectedGen] = useState(null);
  const token = localStorage.getItem('token');
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('/api/users');
      const userTokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = userTokenPayload.userId;
      const filteredUsers = res.data.filter(u => u._id !== currentUserId);
      setUsers(filteredUsers);
    };

    const fetchCollection = async () => {
      const res = await axios.get('/api/collection', {
        headers: { Authorization: token }
      });
      setUserCollection(res.data);
    };

    fetchUsers();
    fetchCollection();
  }, [token]);

  useEffect(() => {
    if (queryUserId) {
      loadOtherUserCollection(queryUserId);
    }
  }, [queryUserId]);

  const loadOtherUserCollection = async (userId) => {
    const res = await axios.get(`/api/users/${userId}`);
    setSelectedUser({ username: res.data.username, id: res.data._id });
    setOtherCollection(res.data.collection);
  };

  const genRanges = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1010],
  };

  const filtered = pokedex.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dexNumber.toString().includes(search);
    const inGen =
      !selectedGen ||
      (p.dexNumber >= genRanges[selectedGen][0] &&
        p.dexNumber <= genRanges[selectedGen][1]);
    return matchesSearch && inGen;
  });

  const getStatusClass = (dexNumber) => {
    const hasUser = userCollection.includes(dexNumber);
    const hasOther = otherCollection.includes(dexNumber);
    if (hasUser && hasOther) return 'both';
    if (hasUser && !hasOther) return 'yours';
    if (!hasUser && hasOther) return 'theirs';
    return 'none';
  };

  return (
    <div className="compare-container">
      <h2>Compare Collections</h2>

      <select onChange={(e) => loadOtherUserCollection(e.target.value)} defaultValue={queryUserId || ''}>
        <option value="" disabled>Select a user to compare</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.username}</option>
        ))}
      </select>

      {selectedUser && (
        <>
          <h3>Comparing with <strong>{selectedUser.username}</strong></h3>

          <div className="legend">
            <span className="legend-item both">🟩 Both Own</span>
            <span className="legend-item yours">🟦 You Have</span>
            <span className="legend-item theirs">🟧 They Have</span>
            <span className="legend-item none">🟥 Neither</span>
          </div>

          <div className="pokedex-header">
            <select
              value={selectedGen || ''}
              onChange={(e) =>
                setSelectedGen(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">All Generations</option>
              {Object.entries(genRanges).map(([gen, [start, end]]) => (
                <option key={gen} value={gen}>
                  Gen {gen} ({start}–{end})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search Pokémon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="pokemon-grid">
            {filtered.map(p => (
              <div
                key={p.dexNumber}
                className={`pokemon-card ${getStatusClass(p.dexNumber)}`}
              >
                <img src={p.sprite} alt={p.name} />
                <p>{p.name}</p>
                <small>#{p.dexNumber}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
