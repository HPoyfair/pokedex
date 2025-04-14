import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import PokedexPage from './pages/PokedexPage';
import UsersPage from './pages/UsersPage';
import ComparePage from './pages/ComparePage'; // ⬅️ Add this import

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/pokedex"
            element={<ProtectedRoute><PokedexPage /></ProtectedRoute>}
          />
          <Route
            path="/users"
            element={<ProtectedRoute><UsersPage /></ProtectedRoute>}
          />
          <Route
            path="/compare"
            element={<ProtectedRoute><ComparePage /></ProtectedRoute>} // ⬅️ Add this route
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
