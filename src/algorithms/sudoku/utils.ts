import type { Cell } from "./types"

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