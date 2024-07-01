import {Request, Response, NextFunction} from 'express';

enum CircuitState {
  Open,
  HalfOpen,
  Closed,
}

const state: CircuitState = CircuitState.Open;

function handleOpenCircuit(req: Request, res: Response, next: NextFunction) {
  next();
}

function handleHalfOpenCircuit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next();
}

function handleClosedCircuit(req: Request, res: Response, next: NextFunction) {
  next();
}

function circuitBreaker(req: Request, res: Response, next: NextFunction) {
  console.log('[CIRCUIT BRAKER] passed here');

  switch (state) {
    case CircuitState.Open:
      return handleOpenCircuit(req, res, next);

    case CircuitState.HalfOpen:
      return handleHalfOpenCircuit(req, res, next);

    case CircuitState.Closed:
      return handleClosedCircuit(req, res, next);

    default:
      throw new Error(`Unknown state ${state}"`);
  }
}

export default circuitBreaker;
