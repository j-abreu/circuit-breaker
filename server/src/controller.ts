import {Request, Response} from 'express';
import Database from './database/database';

class Controller {
  private db;

  constructor() {
    this.db = new Database();
  }

  get(req: Request, res: Response) {
    res.json({hello: 'world'}).end();
  }

  async testDatabase() {
    try {
      await this.db.insert('test1', 'test1Value');
      const result = await this.db.getByKey('test1');
      console.dir(result);

      await this.db.update('test1', 'newTestValue');

      const newResult = await this.db.getByKey('test1');
      console.log('New value: ', newResult);

      console.log('Removing value');
      await this.db.remove('test1');
      try {
        const removedValue = await this.db.getByKey('test1');

        console.log('removed: ', removedValue);
      } catch (err: any) {
        console.log(err);
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}

export default new Controller();
