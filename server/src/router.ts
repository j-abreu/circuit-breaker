import {Router} from 'express';
import Controller from './controller';

const controller = new Controller();
const router = Router();

router.get('/get/:key', controller.get.bind(controller));
router.post('/post', controller.post.bind(controller));
router.patch('/patch', controller.patch.bind(controller));
router.delete('/delete/:key', controller.remove.bind(controller));

export default router;
