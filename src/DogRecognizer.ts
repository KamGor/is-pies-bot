import { MobileNet } from '@tensorflow-models/mobilenet';
import { ImageLoader } from './ImageLoader';
import { readFileSync } from 'fs';

export class DogRecognizer {

    private dogBreeds: Set<string>;

    constructor(
        private _model: MobileNet,
        private imageLoader: ImageLoader,
    ) {
        this.dogBreeds = new Set(readFileSync('./dog_breeds.txt').toString().split('\n').filter(line => line.trim() !== ''));
    }

    async isDog(imagePath) {
        let log = '--------------------------------\n';
        if(!this._model) {
            throw new Error('Model has not been loaded.');
        }

        const imageTensor = await this.imageLoader.loadImage(imagePath);
        const predictions = await this._model.classify(<any> imageTensor);

        imageTensor.dispose();

        const dogPrediction = predictions.reduce((acc, curr) => {
            const breedNames = curr.className.toLowerCase().split(', ').map((curr) => {
                return curr.replaceAll(' ', '-');
            });
            log += `Non-formatted name: ${curr.className.toLowerCase()}\n`;
            log += `Probability: ${curr.probability}\n`;

            const isPies: boolean = breedNames.reduce((acc, curr) => {
                log += `    What is it? ${curr}\n`;
                log += `    Is on list? ${this.dogBreeds.has(curr)}\n`;
                return acc || this.dogBreeds.has(curr);
            }, false);

            return acc || (isPies && curr.probability > 0.25);
        }, false);

        console.log(log);
        return !!dogPrediction;
    }

}