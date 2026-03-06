import React, { Component } from 'react';
import GenericViewModal from '../common/GenericViewModal';
import CustomDrawer from './common/CustomDrawer';
import API from '../store/requests';
import { message, Button, Input, Modal, Select } from 'antd';
import SuccessModal from './common/SuccessModal';
import SharedAssetDetailsSection from './AssetDetails/SharedAssetDetailsSection';
import { createGenericSection } from '../utils/sectionUtils';
import Dates from '../core/utils/date';
import { formatBoolean } from '../core/utils';
import secureStorage from '../utils/secureStorage';

class BreakDownViewMode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRowDetail: props.showRowDetail || false,
      showBreakdownForm: false,
      showObservationForm: false,
      showSuccessModal: false,
      showEditBDModal: false,
      showCurrentStatusModal: false,
      complaintStatus: '1',
      manHoursSpent: '',
      manHoursHours: null,
      manHoursMinutes: null,
      cost: '',
      actionTaken: '',
      spares: '',
      description: '',
      rootCauseAnalysis: '',
      successTitle: '',
      successDescription: '',
      submittingComplaint: false,
      submittingCurrentStatus: false,
      currentMaintenanceType: 'Electrical',
      focusedField: null,
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
      assignedPerson: '',
      attender: '',
      jobRole: '',
    };
    this.costInputRef = React.createRef();
  }

  // Check if BreakDown menu has edit permissions
  getBreakDownEditStatus() {
    try {
      const menuData = JSON.parse(secureStorage.getItem('menu2') || '{}');
      const menuItems = menuData?.Menu?.[0]?.PlantMenu || [];

      for (const menu of menuItems) {
        const subItems = menu.PlantMenuSub || [];
        for (const subItem of subItems) {
          if (subItem.DisplayName === 'BreakDown') {
            return (subItem.IsEdit !== undefined ? subItem.IsEdit : true) === true;
          }
        }
      }
      return true; // Default to true if not found
    } catch (error) {
      console.error('Error getting BreakDown edit status:', error);
      return true; // Default to true on error
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.showRowDetail !== this.props.showRowDetail) {
      this.setState({ showRowDetail: this.props.showRowDetail });
    }

    if (prevState?.errors !== this.state.errors) {
      const updatedMessages = {};
      Object.keys(this.state.errors || {}).forEach((key) => {
        const value = this.state.errors[key];
        const prevValue = prevState?.errors ? prevState.errors[key] : undefined;
        if (value && value !== prevValue) {
          updatedMessages[key] = value;
        }
      });

      if (Object.keys(updatedMessages).length > 0) {
        this.setState((state) => ({
          errorMessages: {
            ...state.errorMessages,
            ...updatedMessages,
          },
        }));
      }
    }
  }

  showSuccess = (title, description) => {
    this.setState({
      showSuccessModal: true,
      successTitle: title,
      successDescription: description,
    });
  };

  renderSuccessModal = () => {
    const { showSuccessModal, successTitle, successDescription } = this.state;
    if (!showSuccessModal) return null;

    return (
      <div>
        <div
          onClick={() =>
            this.setState({
              showSuccessModal: false,
              showRowDetail: false,
              showBreakdownForm: false,
              showObservationForm: false,
              showEditBDModal: false,
            })
          }
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 820,
            maxWidth: '92vw',
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 18px 60px rgba(0,0,0,0.25)',
            padding: '32px 40px',
            zIndex: 1000,
            textAlign: 'left',
          }}
        >
          <button
            onClick={() =>
              this.setState({
                showSuccessModal: false,
                showRowDetail: false,
                showBreakdownForm: false,
                showObservationForm: false,
                showEditBDModal: false,
              })
            }
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.55)',
            }}
          >
            ×
          </button>

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: '#E6F9EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 7L9 18l-5-5"
                stroke="#12B76A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: '#101828' }}>
            {successTitle || 'Action Completed Successfully!'}
          </p>
          <p style={{ fontSize: 13, lineHeight: '22px', color: '#475467', margin: '0 0 18px 0' }}>
            {successDescription ||
              'Your action has been successfully recorded. The team has been notified.'}
          </p>

          <div style={{ borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />

          <button
            onClick={() =>
              this.setState({
                showSuccessModal: false,
                showRowDetail: false,
                showBreakdownForm: false,
                showObservationForm: false,
                showEditBDModal: false,
              })
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7F56D9',
              fontSize: 14,
              cursor: 'pointer',
              padding: '4px 0',
              borderBottom: '1px solid #7F56D9',
              width: 100,
              textAlign: 'center',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  openEditBDModal = () => {
    const formValues = this.getBreakdownFormInitialValues();
    this.setState({
      showEditBDModal: true,
      showRowDetail: false,
      ...formValues,
    });
  };

  handleCurrentStatus = () => {
    const currentStatusValues = this.getCurrentStatusInitialValues();

    this.setState({
      showCurrentStatusModal: true,
      showRowDetail: false,
      ...currentStatusValues,
    });
  };

  getCurrentStatusInitialValues = () => {
    const { selectedRowData = {}, assetDetails = {} } = this.props;
    let statusData = null;

    try {
      const breakdownRaw = assetDetails?.AssetBreakDownJson ?? selectedRowData?.AssetBreakDownJson;

      if (breakdownRaw) {
        const breakdownParsed =
          typeof breakdownRaw === 'string' ? JSON.parse(breakdownRaw) : breakdownRaw;

        if (Array.isArray(breakdownParsed) && breakdownParsed.length > 0) {
          const breakdownRecord = breakdownParsed[0];
          const statusRaw = breakdownRecord?.AssetBreakDownCurrentStatusJson;

          if (statusRaw) {
            const statusParsed = typeof statusRaw === 'string' ? JSON.parse(statusRaw) : statusRaw;

            if (Array.isArray(statusParsed) && statusParsed.length > 0) {
              statusData = statusParsed[statusParsed.length - 1];
            }
          }
        }
      }
    } catch (error) {}

    const description = statusData?.StatusDescription || '';
    const currentMaintenanceType = statusData?.BreakdownType || 'Electrical';

    return {
      description,
      currentMaintenanceType,
    };
  };

  getBreakdownRecord = () => {
    const { selectedRowData = {}, assetDetails = {} } = this.props;
    const raw = assetDetails?.AssetBreakDownJson ?? selectedRowData?.AssetBreakDownJson;

    if (!raw) return null;

    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0] || null;
      }
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn('Error parsing AssetBreakDownJson:', error);
    }

    return null;
  };

  getBreakdownFormInitialValues = () => {
    const { selectedRowData = {}, assetDetails = {} } = this.props;
    const record = this.getBreakdownRecord() || {};

    return {
      manHoursSpent:
        record?.ManHoursSpent ??
        selectedRowData?.ManHoursSpent ??
        assetDetails?.ManHoursSpent ??
        '',
      cost: record?.Cost ?? selectedRowData?.Cost ?? assetDetails?.Cost ?? '',
      actionTaken:
        record?.ActionTaken ?? selectedRowData?.ActionTaken ?? assetDetails?.ActionTaken ?? '',
      spares: record?.Spares ?? selectedRowData?.Spares ?? assetDetails?.Spares ?? '',
      description:
        record?.BreakDownDescription ??
        record?.Description ??
        selectedRowData?.BreakDownDescription ??
        selectedRowData?.Description ??
        assetDetails?.BreakDownDescription ??
        '',
      rootCauseAnalysis: record?.RCA ?? '',
    };
  };

  validateForm = () => {
    const errors = {};
    let isValid = true;

    if (this.state.manHoursHours === null && this.state.manHoursMinutes === null) {
      errors.manHoursSpent = 'Man Hours Spent is required';
      isValid = false;
    }

    if (!this.state.spares?.trim()) {
      errors.spares = 'Spares is required';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleBDUpdate = async () => {
    // Reset errors
    this.setState(
      {
        errors: { manHoursSpent: '', spares: '' },
      },
      async () => {
        if (!this.validateForm()) {
          return; // Stop if validation fails
        }

        const { selectedRowData: rowData } = this.props;
        const {
          manHoursHours,
          manHoursMinutes,
          cost,
          actionTaken,
          spares,
          description,
          rootCauseAnalysis,
          assignedPerson,
          attender,
          jobRole,
        } = this.state;

        // Calculate manHoursSpent from hours and minutes
        const hours = manHoursHours || 0;
        const minutes = manHoursMinutes || 0;
        const manHoursSpent = hours * 60 + minutes;

        try {
          this.setState({ submittingComplaint: true });
          let breakdownId = null;
          try {
            const parsed = JSON.parse(rowData?.AssetBreakDownJson || '[]');
            if (parsed.length && parsed[0]?.AssetBreakDownId) {
              breakdownId = parsed[0].AssetBreakDownId;
            }
          } catch (err) {
            console.warn('Error parsing AssetBreakDownJson:', err);
          }
          const payload = {
            AssetBreakDownId: breakdownId || '',
            AssetCompliantId: rowData?.AssetCompliantId || '',
            IsClosed: true,
            IsBreakDown: '1',
            ManHoursSpent: String(manHoursSpent || '0'),
            Cost: parseFloat((this.state.cost || '').replace(/,/g, '') || 0),
            ActionTaken: actionTaken || '',
            Spares: spares || '',
            RCA: rootCauseAnalysis || '',
            AssignedPerson: assignedPerson || '',
            Attender: attender || '',
            JobRole: jobRole || '',
            action: 'update',
          };

          const response = await API.triggerMultiPartPost('10745', payload);
          const ok = response?.success === true || response?.data?.success === true;

          if (!ok) {
            message.error(response?.Message || response?.data?.Message || 'Update failed');
            this.setState({ submittingComplaint: false });
            return;
          }

          if (ok) {
            this.setState({
              submittingComplaint: false,
              showEditBDModal: false,
              showRowDetail: false,
              showBreakdownForm: false,
              showObservationForm: false,
              showSuccessModal: true,
              successTitle: 'Breakdown Saved Successfully!',
              successDescription:
                'The Breakdown process has been successfully initiated. Our operational team has been notified and will take the required actions promptly.',
            });
          } else {
            const errorMessage =
              response?.Message ||
              response?.data?.Message ||
              response?.data?.info ||
              'Failed to save complaint';
            message.error(errorMessage);
            this.setState({ submittingComplaint: false });
          }
        } catch (e) {
          console.error(e);
          message.error('Error while updating breakdown details');
          this.setState({ submittingComplaint: false });
        }
      },
    );
  };

  CurrentStatusSection = () => {
    const data = this.props.assetDetails || this.props.selectedRowData || {};
    let currentStatusData = [];

    try {
      if (data?.AssetBreakDownJson) {
        const parsedData = JSON.parse(data.AssetBreakDownJson);
        if (
          Array.isArray(parsedData) &&
          parsedData.length > 0 &&
          parsedData[0]?.AssetBreakDownCurrentStatusJson
        ) {
          currentStatusData = parsedData[0].AssetBreakDownCurrentStatusJson;
        }
      }
    } catch (err) {
      console.warn('Error parsing AssetBreakDownCurrentStatusJson:', err);
    }

    if (currentStatusData.length === 0) {
      return null;
    }

    const latestStatus = currentStatusData[currentStatusData.length - 1];

    return createGenericSection({
      title: 'Current Status',
      fields: [
        { key: 'BreakdownType', title: 'Breakdown Type' },
        { key: 'CreatedByUserName', title: 'Created By' },
        {
          key: 'CreatedDate',
          title: 'Created Date',
          formatter: Dates.DateTimeWithLocalTimeZone,
        },
        // {
        //   key: 'StatusDescription',
        //   title: 'Remark',
        //   formatter: (value) => value || '-',
        //   formatter: (value) => value || '-',

        //   renderAsHTML: true,
        // },
      ],
      rowData: latestStatus,
      columnCount: 2,
      styles: {
        header: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgb(105, 65, 198)',
          color: '#fff',
        },
        label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
        value: { fontSize: '11px', fontWeight: 600, margin: 0 },
      },
    });
  };

  ComplaintDetailsSection = () => {
    const data = this.props.assetDetails || this.props.selectedRowData || {};
    const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
    let parsedAsset = null;

    try {
      if (data && typeof data.AssetJson === 'string') {
        const assetData = data.AssetJson;
        const arr = JSON.parse(assetData);

        if (Array.isArray(arr) && arr.length > 0) {
          parsedAsset = arr[0];
        }
      }
    } catch (err) {
      console.warn('Error parsing AssetJson:', err);
      parsedAsset = null;
    }
    return createGenericSection({
      title: (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Complaint Details</p>
            <span
              style={{
                background:
                  data?.CompliantPriorityStatus === 'High'
                    ? '#F04438'
                    : data?.CompliantPriorityStatus === 'Medium'
                      ? 'rgb(2, 122, 72)'
                      : '#FDB022',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {data?.CompliantPriorityStatus}
            </span>
          </div>
        </>
      ),
      fields: [
        {
          key: 'AssetCompliantId',
          title: 'Asset Compliant Id',
          formatter: () => data['Asset Compliant Id'] || data.AssetCompliantLabelId || '-',
        },
        {
          key: 'EquipmentId',
          title: 'Equipment Id',
          formatter: () => parsedAsset?.EquipmentId || '-',
        },
        {
          key: 'CompliantPriority',
          title: 'Priority',
          formatter: (value) => priorityMap[value] || String(value ?? '-'),
        },
        {
          key: 'OperationalStatus',
          title: 'Operational Status',
          formatter: (value) =>
            typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '-'),
        },
        { key: 'CompliantDescription', title: 'Description' },
        { key: 'CreatedByUserName', title: 'Created By' },
        { key: 'ModifiedByUserName', title: 'Modified By' },
        { key: 'CreatedDate', title: 'Created Date', formatter: Dates.DateTimeWithLocalTimeZone },
      ],
      rowData: data,
      columnCount: 2,
      styles: {
        header: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgb(105, 65, 198)',
          color: '#fff',
        },
        label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
        value: { fontSize: '11px', fontWeight: 600, margin: 0 },
      },
    });
  };

  render() {
    const { selectedRowData, assetDetails, onSuccess, onClose } = this.props;

    // Check BreakDown edit permissions
    const isBreakDownEditAllowed = this.getBreakDownEditStatus();

    const parseIsClosedFlag = (json) => {
      if (!json) return false;
      try {
        const parsed = JSON.parse(json || '[]');
        return Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.IsClosed === true;
      } catch (err) {
        return false;
      }
    };

    const assetBreakDownIsClosedFlag = parseIsClosedFlag(selectedRowData?.AssetBreakDownJson);
    const assetObservationIsClosedFlag = parseIsClosedFlag(selectedRowData?.AssetObservationJson);
    const isStatusClosed = assetBreakDownIsClosedFlag || assetObservationIsClosedFlag;

    const statusColors = isStatusClosed
      ? { text: '#12B76A', background: '#ECFDF3' }
      : { text: '#F79009', background: '#FFFAEB' };

    const statusBadge = selectedRowData?.CompliantStatus ? (
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
        {selectedRowData.CompliantStatus}
      </span>
    ) : null;
    const {
      showRowDetail,
      showBreakdownForm,
      showObservationForm,
      showSuccessModal,
      showEditBDModal,
      showCurrentStatusModal,
    } = this.state;

    if (
      !showRowDetail &&
      !showBreakdownForm &&
      !showObservationForm &&
      !showSuccessModal &&
      !showEditBDModal &&
      !showCurrentStatusModal
    ) {
      return null;
    }

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
     /* ===== Purple Vertical Scrollbar  ===== */

  .purple-scroll {
    scrollbar-width: thin;
    scrollbar-color: #6941C6 #F7FAFC;
  }

  .purple-scroll::-webkit-scrollbar {
    width: 10px;
  }

  .purple-scroll::-webkit-scrollbar-track {
    background: #F7FAFC;
    border-radius: 6px;
  }

  .purple-scroll::-webkit-scrollbar-thumb {
    background-color: #6941C6;
    border-radius: 6px;
    border: 2px solid #F7FAFC;
  }

  .purple-scroll::-webkit-scrollbar-thumb:hover {
    background-color: #5331b8;
  }
`}
        </style>
        <SuccessModal
          open={this.state.showSuccessModal}
          onClose={() => {
            this.setState({ showSuccessModal: false });

            if (this.props.onClose) this.props.onClose();
            if (this.props.onSuccess) this.props.onSuccess();
          }}
          title={this.state.successTitle}
          message={this.state.successDescription}
          buttonText="Dismiss"
          iconType="success"
        />

        {/* ==================== MAIN DETAIL MODAL ==================== */}
        {showRowDetail && selectedRowData && (
          <CustomDrawer
            open={showRowDetail}
            onClose={() => {
              this.setState({ showRowDetail: false });
              if (onClose) onClose();
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >{`${selectedRowData.AssetCompliantLabelId}`}</span>
                {statusBadge}
              </div>
            }
            width="720px"
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
              <div
                className="purple-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '0px 24px 16px' }}
              >
                {/* ==================== Asset Details ==================== */}
                <SharedAssetDetailsSection
                  assetDetails={assetDetails}
                  selectedRowData={selectedRowData}
                />

                {/* ==================== Complaint Details ==================== */}
                {this.ComplaintDetailsSection()}

                {/* ==================== Current Status ==================== */}
                {this.CurrentStatusSection()}
              </div>

              {/* Footer Section */}
              <div
                style={{
                  padding: '24px',

                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff',
                }}
              >
                {/* Only show buttons if BreakDown edit is allowed */}
                {isBreakDownEditAllowed && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={this.handleCurrentStatus}
                      style={{
                        borderColor: '#7F56D9',
                        color: '#7F56D9',
                        backgroundColor: 'transparent',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(127, 86, 217, 0.1)',
                          borderColor: '#7F56D9',
                        },
                      }}
                    >
                      Current Status
                    </Button>

                    <Button
                      type="primary"
                      onClick={this.openEditBDModal}
                      style={{
                        background: '#047857',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(4,120,87,0.25)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#065F46')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#047857')}
                    >
                      Breakdown form
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CustomDrawer>
        )}

        {/* ==================== EDIT B.D DETAILS ==================== */}
        <CustomDrawer
          open={showEditBDModal}
          onClose={() => this.setState({ showEditBDModal: false })}
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span>Edit Breakdown Details</span>
              {/* <span style={{ fontSize: '12px', opacity: 0.8 }}>
                Last Update: {new Date().toLocaleDateString()}
              </span> */}
            </div>
          }
          width="700px"
          headerStyle={{
            padding: '16px 24px',
            backgroundColor: 'rgb(105, 65, 198)',
            color: '#ffffff',
            margin: 0,
          }}
          bodyStyle={{
            padding: '0',
            backgroundColor: '#fff',
            height: '100%',
            overflow: 'hidden',
          }}
          containerStyle={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {this.renderBDForm('edit')}
        </CustomDrawer>

        {/* ==================== CURRENT STATUS ==================== */}
        <CustomDrawer
          open={showCurrentStatusModal}
          onClose={() => this.setState({ showCurrentStatusModal: false })}
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span>Breakdown Current Status</span>
            </div>
          }
          width={600}
          headerStyle={{
            padding: '16px 24px',
            backgroundColor: 'rgb(105, 65, 198)',
            color: '#ffffff',
            margin: 0,
          }}
          bodyStyle={{
            padding: '0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {this.renderCurrentStatusContent()}
        </CustomDrawer>
      </>
    );
  }
  validateCostFormat = (value) => {
    if (!value) return true; // Allow empty value
    const regex = /^\d+(\.\d{2})?$/;
    if (!regex.test(value)) {
      return false;
    }
    // If decimal exists, it must have exactly 2 digits
    if (value.includes('.')) {
      const decimalPart = value.split('.')[1];
      return decimalPart.length === 2;
    }
    return false; // No decimal point means invalid format
  };

  handleCostChange = (e) => {
    let input = e.target.value;

    //  Remove commas
    let raw = input.replace(/,/g, '');

    if (!/^\d*(\.\d{0,2})?$/.test(raw)) {
      return;
    }

    //  Split integer & decimal
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
  renderBDForm = (mode) => {
    const isEdit = mode === 'edit';
    const { errors, errorMessages } = this.state;
    const renderFieldError = (field) => {
      const activeMessage = errors[field];
      const fallbackMessage = errorMessages?.[field];
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

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Scrollable Content Area */}
        <div
          className="purple-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '25px 25px 0px',
          }}
        >
          <div style={{ paddingBottom: '25px' }}>
            {/* ===== GRID WITH RCA ROW-SPAN ===== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr',
                gap: '17px',
                marginBottom: '28px',
              }}
            >
              {/* Man Hours Spent */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                  Man Hours Spent <span style={{ color: 'red' }}>*</span>
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 40,
                    border: '1px solid #E5E7EB',
                    borderRadius: 5,
                    padding: '0 10px',
                    marginTop: 6,
                    background: '#fff',
                  }}
                >
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
                      label: i,
                      value: i,
                    }))}
                    style={{ width: '45%', fontSize: 11 }}
                    allowClear
                  />

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
                    options={Array.from({ length: 60 }).map((_, i) => ({
                      label: String(i).padStart(2, '0'),
                      value: i,
                    }))}
                    style={{ width: '48%', fontSize: 11 }}
                    allowClear
                  />
                </div>
                {renderFieldError('manHoursSpent')}
              </div>

              {/* Spares Cost */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                  Spares cost
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    border: '1px solid #E5E7EB',
                    borderRadius: 5,
                    padding: '0 10px',
                    marginTop: 6,
                    background: '#fff',
                  }}
                >
                  <span style={{ fontSize: 11, marginRight: 6 }}>₹</span>
                  <input
                    type="text"
                    placeholder="e.g., 1,23,400.45"
                    value={this.state.cost}
                    onChange={this.handleCostChange}
                    onBlur={this.handleCostBlur}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: 11,
                      background: 'transparent',
                    }}
                  />
                </div>
                {renderFieldError('cost')}
              </div>

              {/* Root Cause Analysis (2 rows) */}
              <div style={{ gridRow: 'span 2' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                  Root Cause Analysis
                </label>

                <textarea
                  placeholder="Add any additional notes..."
                  value={this.state.rootCauseAnalysis}
                  onChange={(e) => this.setState({ rootCauseAnalysis: e.target.value })}
                  style={{
                    width: '100%',
                    height: '20%',
                    minHeight: 125,
                    border: '1px solid #E5E7EB',
                    borderRadius: 5,
                    padding: '10px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                    background: '#fff',
                  }}
                />
              </div>

              {/* Spares Used */}
              <div style={{ marginTop: '-7px' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                  Spares used <span style={{ color: 'red' }}>*</span>
                </label>

                <textarea
                  placeholder="e.g. Keyboard, Battery"
                  value={this.state.spares}
                  onChange={(e) =>
                    this.setState({
                      spares: e.target.value,
                      errors: { ...this.state.errors, spares: '' },
                    })
                  }
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #E5E7EB',
                    borderRadius: 5,
                    padding: '10px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                  }}
                />
                {renderFieldError('spares')}
              </div>

              {/* Action Taken */}
              <div style={{ marginTop: '-7px' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                  Action Taken
                </label>

                <textarea
                  placeholder="Describe the action taken"
                  value={this.state.actionTaken}
                  onChange={(e) => this.setState({ actionTaken: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #E5E7EB',
                    borderRadius: 5,
                    padding: '10px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            {/* Assigned / Attender / Job Role */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '17px',
                marginBottom: '40px',
                marginTop: '-20px',
              }}
            >
              {['Assigned Person', 'Attender', 'Job Role'].map((label, i) => {
                const key = ['assignedPerson', 'attender', 'jobRole'][i];
                return (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: 'rgb(52, 64, 84)' }}>
                      {label}
                    </label>
                    <input
                      placeholder={`Enter ${label}`}
                      value={this.state[key]}
                      onChange={(e) => this.setState({ [key]: e.target.value })}
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #E5E7EB',
                        borderRadius: 5,
                        padding: '0 10px',
                        fontSize: 11,
                        marginTop: 6,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            flexShrink: 0,
          }}
        >
          {isEdit && (
            <button
              onClick={this.handleBDUpdate}
              disabled={this.state.submittingComplaint}
              style={{
                background: '#6740C1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: this.state.submittingComplaint ? 0.7 : 1,
              }}
            >
              {this.state.submittingComplaint ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    );
  };

  handleCurrentStatusSubmit = async () => {
    const { selectedRowData } = this.props;

    this.setState({ submittingCurrentStatus: true });

    try {
      const { description, currentMaintenanceType } = this.state;

      const payload = {
        AssetBreakDownId:
          JSON.parse(selectedRowData?.AssetBreakDownJson || '[{}]')?.[0]?.AssetBreakDownId || '',
        StatusDescription: description || '',
        BreakdownType: currentMaintenanceType || 'Electrical',
        action: 'insert',
      };

      const response = await API.triggerMultiPartPost('10823', payload);

      const isSuccess = response?.success === true || response?.data?.success === true;

      if (isSuccess) {
        this.setState({
          submittingCurrentStatus: false,
          showCurrentStatusModal: false,
          showRowDetail: false,
          showSuccessModal: true,
          successTitle: 'Current Status Saved Successfully!',
          successDescription:
            'The current breakdown status has been successfully saved. Our operational team has been notified.',
        });

        if (this.props.onSuccess) {
          this.props.onSuccess();
        }
      } else {
        const errorMessage =
          response?.Message ||
          response?.data?.Message ||
          response?.data?.info ||
          'Failed to save current status';
        message.error(errorMessage);
        this.setState({ submittingCurrentStatus: false });
      }
    } catch (error) {
      console.error('handleCurrentStatusSubmit error:', error);
      alert('Error while saving current status');
      this.setState({ submittingCurrentStatus: false });
    }
  };

  renderCurrentStatusContent = () => {
    const { selectedRowData, assetDetails } = this.props;
    const breakdownRecord = this.getBreakdownRecord();

    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="purple-scroll"
          style={{
            padding: '24px 24px 32px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '11px', fontWeight: 500 }}>Description</label>
              <Input.TextArea
                placeholder="Enter description"
                value={this.state.description}
                onChange={(e) => this.setState({ description: e.target.value })}
                style={{ marginTop: '6px' }}
                rows={4}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '12px' }}>
              Type of Breakdown
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
              >
                <input
                  type="radio"
                  name="preventiveMaintenanceType"
                  value="Electrical"
                  checked={this.state.currentMaintenanceType === 'Electrical'}
                  onChange={() => this.setState({ currentMaintenanceType: 'Electrical' })}
                  style={{ accentColor: '#7F56D9' }}
                />
                Electrical
              </label>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
              >
                <input
                  type="radio"
                  name="preventiveMaintenanceType"
                  value="Mechanical"
                  checked={this.state.currentMaintenanceType === 'Mechanical'}
                  onChange={() => this.setState({ currentMaintenanceType: 'Mechanical' })}
                  style={{ accentColor: '#7F56D9' }}
                />
                Mechanical
              </label>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            padding: '24px 24px 32px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            onClick={this.handleCurrentStatusSubmit}
            loading={Boolean(this.state.submittingCurrentStatus)}
            style={{
              background: 'rgb(105, 65, 198)',
              borderColor: 'rgb(105, 65, 198)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'white',
            }}
          >
            {this.state.submittingCurrentStatus ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  };
}

export default BreakDownViewMode;
