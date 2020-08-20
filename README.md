# @gingergm/react-pgn-viewer

WIP. Use at own risk.

## Usage

`yarn add @gingergm/react-pgn-viewer`

Requires chessboard.js and jQuery to available on the window object. See [examples](TODO).

```jsx
<PGNViewer
  pgnData={pgnData}
  pieceTheme="/chessboardjs-0.3.0/img/chesspieces/alpha/{piece}.svg"
  opts={{
    blackSquareColour: '#b85649',
    border: 'none',
    showNotation: false,
    whiteSquareColour: '#efd8c0',
  }}
/>
```
