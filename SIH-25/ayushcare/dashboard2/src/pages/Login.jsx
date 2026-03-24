import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login({
      name: role === 'doctor' ? 'Dr. Sharma' : 'Therapist Verma',
      email: role === 'doctor' ? 'doctor@ayushcare.com' : 'therapist@ayushcare.com',
      role: role
    });
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2f4f3a', marginBottom: '30px' }}>AyushCare Login</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => handleLogin('doctor')}
            style={{
              padding: '15px 30px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Login as Doctor
          </button>
          <button
            onClick={() => handleLogin('therapist')}
            style={{
              padding: '15px 30px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Login as Therapist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
