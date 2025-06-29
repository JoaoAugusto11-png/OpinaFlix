const config = {
    API_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3001'
        : 'https://opinaflix-backend.onrender.com',
    
    TMDB_API_KEY: '25aa122e262151673e05f311eaeb56ba'
};

window.CONFIG = config;