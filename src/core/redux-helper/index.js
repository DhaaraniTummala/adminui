import ReduxHandler from 'core-redux-handler';
import { CONFIG } from '../../store/config';

var handler = new ReduxHandler(CONFIG);

var Actions = handler.getActions();

var ActionTypes = handler.getActionTypes();

var Reducers = handler.getReducers();

const ReduxHelper = {
  Actions,
  ActionTypes,
  Reducers,
};

export { ReduxHelper };
