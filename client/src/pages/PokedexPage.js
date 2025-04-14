import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';
import '../styles/PokedexPage.css';

export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [owned, setOwned] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGen, setSelectedGen] = useState(null);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);
  const [lockEditing, setLockEditing] = useState(false);
  const cardRefs = useRef({});
  const token = localStorage.getItem('token');

  const spriteUrl = (dex) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

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

  useEffect(() => {
    const fetchCollection = async () => {
      const res = await axios.get('/api/collection', {
        headers: { Authorization: token }
      });
      setOwned(res.data);
    };

    const fetchNames = async () => {
      const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1010');
      const data = res.data.results.map((p, i) => ({
        dexNumber: i + 1,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        sprite: spriteUrl(i + 1),
      }));
      setPokemonList(data);
    };

    fetchCollection();
    fetchNames();
  }, [token]);

  const togglePokemon = async (dexNumber) => {
    const isOwned = owned.includes(dexNumber);
    const updated = isOwned
      ? owned.filter(n => n !== dexNumber)
      : [...owned, dexNumber];

    setOwned(updated);

    const url = isOwned ? '/api/collection/remove' : '/api/collection/add';
    try {
      await axios.post(url, { dexNumber }, {
        headers: { Authorization: token }
      });
    } catch (err) {
      alert('Something went wrong updating the collection');
      setOwned(owned);
    }
  };

  const handleToggle = (dexNumber) => {
    if (lockEditing) return;
    togglePokemon(dexNumber);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const results = pokemonList.filter(p =>
      p.name.toLowerCase().includes(value) ||
      p.dexNumber.toString().includes(value)
    );
    setSearchResults(results.slice(0, 10));
  };

  const scrollToCard = (dexNumber) => {
    const ref = cardRefs.current[dexNumber];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSearch('');
      setSearchResults([]);
    }
  };

  const exportMissingToPDF = () => {
    const missing = filteredList.filter(p => !owned.includes(p.dexNumber));
    const doc = new jsPDF();
    doc.setFontSize(14);

    const title = selectedGen
      ? `Missing Pokémon - Gen ${selectedGen}`
      : 'Missing Pokémon - All Generations';

    doc.text(title, 10, 10);
    missing.forEach((p, i) => {
      const line = `${p.dexNumber.toString().padStart(4, '0')} - ${p.name}`;
      doc.text(line, 10, 20 + i * 8);
    });

    const fileName = selectedGen
      ? `missing-gen${selectedGen}.pdf`
      : 'missing-all.pdf';

    doc.save(fileName);
  };

  const filteredList = pokemonList.filter(p => {
    const inGen =
      !selectedGen ||
      (p.dexNumber >= genRanges[selectedGen][0] &&
        p.dexNumber <= genRanges[selectedGen][1]);

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dexNumber.toString().includes(search);

    const notOwnedFilter = !showOnlyMissing || !owned.includes(p.dexNumber);
    const onlyOwnedFilter = !showOnlyOwned || owned.includes(p.dexNumber);

    return inGen && matchesSearch && notOwnedFilter && onlyOwnedFilter;
  });

  const ownedCount = filteredList.filter(p => owned.includes(p.dexNumber)).length;
  const totalCount = filteredList.length;
  const percentComplete = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <div className="pokedex-container">
      <h2>Your Pokédex</h2>

      {/* Filter Controls */}
      <div className="pokedex-header">
        <select
          value={selectedGen || ''}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedGen(value ? Number(value) : null);
          }}
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
          onChange={handleSearch}
        />

        <button onClick={exportMissingToPDF}>
          Export Missing Pokémon to PDF
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showOnlyMissing}
            onChange={() => setShowOnlyMissing(!showOnlyMissing)}
          />
          Show only missing
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showOnlyOwned}
            onChange={() => setShowOnlyOwned(!showOnlyOwned)}
          />
          Show only owned
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={lockEditing}
            onChange={() => setLockEditing(!lockEditing)}
          />
          Lock editing
        </label>
      </div>

      {/* Completion Status */}
      <p className="completion-text">
        You have {ownedCount} out of {totalCount} Pokémon ({percentComplete}%)
      </p>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map(p => (
            <li key={p.dexNumber}>
              <button onClick={() => scrollToCard(p.dexNumber)}>
                #{p.dexNumber} - {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pokédex Grid */}
      <div className="pokemon-grid">
        {filteredList.map(p => (
          <div
            key={p.dexNumber}
            ref={el => cardRefs.current[p.dexNumber] = el}
            className={`pokemon-card ${owned.includes(p.dexNumber) ? 'owned' : ''}`}
            onClick={() => handleToggle(p.dexNumber)}
          >
            <img src={p.sprite} alt={p.name} />
            <p>{p.name}</p>
            <small>#{p.dexNumber}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
