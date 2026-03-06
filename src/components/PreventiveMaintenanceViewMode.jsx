import React, { Component } from 'react';
import CustomDrawer from './common/CustomDrawer';
import { createGenericSection } from '../utils/sectionUtils';
import Dates from '../core/utils/date';
import SharedAssetDetailsSection from './AssetDetails/SharedAssetDetailsSection';
import API from '../store/requests';
import PreventiveMaintenanceForm from './PreventiveMaintenanceForm';

class PreventiveMaintenanceViewMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRowDetail: props.showRowDetail !== undefined ? props.showRowDetail : true,
      showPMForm: false,
      loading: true,
      error: null,
      selectedRowData: null,
      isClosed: false,
      completionData: null,
      tableData: [],
    };
  }

  async componentDidMount() {
    const PreMainCallId = this.props?.selectedRowData?.PreMainCalId;
    try {
      const inputJson = JSON.stringify({
        PreMainCal: [{ PreMainCalId: PreMainCallId }],
      });

      const payload = {
        action: 'JsonRequest',
        RequestType: 'PreMainCal_Get',
        InputJson: inputJson,
      };

      console.log('FINAL GET PAYLOAD ===>', payload);

      const response = await API.triggerPost('Plant', payload);

      console.log('PreMainCal_Get response:', response.data);

      const item = response?.data?.data?.PreMainCal?.[0];
      if (item) {
        const selectedRowData = {
          PreMainLabelId: item.PreMainLabelId,
          PreMainStatus: item.PreMainStatus,
          ScheduleRecurring: item.ScheduleRecurring?.trim(),
          DayRemaining: item.DayRemaining,

          ...(item.CheckListJson?.[0]?.AssetJson?.[0] || {}),

          PreMainJson: JSON.stringify([
            {
              CheckListId: item.CheckListLabelId,
              PreMainType: item.PreMainType,
              CreatedDate: item.CreatedDate,
              DueDate: item.ScheduleDate || item.PreMainDate,
              DayRemaining: item.DayRemaining,
              ScheduleType: item.ScheduleType,
              ScheduleRecurring: item.ScheduleRecurring?.trim(),
              Remarks: item.Remarks,
            },
          ]),

          AssetJson: JSON.stringify(item.CheckListJson?.[0]?.AssetJson || []),
          IsClosed: item.IsClosed,
          CheckListLabelId: item.CheckListLabelId,
          CheckListId: item.CheckListId,
        };

        const completionData = {
          ManHoursSpent: item.ManHoursSpent,
          ManHourInText: item.ManHourInText,
          Cost: item.Cost,
          ActionTaken: item.ActionTaken,
          Spares: item.Spares,
          AssignedPerson: item.AssignedPerson,
          Attender: item.Attender,
          JobRole: item.JobRole,
          PreMainDescription: item.PreMainDescription,
          ClosedOn: item.ModifiedDate || item.PreMainDate,
          ClosedBy: item.ModifiedBy,
        };

        const preMainCLJson = item.PreMainCLItemJson || [];

        const tableData = preMainCLJson.map((pmItem, index) => ({
          id: pmItem.PreMainCLItemId || index,
          itemName: pmItem.ItemName || '',
          requiredParameter: pmItem.RequiredParameter || '',
          observedParameter: pmItem.ObservedParameter || '',
          actionTaken: pmItem.ActionTaken || '',
        }));

        this.setState({
          selectedRowData,
          completionData,
          isClosed: !!item.IsClosed,
          tableData,
          loading: false,
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching preventive maintenance calendar data:', error);
      this.setState({
        error: 'Failed to load preventive maintenance data',
        loading: false,
      });
    }
  }

  handleOpenPMForm = () => {
    console.log('PM Form button clicked');
    this.setState({ showPMForm: true });
  };

  handleClosePMForm = () => {
    this.setState({ showPMForm: false });
  };

  handleTableInputChange = (id, field, value) => {
    this.setState((prev) => ({
      tableData: prev.tableData.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
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
              /* ===== Purple Vertical Scrollbar ===== */

   .pm-scroll {
    scrollbar-width: thin;
    scrollbar-color: #6941C6 #F7FAFC;
  }

  .pm-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .pm-scroll::-webkit-scrollbar-track {
    background: #F7FAFC;
  }

  .pm-scroll::-webkit-scrollbar-thumb {
    background-color: #6941C6;
    border-radius: 6px;
  }

  .pm-scroll::-webkit-scrollbar-thumb:hover {
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
          <table className="w-full text-[13px] text-[#444]" style={{ minWidth: '1000px' }}>
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

                  {/* Item */}
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

                  {/* Required Parameter */}
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
                                'requiredParameter',
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

                  {/* Observed Parameter */}
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
                        width: '200px',
                        border: 'none',
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
                        width: '120px',
                        border: 'none',
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
    const { onClose, onSuccess } = this.props;
    const { PreMainCalId, PreMainId, CheckListId } = this.props.selectedRowData;
    const { showRowDetail, showPMForm, isClosed, completionData } = this.state;

    const selectedRowData = this.state.selectedRowData || this.props.selectedRowData || null;

    if (!showRowDetail && !showPMForm) {
      return null;
    }

    // Parse PM data (accept string or array)
    let pmData = null;
    try {
      if (selectedRowData && selectedRowData.PreMainJson) {
        let arr = null;
        if (typeof selectedRowData.PreMainJson === 'string') {
          arr = JSON.parse(selectedRowData.PreMainJson);
        } else if (Array.isArray(selectedRowData.PreMainJson)) {
          arr = selectedRowData.PreMainJson;
        }
        if (Array.isArray(arr) && arr.length > 0) pmData = arr[0];
      }
    } catch (err) {
      console.warn('Error parsing PreMainJson:', err);
    }

    // Parse Asset data (accept string or array)
    let assetData = null;
    try {
      if (selectedRowData && selectedRowData.AssetJson) {
        let arr = null;
        if (typeof selectedRowData.AssetJson === 'string') {
          arr = JSON.parse(selectedRowData.AssetJson);
        } else if (Array.isArray(selectedRowData.AssetJson)) {
          arr = selectedRowData.AssetJson;
        }
        if (Array.isArray(arr) && arr.length > 0) assetData = arr[0];
      }
    } catch (err) {
      console.warn('Error parsing AssetJson:', err);
    }
    const currentStatus = selectedRowData?.PreMainStatus;
    const statusColors =
      currentStatus === 'Completed'
        ? { text: '#12B76A', background: '#ECFDF3' }
        : { text: '#F79009', background: '#FFFAEB' };

    const statusBadge = currentStatus ? (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '23px',
          padding: '0 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          lineHeight: '20px',
          color: statusColors.text,
          backgroundColor: statusColors.background,
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'capitalize',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: statusColors.text,
          }}
        ></span>
        {currentStatus}
      </span>
    ) : null;

    const mainDrawerTitle = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>{selectedRowData?.PreMainLabelId}</span>
        {statusBadge}
      </div>
    );

    const ScheduleDetailsSection = () => {
      const data = pmData || {};

      return createGenericSection({
        title: 'Schedule Details',
        fields: [
          { key: 'CheckListId', title: 'Checklist ID' },
          { key: 'PreMainType', title: 'Type of Preventive Maintenance' },
          {
            key: 'CreatedDate',
            title: 'Create Date & Time',
            formatter: (v) => (v ? Dates.DateTimeWithLocalTimeZone(v) : '-'),
          },
          {
            key: 'DueDate',
            title: 'Due Date',
            formatter: (v) => (v ? Dates.standardDate(v) : '-'),
          },
          {
            key: 'DayRemaining',
            title: 'No. Of Days Due',
            formatter: (val) => (val && val !== '-' ? `${val}` : '-'),
          },
          { key: 'ScheduleRecurring', title: 'Recurring' },
          // { key: 'Remarks', title: 'Remarks' },
        ],
        rowData: data,
        columnCount: this.state.isClosed ? 4 : 2,
        styles: {
          header: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgb(105, 65, 198)',
            color: '#fff',
          },
          label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
          value: { fontSize: '11px', fontWeight: 600, margin: 0 },
        },
      });
    };

    // P.M Completion Details section
    const PMCompletionDetailsSection = () => {
      const data = completionData || {};

      return createGenericSection({
        title: 'Preventive Maintenance Completion Details',
        fields: [
          { key: 'ManHourInText', title: 'Man Hours Spent' },
          { key: 'ActionTaken', title: 'Action Taken' },
          { key: 'Spares', title: 'Spares Used' },
          { key: 'PreMainDescription', title: 'Description' },
          { key: 'AssignedPerson', title: 'Assigned Person' },
          { key: 'Attender', title: 'Attender' },
          { key: 'JobRole', title: 'Job Role' },
        ],
        rowData: data,
        columnCount: 4,
        styles: {
          header: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgb(105, 65, 198)',
            color: '#fff',
          },
          label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
          value: { fontSize: '11px', fontWeight: 600, margin: 0 },
        },
      });
    };
    const drawerWidth = isClosed ? '82%' : '700px';

    return (
      <>
        {/* Main PM Details Drawer */}
        <CustomDrawer
          open={showRowDetail}
          onClose={() => {
            this.setState({ showRowDetail: false });
            if (onClose) onClose();
          }}
          title={mainDrawerTitle}
          width={drawerWidth}
          destroyOnClose
          bodyStyle={{
            padding: '0',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            margin: '20px 0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Scrollable content */}
            <div
              className="pm-scroll"
              style={{
                flex: 1,
                overflowY: 'scroll',
                padding: '16px 24px',
                marginTop: '-16px',
                height: '200px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#6941C6 #F7FAFC',
              }}
            >
              <SharedAssetDetailsSection
                assetDetails={selectedRowData}
                selectedRowData={selectedRowData}
                isClosed={isClosed}
              />

              <div style={{ marginTop: '16px' }}>
                <ScheduleDetailsSection />
              </div>
              {isClosed && (
                <>
                  <div style={{ marginTop: '20px', width: '100%' }}>
                    <div
                      style={{
                        border: '1px solid lightgray',
                        borderRadius: '6px',
                        background: '#fff',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Header */}
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
                      </div>

                      {this.renderMaintenanceTable({
                        containerHeight: '200px',
                        disableSrNo: true,
                        canEditItemName: false,
                        canEditRequiredActions: false,
                        canEditObservedAction: false,
                        canEditParameters: false,
                      })}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <PMCompletionDetailsSection />
                  </div>
                </>
              )}
            </div>

            {/* Fixed Footer with P.M form button */}
            {!isClosed && (
              <div
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'flex-end',

                  flexShrink: 0,
                }}
              >
                <button
                  onClick={this.handleOpenPMForm}
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
                  Preventive Maintenance form
                </button>
              </div>
            )}
          </div>
        </CustomDrawer>

        {showPMForm && (
          <PreventiveMaintenanceForm
            showRowDetail={showPMForm}
            onClose={this.handleClosePMForm}
            onSuccess={onSuccess}
            PreMainCalId={PreMainCalId}
            PreMainId={PreMainId}
            CheckListId={CheckListId}
          />
        )}
      </>
    );
  }
}

export default PreventiveMaintenanceViewMode;
