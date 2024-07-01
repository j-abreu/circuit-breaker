import {Request, Response, NextFunction} from 'express';
import {StatusCodes, ReasonPhrases} from 'http-status-codes';
// eslint-disable-next-line
import {buildErrorResponse} from './errorHandling';

enum CircuitState {
  Open,
  HalfOpen,
  Closed,
}
const DEFUALT_COUNT_TO_OPEN = 5;
const DEFAULT_ERROR_COUNTER = 0;
const MAX_ERROR_COUNT = 3;
const TIME_WINDOW_IN_MS = 5 * 1000;
const TIME_TO_HALF_OPEN_CIRCUIT_IN_MS = 10 * 1000;

let state: CircuitState = CircuitState.Open;
let errorCounter = 0;
let countToOpen = 5;
const decrementTimoutIds: Array<any> = [];

function openCircuit() {
  state = CircuitState.Open;
  errorCounter = DEFAULT_ERROR_COUNTER;
  console.log('[CIRCUIT BREAKER] Circuit is OPEN!');
}

function checkCanOpenCircuit() {
  countToOpen -= 1;
  console.log('[CIRCUIT BREAKER] Count to open:', countToOpen);

  if (countToOpen === 0) {
    openCircuit();
  }
}

function halfOpenCircuit() {
  console.log('[CIRCUIT BREAKER] Circuit is HALF-OPEN!');
  state = CircuitState.HalfOpen;
  countToOpen = DEFUALT_COUNT_TO_OPEN;
}

function closeCircuit() {
  state = CircuitState.Closed;
  console.log('[CIRCUIT BREAKER] Circuit CLOSED!');

  setTimeout(() => {
    halfOpenCircuit();
  }, TIME_TO_HALF_OPEN_CIRCUIT_IN_MS);
}

function resetDecrementTimeouts() {
  // clear each timeout
  while (decrementTimoutIds.length) {
    const id = decrementTimoutIds.pop();
    clearTimeout(id);
  }
}

function addDecrementTimeout() {
  // decrement after some time
  const timeoutId = setTimeout(() => {
    errorCounter -= 1;
    console.log('[CIRCUIT BREAKER] Error count:', errorCounter);
  }, TIME_WINDOW_IN_MS);

  // save timeout id
  decrementTimoutIds.push(timeoutId);
}

function incrementErrorCounter() {
  errorCounter += 1;
  console.log('[CIRCUIT BREAKER] Error count:', errorCounter);
  addDecrementTimeout();

  if (errorCounter >= MAX_ERROR_COUNT) {
    closeCircuit();
    resetDecrementTimeouts();
    return;
  }
}

function handleInternalServerError(proxyRes: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling Internal Server Error');
  switch (state) {
    case CircuitState.Open:
      return incrementErrorCounter();

    case CircuitState.HalfOpen:
      return closeCircuit();

    default:
      console.error(
        `[CIRCUIT BREAKER]: Internal server error with circuit in "${state}" state`
      );
      return closeCircuit();
  }
}

export function handleProxyReq(proxyReq: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling proxy request');
}

export function handleProxyRes(proxyRes: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling proxy response');

  if (proxyRes.statusCode >= 500) {
    return handleInternalServerError(proxyRes, req, res);
  }

  if (state === CircuitState.HalfOpen) {
    return checkCanOpenCircuit();
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
