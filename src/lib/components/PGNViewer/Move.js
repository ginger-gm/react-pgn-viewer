import React from 'react'
import PropTypes from 'prop-types'
import { Element } from 'react-scroll'
import styled from 'styled-components'
import omit from 'lodash/omit'

import MoveNumber from './MoveNumber'
import Nag from './Nag'

const Container = styled(props => <Element {...omit(props, ['isActive', 'isMainline'])} />)`
background: ${props => (props.isActive ? '#fff35f' : null)};
cursor: pointer;
display: inline-block;
font-size: ${props => (props.isMainline ? '1.16rem' : '1rem')};
font-weight: ${props => (props.isMainline ? 700 : 400)};
line-height: ${props => (props.isMainline ? '1.46em' : '1.43em')};
margin-right: ${props => (props.isMainline ? '0.3rem' : '0.2rem')};
padding: ${props => (props.isMainline ? '0.1rem' : null)};
//text-decoration: underline;
`

const Move = ({
  move, moveNumber, sideToMove, isMainline,
  isActive, handleMoveClick, moveId, nags,
}) => (
  <Container
    id={`move-${moveId}`}
    isActive={isActive}
    isMainline={isMainline}
    name={`move-${moveId}`}
    onClick={() => handleMoveClick(moveId)}
    onKeyPress={() => handleMoveClick(moveId)}
    role="button"
    tabIndex={-1}
  >
    {moveNumber && <MoveNumber n={moveNumber} sideToMove={sideToMove} />}
    {move}
    {nags && nags.map(n => <Nag key={n} code={n} />)}
  </Container>
)

Move.propTypes = {
  handleMoveClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  isMainline: PropTypes.bool.isRequired,
  move: PropTypes.string.isRequired,
  moveId: PropTypes.string.isRequired,
  moveNumber: PropTypes.string,
  nags: PropTypes.arrayOf(PropTypes.string),
  sideToMove: PropTypes.oneOf(['w', 'b']).isRequired,
}
Move.defaultProps = {
  moveNumber: null,
  nags: null,
}

export default Move
