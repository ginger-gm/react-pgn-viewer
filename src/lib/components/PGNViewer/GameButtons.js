import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Container = styled.div`
align-items: center;
background: #f3f3f3;
display: flex;
padding: 0.6rem;
width: 400px;
`

const LeftInnerContainer = styled.div`
display: flex;
`

const RightInnerContainer = styled.div`
display: flex;
flex: 1;
justify-content: flex-end;
`

const Button = styled(FontAwesomeIcon)`
  cursor: pointer;
  margin-right: 12px;
`

const GameButtons = ({
  handleGotoEnd,
  handleGotoStart,
  handleNextMove,
  handlePreviousMove,
  handleReplay,
  handleToggleEngine,
  handleToggleOrientation,
  isReplayMode,
}) => (
  <Container>
    <LeftInnerContainer>
      <Button icon="robot" onClick={handleToggleEngine} size="2x" />
      <Button icon="redo" onClick={handleToggleOrientation} size="2x" />
    </LeftInnerContainer>
    <RightInnerContainer>
      <Button icon="angle-double-left" onClick={handleGotoStart} size="2x" />
      <Button icon="chevron-left" onClick={handlePreviousMove} size="2x" />
      <Button icon={isReplayMode ? 'pause' : 'play'} onClick={handleReplay} size="2x" />
      <Button icon="chevron-right" onClick={handleNextMove} size="2x" />
      <Button icon="angle-double-right" onClick={handleGotoEnd} size="2x" style={{ marginRight: 0 }} />
    </RightInnerContainer>
  </Container>
)

GameButtons.propTypes = {
  handleGotoEnd: PropTypes.func.isRequired,
  handleGotoStart: PropTypes.func.isRequired,
  handleNextMove: PropTypes.func.isRequired,
  handlePreviousMove: PropTypes.func.isRequired,
  handleReplay: PropTypes.func.isRequired,
  handleToggleEngine: PropTypes.func.isRequired,
  handleToggleOrientation: PropTypes.func.isRequired,
  isReplayMode: PropTypes.bool.isRequired,
}

export default GameButtons
