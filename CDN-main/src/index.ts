import 'dotenv/config';
import express, { json } from 'express';
import router from './router';
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(json());
app.use('/', router);

app.listen(port, () => {
    console.log(`Listening to port ${port}.`);
});
