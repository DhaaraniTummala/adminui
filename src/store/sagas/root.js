import { takeLatest, all } from 'redux-saga/effects';
import { genericFunction, handleError } from './core';
import { ReduxHelper } from '../../core/redux-helper';
import { CacheStorage } from '../../core/utils/cache';

export default function* root() {
  var APIs = [takeLatest(ReduxHelper.ActionTypes.HANDLE_ERRORS_REQUEST, handleError)];
  var actionsTypes = ReduxHelper.ActionTypes;
  for (var key in actionsTypes.requestActions) {
    if (!CacheStorage.saga[key]) {
      APIs.push(takeLatest(key, genericFunction));
      CacheStorage.saga[key] = true;
    } else {
      console.debug(`Saga for ${key} is already registered.`);
    }
  }
  yield all([...APIs]);
}
