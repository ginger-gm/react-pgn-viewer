# @gingergm/react-pgn-viewer

WIP. Use at own risk.

## Usage

`yarn add @gingergm/react-pgn-viewer`

Requires [chessboard.js](https://chessboardjs.com/) and jQuery to be available on the window object.

```jsx
const pgnData = `
[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Mating : Blind Swine 1"]
[Black "?"]
[Result "*"]
[Annotator "Lawrence Trent / Mark Lyell"]
[SetUp "1"]
[FEN "r4rk1/2R2pp1/1n2N2p/2Rp4/p2P4/P3PQ1P/qP3PPK/8 w - - 0 1"]
[PlyCount "7"]
[SourceTitle "Ultimate Attacking Guide"]
[Source "Ginger GM Ltd"]
[SourceDate "2020.02.17"]
[SourceVersion "4"]
[SourceVersionDate "2020.02.17"]
[SourceQuality "1"]

1. Qg3 g6 (1... fxe6 2. Qxg7#) 2. Qxg6+ fxg6 3. Rg7+ Kh8 4. Rcc7 {Any move
allows the Blind Swine mate Swiderski,R-Nimzowitsch,A Barmen 1905} *
`

<PGNViewer
  enginePath="/js/stockfish.js" // If not provided, engine button will not be shown
  pgnData={pgnData}
  pieceTheme="/chessboardjs-0.3.0/img/chesspieces/alpha/{piece}.svg" // see https://chessboardjs.com/docs
  opts={{
    // defaults shown below
    blackSquareColour: '#b85649',
    border: 'none', // or '4px solid green' etc.
    mobileBreakpoint: 600, // px. >= this number, game text will be shown alongside the board. < this number, game text is shown below the board. *Note that this applies to to the container width, not the viewport.*
    showNotation: false,
    showGameHeader: true,
    whiteSquareColour: '#efd8c0',
  }}
/>
```

## TODO:

By no means a definitive list!

- Allow custom styling, custom `<GameSelect />` component
- Don't show game text if there are no moves
- Examples
- Tests
