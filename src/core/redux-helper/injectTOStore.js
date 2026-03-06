import ReduxHandler from 'core-redux-handler';
import store from '../../store';
import { sagaGenerator } from '../../store/sagas/core';
import { ReduxHelper } from './index';

export const injectTOStore = (newConfig) => {
  let newHandler = new ReduxHandler(newConfig);
  let Actions = ReduxHelper.Actions;
  let ActionTypes = ReduxHelper.ActionTypes;
  let Reducers = ReduxHelper.Reducers;

  let newActions = newHandler.getActions();
  ReduxHelper.Actions = { ...Actions, ...newActions };

  let newActionTypes = newHandler.getActionTypes();
  ReduxHelper.ActionTypes = {
    ...ActionTypes,
    ...newActionTypes,
    failureActions: {
      ...ActionTypes.failureActions,
      ...newActionTypes.failureActions,
    },
    requestActions: {
      ...ActionTypes.requestActions,
      ...newActionTypes.requestActions,
    },
    resetActions: {
      ...ActionTypes.resetActions,
      ...newActionTypes.resetActions,
    },
    setActions: { ...ActionTypes.setActions, ...newActionTypes.setActions },
    successActions: {
      ...ActionTypes.successActions,
      ...newActionTypes.successActions,
    },
  };

  let newReducers = newHandler.getReducers();
  ReduxHelper.Reducers = { ...Reducers, ...newReducers };

  Object.keys(newReducers).map((key) => {
    store.injectReducer(key, newReducers[key]);
  });

  Object.values(newActionTypes.requestActions).map((key) => {
    store.injectSaga(key, sagaGenerator(key));
  });

  console.debug(Actions);
  console.debug(ActionTypes);
  console.debug(Reducers);
};
