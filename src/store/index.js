import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducer';
import rootSaga, { createSagaInjector } from './sagas';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer({}), applyMiddleware(sagaMiddleware));
store.injectSaga = createSagaInjector(sagaMiddleware.run, rootSaga);

store.asyncReducers = {};

store.injectReducer = (key, asyncReducer) => {
  store.asyncReducers[key] = asyncReducer;
  store.replaceReducer(rootReducer(store.asyncReducers));
};
//sagaMiddleware.run(rootSaga);

export default store;
