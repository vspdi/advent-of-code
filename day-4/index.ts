import path from 'path';
import chalk from 'chalk';
import { getData } from '../utils';

interface SequenceNumber {
    value: number;
    valid: boolean;
}

class InputSequence {
    sequence: number[];
    pointer: number;

    constructor( readonly input: string, readonly delimiter: RegExp | string = /,/ ) {
        this.sequence = this.input.split( delimiter ).map( num => parseInt( num ) );
        this.pointer = 0;
    }

    next(): SequenceNumber {
        return {
            value: this.sequence[ this.pointer++ ],
            valid: this.pointer <= this.sequence.length
        }
    }
}

interface BingoField {
    value: number;
    marked: boolean;
}

class BingoBoard {
    data: BingoField[];
    won: boolean;

    constructor( readonly input: string, readonly index: number ) {
        this.data = input.split( /\s+/gm )
            .map( num => ({ value: parseInt( num ), marked: false }) )
            .filter( n => !Number.isNaN( n.value ) );
        this.won = false;
    }

    getIndex( row: number, col: number ): number {
        return row * 5 + col;
    }

    findIndex( index: number ): { row: number, col: number } {
        return {
            row: Math.floor(index / 5),
            col: index % 5
        }
    }

    print() {
        console.log(`Board #${this.index}`);
        const buffer: string[] = [];
        for ( let row = 0; row < 5; row++ ) {
            const line: string[] = [];
            for ( let col = 0; col < 5; col++ ) {
                const cell = this.data[ this.getIndex( row, col ) ];
                const color = cell.marked ? chalk.red : chalk.green;
                line.push( color( cell.value.toFixed( 0 ).padStart( 2, ' ' ) ) );
            }
            buffer.push( line.join( ' ' ) );
        }
        console.log( buffer.join( '\n' ) );
    }

    mark( value: number ): boolean {
        const index = this.data.findIndex( val => val.value === value );
        if ( index !== -1 ) {
            this.data[ index ].marked = true;

            let rowWin = true;
            let colWin = true;
            const {row, col} = this.findIndex(index);
            for ( let idx = 0; idx < 5; idx++ ) {
                rowWin = rowWin && this.data[ this.getIndex( row, idx ) ].marked;
                colWin = colWin && this.data[ this.getIndex( idx, col ) ].marked;
            }

            if(rowWin || colWin) {
                this.won = true;
                return true;
            }
        }

        return false;
    }

    getUnlabeledNumbers(): number[] {
        return this.data.filter(d => !d.marked).map(d => d.value);
    }
}

const task = async () => {
    const [ sequenceInput, ...rest ] = (await getData( path.resolve( __dirname, 'data.txt' ) )).split( /^\n/gm );

    const sequence = new InputSequence( sequenceInput );

    const boards = rest.map((board, i) => new BingoBoard( board, i ));

    let s: SequenceNumber;
    sequenceLoop:
    while ( (s = sequence.next()).valid ) {
        const removeBoards: number[] = [];
        for(const board of boards) {
            if(!board.won && board.mark( s.value )) {
                board.print( );
                const result = s.value * board.getUnlabeledNumbers().reduce((acc, next) => acc+next, 0);
                console.log(`Board score (last draw: ${s.value}) ${result}`);
            }
        }
    }
}

task().then();