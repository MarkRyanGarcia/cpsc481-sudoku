import type { Cell } from "../algorithms/sudoku/types"

type Props = {
    board: Cell[][]
    handleChange: (row: number, col: number, value: string) => void
}

export default function Board({ board, handleChange }: Props) {
    return (
        <div className="flex flex-col items-center space-y-3">
            <div className="grid grid-cols-9 gap-0">
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const thickTop = r === 0 || r === 3 || r === 6
                        const thickLeft = c === 0 || c === 3 || c === 6
                        const thickRight = c === 2 || c === 5 || c === 8
                        const thickBottom = r === 2 || r === 5 || r === 8

                        const borders = [
                            thickTop && "border-t-4 border-white",
                            thickLeft && "border-l-4 border-white",
                            thickRight && "border-r-4 border-white",
                            thickBottom && "border-b-4 border-white",
                        ]
                            .filter(Boolean)
                            .join(" ")

                        return (
                            <input
                                key={`${r}-${c}`}
                                type="text"
                                value={cell.value ?? ""}
                                onChange={e => handleChange(r, c, e.target.value)}
                                maxLength={1}
                                disabled={cell.isFixed}
                                className={[
                                    "w-15 h-15 text-center text-3xl border border-gray-800 outline-none",
                                    cell.isFixed ? "bg-gray-500" : "bg-gray-700 focus:bg-gray-600",
                                    borders
                                ].join(" ")}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
}