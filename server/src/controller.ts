import {Request, Response} from 'express';
import Database, {DatabaseError} from './database/database';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';
import logger from './logger/logger';

class Controller {
  private storage: Database;

  constructor() {
    this.storage = new Database();
  }

  handleDatabaseError(_req: Request, res: Response, err: any) {
    logger.error(err.message);

    if (err.message === DatabaseError.NOT_FOUND) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Error',
        message: 'Key not found',
      });
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: 'Error',
        message: err.message,
      })
      .end();
  }

  async getAll(_req: Request, res: Response) {
    try {
      const allEntries = await this.storage.getAll();
      res.json(allEntries).end();
    } catch (err: any) {
      logger.error(err.message);

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
        })
        .end();
    }
  }

  async get(req: Request, res: Response) {
    try {
      const {key} = req.params;

      // mechanism to force error
      if (key.startsWith('_')) {
        const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        return res
          .status(statusCode)
          .json({
            code: statusCode,
            status: 'Error',
            message: getReasonPhrase(statusCode),
            data: null,
          })
          .end();
      }

      const value = await this.storage.getByKey(key);

      const responseData = {
        [key]: value,
      };

      return res.json(responseData).status(StatusCodes.OK).end();
    } catch (err: any) {
      return this.handleDatabaseError(req, res, err);
    }
  }

  async post(req: Request, res: Response) {
    try {
      const {key, value} = req.body;

      await this.storage.insert(key, value);

      return res.status(StatusCodes.CREATED).end();
    } catch (err: any) {
      return this.handleDatabaseError(req, res, err);
    }
  }

  async patch(req: Request, res: Response) {
    try {
      const {value: newValue} = req.body;
      const {key} = req.params;

      await this.storage.update(key, newValue);

      return res.status(StatusCodes.OK).end();
    } catch (err: any) {
      return this.handleDatabaseError(req, res, err);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const {key} = req.params;

      await this.storage.remove(key);
      return res.status(StatusCodes.OK).end();
    } catch (err: any) {
      return this.handleDatabaseError(req, res, err);
    }
  }
}

export default Controller;
