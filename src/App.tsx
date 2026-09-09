import { useMemo, useState } from 'react'
import './App.css'

type Player = 'you' | 'rival'

const ladders: Record<number, number> = { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 62: 81, 74: 92 }
const snakes: Record<number, number> = { 27: 5, 40: 3, 43: 18, 54: 31, 66: 45, 76: 58, 89: 53, 99: 41 }

const getBoardNumber = (row: number, column: number) => {
  const base = 100 - row * 10
  return row % 2 === 0 ? base - column : base - 9 + column
}

const getSquarePosition = (square: number) => {
  const rowFromBottom = Math.floor((square - 1) / 10)
  const column = (square - 1) % 10
  return { x: (rowFromBottom % 2 === 0 ? column : 9 - column) * 10 + 5, y: (9 - rowFromBottom) * 10 + 5 }
}

function App() {
  const [positions, setPositions] = useState<Record<Player, number>>({ you: 1, rival: 1 })
  const [turn, setTurn] = useState<Player>('you')
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [message, setMessage] = useState('Roll the dice to make your first move.')
  const [winner, setWinner] = useState<Player | null>(null)
  const board = useMemo(() => Array.from({ length: 100 }, (_, index) => index + 1), [])

  const movePlayer = (player: Player) => {
    if (winner) return
    const roll = Math.floor(Math.random() * 6) + 1
    const current = positions[player]
    const attempted = current + roll
    const landed = attempted <= 100 ? attempted : current
    const next = ladders[landed] ?? snakes[landed] ?? landed
    const playerName = player === 'you' ? 'You' : 'Rival'
    let nextMessage = `${playerName} rolled ${roll} and moved to ${next}.`

    if (attempted > 100) nextMessage = `${playerName} rolled ${roll}; exact roll needed to reach 100.`
    else if (ladders[landed]) nextMessage = `${playerName} found a ladder and climbed to ${next}!`
    else if (snakes[landed]) nextMessage = `${playerName} met a snake and slid to ${next}.`

    const updated = { ...positions, [player]: next }
    setPositions(updated)
    setLastRoll(roll)
    if (next === 100) {
      setWinner(player)
      setMessage(`${playerName} reached 100 and won the game!`)
      return
    }
    setTurn(player === 'you' ? 'rival' : 'you')
    setMessage(nextMessage)
  }

  const resetGame = () => {
    setPositions({ you: 1, rival: 1 })
    setTurn('you')
    setLastRoll(null)
    setWinner(null)
    setMessage('Roll the dice to make your first move.')
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">S<span>/</span>L</span><div><p className="eyebrow">CLASSIC BOARD GAME</p><h1>Snake <em>&</em> Ladder</h1></div></div>
        <button className="reset-button" type="button" onClick={resetGame}><span aria-hidden="true">↻</span> New game</button>
      </header>

      <section className="game-layout">
        <div className="board-column">
          <div className="board-heading"><div><p className="eyebrow">RACE TO THE TOP</p><h2>Make your move</h2></div><div className="turn-chip"><span className={`turn-dot ${turn}`} /> {winner ? 'Game over' : `${turn === 'you' ? 'Your' : 'Rival’s'} turn`}</div></div>
          <div className="board-wrap"><div className="board">
            {board.map((_, index) => {
              const row = Math.floor(index / 10)
              const column = index % 10
              const number = getBoardNumber(row, column)
              const isLadder = Boolean(ladders[number])
              const isSnake = Boolean(snakes[number])
              return <div className={`square ${(row + column) % 2 === 0 ? 'cream' : 'sage'} ${isLadder ? 'ladder-start' : ''} ${isSnake ? 'snake-start' : ''}`} key={number}><span className="square-number">{number}</span>{isLadder && <span className="square-glyph">↗</span>}{isSnake && <span className="square-glyph snake-glyph">⌁</span>}{positions.you === number && <span className="token you-token" aria-label="Your token">Y</span>}{positions.rival === number && <span className="token rival-token" aria-label="Rival token">R</span>}</div>
            })}
            <svg className="board-lines" viewBox="0 0 100 100" aria-hidden="true">
              {Object.entries(ladders).map(([start, end]) => { const from = getSquarePosition(Number(start)); const to = getSquarePosition(end); return <line className="ladder-line" key={`ladder-${start}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} /> })}
              {Object.entries(snakes).map(([start, end]) => { const from = getSquarePosition(Number(start)); const to = getSquarePosition(end); return <line className="snake-line" key={`snake-${start}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} /> })}
            </svg>
          </div></div>
          <div className="board-legend"><span><i className="legend-swatch ladder-swatch" /> Ladder up</span><span><i className="legend-swatch snake-swatch" /> Snake down</span><span className="exact-rule">Exact roll required for 100</span></div>
        </div>

        <aside className="sidebar">
          <section className="status-card"><p className="eyebrow">MATCH STATUS</p><div className="status-message">{message}</div><div className="dice-area"><div className={`dice ${lastRoll ? 'rolled' : ''}`} aria-label={lastRoll ? `Rolled ${lastRoll}` : 'Dice not rolled'}>{lastRoll ?? '—'}</div><button className="roll-button" type="button" onClick={() => movePlayer(turn)} disabled={Boolean(winner)}>Roll dice <span aria-hidden="true">→</span></button></div></section>
          <section className="players-card"><div className="card-heading"><p className="eyebrow">PLAYERS</p><span>POSITION</span></div><div className={`player-row ${turn === 'you' && !winner ? 'active' : ''}`}><span className="player-name"><i className="player-dot you" /> You</span><strong>{positions.you}</strong></div><div className={`player-row ${turn === 'rival' && !winner ? 'active' : ''}`}><span className="player-name"><i className="player-dot rival" /> Rival</span><strong>{positions.rival}</strong></div></section>
          <section className="rules-card"><p className="eyebrow">HOW TO PLAY</p><p>Climb ladders to get ahead. Watch out for snakes, and land on <strong>100</strong> with an exact roll to win.</p></section>
        </aside>
      </section>
      <footer className="footer-note"><span>01</span><span className="footer-line" /> A little luck goes a long way.</footer>
    </main>
  )
}

export default App
