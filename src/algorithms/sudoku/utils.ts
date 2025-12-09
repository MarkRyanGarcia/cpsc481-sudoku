import { solveWithBacktracking } from "./backtracking"
import { humanSolver } from "./humanSolver"
import type { Algo, Cell, SudokuMove } from "./types"


export function getCandidates(grid: Cell[][], r: number, c: number): number[] {
    if (grid[r][c].value != null) return []

    const used = new Set<number>()

    for (let cc = 0; cc < 9; cc++) {
        const v = grid[r][cc].value
        if (v != null) {
            used.add(v)
        }
    }

    for (let rr = 0; rr < 9; rr++) {
        const v = grid[rr][c].value
        if (v != null) {
            used.add(v)
        }
    }

    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3

    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            const v = grid[rr][cc].value
            if (v != null) {
                used.add(v)
            }
        }
    }

    const cand: number[] = []
    for (let v = 1; v <= 9; v++) {
        if (!used.has(v)) {
            cand.push(v)
        }
    }
    return cand
}

export function createEmptyGrid(): Cell[][] {
    return Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => ({ value: null, isFixed: false }))
    );
}

export function solve(
    grid: Cell[][],
    algorithm: Algo
) {
    const clone = grid.map(r => r.map(c => ({ ...c })))
    let moves: SudokuMove[] | null = []
    if (algorithm == 'backtracking') {
        moves = solveWithBacktracking(clone, false)
    } else if (algorithm == 'backtrackingWithForwardChecking') {
        moves = solveWithBacktracking(clone)
    }
    else if (algorithm == 'human') {
        moves = humanSolver(clone)
    } else {
        console.error('Attempted to Solve without an algorithm selected.')
    }
    // setGrid(clone)
    // console.log("moves", moves)
    // console.log("final grid", clone.map(r => r.map(c => c.value)))
    return moves
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
