import React from 'react';
import { InputComponent } from '../input-component';
import { ReduxAutoComplete } from '../../../CustomAutoComplete/autoComplete';

export class CustomReduxAutoComplete extends InputComponent {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(newProps) {
    if (newProps.value != this.props.value) {
      return true;
    }
    if (newProps.params) {
      if (newProps.params.ScopeId != this.props.params.ScopeId) {
        return true;
      }
    }
    return false;
  }
  render() {
    return <ReduxAutoComplete {...this.props} />;
  }
}
