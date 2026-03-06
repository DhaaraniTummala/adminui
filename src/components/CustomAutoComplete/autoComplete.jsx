import React from 'react';
import Axios from 'axios';
import { Input, AutoComplete } from 'antd';
import API from '../../store/requests';
const Option = AutoComplete.Option;

class ReduxAutoComplete extends React.PureComponent {
  constructor(props) {
    super(props);
    const { options, name, value } = this.props;

    var data = [];
    if (options) {
      data = JSON.parse(options);
    }
    this.state = {
      dataString: options,
      data: data,
      fieldId: name.replace('field_', ''),
      isDataLoaded: false,
      lookupId: value,
      displayValue: '',
      isOpen: false,
      hasFocus: false,
      oldValue: props.value,
    };
  }

  componentWillUnmount() {
    this.state.isDataLoaded = false;
    this.state.lookupId = '';
    this.state.displayValue = '';
  }

  componentDidMount() {
    if (this.state.lookupId && this.state.lookupId > 0) {
      const { activeModule, comboType, params } = this.props;
      var param = {
        LookupId: this.state.lookupId,
        comboType: comboType,
        activeModule: activeModule,
        query: '',
        identifier: 'combo',
        asArray: 0,
        ...params,
      };
      var me = this;
      API.autoFill(param)
        .then((response) => {
          let data = response.data.records;
          me.setState({
            data: data,
            dataString: JSON.stringify(data),
            displayValue: data[0].DisplayValue,
          });
        })
        .catch((error) => {
          debugger;
        });
    }
  }

  componentWillReceiveProps({ options, value, activeRecordId, params }) {
    if (value !== this.props.value && this.mapDisplayValue(this.props.value)) {
      this.setState({ oldValue: this.mapDisplayValue(this.props.value) });
    }
    if (this.props.activeRecordId && this.props.activeRecordId != activeRecordId) {
      this.state.isDataLoaded = false;
    }

    if (options && options != this.state.dataString && !this.state.isDataLoaded) {
      this.setState({ data: JSON.parse(options) });
    }
    if (
      value &&
      !options &&
      //this.state.lookupId &&
      //value != this.state.lookupId &&
      (!this.props.value || value != this.props.value) &&
      //this.state.lookupId > 0 &&
      !this.state.isDataLoaded
    ) {
      const { activeModule, comboType } = this.props;
      var param = {
        LookupId: value,
        comboType: comboType,
        activeModule: activeModule,
        query: '',
        identifier: 'combo',
        asArray: 0,
        ...params,
      };
      var me = this;
      API.autoFill(param)
        .then((response) => {
          let data = response.data.records;
          me.setState({
            data: data,
            lookupId: value,
            dataString: JSON.stringify(data),
            displayValue: data[0].DisplayValue,
          });
        })
        .catch((error) => {
          console.debug(error);
        });
    }
  }

  getAutoComplete = (searchTxt) => {
    const { activeModule, comboType, params } = this.props;
    var param = {
      start: 0,
      limit: 10,
      comboType: comboType,
      activeModule: activeModule,
      query: searchTxt,
      identifier: 'combo',
      asArray: 0,
      ...params,
    };
    var me = this;
    this.setState({ loadingData: true });
    API.autoFill(param)
      .then((response) => {
        let data = response.data.records;
        me.setState({
          data: data,
          dataString: JSON.stringify(data),
          isDataLoaded: true,
          isOpen: this.state.hasFocus,
          loadingData: false,
        });
      })
      .catch((error) => {
        debugger;
      });
  };

  closeMenu = () => {
    this.setState({ hasFocus: false, isOpen: false });
    if (!this.mapDisplayValue(this.props.value)) this.props.onChange(this.state.oldValue);
  };

  mapDisplayValue = (value, getDisplayValue) => {
    for (var item of this.state.data) {
      if (item.LookupId == value) {
        return item.DisplayValue;
      }
    }
    return getDisplayValue ? value : null;
  };

  render() {
    const {
      placeholder,
      meta,
      errorMessage,
      className,
      disabled,
      maxLength,
      tabIndex,
      onChange,
      name,
      value,
      activeRecordId,
      allowZeros,
    } = this.props;
    const { data, isDataLoaded, loadingData } = this.state;

    var { touched, error, warning } = meta || {};

    // var itemValue = null;
    // if (activeRecordId == 'NEW_RECORD') {
    //   itemValue = value;
    // } else {
    //   if (isDataLoaded) {
    //     if (value == 0 && allowZeros) {
    //       itemValue = value;
    //     } else if (value > 0) {
    //       itemValue = value;
    //     }
    //   } else {
    //     itemValue = displayValue;
    //   }
    // }
    let displayValue = this.mapDisplayValue(value, true);
    if (value == 0 && !allowZeros) displayValue = '';
    var input = { name, onChange, value: displayValue };
    return (
      <React.Fragment>
        {/* <Icon type="down" className="autoComIcon" onClick={() => this.getAutoComplete('')} /> */}
        <div style={{ position: 'relative' }} id="autoComplete">
          <AutoComplete
            {...input}
            getPopupContainer={() => document.getElementById('autoComplete')}
            wrapperStyle={{ display: 'block' }}
            menuStyle={{
              borderRadius: '3px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 0',
              fontSize: '90%',
              position: 'fixed',
              overflow: 'auto',
              maxHeight: '50%',
              zIndex: 10,
            }}
            autocomplete="none"
            tabIndex={tabIndex}
            onSelect={(value) => {
              this.setState({ oldValue: value }, this.closeMenu);
            }}
            onSearch={this.getAutoComplete}
            placeholder={placeholder}
            className={className}
            disabled={!!disabled}
            maxLength={maxLength}
            open={this.state.isOpen}
            dataSource={data.map((item) => (
              <Option key={item.LookupId} title={item.DisplayValue}>
                {item.DisplayValue}
              </Option>
            ))}
            dropdownClassName="certain-category-search-dropdown"
            // onFocus={() => this.setState({ isOpen: true })}
            onBlur={this.closeMenu}
            allowClear={true}
          >
            <Input
              suffix={
                <>
                  {
                    loadingData && 'loading'
                    // <Icon type="loading" className="autoComIcon" style={{ height: '10px' }} />
                  }
                  {/* <Icon
                    type="down"
                    className="autoComIcon"
                    style={{ height: '10px' }}
                    onClick={() => this.getAutoComplete(displayValue || '')}
                  /> */}
                  Need to implement
                </>
              }
              onFocus={() => this.setState({ hasFocus: true })}
              onClick={() => this.getAutoComplete(displayValue || '')}
              onBlur={this.closeMenu}
              title={displayValue}
            />
          </AutoComplete>
        </div>

        {touched &&
          ((error && (
            <span className="required-color-red" style={{ fontSize: '80%', color: '#dc3545' }}>
              {errorMessage}
            </span>
          )) ||
            (warning && <span className="warning-color">{warning}</span>))}
      </React.Fragment>
    );
  }
}

export { ReduxAutoComplete };
