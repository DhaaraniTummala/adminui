import React from 'react';

const GenericViewModal = ({
  visible,
  onClose,
  onBack,
  title,
  width = '750px',
  children,
  selectedRowData,
  headerStyle = {},
}) => {
  const AssetBreakDownIsClosedFlag = selectedRowData?.AssetBreakDownJson
    ? JSON.parse(selectedRowData.AssetBreakDownJson || '[]')[0]?.IsClosed ?? false
    : false;

  const AssetObservationIsClosedFlag = selectedRowData?.AssetObservationJson
    ? JSON.parse(selectedRowData.AssetObservationJson || '[]')[0]?.IsClosed ?? false
    : false;

  if (!visible) return null;
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
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(2px)',
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Drawer Modal */}
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          bottom: '10px',
          width,
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: headerStyle.backgroundColor || '#fff',
            color: headerStyle.color || 'inherit',
            ...headerStyle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: headerStyle.color || 'rgba(0,0,0,0.8)',
                }}
              >
                ←
              </button>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'inherit',
              }}
            >
              {title}
              {title === 'Edit Breakdown Details' ||
              title === 'Observation Details' ? null : AssetBreakDownIsClosedFlag == true ||
                AssetObservationIsClosedFlag == true ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '23px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    lineHeight: '20px',
                    color: '#12B76A',
                    backgroundColor: '#ECFDF3',
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
                      backgroundColor: '#12B76A',
                    }}
                  ></span>
                  {selectedRowData.CompliantStatus}
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '23px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    lineHeight: '20px',
                    color: '#F79009',
                    backgroundColor: '#FFFAEB',
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
                      backgroundColor: '#F79009',
                    }}
                  ></span>
                  {selectedRowData.CompliantStatus}
                </span>
              )}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericViewModal;
