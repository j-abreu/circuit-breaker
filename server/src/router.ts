import {Router} from 'express';
import Controller from './controller';

const controller = new Controller();
const router = Router();

router.get('/store', controller.getAll.bind(controller));
router.get('/store/:key', controller.get.bind(controller));
router.post('/store', controller.post.bind(controller));
router.patch('/store/:key', controller.patch.bind(controller));
router.delete('/store/:key', controller.remove.bind(controller));

export default router;
