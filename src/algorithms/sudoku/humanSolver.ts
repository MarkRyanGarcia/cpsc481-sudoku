import type { Cell, SudokuMove } from "./types"
import { getCandidates } from "./utils"

export function humanSolver(grid: Cell[][]): SudokuMove[] {
    const moves: SudokuMove[] = []

    while (true) {
        let progress = false

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value == null) {
                    const cand = getCandidates(grid, r, c)
                    if (cand.length === 1) {
                        grid[r][c].value = cand[0]
                        moves.push({ r, c, value: cand[0], reason: "single candidate" })
                        progress = true
                    }
                }
            }
        }
        if (progress) continue

        const checkUnit = (cells: { r: number, c: number }[], unitName: string) => {
            const spots: Record<number, { r: number, c: number }[]> = {}
            for (let v = 1; v <= 9; v++) spots[v] = []
            for (const { r, c } of cells) {
                if (grid[r][c].value == null) {
                    const cand = getCandidates(grid, r, c)
                    for (const v of cand) {
                        spots[v].push({ r, c })
                    }
                }
            }
            for (let v = 1; v <= 9; v++) {
                if (spots[v].length === 1) {
                    const { r, c } = spots[v][0]
                    grid[r][c].value = v
                    moves.push({ r, c, value: v, reason: unitName })
                    return true
                }
            }
            return false
        }

        for (let r = 0; r < 9; r++) {
            if (checkUnit(
                Array.from({ length: 9 }, (_, c) => ({ r, c })),
                "single position row"
            )) {
                progress = true
            }
        }
        if (progress) continue

        for (let c = 0; c < 9; c++) {
            if (checkUnit(
                Array.from({ length: 9 }, (_, r) => ({ r, c })),
                "single position column"
            )) {
                progress = true
            }
        }
        if (progress) continue

        for (let b = 0; b < 9; b++) {
            const br = Math.floor(b / 3) * 3
            const bc = (b % 3) * 3
            const cells = []
            for (let r = br; r < br + 3; r++) {
                for (let c = bc; c < bc + 3; c++) {
                    cells.push({ r, c })
                }
            }
            if (checkUnit(cells, "single position box")) {
                progress = true
            }
        }
        if (progress) {
            continue
        }
        break
    }

    return moves
}