import 'dotenv/config';
import express, { json } from 'express';
import { connect } from 'mongoose';
import Router from '../routes';

export default class App {
    /**
     * Start the application.
     */
    start = (): void => {
        const app = express();

        app.use(json());
        app.use('/api', Router);

        app.listen(process.env.PORT || 3000, () => {
            this.connect();
            console.log(`Listening to port ${process.env.PORT || 3000}`);
        });
    }

    /**
     * Connect to the database.
     */
    connect = (): void => {
        connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, () => {
            console.log('Connected to the database.');
        });
    }
}
