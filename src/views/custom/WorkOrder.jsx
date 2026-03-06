import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../../store/requests';
import ViewRegistry from '../../core/ViewRegistry';
import UIHelper from '../../components/BaseView/UIHelper';
import { createGenericSection } from '../../utils/sectionUtils';
import { assetComplaintDetailsFields } from '../../configs/entityConfigs';
import { message, Table, Button, Modal } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import ScopeOfWorkDrawer from './ScopeOfWorkDrawer';
import FinancialDetailsDrawer from './FinancialDetailsDrawer';
import SuccessModal from '../../components/common/SuccessModal';
import './WorkOrder.css';

// Global modal state
let showResponseModal = null;
const FormCleanupWrapper = ({ children }) => {
  useEffect(() => {
    return () => {
      // Don't clear if save is in progress
      if (window.workOrderSaveInProgress) {
        return;
      }

      // Don't clear if modal is open
      const isModalOpen = document.querySelector('.success-modal');
      if (!isModalOpen) {
        localStorage.removeItem('workOrder_temp_10819');
        localStorage.removeItem('workOrder_temp_10820');
        window.dispatchEvent(new Event('clearWorkOrderGrids'));
      }
    };
  }, []);

  return <>{children}</>;
};

// Response Modal Wrapper Component (for both success and error)
const WorkOrderResponseModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    showResponseModal = (message, type = 'success') => {
      setModalMessage(message);
      setModalType(type);
      setIsOpen(true);
    };
  }, []);

  return (
    <SuccessModal
      open={isOpen}
      onClose={() => {
        setIsOpen(false);

        // Only clear cache and close form on success
        if (modalType === 'success') {
          // Clear localStorage cache for child grids (Scope of Work & Financial Details)
          localStorage.removeItem('workOrder_temp_10819'); // Scope of Work
          localStorage.removeItem('workOrder_temp_10820'); // Financial Details

          // Dispatch event to clear the grid components
          window.dispatchEvent(new Event('clearWorkOrderGrids'));

          // Close the form drawer
          if (window.workOrderCloseForm) {
            window.workOrderCloseForm();
          }

          // Trigger table refresh callback if available
          if (window.workOrderRefreshCallback) {
            window.workOrderRefreshCallback(true);
          }
        }
      }}
      title={modalMessage}
      iconType={modalType === 'success' ? 'success' : 'error'}
    />
  );
};

const WorkOrderSearchComponent = ({ formProps, onValidationCallback }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedAssetName, setSelectedAssetName] = useState(''); // Changed from AssetDescription to AssetName
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [selectedComplaintDescription, setSelectedComplaintDescription] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  // Register validation callback
  useEffect(() => {
    if (onValidationCallback) {
      onValidationCallback(() => setShowValidation(true));
    }
  }, [onValidationCallback]);

  // Debounced API call for asset search
  const fetchAssetsBySearch = useCallback(async (searchString) => {
    try {
      setIsLoading(true);
      const payload = {
        RequestType: 'AssetCompliantSearch',
        InputJson: JSON.stringify({ AssetCompliantSearch: { SearchString: searchString } }),
        action: 'JsonRequest',
      };
      const response = await API.triggerPost('Plant', payload);
      const assets = (response?.data.data || []).map((item) => ({
        AssetCompliantId: item.AssetCompliantId,
        AssetCompliantInfo: item.AssetCompliantInfo,
      }));
      setSuggestions(assets);
    } catch (error) {
      console.error('fetchAssetsBySearch error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce timer ref
  const debounceTimerRef = React.useRef(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load selected asset details on mount/edit
  useEffect(() => {
    console.log(
      'useEffect triggered for loading asset details, formProps.selectedRow:',
      formProps?.selectedRow,
    );
    console.log('selectedRow keys:', Object.keys(formProps?.selectedRow || {}));
    const loadSelectedAssetDetails = async () => {
      console.log('loadSelectedAssetDetails function called');
      if (!formProps?.selectedRow) {
        console.log('No formProps.selectedRow, returning');
        return;
      }

      const assetId = formProps.selectedRow.AssetId;
      const assetCompliantId = formProps.selectedRow.AssetCompliantId;
      console.log(
        'AssetId from selectedRow:',
        assetId,
        'AssetCompliantId from selectedRow:',
        assetCompliantId,
      );

      if (assetId || assetCompliantId) {
        try {
          const guid = assetCompliantId || assetId;
          console.log('Fetching details for GUID:', guid);
          const loadResp = await API.triggerPost('10744', {
            guid: guid,
            action: 'LoadView',
          });
          const detail = Array.isArray(loadResp?.data) ? loadResp.data[0] : loadResp?.data || null;
          if (detail) {
            console.log('Loaded selected asset details:', detail);
            // Set complaint details
            if (detail.AssetCompliantLabelId) setSelectedComplaintId(detail.AssetCompliantLabelId);
            if (detail.CompliantDescription)
              setSelectedComplaintDescription(detail.CompliantDescription);

            // Parse AssetJson for EquipmentId and AssetName
            if (detail.AssetJson) {
              try {
                const assetArr = JSON.parse(detail.AssetJson);
                const assetDetail = Array.isArray(assetArr) ? assetArr[0] : null;
                if (assetDetail) {
                  if (assetDetail.EquipmentId) {
                    setSelectedAssetId(assetDetail.EquipmentId);
                  }
                  if (assetDetail.AssetName) {
                    setSelectedAssetName(assetDetail.AssetName);
                  }
                }
              } catch (jsonErr) {
                console.error('Error parsing AssetJson:', jsonErr);
              }
            }

            // Set search query to display name
            const infoText =
              detail.AssetCompliantInfo ||
              detail.AssetName ||
              detail.Name ||
              detail.Title ||
              detail.AssetInfo ||
              '';
            setSearchQuery(`${infoText}`.trim());
          } else {
            console.log('No detail data received');
          }
        } catch (e) {
          console.error('Error loading selected asset details:', e);
        }
      } else {
        console.log('No AssetId or AssetCompliantId found in selectedRow');
      }
    };

    loadSelectedAssetDetails();
  }, [formProps?.selectedRow]);

  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If query is empty, clear suggestions
      if (query.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      // Set new timer for debounced API call
      debounceTimerRef.current = setTimeout(() => {
        fetchAssetsBySearch(query);
      }, 500); // 500ms debounce delay
    },
    [fetchAssetsBySearch],
  );

  const handleAssetSelect = useCallback(
    async (asset) => {
      if (!asset) return;

      const infoText =
        asset?.AssetCompliantInfo ||
        asset?.AssetName ||
        asset?.Name ||
        asset?.Title ||
        asset?.AssetInfo ||
        '';
      setSearchQuery(`${infoText}`.trim());
      setSuggestions([]);

      try {
        console.log('handleAssetSelect - Selected asset:', asset);
        console.log('handleAssetSelect - AssetCompliantId:', asset?.AssetCompliantId);
        console.log('handleAssetSelect - AssetId:', asset?.AssetId);

        if (formProps?.form && typeof formProps.form.setFieldsValue === 'function') {
          const values = {
            AssetCompliantId: asset?.AssetCompliantId ?? asset?.Id,
            AssetId: asset?.AssetId,
          };
          if (asset && typeof asset === 'object') Object.assign(values, asset);

          console.log('handleAssetSelect - Setting values:', values);
          formProps.form.setFieldsValue(values);

          // IMPORTANT: Also update the SimpleForm's internal state
          // formProps.formPanel is the SimpleForm instance
          if (formProps.formPanel && formProps.formPanel.onChange) {
            formProps.formPanel.onChange('AssetCompliantId', values.AssetCompliantId);
            formProps.formPanel.onChange('AssetId', values.AssetId);
            console.log('handleAssetSelect - Updated SimpleForm state via onChange');
          }
        }

        const complaintGuid = asset?.AssetCompliantId || asset?.Id;
        if (complaintGuid) {
          const loadResp = await API.triggerPost('10744', {
            guid: complaintGuid,
            action: 'LoadView',
          });
          const detail = Array.isArray(loadResp?.data) ? loadResp.data[0] : loadResp?.data || null;
          if (detail && formProps?.form && typeof formProps.form.setFieldsValue === 'function') {
            const extra = {};
            if (detail.AssetJson) {
              try {
                const assetArr = JSON.parse(detail.AssetJson);
                const assetDetail = Array.isArray(assetArr) ? assetArr[0] : null;
                console.log('Parsed AssetJson detail:', assetDetail);
                if (assetDetail) {
                  // if (assetDetail.VendorDetails !== undefined) {
                  //   extra.vendorDetails = assetDetail.VendorDetails;
                  //   setSelectedVendorDetails(assetDetail.VendorDetails);
                  // }
                  // if (assetDetail.EquipmentId !== undefined) {
                  //   extra.EquipmentId = assetDetail.EquipmentId;
                  //   setSelectedEquipmentId(assetDetail.EquipmentId);
                  // }
                  // Store the label ID for display purposes
                  if (assetDetail.EquipmentId !== undefined) {
                    setSelectedAssetId(assetDetail.EquipmentId);
                  }
                  // Store AssetName for display
                  if (assetDetail.AssetName !== undefined) {
                    setSelectedAssetName(assetDetail.AssetName);
                  }
                  // IMPORTANT: Use the GUID, not the label
                  if (assetDetail.AssetId !== undefined) {
                    extra.AssetId = assetDetail.AssetId; // This is the GUID
                    console.log('Setting AssetId GUID from AssetJson:', assetDetail.AssetId);
                  }
                  if (assetDetail.AssetTypeId !== undefined)
                    extra.AssetTypeId = assetDetail.AssetTypeId;
                  if (assetDetail.LocationTypeId !== undefined)
                    extra.LocationTypeId = assetDetail.LocationTypeId;
                  if (assetDetail.Section !== undefined) extra.Section = assetDetail.Section;
                  if (assetDetail.Location !== undefined) extra.Location = assetDetail.Location;
                  if (assetDetail.AssetName !== undefined) extra.AssetName = assetDetail.AssetName;
                }
              } catch (jsonErr) {
                console.error('Error parsing AssetJson:', jsonErr);
              }
            }
            // Set complaint details
            if (detail.AssetCompliantLabelId !== undefined) {
              extra.complaintId = detail.AssetCompliantLabelId;
              setSelectedComplaintId(detail.AssetCompliantLabelId);
            }
            if (detail.CompliantDescription !== undefined) {
              extra.complaintDescription = detail.CompliantDescription;
              setSelectedComplaintDescription(detail.CompliantDescription);
            }

            // CRITICAL: Add the GUID values for AssetId and AssetCompliantId
            if (detail.AssetId !== undefined) {
              extra.AssetId = detail.AssetId;
              console.log('Setting AssetId from detail:', detail.AssetId);
            }
            if (detail.AssetCompliantId !== undefined) {
              extra.AssetCompliantId = detail.AssetCompliantId;
              console.log('Setting AssetCompliantId from detail:', detail.AssetCompliantId);
            }

            console.log('All extra values to be set:', extra);

            if (Object.keys(extra).length) {
              formProps.form.setFieldsValue(extra);

              // IMPORTANT: Also update SimpleForm's internal state
              if (formProps.formPanel && formProps.formPanel.onChange) {
                if (extra.AssetId !== undefined) {
                  formProps.formPanel.onChange('AssetId', extra.AssetId);
                }
                if (extra.AssetCompliantId !== undefined) {
                  formProps.formPanel.onChange('AssetCompliantId', extra.AssetCompliantId);
                }
                console.log('Updated SimpleForm state with AssetId and AssetCompliantId');
              }
            }
          }
        }
      } catch (e) {
        console.error('Auto-fill error', e);
      }
    },
    [formProps],
  );

  // In edit mode, show as read-only section using createGenericSection
  if (formProps?.selectedRow?.WorkOrderId) {
    const assetComplaintData = {
      EquipmentId:
        selectedAssetId ||
        formProps.selectedRow?.EquipmentId ||
        formProps.selectedRow?.AssetId ||
        'Not selected',
      AssetDescription: selectedAssetName || formProps.selectedRow?.AssetName || 'Not selected',
      AssetCompliantLabelId:
        selectedComplaintId ||
        formProps.selectedRow?.AssetCompliantLabelId ||
        formProps.selectedRow?.CompliantId ||
        'Not selected',
      CompliantDescription:
        selectedComplaintDescription ||
        formProps.selectedRow?.CompliantDescription ||
        'Not selected',
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        {createGenericSection({
          title: 'Equipment / Complaint Details',
          fields: assetComplaintDetailsFields,
          rowData: assetComplaintData,
          columnCount: 4,
          styles: {
            label: {
              fontSize: '11px',
              color: '#475467',
              margin: '0 0 4px 0',
            },
            value: {
              fontSize: '11px',
              fontWeight: 600,
              margin: 0,
            },
          },
        })}
      </div>
    );
  }

  // In add mode, show search interface
  return (
    <div className="wo-search-bar" style={{ marginBottom: '16px' }}>
      {/* Section Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(105, 65, 198, 1)',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFF',
          }}
        >
          Equipment / Complaint Search
        </h3>
      </div>

      {/* Search Input */}
      {
        <div style={{ padding: '0 16px', marginBottom: '16px', position: 'relative' }}>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              style={{
                height: '36px',
                fontSize: '13px',
                paddingLeft: '12px',
                paddingRight: '32px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                animation: 'slideDown 0.2s ease-out',
              }}
            >
              <ul
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  listStyle: 'none',
                  margin: 0,
                  padding: '6px 0',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleAssetSelect(s)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: 'rgba(0,0,0,0.85)',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    {s.AssetCompliantInfo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }

      {/* Selected Asset and Complaint Details - 4 Column Layout (for add mode) */}
      <div
        style={{
          padding: '0 16px 16px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Asset ID */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#374151',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Equipment ID
          </label>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: selectedAssetId ? '#f9fafb' : showValidation ? '#fef2f2' : '#f9fafb',
              border: selectedAssetId
                ? '1px solid #e5e7eb'
                : showValidation
                  ? '1px solid #fca5a5'
                  : '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              color: selectedAssetId ? '#6b7280' : showValidation ? '#dc2626' : '#6b7280',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {selectedAssetId || 'Not selected'}
          </div>
          {showValidation && !selectedAssetId && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              Asset ID is required
            </div>
          )}
        </div>

        {/* Asset Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#374151',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Asset Name
          </label>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#6b7280',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {selectedAssetName || 'Not selected'}
          </div>
        </div>

        {/* Complaint ID */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#374151',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Complaint ID <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
          </label>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: selectedComplaintId
                ? '#f9fafb'
                : showValidation
                  ? '#fef2f2'
                  : '#f9fafb',
              border: selectedComplaintId
                ? '1px solid #e5e7eb'
                : showValidation
                  ? '1px solid #fca5a5'
                  : '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              color: selectedComplaintId ? '#6b7280' : showValidation ? '#dc2626' : '#6b7280',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {selectedComplaintId || 'Not selected'}
          </div>
          {showValidation && !selectedComplaintId && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              Complaint ID is required
            </div>
          )}
        </div>

        {/* Complaint Description */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#374151',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            Complaint Description
          </label>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#6b7280',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {selectedComplaintDescription || 'Not selected'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Scope of Work Grid Component with CustomDrawer
const ScopeOfWorkGrid = ({ workOrderId, onDataChange, initialData }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showScopeSuccessModal, setShowScopeSuccessModal] = useState(false);
  const [scopeSuccessMessage, setScopeSuccessMessage] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  // Load initial data from formProps (edit mode) or cache (add mode)
  useEffect(() => {
    const isEditMode = workOrderId && workOrderId !== 'temp';

    if (isEditMode && initialData) {
      // Edit mode: Use data from WorkOrderScopeJson
      try {
        let scopeData = [];
        if (typeof initialData === 'string') {
          scopeData = JSON.parse(initialData);
        } else if (Array.isArray(initialData)) {
          scopeData = initialData;
        }

        // Map to grid format
        const mappedData = scopeData.map((item, index) => ({
          key: item.WorkOrderScopeId || Date.now() + index,
          WorkOrderScopeId: item.WorkOrderScopeId,
          ItemOrder: item.ItemOrder,
          Description: item.ItemDescription || item.Description,
          DeliveryDate: item.DeliveryDate,
          Quantity: item.Quantity,
          UOM: item.UOM,
          NetUnitCost: item.Cost,
          SGSTTax: item.Sgst,
          CGSTTax: item.Cgst,
          IGSTTax: item.Igst,
          Amount: item.Amount,
        }));

        setDataSource(mappedData);
      } catch (e) {
        console.error('Error parsing WorkOrderScopeJson:', e);
        setDataSource([]);
      }
    } else {
      // Add mode: Load from cache
      const cacheKey = `workOrder_${workOrderId || 'temp'}_10819`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setDataSource(parsedCache.gridData || []);
        } catch (e) {
          setDataSource([]);
        }
      } else {
        setDataSource([]);
      }
    }
  }, [workOrderId, initialData]);

  // Listen for clear event
  useEffect(() => {
    const handleClearGrid = () => {
      setDataSource([]);
    };
    window.addEventListener('clearWorkOrderGrids', handleClearGrid);
    return () => {
      window.removeEventListener('clearWorkOrderGrids', handleClearGrid);
    };
  }, []);

  // Save to cache whenever data changes (only in add mode)
  useEffect(() => {
    const isAddMode = workOrderId === 'temp' || !workOrderId;

    if (isAddMode) {
      // Only save to cache in add mode
      const cacheKey = `workOrder_${workOrderId || 'temp'}_10819`;
      const cacheData = {
        gridData: dataSource,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    // Always call onDataChange to update parent component
    if (onDataChange) onDataChange(dataSource);

    // Hide validation error when items are added
    if (dataSource.length > 0) {
      setShowValidationError(false);
    }
  }, [dataSource, workOrderId, onDataChange]);

  // Expose validation trigger globally
  useEffect(() => {
    window.triggerScopeValidation = () => {
      if (dataSource.length === 0) {
        setShowValidationError(true);
        return false;
      }
      setShowValidationError(false);
      return true;
    };

    return () => {
      delete window.triggerScopeValidation;
    };
  }, [dataSource]);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsDrawerVisible(true);
  };
  const handleSave = (data) => {
    // Parse the net unit cost, removing any commas
    const netUnitCostValue = data.NetUnitCost
      ? parseFloat(String(data.NetUnitCost).replace(/,/g, ''))
      : 0;

    // Calculate the amount
    const quantity = parseFloat(data.Quantity) || 0;
    const amount = (quantity * netUnitCostValue).toFixed(2);

    if (editingRecord) {
      setDataSource(
        dataSource.map((item) =>
          item.key === editingRecord.key
            ? {
                ...data,
                key: editingRecord.key,
                NetUnitCost: netUnitCostValue,
                Amount: parseFloat(amount),
              }
            : item,
        ),
      );
      setScopeSuccessMessage('Scope item updated successfully!');
      setShowScopeSuccessModal(true);
    } else {
      const newRecord = {
        ...data,
        key: Date.now(),
        NetUnitCost: netUnitCostValue,
        Amount: parseFloat(amount),
      };
      setDataSource([...dataSource, newRecord]);
      setScopeSuccessMessage('Scope item added successfully!');
      setShowScopeSuccessModal(true);
    }
  };

  // const handleEdit = (record) => {
  //   setEditingRecord(record);
  //   setIsDrawerVisible(true);
  // };

  const handleEdit = (record) => {
    // Format the values before setting them in the form
    const formatValue = (value) => {
      if (value === undefined || value === null || value === '') return '';
      const num = parseFloat(value);
      return isNaN(num) ? '' : num.toFixed(2);
    };

    // Calculate the formatted amount
    const formattedAmount = record.Amount
      ? parseFloat(String(record.Amount).replace(/,/g, '')).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

    setEditingRecord({
      ...record,
      NetUnitCost: record.NetUnitCost
        ? parseFloat(String(record.NetUnitCost).replace(/,/g, '')).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '',
      SGSTTax: formatValue(record.SGSTTax),
      CGSTTax: formatValue(record.CGSTTax),
      IGSTTax: formatValue(record.IGSTTax),
      Amount: formattedAmount,
    });
    setIsDrawerVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#ff4d4f',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src="Alert-popup.svg" alt="Alert-popup.svg" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>Delete Item</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Are you sure you want to delete this item?
            </div>
          </div>
        </div>
      ),
      content: null,
      icon: null,
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: {
        danger: true,
        style: { backgroundColor: '#B54708', borderColor: '#B54708' },
      },
      cancelButtonProps: {
        style: { color: '#04080B', borderColor: '#F9FAFB' },
      },
      centered: true,
      width: 480,
      onOk: () => {
        setDataSource(dataSource.filter((item) => item.key !== record.key));
        setIsDrawerVisible(false);
        message.success('Item deleted successfully');
      },
    });
  };

  const columns = [
    { title: 'S.no', key: 'index', width: 80, render: (_, __, index) => index + 1 },
    { title: 'Item order', dataIndex: 'ItemOrder', key: 'ItemOrder', width: 120 },
    { title: 'Description', dataIndex: 'Description', key: 'Description', width: 200 },
    {
      title: 'Delivery date',
      dataIndex: 'DeliveryDate',
      key: 'DeliveryDate',
      width: 130,
      render: (value) => {
        if (!value) return '';
        // Convert YYYY-MM-DD to DD-MM-YYYY
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },
    { title: 'Quantity', dataIndex: 'Quantity', key: 'Quantity', width: 100 },
    { title: 'UOM', dataIndex: 'UOM', key: 'UOM', width: 100 },
    {
      title: 'Net unit cost',
      dataIndex: 'NetUnitCost',
      key: 'NetUnitCost',
      width: 130,
      render: (value) => {
        if (value === undefined || value === null || value === '') return '';
        // Convert to number, format with commas and 2 decimal places
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num)
          ? ''
          : num.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      },
    },
    {
      title: 'sgst %',
      dataIndex: 'SGSTTax',
      key: 'SGSTTax',
      width: 80,
      render: (value) => {
        if (value === undefined || value === null || value === '') return '';
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toFixed(2);
      },
    },
    {
      title: 'cgst %',
      dataIndex: 'CGSTTax',
      key: 'CGSTTax',
      width: 80,
      render: (value) => {
        if (value === undefined || value === null || value === '') return '';
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toFixed(2);
      },
    },
    {
      title: 'igst %',
      dataIndex: 'IGSTTax',
      key: 'IGSTTax',
      width: 80,
      render: (value) => {
        if (value === undefined || value === null || value === '') return '';
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toFixed(2);
      },
    },
    {
      title: 'Amount (without taxes)',
      dataIndex: 'Amount',
      key: 'Amount',
      width: 150,
      render: (value) => {
        if (value === undefined || value === null || value === '') return '';
        // Convert to number, format with commas and 2 decimal places
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num)
          ? ''
          : num.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              color: '#6941C6',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          {/* <Button
            type="link"
            danger
            onClick={() => handleDelete(record)}
            style={{ padding: 0 }}
          >
            Delete
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'rgba(105, 65, 198, 1)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFF' }}>
          Scope of Work
        </h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#FFF', color: 'rgba(105, 65, 198, 1)', borderColor: '#FFF' }}
        >
          Add Item
        </Button>
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0' }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No scope items added yet' }}
        />
      </div>
      {showValidationError && (
        <div
          style={{
            color: '#DC2626',
            fontSize: '12px',
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '4px',
          }}
        >
          Please add at least one Scope of Work item before submitting
        </div>
      )}
      <ScopeOfWorkDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        onSave={handleSave}
        editingRecord={editingRecord}
        onDelete={handleDelete}
      />
      <SuccessModal
        open={showScopeSuccessModal}
        onClose={() => setShowScopeSuccessModal(false)}
        title={scopeSuccessMessage}
        iconType="success"
      />
    </div>
  );
};

// Financial Details Simple Table Component
const FinancialDetailsGrid = ({ workOrderId, onDataChange, scopeData = [], initialFreight }) => {
  const [freight, setFreight] = useState('');

  // Calculate basic amount from scope data
  const basicAmount = useMemo(() => {
    return scopeData.reduce((sum, item) => {
      const amount = parseFloat(item.Amount) || 0;
      return sum + amount;
    }, 0);
  }, [scopeData]);

  // Calculate taxes total from scope data
  const taxesTotal = useMemo(() => {
    return scopeData.reduce((sum, item) => {
      const qty = parseFloat(item.Quantity) || 0;
      const netCost = parseFloat(item.NetUnitCost) || 0;
      const sgst = parseFloat(item.SGSTTax) || 0;
      const cgst = parseFloat(item.CGSTTax) || 0;
      const igst = parseFloat(item.IGSTTax) || 0;

      const baseAmount = qty * netCost;
      const taxAmount = (baseAmount * (sgst + cgst + igst)) / 100;
      return sum + taxAmount;
    }, 0);
  }, [scopeData]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return basicAmount + parseFloat(freight || 0) + taxesTotal;
  }, [basicAmount, freight, taxesTotal]);

  // Save freight to cache (only in add mode)
  useEffect(() => {
    const isAddMode = workOrderId === 'temp' || !workOrderId;

    if (isAddMode) {
      // Only save to cache in add mode
      const cacheKey = `workOrder_${workOrderId || 'temp'}_freight`;
      localStorage.setItem(cacheKey, freight.toString());
    }

    // Always call onDataChange to update parent component
    if (onDataChange) {
      onDataChange({ freight, basicAmount, taxesTotal, grandTotal });
    }
  }, [freight, basicAmount, taxesTotal, grandTotal, workOrderId, onDataChange]);

  // Load freight from initialFreight (edit mode) or cache (add mode)
  useEffect(() => {
    const isEditMode = workOrderId && workOrderId !== 'temp';

    if (isEditMode && initialFreight !== undefined) {
      // Edit mode: Use initialFreight from formProps and format to 2 decimal places
      const formattedFreight = initialFreight ? parseFloat(initialFreight).toFixed(2) : '';
      setFreight(formattedFreight);
    } else {
      // Add mode: Load from cache
      const cacheKey = `workOrder_${workOrderId || 'temp'}_freight`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setFreight(cached);
      }
    }
  }, [workOrderId, initialFreight]);

  // Listen for clear event
  useEffect(() => {
    const handleClearGrid = () => {
      setFreight('');
    };
    window.addEventListener('clearWorkOrderGrids', handleClearGrid);
    return () => {
      window.removeEventListener('clearWorkOrderGrids', handleClearGrid);
    };
  }, []);

  return (
    <div style={{ marginTop: '20px' }}>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(105, 65, 198, 1)',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFF' }}>
          Financial Details
        </h3>
      </div>
      <table
        style={{
          width: '100%',
          border: '1px solid #d9d9d9',
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              BASIC AMOUNT
            </th>
            <th
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              FRIEGHT
            </th>
            <th
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              TAXES
            </th>
            <th
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              GRANDTOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              {basicAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td
              style={{
                border: '1px solid #d9d9d9',
                padding: '8px 16px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              <input
                type="text"
                inputMode="decimal"
                placeholder="Enter freight"
                value={freight || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and decimal point, or empty string
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFreight(value);
                  }
                }}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  textAlign: 'center',
                }}
              />
            </td>
            <td
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontSize: '14px',
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              {taxesTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td
              style={{
                border: '1px solid #d9d9d9',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: '#fff',
                textAlign: 'center',
              }}
            >
              {grandTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

class WorkOrder {
  constructor() {
    this.tableName = '10818';
    this.entityName = 'WorkOrder';
    this.displayName = 'Work Order';
    this.title = 'Work Order';
    this.validationCallback = null;

    // Bind methods
    this.customContent = this.customContent.bind(this);
    this.beforeSave = this.beforeSave.bind(this);
    this.enhanceFormConfig = this.enhanceFormConfig.bind(this);
    this.renderCustomContent = this.renderCustomContent.bind(this);
    this.getCachedChildGrids = this.getCachedChildGrids.bind(this);

    // Register with ViewRegistry
    ViewRegistry.registerEntityCustomizations(this.tableName, this);
  }

  enhanceFormConfig(originalConfig) {
    if (!originalConfig || !originalConfig.columns) {
      console.warn('Invalid form configuration:', originalConfig);
      return originalConfig;
    }

    const fieldMap = {};
    originalConfig.columns.forEach((col) => {
      fieldMap[col.dataIndex] = col;
    });

    // Hide these fields from the form UI
    if (fieldMap['AssetCompliantId']) {
      fieldMap['AssetCompliantId'] = {
        ...fieldMap['AssetCompliantId'],
        hideInForm: true,
      };
    }
    if (fieldMap['AssetId']) {
      fieldMap['AssetId'] = {
        ...fieldMap['AssetId'],
        hideInForm: true,
      };
    }
    // Vendor and PreparedBy are now included in the Vendor & Legal Details section
    // No longer hiding them

    const sections = [
      {
        header: 'Vendor & Legal Details',
        isCollapse: true,
        alwaysExpanded: true,
        defaultExpanded: true,
        layout: 'vertical', // Stack sections vertically
        width: '100%', // Full width for each section
        fieldLayout: 'grid', // Use grid layout for fields within section
        gridColumns: 2, // Two columns for side-by-side layout
        columns: [
          'Vendor',
          'PreparedBy',
          'CINno',
          'WODate',
          'IECCode',
          'InsurancePolicyNo',
          'InsurancePolicyDate',
        ]
          .filter((key) => fieldMap[key])
          .map((key) => fieldMap[key]),
      },
      {
        header: 'Billing & Shipping Address',
        isCollapse: true,
        alwaysExpanded: true,
        defaultExpanded: true,
        layout: 'vertical',
        width: '100%',
        columns: ['BillingAddress', 'ShippingAddress']
          .filter((key) => fieldMap[key])
          .map((key) => {
            const field = fieldMap[key];
            return {
              ...field,
              type: 'textarea',
              inputType: 'textarea',
              fieldType: 'textarea',
              component: 'textarea',
              rowSpan: 4,
              rows: 4,
              multiline: true,
              className: 'wo-address-field', // Add a specific class for styling
              style: {
                minHeight: '100px',
                resize: 'vertical',
              },
            };
          }),
      },
    ];

    const sectionedFieldNames = new Set();
    sections.forEach((section) => {
      section.columns.forEach((col) => sectionedFieldNames.add(col.dataIndex));
    });

    return {
      ...originalConfig,
      columns: sections,
      layout: 'horizontal',
      sectionLayout: 'sideBySide',
      formLayout: {
        type: 'horizontal',
        sectionSpacing: '20px',
        fullWidth: true,
        gridColumns: 2,
      },
    };
  }

  customContent(formProps) {
    return (
      <WorkOrderSearchComponent
        formProps={formProps}
        onValidationCallback={(callback) => {
          this.validationCallback = callback;
        }}
      />
    );
  }

  getCachedChildGrids(workOrderId) {
    try {
      const scopeCacheKey = `workOrder_${workOrderId || 'temp'}_10819`;
      const financialCacheKey = `workOrder_${workOrderId || 'temp'}_10820`;

      const scopeCache = JSON.parse(localStorage.getItem(scopeCacheKey) || '{}');
      const financialCache = JSON.parse(localStorage.getItem(financialCacheKey) || '{}');

      return {
        scopeData: scopeCache.gridData || [],
        financialData: financialCache.gridData || [],
      };
    } catch (error) {
      return { scopeData: [], financialData: [] };
    }
  }

  // Add hidden fields to payload before save
  beforeSave(payload, formValues, form) {
    window.workOrderSaveInProgress = true;

    // Use this.scopeData (from grid callback) instead of cache
    // In edit mode, data is in component state, not cache
    const scopeData = this.scopeData || [];

    // Validate Scope of Work items
    if (!scopeData || scopeData.length === 0) {
      window.workOrderSaveInProgress = false;

      // Trigger validation error display in the grid
      if (window.triggerScopeValidation) {
        window.triggerScopeValidation();
      }

      return false;
    }

    // Freight from this.financialData or cache
    let freight = 0;
    if (this.financialData && this.financialData.freight !== undefined) {
      freight = parseFloat(this.financialData.freight) || 0;
    } else {
      const freightCacheKey = `workOrder_${formValues.WorkOrderId || 'temp'}_freight`;
      freight = parseFloat(localStorage.getItem(freightCacheKey) || 0);
    }

    // BasicAmount
    const basicAmount = scopeData.reduce((sum, item) => {
      return sum + (parseFloat(item.Amount) || 0);
    }, 0);

    // Taxes total
    const taxesTotal = scopeData.reduce((sum, item) => {
      const qty = parseFloat(item.Quantity) || 0;
      const cost = parseFloat(item.NetUnitCost) || 0;
      const sgst = parseFloat(item.SGSTTax) || 0;
      const cgst = parseFloat(item.CGSTTax) || 0;
      const igst = parseFloat(item.IGSTTax) || 0;

      const base = qty * cost;
      const taxAmt = (base * (sgst + cgst + igst)) / 100;

      return sum + taxAmt;
    }, 0);

    const grandTotal = basicAmount + freight + taxesTotal;

    // WorkOrderStatus
    const workOrderStatus = payload.WorkOrderStatus || formValues.WorkOrderStatus;
    if (workOrderStatus === 'Open') {
      payload.IsClosed = false;
    } else if (workOrderStatus === 'Closed') {
      payload.IsClosed = true;
    } else {
      payload.IsClosed = payload.IsClosed || false;
    }

    const isEditMode = !!(formValues.WorkOrderId || payload.WorkOrderId);

    // Asset + Complaint - Get from multiple sources
    let assetId = payload.AssetId || formValues.AssetId;
    let assetCompliantId = payload.AssetCompliantId || formValues.AssetCompliantId;

    // In edit mode, use stored values from renderCustomContent
    if (isEditMode) {
      if (!assetId && this.editModeAssetId) {
        assetId = this.editModeAssetId;
      }
      if (!assetCompliantId && this.editModeAssetCompliantId) {
        assetCompliantId = this.editModeAssetCompliantId;
      }
    }

    if (form?.getFieldValue) {
      if (!assetId) assetId = form.getFieldValue('AssetId');
      if (!assetCompliantId) assetCompliantId = form.getFieldValue('AssetCompliantId');
    }

    if (!isEditMode && (!assetId || !assetCompliantId)) {
      message.error(!assetId ? 'Asset is required' : 'Complaint is required');
      return false;
    }

    // Scope JSON Mapping
    const workOrderScopeJson = scopeData.map((item) => ({
      ItemOrder: item.ItemOrder,
      ItemDescription: item.Description,
      DeliveryDate: item.DeliveryDate,
      Quantity: item.Quantity,
      UOM: item.UOM || '',
      Cost: item.NetUnitCost,
      Sgst: item.SGSTTax,
      Cgst: item.CGSTTax,
      Igst: item.IGSTTax,
      Amount: item.Amount,
    }));

    // Clean payload
    const cleanPayload = { ...payload };
    delete cleanPayload.action;
    delete cleanPayload.apiIdentifier;

    // Map "Shipping Address" back to ShippingAddress for API
    // if (cleanPayload["Shipping Address"]) {
    //   cleanPayload.ShippingAddress = cleanPayload["Shipping Address"];
    //   delete cleanPayload["Shipping Address"];
    // }

    // FINAL WorkOrder Object
    const workOrder = {
      ...cleanPayload,
      BasicAmount: basicAmount,
      Tax: taxesTotal,
      Frieght: freight,
      GrandTotal: grandTotal,
      WorkOrderScopeJson: workOrderScopeJson,
    };

    // Always ensure AssetId and AssetCompliantId are included
    if (assetId) {
      workOrder.AssetId = assetId;
    }
    if (assetCompliantId) {
      workOrder.AssetCompliantId = assetCompliantId;
    }

    // Add WorkOrderId for edit mode
    if (isEditMode) {
      workOrder.WorkOrderId = formValues.WorkOrderId || payload.WorkOrderId;
    }

    // Use correct RequestType based on mode
    const finalPayload = {
      action: 'JsonRequest',
      // RequestType: isEditMode ? 'WorkOrder_Update' : 'WorkOrder_Add',
      RequestType: 'WorkOrder_Add',
      InputJson: JSON.stringify({
        WorkOrder: [workOrder],
      }),
    };

    // SEND API
    API.triggerPost('Plant', finalPayload)
      .then((response) => {
        window.workOrderSaveInProgress = false;

        // Check if success is explicitly true
        const isSuccess = response?.data?.success === true || response?.success === true;

        if (isSuccess) {
          const workOrderId = formValues.WorkOrderId || 'temp';
          localStorage.removeItem(`workOrder_${workOrderId}_10819`);
          localStorage.removeItem(`workOrder_${workOrderId}_10820`);

          // Determine the correct success message based on edit mode
          let successMsg;

          // First check if backend returned a specific message
          const backendMsg =
            response?.data?.data?.Result?.[0]?.SucessMessage ||
            response?.data?.data?.Result?.[0]?.SuccessMessage ||
            response?.data?.info ||
            response?.data?.message ||
            response?.message;

          // If backend message exists and doesn't contain generic "saved" text, use it
          // Otherwise, use our custom message based on edit mode
          if (backendMsg && !backendMsg.toLowerCase().includes('saved successfully')) {
            successMsg = backendMsg;
          } else {
            successMsg = isEditMode
              ? 'Work Order updated successfully!'
              : 'Work Order created successfully!';
          }

          if (showResponseModal) {
            showResponseModal(successMsg, 'success');
          } else {
            message.success(successMsg);
            window.dispatchEvent(new Event('clearWorkOrderGrids'));
            setTimeout(() => {
              if (window.workOrderRefreshCallback) {
                window.workOrderRefreshCallback();
              }
            }, 1500);
          }
        } else {
          // Handle failure case - show error modal
          const errorMsg =
            response?.data?.info ||
            response?.data?.message ||
            response?.data?.data ||
            response?.message ||
            'Failed to save WorkOrder';

          if (showResponseModal) {
            showResponseModal(errorMsg, 'error');
          } else {
            message.error(errorMsg);
          }
        }
      })
      .catch((error) => {
        window.workOrderSaveInProgress = false;
        let errorMsg = 'Failed to save WorkOrder';

        try {
          const errData =
            typeof error.response?.data === 'string'
              ? JSON.parse(error.response.data)
              : error.response?.data;

          errorMsg = errData?.Message || error.message || errorMsg;
        } catch {}

        if (showResponseModal) {
          showResponseModal(errorMsg, 'error');
        } else {
          message.error(errorMsg);
        }
      });

    // Prevent default save ALWAYS
    return false;
  }

  customizeGridColumns(columns, config) {
    if (!Array.isArray(columns)) return columns;

    let updatedColumns = [...columns];

    // Pin Status column to the right
    const statusColumns = updatedColumns.filter((col) => col.dataIndex === 'WorkOrderStatus');
    statusColumns.forEach((statusColumn) => {
      const statusIndex = updatedColumns.findIndex((col) => col === statusColumn);
      if (statusIndex !== -1) {
        const column = updatedColumns.splice(statusIndex, 1)[0];
        column.pinned = 'right';
        column.lockPinned = true;
        column.width = column.width || 100;
        updatedColumns.push(column);
      }
    });

    // Main WorkOrder grid: Remove Action column and audit columns
    return updatedColumns.filter((col) => col.dataIndex !== 'Action');
  }
  getCustomizations() {
    return {
      tableName: this.tableName,
      entityName: this.entityName,
      displayName: this.displayName,
      enhanceFormConfig: this.enhanceFormConfig,
      customContent: this.customContent,
      renderCustomContent: this.renderCustomContent,
      beforeSave: this.beforeSave,
      customizeGridColumns: this.customizeGridColumns,
      drawerBodyStyle: {
        padding: '24px',
      },
    };
  }

  renderCustomContent(requestRerender, formProps) {
    const isAddMode = !formProps?.selectedRow?.WorkOrderId;

    // Store AssetId and AssetCompliantId for edit mode
    if (!isAddMode && formProps?.selectedRow) {
      this.editModeAssetId = formProps.selectedRow.AssetId;
      this.editModeAssetCompliantId = formProps.selectedRow.AssetCompliantId;
    }

    // Store the refresh callback from formProps
    // formProps might have toggle/toogle callback from BaseView
    if (formProps?.toggle) {
      window.workOrderRefreshCallback = formProps.toggle;
    }

    // Store the form close callback
    // Don't clear cache on close - only clear after successful save in success modal
    if (formProps?.onClose) {
      const originalOnClose = formProps.onClose;
      // Override onClose to clear data when form is cancelled
      formProps.onClose = () => {
        // Clear localStorage cache for child grids
        localStorage.removeItem('workOrder_temp_10819'); // Scope of Work
        localStorage.removeItem('workOrder_temp_10820'); // Financial Details
        // Dispatch event to clear the grid components
        window.dispatchEvent(new Event('clearWorkOrderGrids'));

        // Call the original close handler
        originalOnClose();
      };
      // Store for success modal use
      window.workOrderCloseForm = originalOnClose;
    }
    return (
      <>
        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
              max-height: 0;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              max-height: 200px;
            }
          }

          /* Custom scrollbar for tables */
          .ant-table-body::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }

          .ant-table-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .ant-table-body::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          .ant-table-body::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Style the search bar */
          .wo-search-bar {
            background: white !important;
            border-bottom: 1px solid #e0e0e0 !important;
            margin-bottom: 16px !important;
          }

          /* Adjust padding for the form content */
          .form-drawer .ant-form-item {
            margin-bottom: 12px !important;
          }

          /* Ensure 4-column layout for first section remains tidy */
          /* Force all WorkOrder collapse panels to be always expanded */
          .ant-collapse .ant-collapse-item {
            border-bottom: 1px solid #d9d9d9 !important;
          }

          .ant-collapse .ant-collapse-item .ant-collapse-header {
            pointer-events: none !important;
            cursor: default !important;
            color: #FFF !important;
            background-color: rgba(105, 65, 198, 1) !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
          }

          .ant-collapse .ant-collapse-item .ant-collapse-header .ant-collapse-arrow {
            display: none !important;
          }

          .ant-collapse .ant-collapse-item .ant-collapse-content {
            display: block !important;
            height: auto !important;
            border-top: none !important;
          }

          .ant-collapse .ant-collapse-item .ant-collapse-content .ant-collapse-content-box {
            padding: 16px !important;
            display: block !important;
          }

          /* Ensure all collapse items are in active state */
          .ant-collapse .ant-collapse-item.ant-collapse-item-active .ant-collapse-content {
            display: block !important;
          }

          /* General Information section - 2 column layout */
          .form-drawer .ant-collapse-item:first-child .ant-collapse-content .ant-collapse-content-box {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            align-items: start !important;
          }

          /* New address section container and field styling */
          /* Assuming Billing & ShippingAddress is the second collapse item */
          .form-drawer .ant-collapse-item:nth-child(2) .ant-collapse-content .ant-collapse-content-box {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            align-items: start !important;
          }

          .form-drawer .ant-collapse-item:nth-child(2) .ant-collapse-content .ant-form-item.wo-address-field {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important; /* Remove any lingering right margin */
          }

          /* The third collapse item is now Vendor & Legal, update its grid columns */
          .form-drawer .ant-collapse-item:nth-child(3) .ant-collapse-content .ant-collapse-content-box {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            align-items: start !important;
          }

          /* Separate Scope Of Work and Financial Details sections */
          .workorder-section {
            border-radius: 6px !important;
            margin-bottom: 40px !important;
            background-color: #fafafa !important;
          }

          .workorder-section-header {
            background-color: #f0f0f0 !important;
            border-bottom: 1px solid #e8e8e8 !important;
            padding: 12px 16px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          .workorder-section-content {
            padding: 0px !important;
            margin-bottom: 20px !important;
          }

          /* Ensure grid action buttons are visible and in header row */
          .ag-header-cell .ag-header-cell-text {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          .ag-header-cell button {
            opacity: 1 !important;
            visibility: visible !important;
          }

          /* Remove hover-only display for buttons */
          .ag-row:hover .ag-cell button {
            opacity: 1 !important;
            visibility: visible !important;
          }
        `}</style>

        <FormCleanupWrapper>
          <ScopeOfWorkGrid
            workOrderId={formProps?.selectedRow?.WorkOrderId || 'temp'}
            initialData={formProps?.selectedRow?.WorkOrderScopeJson}
            onDataChange={(data) => {
              this.scopeData = data;
              // Trigger re-render to update financial details
              if (requestRerender) {
                requestRerender();
              }
            }}
          />

          <FinancialDetailsGrid
            workOrderId={formProps?.selectedRow?.WorkOrderId || 'temp'}
            initialFreight={formProps?.selectedRow?.Frieght}
            scopeData={this.scopeData || []}
            onDataChange={(data) => {
              this.financialData = data;
            }}
          />
        </FormCleanupWrapper>

        <WorkOrderResponseModal />
      </>
    );
  }
}

const workOrderCustomization = new WorkOrder();
export default workOrderCustomization;
