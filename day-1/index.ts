import path from 'path';
import { getDataAsLines } from '../utils';

const partOne = (lines: number[]): number => {
    return lines.reduce<number>((total, value, index, array) => {
        if(index > 0) {
            return total + (value > array[index - 1] ? 1 : 0);
        }
        return total;
    }, 0);
}

const partTwo = (lines: number[]): number => {
    let measures = 0;

    for(let i = 3; i < lines.length; i++) {
        const a = lines[i-3] + lines[i-2] + lines[i-1];
        const b = lines[i-2] + lines[i-1] + lines[i];
        if(b > a) {
            measures++;
        }
    }

    return measures;
}

const task = async () => {
    const data = (await getDataAsLines(path.resolve(__dirname, 'data.txt'))).map(l => parseInt(l));

    console.log(`Number of measurements: ${partOne(data)}`);
    console.log(`Number of measurements three increments: ${partTwo(data)}`);

}

task().then();