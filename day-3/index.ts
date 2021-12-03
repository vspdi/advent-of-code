import path from 'path';
import {getDataAsLines} from "../utils";

interface DiagnosticReport {
    gammaRate: number;
    epsilonRate: number;
}

interface LifeSupportRating {
    oxygenGeneratorRating: number;
    co2ScrubberRating: number;
}

type SortingDirection = 'asc' | 'desc';
const sortingMultiplier: Record<SortingDirection, number> = {
    asc: 1,
    desc: -1,
}
const sortingAlphabetMap: Record<SortingDirection, AlphabetType> = {
    asc: '0',
    desc: '1'
}
type AlphabetType = '0' | '1';
type AlphabetCounter = { key: AlphabetType, count: number };
type SequencerFunc = (lines: string[], index: number, sorting: SortingDirection) => AlphabetCounter[];

const countSignificantEntityForRow: SequencerFunc = (lines, index, sorting: SortingDirection) => {
    const counts: Record<AlphabetType, number> = lines.reduce<Record<string, number>>((acc, line) => {
        const item = line[index];
        if(!acc[item]) {
            acc[item] = 1;
        } else {
            acc[item]++;
        }

        return acc;
    }, {});

    return Object.entries<number>(counts).sort(([aKey, a], [bKey, b]) => {
       if(a === b) {
           return 0
       } else {
           return (a > b ? 1 : -1) * sortingMultiplier[sorting];
       }
    }).map(([key, count]) => ({key, count}) as AlphabetCounter);
}

const findSequence = (lines: string[], sequencerFunc: SequencerFunc, sorting: SortingDirection): string => {
    if(lines.length === 0) {
        return '';
    }
    return lines[0].split('').map((_, index) => {
        const sequence = sequencerFunc(lines, index, sorting);
        return sequence[0].key;
    }).join('');
}

const filterSequence = (lines: string[], index: number, sequencerFunc: SequencerFunc, sorting: SortingDirection): string[] => {
    if(lines.length === 0) {
        return [];
    }

    const [ { key: filterKey, count: aCount }, { key: _, count: bCount }] = sequencerFunc(lines, index, sorting);

    const filterBy = aCount === bCount ? sortingAlphabetMap[sorting] : filterKey;

    return lines.filter(line => line[index] === filterBy);
}

const findFilteredSequenceRemainder = (lines: string[], sequencerFunc: SequencerFunc, sorting: SortingDirection): number => {
    let remainingLines = lines; ;

    let index = 0;
    do {
        remainingLines = filterSequence(remainingLines, index++, countSignificantEntityForRow, sorting)
    } while(remainingLines.length > 1);

    return parseInt(remainingLines[0], 2);
}

const createDiagnosticReport = (lines: string[], sequencerFunc: SequencerFunc): DiagnosticReport => {
    return {
        gammaRate: parseInt(findSequence(lines, sequencerFunc, 'desc'), 2),
        epsilonRate: parseInt(findSequence(lines, sequencerFunc, 'asc'), 2)
    }
}

const createLifeSupportRating = (lines: string[]): LifeSupportRating => {

    return {
        co2ScrubberRating: findFilteredSequenceRemainder(lines, countSignificantEntityForRow, 'desc'),
        oxygenGeneratorRating: findFilteredSequenceRemainder(lines, countSignificantEntityForRow, 'asc')
    }
}

const task = async () => {
    const data = (await getDataAsLines(path.resolve(__dirname, 'data.txt'))).map(line => line.replace(/\r/g, ''));

    const diagnosticReport = createDiagnosticReport(data, countSignificantEntityForRow);

    console.log("Part1 ", diagnosticReport, "Power consumption", diagnosticReport.gammaRate * diagnosticReport.epsilonRate);

    const lifeSupportRating = createLifeSupportRating(data);

    console.log("Part 2", lifeSupportRating, "Life support Rating", lifeSupportRating.oxygenGeneratorRating * lifeSupportRating.co2ScrubberRating);
}

task().then();