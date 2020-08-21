export const actions = {
  SET_BOARD_HEIGHT: 'SET_BOARD_HEIGHT',
  SELECT_GAME: 'SELECT_GAME',
  SET_ERROR: 'SET_ERROR',
  SET_FOCUSED: 'SET_FOCUSED',
  SET_GAMES: 'SET_GAMES',
  SET_MOBILE: 'SET_MOBILE',
  SET_REPLAY_DELAY: 'SET_REPLAY_DELAY',
  SET_SELECTED_MOVE_ID: 'SET_SELECTED_MOVE_ID',
  TOGGLE_ENGINE: 'TOGGLE_ENGINE',
  TOGGLE_ORIENTATION: 'TOGGLE_ORIENTATION',
}

export const initialState = {
  boardHeight: null,
  boardOrientation: 'white',
  error: false,
  games: [], // extended with extra info, these are used in the viewer
  parsedGames: [], // unextended games from pgn data, used in header dropdown
  isEngineEnabled: false,
  isFocused: false,
  isLoading: true,
  isMobile: null,
  replayDelay: null,
  selectedGameIndex: null,
  selectedMoveId: null,
}

export default (state, action) => {
  switch (action.type) {
    case actions.SELECT_GAME: {
      return {
        ...state,
        replayDelay: null,
        selectedGameIndex: action.payload,
        selectedMoveId: null,
      }
    }

    case actions.SET_BOARD_HEIGHT: {
      return {
        ...state,
        boardHeight: action.payload,
      }
    }

    case actions.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    }

    case actions.SET_FOCUSED: {
      return {
        ...state,
        isFocused: action.payload,
      }
    }

    case actions.SET_GAMES: {
      const { extendedGames: games, parsedGames } = action.payload

      return {
        ...state,
        isLoading: false,
        games,
        parsedGames,
      }
    }

    case actions.SET_MOBILE: {
      return {
        ...state,
        isMobile: action.payload,
      }
    }

    case actions.SET_SELECTED_MOVE_ID: {
      return {
        ...state,
        selectedMoveId: action.payload,
      }
    }

    case actions.TOGGLE_ENGINE: {
      return {
        ...state,
        isEngineEnabled: !state.isEngineEnabled,
      }
    }

    case actions.TOGGLE_ORIENTATION: {
      return {
        ...state,
        boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
      }
    }

    case actions.SET_REPLAY_DELAY: {
      return {
        ...state,
        replayDelay: action.payload,
      }
    }

    default:
      return state
  }
}
