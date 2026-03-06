import { ReduxHelper } from '../../core/redux-helper';

var staticCombos = {};

export default function (state = {}, action) {
  const actionTypes = ReduxHelper.ActionTypes;
  if (actionTypes) {
    switch (action.type) {
      case actionTypes.successActions.LIST_COMBOS_REQUEST:
        return { ...state };
      case actionTypes.successActions.LIST_COMBOS_SUCCESS:
        var result = { ...state, ...action.payload, ...staticCombos };
        return result;
      default:
        return state;
    }
  } else {
    return state;
  }
}
