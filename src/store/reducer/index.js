import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { ReduxHelper } from '../../core/redux-helper';
import Combo from './combo';

const rootReducer = (asyncReducers) => {
  return combineReducers({
    form: formReducer,
    combos: Combo,
    ...ReduxHelper.Reducers,
    ...asyncReducers,
  });
};

export default rootReducer;
