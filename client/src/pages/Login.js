import { useState } from 'react';
import { loginUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await loginUser(form);
      login(token);
      navigate('/pokedex');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="auth-container" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>

      {/* Add Register Button */}
      <p style={{ marginTop: '1rem' }}>
        Don’t have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{
            background: 'none',
            color: '#e3350d',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Register here
        </button>
      </p>
    </form>
  );
}
