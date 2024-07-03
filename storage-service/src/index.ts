import express from 'express';
import router from './router';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.text());
app.use(morgan('dev')); // log HTTP requests
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(router);

app.listen(port, () => {
  console.log(`[SERVER] Listening on port ${port}`);
});
