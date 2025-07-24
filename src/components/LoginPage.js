import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/HCCentinel.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
throw new Error(data.detail || 'Giriş sırasında bir hata oluştu.');
      }

      console.log('Giriş başarılı:', data);

      localStorage.removeItem("hastaFormData"); //kullanıcı giriş yaptığında form temizlenir.

      // YENİ: user_id'yi tarayıcı hafızasına kaydet
      // Bu sayede diğer sayfalarda da bu bilgiye erişebiliriz.
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_name', data.user_name);

      navigate('/input');

    } catch (err) {
      console.error('Giriş hatası:', err);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="login-container">
        <div className="login-header">
          <img 
            src={logo} 
            alt="HCCentinel Logo" 
            className="login-logo"
          />
          <p className="welcome-text">Hoş geldiniz! Lütfen giriş yapın.</p>
        </div>

        <form className="login-box" 
        onSubmit={handleLogin}>
          {error && <p className="error-message">{error}</p>}
          
          <input 
            type="email" 
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Giriş Yap</button>
  
          <div className="login-footer">
            <p className="forgot-password">Şifrenizi mi unuttunuz?</p>
            <p className="register-link">
              Hesabınız yok mu?{' '}
              <span onClick={() => navigate('/register')} style={{cursor: 'pointer', color: '#007bff'}}>
                Hesap oluştur
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;