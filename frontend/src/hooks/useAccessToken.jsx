import { useState, useEffect } from 'react';

const useAccessToken = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      // Check if the access token is present in localStorage
      const accessToken = await localStorage.getItem('access');
      // Update the state based on the presence of the access token
      setToken(accessToken);
    }

    fetchToken();
  }, []); // Empty dependency array ensures that this effect runs once on component mount

  return token;
};

export default useAccessToken;
