import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthVerifier = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Optional: Verify token with backend
        // const res = await axios.get('/api/auth/verify');
        // if (!res.data.valid) throw new Error('Invalid token');
      } catch (err) {
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate]);

  return null;
};

export default AuthVerifier;