import './App.css'
import Grid from './components/Grid'

function App() {

    return (
        <div className='m-5 flex flex-col space-y-3 align-center justify-center'>


            <h1 className='text-center text-7xl'>
                Sudoku Solver
            </h1>
            <p className='text-center'>
                Enter your own puzzle or generate a new one, choose an algorithm,
                and watch the solution unfold step-by-step.
            </p>

            <div className='flex flex-col mx-auto w-143'>

                <div className='flex justify-between text-black py-3'>
                    <select className='bg-neutral-300'>
                        <option value="backtracking">Backtracking</option>
                        <option value="human">Human</option>
                    </select>
                    <button className='bg-sky-400'>
                        Reset
                    </button>
                </div>

                <Grid />

                <div className='flex justify-center space-x-10 text-black py-3'>
                    <button className='bg-sky-400 w-50'>
                        Generate Puzzle
                    </button>
                    <button className='bg-green-300 w-50'>
                        Solve
                    </button>
                </div>

            </div>


        </div>
    )
}

export default App
