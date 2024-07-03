import {Request, Response, NextFunction} from 'express';
import {StatusCodes, ReasonPhrases} from 'http-status-codes';
// eslint-disable-next-line
import {buildErrorResponse} from './errorHandling';

enum CircuitState {
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
  CLOSED = 'CLOSED',
}
const DEFUALT_REGRESSIVE_COUNT_TO_CLOSE = 5;
const DEFAULT_ERROR_COUNTER = 0;
const MAX_ERROR_COUNT = 3;
const ERROR_TIME_WINDOW_IN_MS = 5 * 1000;
const TIME_TO_HALF_OPEN_CIRCUIT_IN_MS = 10 * 1000;

let circuitState: CircuitState = CircuitState.CLOSED;
let errorCounter = 0;
let regressiveCountToClose = 5;
const decrementTimoutIds: Array<any> = [];

function closeCircuit() {
  circuitState = CircuitState.CLOSED;
  errorCounter = DEFAULT_ERROR_COUNTER;
  console.log('[CIRCUIT BREAKER] Circuit is CLOSED!');
}

function checkCanCloseCircuit() {
  regressiveCountToClose -= 1;
  console.log(
    '[CIRCUIT BREAKER] Regressive count to close:',
    regressiveCountToClose
  );

  if (regressiveCountToClose === 0) {
    closeCircuit();
  }
}

function halfOpenCircuit() {
  console.log('[CIRCUIT BREAKER] Circuit is HALF-OPEN!');
  circuitState = CircuitState.HALF_OPEN;
  regressiveCountToClose = DEFUALT_REGRESSIVE_COUNT_TO_CLOSE;
}

function openCircuit() {
  circuitState = CircuitState.OPEN;
  console.log('[CIRCUIT BREAKER] Circuit OPEN!');

  setTimeout(() => {
    halfOpenCircuit();
  }, TIME_TO_HALF_OPEN_CIRCUIT_IN_MS);
}

/*
 * Clears each active timeout and clears array of timeout ids
 */
function resetDecrementTimeouts() {
  while (decrementTimoutIds.length) {
    const id = decrementTimoutIds.pop();
    clearTimeout(id);
  }
}

/*
 * Creates a timer to decrement errorCounter
 */
function addDecrementTimeout() {
  const timeoutId = setTimeout(() => {
    errorCounter -= 1;
    console.log(
      `[CIRCUIT BREAKER] Error count: ${errorCounter}/${MAX_ERROR_COUNT}`
    );
  }, ERROR_TIME_WINDOW_IN_MS);

  // save timeout id
  decrementTimoutIds.push(timeoutId);
}

/*
 * Increment errorCounter and creates timer to decrement it after defined time
 */
function incrementErrorCounter() {
  errorCounter += 1;
  console.log(
    `[CIRCUIT BREAKER] Error count: ${errorCounter}/${MAX_ERROR_COUNT}`
  );

  addDecrementTimeout();

  if (errorCounter >= MAX_ERROR_COUNT) {
    openCircuit();
    resetDecrementTimeouts();
    return;
  }
}

function handleInternalServerError(proxyRes: any, req: any, res: any) {
  console.log('[CIRCUIT BREAKER] Handling Internal Server Error');

  switch (circuitState) {
    case CircuitState.CLOSED:
      return incrementErrorCounter();

    case CircuitState.HALF_OPEN:
      return openCircuit();

    default:
      console.error(
        `[CIRCUIT BREAKER]: Internal server error with circuit in "${circuitState}" state`
      );
      return openCircuit();
  }
}

export function handleProxyReq(proxyReq: any, req: any, res: any) {}

export function handleProxyRes(proxyRes: any, req: any, res: any) {
  if (proxyRes.statusCode >= 500) {
    return handleInternalServerError(proxyRes, req, res);
  }

  if (circuitState === CircuitState.HALF_OPEN) {
    return checkCanCloseCircuit();
  }
}

function handleRequestWithOpenCircuit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = StatusCodes.TOO_MANY_REQUESTS;
  const errorResponse = buildErrorResponse(
    status,
    'Too Many Requests. Circuit is OPEN! Try again later'
  );
  return res.status(status).json(errorResponse);
}

function circuitBreaker(req: Request, res: Response, next: NextFunction) {
  switch (circuitState) {
    case CircuitState.HALF_OPEN:
    case CircuitState.CLOSED:
      return next();

    case CircuitState.OPEN:
      return handleRequestWithOpenCircuit(req, res, next);

    default:
      throw new Error(`Unknown state ${circuitState}"`);
  }
}

console.log(
  `[CIRCUIT BREAKER] Starting circuit breaker in ${circuitState} state`
);

export default circuitBreaker;
