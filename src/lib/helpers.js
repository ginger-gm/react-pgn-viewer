import Chess from 'chess.js'
import short from 'short-uuid'
import Scroll from 'react-scroll'

const scroll = Scroll.scroller

const translator = short()

export const getStartFen = game => (Object.keys(game.headers).includes('SetUp') && Object.keys(game.headers).includes('FEN')
  ? game.headers.FEN
// note the below must be the full fen string and not 'start',
// as it is used in the Move component to retrieve side to move info etc.
  : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

const extendMoves = (startFen, moves, variationId, parentVariationId) => {
  const c = new Chess(startFen)

  return moves.filter(m => !!m.move).map(m => {
    const fenBefore = c.fen()
    const result = c.move(m.move, { sloppy: true })
    if (!result) {
      throw new Error(`extendMoves error: ${m.move}`)
    }
    const fenAfter = c.fen()

    const ravs = m.ravs
      ? m.ravs.map(r => extendMoves(
        fenBefore,
        r.moves,
        translator.new(),
        variationId,
      ))
      : null

    return {
      ...m,
      ...result,
      moveId: translator.new(),
      variationId,
      parentVariationId,
      ravs,
      fenBefore,
      fenAfter,
    }
  })
}

const flattenMoves = moves => {
  const flattenedMoves = []
  const flattenHelper = movesArray => {
    flattenedMoves.push(...movesArray)
    movesArray.forEach(m => {
      if (m.ravs) {
        m.ravs.forEach(r => flattenHelper(r))
      }
    })
  }
  flattenHelper(moves)

  return flattenedMoves
}

export const extendGame = g => {
  const fen = getStartFen(g)
  const extendedMoves = extendMoves(fen, g.moves, translator.new(), null)
  if (!extendedMoves) return g // error parsing
  const filteredExtendedMoves = extendedMoves
    .filter(m => !!m.move)
  const game = {
    ...g,
    moves: filteredExtendedMoves,
    flattenedMoves: flattenMoves(filteredExtendedMoves),
  }

  return game
}

export const clearSquareHighlights = boardId => {
  if (!window.$) return
  window.$(`#board-${boardId} .square-55d63`)
    .css({ 'box-shadow': '' }) // last move highlights
    .removeClass('highlightSquare') // Hints, used in multiple choice puzzle
}

export const highlightSquares = (boardId, squares) => {
  if (!window.$) return
  clearSquareHighlights(boardId)
  squares.forEach(s => {
    window.$(`#board-${boardId} .square-${s}`)
      .css({ 'box-shadow': 'inset 0 0 0 2px yellow' })
  })
}

export const highlightMove = (boardId, move) => {
  const c = new Chess(move.fenBefore)
  const result = c.move(move.move, { sloppy: true })
  if (!result) return
  clearSquareHighlights(boardId)
  highlightSquares(boardId, [result.from, result.to])
}

export const scrollToTop = boardId => {
  const containerEl = document.getElementById(`GameText-${boardId}`)
  if (!containerEl) return

  containerEl.scrollTo({ top: 0 })
}

export const scrollToMove = (boardId, moveId) => {
  scroll.scrollTo(`move-${moveId}`, {
    duration: 800,
    delay: 50,
    smooth: true,
    containerId: `GameText-${boardId}`,
    offset: 0,
  })
}
