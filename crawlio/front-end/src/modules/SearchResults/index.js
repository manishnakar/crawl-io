import io from 'socket.io-client';
import { http } from '../../api/Services';
import { networkActionCreators } from '../Network';
import strings from '../../strings';
import rank from '../../utils/rank';

let resultsSocket;
const SNACKBAR_DELAY = 2200;

const INITIAL_STATE = {
  searchResults: [],
  searchUUID: '',
  notificationOpen: false,
  notificationText: '',
};

const actionTypes = {
  APPEND_SEARCH_RESULTS: 'crawlio/SearchResults/APPEND_SEARCH_RESULTS',
  UPDATE_SEARCH_UUID: 'crawlio/SearchResults/UPDATE_SEARCH_UUID',
  START_SEARCHING: 'crawlio/SearchResults/START_SEARCHING',
  SHOW_NOTIFICATION: 'crawlio/SearchResults/SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'crawlio/SearchResults/HIDE_NOTIFICATION',
};

const actionCreators = {
  appendSearchResults: (results, searchTerm) => ({
    type: actionTypes.APPEND_SEARCH_RESULTS,
    payload: {
      results,
      searchTerm,
    },
  }),
  updateSearchUUID: uuid => ({
    type: actionTypes.UPDATE_SEARCH_UUID,
    payload: uuid,
  }),
  startSearching: () => ({
    type: actionTypes.START_SEARCHING,
  }),
  showNotification: text => ({
    type: actionTypes.SHOW_NOTIFICATION,
    payload: text,
  }),
  hideNotification: () => ({
    type: actionTypes.HIDE_NOTIFICATION,
  }),
};

const thunks = {
  searchTerm: term => (
    async (dispatch) => {
      dispatch(networkActionCreators.updateLoadingState(true));
      dispatch(actionCreators.startSearching());

      const response = await http.search(term);
      const { uuid } = response.data;

      dispatch(actionCreators.updateSearchUUID(uuid));
      dispatch(thunks.initializeWebSocket(term));
    }
  ),
  initializeWebSocket: term => (
    async (dispatch, getState) => {
      resultsSocket = io.connect(`${process.env.REACT_APP_WEBSOCKET_HOST}`, {
        query: {
          uuid: getState().results.searchUUID,
        },
      });
      resultsSocket.on('results', (data) => {
        console.log('received results', data);
        dispatch(actionCreators.appendSearchResults(data.results, term));
        if (getState().results.notificationOpen) {
          setTimeout(() => {
            dispatch(actionCreators.showNotification(strings.snackbarResults(data.providerName)));
          }, SNACKBAR_DELAY);
        } else {
          dispatch(actionCreators.showNotification(strings.snackbarResults(data.providerName)));
        }
      });
      resultsSocket.on('finished', () => {
        dispatch(networkActionCreators.updateLoadingState(false));
      });
    }
  ),
};

export {
  actionTypes as searchResultsActionTypes,
  actionCreators as searchResultsActionCreators,
  thunks as searchResultsThunks,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.APPEND_SEARCH_RESULTS:
      return {
        ...state,
        searchResults:
          rank([...state.searchResults, ...action.payload.results], action.payload.searchTerm),
      };
    case actionTypes.UPDATE_SEARCH_UUID:
      return {
        ...state,
        searchUUID: action.payload,
      };
    case actionTypes.START_SEARCHING:
      return {
        ...state,
        searchResults: [],
      };
    case actionTypes.SHOW_NOTIFICATION:
      return {
        ...state,
        notificationOpen: true,
        notificationText: action.payload,
      };
    case actionTypes.HIDE_NOTIFICATION:
      return {
        ...state,
        notificationOpen: false,
        notificationText: '',
      };
    default:
      return state;
  }
};
