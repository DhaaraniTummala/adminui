import React, { Component } from 'react';
import Layout from '../../../components/Layout';
import PropTypes from 'prop-types';
import RichTextEditor from 'react-rte';

class MyStatefulEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func,
  };

  state = {
    value: RichTextEditor.createValueFromString(
      '\n\n# **Dillinger**\n\n## _**The Last Markdown Editor, Ever**_\n',
      'markdown',
    ),
    htmlString: '',
    markdownString: '',
  };

  onChange = (value) => {
    this.setState({
      value,
      htmlString: value.toString('html'),
      markdownString: value.toString('markdown'),
    });
    if (this.props.onChange) {
      // Send the changes up to the parent component as an HTML string.
      // This is here to demonstrate using `.toString()` but in a real app it
      // would be better to avoid generating a string on each change.
      this.props.onChange(value.toString('markdown'));
    }
  };

  render() {
    return (
      <>
        <button
          onClick={() => {
            debugger;
            var test = this.state;
          }}
        >
          Submit
        </button>
        <RichTextEditor value={this.state.value} onChange={this.onChange} />
      </>
    );
  }
}
export default Layout(MyStatefulEditor);
