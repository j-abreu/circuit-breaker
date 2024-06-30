import {Request, Response} from 'express';
import Database from './database/database';
import {StatusCodes} from 'http-status-codes';
import logger from './logger/logger';

class Controller {
  private storage: Database;

  constructor() {
    this.storage = new Database();
  }

  async get(req: Request, res: Response) {
    try {
      const {key} = req.params;

      const value = await this.storage.getByKey(key);

      const data = {
        [key]: value,
      };

      res.json(data).status(StatusCodes.OK).end();
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
      const {key, newValue} = req.body;

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
