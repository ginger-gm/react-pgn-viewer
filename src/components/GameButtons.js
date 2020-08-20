import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import pkg from '../../package.json'

const Container = styled.div`
align-items: center;
background: #f3f3f3;
display: flex;
padding: 0.8rem 0;
width: ${props => (props.width ? `${props.width}px` : '100%')};
height: ${props => (props.width ? `${props.width / 10}px` : null)}
`

const LeftInnerContainer = styled.div`
align-items: center;
display: flex;
padding: 0 0.5rem;
font-size: ${props => props.fontSize || 'inherit'}px
`

const RightInnerContainer = styled.div`
align-items: center;
display: flex;
flex: 1;
justify-content: flex-end;
padding: 0 0.5rem;
font-size: ${props => props.fontSize || 'inherit'}px
`

const Button = styled(FontAwesomeIcon)`
  color: #424242;
  cursor: pointer;
  margin-right: 1rem;

  &:hover {
    color: #212121;
  }
`

const GameButtons = React.forwardRef(({
  handlers,
  isReplayMode,
  showEngineButton,
  width,
}, ref) => {
  const {
    handleGotoEnd,
    handleGotoStart,
    handleNextMove,
    handlePreviousMove,
    handleReplay,
    handleToggleEngine,
    handleToggleOrientation,
  } = handlers

  return (
    <Container width={width} ref={ref}>
      <LeftInnerContainer fontSize={width / 14}>
        {showEngineButton && (
          <Button icon="robot" onClick={handleToggleEngine} style={{ marginLeft: 0 }} />
        )}
        <Button icon="redo" onClick={handleToggleOrientation} />
      </LeftInnerContainer>
      <RightInnerContainer fontSize={width / 14}>
        <Button icon="angle-double-left" onClick={handleGotoStart} />
        <Button icon="chevron-left" onClick={handlePreviousMove} />
        <Button icon={isReplayMode ? 'pause' : 'play'} onClick={handleReplay} />
        <Button icon="chevron-right" onClick={handleNextMove} />
        <Button icon="angle-double-right" onClick={handleGotoEnd} />
        <a href={pkg.repository.url} target="_blank" rel="noreferrer">
          <Button icon={['fab', 'github']} style={{ marginRight: 0 }} />
        </a>
      </RightInnerContainer>
    </Container>
  )
})

GameButtons.propTypes = {
  handlers: PropTypes.shape({
    handleGotoEnd: PropTypes.func.isRequired,
    handleGotoStart: PropTypes.func.isRequired,
    handleNextMove: PropTypes.func.isRequired,
    handlePreviousMove: PropTypes.func.isRequired,
    handleReplay: PropTypes.func.isRequired,
    handleToggleEngine: PropTypes.func.isRequired,
    handleToggleOrientation: PropTypes.func.isRequired,
  }).isRequired,
  showEngineButton: PropTypes.bool,
  isReplayMode: PropTypes.bool,
  width: PropTypes.number,
}
GameButtons.defaultProps = {
  isReplayMode: false,
  showEngineButton: false,
  width: null,
}
GameButtons.displayName = 'GameButtons'

export default GameButtons
