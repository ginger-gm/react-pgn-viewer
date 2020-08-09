import React from 'react'
import PropTypes from 'prop-types'

const MoveNumber = ({ n, sideToMove }) => (
  <span>
    {n}
    {n && sideToMove === 'w' && '.'}
    {n && sideToMove === 'b' && '...'}
  </span>
)

MoveNumber.propTypes = {
  n: PropTypes.string.isRequired,
  sideToMove: PropTypes.oneOf(['w', 'b']).isRequired,
}

export default MoveNumber
