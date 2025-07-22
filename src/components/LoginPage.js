import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/HCCentinel.png';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/input');
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

        <div className="login-box">
          <input type="text" placeholder="Kullanıcı Adı" />
          <input type="password" placeholder="Şifre" />
          <button onClick={handleLogin}>Giriş Yap</button>

          <div className="login-footer">
            <p className="forgot-password">Şifrenizi mi unuttunuz?</p>
            <p className="register-link">
              Hesabınız yok mu?{' '}
              <span onClick={() => navigate('/register')}>Hesap oluştur</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
