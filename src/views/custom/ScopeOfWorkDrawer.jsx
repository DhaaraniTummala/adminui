import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import CustomDrawer from '../../components/common/CustomDrawer';
import { CustomDateInput } from '../../components/maiden-core/ui-components';
import moment from 'moment';

const ScopeOfWorkDrawer = ({ visible, onClose, onSave, editingRecord, onDelete }) => {
  const [itemOrder, setItemOrder] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [uom, setUom] = useState('');
  const [netUnitCost, setNetUnitCost] = useState('');
  const [sgstTax, setSgstTax] = useState('');
  const [cgstTax, setCgstTax] = useState('');
  const [igstTax, setIgstTax] = useState('');
  const [errors, setErrors] = useState({});

  // Calculate amount (without taxes) = quantity * netUnitCost
  const calculateAmount = () => {
    const qty = parseFloat(quantity) || 0;
    const costStr = netUnitCost ? String(netUnitCost).replace(/,/g, '') : '0';
    const cost = parseFloat(costStr) || 0;
    const amount = (qty * cost).toFixed(2);
    // Format with Indian number format
    return parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (visible && editingRecord) {
      setItemOrder(editingRecord.ItemOrder || '');
      setDescription(editingRecord.Description || '');
      setDeliveryDate(editingRecord.DeliveryDate ? moment(editingRecord.DeliveryDate) : null);
      setQuantity(editingRecord.Quantity || '');
      setUom(editingRecord.UOM || '');
      setNetUnitCost(editingRecord.NetUnitCost || '');
      setSgstTax(editingRecord.SGSTTax || '');
      setCgstTax(editingRecord.CGSTTax || '');
      setIgstTax(editingRecord.IGSTTax || '');
    } else if (visible) {
      // Reset for new record
      setItemOrder('');
      setDescription('');
      setDeliveryDate(null);
      setQuantity('');
      setUom('');
      setNetUnitCost('');
      setSgstTax('');
      setCgstTax('');
      setIgstTax('');
      setErrors({});
    }
  }, [visible, editingRecord]);

  const handleSubmit = () => {
    const newErrors = {};

    // Required field validations - only for Quantity and Net Unit Cost
    if (!quantity) newErrors.quantity = 'Quantity is required';
    if (!netUnitCost) newErrors.netUnitCost = 'Net unit cost is required';

    // Convert formatted netUnitCost back to number for validation and submission
    const netUnitCostValue = netUnitCost ? parseFloat(netUnitCost.replace(/,/g, '')) : null;

    // Quantity validation: must not be 0 or negative
    const qtyValue = parseFloat(quantity);
    if (quantity && (isNaN(qtyValue) || qtyValue <= 0)) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Net unit cost validation: must not be 0 or negative
    const costValue = parseFloat(netUnitCost);
    if (netUnitCost && (isNaN(costValue) || costValue <= 0)) {
      newErrors.netUnitCost = 'Net unit cost must be greater than 0';
    }

    // Delivery date validation: if provided, must be valid
    if (deliveryDate && !deliveryDate.isValid()) {
      newErrors.deliveryDate = 'Please enter a valid date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      ItemOrder: itemOrder,
      Description: description,
      DeliveryDate: deliveryDate ? deliveryDate.format('YYYY-MM-DD') : null,
      Quantity: parseFloat(quantity) || 0,
      UOM: uom,
      NetUnitCost: netUnitCostValue || 0,
      SGSTTax: parseFloat(sgstTax) || 0,
      CGSTTax: parseFloat(cgstTax) || 0,
      IGSTTax: parseFloat(igstTax) || 0,
      Amount: parseFloat(calculateAmount()) || 0,
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
        title={editingRecord ? 'Edit Scope of Work Order' : 'Add Scope of Work Order'}
        open={visible}
        onClose={onClose}
        width={650}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
        containerStyle={{
          padding: 0,
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="drawer-content-wrapper" style={{ height: '100%' }}>
          <div className="scrollable-content">
            {/* Row 1: Item Order & Delivery Date */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>Item Order</p>
                <input
                  type="text"
                  placeholder="Enter Item Order (e.g., IO123)"
                  value={itemOrder}
                  onChange={(e) => {
                    setItemOrder(e.target.value);
                    setErrors((prev) => ({ ...prev, itemOrder: '' }));
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
                {/* {errors.itemOrder && (
                  <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.itemOrder}</p>
                )} */}
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  Delivery Date (Optional)
                </p>
                <CustomDateInput
                  value={deliveryDate}
                  onChange={(date) => {
                    setDeliveryDate(date);
                  }}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* Row 2: Quantity, UOM & Net Unit Cost */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '24px',
                marginBottom: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  Quantity <span style={{ color: 'red' }}>*</span>
                </p>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter Quantity"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrors((prev) => ({ ...prev, quantity: '' }));
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
                {errors.quantity && (
                  <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>UOM</p>
                <input
                  type="text"
                  placeholder="Enter UOM (e.g., Kg, Ltr, Pcs)"
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
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
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  Net Unit Cost <span style={{ color: 'red' }}>*</span>
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0 14px',
                    background: '#fff',
                    height: '50px',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#667085', marginRight: '5px' }}>₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., 2,500.50"
                    value={netUnitCost}
                    onChange={(e) => {
                      let input = e.target.value;
                      // Remove all non-digit and non-decimal point characters
                      let raw = input.replace(/[^\d.]/g, '');

                      // If empty, set empty string and return
                      if (raw === '') {
                        setNetUnitCost('');
                        setErrors((prev) => ({ ...prev, netUnitCost: '' }));
                        return;
                      }

                      // Ensure only one decimal point
                      const decimalCount = (raw.match(/\./g) || []).length;
                      if (decimalCount > 1) {
                        return; // Don't update if more than one decimal point
                      }

                      // Split into integer and decimal parts
                      const [intPart, decPart] = raw.split('.');

                      // Format the integer part with commas
                      const formattedInt = intPart
                        ? parseInt(intPart, 10).toLocaleString('en-IN')
                        : '';

                      // Combine with decimal part if it exists
                      let formatted =
                        decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;

                      // Remove any leading zeros
                      if (
                        formatted.startsWith('0') &&
                        formatted.length > 1 &&
                        formatted[1] !== '.'
                      ) {
                        formatted = formatted.replace(/^0+/, '');
                      }

                      setNetUnitCost(formatted);
                      setErrors((prev) => ({ ...prev, netUnitCost: '' }));
                    }}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      height: '100%',
                      padding: 0,
                      background: 'transparent',
                    }}
                  />
                </div>
                {errors.netUnitCost && (
                  <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                    {errors.netUnitCost}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Tax Fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  SGST Tax (%)
                </p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 9"
                  value={sgstTax}
                  onChange={(e) => setSgstTax(e.target.value)}
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
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  CGST Tax (%)
                </p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 9"
                  value={cgstTax}
                  onChange={(e) => setCgstTax(e.target.value)}
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
              </div>

              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                  IGST Tax (%)
                </p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 18"
                  value={igstTax}
                  onChange={(e) => setIgstTax(e.target.value)}
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
              </div>
            </div>

            {/* Amount Display (Calculated) */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                Amount (without taxes)
              </p>
              <div
                style={{
                  width: '100%',
                  height: '50px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '0 14px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                {calculateAmount()}
              </div>
            </div>

            {/* Description Field - Full Width */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                Description (Optional)
              </p>
              <textarea
                placeholder="Enter Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                rows={4}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              {/* {errors.description && (
                <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{errors.description}</p>
              )} */}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="fixed-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {/* Delete button - only show when editing */}
              {editingRecord && onDelete && (
                <Button
                  danger
                  onClick={() => onDelete(editingRecord)}
                  style={{
                    borderRadius: '8px',
                    padding: '6px 20px',
                    fontWeight: 500,
                    height: '40px',
                  }}
                >
                  Delete
                </Button>
              )}

              {/* Submit button */}
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
                  marginLeft: 'auto',
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

export default ScopeOfWorkDrawer;
