import React from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";

const HeaderProfle = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div style={styles.header}>
      <div style={styles.backgroundCircle}></div>
      <div style={styles.textContainer}>
        <button onClick={handleBack} style={styles.backButton}>
          <IoMdArrowRoundBack style={styles.zfontSize}/>
        </button>
        <h1 style={styles.brand}>
          <span style={styles.brandNormal}>Ahamed</span>
          <span style={styles.brandHighlight}>CRM</span>
        </h1>
        <h2 style={styles.username}>Profile</h2>
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
    margin: '10px',
  },
  zfontSize:{
    fontSize:'20px'

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
  backButton: {
    background: 'none',
    border: 'none',
    color: '#e0e7ff',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 0',
    marginBottom: '10px',
    textDecoration: 'underline',
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
    color: '#facc15',
    marginLeft: '4px',
  },
  username: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
  },
};

export default HeaderProfle;
