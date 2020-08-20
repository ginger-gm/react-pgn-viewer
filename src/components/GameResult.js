import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.span`
font-size: 1.16rem;
font-weight: 700;
line-height: 1.46em;
margin-right: 0.3rem;
padding: 0.1rem;
`

const GameResult = ({ result }) => (
  <Container>
    {result}
  </Container>
)

GameResult.propTypes = {
  result: PropTypes.string.isRequired,
}

export default GameResult
