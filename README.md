# @gingergm/react-pgn-viewer

WIP. Use at own risk.

## TODO

- clean up code (esp helpers.js)
- remove inline styles
- examples
- readme
- license
- tests
- move repo to https://github.com/ginger-gm/react-pgn-viewer (+ update repository in package.json)

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
