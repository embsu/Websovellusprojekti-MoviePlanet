import { useState, useEffect } from 'react';
import axios from 'axios';

const Apikey = ({ children }) => {
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);

  useEffect(() => {
    const fetchTmdbApiKey = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/getApiKey');
        setTmdbApiKey(response.data.apiKey);
        setApiKeyLoaded(true);
      } catch (error) {
        console.error('Virhe API-avaimen hakemisessa:', error);
      }
    };

    if (!apiKeyLoaded) {
      fetchTmdbApiKey();
    }
  }, [apiKeyLoaded]);

  return apiKeyLoaded ? children({ tmdbApiKey }) : null;
};

export default Apikey;