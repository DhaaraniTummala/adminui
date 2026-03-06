import React from 'react';

export class InputComponent extends React.Component {
  shouldComponentUpdate(newProps) {
    if (newProps.value != this.props.value) {
      return true;
    } else if (newProps?.disabled != this.props.disabled) {
      return true;
    }
    return false;
  }
}
