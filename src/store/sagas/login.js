import { all, put, takeLatest } from 'redux-saga/effects';
import { ReduxHelper } from '../../core/redux-helper';
import API from '../requests';

export function* login(params) {
  try {
    //const response = yield API.login(params.payload);
    const response = yield call(API.login, payload);
    yield put({
      type: ReduxHelper.ActionTypes.LOGIN_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    yield put({
      type: ReduxHelper.ActionTypes.LOGIN_FAILURE,
      error: error,
    });
  }
}

export default function* root() {
  yield all([takeLatest(ReduxHelper.ActionTypes.LOGIN_REQUEST, login)]);
}
