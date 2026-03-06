import React, { useState, useEffect, useCallback } from 'react';
import { Button, message } from 'antd';
import API from '../../store/requests';
import CustomDrawer from '../../components/common/CustomDrawer';
import AssetSearchAndDetails from '@/components/AssetDetails/AssetSearchAndDetails';
import SuccessModal from '../../components/common/SuccessModal';

export default function AssetComplaintModal({ visible, onClose, title = 'Complaint', onSuccess }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [complaintPriority, setComplaintPriority] = useState('Low');
  const [complaintStatus, setComplaintStatus] = useState('Operational');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [complaintDescription, setComplaintDescription] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Reset all form fields
  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedAsset(null);
    setComplaintPriority('Low');
    setComplaintStatus('Operational');
    setComplaintDescription('');
    setSubmittingComplaint(false);
    setIsLoading(false);
  }, []);

  // Handle modal visibility changes
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);

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
      }, 300); // 500ms debounce delay
    },
    [fetchAssetsBySearch],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAssetSelect = useCallback(async (asset) => {
    setSearchQuery(asset.AssetInfo || '');
    setSuggestions([]);

    try {
      setIsLoading(true);
      const payload = { Guid: asset.AssetId };
      const response = await API.triggerPost('10738', { ...payload, action: 'LoadView' });
      if (response?.data) {
        setSelectedAsset(Array.isArray(response.data) ? response.data[0] : response.data);
      }
    } catch (error) {
      console.error('Error loading asset details:', error);
      message.error('Failed to load asset details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveComplaint = async () => {
    if (!selectedAsset) {
      message.error('Please select an asset');
      return;
    }

    if (!complaintDescription.trim()) {
      message.error('Please enter a description');
      return;
    }

    setSubmittingComplaint(true);
    try {
      const priorityMap = { Low: 1, Medium: 2, High: 3 };

      const payload = {
        action: 'insert',
        CompliantPriority: priorityMap[complaintPriority] || 1,
        OperationalStatus: complaintStatus === 'Operational',
        CompliantDescription: complaintDescription,
        AssetId: selectedAsset.AssetId,
        apiIdentifier: 'Complaint',
      };

      const response = await API.triggerMultiPartPost('10744', payload, null, null);
      if (response?.data?.success) {
        // Show success modal instead of toast
        setShowSuccessModal(true);
      } else {
        message.error(response?.data?.info || 'Failed to save complaint');
      }
    } catch (error) {
      console.error('Error saving complaint:', error);
      message.error('Error while saving complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

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

        /* ===== Purple Vertical Scrollbar ===== */

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
      `}</style>
      <CustomDrawer
        title={`Add ${title}`}
        open={visible}
        onClose={onClose}
        width="600px"
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
        headerStyle={{
          padding: '12px 24px',
          borderBottom: '1px solid #f0f0f0',
          margin: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div
            className="purple-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            {' '}
            {/* Subtitle */}
            {/* Body */}
            <div style={{ marginTop: '-15px' }}>
              {/* Search Bar */}
              <AssetSearchAndDetails
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                suggestions={suggestions}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                onSearchChange={handleSearchChange}
                onAssetSelect={handleAssetSelect}
                placeholder="Search assets..."
              />

              <div style={{ marginTop: '24px' }}>
                {/* Priority + Operational Status */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Priority */}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                      Priority <span style={{ color: 'red' }}>*</span>
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {['Low', 'Medium', 'High'].map((priority) => (
                        <label
                          key={priority}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                          }}
                        >
                          <input
                            type="radio"
                            name="priority"
                            value={priority}
                            checked={complaintPriority === priority}
                            onChange={() => setComplaintPriority(priority)}
                            style={{ accentColor: '#6b4eff' }}
                          />
                          {priority}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                      Operational Status <span style={{ color: 'red' }}>*</span>
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                        }}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="Operational"
                          checked={complaintStatus === 'Operational'}
                          onChange={() => setComplaintStatus('Operational')}
                          style={{ accentColor: '#6b4eff' }}
                        />
                        Operational
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                        }}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="Non-Operational"
                          checked={complaintStatus === 'Non-Operational'}
                          onChange={() => setComplaintStatus('Non-Operational')}
                          style={{ accentColor: '#6b4eff' }}
                        />
                        Non-Operational
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                    Description <span style={{ color: 'red' }}>*</span>
                  </p>
                  <textarea
                    placeholder="Message..."
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '11px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              background: '#fff',
            }}
          >
            <Button
              type="primary"
              loading={submittingComplaint}
              onClick={saveComplaint}
              style={{
                backgroundColor: '#6941C6',
                borderRadius: '6px',
                border: 'none',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
              }}
              disabled={!selectedAsset || !complaintDescription.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </CustomDrawer>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          if (onSuccess) onSuccess(); // Call the refresh callback
        }}
        title="Complaint Saved Successfully!"
        message="The complaint has been successfully submitted to the system."
        iconType="success"
      />
    </>
  );
}
