import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Element } from 'react-scroll'
import omit from 'lodash/omit'

import Variation from './Variation'

const Container = styled(props => <Element {...omit(props, ['height', 'width'])} />)`
box-sizing: border-box;
height: ${props => props.height}px;
overflow-y: auto;
overflow-wrap: break-word;
padding-left: 0.4em;
position: relative;
word-break: break-word;
`

const GameText = ({
  selectedMoveId, moves, result, handleMoveClick, boardId, height,
}) => (
  <Container id={`GameText-${boardId}`} height={height}>
    <Variation
      boardId={boardId}
      selectedMoveId={selectedMoveId}
      handleMoveClick={handleMoveClick}
      depth={0}
      moves={moves}
      result={result}
    />
  </Container>
)

GameText.propTypes = {
  boardId: PropTypes.string.isRequired,
  handleMoveClick: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  moves: PropTypes.arrayOf(PropTypes.object).isRequired,
  result: PropTypes.string,
  selectedMoveId: PropTypes.string,
}
GameText.defaultProps = {
  result: '*',
  selectedMoveId: null,
}

export default GameText
