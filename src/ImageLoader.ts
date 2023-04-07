import sharp from 'sharp';
import * as tf from '@tensorflow/tfjs-node';

export class ImageLoader {
    public async loadImage(imagePath) {
        const imageBuffer = await sharp(Buffer.from(await (await fetch(imagePath)).arrayBuffer()))
            .resize({
                fit: sharp.fit.contain,
                width: 800,
            })
            .toFormat("jpg")
            .toBuffer();

            return tf.node.decodeImage(imageBuffer, 3);
    }
}