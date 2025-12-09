import type { Cell, SudokuMove } from "./types"

type CandidateMap = number[][][]

export function solveWithBacktracking(grid: Cell[][], useForwardChecking: boolean = true): SudokuMove[] | null {
    const moves: SudokuMove[] = []
    const candidates: CandidateMap = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (grid[r][c].value != null ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9]))
    )

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

    // Run candidate elimination for the initial grid state.
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value != null) {
                updateCandidates(r, c, grid[r][c].value as number, candidates)
            }
        }
    }

    const findEmpty = (): [number, number] | null => {
        if (useForwardChecking) {
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

    // Checks if placing 'val' at (r, c) is safe according to Sudoku rules. 
    // Only used when forward checking is disabled.
    const isSafe = (r: number, c: number, val: number, currentGrid: Cell[][]): boolean => {
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

    const backtrack = (): boolean => {
        const pos = findEmpty()
        if (!pos) return true

        const [r, c] = pos
        const possibleValues = getPossibleValues(r, c)

        for (const val of possibleValues) {
            grid[r][c].value = val
            moves.push({ r, c, value: val, reason: useForwardChecking ? "Assignment (FC)" : "Assignment (BT)" })
            const snapshot = cloneCandidates()
            let isDeadEnd = false

            if (useForwardChecking) {
                updateCandidates(r, c, val, candidates)

                isDeadEnd = candidates.flat().some((arr, idx) => {
                    const rr = Math.floor(idx / 9)
                    const cc = idx % 9
                    return grid[rr][cc].value == null && arr.length === 0
                })
            }
            
            if (!isDeadEnd) {
                if (backtrack()) {
                    return true
                }
            }

            // Record the mistake/backtrack move
            moves.push({ r, c, value: val, reason: "Mistake/Backtrack" })

            grid[r][c].value = null

            // Restore the candidates map from the snapshot (undo the inference/FC)
            if (useForwardChecking) {
                candidates.forEach((row, rr) =>
                    row.forEach((_, cc) => { candidates[rr][cc] = [...snapshot[rr][cc]] })
                )
            }
        }

        return false
    }

    return backtrack() ? moves : null
}