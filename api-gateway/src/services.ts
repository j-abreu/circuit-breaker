const BASE_URL = process.env.STORE_SERVICE_URL || 'http://127.0.0.1';

// Define routes and corresponding services
const services = [
  {
    route: '/',
    target: `${BASE_URL}`,
  },
  {
    route: '/store/:key',
    target: `${BASE_URL}/store/:key`,
  },
];

export default services;
