import { Component } from 'react'
import PropTypes from 'prop-types'

const EVAL_REGEX = new RegExp(`${
  /^info depth (\d+) seldepth \d+ multipv (\d+) /.source
}${/score (cp|mate) ([-\d]+) /.source
}${/(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source
}${/(?:hashfull \d+ )?tbhits \d+ time (\S+) /.source
}${/pv (.+)/.source}`)

class UCIEngine extends Component {
  state = {
    info: '',
    pvs: [],
    status: 'loading', // loading, ready, stopped, working, mate
  }

  componentDidMount() {
    const { multiPv, workerPath } = this.props
    this.EngineWorker = new Worker(workerPath)
    this.EngineWorker.onmessage = e => this.processOutput(e.data)
    this.sendEngineMessage('uci')
    this.setEngineOption('ponder', 'false')
    this.setEngineOption('multipv', multiPv.toString())
    this.start()
  }

  async componentDidUpdate(prevProps) {
    const { fen, multiPv } = this.props
    const { status } = this.state
    if (fen !== prevProps.fen) {
      // 'mate' is a special case, the engine is already stopped
      if (status !== 'stopped' && status !== 'mate') await this.stop()
      this.start()
    }
    if (multiPv !== prevProps.multiPv) {
      await this.stop()
      this.setEngineOption('multipv', multiPv.toString())
      this.start()
    }
  }

  componentWillUnmount() {
    this.stop()
    if (this.EngineWorker) {
      this.EngineWorker.terminate()
    }
  }

  start = async () => {
    const { fen } = this.props
    const { status } = this.state
    if (status !== 'stopped') await this.waitForReady()
    this.setState({ status: 'working', pvs: [] }, () => {
      this.sendEngineMessage(`position fen ${fen}`)
      this.sendEngineMessage('go infinite')
    })
  }

  // Send 'stop' to engine. Promise resolves in this.processOutput
  // when 'readyok' is received back. A 'bestmove' response in turn
  // calls this.waitForReady()
  stop = () => new Promise((resolve) => {
    this.setState({ status: 'stopped' }, () => {
      this.EngineWorker.onmessage = e => this.processOutput(e.data, resolve)
      this.sendEngineMessage('stop')
    })
  })

  // Send 'isready' to engine. Promise resolves in this.processOutput
  // when 'readyok' is received back.
  waitForReady = () => {
    const { status } = this.state
    if (status === 'ready') return
    return new Promise((resolve) => {
      this.EngineWorker.onmessage = e => this.processOutput(e.data, resolve)
      this.sendEngineMessage('isready')
    })
  }

  processOutput = (text, rdyResolve = () => {}) => {
    const { debug } = this.props
    if (debug) console.log(text)

    if (text === 'readyok') {
      this.setState({ status: 'ready' }, () => rdyResolve())
    } else if (text.indexOf('bestmove') === 0) {
      rdyResolve()
    } else if (text.indexOf('id name') === 0) {
      this.setState({
        info: text.replace('id name ', ''),
      })
    } else {
      const match = text.match(EVAL_REGEX)
      let score
      if (match) {
        // console.log(match)
        const multiPv = parseInt(match[2], 10)

        // Is it measuring in centipawns?
        if (match[3] === 'cp') {
          score = (parseInt(match[4], 10) / 100.0).toFixed(2)
        // Did it find a mate?
        } else if (match[3] === 'mate') {
          score = `#${Math.abs(match[4])}`
        }

        // Is the score bounded?
        // if (match[5] === 'upper') {
        //   score = `>= ${score}`
        // }
        // if (match[5] === 'lower') {
        //   score = `<= ${score}`
        // }

        // console.log(score)

        this.setState(state => ({
          pvs: [
            ...state.pvs.slice(0, multiPv - 1),
            {
              score,
              moves: match[8],
            },
            ...state.pvs.slice(multiPv),
          ],
        }))
      } else if (text === 'info depth 0 score mate 0') {
        // mate on the board
        this.setState({
          status: 'mate',
          pvs: [
            {
              score: '#0',
              moves: [],
            },
          ],
        })
      }
    }
  }

  sendEngineMessage = (text) => {
    const { debug } = this.props
    if (debug) console.log(`[stockfish <<] ${text}`)
    return this.EngineWorker.postMessage(text)
  }

  setEngineOption = (name, value) => this.sendEngineMessage(`setoption name ${name} value ${value}`)

  render() {
    const { render } = this.props
    const { info, pvs, status } = this.state
    const out = {
      info,
      pvs,
      status,
    }

    return render(out)
  }
}

UCIEngine.propTypes = {
  debug: PropTypes.bool,
  fen: PropTypes.string.isRequired,
  multiPv: PropTypes.number,
  render: PropTypes.func.isRequired,
  workerPath: PropTypes.string.isRequired,
}
UCIEngine.defaultProps = {
  debug: false,
  multiPv: 1,
}

export default UCIEngine
