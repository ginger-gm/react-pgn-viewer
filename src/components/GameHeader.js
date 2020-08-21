/* eslint-disable no-param-reassign */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
align-items: center;
background: #f3f3f3;
display: flex;
justify-content: center;
padding: 0.6rem 0;
`

const GameHeader = ({ headers, width }) => (
  <Container style={{ width }}>
    <span>
      {headers.White || '[White]'}
      {' '}
      {headers.WhiteElo && ` (${headers.WhiteElo}) `}
      {headers.Black && 'vs.'}
      {' '}
      {headers.Black || null}
      {headers.BlackElo && ` (${headers.BlackElo})`}
      {headers.Event || null}
      {headers.Site && ` | ${headers.Site}`}
      {headers.Round && ` | Round ${headers.Round}`}
      {headers.Date && ` | ${headers.Date}`}
      {headers.ECO && ` | ECO: ${headers.ECO}`}
      {headers.Result && ` | ${headers.Result}`}
    </span>
  </Container>
)

GameHeader.propTypes = {
  headers: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
}

export default GameHeader
