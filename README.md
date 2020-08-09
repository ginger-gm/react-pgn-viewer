# ggm-pgn-viewer

WIP.

## Usage

`yarn add @gingergm/react-pgn-viewer`

```jsx
<PGNViewer
  pieceTheme="/js/chessboardjs-0.3.0/img/chesspieces/alpha/{piece}.svg"
  pgnData={pgnData}
/>
```

### SSR Example

```jsx
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const PGNViewer = dynamic(
  () => {
    return import('@gingergm/react-pgn-viewer').then(mod => mod.PGNViewer)
  },
  { ssr: false },
)

const Viewer = ({ pgnData }) => {
  const [depsLoaded, setDepsLoaded] = useState(false)

  useEffect(() => {
    let _checkForDeps

    const pollForDeps = () => {
      // poll until chessboardjs & jQuery are loaded, the pgn viewer requires them
      _checkForDeps = setInterval(() => {
        if (window.$ && window.ChessBoard) {
          clearInterval(_checkForDeps)
          setDepsLoaded(true)
        }
      }, 50)
    }

    pollForDeps()

    return () => {
      clearInterval(_checkForDeps)
    }
  }, [])

  if (!depsLoaded) return null

  return (
    <PGNViewer
      pieceTheme="/js/chessboardjs-0.3.0/img/chesspieces/alpha/{piece}.svg"
      pgnData={pgnData}
    />
  )
}

export default Viewer
```

## TODO

- Update to use functional component, hooks
- Mobile layout issues
- config file should be converted to props.

## Notes

- Render client-side only
- Requires jQuery (recommended 3.3.1) and chessboard.js (recommended 0.3.0) to be available on window.

* Boilerplate from https://github.com/KaiHotz/react-rollup-boilerplate
