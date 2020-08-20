import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Move from './Move'
import Comment from './Comment'
import GameResult from './GameResult'

const Container = styled.span`
background-color: ${props => (props.isMainline ? null : '#f3f3f3')};
display: ${props => (props.depth > 1 ? 'inline' : 'block')};
margin-top: 0.4rem;
margin-bottom: 0.4rem;
padding-left: ${props => (props.isMainline ? null : '0.2rem')};
padding-right: ${props => (props.isMainline ? null : '0.2rem')};
`

const Variation = ({
  selectedMoveId, depth, moves, handleMoveClick, result, boardId,
  showVariations, hideCommentBeforeFirstMove,
}) => {
  const isMainline = depth === 0

  return (
    <Container isMainline={isMainline} depth={depth}>
      {!isMainline && '('}
      {moves.map((m, i) => {
        if (!m.move) return null
        const fenParts = m.fenBefore.split(' ')
        const sideToMove = fenParts[1]
        const moveNumber = fenParts[5]

        const showMoveNumber = sideToMove === 'w' // white moves
          || i === 0 // first move in variation
          || !!m.commentBefore // comment before move
          || (i > 0 && !!moves[i - 1].commentAfter)// comment after previous move
          || (i > 0 && !!moves[i - 1].ravs) // first move after a variation

        const isLastMove = i === moves.length - 1

        return (
          <React.Fragment key={m.moveId}>
            <span>
              {!hideCommentBeforeFirstMove && showVariations && m.commentBefore && (
              <Comment
                comment={m.commentBefore}
                isMainline={isMainline}
              />
              )}
              <Move
                handleMoveClick={handleMoveClick}
                isActive={selectedMoveId === m.moveId}
                isMainline={isMainline}
                move={m.move}
                moveId={m.moveId}
                moveNumber={showMoveNumber ? moveNumber : null}
                nags={m.nags}
                sideToMove={sideToMove}
              />
              {isMainline && isLastMove && result && <GameResult result={result} />}
              {showVariations && m.commentAfter && (
              <Comment
                isMainline={isMainline}
                comment={m.commentAfter}
              />
              )}
            </span>
            {showVariations && m.ravs && m.ravs.map(r => (
              <Variation
                key={`${r[0].move}`}
                boardId={boardId}
                depth={depth + 1}
                handleMoveClick={handleMoveClick}
                moves={r}
                selectedMoveId={selectedMoveId}
              />
            ))}
          </React.Fragment>
        )
      })}
      {!isMainline && ')'}
    </Container>
  )
}

Variation.propTypes = {
  boardId: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  handleMoveClick: PropTypes.func.isRequired,
  hideCommentBeforeFirstMove: PropTypes.bool,
  moves: PropTypes.arrayOf(PropTypes.object).isRequired,
  result: PropTypes.string,
  selectedMoveId: PropTypes.string,
  showVariations: PropTypes.bool,
}
Variation.defaultProps = {
  hideCommentBeforeFirstMove: false,
  result: null,
  selectedMoveId: null,
  showVariations: true,
}

export default Variation
