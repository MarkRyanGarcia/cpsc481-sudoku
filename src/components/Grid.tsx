import { useState } from "react";
import type { Cell } from "../algorithms/sudoku/types";
import { humanSolver } from "../algorithms/sudoku/humanSolver";
import { solveWithForwardChecking } from "../algorithms/sudoku/forwardSolver";



let emptyGrid: Cell[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: null, isFixed: false }))
);

// // test
const testPuzzle: Cell[][] = [
    // fill a known easy puzzle, 0 means empty
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
].map(row => row.map(n => ({ value: n === 0 ? null : n, isFixed: n !== 0 })))



export default function Grid() {
    const [grid, setGrid] = useState(emptyGrid);

    const handleChange = (row: number, col: number, value: string) => {
        const num = value === "" ? null : Number(value);
        if (num === null || (num >= 1 && num <= 9)) {
            setGrid(prev => {
                const newGrid = prev.map(r => r.map(c => ({ ...c })));
                newGrid[row][col].value = num;
                return newGrid;
            });
        }
    };

    return (
        <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-9 gap-1">
                {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <input
                            key={`${rIdx}-${cIdx}`}
                            type="text"
                            value={cell.value ?? ""}
                            onChange={e => handleChange(rIdx, cIdx, e.target.value)}
                            className={`w-15 h-15 text-center text-3xl border ${cell.isFixed ? "bg-gray-500" : "bg-gray-800"
                                }`}
                            maxLength={1}
                            disabled={cell.isFixed}
                        />
                    ))
                )}
            </div>
            <div className="flex justify-between">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-20"
                    onClick={() => {
                        setGrid(emptyGrid)
                    }}>
                    Reset
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-20"
                    onClick={() => {
                        setGrid(testPuzzle)
                    }}>
                    Test
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-25"
                    onClick={() => {
                        const clone = grid.map(r => r.map(c => ({ ...c })))
                        const moves = humanSolver(clone)
                        setGrid(clone)
                        console.log("moves", moves)
                        console.log("final grid", clone.map(r => r.map(c => c.value)))
                    }}>
                    Human
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-25"
                    onClick={() => {
                        const clone = grid.map(r => r.map(c => ({ ...c })))
                        const moves = solveWithForwardChecking(clone)
                        if (moves) {
                            setGrid(clone)
                            console.log(moves)
                        } else {
                            console.log("Puzzle is unsolvable")
                        }
                    }}>
                    Forward
                </button>
            </div>
        </div>
    );
}