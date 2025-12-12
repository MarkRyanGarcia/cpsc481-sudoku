import { solveWithBacktracking } from "./backtracking"
import type { Cell, SudokuMove } from "./types"
import { isSolved } from "./utils"

type CandidateMap = number[][][]
type Position = [number, number]

export function solveHumanLike(grid: Cell[][]): SudokuMove[] | null {
    const moves: SudokuMove[] = []
    let candidates: CandidateMap = initializeCandidates(grid)
    let changed: boolean = true

    while (changed) {
        changed = false
        if (isSolved(grid)) {
            return moves
        }
        // Naked Singles (The most obvious deduction)
        const nakedSingleMove = findNakedSingle(grid, candidates)
        if (nakedSingleMove) {
            applyMove(grid, candidates, moves, nakedSingleMove.r, nakedSingleMove.c, nakedSingleMove.value, "Naked Single")
            changed = true
            continue
        }

        // Hidden Singles (Next easiest deduction)
        const hiddenSingleMove = findHiddenSingle(grid, candidates)
        if (hiddenSingleMove) {
            applyMove(grid, candidates, moves, hiddenSingleMove.r, hiddenSingleMove.c, hiddenSingleMove.value, "Hidden Single")
            changed = true
            continue
        }
    }
    if (isSolved(grid)) {
        return moves
    } else {
        moves.push(...solveWithBacktracking(grid) as SudokuMove[])
        return moves
    }
}


function initializeCandidates(grid: Cell[][]): CandidateMap {
    const candidates: CandidateMap = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => {
            if (grid[r][c].value != null) {
                return []
            }
            return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(val => isSafe(r, c, val, grid))
        })
    )
    return candidates
}

function findNakedSingle(grid: Cell[][], candidates: CandidateMap): SudokuMove | null {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value == null && candidates[r][c].length === 1) {
                return { r, c, value: candidates[r][c][0], reason: "Naked Single" }
            }
        }
    }
    return null
}

function findHiddenSingle(grid: Cell[][], candidates: CandidateMap): SudokuMove | null {
    // Helper to get positions for a unit (row, column, or box)
    const getUnitPositions = (type: 'row' | 'col' | 'box', index: number): Position[] => {
        const positions: Position[] = []
        if (type === 'row') {
            for (let c = 0; c < 9; c++) positions.push([index, c])
        } else if (type === 'col') {
            for (let r = 0; r < 9; r++) positions.push([r, index])
        } else { // box
            const br = Math.floor(index / 3) * 3
            const bc = (index % 3) * 3
            for (let r = br; r < br + 3; r++) {
                for (let c = bc; c < bc + 3; c++) {
                    positions.push([r, c])
                }
            }
        }
        return positions
    }

    for (let unitIndex = 0; unitIndex < 9; unitIndex++) {
        for (const type of ['row', 'col', 'box'] as const) {
            const positions = getUnitPositions(type, unitIndex)
            
            for (let val = 1; val <= 9; val++) {
                let count = 0
                let singlePos: Position | null = null

                for (const [r, c] of positions) {
                    if (grid[r][c].value == null && candidates[r][c].includes(val)) {
                        count++
                        singlePos = [r, c]
                    }
                }

                if (count === 1 && singlePos) {
                    const [r, c] = singlePos
                    return { r, c, value: val, reason: `Hidden Single (${type} ${unitIndex})` }
                }
            }
        }
    }
    return null
}

function applyMove(grid: Cell[][], candidates: CandidateMap, moves: SudokuMove[], r: number, c: number, val: number, reason: string): void {
    grid[r][c].value = val
    moves.push({ r, c, value: val, reason })
    
    candidates[r][c] = []
    
    for (let i = 0; i < 9; i++) {
        if (i !== c && grid[r][i].value == null) candidates[r][i] = candidates[r][i].filter(x => x !== val)
        if (i !== r && grid[i][c].value == null) candidates[i][c] = candidates[i][c].filter(x => x !== val)
    }

    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            if ((rr !== r || cc !== c) && grid[rr][cc].value == null) {
                candidates[rr][cc] = candidates[rr][cc].filter(x => x !== val)
            }
        }
    }
}

function isSafe(r: number, c: number, val: number, currentGrid: Cell[][]): boolean {
    for (let i = 0; i < 9; i++) {
        if (currentGrid[r][i].value === val || currentGrid[i][c].value === val) {
            return false
        }
    }

    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            if (currentGrid[rr][cc].value === val) {
                return false
            }
        }
    }
    return true
}
