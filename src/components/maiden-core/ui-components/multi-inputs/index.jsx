import React, { Component } from 'react';

export class MultiInput extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = {
      searchStr: '',
      arr: props.value,
    };
  }
  componentWillReceiveProps({ value }) {
    if (value !== this.state.arr) {
      this.setState({ arr: value });
    }
  }
  render() {
    const { searchStr, arr } = this.state;

    return (
      <div
        disabled={this.props.disabled ? this.props.disabled : false}
        style={{
          border: 'solid 1px rgba(149, 149, 149, 0.5)',
          paddingBottom: '2px',
          overflow: 'auto',
        }}
        class="ant-input"
      >
        <ul
          style={{ overflowY: 'auto', padding: 'unset', margin: 'unset' }}
          onClick={() => this.input.current.focus()}
          disabled={this.props.disabled ? this.props.disabled : false}
        >
          {arr &&
            arr.map((item, index) => (
              <li
                className="multi-auto"
                disabled={this.props.disabled ? this.props.disabled : false}
              >
                {item}
                <Close
                  disabled={this.props.disabled ? this.props.disabled : false}
                  onClick={(event) => {
                    event.preventDefault();
                    const val = [...arr];
                    val.splice(index, 1);
                    this.props.onChange(val, 'multiInput');
                  }}
                />
              </li>
            ))}
          <li className="multi-auto" disabled={this.props.disabled ? this.props.disabled : false}>
            <input
              type="text"
              onClick={(event) => {
                event.preventDefault();
              }}
              onKeyDown={(evt) => {
                if (evt.keyCode == 13 || evt.keyCode == 9) {
                  evt.preventDefault();
                  if (arr) {
                    this.props.onChange([...arr, searchStr], 'multiInput');
                  } else {
                    this.props.onChange([searchStr], 'multiInput');
                  }
                  this.setState({ searchStr: '' });
                }
              }}
              onChange={(evt) =>
                this.setState({
                  searchStr: evt.target.value,
                  value: evt.target.value,
                })
              }
              ref={this.input}
              value={searchStr}
              disabled={this.props.disabled ? this.props.disabled : false}
              style={{
                border: 'none',
                width: (searchStr && searchStr.length * 13) || '0.75em',
                maxWidth: '100%',
                backgroundColor: 'inherit',
              }}
            />
          </li>
        </ul>
      </div>
    );
  }
}

const Close = (props) => (
  <span {...props}>
    <svg
      height="18"
      width="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      class="css-19bqh2r"
    >
      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
    </svg>
  </span>
);
