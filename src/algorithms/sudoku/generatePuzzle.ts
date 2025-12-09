import { solveWithForwardChecking } from "./forwardSolver"
import type { Cell } from "./types"
import { createEmptyGrid } from "./utils";

export function generatePuzzle(): Cell[][] {
    const newBoard = createEmptyGrid()

    // Fill diagonal 3x3 boxes first (they don't affect each other)
    for (let box = 0; box < 9; box += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
      let idx = 0
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          newBoard[box + i][box + j].value = nums[idx++]
        }
      }
    }

    // Solve the rest
    solveWithForwardChecking(newBoard)

    // Remove numbers to create puzzle (keep 30-35 numbers)
    const cellsToRemove = 81 - (30 + Math.floor(Math.random() * 6))
    let removed = 0
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      if (newBoard[row][col].value !== null) {
        newBoard[row][col].value = null
        removed++
      }
    }

    for (const row of newBoard) {
        for (const cell of row) {
            if (cell.value !== null) {
                cell.isFixed = true
            }
        }
    }

    return newBoard
  }