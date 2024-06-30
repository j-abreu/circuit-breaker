import {Router} from 'express';
import controller from './controller';

const router = Router();

router.get('/get', controller.get);

export default router;
