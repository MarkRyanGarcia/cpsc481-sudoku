import { useState } from 'react'
import type { Cell, Algo, ActiveCellCoords } from './algorithms/sudoku/types'
import { createEmptyGrid, isValidSudoku, sleep, solve } from './algorithms/sudoku/utils'
import './App.css'
import Board from './components/Board'
import { generatePuzzle } from './algorithms/sudoku/generatePuzzle'

const emptyGrid: Cell[][] = createEmptyGrid()

function App() {
    const [grid, setGrid] = useState(emptyGrid)
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algo>()
    const [activeCell, setActiveCell] = useState<ActiveCellCoords | null>(null);

    const handleGridChange = (row: number, col: number, value: string) => {
        const num = value === "" ? null : Number(value)
        if (num === null || (num >= 1 && num <= 9)) {
            setGrid(prev => {
                const newGrid = prev.map(r => r.map(c => ({ ...c })))
                newGrid[row][col].value = num
                return newGrid
            });
        }
    };

    async function handleSolve() {
        if (!selectedAlgorithm) { alert("Select an Algorithm First"); return }
        if (!isValidSudoku(grid)) {
            alert("Impossible Board")
            return
        }

        const moves = solve(grid, selectedAlgorithm as Algo)
        // console.log(moves)
        if (moves && moves.length > 0) {
            for (const move of moves) {
                setActiveCell({ r: move.r, c: move.c })
                handleGridChange(move.r, move.c, String(move.value))
                await sleep(10000 / moves.length)
            }
            setActiveCell(null);
        }
        else {
            alert("Impossible Board")
        }
    }

    return (
        <div className='p-5 flex flex-col space-y-1 align-center justify-center h-screen'>


            <h1 className='text-center text-7xl'>
                Sudoku Solver
            </h1>
            <p className='text-center'>
                Enter your own puzzle or generate a new one, choose an algorithm,
                and watch the solution unfold step-by-step.
            </p>

            <div className='flex flex-col mx-auto w-135'>

                <div className='flex justify-between text-black py-3'>
                    <select className='bg-zinc-300 hover:bg-zinc-200 rounded-xl w-75 pr-4 pl-2 font-bold'
                        defaultValue={"default"}
                        value={selectedAlgorithm}
                        onChange={(option) => {
                            setSelectedAlgorithm(option.target.value as Algo)
                        }}>
                        <option disabled value="default">Choose Algorithm</option>
                        <option value="backtracking">Backtracking</option>
                        <option value="backtrackingWithForwardChecking">Backtracking + Forward Checking</option>
                        <option value="human">Human</option>
                    </select>
                    <button className='bg-sky-400 hover:bg-sky-300 w-30 h-7 rounded-2xl font-bold' onClick={() => { setGrid(emptyGrid) }}>
                        Reset
                    </button>
                </div>

                <Board
                    board={grid}
                    handleChange={handleGridChange}
                    activeCell={activeCell}
                />

                <div className='flex justify-center space-x-10 text-black py-3'>
                    <button
                        className='bg-sky-400 hover:bg-sky-300 w-50 h-7 rounded-2xl font-bold'
                        onClick={() => { setGrid(generatePuzzle()) }}
                    >
                        Generate Puzzle
                    </button>
                    <button className='bg-green-300 hover:bg-green-400 w-50 rounded-2xl font-bold' onClick={handleSolve}>
                        Solve
                    </button>
                </div>

            </div>


        </div>
    )
}

export default App
