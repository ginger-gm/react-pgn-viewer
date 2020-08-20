/* eslint-disable no-param-reassign */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
background: #f3f3f3;
padding: 0.6rem;
width: 100%;
`

const GameHeader = ({ headers }) => (
  <Container>
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
  </Container>
)

GameHeader.propTypes = {
  headers: PropTypes.object.isRequired,
}

export default GameHeader
