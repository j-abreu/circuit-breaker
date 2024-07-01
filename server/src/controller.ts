import {Request, Response} from 'express';
import Database from './database/database';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';
import logger from './logger/logger';

class Controller {
  private storage: Database;

  constructor() {
    this.storage = new Database();
  }

  async getAll(req: Request, res: Response) {
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

      const data = {
        [key]: value,
      };

      return res.json(data).status(StatusCodes.OK).end();
    } catch (err: any) {
      logger.error(err.message);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
        })
        .end();
    }
  }

  async post(req: Request, res: Response) {
    try {
      const {key, value} = req.body;

      await this.storage.insert(key, value);

      res.status(StatusCodes.CREATED).end();
    } catch (err: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
        })
        .end();
    }
  }

  async patch(req: Request, res: Response) {
    try {
      const {value: newValue} = req.body;
      const {key} = req.params;

      await this.storage.update(key, newValue);

      res.status(StatusCodes.OK).end();
    } catch (err: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
        })
        .end();
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const {key} = req.params;

      await this.storage.remove(key);
      res.status(StatusCodes.OK).end();
    } catch (err: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: err.message,
        })
        .end();
    }
  }
}

export default Controller;
