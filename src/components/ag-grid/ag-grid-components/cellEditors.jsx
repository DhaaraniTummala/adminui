/* eslint-disable react/prop-types */
import { Component } from 'react';
import API from '../../../store/requests';
import { AutoComplete, Select } from 'antd';

const CustomSelectLarge = () => <div>Need to implement</div>;

class SelectCellEditor extends Component {
  constructor(props) {
    super(props);
    var comboType = this.props.colDef.comboType;
    let arr = this.props.context.componentParent.props.combos[comboType];
    this.state = {
      value: props.value,
      arr,
    };
    this.dispatchValues(props.value);
  }

  getValue() {
    return this.state.value;
  }

  dispatchValues = (value) => {
    const { dispatch } = this.props.context.componentParent.props;
    if (this.props.colDef.getEditingValue) {
      dispatch({
        type: 'GET_EDITING_VALUES_SUCCESS',
        payload: {
          type: 'select',
          data: this.state.arr.find((item) => item.LookupId === value) || null,
        },
      });
    }
  };

  componentWillUnmount() {
    // this.dispatchValues();
  }

  handleChange = (value, opt) => {
    this.dispatchValues(value);
    this.setState({ value });
  };

  render() {
    const { value, arr } = this.state;
    const { Option } = Select;

    return (
      <CustomSelectLarge
        onChange={this.handleChange}
        style={{ width: '100%' }}
        value={value}
        className="edit-select"
        showSearch
        filterOption={(input, option) =>
          option.props.children.toLowerCase().startsWith(input.toLowerCase())
        }
        getPopupContainer={() =>
          document.getElementsByClassName('edit-select')[0].parentElement.parentElement
            .parentElement.parentElement
        }
        allowClear
        dropdownMatchSelectWidth={true}
        onInputKeyDown={(event) => {
          // TO DO : work on the keyDown chage value
          // .ant-select-dropdown-menu-item.ant-select-dropdown-menu-item-active target this class to get value
        }}
      >
        {arr.map((item) => {
          return (
            <Option value={item.LookupId} title={item.DisplayValue}>
              {item.DisplayValue}
            </Option>
          );
        })}
      </CustomSelectLarge>
    );
  }
}

class AutoFillCellEditor extends Component {
  constructor(props) {
    super(props);
    const { options, name } = this.props;

    var data = [];
    if (options) {
      data = JSON.parse(options);
    }
    this.state = {
      dataString: options,
      data: data,
      isDataLoaded: false,
      value: props.value,
    };
  }

  componentWillReceiveProps({ options }) {
    if (options && options != this.state.dataString && !this.state.isDataLoaded) {
      this.setState({ data: JSON.parse(options) });
    }
  }

  getValue() {
    return this.state.value;
  }

  getAutoComplete = (searchTxt) => {
    const { activeModule, comboType } = this.props.colDef;
    var param = {
      start: 0,
      limit: 10,
      comboType: comboType,
      activeModule: activeModule,
      query: searchTxt,
      identifier: 'combo',
      asArray: 0,
    };
    var me = this;
    API.autoFill(param)
      .then((response) => {
        let data = response.data.records;
        me.setState({
          data: data,
          dataString: JSON.stringify(data),
          isDataLoaded: true,
        });
      })
      .catch((error) => {
        debugger;
      });
    this.setState({ value: searchTxt });
  };

  render() {
    const { data, value } = this.state;
    const { Option } = AutoComplete;

    return (
      <AutoComplete
        wrapperStyle={{ display: 'block' }}
        menuStyle={{
          borderRadius: '3px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 0',
          fontSize: '90%',
          overflow: 'auto',
          maxHeight: '50%',
          zIndex: 10,
        }}
        autoComplete="none"
        onSearch={this.getAutoComplete}
        value={value}
        onSelect={(value) => this.setState({ value })}
      >
        {data.map((item) => (
          <Option key={item.LookupId}>{item.DisplayValue}</Option>
        ))}
      </AutoComplete>
    );
  }
}

export { SelectCellEditor, AutoFillCellEditor };
