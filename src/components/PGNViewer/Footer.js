import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import pkg from '../../../package.json'
import { Button } from '../GameButtons'

const Container = styled.div`
align-items: center;
display: flex;
padding: 0.2rem 0;
width: 100%;

& > pre {
  margin: 0;
}

& > a {
  display: inline-flex;
  margin-left: 0.5rem;
}
`

const DownloadContainer = styled.div`
align-items: center;
display: flex;
justify-content: flex-end;
flex: 1;
`

const Footer = ({ handleDownload }) => (
  <Container>
    <pre>
      Made by
      {' '}
      <a href="https://gingergm.com" target="_blank" rel="noreferrer">GingerGM</a>
    </pre>
    <a href={pkg.repository.url} target="_blank" rel="noreferrer">
      <Button icon={['fab', 'github']} />
    </a>
    <DownloadContainer>
      <Button icon="file-download" onClick={handleDownload} $marginRight={0} />
    </DownloadContainer>
  </Container>
)

Footer.propTypes = {
  handleDownload: PropTypes.func.isRequired,
}

export default Footer
