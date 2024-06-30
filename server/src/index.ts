import express from 'express';
import router from './router';

const app = express();
const port = process.env.PORT;
app.use(router);

app.listen(port, () => {
  console.log(`[SERVER] Listening on port ${port}`);
});
