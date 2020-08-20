import React from 'react'
import PropTypes from 'prop-types'

const GameSelect = ({ handleChange, parsedGames, value }) => {
  const options = parsedGames.map((g, i) => {
    const { headers } = g
    if (headers.White === '?') delete headers.White
    if (headers.Black === '?') delete headers.Black
    if (headers.Event === '?') delete headers.Event
    if (headers.Site === '?') delete headers.Site
    if (headers.Round === '?') delete headers.Round
    if (headers.Result === '?') delete headers.Result
    if (headers.Result === '*') delete headers.Result
    if (headers.Date === '?') delete headers.Date
    if (headers.Date === '????.??.??') delete headers.Date

    let label = `${headers.White}`
    if (headers.Black) label = `${label} - ${headers.Black}`
    if (headers.Event) label = `${label} (${headers.Event}_`

    return {
      key: i,
      value: i,
      label,
    }
  })

  return (
    <select
      onChange={handleChange}
      value={value}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

GameSelect.propTypes = {
  handleChange: PropTypes.func.isRequired,
  parsedGames: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.number.isRequired,
}

export default GameSelect
