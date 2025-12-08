import type { Cell, SudokuMove } from "./types"

type CandidateMap = number[][][]

export function solveWithForwardChecking(grid: Cell[][]): SudokuMove[] | null {
    const moves: SudokuMove[] = []

    const candidates: CandidateMap = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (grid[r][c].value != null ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9]))
    )

    const updateCandidates = (r: number, c: number, val: number) => {
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

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c].value != null) updateCandidates(r, c, grid[r][c].value as number)
        }
    }

    const findEmpty = (): [number, number] | null => {
        let minLen = 10
        let pos: [number, number] | null = null
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value == null && candidates[r][c].length < minLen) {
                    minLen = candidates[r][c].length
                    pos = [r, c]
                }
            }
        }
        return pos
    }

    const cloneCandidates = (): CandidateMap =>
        candidates.map(row => row.map(cell => [...cell]))

    const backtrack = (): boolean => {
        const pos = findEmpty()
        if (!pos) return true

        const [r, c] = pos
        const cellCandidates = [...candidates[r][c]]

        for (const val of cellCandidates) {
            grid[r][c].value = val
            moves.push({ r, c, value: val, reason: "forward checking" })

            const snapshot = cloneCandidates()
            updateCandidates(r, c, val)

            // Check only empty cells
            const emptyHasZero = candidates.flat().some((arr, idx) => {
                const rr = Math.floor(idx / 9)
                const cc = idx % 9
                return grid[rr][cc].value == null && arr.length === 0
            })

            if (!emptyHasZero) {
                if (backtrack()) return true
            }

            grid[r][c].value = null
            candidates.forEach((row, rr) =>
                row.forEach((_, cc) => { candidates[rr][cc] = [...snapshot[rr][cc]] })
            )
            moves.pop()
        }

        return false
    }

    return backtrack() ? moves : null
}