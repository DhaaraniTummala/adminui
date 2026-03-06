import React, { Component } from 'react';
import CustomDrawer from './common/CustomDrawer';
import API from '../store/requests';
import { Button, Tooltip, Input, message, Modal, Switch, Select } from 'antd';
import { createGenericSection } from '../utils/sectionUtils';
import Dates from '../core/utils/date';
import { formatBoolean } from '../core/utils';
import SuccessModal from './common/SuccessModal';
import AssetDetailsDisplay from './AssetDetails/AssetDetailsDisplay';
import { ComplaintStatusCellRenderer } from './ag-grid/ag-grid-components';
import secureStorage from '../utils/secureStorage';

const modal = Modal;

class ComplaintViewMode extends Component {
  constructor(props) {
    super(props);
    console.log('ComplaintViewMode constructor called with props:', props);
    this.state = {
      showRowDetail: props.showRowDetail || false,
      complaintStatus: '1',
      showBreakdownForm: false,
      showObservationForm: false,
      showSuccessModal: false,
      isUpdatingScroll: false,
      isEditingObservation: false,
      focusedField: null,
      errors: {},
      isAdmin: false,
      isClose: false,
      rca: '',
      manHoursHours: null,
      manHoursMinutes: null,
      isEditingBreakdown: false,
    };
    console.log('ComplaintViewMode initial state:', this.state);
    this.modalBodyRef = React.createRef();
    this.observationModalRef = React.createRef();
    this.costInputRef = React.createRef();

    // Bind methods
    this.openBreakdownEdit = this.openBreakdownEdit.bind(this);
    this.openObservationEdit = this.openObservationEdit.bind(this);
  }

  setIsClose = (value) => {
    this.setState({ isClose: value });
  };

  componentDidMount() {
    const isAdmin = secureStorage.getItem('isAdmin') === 'true';
    this.setState({ isAdmin });
  }

  getBreakdownRecord = () => {
    const { assetDetails = {}, selectedRowData = {} } = this.props;
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

  normalizeBreakdownClosed = (record) => {
    if (!record) {
      console.log('No breakdown record provided');
      return false;
    }
    const status = record?.IsClosed ?? record?.isClosed ?? record?.is_closed;
    console.log('Breakdown record status:', { status, record });
    if (status === true || status === 'true' || status === 1 || status === '1') return true;
    if (typeof status === 'string') {
      return status === '1' || status.toLowerCase() === 'true' || status.toLowerCase() === 'yes';
    }
    if (typeof status === 'number') {
      return status === 1;
    }
    return false;
  };

  formatBreakdownDate = (value, fallbackRow = {}) => {
    const fallback =
      value ??
      fallbackRow?.CompleteDate ??
      fallbackRow?.CompletedOn ??
      fallbackRow?.CompleteDateTime ??
      fallbackRow?.CompletedTime ??
      fallbackRow?.ClosedOn ??
      this.props.selectedRowData?.CreatedDate;

    if (!fallback) return '-';

    try {
      const date = new Date(String(fallback).endsWith('Z') ? fallback : `${fallback}Z`);
      if (Number.isNaN(date.getTime())) {
        return typeof fallback === 'string' ? fallback : String(fallback);
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('en-IN', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return `${day}/${month}/${year} ${displayHour}:${minutes} ${suffix}`;
    } catch (error) {
      return typeof fallback === 'string' ? fallback : String(fallback);
    }
  };

  getBreakdownFormInitialValues = () => {
    const { assetDetails = {}, selectedRowData = {} } = this.props;
    const record = this.getBreakdownRecord() || {};

    // Get total man hours spent in minutes
    const totalMinutes =
      record?.ManHoursSpent ?? selectedRowData?.ManHoursSpent ?? assetDetails?.ManHoursSpent ?? 0;

    // Convert total minutes to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      manHoursHours: hours,
      manHoursMinutes: minutes,
      cost: (() => {
        const rawCost = record?.Cost ?? selectedRowData?.Cost ?? assetDetails?.Cost ?? '0';
        // Format cost with commas for display
        const numericCost = parseFloat(String(rawCost).replace(/,/g, '')) || 0;
        return numericCost.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      })(),
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
      rca: record?.RCA ?? '',
      assignedPerson: record?.AssignedPerson ?? '',
      attender: record?.Attender ?? '',
      jobRole: record?.JobRole ?? '',
    };
  };

  openBreakdownEdit() {
    try {
      console.log('openBreakdownEdit called');
      const formValues = this.getBreakdownFormInitialValues();
      console.log('Form values:', formValues);

      this.setState(
        {
          showBreakdownForm: true,
          showRowDetail: false,
          complaintStatus: '1',
          isEditingBreakdown: true,
          ...formValues,
        },
        () => {
          console.log('State after opening breakdown edit:', this.state);
        },
      );
    } catch (error) {
      console.error('Error in openBreakdownEdit:', error);
    }
  }

  openObservationEdit() {
    try {
      console.log('openObservationEdit called');
      const formValues = this.getObservationFormInitialValues();
      console.log('Form values:', formValues);

      this.setState(
        {
          showObservationForm: true,
          showRowDetail: false,
          complaintStatus: '0',
          isEditingObservation: true,
          ...formValues,
        },
        () => {
          console.log('State after opening observation edit:', this.state);
        },
      );
    } catch (error) {
      console.error('Error in openObservationEdit:', error);
    }
  }

  getObservationFormInitialValues = () => {
    const { assetDetails = {}, selectedRowData = {} } = this.props;
    let obsData = {};
    try {
      const raw = assetDetails?.AssetObservationJson ?? selectedRowData?.AssetObservationJson;
      if (raw && typeof raw === 'string') {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) obsData = arr[0];
      }
    } catch (error) {
      console.warn('Error parsing AssetObservationJson:', error);
      obsData = {};
    }
    const totalMinutes =
      obsData?.ManHoursSpent ?? selectedRowData?.ManHoursSpent ?? assetDetails?.ManHoursSpent ?? 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      manHoursHours: hours,
      manHoursMinutes: minutes,
      cost: (() => {
        const rawCost = obsData?.Cost ?? selectedRowData?.Cost ?? assetDetails?.Cost ?? '0';
        // Format cost with commas for display
        const numericCost = parseFloat(String(rawCost).replace(/,/g, '')) || 0;
        return numericCost.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      })(),

      actionTaken:
        obsData?.ActionTaken ?? selectedRowData?.ActionTaken ?? assetDetails?.ActionTaken ?? '',
      spares: obsData?.Spares ?? selectedRowData?.Spares ?? assetDetails?.Spares ?? '',
      description:
        obsData?.ObservationDescription ??
        selectedRowData?.ObservationDescription ??
        assetDetails?.ObservationDescription ??
        '',
      isClose: obsData?.IsClosed === true,
      rca: obsData?.RCA ?? '',
      assignedPerson:
        obsData?.AssignedPerson ??
        selectedRowData?.AssignedPerson ??
        assetDetails?.AssignedPerson ??
        '',

      attender: obsData?.Attender ?? selectedRowData?.Attender ?? assetDetails?.Attender ?? '',

      jobRole: obsData?.JobRole ?? selectedRowData?.JobRole ?? assetDetails?.JobRole ?? '',
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

  renderFieldError = (field) => {
    const activeMessage = this.state.errors[field];
    const displayText = activeMessage || '';
    const isVisible = Boolean(activeMessage);

    return (
      <div
        style={{
          color: '#F04438',
          fontSize: 11,
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

  componentDidUpdate(prevProps) {
    console.log('ComplaintViewMode componentDidUpdate called');
    console.log('Previous props:', prevProps);
    console.log('Current props:', this.props);

    if (prevProps.showRowDetail !== this.props.showRowDetail) {
      console.log(
        'showRowDetail prop changed from',
        prevProps.showRowDetail,
        'to',
        this.props.showRowDetail,
      );
      this.setState({ showRowDetail: this.props.showRowDetail });
    }
    console.log('Admin status:', { isAdmin: this.isAdmin });
  }

  // Success Modal
  showSuccess = (title, description) => {
    this.setState({
      showSuccessModal: true,
      successTitle: title,
      successDescription: description,
    });
  };

  //Success Modal UI
  renderSuccessModal = () => {
    const { showSuccessModal, successTitle, successDescription } = this.state;
    if (!showSuccessModal) return null;

    return (
      <div>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />

        {/* Centered Modal */}
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: '12px',
            padding: '32px 40px',
            width: '800px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'left',
            zIndex: 1000,
          }}
        >
          {/* Close button */}
          <button
            onClick={() =>
              this.setState({
                showSuccessModal: false,
                showRowDetail: false,
                showBreakdownForm: false,
                showObservationForm: false,
                isEditingBreakdown: false,
              })
            }
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'rgba(0,0,0,0.6)',
            }}
          >
            ×
          </button>

          {/* Green Icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              background: '#E6F9EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <img src="Verify.png" alt="success" style={{ width: '28px', height: '28px' }} />
          </div>

          {/* Title */}
          <p
            style={{
              margin: '0 0 5px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#101828',
            }}
          >
            {successTitle || 'Action Completed Successfully!'}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: '12px',
              lineHeight: '22px',
              color: '#475467',
              marginBottom: '24px',
            }}
          >
            {successDescription ||
              'Your action has been successfully recorded. The team has been notified.'}
          </p>

          {/* Divider */}
          <div
            style={{
              borderTop: '1px solid #E5E7EB',
              marginBottom: '16px',
            }}
          ></div>

          <button
            onClick={() =>
              this.setState({
                showSuccessModal: false,
                showRowDetail: false,
                showBreakdownForm: false,
                showObservationForm: false,
                isEditingBreakdown: false,
              })
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7F56D9',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px 0',
              display: 'inline-block',
              borderBottom: '1px solid #7F56D9',
              width: '100px',
              textAlign: 'center',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  editBreakdownSubmit = async () => {
    const { selectedRowData, onClose, onSuccess } = this.props;

    this.setState({ submittingComplaint: true });

    try {
      const {
        cost,
        actionTaken,
        spares,
        description,
        rca,
        isClose,
        manHoursHours,
        manHoursMinutes,
      } = this.state;
      const breakdownRecord = this.getBreakdownRecord();
      const hours = manHoursHours || 0;
      const minutes = manHoursMinutes || 0;

      const payload = {
        AssetBreakDownId:
          breakdownRecord?.AssetBreakDownId || selectedRowData?.AssetBreakDownId || '',
        AssetCompliantId: selectedRowData?.AssetCompliantId || '',
        IsBreakDown: 1,
        ManHoursSpent: hours * 60 + minutes || '0',
        Cost: String(cost || '0').replace(/,/g, ''),
        ActionTaken: actionTaken || '',
        Spares: spares || '',
        BreakDownDescription: description || '',
        IsClosed: !this.state.isClose,
        RCA: rca || '',
        AssignedPerson: this.state.assignedPerson || '',
        Attender: this.state.attender || '',
        JobRole: this.state.jobRole || '',
        action: 'update',
      };

      console.log('Final Payload:', payload);

      const response = await API.triggerMultiPartPost('10745', payload);

      const isSuccess = response?.success === true || response?.data?.success === true;

      if (isSuccess) {
        this.setState({
          submittingComplaint: false,
          showRowDetail: false,
          showBreakdownForm: false,
          showObservationForm: false,
          showSuccessModal: true,
          successTitle: 'Breakdown Update Successfully!',
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
    } catch (error) {
      console.error('saveComplaint error:', error);
      alert('Error while saving complaint');
      this.setState({ submittingComplaint: false });
    }
  };
  // Submit Breakdown
  handleBreakdownSubmit = async () => {
    const { selectedRowData, onClose, onSuccess } = this.props;

    this.setState({ submittingComplaint: true });

    try {
      const { manHoursSpent, cost, actionTaken, spares, description, complaintStatus } = this.state;

      const payload = {
        AssetCompliantId: selectedRowData?.AssetCompliantId || '',

        action: 'insert',
      };

      console.log('Final Payload:', payload);

      const response = await API.triggerMultiPartPost('10745', payload);

      const isSuccess = response?.success === true || response?.data?.success === true;

      if (isSuccess) {
        this.setState({
          submittingComplaint: false,
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
    } catch (error) {
      console.error('saveComplaint error:', error);
      alert('Error while saving complaint');
      this.setState({ submittingComplaint: false });
    }
  };

  handleNextClick = () => {
    if (this.state.complaintStatus === '1') {
      this.setState({
        showBreakdownForm: true,
        isEditingBreakdown: false,
      });
    } else if (this.state.complaintStatus === '0') {
      this.setState({
        showObservationForm: true,
        showRowDetail: false,
        isEditingObservation: false,

        manHoursHours: null,
        manHoursMinutes: null,
        cost: '',
        actionTaken: '',
        spares: '',
        description: '',
        rca: '',
        isClose: false,
        assignedPerson: '',
        attender: '',
        jobRole: '',
      });
    }
  };

  handleBack = () => {
    this.setState({
      showObservationForm: false,
      showRowDetail: true,
      isEditingObservation: false,
      isEditingBreakdown: false,
    });
  };

  handleObservationUpdate = async () => {
    const { selectedRowData } = this.props;
    this.setState({ submittingComplaint: true });

    try {
      const {
        cost,
        actionTaken,
        spares,
        description,
        isClose,
        rca,
        manHoursHours,
        manHoursMinutes,
      } = this.state;

      // Get observation data to extract AssetObservationId
      let obsData = {};
      try {
        const raw =
          this.props.assetDetails?.AssetObservationJson ?? selectedRowData?.AssetObservationJson;
        if (raw && typeof raw === 'string') {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) obsData = arr[0];
        }
      } catch (error) {
        console.warn('Error parsing AssetObservationJson:', error);
        obsData = {};
      }
      const hours = manHoursHours || 0;
      const minutes = manHoursMinutes || 0;
      const manHoursSpent = hours * 60 + minutes;

      const payload = {
        AssetObservationId: obsData?.AssetObservationId || '',
        AssetCompliantId: selectedRowData?.AssetCompliantId || '',
        IsBreakDown: 0,
        ManHoursSpent: manHoursSpent,
        Cost: String(cost || '0')
          .replace(/,/g, '')
          .split('.')[0],

        ActionTaken: actionTaken || '',
        Spares: spares || '',
        IsClosed: !!isClose,
        RCA: rca || '',
        AssignedPerson: this.state.assignedPerson || '',
        Attender: this.state.attender || '',
        JobRole: this.state.jobRole || '',
        action: 'update',
      };

      console.log('Final Payload for Update:', payload);

      const response = await API.triggerMultiPartPost('10747', payload);

      const isSuccess = response?.success === true || response?.data?.success === true;

      if (isSuccess) {
        this.setState({
          submittingComplaint: false,
          showRowDetail: false,
          showBreakdownForm: false,
          showObservationForm: false,
          isEditingObservation: false,
          showSuccessModal: true,
          successTitle: 'Observation Updated Successfully!',
          successDescription:
            'The Observation has been successfully updated. Our operational team has been notified and will take the required actions promptly.',
        });
      } else {
        const errorMessage =
          response?.Message ||
          response?.data?.Message ||
          response?.data?.info ||
          'Failed to update observation';
        message.error(errorMessage);
        this.setState({ submittingComplaint: false });
      }
    } catch (error) {
      console.error('handleObservationUpdate error:', error);
      alert('Error while updating observation');
      this.setState({ submittingComplaint: false });
    }
  };

  handleObservationSubmit = async () => {
    const { selectedRowData } = this.props;

    // Clear previous errors and validate
    this.setState(
      {
        errors: { manHoursSpent: '', spares: '' },
      },
      async () => {
        if (!this.validateForm()) {
          return; // Stop if validation fails
        }

        this.setState({ submittingComplaint: true });

        try {
          const {
            cost,
            actionTaken,
            spares,
            description,
            complaintStatus,
            rca,
            manHoursHours,
            manHoursMinutes,
          } = this.state;
          const hours = manHoursHours || 0;
          const minutes = manHoursMinutes || 0;
          const manHoursSpent = hours * 60 + minutes;
          const payload = {
            AssetCompliantId: selectedRowData?.AssetCompliantId || '',
            IsBreakDown: complaintStatus,
            ManHoursSpent: String(manHoursSpent || '0'),
            Cost: String(cost || '0').replace(/,/g, ''),
            ActionTaken: actionTaken || '',
            Spares: spares || '',

            IsClosed: !!this.state.isClose,
            RCA: rca || '',
            AssignedPerson: this.state.assignedPerson || '',
            Attender: this.state.attender || '',
            JobRole: this.state.jobRole || '',
            action: 'insert',
          };

          const response = await API.triggerMultiPartPost('10747', payload);

          const isSuccess = response?.success === true || response?.data?.success === true;

          if (isSuccess) {
            this.setState({
              submittingComplaint: false,
              showRowDetail: false,
              showBreakdownForm: false,
              showObservationForm: false,
              showSuccessModal: true,
              successTitle: 'Observation Saved Successfully!',
              successDescription:
                'The Observation process has been successfully initiated. Our operational team has been notified and will take the required actions promptly.',
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
        } catch (error) {
          console.error('saveComplaint error:', error);
          alert('Error while saving complaint');
          this.setState({ submittingComplaint: false });
        }
      },
    );
  };
  renderBDForm = () => {
    const {
      manHoursSpent = '',
      cost = '',
      actionTaken = '',
      spares = '',
      description = '',
      submittingComplaint,
      rca = '',
    } = this.state;

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
          className="bd-form-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 24px 0px',
          }}
        >
          <div style={{ paddingBottom: '24px' }}>
            {/* ===== GRID WITH RCA (2 ROW SPAN) ===== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr',
                gap: '17px',
                marginBottom: '24px',
              }}
            >
              {/* Man Hours Spent */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Man Hours Spent <span style={{ color: 'red' }}>*</span>
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '0 10px',
                    marginTop: 6,
                    background: this.state.isEditingBreakdown ? '#F5F5F5' : '#fff',
                  }}
                >
                  <Select
                    className="man-hours-select"
                    placeholder="Hrs"
                    value={this.state.manHoursHours}
                    disabled={this.state.isEditingBreakdown}
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
                    style={{ width: '45%' }}
                    allowClear
                  />

                  <Select
                    className="man-hours-select"
                    placeholder="Min"
                    value={this.state.manHoursMinutes}
                    disabled={this.state.isEditingBreakdown}
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
                    style={{ width: '45%' }}
                    allowClear
                  />
                </div>
              </div>

              {/* Spares Cost */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Spares cost
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '0 12px',
                    marginTop: 6,
                    background: '#fff',
                  }}
                >
                  <span style={{ fontSize: 11, marginRight: 6 }}>₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., 2,500.50"
                    value={cost}
                    onChange={this.handleCostChange}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: 11,
                      background: 'transparent',
                    }}
                  />
                </div>
                {this.renderFieldError('cost')}
              </div>

              {/* Root Cause Analysis (2 ROWS) */}
              <div style={{ gridRow: 'span 2' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Root Cause Analysis
                </label>

                <textarea
                  placeholder="Add any additional notes..."
                  value={rca}
                  onChange={(e) => this.setState({ rca: e.target.value })}
                  style={{
                    width: '100%',
                    height: '20%',
                    minHeight: 125,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '10px 12px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                    background: '#fff',
                  }}
                />
              </div>

              {/* Spares used */}
              <div style={{ marginTop: '-7px' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Spares used <span style={{ color: 'red' }}>*</span>
                </label>

                <textarea
                  disabled
                  placeholder="e.g., Keyboard, Battery, Cooling Fan, RAM, Hard Disk"
                  value={spares}
                  onChange={(e) => this.setState({ spares: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '10px 12px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                    background: '#F5F5F5',
                  }}
                />
              </div>

              {/* Action Taken */}
              <div style={{ marginTop: '-7px' }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Action Taken
                </label>

                <textarea
                  placeholder="Describe the action taken..."
                  value={actionTaken}
                  disabled={this.state.isEditingBreakdown}
                  onChange={(e) => this.setState({ actionTaken: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '10px 12px',
                    fontSize: 11,
                    marginTop: 6,
                    resize: 'none',
                    background: this.state.isEditingBreakdown ? '#F5F5F5' : '#fff',
                  }}
                />
              </div>
            </div>

            {/* ===== Assigned / Attender / Job Role ===== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                  Assigned Person
                </label>
                <input
                  placeholder="Enter Person"
                  value={this.state.assignedPerson}
                  onChange={(e) => this.setState({ assignedPerson: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '0 12px',
                    fontSize: 11,
                    marginTop: 6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>Attender</label>
                <input
                  placeholder="Enter Attender"
                  value={this.state.attender}
                  onChange={(e) => this.setState({ attender: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '0 12px',
                    fontSize: 11,
                    marginTop: 6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>Job Role</label>
                <input
                  placeholder="Enter Job Role"
                  value={this.state.jobRole}
                  onChange={(e) => this.setState({ jobRole: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #EAECF0',
                    borderRadius: 5,
                    padding: '0 12px',
                    fontSize: 11,
                    marginTop: 6,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            onClick={this.editBreakdownSubmit}
            loading={Boolean(submittingComplaint)}
            style={{
              background: '#6740C1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: this.state.submittingComplaint ? 0.7 : 1,
            }}
          >
            {submittingComplaint ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    );
  };
  CurrentStatusSection = () => {
    const data = this.props.assetDetails || this.props.selectedRowData || {};
    let currentStatusData = [];
    let isClosed = false;

    try {
      if (data?.AssetBreakDownJson) {
        const parsedData = JSON.parse(data.AssetBreakDownJson);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          isClosed = parsedData[0]?.IsClosed || false;
          currentStatusData = parsedData[0]?.AssetBreakDownCurrentStatusJson || [];
        }
      }
    } catch (err) {
      console.warn('Error parsing AssetBreakDownCurrentStatusJson:', err);
    }

    if (currentStatusData.length === 0) {
      const fallbackMessage = isClosed
        ? 'Breakdown details are not available.'
        : 'Breakdown Current Status not yet completed.';

      return (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgb(105, 65, 198)',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
            }}
          >
            <span>Current Status</span>
          </div>
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: '#101828',
            }}
          >
            {fallbackMessage}
          </div>
        </div>
      );
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
  render() {
    const { selectedRowData, onClose, onSuccess } = this.props;
    const { errors } = this.state;
    console.log('ComplaintViewMode render called with props:', {
      selectedRowData,
      onClose,
      onSuccess,
    });
    console.log('ComplaintViewMode current state:', this.state);

    const {
      showRowDetail,
      showBreakdownForm,
      showObservationForm,
      successTitle,
      successDescription,
      showSuccessModal,
    } = this.state;

    if (!selectedRowData) {
      console.log('ComplaintViewMode: no selectedRowData, returning null');
      return null;
    }

    if (!showRowDetail && !showBreakdownForm && !showObservationForm && !showSuccessModal) {
      console.log('ComplaintViewMode: no visible state, returning null');
      return null;
    }

    console.log('ComplaintViewMode: rendering component');

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

    const isBackendObservationClosed = assetObservationIsClosedFlag;
    const isCloseValue = isBackendObservationClosed ? true : !!this.state.isClose;

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

    const drawerHeaderStyle = {
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: 'rgb(105, 65, 198)',
      color: '#fff',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
    };

    const mainDrawerTitle = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{ fontSize: '16px', fontWeight: 600 }}
        >{`${selectedRowData.AssetCompliantLabelId}`}</span>
        {statusBadge}
      </div>
    );

    const observationDrawerTitle = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 600 }}>Edit Observation Details</span>
      </div>
    );

    const breakdownDrawerTitle = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 600 }}>Edit Breakdown Details</span>
      </div>
    );

    const condition = this.props.assetDetails?.IsBreakDownObservation ?? null;

    const columns = (this.props.config?.gridColumns || []).filter(
      (col) => col && col.dataIndex && col.type !== 'operation',
    );

    const ComplaintDetailsSection = () => {
      const data = this.props.assetDetails || selectedRowData || {};
      const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
      let parsedAsset = null;
      try {
        if (data && typeof data.AssetJson === 'string') {
          const arr = JSON.parse(data.AssetJson);
          if (Array.isArray(arr) && arr.length > 0) parsedAsset = arr[0];
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

    const NatureSection = () => (
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          background: '#fff',
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '12px' }}>
          Nature of Complaint <span style={{ color: 'red' }}>*</span>
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.preventDefault();
              this.setState({ complaintStatus: '1' });
            }}
          >
            <input
              type="radio"
              name="status"
              value="1"
              checked={this.state.complaintStatus === '1'}
              onChange={() => {}}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.preventDefault();
                e.nativeEvent.stopPropagation();
                return false;
              }}
              style={{ accentColor: '#7F56D9', pointerEvents: 'none' }}
            />
            Breakdown
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.preventDefault();
              this.setState({ complaintStatus: '0' });
            }}
          >
            <input
              type="radio"
              name="status"
              value="0"
              checked={this.state.complaintStatus === '0'}
              onChange={() => {}}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.preventDefault();
                e.nativeEvent.stopPropagation();
                return false;
              }}
              style={{ accentColor: '#7F56D9', pointerEvents: 'none' }}
            />
            Observation
          </div>
        </div>
      </div>
    );

    const FooterSection = () => (
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: '#fff',
          // borderTop: '1px solid #E5E7EB',
          zIndex: 10,
        }}
      >
        {this.state.complaintStatus === '1' ? (
          <button
            onClick={this.handleBreakdownSubmit}
            disabled={this.state.submittingComplaint}
            style={{
              background: '#6740C1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: this.state.submittingComplaint ? 0.7 : 1,
            }}
          >
            {this.state.submittingComplaint ? 'Saving...' : 'Save Breakdown'}
          </button>
        ) : (
          <button
            style={{
              background: '#6740C1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={this.handleNextClick}
          >
            Next Observation
          </button>
        )}
      </div>
    );

    // Read-only BD / Observation details
    const BDDetailsSection = () => {
      const breakdownRecord = this.getBreakdownRecord();
      const isClosed = this.normalizeBreakdownClosed(breakdownRecord);
      const showEditButton = this.state.isAdmin && isClosed;

      const mergedData = {
        ...breakdownRecord,
        ...this.props.assetDetails,
        ModifiedDate: breakdownRecord?.ModifiedDate,
      };
      const hasData = breakdownRecord && Object.keys(breakdownRecord).length > 0;
      const shouldShowDetails = isClosed && hasData;

      const fallbackMessage = isClosed
        ? 'Breakdown details are not available.'
        : 'Breakdown Current Status not yet completed.';

      return (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgb(105, 65, 198)',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
              gap: 12,
            }}
          >
            <span>Breakdown Details</span>
            {showEditButton && (
              <Button
                size="small"
                onClick={this.openBreakdownEdit}
                disabled={!shouldShowDetails}
                style={{
                  background: shouldShowDetails
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: shouldShowDetails ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                  cursor: shouldShowDetails ? 'pointer' : 'not-allowed',
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {shouldShowDetails ? (
            createGenericSection({
              title: '',
              fields: [
                { key: 'ManHourInText', title: 'Man Hours Spent' },
                {
                  key: 'Cost',
                  title: 'Spares cost',
                  formatter: (value) => {
                    if (value === null || value === undefined || value === '') return '-';

                    return `₹ ${Number(value).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                  },
                },

                { key: 'ActionTaken', title: 'Action Taken' },
                {
                  key: 'ModifiedDate',
                  title: 'Complete & Time',
                  formatter: Dates.DateTimeWithLocalTimeZone,
                },
                { key: 'Spares', title: 'Spares used' },
                { key: 'RCA', title: 'Root Cause Analysis' },
                { key: 'AssignedPerson', title: 'Assigned Person' },
                { key: 'Attender', title: 'Attender' },
                { key: 'JobRole', title: 'Job Role' },
              ],
              rowData: mergedData,
              columnCount: 2,
              styles: {
                section: {
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                  margin: 0,
                },
                header: { display: 'none' },
                label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
                value: { fontSize: '11px', fontWeight: 600, margin: 0 },
              },
            })
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 500,
                color: '#101828',
              }}
            >
              {fallbackMessage}
            </div>
          )}
        </div>
      );
    };

    const ObservationDetailsSection = () => {
      let obsData = {};
      try {
        const raw = this.props.assetDetails?.AssetObservationJson;
        if (raw && typeof raw === 'string') {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) obsData = arr[0];
        }
      } catch (e) {
        obsData = {};
      }
      const isClosed = obsData?.IsClosed === true;
      const showEditButton = this.state.isAdmin;

      const mergedData = {
        ...this.props.assetDetails,
        ...obsData,
      };
      const hasData = obsData && Object.keys(obsData).length > 0;
      const shouldShowDetails = isClosed && hasData;

      const fallbackMessage = isClosed
        ? 'Observation details are not available.'
        : 'Observation not yet completed.';

      return (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgb(105, 65, 198)',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
              gap: 12,
            }}
          >
            <span>Observation Details</span>
            {showEditButton && !isBackendObservationClosed && (
              <Button
                size="small"
                onClick={this.openObservationEdit}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 500,
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {shouldShowDetails ? (
            createGenericSection({
              title: '',
              fields: [
                { key: 'ManHourInText', title: 'Man Hours Spent' },
                {
                  key: 'Cost',
                  title: 'Spares cost',
                  formatter: (value) => {
                    if (value === null || value === undefined || value === '') return '-';

                    return `₹ ${Number(value).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                  },
                },

                { key: 'ActionTaken', title: 'Action Taken' },
                {
                  key: 'ModifiedDate',
                  title: 'Complete & Time',
                  formatter: Dates.DateTimeWithLocalTimeZone,
                },

                { key: 'Spares', title: 'Spares used' },

                { key: 'RCA', title: 'Root Cause Analysis' },
                { key: 'AssignedPerson', title: 'Assigned Person' },
                { key: 'Attender', title: 'Attender' },
                { key: 'JobRole', title: 'Job Role' },
              ],
              rowData: mergedData,
              columnCount: 2,
              styles: {
                section: {
                  border: 'none',

                  background: 'transparent',

                  boxShadow: 'none',

                  padding: 0,

                  margin: 0,
                },

                header: { display: 'none' },
                label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0' },
                value: { fontSize: '11px', fontWeight: 600, margin: 0 },
              },
            })
          ) : (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '11px',
              }}
            >
              {fallbackMessage}
            </div>
          )}
        </div>
      );
    };

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

  .man-hours-select.ant-select-disabled .ant-select-selector {
    color: #000 !important;
    background-color: #F5F5F5 !important;
  }

  .man-hours-select.ant-select-disabled .ant-select-selection-item {
    color: #000 !important;
  }



   /* ===== Purple Vertical Scrollbar ===== */

  .ant-drawer-body {
    scrollbar-width: thin;
    scrollbar-color: #6941C6 #F7FAFC;
  }

 

  .ant-drawer-body::-webkit-scrollbar-track {
    background: #F7FAFC;
    border-radius: 6px;
  }

  .ant-drawer-body::-webkit-scrollbar-thumb {
    background-color: #6941C6;
    border-radius: 6px;
    border: 2px solid #F7FAFC;
  }

  .ant-drawer-body::-webkit-scrollbar-thumb:hover {
    background-color: #5331b8;
  }

  .bd-form-scroll {
  scrollbar-width: thin;
  scrollbar-color: #6941C6 #F7FAFC;
}

.bd-form-scroll::-webkit-scrollbar {
  width: 6px;   
}

.bd-form-scroll::-webkit-scrollbar-track {
  background: #F7FAFC;
}

.bd-form-scroll::-webkit-scrollbar-thumb {
  background: #6941C6;
  border-radius: 6px;
}

`}
        </style>
        <SuccessModal
          open={this.state.showSuccessModal}
          onClose={() => {
            this.setState({
              showSuccessModal: false,
              isEditingBreakdown: false,
            });

            if (this.props.onClose) this.props.onClose();
            if (this.props.onSuccess) this.props.onSuccess();
          }}
          title={this.state.successTitle}
          message={this.state.successDescription}
          buttonText="Dismiss"
          iconType="success"
        />

        {/* Breakdown Edit Modal */}
        {showBreakdownForm && (
          <CustomDrawer
            open={showBreakdownForm}
            onClose={() =>
              this.setState({
                showBreakdownForm: false,
                showRowDetail: true,
              })
            }
            width="700px"
            title={breakdownDrawerTitle}
            headerStyle={drawerHeaderStyle}
            containerStyle={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            bodyStyle={{
              flex: 1,
              overflowY: 'auto',
              padding: 0,
              backgroundColor: '#fff',
            }}
          >
            {this.renderBDForm()}
          </CustomDrawer>
        )}

        {/* Main Complaint Modal */}
        {showRowDetail && selectedRowData && (
          <CustomDrawer
            open={showRowDetail}
            onClose={() => this.setState({ showRowDetail: false })}
            width="700px"
            title={mainDrawerTitle}
            headerStyle={drawerHeaderStyle}
            bodyStyle={{
              flex: 1,
              overflowY: 'auto',
              padding: 0,
              backgroundColor: '#fff',
            }}
            containerStyle={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              ref={this.modalBodyRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                padding: '24px 24px 0px',
              }}
            >
              {condition == null && (
                <>
                  <AssetDetailsDisplay
                    assetDetails={this.props.assetDetails}
                    selectedRowData={selectedRowData}
                    variant="detailed"
                    columns={2}
                  />
                  <ComplaintDetailsSection />
                  <NatureSection />
                </>
              )}

              {condition === 'BreakDown' && (
                <>
                  <AssetDetailsDisplay
                    assetDetails={this.props.assetDetails}
                    selectedRowData={selectedRowData}
                    variant="detailed"
                    columns={2}
                  />
                  <ComplaintDetailsSection />

                  {!isStatusClosed ? this.CurrentStatusSection() : <BDDetailsSection />}
                </>
              )}

              {condition === 'Observation' && (
                <>
                  <AssetDetailsDisplay
                    assetDetails={this.props.assetDetails}
                    selectedRowData={selectedRowData}
                    variant="detailed"
                    columns={2}
                  />
                  <ComplaintDetailsSection />
                  <ObservationDetailsSection />
                </>
              )}
            </div>

            {/* Fixed Footer */}
            {condition == null && <FooterSection />}
          </CustomDrawer>
        )}

        {/* Observation Details Modal */}
        {this.state.showObservationForm && (
          <CustomDrawer
            open={this.state.showObservationForm}
            onClose={() =>
              this.setState({ showObservationForm: false, isEditingObservation: false })
            }
            width="700px"
            title={observationDrawerTitle}
            headerStyle={drawerHeaderStyle}
            bodyStyle={{
              padding: 0,
              backgroundColor: '#fff',
            }}
            containerStyle={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div
              ref={this.observationModalRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                padding: '24px 24px 0px',
              }}
            >
              <div style={{ paddingBottom: '24px' }}>
                {/* ===== GRID WITH RCA (2 ROW SPAN) ===== */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 2fr',
                    gap: '17px',
                    marginBottom: '24px',
                  }}
                >
                  {/* Man Hours Spent */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Man Hours Spent <span style={{ color: 'red' }}>*</span>
                    </label>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        height: 40,
                        border:
                          this.state.focusedField === 'manHoursSpent'
                            ? '2px solid #3b3b3bff'
                            : '1px solid #EAECF0',
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
                          label: String(i),
                          value: i,
                        }))}
                        style={{ width: '45%' }}
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
                        style={{ width: '45%' }}
                        allowClear
                      />
                    </div>
                    {!this.state.isEditingObservation && this.renderFieldError('manHoursSpent')}
                  </div>

                  {/* Spares Cost */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Spares cost
                    </label>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 40,
                        border: '1px solid #f2f3f7ff',
                        borderRadius: 5,
                        padding: '0 12px',
                        marginTop: 6,
                        background: isBackendObservationClosed ? '#F5F5F5' : '#fff',
                      }}
                    >
                      <span style={{ fontSize: 11, color: '#667085', marginRight: 5 }}>₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g., 2,500.50"
                        value={this.state.cost}
                        onChange={this.handleCostChange}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: 11,
                          background: 'transparent',
                        }}
                      />
                    </div>
                    {this.renderFieldError('cost')}
                  </div>

                  {/* Root Cause Analysis (2 ROWS) */}
                  <div style={{ gridRow: 'span 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Root Cause Analysis
                    </label>

                    <textarea
                      placeholder="Add any additional notes..."
                      value={this.state.rca || ''}
                      onChange={(e) => this.setState({ rca: e.target.value })}
                      disabled={isBackendObservationClosed}
                      style={{
                        width: '100%',
                        height: '20%',
                        minHeight: 125,
                        border: '1px solid #EAECF0',
                        borderRadius: 5,
                        padding: '10px 12px',
                        fontSize: 11,
                        marginTop: 6,
                        resize: 'none',
                        background: isBackendObservationClosed ? '#F5F5F5' : '#fff',
                        opacity: isBackendObservationClosed ? 0.6 : 1,
                      }}
                    />
                  </div>

                  {/* Spares used */}
                  <div style={{ marginTop: '-7px' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Spares used <span style={{ color: 'red' }}>*</span>
                    </label>

                    <textarea
                      disabled={isBackendObservationClosed}
                      placeholder="e.g., Keyboard, Battery"
                      value={this.state.spares || ''}
                      onChange={(e) =>
                        this.setState({
                          spares: e.target.value,
                          errors: { ...this.state.errors, spares: '' },
                        })
                      }
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #EAECF0',
                        borderRadius: 5,
                        padding: '10px 12px',
                        fontSize: 11,
                        marginTop: 6,
                        resize: 'none',
                        background: isBackendObservationClosed ? '#F5F5F5' : '#fff',
                        opacity: isBackendObservationClosed ? 0.6 : 1,
                      }}
                    />
                    {!this.state.isEditingObservation && this.renderFieldError('spares')}
                  </div>

                  {/* Action Taken */}
                  <div style={{ marginTop: '-7px' }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                      Action Taken
                    </label>

                    <textarea
                      disabled={isBackendObservationClosed}
                      placeholder="Describe the action taken..."
                      value={this.state.actionTaken || ''}
                      onChange={(e) => this.setState({ actionTaken: e.target.value })}
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #EAECF0',
                        borderRadius: 5,
                        padding: '10px 12px',
                        fontSize: 11,
                        marginTop: 6,
                        resize: 'none',
                        background: isBackendObservationClosed ? '#F5F5F5' : '#fff',
                        opacity: isBackendObservationClosed ? 0.6 : 1,
                      }}
                    />
                  </div>
                </div>

                {/* ===== Assigned / Attender / Job Role ===== */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '20px',
                    marginTop: '-20px',
                  }}
                >
                  {['Assigned Person', 'Attender', 'Job Role'].map((label, i) => {
                    const key = ['assignedPerson', 'attender', 'jobRole'][i];
                    return (
                      <div key={key}>
                        <label style={{ fontSize: 11, fontWeight: 500, color: '#344054' }}>
                          {label}
                        </label>
                        <input
                          placeholder={`Enter ${label}`}
                          value={this.state[key]}
                          onChange={(e) => this.setState({ [key]: e.target.value })}
                          style={{
                            width: '100%',
                            height: 40,
                            border: '1px solid #EAECF0',
                            borderRadius: 5,
                            padding: '0 12px',
                            fontSize: 11,
                            marginTop: 6,
                            outline: 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ===== Close Switch ===== */}
                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      margin: 0,
                      color: 'rgb(52, 64, 84)',
                    }}
                  >
                    Close
                  </p>
                  <Switch
                    checked={isCloseValue}
                    onChange={(checked) => this.setIsClose(checked)}
                    disabled={isBackendObservationClosed}
                    style={{
                      backgroundColor: isCloseValue ? '#6941C6' : '#d1d5db',
                      cursor: isBackendObservationClosed ? 'not-allowed' : 'pointer',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div
              style={{
                marginTop: '50px',
                position: 'sticky',
                bottom: 0,
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                flexShrink: 0,
              }}
            >
              {this.state.isEditingObservation ? (
                <button
                  onClick={this.handleObservationUpdate}
                  disabled={this.state.submittingComplaint || isBackendObservationClosed}
                  style={{
                    background: isBackendObservationClosed ? '#E5E7EB' : '#6740C1',
                    color: isBackendObservationClosed ? '#9CA3AF' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: isBackendObservationClosed ? 'not-allowed' : 'pointer',
                    opacity: this.state.submittingComplaint || isBackendObservationClosed ? 0.7 : 1,
                  }}
                >
                  {isBackendObservationClosed
                    ? 'Update'
                    : this.state.submittingComplaint
                      ? 'Updating...'
                      : 'Update'}
                </button>
              ) : (
                <button
                  onClick={this.handleObservationSubmit}
                  disabled={this.state.submittingComplaint}
                  style={{
                    background: '#6740C1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: this.state.submittingComplaint ? 0.7 : 1,
                  }}
                >
                  {this.state.submittingComplaint ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </CustomDrawer>
        )}
      </>
    );
  }
}

export default ComplaintViewMode;
