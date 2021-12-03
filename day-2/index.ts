import path from 'path';
import { getDataAsLines } from '../utils';

interface Command {
    direction: 'forward' | 'down' | 'up';
    units: number;
}

interface Location {
    position: number;
    depth: number;
    aim?: number;
}

const parseCommands = (lines: string[]): Command[] => {
    return lines.map<Command>(line => {
        const { direction, units } = line.match(/(?<direction>[\w]+)\s(?<units>[\d]+)/)?.groups ?? {};
        return {
            direction,
            units: parseInt(units)
        } as Command
    });
}

const executeCommands = (start: Location, commands: Command[]): Location => {
    const newLocation = {...start};
    for(const command of commands) {
        switch ( command.direction ) {
            case 'forward':
                newLocation.position += command.units;
                if(newLocation.aim !== undefined) {
                    newLocation.depth += (newLocation.aim * command.units);
                }

                break;
            case 'down':
                if(newLocation.aim !== undefined) {
                    newLocation.aim += command.units;
                } else {
                    newLocation.depth += command.units;
                }

                break;
            case 'up':
                if(newLocation.aim !== undefined) {
                    newLocation.aim -= command.units;
                } else {
                    newLocation.depth -= command.units;
                }

                break;
        }
    }

    return newLocation;
}

const task = async () => {
    const data = await getDataAsLines(path.resolve(__dirname, 'data.txt'));

    const commands = parseCommands(data);

    const part1Location = executeCommands({depth: 0, position: 0}, commands);
    console.log(`Part 1 Position: ${part1Location.position} Depth: ${part1Location.depth} Course: ${part1Location.position * part1Location.depth}`);

    const part2Location = executeCommands({depth: 0, position: 0, aim: 0}, commands);
    console.log(`Part 2 Position: ${part2Location.position} Depth: ${part2Location.depth} Course: ${part2Location.position * part2Location.depth}`);
}

task().then();