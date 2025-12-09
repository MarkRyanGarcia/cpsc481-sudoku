import type { Cell, SudokuMove } from "./types"

// A type alias for the 9x9 array storing the list of possible candidates (1-9) for each cell.
type CandidateMap = number[][][]

/**
 * Solves a Sudoku grid using the backtracking algorithm with an optional forward checking heuristic.
 *
 * @param grid The 9x9 Sudoku grid.
 * @param useForwardChecking If true, candidates are updated (forward checking) after each assignment, 
 * and the solver uses the Minimal Remaining Values (MRV) heuristic. If false, it acts as simple backtracking 
 * (though the MRV cell selection is still beneficial).
 * @returns An array of SudokuMove objects representing the solution steps, or null if no solution is found.
 */
export function solveWithBacktracking(grid: Cell[][], useForwardChecking: boolean = true): SudokuMove[] | null {
    // Array to store the sequence of moves to solve the puzzle, including successful assignments and mistakes.
    const moves: SudokuMove[] = []

    // 1. Initialize Candidates Map
    // Each cell starts with candidates [1..9] unless it already has a value.
    const candidates: CandidateMap = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (grid[r][c].value != null ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9]))
    )

    /**
     * Helper function to eliminate a value from the candidates of unassigned cells 
     * in the same row, column, and 3x3 box as (r, c). This is the core of forward checking.
     * * @param r The row index.
     * @param c The column index.
     * @param val The value to eliminate.
     * @param targetCandidates The CandidateMap to modify.
     */
    const updateCandidates = (r: number, c: number, val: number, targetCandidates: CandidateMap): void => {
        // The assigned cell (r, c) now has 0 candidates.
        targetCandidates[r][c] = []

        // Eliminate 'val' from the rest of the row and column
        for (let i = 0; i < 9; i++) {
            if (i !== c && grid[r][i].value == null) {
                targetCandidates[r][i] = targetCandidates[r][i].filter(x => x !== val)
            }
            if (i !== r && grid[i][c].value == null) {
                targetCandidates[i][c] = targetCandidates[i][c].filter(x => x !== val)
            }
        }

        // Eliminate 'val' from the 3x3 box
        const br = Math.floor(r / 3) * 3
        const bc = Math.floor(c / 3) * 3
        for (let rr = br; rr < br + 3; rr++) {
            for (let cc = bc; cc < bc + 3; cc++) {
                if ((rr !== r || cc !== c) && grid[rr][cc].value == null) {
                    targetCandidates[rr][cc] = targetCandidates[rr][cc].filter(x => x !== val)
                }
            }
        }
    }

    // 2. Initial Candidate Elimination based on pre-filled cells
    // Run candidate elimination for the initial grid state.
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value != null) {
                // IMPORTANT: We use the 'candidates' map for the initial elimination.
                updateCandidates(r, c, grid[r][c].value as number, candidates)
            }
        }
    }

    /**
     * Finds the next unassigned cell to fill.
     * If useForwardChecking is enabled, it uses the MRV heuristic (cell with min candidates).
     * Otherwise, it uses simple row-major order (first empty cell).
     * * @returns The position [row, col] of the next cell, or null if the grid is full.
     */
    const findEmpty = (): [number, number] | null => {
        if (useForwardChecking) {
            // Minimal Remaining Values (MRV) Heuristic
            let minLen = 10
            let pos: [number, number] | null = null
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c].value == null) {
                        // For the MRV heuristic, we use the current candidate list length.
                        if (candidates[r][c].length < minLen) {
                            minLen = candidates[r][c].length
                            pos = [r, c]
                        }
                    }
                }
            }
            return pos
        } else {
            // Simple row-major order
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (grid[r][c].value == null) {
                        return [r, c]
                    }
                }
            }
            return null
        }
    }

    /**
     * Gets the possible values for a cell (r, c). 
     * If forward checking is used, it takes the current candidates.
     * If not, it generates the legal values by checking row/col/box.
     * * @param r The row index.
     * @param c The column index.
     * @returns An array of legal values.
     */
    const getPossibleValues = (r: number, c: number): number[] => {
        if (useForwardChecking) {
            return [...candidates[r][c]] // Use the pre-calculated candidates (already filtered)
        } else {
            // Simple backtracking: re-check constraints for every assignment.
            const possible: number[] = []
            for (let val = 1; val <= 9; val++) {
                if (isSafe(r, c, val, grid)) {
                    possible.push(val)
                }
            }
            return possible
        }
    }

    /**
     * Checks if placing 'val' at (r, c) is safe according to Sudoku rules. 
     * Only used when forward checking is disabled.
     */
    const isSafe = (r: number, c: number, val: number, currentGrid: Cell[][]): boolean => {
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

    // Helper to deeply clone the candidates map for backtracking restoration.
    const cloneCandidates = (): CandidateMap =>
        candidates.map(row => row.map(cell => [...cell]))

    // 3. The Backtracking Function
    const backtrack = (): boolean => {
        // Find the next cell to assign a value to.
        const pos = findEmpty()
        // Base case: If no empty cells are found, the grid is solved.
        if (!pos) return true

        const [r, c] = pos
        // Get the values to try (either candidates or full list of legal moves)
        const possibleValues = getPossibleValues(r, c)

        for (const val of possibleValues) {
            // 3a. Assignment
            grid[r][c].value = val
            
            // Record the move as a trial
            moves.push({ r, c, value: val, reason: useForwardChecking ? "Assignment (FC)" : "Assignment (BT)" })

            // Save snapshot *before* forward checking update
            const snapshot = cloneCandidates()

            let isDeadEnd = false

            if (useForwardChecking) {
                // 3b. Inference (Forward Checking)
                // Update candidates based on the new assignment
                updateCandidates(r, c, val, candidates)

                // Check for failure (an empty cell with 0 remaining candidates)
                // We only need to check cells that are *still* empty.
                isDeadEnd = candidates.flat().some((arr, idx) => {
                    const rr = Math.floor(idx / 9)
                    const cc = idx % 9
                    // Check if the cell is unassigned AND its candidate list is empty
                    return grid[rr][cc].value == null && arr.length === 0
                })
            }
            
            if (!isDeadEnd) {
                // 3c. Recurse
                if (backtrack()) {
                    return true // Solution found
                }
            }

            // 3d. Backtrack/Restore
            // The assignment led to a dead end (either locally via FC or globally via recursion).
            
            // Record the mistake/backtrack move
            moves.push({ r, c, value: val, reason: "Mistake/Backtrack" })

            // Unassign the value (undo the change to the grid)
            grid[r][c].value = null

            // Restore the candidates map from the snapshot (undo the inference/FC)
            if (useForwardChecking) {
                candidates.forEach((row, rr) =>
                    row.forEach((_, cc) => { candidates[rr][cc] = [...snapshot[rr][cc]] })
                )
            }
        }

        // If all values for this cell have been tried and failed
        return false
    }

    // Start the solver
    return backtrack() ? moves : null
}