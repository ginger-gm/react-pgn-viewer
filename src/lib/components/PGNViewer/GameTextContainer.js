import React from 'react'
import styled from 'styled-components'
import { Element } from 'react-scroll'
import omit from 'lodash/omit'

export default styled(props => <Element {...omit(props, ['height'])} />)`
box-sizing: border-box;
display: flex;
${props => props.height && `height: ${props.height}px`};
flex-direction: column;
margin-top: 0;
overflow-wrap: break-word;
padding-left: 0.4em;
padding-right: 0;
width: '57%';
word-break: break-word;
`
