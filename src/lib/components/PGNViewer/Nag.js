import React from 'react'
import PropTypes from 'prop-types'

const nags = {
  $0: '',
  $1: '!',
  $2: '?',
  $3: '!!',
  $4: '??',
  $5: '!?',
  $6: '?!',
  $7: '□',
  $8: '□',
  $10: '=',
  $11: '=',
  $12: '=',
  $13: '∞',
  $14: '⩲',
  $15: '⩱',
  $16: '±',
  $17: '∓',
  $18: '+-',
  $19: '-+',
  $22: '⨀',
  $32: '⟳',
  $36: '→',
  $40: '↑',
  $132: '⇆',
  $220: 'D',
}

const Nag = ({ code }) => (
  <span>
    {Object.keys(nags).includes(code) ? nags[code] : code}
  </span>
)

Nag.propTypes = {
  code: PropTypes.string.isRequired,
}

export default Nag
