import { S3 } from 'aws-sdk';

export default new class Utils {
    s3: S3;

    constructor() {
        this.s3 = new S3({
            credentials: {
                secretAccessKey: process.env.S3_SECRET_KEY,
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
            },
            endpoint: process.env.S3_ENDPOINT,
        });
    }
};
