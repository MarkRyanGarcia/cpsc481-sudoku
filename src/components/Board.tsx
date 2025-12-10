import type { Cell } from "../algorithms/sudoku/types"

type Props = {
    board: Cell[][]
    handleChange: (row: number, col: number, value: string) => void
    activeCell: { r: number, c: number } | null
}

export default function Board({ board, handleChange, activeCell }: Props) {
    return (
        <div className="flex flex-col items-center space-y-5">
            <div className="
                grid grid-cols-9 md:border-[5px] md:border-r-8
                ">
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isActive = activeCell && activeCell.r === r && activeCell.c === c

                        const visualizerClasses = [
                            isActive ? "bg-yellow-600 z-10" : "",
                            isActive ? "animate-pulse" : "",
                        ].join(" ")

                        // All cells get base 1px borders
                        const thinBorders = "border border-gray-400";
                        
                        // Thick borders at 3x3 box boundaries (3px instead of 1px, so 2px extra)
                        // Use negative margin to pull back by the extra 2px
                        const hasThickTop = r % 3 === 0;
                        const hasThickLeft = c % 3 === 0;
                        const hasThickBottom = (r + 1) % 3 === 0;
                        const hasThickRight = (c + 1) % 3 === 0;
                        
                        const thickBorders = [
                            hasThickTop && "border-t-[3px] border-t-white",
                            hasThickLeft && "border-l-[3px] border-l-white",
                            hasThickBottom && "border-b-[3px] border-b-white",
                            hasThickRight && "border-r-[3px] border-r-white",
                        ]
                        .filter(Boolean)
                        .join(" ");
                        
                        // Apply negative margins only where thick borders exist
                        const margins = [
                            hasThickTop && "-mt-[2px]",
                            hasThickLeft && "-ml-[2px]",
                            hasThickBottom && "-mb-[2px]",
                            hasThickRight && "-mr-[2px]",
                        ]
                        .filter(Boolean)
                        .join(" ");


                        return (
                            <input
                                key={`${r}-${c}`}
                                type="text"
                                value={cell.value ?? ""}
                                onChange={e => handleChange(r, c, e.target.value)}
                                maxLength={1}
                                disabled={cell.isFixed}
                                className={[
                                    "w-10 h-10 md:w-16 md:h-16 border text-center text-2xl md:text-3xl bg-gray-700 focus:bg-gray-600 outline-none transition-colors duration-100 box-border",
                                    cell.isFixed && "bg-gray-500",
                                    thinBorders,
                                    thickBorders,
                                    margins,
                                    visualizerClasses,
                                    ].join(" ")}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
}