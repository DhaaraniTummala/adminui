import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import RichTextEditor from 'react-rte';

export class RichTextBox extends Component {
  static propTypes = {
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);
    let richTextValue = RichTextEditor.createEmptyValue();
    if (props.value) {
      richTextValue = RichTextEditor.createValueFromString(props.value, 'html');
    }
    this.state = {
      richTextValue: richTextValue,
    };
  }
  onChange = (richTextValue) => {
    const newHtml = richTextValue.toString('html');
    this.setState({
      richTextValue,
    });
    if (this.props.onChange) {
      this.props.onChange(newHtml);
    }
  };
  render() {
    return (
      <RichTextEditor
        value={this.state.richTextValue}
        onChange={this.onChange}
        editorStyle={{
          height: '180px',
          overflow: 'auto',
          borderRadius: '4px',
        }}
      />
    );
  }
}
