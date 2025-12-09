import type { Cell, SudokuMove } from "./types"

// A type alias for the 9x9 array storing the list of possible candidates (1-9) for each cell.
type CandidateMap = number[][][]
type Position = [number, number]

// --- Core Solver Function ---

export function solveHumanLike(grid: Cell[][]): SudokuMove[] | null {
    const moves: SudokuMove[] = []
    let candidates: CandidateMap = initializeCandidates(grid)

    // A flag to indicate if we made any deterministic move in the current loop iteration.
    let changed: boolean = true

    // 1. Initial Deduction Loop (Solve as much as possible without guessing)
    while (changed) {
        changed = false

        // Check for solved state after potential changes
        if (isSolved(grid)) {
            return moves
        }

        // --- Step 2: Apply Deduction Techniques (Simulate a human looking for a solution) ---
        
        // 2.1. Naked Singles (The most obvious deduction)
        const nakedSingleMove = findNakedSingle(grid, candidates)
        if (nakedSingleMove) {
            applyMove(grid, candidates, moves, nakedSingleMove.r, nakedSingleMove.c, nakedSingleMove.value, "Naked Single")
            changed = true
            continue // Start the loop over to check for new singles
        }

        // 2.2. Hidden Singles (Next easiest deduction)
        const hiddenSingleMove = findHiddenSingle(grid, candidates)
        if (hiddenSingleMove) {
            applyMove(grid, candidates, moves, hiddenSingleMove.r, hiddenSingleMove.c, hiddenSingleMove.value, "Hidden Single")
            changed = true
            continue // Start the loop over to check for new singles
        }
        
        // 2.3. Candidate Elimination (Locked Candidates, etc.)
        // This is where more advanced elimination logic (Pointing/Claiming) would go.
        // For simplicity, we skip these here and rely on the singles logic above.
    }

    // 2.4. Check if the grid is now solved after the deduction phase
    if (isSolved(grid)) {
        return moves
    }

    // 3. Backtracking Search (Fallback when deductions fail - The "Guessing" Phase)
    
    // If the grid is stuck, fall back to a search
    if (backtrackSearch(grid, candidates, moves)) {
        return moves
    }

    // If neither deduction nor search worked
    return null
}

// --- Helper Functions (Simulating Human Techniques) ---

/**
 * Initializes the Candidate Map based on the initial grid state.
 */
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

/**
 * Checks for a cell (r, c) with only one possible candidate remaining (Naked Single).
 * @returns A move object or null.
 */
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

/**
 * Checks for a unit (row, col, or box) where a candidate appears only once (Hidden Single).
 * This is a highly effective deduction.
 * @returns A move object or null.
 */
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

    // Check all 27 units (9 rows, 9 columns, 9 boxes)
    for (let unitIndex = 0; unitIndex < 9; unitIndex++) {
        for (const type of ['row', 'col', 'box'] as const) {
            const positions = getUnitPositions(type, unitIndex)
            
            // Check for each candidate 1-9
            for (let val = 1; val <= 9; val++) {
                let count = 0
                let singlePos: Position | null = null

                for (const [r, c] of positions) {
                    if (grid[r][c].value == null && candidates[r][c].includes(val)) {
                        count++
                        singlePos = [r, c]
                    }
                }

                // If a candidate appears in exactly one unassigned cell in the unit, it's a Hidden Single
                if (count === 1 && singlePos) {
                    const [r, c] = singlePos
                    return { r, c, value: val, reason: `Hidden Single (${type} ${unitIndex})` }
                }
            }
        }
    }
    return null
}

/**
 * Applies a move to the grid, updates candidates, and records the move. (Forward Checking)
 */
function applyMove(grid: Cell[][], candidates: CandidateMap, moves: SudokuMove[], r: number, c: number, val: number, reason: string): void {
    grid[r][c].value = val
    moves.push({ r, c, value: val, reason })
    
    // Clear candidates for the solved cell
    candidates[r][c] = []
    
    // Eliminate 'val' from related units (Forward Checking)
    for (let i = 0; i < 9; i++) {
        // Row and Column
        if (i !== c && grid[r][i].value == null) candidates[r][i] = candidates[r][i].filter(x => x !== val)
        if (i !== r && grid[i][c].value == null) candidates[i][c] = candidates[i][c].filter(x => x !== val)
    }
    // 3x3 Box
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

/**
 * Checks if placing 'val' at (r, c) is safe according to Sudoku rules.
 */
function isSafe(r: number, c: number, val: number, currentGrid: Cell[][]): boolean {
    // Check row and column
    for (let i = 0; i < 9; i++) {
        if (currentGrid[r][i].value === val || currentGrid[i][c].value === val) {
            return false
        }
    }
    // Check 3x3 box
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

/**
 * Determines if all cells are filled.
 */
function isSolved(grid: Cell[][]): boolean {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value == null) return false
        }
    }
    return true
}

// --- Backtracking Fallback ---

/**
 * Finds the next unassigned cell using the Minimal Remaining Values (MRV) heuristic.
 * This simulates a human choosing the "most constrained" cell to guess.
 */
function findMRVEmpty(grid: Cell[][], candidates: CandidateMap): Position | null {
    let minLen = 10
    let pos: Position | null = null
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value == null) {
                if (candidates[r][c].length < minLen) {
                    minLen = candidates[r][c].length
                    pos = [r, c]
                }
            }
        }
    }
    return pos
}

/**
 * Deeply clones the candidates map.
 */
const cloneCandidates = (map: CandidateMap): CandidateMap =>
    map.map(row => row.map(cell => [...cell]))

/**
 * The recursive backtracking search function.
 */
function backtrackSearch(grid: Cell[][], candidates: CandidateMap, moves: SudokuMove[]): boolean {
    const pos = findMRVEmpty(grid, candidates)
    if (!pos) return true // Solved

    const [r, c] = pos
    // Get the values to try from the candidates list (Least Constraining Value heuristic could be added here)
    const cellCandidates = [...candidates[r][c]]

    for (const val of cellCandidates) {
        // 1. Assignment (The Guess)
        grid[r][c].value = val
        moves.push({ r, c, value: val, reason: "Guess/Trial (BT)" })

        // Save a snapshot of candidates for restoration
        const snapshot = cloneCandidates(candidates)
        
        // 2. Inference (Forward Checking)
        applyMove(grid, candidates, [], r, c, val, "") // Use the helper, but don't record another move

        // Check for conflict (a cell runs out of candidates)
        const conflict = candidates.flat().some((arr, idx) => {
            const rr = Math.floor(idx / 9)
            const cc = idx % 9
            return grid[rr][cc].value == null && arr.length === 0
        })

        if (!conflict) {
            // 3. Recurse
            if (backtrackSearch(grid, candidates, moves)) return true
        }

        // 4. Backtrack/Restore (Guess Failed)
        
        // Record the mistake/backtrack move
        moves.push({ r, c, value: val, reason: "Mistake/Backtrack (Guess Failed)" })

        // Unassign the value
        grid[r][c].value = null
        
        // Restore candidates from the snapshot
        candidates.forEach((row, rr) =>
            row.forEach((_, cc) => { candidates[rr][cc] = [...snapshot[rr][cc]] })
        )
    }

    return false
}