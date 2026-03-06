import React, { useState, useCallback, useEffect } from 'react';
import { Button, Radio, message } from 'antd';
import CustomSelect from '../../components/maiden-core/ui-components/custom-select';
import { CustomDateInput } from '../../components/maiden-core/ui-components';
import API from '../../store/requests';
import { CloseOutlined } from '@ant-design/icons';
import CustomDrawer from '../../components/common/CustomDrawer';
import SuccessModal from '../../components/common/SuccessModal';
import AssetSearchAndDetails from '../../components/AssetDetails/AssetSearchAndDetails';
import moment from 'moment';
import './ScheduleMaintenanceDrawer.css';

const SchedulePMDrawer = ({ open, onClose, onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form values
  const [checklist, setChecklist] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  const [pmType, setPmType] = useState('');
  const [Recurring, setRecurring] = useState('');
  const [remarks, setRemarks] = useState('');
  const [checklistOptions, setChecklistOptions] = useState([]);

  // Debounced API call for asset search
  const fetchAssetsBySearch = useCallback(async (searchString) => {
    try {
      setIsLoading(true);
      const payload = {
        RequestType: 'AssetSearch',
        InputJson: JSON.stringify({ AssetSearch: [{ SearchString: searchString }] }),
        action: 'JsonRequest',
      };
      const response = await API.triggerPost('Plant', payload);
      const assets = (response?.data?.data || []).map((item) => ({
        AssetId: item.AssetId,
        AssetInfo: item.AssetInfo,
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

  const handleAssetSelect = async (asset) => {
    setSearchQuery(asset.AssetInfo || '');
    setSuggestions([]);

    try {
      setIsLoading(true);
      const payload = { Guid: asset.AssetId, action: 'LoadView' };
      const response = await API.triggerPost('10738', payload);

      if (response?.data) {
        const assetData = Array.isArray(response.data) ? response.data[0] : response.data;
        console.log('Asset details loaded:', assetData);
        setSelectedAsset(assetData);

        // Fetch checklists for this asset
        fetchChecklists(asset.AssetId);
      } else {
        // If no detailed data, just use the basic asset info
        console.log('No detailed data, using basic asset info');
        setSelectedAsset(asset);

        // Fetch checklists for this asset
        fetchChecklists(asset.AssetId);
      }
    } catch (error) {
      console.error('Error loading asset details:', error);
      // Don't show error message, just use basic asset info
      setSelectedAsset(asset);

      // Fetch checklists for this asset
      fetchChecklists(asset.AssetId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    switch (name) {
      case 'checklist':
        setChecklist(value);
        break;
      case 'scheduleDate':
        setScheduleDate(value);
        break;
      case 'pmType':
        setPmType(value);
        break;
      case 'Recurring':
        setRecurring(value);
        break;
      case 'remarks':
        setRemarks(value);
        break;
      default:
        break;
    }
  };

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedAsset(null);
    setChecklist('');
    setScheduleDate(null);
    setPmType('');
    setRecurring('');
    setRemarks('');
    setIsLoading(false);
  }, []);

  // Fetch checklists based on selected asset
  const fetchChecklists = useCallback(async (assetId) => {
    if (!assetId) {
      console.log('No asset ID provided, skipping checklist fetch');
      return;
    }

    try {
      setChecklistsLoading(true);
      // Fetch checklists with AssetId in filterInfo
      const payload = {
        action: 'List',
        SortColumn: 'CheckListLabelId',
        filterInfo: [
          {
            filterBy: 'AssetId',
            filterTerm: assetId,
          },
        ],
      };
      const response = await API.triggerPost('10821', payload);
      console.log('📦 API Response:', response);

      // Check multiple possible response structures
      let checklistData = null;

      if (response?.data?.data && Array.isArray(response.data.data)) {
        checklistData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        checklistData = response.data;
      } else if (response?.data?.CheckList && Array.isArray(response.data.CheckList)) {
        checklistData = response.data.CheckList;
      }

      if (checklistData && checklistData.length > 0) {
        // Filter on frontend since backend is returning all checklists
        const filteredChecklists = checklistData.filter((item) => {
          const matches = item.AssetId?.toUpperCase() === assetId?.toUpperCase();
          console.log(
            `Checklist ${item.CheckListLabelId}: AssetId=${item.AssetId}, Expected=${assetId}, Match=${matches}`,
          );
          return matches;
        });

        const options = filteredChecklists.map((item) => {
          // Combine CheckListLabelId and CheckListName for display
          let displayText = item.CheckListLabelId || `Checklist ${item.CheckListId}`;

          // Add CheckListName if it exists and is not null
          if (item.CheckListName && item.CheckListName.trim() !== '') {
            displayText = `${displayText} - ${item.CheckListName}`;
          }

          return {
            LookupId: item.CheckListId,
            DisplayValue: displayText,
            ...item,
          };
        });

        console.log('✅ Final checklist options:', options);
        setChecklistOptions(options);

        if (options.length === 0) {
          console.warn('⚠️ No checklists found for this asset after filtering');
        }
      } else {
        console.warn('⚠️ No checklists found');
        setChecklistOptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching checklists:', error);
      console.error('Error details:', error.response || error.message);
      setChecklistOptions([]);
    } finally {
      setChecklistsLoading(false);
    }
  }, []);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      resetForm();
      // Don't fetch checklists on open - wait for asset selection
    }
  }, [open, resetForm]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!selectedAsset?.AssetId) {
        message.error('Please select an asset');
        return;
      }
      if (!checklist) {
        message.error('Please select a checklist');
        return;
      }
      if (!scheduleDate) {
        message.error('Please select a schedule date');
        return;
      }
      if (!pmType) {
        message.error('Please select PM type');
        return;
      }
      if (!Recurring) {
        message.error('Please select Recurring period');
        return;
      }

      setLoading(true);

      // Format the date to YYYY-MM-DD
      const formattedDate = scheduleDate.format('YYYY-MM-DD');

      // Capitalize first letter of pmType (electrical -> Electrical)
      const formattedPmType = pmType.charAt(0).toUpperCase() + pmType.slice(1);

      // Prepare the payload according to the API structure
      const payload = {
        RequestType: 'PreMain_Add',
        action: 'JsonRequest',
        InputJson: JSON.stringify({
          PreMain: [
            {
              AssetId: selectedAsset.AssetId,
              CheckListId: checklist,
              ScheduleDate: formattedDate,
              ScheduleType: Recurring,
              PreMainType: formattedPmType,
              Remarks: remarks || '',
            },
          ],
        }),
      };

      console.log('Submitting preventive maintenance with payload:', payload);

      // Call the API
      const response = await API.triggerPost('Plant', payload);

      console.log('API Response:', response);

      if (response?.data?.success) {
        // Show success modal
        setSuccessMessage('Maintenance scheduled Added successfully!');
        setSuccessModalOpen(true);

        // Reset form
        resetForm();

        // Close the drawer
        onClose();
      } else {
        const errorMsg =
          response?.data?.message || response?.data?.info || 'Failed to schedule maintenance';
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting preventive maintenance:', error);
      message.error('Failed to schedule maintenance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomDrawer
        title="Schedule Preventive Maintenance"
        open={open}
        onClose={onClose}
        width={620}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
        headerStyle={{
          background: '#6941C6',
          padding: '16px 24px',
          color: '#fff',
        }}
        footer={null}
      >
        <div className="flex flex-col h-full">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Asset Search and Details Component */}
            <AssetSearchAndDetails
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestions={suggestions}
              selectedAsset={selectedAsset}
              setSelectedAsset={(asset) => {
                setSelectedAsset(asset);
                if (!asset) {
                  setChecklistOptions([]);
                  setChecklist('');
                }
              }}
              onSearchChange={handleSearchChange}
              onAssetSelect={handleAssetSelect}
              placeholder="Search assets..."
            />

            {/* Form Fields - Only show when asset is selected */}
            {selectedAsset && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="w-full">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      style={{ fontSize: '11px' }}
                    >
                      Checklist <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      name="checklist"
                      title="Checklist"
                      options={checklistOptions}
                      mappingId="LookupId"
                      value={checklist}
                      onChange={(value) => {
                        console.log('Selected checklist value:', value);
                        handleInputChange('checklist', value);
                      }}
                      placeholder={
                        checklistsLoading ? 'Loading checklists...' : 'Select Checklist ID'
                      }
                      disabled={checklistsLoading}
                    />
                  </div>

                  <div className="w-full">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      style={{ fontSize: '11px' }}
                    >
                      Scheduling Event <span className="text-red-500">*</span>
                    </label>
                    <CustomDateInput
                      name="scheduleDate"
                      value={scheduleDate}
                      onChange={(date) => handleInputChange('scheduleDate', date)}
                      placeholder="Select Date"
                      format="DD-MM-YYYY"
                      className="w-full"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgb(209, 213, 219)',
                            borderRadius: '6px',
                            borderWidth: '1.5px',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgb(209, 213, 219)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B5CF6',
                            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
                          },
                          '& .MuiInputBase-input': {
                            backgroundColor: '#fff !important',
                            padding: '10px 12px',
                            height: '40px',
                            boxSizing: 'border-box',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Type & Recurring */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="w-full">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      style={{ fontSize: '11px' }}
                    >
                      Type of Preventive Maintenance <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center h-10">
                      <Radio.Group
                        onChange={(e) => handleInputChange('pmType', e.target.value)}
                        value={pmType}
                        className="flex items-center"
                      >
                        <Radio value="electrical" className="text-sm">
                          <span className="text-sm text-gray-700" style={{ fontSize: '13px' }}>
                            Electrical
                          </span>
                        </Radio>
                        <Radio value="mechanical" className="text-sm">
                          <span className="text-sm text-gray-700" style={{ fontSize: '13px' }}>
                            Mechanical
                          </span>
                        </Radio>
                        <Radio value="critical" className="text-sm">
                          <span className="text-sm text-gray-700" style={{ fontSize: '13px' }}>
                            Critical
                          </span>
                        </Radio>
                      </Radio.Group>
                    </div>
                  </div>

                  <div className="w-full">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      style={{ fontSize: '11px' }}
                    >
                      Recurring <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      name="Recurring"
                      title="Recurring"
                      options={[
                        { LookupId: '1Mon', DisplayValue: '1 Month' },
                        { LookupId: '3Mon', DisplayValue: '3 Months' },
                        { LookupId: '6Mon', DisplayValue: '6 Months' },
                        { LookupId: '12Mon', DisplayValue: '12 Months' },
                      ]}
                      mappingId="LookupId"
                      value={Recurring}
                      onChange={(value) => {
                        console.log('Selected Recurring value:', value);
                        handleInputChange('Recurring', value);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Remarks */}
                {/* <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Message..."
                    value={remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div> */}
              </>
            )}
          </div>

          {/* Footer - Only show when asset is selected */}
          {selectedAsset && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                background: '#fff',
              }}
            >
              <Button
                type="primary"
                loading={loading}
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#6941C6',
                  borderRadius: '6px',
                  border: 'none',
                  padding: '10px 16px',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                Schedule
              </Button>
            </div>
          )}
        </div>
      </CustomDrawer>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          // Refresh the parent component data after modal closes
          if (onFinish) {
            onFinish();
          }
        }}
        title={successMessage}
        iconType="success"
      />
    </>
  );
};

export default SchedulePMDrawer;
