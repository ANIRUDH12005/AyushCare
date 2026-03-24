import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login({
      name: role === 'doctor' ? 'Dr. Sharma' : 'Therapist Verma',
      email: role === 'doctor' ? 'doctor@ayushcare.com' : 'therapist@ayushcare.com',
      role: role
    });
    navigate(role === 'doctor' ? '/doctor' : '/therapist');
  };

  return (
    <div style={{ 
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <h2>Test Login (for development)</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => handleLogin('doctor')} style={{ padding: '10px 20px' }}>
          Login as Doctor
        </button>
        <button onClick={() => handleLogin('therapist')} style={{ padding: '10px 20px' }}>
          Login as Therapist
        </button>
      </div>
    </div>
  );
};

export default TestLogin;