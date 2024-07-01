import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {createProxyMiddleware} from 'http-proxy-middleware';
import services from './services';
import circuitBreaker from './cuircuitBreaker';

const app = express();

app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Log HTTP requests
app.disable('x-powered-by'); // Hide Express server information
app.use(helmet()); // Add security headers

// Set up proxy middleware for each service
services.forEach(({route, target}) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '',
    },
  };

  // Proxing routes
  app.use(route, createProxyMiddleware(proxyOptions));
});

// Handle not found routes
app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: 'Error',
    message: 'Route not found.',
    data: null,
  });
});

app.use(circuitBreaker);

export default app;
