// Assuming your types and initial candidate setup (updateCandidates) are available

import { solveWithBacktracking } from "./backtracking"
import type { Cell, SudokuMove } from "./types"

// Assuming solveWithForwardChecking and types are imported from your existing code

export function humanSolver2(initialGrid: Cell[][]): SudokuMove[] | null {
    const moves: SudokuMove[] = []
    // Deep copy is crucial so we don't modify the original grid for failed attempts
    const grid: Cell[][] = JSON.parse(JSON.stringify(initialGrid)) 
    
    // 1. Initialize the candidate list
    let candidates: CandidateMap = initializeCandidates(grid) 

    // --- 2. Main Deductive Loop (The 'Human' Part) ---
    let madeMove = true
    while (madeMove) {
        madeMove = false // Reset for the iteration

        // 2a. Apply Naked Singles (Highest Priority)
        let logicalMove = findNakedSingle(grid, candidates)
        if (logicalMove) {
            applyMove({ ...logicalMove, reason: "Naked Single" }, grid, candidates, moves)
            madeMove = true
            continue
        }

        // 2b. Apply Hidden Singles (Next Priority)
        logicalMove = findHiddenSingle(grid, candidates)
        if (logicalMove) {
            applyMove({ ...logicalMove, reason: "Hidden Single" }, grid, candidates, moves)
            madeMove = true
            continue
        }
    }

    // --- 3. Final Check & Fallback ---
    if (isSolved(grid)) {
        console.log("Sudoku solved entirely by logic!")
        return moves // Solved entirely by logic!
    } else if (hasContradiction(candidates)) {
        return null // Board is impossible
    } else {
        // Logic stalled. Resort to backtracking/guessing on the partially-solved board.
        console.log("Logic stalled. Falling back to Forward Checking Backtracking...")
        
        const remainingMoves = solveWithBacktracking(grid)
        
        if (remainingMoves) {
            return moves.concat(remainingMoves)
        }
        return null
    }
}


// CandidateMap structure: candidates[r][c] is an array of possible values [1-9]
type CandidateMap = number[][][]

/**
 * Initializes the Candidate Map based on the starting grid.
 * Essentially, it runs your existing constraint propagation once on the initial fixed cells.
 */
function initializeCandidates(grid: Cell[][]): CandidateMap {
    // 1. Start every empty cell with all 9 candidates
    const candidates: CandidateMap = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (grid[r][c].value != null ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9]))
    )

    // 2. Helper to remove a value from candidates of cells related to (r, c)
    const removeValueFromPeers = (r: number, c: number, val: number) => {
        // Row and Column peers
        for (let i = 0; i < 9; i++) {
            if (grid[r][i].value == null) candidates[r][i] = candidates[r][i].filter(x => x !== val)
            if (grid[i][c].value == null) candidates[i][c] = candidates[i][c].filter(x => x !== val)
        }
        // 3x3 Box peers
        const br = Math.floor(r / 3) * 3
        const bc = Math.floor(c / 3) * 3
        for (let rr = br; rr < br + 3; rr++) {
            for (let cc = bc; cc < bc + 3; cc++) {
                if (grid[rr][cc].value == null) {
                    candidates[rr][cc] = candidates[rr][cc].filter(x => x !== val)
                }
            }
        }
    }

    // 3. Apply constraints from all initial fixed cells
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value != null) {
                removeValueFromPeers(r, c, grid[r][c].value as number)
            }
        }
    }

    return candidates
}

/**
 * Updates the grid and candidates after a logical deduction has found a move.
 */
function applyMove(
    move: { r: number, c: number, value: number, reason: string },
    grid: Cell[][],
    candidates: CandidateMap,
    movesLog: SudokuMove[]
): void {
    const { r, c, value, reason } = move
    
    // 1. Update the grid cell
    grid[r][c].value = value
    
    // 2. Log the move
    movesLog.push({ r, c, value, reason })
    
    // 3. Update candidates (constraint propagation, like your forward checking)
    candidates[r][c] = [] // The cell is now filled
    
    // Remove the placed value from all peers (row, column, and box)
    for (let i = 0; i < 9; i++) {
        // Row peers
        if (i !== c && grid[r][i].value == null) {
            candidates[r][i] = candidates[r][i].filter(x => x !== value)
        }
        // Column peers
        if (i !== r && grid[i][c].value == null) {
            candidates[i][c] = candidates[i][c].filter(x => x !== value)
        }
    }
    
    // Box peers
    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
            if ((rr !== r || cc !== c) && grid[rr][cc].value == null) {
                candidates[rr][cc] = candidates[rr][cc].filter(x => x !== value)
            }
        }
    }
}

/**
 * Checks if the board is fully solved (no null values).
 */
function isSolved(grid: Cell[][]): boolean {
    return grid.every(row => row.every(cell => cell.value != null))
}

/**
 * Checks if any empty cell has 0 candidates, indicating an impossible board state.
 */
function hasContradiction(candidates: CandidateMap): boolean {
    return candidates.flat().some((arr, idx) => arr.length === 0 && arr.length < 9)
}

/**
 * Searches for a Naked Single: a cell with exactly one candidate.
 */
function findNakedSingle(grid: Cell[][], candidates: CandidateMap): { r: number, c: number, value: number } | null {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value == null && candidates[r][c].length === 1) {
                // Found a cell with only one candidate
                return { r, c, value: candidates[r][c][0] }
            }
        }
    }
    return null
}

/**
 * Searches for a Hidden Single across all rows, columns, and 3x3 boxes.
 */
function findHiddenSingle(grid: Cell[][], candidates: CandidateMap): { r: number, c: number, value: number } | null {
    // Check Rows (r)
    for (let r = 0; r < 9; r++) {
        for (let val = 1; val <= 9; val++) {
            let count = 0
            let pos: { r: number, c: number } | null = null
            
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value == null && candidates[r][c].includes(val)) {
                    count++
                    pos = { r, c }
                }
            }
            
            if (count === 1 && pos) {
                return { ...pos, value: val }
            }
        }
    }

    // Check Columns (c)
    for (let c = 0; c < 9; c++) {
        for (let val = 1; val <= 9; val++) {
            let count = 0
            let pos: { r: number, c: number } | null = null
            
            for (let r = 0; r < 9; r++) {
                if (grid[r][c].value == null && candidates[r][c].includes(val)) {
                    count++
                    pos = { r, c }
                }
            }
            
            if (count === 1 && pos) {
                return { ...pos, value: val }
            }
        }
    }

    // Check 3x3 Boxes (br, bc)
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            for (let val = 1; val <= 9; val++) {
                let count = 0
                let pos: { r: number, c: number } | null = null
                
                for (let r = br * 3; r < br * 3 + 3; r++) {
                    for (let c = bc * 3; c < bc * 3 + 3; c++) {
                        if (grid[r][c].value == null && candidates[r][c].includes(val)) {
                            count++
                            pos = { r, c }
                        }
                    }
                }
                
                if (count === 1 && pos) {
                    return { ...pos, value: val }
                }
            }
        }
    }

    return null
}