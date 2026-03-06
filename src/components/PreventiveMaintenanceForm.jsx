import React, { Component } from 'react';
import CustomDrawer from './common/CustomDrawer';
import API from '../store/requests';
import SuccessModal from './common/SuccessModal';
import { Select } from 'antd';

class PreventiveMaintenanceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRowDetail: props.showRowDetail !== undefined ? props.showRowDetail : true,
      showMaintenanceEditDrawer: false,
      showSuccessModal: false,
      successMessage: '',
      focusedField: null,
      manHoursSpent: '',
      cost: '',
      actionTaken: '',
      spares: '',
      description: '',
      errors: {
        manHoursSpent: '',
        spares: '',
      },
      errorMessages: {
        manHoursSpent: '',
        spares: '',
        actionTaken: '',
        description: '',
      },
      tableData: [],
      manHoursHours: null,
      manHoursMinutes: null,
    };
    this.costInputRef = React.createRef();
  }

  componentDidMount = async () => {
    const checkListId = this.props.CheckListId;

    try {
      const payload = { Guid: checkListId };
      const response = await API.triggerPost('10821', { ...payload, action: 'LoadView' });

      if (response?.data?.CheckListItemJson) {
        const checkListItems =
          typeof response.data.CheckListItemJson === 'string'
            ? JSON.parse(response.data.CheckListItemJson)
            : response.data.CheckListItemJson;

        console.log('Parsed CheckList Items:', checkListItems);

        const transformedData = checkListItems.map((item, index) => ({
          id: item.CheckListItemId || index + 1,
          itemName: item.ItemName || '',
          requiredParameter: item.RequiredParameter || '',
          observedParameter: item.ObservedParameter || '',
          actionTaken: item.ActionTaken || '',
          createdDate: item.CreatedDate || null,
          createdBy: item.CreatedByUserName || '',
          modifiedBy: item.ModifiedByUserName || '',
          modifiedDate: item.ModifiedDate || null,
        }));

        this.setState({ tableData: transformedData });
        console.log('Maintenance Records updated with', transformedData.length, 'items');
      }
    } catch (error) {
      console.error('Error loading checklist items:', error);
    }
  };

  renderFieldError = (field) => {
    const activeMessage = this.state.errors[field];
    const fallbackMessage = this.state.errorMessages?.[field];
    const displayText = activeMessage || fallbackMessage || '';
    const isVisible = Boolean(activeMessage);

    return (
      <div
        style={{
          color: '#F04438',
          fontSize: 12,
          fontWeight: 500,
          marginTop: 4,
          lineHeight: '18px',
          maxHeight: isVisible ? 40 : 0,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.2s ease, max-height 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {displayText}
      </div>
    );
  };

  handleTableInputChange = (rowId, field, value) => {
    this.setState((prevState) => ({
      tableData: prevState.tableData.map((item) =>
        item.id === rowId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  validateCostFormat = (value) => {
    if (!value) return true; // Allow empty value
    const regex = /^\d+(\.\d{2})?$/;
    if (!regex.test(value)) {
      return false;
    }
    if (value.includes('.')) {
      const decimalPart = value.split('.')[1];
      return decimalPart.length === 2;
    }
    return false; // No decimal point means invalid format
  };

  handleCostChange = (e) => {
    let input = e.target.value;

    let raw = input.replace(/,/g, '');

    if (!/^\d*(\.\d{0,2})?$/.test(raw)) {
      return;
    }

    const [intPart, decPart] = raw.split('.');

    let formattedInt = intPart ? Number(intPart).toLocaleString('en-IN') : '';

    let formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;

    let errorMsg = '';

    if (raw.includes('.')) {
      if (!decPart || decPart.length < 2) {
        errorMsg = '';
      }
    } else {
      errorMsg = '';
    }

    this.setState({
      cost: formatted,
      errors: { ...this.state.errors, cost: errorMsg },
    });
  };

  handleCostBlur = () => {
    let cost = this.state.cost;
    if (cost) {
      let raw = cost.replace(/,/g, '');

      if (raw.includes('.')) {
        const parts = raw.split('.');
        if (parts[1].length === 1) {
          raw = raw + '0';
        } else if (parts[1].length === 0) {
          raw = raw + '00';
        } else if (parts[1].length > 2) {
          raw = parts[0] + '.' + parts[1].substring(0, 2);
        }
      } else {
        raw = raw + '.00';
      }

      const formattedCost = Number(raw).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      this.setState({ cost: formattedCost });
    }
    this.setState({ focusedField: null });
  };

  handleDeleteChecklist = () => {
    console.log('Delete Check List clicked');
  };

  // Submit Button Click
  handleSubmit = async () => {
    const { PreMainCalId, PreMainId } = this.props;

    // Validate form before proceeding
    const errors = {};
    let isValid = true;

    // Check if Man Hours fields are empty (null, undefined, or empty string)
    if (
      this.state.manHoursHours === null ||
      this.state.manHoursHours === undefined ||
      this.state.manHoursMinutes === null ||
      this.state.manHoursMinutes === undefined
    ) {
      errors.manHoursSpent = 'Man Hours Spent is required';
      isValid = false;
    }

    if (!this.state.spares?.trim()) {
      errors.spares = 'Spares is required';
      isValid = false;
    }

    this.setState({ errors });
    if (!isValid) {
      return; // Stop if validation fails
    }

    const hours = Number(this.state.manHoursHours) || 0;
    const minutes = Number(this.state.manHoursMinutes) || 0;

    const preMainCal = [
      {
        PreMainCalId: PreMainCalId,
        PreMainId: PreMainId,
        ManHoursSpent: hours * 60 + minutes,
        Cost: parseFloat((this.state.cost || '').replace(/,/g, '') || 0),
        ActionTaken: (this.state.actionTaken || '').trim(),
        Spares: (this.state.spares || '').trim(),
        // PreMainDescription: (this.state.description || '').trim(),
        AssignedPerson: this.state.assignedPerson || '',
        Attender: this.state.attender || '',
        JobRole: this.state.jobRole || '',
        PreMainCLItemJson: this.state.tableData.map((row) => ({
          ItemName: row.itemName || '',
          RequiredParameter: row.requiredParameter || '',
          ObservedParameter: row.observedParameter || '',
          ActionTaken: row.actionTaken || '',
        })),
      },
    ];

    const inputJson = JSON.stringify({ PreMainCal: preMainCal });
    const payload = {
      action: 'JsonRequest',
      RequestType: 'PreMainCal_Add',
      InputJson: inputJson,
    };

    console.log('FINAL SUBMIT PAYLOAD ===>', payload);

    try {
      const response = await API.triggerPost('Plant', payload);
      console.log('Insert success ===>', response);
      const successMessage = response?.data?.data?.Result?.[0]?.SucessMessage || 'Success';
      this.setState({ successMessage: successMessage, showSuccessModal: true });
    } catch (error) {
      console.error('Insert API error ===>', error);
    }
  };

  renderMaintenanceTable = (options = {}) => {
    const {
      containerHeight = '200px',
      disableSrNo = true,
      canEditItemName = true,
      canEditRequiredActions = true,
      canEditObservedAction = true,
      canEditParameters = true,
    } = options;

    const stickyThStyle = {
      position: 'sticky',
      top: 0,
      background: '#F9FAFB',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      textAlign: 'left',
      color: '#6B7280',
      zIndex: 10,
    };

    return (
      <>
        <style>
          {`
            .maintenance-table-container {
              scrollbar-width: thin;
              scrollbar-color: #B3B3B3 #F7FAFC;
            }
            .maintenance-table-container::-webkit-scrollbar {
              width: 12px;
              height: 12px;
            }
            .maintenance-table-container::-webkit-scrollbar-track {
              background: #F7FAFC;
              border-radius: 6px;
            }
            .maintenance-table-container::-webkit-scrollbar-thumb {
              background: #B3B3B3;
              border-radius: 6px;
              border: 2px solid #F7FAFC;
            }
            .maintenance-table-container::-webkit-scrollbar-thumb:hover {
              background: #999999;
            }
            .maintenance-table-container::-webkit-scrollbar-corner {
              background: #F7FAFC;
            }

            .pm-purple-scroll {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #6941C6 #F7FAFC;
  }

  .pm-purple-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .pm-purple-scroll::-webkit-scrollbar-track {
    background: #F7FAFC;
    border-radius: 6px;
  }

  .pm-purple-scroll::-webkit-scrollbar-thumb {
    background-color: #6941C6;
    border-radius: 6px;
    border: 2px solid #F7FAFC;
  }

  .pm-purple-scroll::-webkit-scrollbar-thumb:hover {
    background-color: #5331b8;
  }
          `}
        </style>

        <div
          className="maintenance-table-container"
          style={{
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: containerHeight,
            height: containerHeight,
            background: '#fff',
          }}
        >
          <table className="w-full text-[13px] text-[#444] " style={{ minWidth: '1000px' }}>
            <thead
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: '#F9FAFB',
              }}
              className="border-b border-[#E5E7EB]"
            >
              <tr>
                <th style={stickyThStyle}>S.No</th>
                <th style={stickyThStyle}>Item</th>
                <th style={stickyThStyle}>Required Parameter</th>

                <th style={stickyThStyle}>Observed Parameter</th>
                <th style={stickyThStyle}>Action Taken</th>
              </tr>
            </thead>

            <tbody>
              {this.state.tableData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#E5E7EB]"
                  style={{ backgroundColor: 'white' }}
                >
                  {/* Sr. No */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={String(index + 1).padStart(2, '0')}
                      disabled={disableSrNo}
                      style={{
                        width: '40px',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        backgroundColor: '#F9FAFB',
                        textAlign: 'center',
                        cursor: 'default',
                        opacity: 1,
                        WebkitTextFillColor: '#111827',
                      }}
                    />
                  </td>

                  {/* Item Name */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={item.itemName}
                      disabled={!canEditItemName}
                      onChange={
                        canEditItemName
                          ? (e) => this.handleTableInputChange(item.id, 'itemName', e.target.value)
                          : undefined
                      }
                      style={{
                        width: '150px',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                        cursor: canEditItemName ? 'text' : 'default',
                        opacity: 1,
                        WebkitTextFillColor: '#111827',
                      }}
                    />
                  </td>

                  {/* Required Actions */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={item.requiredParameter}
                      disabled={!canEditRequiredActions}
                      onChange={
                        canEditRequiredActions
                          ? (e) =>
                              this.handleTableInputChange(
                                item.id,
                                'requiredActions',
                                e.target.value,
                              )
                          : undefined
                      }
                      style={{
                        width: '250px',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                        cursor: canEditRequiredActions ? 'text' : 'default',
                        opacity: 1,
                        WebkitTextFillColor: '#111827',
                      }}
                    />
                  </td>

                  {/* Parameters */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={item.observedParameter}
                      disabled={!canEditObservedAction}
                      onChange={
                        canEditObservedAction
                          ? (e) =>
                              this.handleTableInputChange(
                                item.id,
                                'observedParameter',
                                e.target.value,
                              )
                          : undefined
                      }
                      style={{
                        width: '150px',
                        border: '1px solid #e3e3e3',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                        cursor: canEditObservedAction ? 'text' : 'default',
                        opacity: 1,
                        WebkitTextFillColor: '#111827',
                      }}
                    />
                  </td>
                  {/* Action Taken */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={item.actionTaken || ''}
                      disabled={!canEditObservedAction}
                      onChange={
                        canEditObservedAction
                          ? (e) =>
                              this.handleTableInputChange(item.id, 'actionTaken', e.target.value)
                          : undefined
                      }
                      style={{
                        width: '150px',
                        border: '1px solid #e3e3e3',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                        cursor: canEditObservedAction ? 'text' : 'default',
                        opacity: 1,
                        WebkitTextFillColor: '#111827',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  render() {
    const { showRowDetail, showMaintenanceEditDrawer, successMessage } = this.state;

    return (
      <>
        <style>
          {`
  /* Man Hours Select – 11px font everywhere */
  .man-hours-select .ant-select-selection-item {
    font-size: 11px !important;
  }

  .man-hours-select .ant-select-selection-placeholder {
    font-size: 11px !important;
  }

  .man-hours-select .ant-select-item-option-content {
    font-size: 11px !important;
  }

  .man-hours-select .ant-select-clear {
    font-size: 11px !important;
  }
`}
        </style>

        {/* Main Preventive Maintenance Drawer */}
        <CustomDrawer
          open={showRowDetail}
          onClose={() => {
            this.setState({ showRowDetail: false });
            if (this.props.onClose) this.props.onClose();
          }}
          title={
            <span style={{ textAlign: 'left', display: 'block' }}>Preventive Maintenance</span>
          }
          width="82%"
          zIndex={this.props.zIndex || 1300}
          destroyOnClose
          bodyStyle={{
            padding: '0',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 40px)',
            overflow: 'hidden',
            margin: '20px 0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Scrollable content */}
            <div
              className="pm-purple-scroll"
              style={{ flex: 1, overflowY: 'auto', padding: '0px 24px 16px', marginTop: '-16px' }}
            >
              <div style={{ marginTop: '20px', width: '100%' }}>
                <div
                  style={{
                    border: '1px solid lightgray',
                    borderRadius: '6px',
                    background: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {/* Header  */}
                  <div
                    style={{
                      background: 'rgb(105, 65, 198)',
                      color: '#ffffff',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Check List Items</span>

                    {/* <button
                      type="button"
                      onClick={() =>
                        this.setState({ showMaintenanceEditDrawer: true })
                      }
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        borderRadius: 4,
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button> */}
                  </div>

                  {this.renderMaintenanceTable({
                    containerHeight: '200px',
                    disableSrNo: true,
                    canEditItemName: false,
                    canEditRequiredActions: false,
                    canEditObservedAction: true,
                    canEditParameters: true,
                  })}
                </div>
              </div>
              <div
                style={{
                  background: 'rgb(105, 65, 198)',
                  border: '1px solid gray',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '6px 6px 0 0',
                  margin: '16px 0 -1px 0',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Preventive Maintenance Details
              </div>

              <div
                style={{
                  border: '1px solid lightgray',
                  borderTop: '0',
                  borderRadius: '0 0 6px 6px',
                  padding: '22px 25px 0px 25px',
                  margin: '0 0 16px 0',
                  background: '#fff',
                  position: 'relative',
                  zIndex: 0,
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    columnGap: 24,
                    rowGap: 24,
                  }}
                >
                  <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Man Hours Spent <span style={{ color: 'red' }}>*</span>
                    </label>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border:
                          this.state.focusedField === 'manHoursSpent'
                            ? '2px solid #3b3b3bff'
                            : '1px solid #EAECF0',
                        borderRadius: 8,
                        padding: '6px 8px',
                        marginTop: 6,
                        background: '#fff',
                        height: 44,
                        boxShadow: this.state.errors.manHoursSpent
                          ? '0 0 0 4px rgba(240,68,56,0.10)'
                          : '0 0 0 0 rgba(0,0,0,0)',
                      }}
                      onFocus={() => this.setState({ focusedField: 'manHoursSpent' })}
                      onBlur={() => this.setState({ focusedField: null })}
                    >
                      {/* Hours Select */}
                      <div style={{ width: 100, marginRight: 8 }}>
                        <Select
                          className="man-hours-select"
                          placeholder="Hrs"
                          value={this.state.manHoursHours}
                          onChange={(val) =>
                            this.setState({
                              manHoursHours: val,
                              errors: { ...this.state.errors, manHoursSpent: '' },
                            })
                          }
                          options={Array.from({ length: 25 }).map((_, i) => ({
                            label: String(i),
                            value: i,
                          }))}
                          style={{ width: '100%', fontSize: '11px' }}
                          allowClear
                        />
                      </div>

                      {/* Minutes Select */}
                      <div style={{ width: 110 }}>
                        <Select
                          className="man-hours-select"
                          placeholder="Min"
                          value={this.state.manHoursMinutes}
                          onChange={(val) =>
                            this.setState({
                              manHoursMinutes: val,
                              errors: { ...this.state.errors, manHoursSpent: '' },
                            })
                          }
                          options={Array.from({ length: 60 }).map((_, idx) => ({
                            label: String(idx).padStart(2, '0'),
                            value: idx,
                          }))}
                          style={{ width: '100%' }}
                          allowClear
                        />
                      </div>
                    </div>

                    {this.renderFieldError('manHoursSpent')}
                  </div>

                  <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Spares used <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                      placeholder="e.g., Keyboard, Battery, Cooling Fan..."
                      value={this.state.spares || ''}
                      onChange={(e) => {
                        this.setState({
                          spares: e.target.value,
                          errors: { ...this.state.errors, spares: '' },
                        });
                      }}
                      onFocus={() => this.setState({ focusedField: 'spares' })}
                      onBlur={() => this.setState({ focusedField: null })}
                      style={{
                        width: '100%',
                        height: 125,
                        border:
                          this.state.focusedField === 'spares'
                            ? '1px solid #666'
                            : '1px solid #EAECF0',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 11,
                        marginTop: 6,
                        resize: 'none',
                        background: '#fff',
                        boxShadow: this.state.errors.spares
                          ? '0 0 0 4px rgba(240,68,56,0.10)'
                          : '0 0 0 0 rgba(0,0,0,0)',
                      }}
                    />
                    {this.renderFieldError('spares')}
                  </div>

                  <div style={{ gridColumn: '3 / 4', gridRow: '1 / 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Action Taken
                    </label>
                    <textarea
                      placeholder="Describe the action taken..."
                      value={this.state.actionTaken || ''}
                      onChange={(e) => this.setState({ actionTaken: e.target.value })}
                      onFocus={() => this.setState({ focusedField: 'actionTaken' })}
                      onBlur={() => this.setState({ focusedField: null })}
                      style={{
                        width: '100%',
                        height: 125,
                        border:
                          this.state.focusedField === 'actionTaken'
                            ? '1px solid #666'
                            : '1px solid #EAECF0',
                        borderRadius: 8,
                        padding: '10px 12px',
                        fontSize: 11,
                        marginTop: 6,
                        resize: 'none',
                        background: '#fff',
                      }}
                    />
                    {this.renderFieldError('actionTaken')}
                  </div>

                  <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3', marginTop: '-108px' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Spares cost
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border:
                          this.state.focusedField === 'cost'
                            ? '2px solid #3b3b3bff'
                            : '1px solid #EAECF0',
                        borderRadius: 8,
                        padding: '0 12px',
                        marginTop: 6,
                        background: '#fff',
                        height: 44,
                        boxShadow: this.state.errors.cost
                          ? '0 0 0 4px rgba(240,68,56,0.10)'
                          : '0 0 0 0 rgba(0,0,0,0)',
                      }}
                    >
                      <span style={{ fontSize: 11, color: '#475467', marginRight: '5px' }}>₹</span>
                      <input
                        type="text"
                        placeholder="e.g., 1,23,400.45"
                        value={this.state.cost}
                        onChange={this.handleCostChange}
                        onFocus={() => this.setState({ focusedField: 'cost' })}
                        onBlur={() => this.setState({ focusedField: null })}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          padding: '10px 0',
                          fontSize: 11,
                          background: 'transparent',
                        }}
                      />
                    </div>
                    {this.renderFieldError('cost')}
                  </div>
                </div>
                {/* Assigned Person + Attender + Job Role Row */}
                <div
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginTop: '-10px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Assigned Person */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Assigned Person
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Person"
                      value={this.state.assignedPerson}
                      onChange={(e) => this.setState({ assignedPerson: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #EAECF0',
                        borderRadius: '8px',
                        padding: '0 12px',
                        fontSize: 11,
                        marginTop: 6,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Attender */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Attender
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Attender"
                      value={this.state.attender}
                      onChange={(e) => this.setState({ attender: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #EAECF0',
                        borderRadius: '8px',
                        padding: '0 12px',
                        fontSize: 11,
                        marginTop: 6,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Job Role */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Job Role
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Job Role"
                      value={this.state.jobRole}
                      onChange={(e) => this.setState({ jobRole: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #EAECF0',
                        borderRadius: '8px',
                        padding: '0 12px',
                        fontSize: 11,
                        marginTop: 6,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: '#ffffff',
              }}
            >
              <button
                type="button"
                onClick={this.handleSubmit}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgb(105, 65, 198)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </CustomDrawer>

        {/*  Edit Check List Items */}
        {/* <CustomDrawer
          open={showMaintenanceEditDrawer}
          onClose={() => this.setState({ showMaintenanceEditDrawer: false })}
          title={
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Edit Check List Items
            </div>
          }
          width="70%"
          destroyOnClose
          bodyStyle={{
            padding: '16px 24px 24px',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ marginTop: '8px' }}>
            {this.renderMaintenanceTable({
              containerHeight: '60vh',
              disableSrNo: true,
              canEditItemName: true,
              canEditRequiredActions: true,
              canEditObservedAction: true,
              canEditParameters: true,
            })}
          </div>
        </CustomDrawer> */}

        {this.state.showSuccessModal && (
          <SuccessModal
            open={this.state.showSuccessModal}
            onClose={() => {
              this.setState({ showSuccessModal: false, showRowDetail: false });

              if (this.props.onClose) this.props.onClose();
              if (this.props.onSuccess) this.props.onSuccess();
            }}
            title={successMessage}
            iconType="success"
            showCancelButton={false}
          />
        )}
      </>
    );
  }
}

export default PreventiveMaintenanceForm;
