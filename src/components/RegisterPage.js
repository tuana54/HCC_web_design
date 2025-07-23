import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // CSS aynı kalabilir
import logo from '../assets/HCCentinel.png'; // Logo

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRegister = () => {
    console.log('Hesap oluşturuldu:', form);
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-header" style={{ marginTop: '30px', marginBottom: '10px' }}>
        <img src={logo} alt="Logo" style={{ width: '280px', marginBottom: '-5px' }} />
        <p className="welcome-text" style={{ margin: '10px 0 10px', fontSize: '18px' }}>
          Yeni bir hesap oluşturun
        </p>
      </div>

      <div className="login-box" style={{ marginTop: '0px' }}>
        <input
          type="text"
          name="name"
          placeholder="Adınız"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="surname"
          placeholder="Soyadınız"
          value={form.surname}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={form.password}
          onChange={handleChange}
        />
        <button onClick={handleRegister}>Hesap Oluştur</button>

        <div className="login-footer">
          <p className="register-link">
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/')}>Giriş yap</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
