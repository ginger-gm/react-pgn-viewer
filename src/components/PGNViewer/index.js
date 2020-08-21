/* eslint-disable no-console */
import React from 'react'
import PropTypes from 'prop-types'
import KeyHandler, { KEYDOWN } from 'react-key-handler'
import Chessboard from 'react-chessboardjs-wrapper'
import ReactResizeDetector from 'react-resize-detector'
import styled from 'styled-components'

import reducer, { actions, initialState } from './reducer'
import GameSelect from '../GameSelect'
import GameButtons from '../GameButtons'
import * as h from '../../lib/helpers'
import GameHeader from '../GameHeader'
import GameText from '../GameText'
import UCIEngine from '../UCIEngine'
import pgnParser from '../../lib/pgn-parser/pgn-parser'
import useInterval from '../../lib/useInterval'

import '../../lib/fontAwesomeLib'

const {
  SET_BOARD_HEIGHT,
  SELECT_GAME,
  SET_ERROR,
  SET_FOCUSED,
  SET_GAMES,
  SET_MOBILE,
  SET_REPLAY_DELAY,
  SET_SELECTED_MOVE_ID,
  TOGGLE_ENGINE,
  TOGGLE_ORIENTATION,
} = actions

const PGNViewer = ({
  enginePath, pgnData, pieceTheme, opts,
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const boardIdRef = React.useRef(null)
  const boardRef = React.useRef(null)
  const buttonsRef = React.useRef(null)
  const containerRef = React.useRef(null)

  /* eslint-disable no-param-reassign */
  if (opts.blackSquareColour === undefined) opts.blackSquareColour = '#b85649'
  if (opts.border === undefined) opts.border = 'none'
  if (opts.mobileBreakpoint === undefined) opts.mobileBreakpoint = 600
  if (opts.showGameHeader === undefined) opts.showGameHeader = true
  if (opts.showNotation === undefined) opts.showNotation = false
  if (opts.whiteSquareColour === undefined) opts.whiteSquareColour = '#efd8c0'
  /* eslint-enable no-param-reassign */

  const {
    boardHeight, error, games, isLoading, replayDelay, selectedGameIndex, selectedMoveId, parsedGames, boardOrientation, isEngineEnabled, isFocused, isMobile,
  } = state
  const game = games[selectedGameIndex]

  React.useEffect(() => {
    const loadPGNData = () => {
      try {
        // trim removes some errors with weird invisible characters
        // e.g. /blog/sokolov-explains-middlegame-pawn-structures
        const parsedGames = pgnParser.parse(pgnData.trim())
        const extendedGames = parsedGames.map(g => h.extendGame(g))
        dispatch({ type: SET_GAMES, payload: { parsedGames, extendedGames } })
      } catch (e) {
        dispatch({ type: SET_ERROR, payload: 'Error parsing PGN data.' })
      }
    }

    loadPGNData()
  }, [])

  React.useEffect(() => {
    if (isLoading || selectedGameIndex === null) return
    boardRef.current.position(h.getStartFen(game))
  }, [selectedGameIndex])

  const handleResize = () => {
    // '.board-b72b1' is a magic classname from chessboard.js. We have jQuery, so might as well use it.
    const width = window.$(`#board-${boardIdRef.current}`).find('.board-b72b1').width()
    dispatch({
      type: SET_BOARD_HEIGHT,
      payload: width,
    })
    if (!containerRef.current) return
    dispatch({
      type: SET_MOBILE,
      payload: containerRef.current.offsetWidth < opts.mobileBreakpoint,
    })
  }

  React.useEffect(() => {
    if (!boardRef.current) return
    boardRef.current.resize()
    // After a board redraw, the following need resetting:
    h.setWhiteSquareColour(boardIdRef.current, opts.whiteSquareColour, opts.blackSquareColour)
    h.setBlackSquareColour(boardIdRef.current, opts.whiteSquareColour, opts.blackSquareColour)
    h.setBorder(boardIdRef.current, opts.border)
  }, [isMobile])

  const handleInitBoard = (board, boardId) => {
    boardIdRef.current = boardId
    boardRef.current = board
    handleResize()
    dispatch({ type: SELECT_GAME, payload: 0 })
  }

  const handleGameChange = e => {
    dispatch({ type: SELECT_GAME, payload: parseInt(e.target.value, 10) })
    h.clearSquareHighlights(boardIdRef.current)
  }

  const handleToggleOrientation = () => {
    dispatch({ type: TOGGLE_ORIENTATION })
  }

  const gotoNextMove = () => {
    const { games, selectedGameIndex, selectedMoveId } = state
    const { flattenedMoves } = games[selectedGameIndex]

    const currentMove = selectedMoveId
      ? flattenedMoves.find(m => m.moveId === selectedMoveId)
      : flattenedMoves[0]
    const variationMoves = flattenedMoves.filter(m => m.variationId === currentMove.variationId)

    const currentMoveIndex = variationMoves.findIndex(m => m.moveId === selectedMoveId)
    if (currentMoveIndex === variationMoves.length - 1) {
      // end of variatio
      dispatch({ type: SET_REPLAY_DELAY, payload: null })

      return
    }

    const nextMove = variationMoves[currentMoveIndex + 1]

    dispatch({ type: SET_SELECTED_MOVE_ID, payload: nextMove.moveId })
    boardRef.current.position(nextMove.fenAfter)
    h.highlightMove(boardIdRef.current, nextMove)
    h.scrollToMove(boardIdRef.current, nextMove.moveId)
  }

  const gotoEnd = () => {
    const { games, selectedGameIndex } = state
    const game = games[selectedGameIndex]
    const { moves } = game

    const lastMove = moves[moves.length - 1]
    if (!lastMove) {
      return
    }

    dispatch({ type: SET_SELECTED_MOVE_ID, payload: lastMove.moveId })
    boardRef.current.position(lastMove.fenAfter)
    h.highlightMove(boardIdRef.current, lastMove)
    h.scrollToMove(boardIdRef.current, lastMove.moveId)
  }

  const gotoStart = () => {
    const { games, selectedGameIndex } = state
    const game = games[selectedGameIndex]

    dispatch({ type: SET_SELECTED_MOVE_ID, payload: null })
    boardRef.current.position(h.getStartFen(game))
    h.clearSquareHighlights(boardIdRef.current)
    h.scrollToTop(boardIdRef.current)
  }

  const getPreviousMove = move => {
    const { games, selectedGameIndex, selectedMoveId } = state
    const { flattenedMoves } = games[selectedGameIndex]

    const variationMoves = flattenedMoves.filter(m => m.variationId === move.variationId)
    const currentMoveIndex = variationMoves.findIndex(m => m.moveId === selectedMoveId)

    let previousMove
    if (currentMoveIndex === 0) {
    // first move of variation
      const { parentVariationId } = variationMoves[currentMoveIndex]
      // first move of game
      if (!parentVariationId) {
        gotoStart()

        return
      }
      const parentVariationMoves = flattenedMoves.filter(m => m.variationId === parentVariationId)
      // find previous move in parent variation
      const previousMovePlusOneIndex = parentVariationMoves
        .findIndex(m => (m.ravs && m.ravs.find(r => r.find(rr => rr.moveId === selectedMoveId))))
      if (!previousMovePlusOneIndex) return
      previousMove = parentVariationMoves[previousMovePlusOneIndex - 1]
    } else {
      previousMove = variationMoves[currentMoveIndex - 1]
    }
    if (!previousMove) return null

    return previousMove
  }

  const gotoPreviousMove = () => {
    const {
      games, selectedGameIndex, selectedMoveId,
    } = state
    const { flattenedMoves } = games[selectedGameIndex]

    const currentMove = selectedMoveId
      ? flattenedMoves.find(m => m.moveId === selectedMoveId)
      : flattenedMoves[0]

    const previousMove = getPreviousMove(currentMove)
    if (!previousMove) return

    dispatch({ type: SET_SELECTED_MOVE_ID, payload: previousMove.moveId })
    boardRef.current.position(previousMove.fenAfter)
    h.highlightMove(boardIdRef.current, previousMove)
    h.scrollToMove(boardIdRef.current, previousMove.moveId)
  }

  useInterval(gotoNextMove, replayDelay)
  const handleReplay = () => {
    if (replayDelay) {
      dispatch({ type: SET_REPLAY_DELAY, payload: null })
    } else {
      dispatch({ type: SET_REPLAY_DELAY, payload: 1000 })
    }
  }

  const handleNextMove = () => {
    dispatch({ type: SET_REPLAY_DELAY, payload: null })
    gotoNextMove()
  }

  const handlePreviousMove = () => {
    dispatch({ type: SET_REPLAY_DELAY, payload: null })
    gotoPreviousMove()
  }

  const handleGotoStart = () => {
    dispatch({ type: SET_REPLAY_DELAY, payload: null })
    gotoStart()
  }

  const handleGotoEnd = () => {
    dispatch({ type: SET_REPLAY_DELAY, payload: null })
    gotoEnd()
  }

  const handleMoveClick = moveId => {
    const { games, selectedGameIndex } = state

    const { flattenedMoves } = games[selectedGameIndex]
    const move = flattenedMoves.find(m => m.moveId === moveId)
    boardRef.current.position(move.fenAfter)

    dispatch({ type: SET_SELECTED_MOVE_ID, payload: move.moveId })
    h.highlightMove(boardIdRef.current, move)
  }

  const handleToggleEngine = () => {
    dispatch({ type: TOGGLE_ENGINE })
  }

  const setFocused = value => {
    dispatch({ type: SET_FOCUSED, payload: value })
  }

  // Check for dependencies
  if (!window.$) {
    return <div>jQuery not found on page.</div>
  }
  if (!window.ChessBoard) {
    return <div>Chessboard.js not found on page.</div>
  }

  if (isLoading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  // get board position
  let fen = null
  let sideToMove
  if (game) {
    const { flattenedMoves } = game
    if (selectedMoveId) {
      const move = flattenedMoves.find(m => m.moveId === selectedMoveId)
      fen = move.fenAfter
    } else {
      fen = h.getStartFen(game)
    }
    const fenParts = fen.split(' ')
      sideToMove = fenParts[1] // eslint-disable-line
  }

  return (
    <div
      className="ggm-pgn-viewer"
      onClick={() => setFocused(true)}
      onKeyPress={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      ref={containerRef}
      role="link"
      tabIndex={0}
    >
      <KeyHandler
        keyEventName={KEYDOWN}
        keyValue="ArrowRight"
        onKeyHandle={e => {
          if (!isFocused) return
          e.preventDefault()
          gotoNextMove()
        }}
      />
      <KeyHandler
        keyEventName={KEYDOWN}
        keyValue="ArrowLeft"
        onKeyHandle={e => {
          if (!isFocused) return
          e.preventDefault()
          gotoPreviousMove()
        }}
      />
      <KeyHandler
        keyEventName={KEYDOWN}
        keyValue="ArrowUp"
        onKeyHandle={e => {
          if (!isFocused) return
          e.preventDefault()
          gotoStart()
        }}
      />
      <KeyHandler
        keyEventName={KEYDOWN}
        keyValue="ArrowDown"
        onKeyHandle={e => {
          if (!isFocused) return
          e.preventDefault()
          gotoEnd()
        }}
      />
      {game && games.length > 1 && (
        <div style={{ marginBottom: '0.2rem' }}>
          <GameSelect
            handleChange={handleGameChange}
            parsedGames={parsedGames}
            value={selectedGameIndex}
          />
        </div>
      )}
      {game && games.length === 1 && opts.showGameHeader && (
        <GameHeader
          headers={game.headers}
          width={isMobile ? boardHeight : containerRef.current.offsetWidth}
        />
      )}
      <ReactResizeDetector handleWidth handleHeight onResize={handleResize} />
      <div style={{ display: 'flex' }}>
        <div style={{ width: isMobile ? '100%' : '60%' }}>
          <Chessboard
            animate
            blackSquareColour={opts.blackSquareColour}
            border={opts.border}
            config={{
              draggable: false,
              orientation: boardOrientation,
              pieceTheme,
              showNotation: opts.showNotation,
            }}
            onInitBoard={handleInitBoard}
            resize
            whiteSquareColour={opts.whiteSquareColour}
            width="100%"
          />
          {boardIdRef.current && (
            <GameButtons
              ref={buttonsRef}
              handlers={{
                handleGotoEnd,
                handleGotoStart,
                handleNextMove,
                handlePreviousMove,
                handleReplay,
                handleToggleEngine,
                handleToggleOrientation,
              }}
              showEngineButton={!!enginePath}
              isReplayMode={!!replayDelay}
              width={boardHeight}
            />
          )}
          {enginePath && isEngineEnabled && (
          <UCIEngine
            // debug
            fen={fen}
            multiPv={2}
            workerPath={enginePath}
            render={({ info, status, pvs }) => (
              <EngineContainer multiPv={2} width={boardHeight}>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {info !== '' ? (
                    <li>
                      {info}
                      {' '}
                      (web worker)
                    </li>
                  ) : (
                    '...'
                  )}
                  {(status === 'working' || status === 'mate') && pvs.map((pv, i) => {
                    let score
                    if (Number(parseFloat(pv.score)) === parseFloat(pv.score)) {
                      score = (sideToMove === 'w' ? pv.score : pv.score * -1)
                    } else {
                           score = pv.score  // eslint-disable-line
                    }

                    /* eslint-disable react/no-array-index-key */
                    return (
                      <li key={i} style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        <strong>{score}</strong>
                        {' '}
                        {pv.moves}
                      </li>
                    )
                    /* eslint-enable react/no-array-index-key */
                  })}
                  {!(status === 'working' || status === 'mate') && (
                    'working...'
                  )}
                </ul>
              </EngineContainer>
            )}
          />
          )}
          {isMobile && game && buttonsRef.current && (
            <div style={{ margin: '0.2rem 0' }}>
              <GameText
                boardId={boardIdRef.current}
                handleMoveClick={handleMoveClick}
                height={isMobile ? boardHeight / 2 : boardHeight + buttonsRef.current.offsetHeight}
                moves={game.moves}
                selectedMoveId={selectedMoveId}
                result={game.headers.Result}
              />
            </div>
          )}
          <MadeBy />
        </div>
        {!isMobile && (
          <div style={{ width: '40%' }}>
            {game && buttonsRef.current && (
            <GameText
              boardId={boardIdRef.current}
              handleMoveClick={handleMoveClick}
              height={boardHeight + buttonsRef.current.offsetHeight}
              moves={game.moves}
              selectedMoveId={selectedMoveId}
              result={game.headers.Result}
            />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const EngineContainer = styled.div`
border: 1px solid #f3f3f3;
box-sizing: border-box;
height: (${props => props.multiPv + 1}) * 21;
overflow-y: scroll;
padding: 0.4em;
width: ${props => props.width}px;
`

const MadeBy = () => (
  <pre style={{ fontSize: 'small', margin: 0 }}>
    Made by
    {' '}
    <a href="https://gingergm.com" target="_blank" rel="noreferrer">GingerGM</a>
    .
  </pre>
)

PGNViewer.propTypes = {
  enginePath: PropTypes.string,
  opts: PropTypes.shape({
    border: PropTypes.string,
    blackSquareColour: PropTypes.string,
    mobileBreakpoint: PropTypes.number,
    showGameHeader: PropTypes.bool,
    showNotation: PropTypes.bool,
    whiteSquareColour: PropTypes.string,
  }),
  pieceTheme: PropTypes.string.isRequired,
  pgnData: PropTypes.string.isRequired,
}

PGNViewer.defaultProps = {
  enginePath: null,
  opts: {},
}

export default PGNViewer
