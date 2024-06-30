import express from 'express';
import router from './router';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.text());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan('dev')); // log HTTP requests

app.use(router);

app.listen(port, () => {
  console.log(`[SERVER] Listening on port ${port}`);
});
