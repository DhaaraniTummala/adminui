import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import CustomDrawer from '../common/CustomDrawer';
import API from '../../store/requests';
import { entityConfigs } from '../../configs/entityConfigs';
import { createGenericSection } from '../../utils/sectionUtils';
import StatusBadge from '../common/StatusBadge';
import SuccessModal from '../common/SuccessModal';
import './VehicleTrackingDetailView.css';

const VehicleTrackingDetailView = ({ visible, recordId, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadVehicleDetails = React.useCallback(async () => {
    if (!recordId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await API.triggerPost('10825', {
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
      console.error('Error loading vehicle details:', error);
      setError(error.message || 'Failed to load vehicle details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (visible && recordId) {
      loadVehicleDetails();
    }
  }, [visible, recordId, loadVehicleDetails]);

  // Render vehicle details using generic section with purple header
  const renderVehicleDetails = () => {
    return createGenericSection({
      title: 'Vehicle Information',
      fields: vehicleConfig.fields,
      rowData: data,
      columnCount: 4,
    });
  };

  const vehicleConfig = entityConfigs.vehicleTracking;

  return (
    <>
      <CustomDrawer open={visible} onClose={onClose} width={1500}  title="View Vehicle Details">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: '#ff4d4f', marginBottom: '16px', fontSize: '16px' }}>
              ⚠️ {error}
            </div>
            <Button onClick={loadVehicleDetails}>Retry</Button>
          </div>
        ) : data ? (
          <div style={{ padding: '24px' }}>
            {/* Images Section - Top, side by side */}
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
                    VEHICLE & DRIVER IMAGE
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Vehicle Image */}
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {data.ImageUrlVehicle ? (
                    <img
                      src={data.ImageUrlVehicle}
                      alt="Vehicle"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginBottom: '12px',
                      }}
                    />
                  ) : (
                    <svg
                      width="200"
                      height="200"
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
                    Vehicle Image
                  </p>
                </div>

                {/* Driver Image */}
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {data.ImageUrlDriver ? (
                    <img
                      src={data.ImageUrlDriver}
                      alt="Driver"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginBottom: '12px',
                      }}
                    />
                  ) : (
                    <svg
                      width="200"
                      height="200"
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
                    Driver Image
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Details Section - Below images, with purple header */}
            <div>{renderVehicleDetails()}</div>
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
        title="Are you sure you want to checkout this vehicle?"
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

            console.log('Checking out vehicle:', recordId, 'at', outDateTime);

            // Send update to backend using API.triggerMultiPartPost
            const response = await API.triggerMultiPartPost('10825', {
              action: 'Update',
              VehicleTrackingId: recordId,
              OutDateTime: outDateTime,
            });

            if (response.data) {
              console.log('Vehicle checked out successfully');

              // Close the drawer
              onClose();

              // Refresh the grid if refresh callback is provided
              if (onRefresh) {
                onRefresh();
              }
            }
          } catch (error) {
            console.error('Error checking out vehicle:', error);
            setError('Failed to checkout vehicle. Please try again.');
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
};

export default VehicleTrackingDetailView;
