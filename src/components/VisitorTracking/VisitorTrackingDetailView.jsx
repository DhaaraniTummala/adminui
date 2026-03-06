import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import CustomDrawer from '../common/CustomDrawer';
import API from '../../store/requests';
import { entityConfigs } from '../../configs/entityConfigs';
import { createGenericSection } from '../../utils/sectionUtils';
import StatusBadge from '../common/StatusBadge';
import SuccessModal from '../common/SuccessModal';
import './VisitorTrackingDetailView.css';

const VisitorTrackingDetailView = ({ visible, recordId, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadVisitorDetails = React.useCallback(async () => {
    if (!recordId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await API.triggerPost('10826', {
        action: 'LoadView',
        Guid: recordId,
      });

      if (response.data) {
        const result = Array.isArray(response.data) ? response.data[0] : response.data;
        setData(result);
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error loading visitor details:', error);
      setError(error.message || 'Failed to load visitor details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (visible && recordId) {
      loadVisitorDetails();
    }
  }, [visible, recordId, loadVisitorDetails]);

  // Render visitor details using generic section with purple header
  const renderVisitorDetails = () => {
    return createGenericSection({
      title: 'Visitor Information',
      fields: visitorConfig.fields,
      rowData: data,
      columnCount: 4,
    });
  };

  const visitorConfig = entityConfigs.visitorTracking;

  return (
    <>
      <CustomDrawer open={visible} onClose={onClose} width={1500} title="View Visitor Details">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: '#ff4d4f', marginBottom: '16px', fontSize: '16px' }}>
              ⚠️ {error}
            </div>
            <Button onClick={loadVisitorDetails}>Retry</Button>
          </div>
        ) : data ? (
          <div style={{ padding: '24px' }}>
            {/* Image Section with Checkout Button */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Status Badge */}

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    VISITOR IMAGE
                  </h3>

                  {data.InStatus && data.InStatus.toUpperCase() === 'CHECK OUT' ? (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor: '#FEF3F2',
                        color: '#B42318',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#F04438',
                        }}
                      />
                      CHECK OUT
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor: '#ECFDF3',
                        color: '#027A48',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#12B76A',
                        }}
                      />
                      CHECK IN
                    </div>
                  )}
                </div>

                {/* Checkout Button - Only show if OutDateTime is null */}
                {!data.OutDateTime && (
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={() => setShowConfirmModal(true)}
                    style={{
                      backgroundColor: '#99f4bfff',
                      borderColor: '#99f4bfff',
                      height: '44px',
                      padding: '0 32px',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      color: '#027A48',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#99f4bfff';
                      e.target.style.borderColor = '#99f4bfff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#99f4bfff';
                      e.target.style.borderColor = '#99f4bfff';
                    }}
                  >
                    CHECK OUT
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'start' }}>
                <div
                  style={{
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {data.ImageUrl ? (
                    <img
                      src={data.ImageUrl}
                      alt="Visitor"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '250px',
                        borderRadius: '8px',
                        objectFit: 'contain',
                        marginBottom: '12px',
                      }}
                    />
                  ) : (
                    <svg
                      width="270"
                      height="270"
                      viewBox="0 0 80 80"
                      fill="none"
                      style={{ marginBottom: '12px' }}
                    >
                      <circle cx="30" cy="25" r="10" fill="#D1D5DB" />
                      <path d="M10 60 L20 45 L35 55 L50 40 L70 60 Z" fill="#D1D5DB" />
                      <rect
                        x="5"
                        y="5"
                        width="70"
                        height="70"
                        rx="8"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
                    Visitor Image
                  </p>
                </div>
              </div>
            </div>

            {/* Visitor Details Section - Below image, with purple header */}
            <div>{renderVisitorDetails()}</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>No data available</p>
          </div>
        )}
      </CustomDrawer>

      {/* Confirmation Modal */}
      <SuccessModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Are you sure you want to checkout this visitor?"
        iconType="warning"
        showCancelButton={true}
        confirmButtonText="Yes, Checkout"
        onConfirm={async () => {
          try {
            setShowConfirmModal(false);
            setLoading(true);

            // Format current time using same logic as trackingHelpers.js formatLocalDateTime
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const outDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

            console.log('Checking out visitor:', recordId, 'at', outDateTime);

            // Send update to backend using API.triggerMultiPartPost
            const response = await API.triggerMultiPartPost('10826', {
              action: 'Update',
              VisitorTrackingId: recordId,
              OutDateTime: outDateTime,
            });

            if (response.data) {
              console.log('Visitor checked out successfully');

              // Close the drawer
              onClose();

              // Refresh the grid if refresh callback is provided
              if (onRefresh) {
                onRefresh();
              }
            }
          } catch (error) {
            console.error('Error checking out visitor:', error);
            setError('Failed to checkout visitor. Please try again.');
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
};

export default VisitorTrackingDetailView;
