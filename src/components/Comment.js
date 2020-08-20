import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.span`
background-color: ${props => (props.isMainline ? null : '#f3f3f3')};
display: ${props => (props.isMainline ? 'block' : 'inline')};
font-size: ${props => (props.isMainline ? '1.16rem' : '1rem')};
font-style: ${props => (props.isMainline ? null : 'italic')};
line-height: ${props => (props.isMainline ? '1.46em' : '1.43em')};
padding: 0.2em;
`

const Comment = ({ comment, isMainline }) => (
  <Container isMainline={isMainline}>
    {comment}
  </Container>
)

Comment.propTypes = {
  comment: PropTypes.string.isRequired,
  isMainline: PropTypes.bool.isRequired,
}

export default Comment
