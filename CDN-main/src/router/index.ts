import { Request, Response, Router } from 'express';
import { default as utils } from '../utils';
const router = Router();
const s3 = utils.s3;

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({
        success: false,
        error: 'Provide a file id.',
    });

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `uploads/${id}`,
    };

    try {
        const object = await s3.getObject(params).promise();
        console.log(object);
    } catch (err) {

    }
});

export default router;
