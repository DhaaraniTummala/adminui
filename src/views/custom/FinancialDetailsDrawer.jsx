import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import CustomDrawer from '../../components/common/CustomDrawer';

const FinancialDetailsDrawer = ({ visible, onClose, onSave, editingRecord }) => {
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [freight, setFreight] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible && editingRecord) {
      setQuantity(editingRecord.Quantity || '');
      setUnitPrice(editingRecord.UnitPrice || '');
      setFreight(editingRecord.Freight || '');
      setDiscount(editingRecord.Discount || '');
      setTax(editingRecord.Tax || '');
      setTotalPrice(editingRecord.TotalPrice || '');
    } else if (visible) {
      // Reset for new record
      setQuantity('');
      setUnitPrice('');
      setFreight('');
      setDiscount('');
      setTax('');
      setTotalPrice('');
      setErrors({});
    }
  }, [visible, editingRecord]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!quantity) newErrors.quantity = 'Quantity is required';
    if (!unitPrice) newErrors.unitPrice = 'UnitPrice is required';
    if (!freight) newErrors.freight = 'Freight is required';
    if (!discount) newErrors.discount = 'Discount is required';
    if (!tax) newErrors.tax = 'Tax is required';
    if (!totalPrice) newErrors.totalPrice = 'TotalPrice is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      Quantity: parseInt(quantity) || 0,
      UnitPrice: parseFloat(unitPrice) || 0,
      Freight: parseFloat(freight) || 0,
      Discount: parseFloat(discount) || 0,
      Tax: parseFloat(tax) || 0,
      TotalPrice: parseFloat(totalPrice) || 0,
    };

    onSave(data);
    onClose();
  };

  return (
    <>
      <style>{`
        /* Drawer content wrapper */
        .drawer-content-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background-color: #ffffff;
        }
        
        /* Scrollable content */
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          padding-bottom: 80px;
        }
        
        /* Fixed footer */
        .fixed-footer {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 24px;   
          background: #fff;
          border-top: 1px solid #e5e7eb;
        }
        
        /* Ensure the drawer content takes full height */
        .ant-drawer-body {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 0 !important;
        }
      `}</style>
      <CustomDrawer
        title={editingRecord ? 'Edit Financial Detail' : 'Add Financial Detail'}
        open={visible}
        onClose={onClose}
        width={650}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
        containerStyle={{
          padding: 0,
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="drawer-content-wrapper" style={{ height: '100%' }}>
          <div className="scrollable-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              Quantity <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              placeholder="Enter Quantity"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors(prev => ({ ...prev, quantity: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.quantity && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.quantity}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              UnitPrice <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter UnitPrice"
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(e.target.value);
                setErrors(prev => ({ ...prev, unitPrice: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.unitPrice && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.unitPrice}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              Freight <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter Freight"
              value={freight}
              onChange={(e) => {
                setFreight(e.target.value);
                setErrors(prev => ({ ...prev, freight: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.freight && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.freight}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              Discount <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter Discount"
              value={discount}
              onChange={(e) => {
                setDiscount(e.target.value);
                setErrors(prev => ({ ...prev, discount: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.discount && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.discount}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              Tax <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter Tax"
              value={tax}
              onChange={(e) => {
                setTax(e.target.value);
                setErrors(prev => ({ ...prev, tax: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.tax && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.tax}</p>}
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
              TotalPrice <span style={{ color: 'red' }}>*</span>
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter TotalPrice"
              value={totalPrice}
              onChange={(e) => {
                setTotalPrice(e.target.value);
                setErrors(prev => ({ ...prev, totalPrice: '' }));
              }}
              style={{
                width: '100%',
                height: '50px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.totalPrice && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.totalPrice}</p>}
          </div>
        </div>

      </div>

      {/* Fixed Footer */}
      <div className="fixed-footer">
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{
              backgroundColor: '#6941C6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 20px',
              fontWeight: 500,
              height: '40px',
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  </CustomDrawer>
</>
  );
};

export default FinancialDetailsDrawer;
