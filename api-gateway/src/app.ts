import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {createProxyMiddleware} from 'http-proxy-middleware';
import services from './services';
import circuitBreaker from './cuircuitBreaker';
import {buildErrorResponse} from './errorHandling';
import {StatusCodes} from 'http-status-codes';
import proxyManager from './proxyManager';

const app = express();

app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Log HTTP requests
app.disable('x-powered-by'); // Hide Express server information
app.use(helmet()); // Add security headers

// Set up proxy middleware for each service
services.forEach(({route, target}) => {
  const proxyOptions = proxyManager.getProxyOptions(route, target);

  // Add circuit breaker to each route while proxing
  app.use(route, circuitBreaker, createProxyMiddleware(proxyOptions));
});

// Handle not found routes
app.use((_req, res) => {
  const status = StatusCodes.NOT_FOUND;
  const errorResponse = buildErrorResponse(status, 'Route not found.');

  res.status(status).json(errorResponse);
});

export default app;
