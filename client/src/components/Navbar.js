import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { logout, isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <div className="pokeball-navbar">
      <div className="navbar-content">
        <Link to="/pokedex">My Pokédex</Link>
        <Link to="/users">Other Users</Link>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="pokeball-circle" />
    </div>
  );
}
