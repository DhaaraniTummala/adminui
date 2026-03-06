import { all, fork } from 'redux-saga/effects';
import core from './root';

export default function* root() {
  yield all([fork(core)]);
}

export const createSagaInjector = (runSaga, rootSaga) => {
  const injectedSagas = new Map();
  const isInjected = (key) => injectedSagas.has(key);
  const injectSaga = (key, saga) => {
    if (isInjected(key)) return;
    const task = runSaga(saga);
    injectedSagas.set(key, task);
  };
  injectSaga('root', rootSaga);
  return injectSaga;
};
