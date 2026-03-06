import React from 'react';
import { InputComponent } from '../input-component';
import { Switch } from 'antd';

export class CustomSwitchInput extends InputComponent {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(newProps) {
    if (newProps.checked != this.props.checked) {
      return true;
    }
    return false;
  }
  render() {
    return (
      <>
        <p style={{ fontSize: '16px', fontWeight: '600', color: 'grey' }}>{this.props.label}</p>
        <Switch {...this.props} />
      </>
    );
  }
}
