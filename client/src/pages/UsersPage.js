import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import pokedex from '../data/pokedex';
import '../styles/UsersPage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [collection, setCollection] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGen, setSelectedGen] = useState(null);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('/api/users');
      const userTokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = userTokenPayload.userId;
      const filteredUsers = res.data.filter(u => u._id !== currentUserId);
      setUsers(filteredUsers);
    };
    fetchUsers();
  }, [token]);

  const viewUserCollection = async (userId) => {
    const res = await axios.get(`/api/users/${userId}`);
    setSelectedUser({ id: res.data._id, username: res.data.username });
    setCollection(res.data.collection);
    setSearch('');
    setSelectedGen(null);
    setShowOnlyMissing(false);
    setShowOnlyOwned(false);
  };

  const genRanges = {
    1: [1, 151], 2: [152, 251], 3: [252, 386],
    4: [387, 493], 5: [494, 649], 6: [650, 721],
    7: [722, 809], 8: [810, 905], 9: [906, 1010],
  };

  const filteredPokedex = pokedex.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.dexNumber.toString().includes(search);
    const matchesGen = !selectedGen || (p.dexNumber >= genRanges[selectedGen][0] && p.dexNumber <= genRanges[selectedGen][1]);
    const notOwnedFilter = !showOnlyMissing || !collection.includes(p.dexNumber);
    const onlyOwnedFilter = !showOnlyOwned || collection.includes(p.dexNumber);
    return matchesSearch && matchesGen && notOwnedFilter && onlyOwnedFilter;
  });

  const ownedCount = filteredPokedex.filter(p => collection.includes(p.dexNumber)).length;
  const totalCount = filteredPokedex.length;
  const percentComplete = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <div className="users-container">
      <h2>Other Users</h2>
      <div className="user-list">
        {users.map(user => (
          <button key={user._id} onClick={() => viewUserCollection(user._id)}>
            {user.username}
          </button>
        ))}
      </div>

      {selectedUser && (
        <>
          <div className="collection-title">{selectedUser.username}'s Collection</div>

          <div className="pokedex-header">
            <button
              className="compare-button"
              onClick={() => navigate(`/compare?userId=${selectedUser.id}`)}
            >
              Compare with Me
            </button>

            <select
              value={selectedGen || ''}
              onChange={(e) => setSelectedGen(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Generations</option>
              {Object.entries(genRanges).map(([gen, [start, end]]) => (
                <option key={gen} value={gen}>Gen {gen} ({start}–{end})</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search Pokémon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label>
              <input
                type="checkbox"
                checked={showOnlyMissing}
                onChange={() => setShowOnlyMissing(!showOnlyMissing)}
              /> Show only missing
            </label>

            <label>
              <input
                type="checkbox"
                checked={showOnlyOwned}
                onChange={() => setShowOnlyOwned(!showOnlyOwned)}
              /> Show only owned
            </label>
          </div>

          <p className="completion-text">
            They have {ownedCount} out of {totalCount} Pokémon ({percentComplete}%)
          </p>

          <div className="pokemon-grid">
            {filteredPokedex.map(p => (
              <div
                key={p.dexNumber}
                className={`pokemon-card ${collection.includes(p.dexNumber) ? 'owned' : ''}`}
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
