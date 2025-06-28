import React, { useEffect, useState } from 'react';

const Header = () => {
     const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('User');

  useEffect(() => {
 
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');


    const storedName = localStorage.getItem('name');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  return (
    <div style={styles.header}>
      <div style={styles.backgroundCircle}></div>
      <div style={styles.textContainer}>
        <h1 style={styles.brand}>
          <span style={styles.brandNormal}>Ahamed</span>
          <span style={styles.brandHighlight}>CRM</span>
        </h1>
        <p style={styles.greeting}>{greeting}</p>
        <h2 style={styles.username}>{name}</h2>
      </div>
    </div>
  );
};

const styles = {
  header: {
    background: '#2563eb', 
    color: 'white',
    borderRadius: '0 0 20px 20px',
    padding: '30px 35px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(79, 107, 221, 0.3)',
    margin :'10px',

  },
  backgroundCircle: {
    position: 'absolute',
    top: '-60px',
    left: '-60px',
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.07)',
    borderRadius: '50%',
    zIndex: 0,
  },
  textContainer: {
    position: 'relative',
    zIndex: 1,
  },
  brand: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  brandNormal: {
    color: 'white',
  },
  brandHighlight: {
    color: '#facc15', // yellow-400
    marginLeft: '4px',
  },
  greeting: {
    fontSize: '16px',
    margin: '12px 0 4px',
    color: '#e0e7ff',
  },
  username: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
  },
};

export default Header;
