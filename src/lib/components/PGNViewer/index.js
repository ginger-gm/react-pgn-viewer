/* eslint-disable no-plusplus */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import KeyHandler, { KEYDOWN } from 'react-key-handler'
import styled from 'styled-components'
import Chessboard from 'react-chessboardjs-wrapper'

import pgnViewerConfig from './config'
import * as pgnViewerHelpers from './helpers'
import GameHeader from './GameHeader'
import GameText from './GameText'
import GameTextContainer from './GameTextContainer'
import PGNViewerContainer from './PGNViewerContainer'
import GameButtons from './GameButtons'
import UCIEngine from './UCIEngine'
import pgnParser from '../../pgn-parser/pgn-parser'

import './fontAwesomeLib'
import './chessboard-0.3.0.min.css'

const {
  whiteSquareColour, blackSquareColour, border,
} = pgnViewerConfig
const {
  getStartFen, setWhiteSquareColour, setBlackSquareColour, setBorder,
  extendGame, clearSquareHighlights, highlightMove, scrollToTop, scrollToMove,
} = pgnViewerHelpers

const Error = styled.div`
background-color: red;
color: yellow;
padding: 8 px;
`

const EngineContainer = styled.div`
border: 1px solid #f3f3f3;
height: (${props => props.multiPv + 1}) * 21;
overflow-y: scroll;
padding: 0.4em;
width: 100%;
`

class PGNViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      boardHeight: 0,
      boardId: null,
      boardOrientation: 'white',
      error: false,
      games: [], // extended with extra info, these are used in the viewer
      parsedGames: [], // unextended games from pgn data, used in header dropdown
      isEngineEnabled: false,
      isFocused: false,
      isMobile: null,
      isReplayMode: false,
      selectedGameIndex: 0,
      selectedMoveId: null,
    }
    this.containerRef = React.createRef()
  }

  componentDidMount() {
    this._isMounted = true
    window.addEventListener('resize', this.windowResize)
    this.windowResize()
    this.loadPGNData()
  }

  componentDidUpdate(prevProps) {
    const { pgnData } = this.props
    if (pgnData !== prevProps.pgnData) {
      this.loadPGNData()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    window.removeEventListener('resize', this.windowResize)
    this.stopReplay()
  }

  windowResize = () => {
    const isMobile = (window.innerWidth <= 760)
    if (isMobile !== this.state.isMobile) {
      this.setState({ isMobile }, () => this.handleResize())
    }
  }

  loadPGNData = () => {
    const { pgnData } = this.props
    const { selectedGameIndex } = this.state
    try {
      this.setState({
        games: [],
        parsedGames: [],
      })
      // trim removes some errors with weird invisible characters
      // e.g. /blog/sokolov-explains-middlegame-pawn-structures
      const games = pgnParser.parse(pgnData.trim())
      this.setState({
        games: games.map(() => null),
        parsedGames: games,
      }, () => {
        if (games.length) {
          this.handleGameSelect({ target: { value: selectedGameIndex } })
        }
      })
    } catch (e) {
      // console.log(e)
      // console.log(JSON.stringify(pgnData))
      if (this._isMounted) {
        this.setState({ error: e })
      }
    }
  }

  getPreviousMove = move => {
    const { games, selectedGameIndex, selectedMoveId } = this.state
    const { flattenedMoves } = games[selectedGameIndex]

    const variationMoves = flattenedMoves.filter(m => m.variationId === move.variationId)
    const currentMoveIndex = variationMoves.findIndex(m => m.moveId === selectedMoveId)

    let previousMove
    if (currentMoveIndex === 0) {
    // first move of variation
      const { parentVariationId } = variationMoves[currentMoveIndex]
      // first move of game
      if (!parentVariationId) {
        this.handleGotoStart()

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

  startReplay = () => {
    this.setState({
      isReplayMode: true,
    }, () => {
      this._replayTimer = setInterval(() => this.handleNextMove(false), 1000)
    })
  }

  stopReplay = () => {
    this.setState({
      isReplayMode: false,
    }, () => {
      clearInterval(this._replayTimer)
    })
  }

  setFocused = value => {
    this.setState({ isFocused: value })
  }

  handleGameSelect = ({ target: { value } }) => {
    this.stopReplay()

    const { games, parsedGames } = this.state
    let game = games[value]
    if (!game) { // already extended
      game = extendGame(parsedGames[value])
    }

    if (this._isMounted) {
      this.setState(state => ({
        games: [
          ...state.games.slice(0, value),
          game,
          ...state.games.slice(value + 1),
        ],
        selectedMoveId: null,
        selectedGameIndex: value,
      }), () => {
        if (this._board) { // on first render, board not initialised yet.
          const { boardId } = this.state
          clearSquareHighlights(boardId)
          this.handleGotoStart()
        }
      })
    }
  }

  handleGotoEnd = () => {
    this.stopReplay()

    const { boardId, games, selectedGameIndex } = this.state
    const game = games[selectedGameIndex]
    const { moves } = game

    const lastMove = moves[moves.length - 1]

    if (this._isMounted) {
      this.setState({
        selectedMoveId: lastMove.moveId,
      })
    }
    this._board.position(lastMove.fenAfter)
    highlightMove(boardId, lastMove)
    scrollToMove(boardId, lastMove.moveId)
  }

  handleGotoStart = () => {
    this.stopReplay()

    const { boardId, games, selectedGameIndex } = this.state
    const game = games[selectedGameIndex]

    if (this._isMounted) {
      this.setState({
        selectedMoveId: null,
      })
    }
    this._board.position(getStartFen(game))
    clearSquareHighlights(boardId)
    scrollToTop(boardId)
  }

  handleInitBoard = (board, boardId) => {
    this._board = board
    const boardHeight = document.getElementById(`boardContainer-${boardId}`).offsetHeight
    this.setState({ boardId, boardHeight }, () => {
      const { games, selectedGameIndex } = this.state
      const game = games[selectedGameIndex]
      this._board.position(getStartFen(game))
    })
  }

  handleResize = () => {
    const { boardId } = this.state
    if (!boardId) return
    const el = document.getElementById(`boardContainer-${boardId}`)
    if (!el) return
    const w = el.offsetWidth
    if (this._isMounted) {
      this.setState({ boardHeight: w })
    }

    // Manually resize the board, as react-chessboardjs-wrapper
    // resizing isn't working when they layout changes
    this._board.resize()
    setWhiteSquareColour(boardId, whiteSquareColour, blackSquareColour)
    setBlackSquareColour(boardId, whiteSquareColour, blackSquareColour)
    setBorder(boardId, border)
  }

  handleNextMove = (stopReplayMode = true) => {
    if (stopReplayMode) this.stopReplay()

    const {
      boardId, games, selectedGameIndex, selectedMoveId,
    } = this.state
    const { flattenedMoves } = games[selectedGameIndex]

    const currentMove = selectedMoveId
      ? flattenedMoves.find(m => m.moveId === selectedMoveId)
      : flattenedMoves[0]
    const variationMoves = flattenedMoves.filter(m => m.variationId === currentMove.variationId)

    const currentMoveIndex = variationMoves.findIndex(m => m.moveId === selectedMoveId)
    if (currentMoveIndex === variationMoves.length - 1) return // end of variation

    const nextMove = variationMoves[currentMoveIndex + 1]

    if (this._isMounted) {
      this.setState({
        selectedMoveId: nextMove.moveId,
      })
    }
    this._board.position(nextMove.fenAfter)
    highlightMove(boardId, nextMove)
    scrollToMove(boardId, nextMove.moveId)
  }

  handlePreviousMove = () => {
    this.stopReplay()

    const {
      boardId, games, selectedGameIndex, selectedMoveId,
    } = this.state
    const { flattenedMoves } = games[selectedGameIndex]

    const currentMove = selectedMoveId
      ? flattenedMoves.find(m => m.moveId === selectedMoveId)
      : flattenedMoves[0]

    const previousMove = this.getPreviousMove(currentMove)
    if (!previousMove) return

    if (this._isMounted) {
      this.setState({
        selectedMoveId: previousMove.moveId,
      })
    }
    this._board.position(previousMove.fenAfter)
    highlightMove(boardId, previousMove)
    scrollToMove(boardId, previousMove.moveId)
  }

  handleReplay = () => {
    const { isReplayMode } = this.state
    if (isReplayMode) {
      this.stopReplay()
    } else {
      this.startReplay()
    }
  }

  handleToggleOrientation = () => {
    if (this._isMounted) {
      this.setState(state => ({
        boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
      }))
    }
  }

  handleToggleEngine = () => {
    if (this._isMounted) {
      this.setState(state => ({
        isEngineEnabled: !state.isEngineEnabled,
      }))
    }
  }

  handleMoveClick = moveId => {
    const { boardId, games, selectedGameIndex } = this.state

    const { flattenedMoves } = games[selectedGameIndex]
    const move = flattenedMoves.find(m => m.moveId === moveId)
    this._board.position(move.fenAfter)

    if (this._isMounted) {
      this.setState({
        selectedMoveId: move.moveId,
      })
    }
    highlightMove(boardId, move)
  }

  render() {
    const {
      error, games, isFocused, selectedGameIndex, isEngineEnabled, boardHeight, isMobile,
    } = this.state
    if (error) {
      return (
        <Error>
          Could not render PGN viewer: error parsing PGN data.
        </Error>
      )
    }
    const game = games[selectedGameIndex]

    // we're good to go
    const { gameSelectHeader, showGameHeader, pieceTheme } = this.props
    const {
      boardOrientation, isReplayMode, selectedMoveId, boardId, parsedGames,
    } = this.state

    const gameOptions = parsedGames.map((g, i) => {
      const { headers } = g
      if (headers.White === '?') delete headers.White
      if (headers.Black === '?') delete headers.Black
      if (headers.Event === '?') delete headers.Event
      if (headers.Site === '?') delete headers.Site
      if (headers.Round === '?') delete headers.Round
      if (headers.Result === '?') delete headers.Result
      if (headers.Result === '*') delete headers.Result
      if (headers.Date === '?') delete headers.Date
      if (headers.Date === '????.??.??') delete headers.Date

      let text = `${headers.White}`
      if (headers.Black) text = `${text} - ${headers.Black}`
      if (headers.Event) text = `${text} (${headers.Event}_`

      return {
        key: i,
        value: i,
        text,
      }
    })

    // get board position
    let fen = null
    let sideToMove
    if (game) {
      const { flattenedMoves } = game
      if (selectedMoveId) {
        const move = flattenedMoves.find(m => m.moveId === selectedMoveId)
        fen = move.fenAfter
      } else {
        fen = getStartFen(game)
      }
      const fenParts = fen.split(' ')
      sideToMove = fenParts[1] // eslint-disable-line
    }

    const multiPv = 2

    return (
      <>
        {games.length > 1 && (
          <>
            {gameSelectHeader}
            <select
              onChange={this.handleGameSelect}
              value={selectedGameIndex}
            >
              {gameOptions.map(o => (
                <option key={o.value} value={o.value}>{o.text}</option>
              ))}
            </select>
          </>
        )}
        <div
          onClick={() => this.setFocused(true)}
          onKeyPress={() => this.setFocused(true)}
          onBlur={() => this.setFocused(false)}
          onFocus={() => this.setFocused(true)}
          role="link"
          tabIndex={0}
        >
          <KeyHandler
            keyEventName={KEYDOWN}
            keyValue="ArrowRight"
            onKeyHandle={e => {
              if (!isFocused) return
              e.preventDefault()
              this.handleNextMove()
            }}
          />
          <KeyHandler
            keyEventName={KEYDOWN}
            keyValue="ArrowLeft"
            onKeyHandle={e => {
              if (!isFocused) return
              e.preventDefault()
              this.handlePreviousMove()
            }}
          />
          <KeyHandler
            keyEventName={KEYDOWN}
            keyValue="ArrowUp"
            onKeyHandle={e => {
              if (!isFocused) return
              e.preventDefault()
              this.handleGotoStart()
            }}
          />
          <KeyHandler
            keyEventName={KEYDOWN}
            keyValue="ArrowDown"
            onKeyHandle={e => {
              if (!isFocused) return
              e.preventDefault()
              this.handleGotoEnd()
            }}
          />
          <PGNViewerContainer ref={this.containerRef}>
            {showGameHeader && game && <GameHeader headers={game.headers} />}
            <div style={{ display: 'flex', width: '100%' }}>
              <Chessboard
                animate
                blackSquareColour={blackSquareColour}
                border={border}
                config={{
                  draggable: false,
                  orientation: boardOrientation,
                  pieceTheme,
                  showNotation: false,
                }}
                onInitBoard={this.handleInitBoard}
                resize
                whiteSquareColour={whiteSquareColour}
                width={isMobile ? 336 : 408}
              />
              {(!boardId || !game) && 'loading...'}
              {!isMobile && (
                <GameTextContainer>
                  {(boardId && game) ? (
                    <GameText
                      boardId={boardId}
                      handleMoveClick={this.handleMoveClick}
                      height={boardHeight}
                      moves={game.moves}
                      selectedMoveId={selectedMoveId}
                      result={game.headers.Result}
                    />
                  ) : (
                    'loading...'
                  )}
                </GameTextContainer>
              )}
            </div>
            <div>
              {fen && isEngineEnabled
              && (
              <UCIEngine
                // debug
                fen={fen}
                multiPv={multiPv}
                workerPath="/js/stockfish.js"
                render={state => (
                  <EngineContainer multiPv={multiPv}>
                    <ul size="tiny">
                      {state.info !== '' ? (
                        <li>
                          {state.info}
                          {' '}
                          (web worker)
                        </li>
                      ) : (
                        '...'
                      )}
                      {(state.status === 'working' || state.status === 'mate') && state.pvs.map((pv, i) => {
                        let score
                        if (Number(parseFloat(pv.score)) === parseFloat(pv.score)) {
                          score = (sideToMove === 'w' ? pv.score : pv.score * -1)
                        } else {
                          score = pv.score // eslint-disable-line
                        }

                        return (
                          <li key={i}>
                            <strong>{score}</strong>
                            {' '}
                            {pv.moves}
                          </li>
                        )
                      })}
                      {!(state.status === 'working' || state.status === 'mate') && (
                        'working...'
                      )}
                    </ul>
                  </EngineContainer>
                )}
              />
              )}
              <GameButtons
                handleGotoEnd={this.handleGotoEnd}
                handleGotoStart={this.handleGotoStart}
                handleNextMove={this.handleNextMove}
                handlePreviousMove={this.handlePreviousMove}
                handleReplay={this.handleReplay}
                handleToggleOrientation={this.handleToggleOrientation}
                handleToggleEngine={this.handleToggleEngine}
                isEngineEnabled={isEngineEnabled}
                isReplayMode={isReplayMode}
                isMobile={isMobile}
              />
              {isMobile && (
                <GameTextContainer>
                  {(boardId && game) ? (
                    <GameText
                      boardId={boardId}
                      handleMoveClick={this.handleMoveClick}
                      height={boardHeight}
                      moves={game.moves}
                      selectedMoveId={selectedMoveId}
                      result={game.headers.Result}
                      width={this.containerRef.current.offsetWidth - boardHeight}
                    />
                  ) : (
                    'loading...'
                  )}
                </GameTextContainer>
              )}
            </div>
          </PGNViewerContainer>
        </div>
      </>
    )
  }
}

PGNViewer.propTypes = {
  // containerWidth: PropTypes.number.isRequired,
  gameSelectHeader: PropTypes.any,
  pieceTheme: PropTypes.string.isRequired,
  pgnData: PropTypes.string.isRequired,
  showGameHeader: PropTypes.bool,
}
PGNViewer.defaultProps = {
  gameSelectHeader: null,
  showGameHeader: true,
}

export default PGNViewer
