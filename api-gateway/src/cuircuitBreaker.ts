import {Request, Response, NextFunction} from 'express';
import {StatusCodes, ReasonPhrases} from 'http-status-codes';
// eslint-disable-next-line
import {buildErrorResponse} from './errorHandling';

enum CircuitState {
  Open,
  HalfOpen,
  Closed,
}

let state: CircuitState = CircuitState.Open;
let errorCounter = 0;
const MAX_ERROR_COUNT = 3;
const TIME_WINDOW_IN_MS = 5 * 1000;
const TIME_TO_HALF_OPEN_CIRCUIT_IN_MS = 10 * 1000;

function closeCircuit() {
  state = CircuitState.Closed;
  console.log('[CIRCUIT BREAKER] Circuit CLOSED!');

  setTimeout(() => {
    console.log('[CIRCUIT BREAKER] Circuit is HALF-OPEN!');
    state = CircuitState.HalfOpen;
  }, TIME_TO_HALF_OPEN_CIRCUIT_IN_MS);
}

function incrementErrorCounter() {
  errorCounter += 1;
  console.log('[CIRCUIT BREAKER] Error count:', errorCounter);

  if (errorCounter >= MAX_ERROR_COUNT) {
    closeCircuit();
    errorCounter = 0;
    return;
  }

  // decrement after some time
  setTimeout(() => {
    errorCounter -= 1;
  }, TIME_WINDOW_IN_MS);
}

function handleInternalServerError(proxyRes: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling Internal Server Error');
  incrementErrorCounter();
}

export function handleProxyReq(proxyReq: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling proxy request');
}

export function handleProxyRes(proxyRes: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling proxy response');

  if (proxyRes.statusCode === 500) {
    return handleInternalServerError(proxyRes, req, res);
  }
}

function handleClosedCircuit(req: Request, res: Response, next: NextFunction) {
  const status = StatusCodes.TOO_MANY_REQUESTS;
  const errorResponse = buildErrorResponse(
    status,
    'Too Many Requests. Circuit is CLOSED! Try again later'
  );
  return res.status(status).json(errorResponse);
}

function circuitBreaker(req: Request, res: Response, next: NextFunction) {
  switch (state) {
    case CircuitState.HalfOpen:
    case CircuitState.Open:
      return next();

    case CircuitState.Closed:
      return handleClosedCircuit(req, res, next);

    default:
      throw new Error(`Unknown state ${state}"`);
  }
}

export default circuitBreaker;
