export type Cell = {
    value: number | null
    isFixed: boolean
}
  
export type SudokuMove = {
    r: number
    c: number
    value: number
    reason: string
}

export type Algo = "human" | "backtracking"