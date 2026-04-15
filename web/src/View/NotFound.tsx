import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#282c34',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: 'clamp(5rem, 20vw, 12rem)', margin: 0, fontWeight: 'bold', textShadow: '4px 4px 0px #ff6347' }}>404</h1>
      <p style={{ fontSize: 'clamp(1rem, 4vw, 2rem)', margin: '0 0 1rem 0' }}>Oops! Page Lost in Space.</p>
      <p style={{ maxWidth: '80%', marginBottom: '2rem' }}>
          It looks like you've stumbled upon a black hole in the internet. Don't worry, we'll guide you back to safety.      </p>
      <Link
        to="/"
        style={{
          padding: '12px 24px',
          fontSize: '1rem',
          color: '#282c34',
          backgroundColor: '#61dafb',
          border: 'none',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
