import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';
import Checkbox from '@mui/material/Checkbox';
import { FixedSizeList as List } from 'react-window';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { disableRippleEffect } from '../../../app-config/index';

class BooleanFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: undefined,
      isFilterActive: false,
    };
  }

  getModel() {
    if (!this.state.isFilterActive) return null;
    const { checked } = this.state;
    return this.state.isFilterActive ? { type: 'boolean', value: checked } : null;
  }

  isFilterActive = () => typeof this.state.checked !== 'undefined';

  doesFilterPass = () => true;

  setModel = (model) => {
    let checked = model ? model.value : undefined;
    this.setState({ checked });
  };

  onClick = (boolean) => {
    this.setState(
      {
        checked: boolean,
        isFilterActive: true,
      },
      () => {
        this.props.filterChangedCallback();
      },
    );
  };

  afterGuiAttached = (props) => {
    if (!this.state.isFilterActive) this.setState({ checked: undefined });
  };

  render() {
    const { checked } = this.state;
    let Yes = typeof checked == 'undefined' ? false : checked;
    let No = typeof checked == 'undefined' ? false : !checked;
    let disableBtn = false;
    if (checked === undefined) {
      disableBtn = true;
    }
    return (
      <>
        <Checkbox
          disableRipple={disableRippleEffect}
          checked={Yes}
          onClick={() => this.onClick(true)}
        />{' '}
        Yes
        <br />
        <Checkbox
          disableRipple={disableRippleEffect}
          checked={No}
          onClick={() => this.onClick(false)}
        />{' '}
        No
        <p>
          <button
            disabled={disableBtn}
            onClick={() =>
              this.setState(
                { checked: undefined, isFilterActive: false },
                this.props.filterChangedCallback,
              )
            }
            className="deselect-filter-btn"
          >
            Reset Filter
          </button>
        </p>
      </>
    );
  }
}

class ListFilter extends PureComponent {
  constructor(props) {
    super(props);
    const { context } = this.props;
    var allSelected = new Map();
    var deSelected = new Map();
    let arr = [];

    if (context) {
      allSelected = context.componentParent.props.combos[this.props.colDef.comboType + '_select'];
      deSelected = context.componentParent.props.combos[this.props.colDef.comboType + '_deselect'];
      arr = context.componentParent.props.combos[this.props.colDef.comboType];
    }
    this.state = {
      deSelectedValues: deSelected,
      values: deSelected,
      combos: arr,
      searchCombos: arr,
      serachstr: '',
      disableButton: true,
      isFilterActive: false,
      showList: true,
    };
  }

  getModel() {
    if (!this.state.isFilterActive) return null;
    const { values } = this.state;
    let value = [];
    if (values) {
      values.forEach((item, key) => {
        if (item) value.push(key);
      });
    }

    return value.length > 0 ? { type: 'listCustom', value: value.toString() } : {};
  }

  isFilterActive = () => this.state.isFilterActive;

  doesFilterPass = () => true;

  setModel(model) {
    const { combos } = this.state;
    if (model && model.value) {
      if (typeof model.value == 'number') {
        let values = new Map([...this.state.deSelectedValues]);
        values.set(model.value, true);
        this.setState({ values, isFilterActive: true });
      } else {
        const { values } = this.state;
        for (let item of model.value.split(',')) values.set(item, true);
        this.setState({ values, isFilterActive: true });
      }
    } else {
      this.setState({
        values: this.state.deSelectedValues,
        serachstr: '',
        disableButton: true,
        searchCombos: combos,
        isFilterActive: false,
      });
    }
  }

  onChange = (e, id) => {
    let values = new Map([...this.state.values]);
    values.set(id, e.target.checked);
    let disableButton = false;
    this.setState({ values, disableButton });
  };

  search = ({ target: { value } }) => {
    const { combos } = this.state;
    if (combos) {
      const searchCombos = combos
        .map((item) =>
          item.DisplayValue && item.DisplayValue.toLowerCase().startsWith(value.toLowerCase())
            ? item
            : null,
        )
        .filter((item) => item);
      this.setState({ searchCombos, serachstr: value });
    }
  };

  afterGuiAttached = (props) => {
    if (!this.state.isFilterActive)
      this.setState({
        values: this.state.deSelectedValues,
        serachstr: '',
        searchCombos: this.state.combos,
        disableButton: true,
      });
    this.setState({ showList: false }, () =>
      setTimeout(() => this.setState({ showList: true }), 1),
    );
  };

  render() {
    const { values, searchCombos, deSelectedValues, serachstr, combos, disableButton, showList } =
      this.state;
    return (
      <div>
        <div style={{ borderBottom: '0.5px solid #EBEBEB', marginBottom: '7px' }}>
          <input
            type="text"
            className="custom-filter-input"
            onChange={this.search}
            placeholder="Search..."
            value={serachstr}
            style={{ padding: '10px' }}
          />
        </div>
        <div style={{ height: '99px', width: '290px', padding: '0px' }}>
          {searchCombos && showList && (
            <List
              height={110}
              itemCount={searchCombos.length}
              itemSize={42}
              width={290}
              itemData={searchCombos}
            >
              {({ style, index }) => (
                <div
                  style={{
                    ...style,
                    textOverflow: 'ecllipse',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  key={searchCombos[index].LookupId}
                >
                  <Checkbox
                    disableRipple={disableRippleEffect}
                    checked={values.get(searchCombos[index].LookupId)}
                    onClick={(e) => this.onChange(e, searchCombos[index].LookupId)}
                  />
                  {searchCombos[index].DisplayValue}
                </div>
              )}
            </List>
          )}
        </div>
        <p
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px',
            marginTop: '10px',
          }}
        >
          <button
            onClick={() =>
              this.setState(
                {
                  values: deSelectedValues,
                  serachstr: '',
                  searchCombos: combos,
                  disableButton: true,
                  isFilterActive: false,
                },
                () => this.props.filterChangedCallback(),
              )
            }
            className="deselect-filter-btn"
            style={{ marginLeft: '10px', color: '#3f51b5' }}
          >
            Reset Filter
          </button>
          <button
            disabled={disableButton}
            onClick={() =>
              this.setState({ isFilterActive: true }, this.props.filterChangedCallback)
            }
            className="apply-filter-btn"
            style={{ marginRight: '10px', color: '#3f51b5' }}
          >
            Apply Filter
          </button>
        </p>
      </div>
    );
  }
}

class DateFilter extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      startValue: null,
      endValue: null,
      equalValue: null,
      isFilterActive: false,
    };
  }

  setModel(model) {
    if (model) {
      const { dateFrom, dateTo, dateEqual } = model;
      if (dateFrom || dateTo || dateEqual)
        this.setState({
          startValue: dateFrom,
          endValue: dateTo,
          equalValue: dateEqual,
          isFilterActive: true,
        });
      else
        this.setState({
          startValue: null,
          endValue: null,
          equalValue: null,
          isFilterActive: false,
        });
    } else {
      this.setState({
        startValue: null,
        endValue: null,
        equalValue: null,
        isFilterActive: false,
      });
    }
  }

  doesFilterPass = () => true;

  isFilterActive = () => this.state.isFilterActive;

  getModel() {
    if (!this.state.isFilterActive) return null;
    const { startValue, endValue, equalValue } = this.state;
    return (
      ((startValue && endValue) || startValue || endValue || equalValue) && {
        filterType: 'date',
        dateFrom: startValue,
        dateTo: endValue,
        dateEqual: equalValue,
      }
    );
  }

  onChange = (field, value) => {
    let dObj = {};
    // if (value || !value) {
    if (field === 'startValue' || field === 'endValue') {
      dObj = { [field]: value, equalValue: null };
    } else if (field === 'equalValue') {
      dObj = { [field]: value, startValue: null, endValue: null };
    }
    this.setState({
      ...dObj,
      isFilterActive: true,
    });
    // } else this.setState({ [field]: this.state[field] });
  };

  disabledEndDate = (endValue) => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onStartChange = (value) => {
    // if (this.state.endValue && this.state.endValue.valueOf() < value.valueOf())
    //   this.onChange('endValue', null);
    this.onChange('startValue', value);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
  };
  onEqualChange = (value) => {
    this.onChange('equalValue', value);
  };

  afterGuiAttached = () => {
    if (!this.state.isFilterActive) {
      this.setState({ startValue: null, endValue: null, equalValue: null });
    }
  };

  render() {
    const { startValue, endValue, equalValue } = this.state;
    let disableBtn = false;
    if (startValue == null && endValue == null && equalValue == null) {
      disableBtn = true;
    }
    return (
      <div style={{ textAlign: 'center', width: '235px', padding: '15px' }}>
        <br />

        <DatePicker
          format="YYYY-MM-DD"
          value={endValue}
          placeholder="Before"
          onChange={this.onEndChange}
          // onOpenChange={this.handleStartOpenChange}
          popupClassName="ag-custom-component-popup"
          style={{ width: '100%' }}
        />
        <br />
        <br />
        <DatePicker
          format="YYYY-MM-DD"
          value={startValue}
          placeholder="From"
          onChange={this.onStartChange}
          popupClassName="ag-custom-component-popup"
          style={{ width: '100%' }}
        />
        <br />
        <br />
        <DatePicker
          format="YYYY-MM-DD"
          value={equalValue}
          placeholder="On"
          onChange={this.onEqualChange}
          // onOpenChange={this.handleStartOpenChange}
          popupClassName="ag-custom-component-popup"
          style={{ width: '100%' }}
        />
        <br />
        <br />
        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            disabled={disableBtn}
            onClick={() =>
              this.setState(
                {
                  startValue: null,
                  endValue: null,
                  equalValue: null,
                  isFilterActive: false,
                },
                () => this.props.filterChangedCallback(),
              )
            }
            className="deselect-filter-btn"
            style={{ marginLeft: '5px', color: '#3f51b5' }}
          >
            Reset Filter
          </button>
          <button
            disabled={disableBtn}
            onClick={() =>
              this.setState({ isFilterActive: true }, this.props.filterChangedCallback)
            }
            className="apply-filter-btn "
            style={{ marginRight: '5px', color: '#3f51b5' }}
          >
            Apply Filter
          </button>
        </p>
      </div>
    );
  }
}

class TextFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      isFilterActive: false,
    };
  }

  isFilterActive = () => this.state.isFilterActive;

  doesFilterPass = () => true;

  getModel() {
    if (!this.state.isFilterActive) return null;
    const { value } = this.state;
    return value && { type: 'text', value };
  }

  setModel(model) {
    this.setState({
      value: model ? model.value : '',
      isFilterActive: model ? true : false,
    });
  }

  afterGuiAttached = () => {
    if (!this.state.isFilterActive) this.setState({ value: '' });
  };

  render() {
    const { value } = this.state;
    let disableBtn = false;
    if (!this.state.value) {
      disableBtn = true;
    }
    return (
      <div ref="tabBody" class="ag-tab-body" style={{ width: '230px' }}>
        <div class="ag-filter">
          <div>
            <div class="ag-filter-body-wrapper">
              <div class="ag-filter-body" role="presentation">
                <div class="ag-input-wrapper" role="presentation">
                  <input
                    class="ag-filter-filter"
                    style={{ padding: '10px' }}
                    type="text"
                    placeholder="Filter..."
                    value={value}
                    onChange={({ target: { value } }) => this.setState({ value })}
                  />
                </div>
              </div>
            </div>
            <div
              class="ag-filter-apply-panel"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <button
                disabled={disableBtn}
                style={{ marginLeft: '5px', color: '#3f51b5' }}
                type="button"
                onClick={() =>
                  this.setState({ value: '', isFilterActive: false }, () =>
                    this.props.filterChangedCallback(),
                  )
                }
                ref="eClearButton"
              >
                Reset Filter
              </button>
              <button
                type="button"
                style={{ marginRight: '5px', color: '#3f51b5' }}
                disabled={disableBtn}
                onClick={() =>
                  this.setState({ isFilterActive: true }, this.props.filterChangedCallback)
                }
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class NumberFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      greaterThanValue: '',
      lessThanValue: '',
      equalToValue: '',
      isFilterActive: false,
    };
  }

  setModel(model) {
    if (model) {
      const { gt, eq, lt } = model;
      this.setState({
        greaterThanValue: gt,
        lessThanValue: lt,
        equalToValue: eq,
        isFilterActive: true,
      });
    } else {
      this.setState({
        greaterThanValue: '',
        lessThanValue: '',
        equalToValue: '',
        isFilterActive: false,
      });
    }
  }

  isFilterActive = () => this.state.isFilterActive;

  doesFilterPass = () => true;

  getModel() {
    if (!this.state.isFilterActive) return null;
    const { greaterThanValue, lessThanValue, equalToValue } = this.state;
    return (
      ((greaterThanValue && lessThanValue) ||
        greaterThanValue ||
        lessThanValue ||
        equalToValue) && {
        type: 'number',
        gt: greaterThanValue,
        lt: lessThanValue,
        eq: equalToValue,
      }
    );
  }

  onChange = (field, event) => {
    let eTargetValue = event.target.value && event.target.value.replace('%', '');
    let obj = {};
    if (/^-?\d*[.,]?\d*$/.test(eTargetValue)) {
      if (field === 'greaterThanValue' || field === 'lessThanValue') {
        obj = { [field]: eTargetValue, equalToValue: '' };
      } else if (field === 'equalToValue') {
        obj = {
          [field]: eTargetValue,
          greaterThanValue: '',
          lessThanValue: '',
        };
      }
      this.setState({
        ...obj,
      });
    } else this.setState({ [field]: this.state[field] });
  };

  afterGuiAttached = () => {
    if (!this.state.isFilterActive) {
      this.setState({
        greaterThanValue: '',
        lessThanValue: '',
        equalToValue: '',
      });
    }
  };

  render() {
    const { greaterThanValue, lessThanValue, equalToValue } = this.state;
    let disableBtn = false;
    if (greaterThanValue === '' && lessThanValue === '' && equalToValue === '') {
      disableBtn = true;
    }
    return (
      <div ref="tabBody" class="ag-tab-body">
        <div class="ag-filter">
          <div>
            <div class="ag-filter-body-wrapper" style={{ padding: '10px' }}>
              <div class="ag-filter-body" role="presentation">
                <div class="ag-input-wrapper" role="presentation">
                  <ArrowForwardIosIcon className="icon" />
                  <input
                    class="ag-filter-filter"
                    type="text"
                    // placeholder=">"
                    value={greaterThanValue}
                    onChange={(event) => this.onChange('greaterThanValue', event)}
                  />
                </div>
                <div class="ag-input-wrapper" role="presentation">
                  <ArrowBackIosIcon className="icon" />
                  <input
                    class="ag-filter-filter"
                    type="text"
                    // placeholder="<"
                    value={lessThanValue}
                    onChange={(event) => this.onChange('lessThanValue', event)}
                  />
                </div>
                <div class="ag-input-wrapper" role="presentation">
                  <DragHandleIcon className="icon" />
                  <input
                    class="ag-filter-filter"
                    type="text"
                    // placeholder="="
                    value={equalToValue}
                    onChange={(event) => this.onChange('equalToValue', event)}
                  />
                </div>
              </div>
            </div>
            <div
              class="ag-filter-apply-panel"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <button
                disabled={disableBtn}
                style={{ marginLeft: '5px', color: '#3f51b5' }}
                type="button"
                onClick={() => {
                  this.setState(
                    {
                      greaterThanValue: '',
                      lessThanValue: '',
                      equalToValue: '',
                      isFilterActive: false,
                    },
                    () => {
                      this.props.filterChangedCallback();
                    },
                  );
                }}
              >
                Reset Filter
              </button>
              <button
                disabled={disableBtn}
                style={{ marginRight: '5px', color: '#3f51b5' }}
                type="button"
                onClick={() =>
                  this.setState({ isFilterActive: true }, this.props.filterChangedCallback)
                }
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { BooleanFilter, ListFilter, DateFilter, TextFilter, NumberFilter };
