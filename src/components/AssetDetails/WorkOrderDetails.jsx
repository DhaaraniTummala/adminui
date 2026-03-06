import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Button, IconButton } from '@mui/material';
import { Edit as EditIcon, ArrowBack, Close } from '@mui/icons-material';
import { Dropdown, Button as AntButton, Modal } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import UIHelper from '../BaseView/UIHelper';
import API from '../../store/requests';
import { entityConfigs } from '../../configs/entityConfigs';
import GenericSection from '../common/GenericSection';
import { createGenericSection } from '../../utils/sectionUtils';
import SuccessModal from '../common/SuccessModal';
import PlainChildTable from '../common/PlainChildTable';
import workOrderCustomization from '../../views/custom/WorkOrder';
import { generateConfig } from '../EnhancedDynamicBaseView';
import BaseView from '../BaseView/BaseView';
import viewManager from '../../core/ViewManager';
import SimpleForm from '../BaseView/simple-form';
import CustomDrawer from '../common/CustomDrawer';
import secureStorage from '../../utils/secureStorage';
import ScopeOfWorkDrawer from '../../views/custom/ScopeOfWorkDrawer';

const WorkOrderDetails = ({ recordId: workOrderId }) => {
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scopeItemDrawerOpen, setScopeItemDrawerOpen] = useState(false);
  const [editingScopeItem, setEditingScopeItem] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentWorkOrderData, setCurrentWorkOrderData] = useState(selectedRow);
  const [formRef, setFormRef] = useState(null);
  const [scopeGridPanel, setScopeGridPanel] = useState(null);
  const [financialGridPanel, setFinancialGridPanel] = useState(null);
  const [scopeReloadToken, setScopeReloadToken] = useState(0);
  const [financialReloadToken, setFinancialReloadToken] = useState(0);
  const [scopeDrawerReloadToken, setScopeDrawerReloadToken] = useState(0);
  const [financialDrawerReloadToken, setFinancialDrawerReloadToken] = useState(0);
  const [scopeEditDrawerOpen, setScopeEditDrawerOpen] = useState(false);
  const [financialEditDrawerOpen, setFinancialEditDrawerOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [scopeSuccessModalOpen, setScopeSuccessModalOpen] = useState(false);
  const [scopeSuccessMessage, setScopeSuccessMessage] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [financialTotal, setFinancialTotal] = useState(0);
  const [scopeData, setScopeData] = useState([]);

  const [loading, setLoading] = useState(true);

  // Work Order configId for details form
  const workOrderConfig = entityConfigs.workOrder;
  const workOrderConfigId = workOrderConfig.configId;

  const isAdmin = secureStorage.getItem('isAdmin') === 'true';

  // Memoize the edit form configuration to prevent unnecessary re-renders
  const editFormConfig = useMemo(() => {
    const baseConfig = generateConfig(workOrderConfigId);
    const baseViewInstance = new BaseView({});
    const config = baseViewInstance.constructConfig(baseConfig, viewManager);
    const enhancedConfig = workOrderCustomization.enhanceFormConfig(config);
    const filteredConfig = {
      ...enhancedConfig,
      formFields: enhancedConfig.formFields,
    };
    filteredConfig.columns = filteredConfig.formFields;
    console.log('Filtered Config for Edit Form:', filteredConfig);
    return filteredConfig;
  }, [workOrderConfigId]);

  // Parse scope data from WorkOrderScopeJson (from LoadView)
  const parseScopeData = (workOrderData) => {
    try {
      if (workOrderData?.WorkOrderScopeJson) {
        let scopeData = [];
        if (typeof workOrderData.WorkOrderScopeJson === 'string') {
          scopeData = JSON.parse(workOrderData.WorkOrderScopeJson);
        } else if (Array.isArray(workOrderData.WorkOrderScopeJson)) {
          scopeData = workOrderData.WorkOrderScopeJson;
        }
        setScopeData(scopeData);
      } else {
        setScopeData([]);
      }
    } catch (error) {
      console.error('Error parsing WorkOrderScopeJson:', error);
      setScopeData([]);
    }
  };

  // Load API Call using workOrderId
  const loadWorkOrderData = () => {
    if (workOrderId) {
      const payload = { Guid: workOrderId, action: 'LoadView' };
      API.triggerPost(workOrderConfigId, payload)
        .then((response) => {
          console.log('API Response:', response);
          if (response?.data) {
            console.log('Work Order data loaded:', response.data);
            setSelectedRow(response.data);
            setCurrentWorkOrderData(response.data);
            // Parse scope data from WorkOrderScopeJson
            parseScopeData(response.data);
          } else {
            console.error('Failed to load work order - no data in response:', response);
          }
        })
        .catch((error) => {
          console.error('Error loading work order:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('No workOrderId provided');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkOrderData();
  }, [workOrderId]);

  // Recalculate financial total when grid reloads or data changes
  useEffect(() => {
    const calculateTotal = () => {
      // Try multiple ways to get the data
      let data = null;

      if (financialGridPanel?.props?.data) {
        data = financialGridPanel.props.data;
      } else if (financialGridPanel?.state?.data) {
        data = financialGridPanel.state.data;
      } else if (financialGridPanel?.gridApi) {
        // Try to get data from AG Grid API
        const rowData = [];
        financialGridPanel.gridApi.forEachNode((node) => rowData.push(node.data));
        if (rowData.length > 0) data = rowData;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const total = data.reduce((sum, item) => sum + (parseFloat(item.TotalPrice) || 0), 0);
        console.log('useEffect - Calculated financial total:', total, 'from data:', data);
        setFinancialTotal(total);
        return true;
      }
      return false;
    };

    // Try immediately
    if (!calculateTotal()) {
      // If not available, try again after delays with more attempts
      const timer1 = setTimeout(calculateTotal, 100);
      const timer2 = setTimeout(calculateTotal, 300);
      const timer3 = setTimeout(calculateTotal, 500);
      const timer4 = setTimeout(calculateTotal, 1000);
      const timer5 = setTimeout(calculateTotal, 1500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [financialReloadToken, financialGridPanel, selectedRow]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditDetails = () => {
    console.log('Current work order data for editing:', currentWorkOrderData);
    console.log('Available keys:', Object.keys(currentWorkOrderData || {}));
    // Set the refresh callback for WorkOrder form success modal
    window.workOrderRefreshCallback = () => {
      loadWorkOrderData();
    };
    setEditModalOpen(true);
  };

  const handlePrint = () => {
    // Get the content to print
    const printContent = document.querySelector('.MuiCard-root').innerHTML;

    // Format date and time
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const currentDate = `${day}-${month}-${year}`;
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const workOrderLabel = String(selectedRow?.WorkOrderLabelId || '').padStart(4, '0');

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page {
              size: A4;
              margin-top: 18mm;
              margin-bottom: 15mm;
              margin-left: 12mm;
              margin-right: 12mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
            }
            
            /* Header table that repeats on every page */
            .print-header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            
            .print-header-table thead {
              display: table-header-group; /* This makes it repeat on every page */
            }
            
            .print-header-table thead td {
              border: none;
              border-bottom: 1px solid #ddd;
              padding: 10px 0;
              font-size: 11px;
              vertical-align: middle;
            }
            
            .print-header-left {
              font-weight: 600;
              text-align: left;
              width: 33.33%;
            }
            
            .print-header-center {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              width: 33.33%;
            }
            
            .print-header-right {
              text-align: right;
              width: 33.33%;
            }
            
            /* Add spacing below header */
            .print-header-table tbody td {
              padding-top: 25px;
            }
            
            .print-content {
              margin-top: 0;
              padding-top: 0;
            }
            
            /* Work Order Details heading - force left alignment */
            .print-content > div:first-child {
              text-align: left !important;
            }
            
            .print-content h1:first-of-type,
            .print-content h2:first-of-type,
            .print-content h3:first-of-type,
            .print-content h4:first-of-type,
            .print-content h5:first-of-type,
            .print-content h6:first-of-type,
            .print-content .MuiTypography-h6:first-of-type {
              text-align: left !important;
            }
            
            /* All section headings - LEFT aligned */
            h1, h2, h3, h4, h5, h6,
            .MuiTypography-h6,
            .MuiTypography-root {
              font-size: 14pt;
              font-weight: 600;
              margin: 20px 0 10px 0;
              color: black;
              page-break-after: avoid;
              text-align: left !important;
            }
            
         
            p {
              font-size: 10pt;
              margin: 3px 0;
              color: black;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0 20px 0;
              page-break-inside: auto;
              table-layout: fixed;
            }
            
            thead {
              display: table-header-group;
            }
            
            th {
              border: 1px solid black;
              padding: 6px 4px;
              font-size: 9pt;
              font-weight: bold;
              text-align: center;
              background: #f5f5f5;
              word-wrap: break-word;
            }
            
            td {
              border: 1px solid black;
              padding: 6px 4px;
              font-size: 9pt;
              text-align: left;
              word-wrap: break-word;
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            /* Optimize column widths for Scope of Work table */
            table th:nth-child(1),
            table td:nth-child(1) { width: 7%; text-align: center; } /* S.no */
            table th:nth-child(2),
            table td:nth-child(2) { width: 10%; } /* Item order */
            table th:nth-child(3),
            table td:nth-child(3) { width: 14%; } /* Description */
            table th:nth-child(4),
            table td:nth-child(4) { width: 14%; } /* Delivery date */
            table th:nth-child(5),
            table td:nth-child(5) { width: 10%; text-align: center; } /* Quantity */
            table th:nth-child(6),
            table td:nth-child(6) { width: 10%; text-align: center; } /* UOM */
            table th:nth-child(7),
            table td:nth-child(7) { width: 10%; text-align: right; } /* Net unit cost */
            table th:nth-child(8),
            table td:nth-child(8) { width: 8%; text-align: center; } /* sgst % */
            table th:nth-child(9),
            table td:nth-child(9) { width: 8%; text-align: center; } /* cgst % */
            table th:nth-child(10),
            table td:nth-child(10) { width: 8%; text-align: center; } /* igst % */
            table th:nth-child(11),
            table td:nth-child(11) { width: 12%; text-align: right; } /* Amount */
          </style>
        </head>
        <body>
          <table class="print-header-table">
            <thead>
              <tr>
                <td class="print-header-left">${workOrderLabel}</td>
                <td class="print-header-center">Plantiqx</td>
                <td class="print-header-right">${currentDate}; ${currentTime}</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="3" style="padding: 0; border: none;">
                  <div class="print-content">
                    ${printContent}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for content to load, then print
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      // Remove iframe after printing and refresh page
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.location.reload(); // Refresh page after print dialog closes
      }, 100);
    }, 250);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    // Hard refresh parent and child grids on drawer close
    loadWorkOrderData();
    try {
      scopeGridPanel && scopeGridPanel.loadData({ currentPage: 1, limit: 50 });
      financialGridPanel && financialGridPanel.loadData({ currentPage: 1, limit: 50 });
    } catch (e) {}
  };

  const handleScopeEditClick = () => {
    setScopeEditDrawerOpen(true);
  };

  const handleFinancialEditClick = () => {
    setFinancialEditDrawerOpen(true);
  };

  const handleScopeEditDrawerClose = (shouldRefresh = false) => {
    setScopeEditDrawerOpen(false);
    // Only refresh if data was actually saved
    if (shouldRefresh) {
      // First reload the parent WorkOrder data (LoadView)
      loadWorkOrderData();
      // Then refresh the grid to show updated child data
      setTimeout(() => {
        setScopeReloadToken((v) => v + 1);
      }, 300);
    }
  };

  const handleFinancialEditDrawerClose = (shouldRefresh = false) => {
    setFinancialEditDrawerOpen(false);
    // Only refresh if data was actually saved
    if (shouldRefresh) {
      // First reload the parent WorkOrder data (LoadView)
      loadWorkOrderData();
      // Then refresh the grid to show updated child data
      setTimeout(() => {
        setFinancialReloadToken((v) => v + 1);
      }, 300);
    }
  };

  const handleApproveAndClose = () => {
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
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>
              Close Work Order
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Are you sure , you want to close ?
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
      onOk: async () => {
        if (!selectedRow?.WorkOrderId) {
          console.error('Work Order ID not found');
          return;
        }

        try {
          setSubmitting(true);

          const payload = {
            WorkOrderId: selectedRow.WorkOrderId,
            IsClosed: true,
            action: 'update',
          };

          const response = await API.triggerMultiPartPost(workOrderConfigId, payload);
          const ok = response?.success === true || response?.data?.success === true;

          if (!ok) {
            console.error('Failed to close work order:', response);
            setSubmitting(false);
            return;
          }

          // Show success modal
          setSuccessModalOpen(true);
          setSubmitting(false);
        } catch (error) {
          console.error('Error closing work order:', error);
          setSubmitting(false);
        }
      },
    });
  };

  // Render work order details using createGenericSection
  const renderWorkOrderDetails = (columnsPerRow = 4) => {
    return createGenericSection({
      title: 'Work Order Details',
      fields: workOrderConfig.fields.filter((field) => {
        // Check if field has conditional logic
        if (field.conditional && selectedRow) {
          return field.conditional(selectedRow);
        }
        return true; // Show field if no conditional logic
      }),
      rowData: selectedRow,
      columnCount: columnsPerRow,
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
    });
  };

  if (loading) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography>Loading work order details...</Typography>
      </Box>
    );
  }

  if (!selectedRow) {
    return (
      <Box p={3}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography>No data found for this Work Order.</Typography>
      </Box>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          /* Hide buttons and navigation */
          button,
          .MuiButton-root,
          .no-print,
          nav,
          aside,
          .ant-drawer,
          .ant-modal,
          svg {
            display: none !important;
          }

          /* Show only main content */
          body * {
            visibility: hidden;
          }

          .MuiCard-root,
          .MuiCard-root *,
          .MuiCardContent-root,
          .MuiCardContent-root * {
            visibility: visible;
          }

          /* Reset backgrounds */
          html, body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          * {
            background: white !important;
            background-color: white !important;
            color: black !important;
          }

          /* Position content */
          .MuiCard-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .MuiCardContent-root {
            padding: 0 !important;
          }

          /* Add "Work Order Details" heading before first section */
          .MuiCardContent-root > .MuiBox-root:first-child:before {
            content: "Work Order Details";
            display: block;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 15px;
            color: black;
            text-align: left;
          }

          /* Typography */
          h1, h2, h3, h4, h5, h6,
          .MuiTypography-h6 {
            font-size: 14pt !important;
            font-weight: bold !important;
            margin: 20px 0 10px 0 !important;
            color: black !important;
            page-break-after: avoid;
            visibility: visible !important;
            display: block !important;
          }

          p {
            font-size: 10pt !important;
            margin: 3px 0 !important;
            color: black !important;
          }

          /* Tables - ensure full width */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 10px 0 20px 0 !important;
            page-break-inside: auto;
            table-layout: fixed !important;
          }

          thead {
            display: table-header-group;
          }

          th {
            border: 1px solid black !important;
            padding: 8px 4px !important;
            font-size: 9pt !important;
            font-weight: bold !important;
            text-align: center !important;
            background: white !important;
            word-wrap: break-word !important;
          }

          td {
            border: 1px solid black !important;
            padding: 8px 4px !important;
            font-size: 9pt !important;
            text-align: left !important;
            background: white !important;
            word-wrap: break-word !important;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          /* Ensure all sections are visible */
          .MuiBox-root {
            visibility: visible !important;
            display: block !important;
          }

          /* Work Order Details grid */
          .MuiCardContent-root > .MuiBox-root:first-child {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 20px !important;
            border: 1px solid black !important;
            padding: 10px !important;
          }

          /* Remove status badge styling */
          span {
            border-radius: 0 !important;
            padding: 2px 5px !important;
            border: 1px solid black !important;
          }

          /* Ensure Financial Details section is visible */
          .MuiBox-root:has(> .MuiBox-root > .MuiTypography-h6) {
            page-break-before: auto;
            margin-top: 20px !important;
          }
        }
      `}</style>
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', p: 2 }}>
        {/* Header with Back button, Title, and Action buttons */}
        <Box
          className="no-print"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                color: '#6366f1',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.04)' },
                minWidth: 'auto',
                p: 1,
              }}
            ></Button>
            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: '#111827',
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span
                  style={{
                    color: '#18181A',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {String(selectedRow.WorkOrderLabelId).padStart(4, '0')}
                  {selectedRow?.IsClosed !== undefined && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '23px',
                        padding: '0 20px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        lineHeight: '20px',
                        color: selectedRow.IsClosed ? '#B42318' : '#027A48',
                        backgroundColor: selectedRow.IsClosed ? '#FEF3F2' : '#ECFDF3',
                        fontFamily: 'Poppins, sans-serif',
                        textTransform: 'capitalize',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: selectedRow.IsClosed ? '#F04438' : '#12B76A',
                        }}
                      ></span>
                      {selectedRow.IsClosed ? 'Closed' : 'Open'}
                    </span>
                  )}
                </span>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Print button - always visible */}
            <Button
              onClick={handlePrint}
              variant="contained"
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#344054',
                border: '1px solid #D0D5DD',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #D0D5DD',
                  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                padding: '10px 18px',
                gap: '8px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5V4.16667C5 3.70643 5.3731 3.33333 5.83333 3.33333H14.1667C14.6269 3.33333 15 3.70643 15 4.16667V7.5M5 14.1667H4.16667C3.70643 14.1667 3.33333 13.7936 3.33333 13.3333V9.16667C3.33333 8.70643 3.70643 8.33333 4.16667 8.33333H15.8333C16.2936 8.33333 16.6667 8.70643 16.6667 9.16667V13.3333C16.6667 13.7936 16.2936 14.1667 15.8333 14.1667H15M5.83333 11.6667H14.1667V16.6667H5.83333V11.6667Z"
                  stroke="#344054"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Print
            </Button>
            {/* Only show Approve & Close button if work order is not closed */}
            {!selectedRow?.IsClosed && isAdmin && (
              <Button
                onClick={handleApproveAndClose}
                disabled={submitting}
                variant="contained"
                sx={{
                  backgroundColor: '#039855',
                  '&:hover': { backgroundColor: '#039855' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 24px',
                  gap: '10px',
                  color: '#FFFFFF',
                }}
              >
                {submitting ? 'Processing...' : 'Approve & Close'}
              </Button>
            )}
            {!selectedRow?.IsClosed && isAdmin && (
              <Button
                onClick={handleEditDetails}
                variant="contained"
                sx={{
                  backgroundColor: '#6941C6',
                  '&:hover': { backgroundColor: '#6941C6' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 24px',
                  gap: '10px',
                }}
              >
                <img src="edit-icon.svg" alt="" style={{ width: '20px', height: '20px' }} />
                Edit Details
              </Button>
            )}
          </Box>
        </Box>

        <Card
          elevation={0}
          sx={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>{renderWorkOrderDetails()}</Box>

            {/* Scope Of Work Order */}
            <Box sx={{ mb: 10 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: '18px', color: '#1F2937' }}
                >
                  Scope Of Work Order
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'auto' }}>
                {(() => {
                  // Use scopeData from state (loaded from table 10819)
                  if (!scopeData || scopeData.length === 0) {
                    return (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No scope items found
                      </div>
                    );
                  }

                  return (
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            S.no
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Item order
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Description
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Delivery date
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Quantity
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            UOM
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Net unit cost
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            sgst %
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            cgst %
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            igst %
                          </th>
                          <th
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textAlign: 'left',
                            }}
                          >
                            Amount (without taxes)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(scopeData) &&
                          scopeData.map((item, index) => {
                            // Format date to DD-MM-YYYY
                            let formattedDate = item.DeliveryDate || '';
                            if (formattedDate) {
                              const date = new Date(formattedDate);
                              if (!isNaN(date.getTime())) {
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                formattedDate = `${day}-${month}-${year}`;
                              }
                            }

                            return (
                              <tr key={index}>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {index + 1}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.ItemOrder}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.ItemDescription || item.Description}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {formattedDate}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Quantity}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.UOM || ''}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Cost || item.NetUnitCost
                                    ? parseFloat(
                                        String(item.Cost || item.NetUnitCost).replace(/,/g, ''),
                                      ).toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : ''}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Sgst || item.SGSTTax
                                    ? parseFloat(String(item.Sgst || item.SGSTTax)).toFixed(2)
                                    : ''}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Cgst || item.CGSTTax
                                    ? parseFloat(String(item.Cgst || item.CGSTTax)).toFixed(2)
                                    : ''}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Igst || item.IGSTTax
                                    ? parseFloat(String(item.Igst || item.IGSTTax)).toFixed(2)
                                    : ''}
                                </td>
                                <td
                                  style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.Amount
                                    ? parseFloat(
                                        String(item.Amount).replace(/,/g, ''),
                                      ).toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : ''}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  );
                })()}
              </Box>
            </Box>

            {/* Financial Details */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: '18px', color: '#1F2937' }}
                >
                  Financial Details
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <table
                  style={{
                    width: '100%',
                    border: '1px solid rgb(229, 231, 235)',
                    borderCollapse: 'collapse',
                    backgroundColor: '#fff',
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: '1px solid rgb(229, 231, 235)',
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
                          border: '1px solid rgb(229, 231, 235)',
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
                          border: '1px solid rgb(229, 231, 235)',
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
                          border: '1px solid rgb(229, 231, 235)',
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
                    {(() => {
                      // Calculate Basic Amount from scope data (sum of all amounts)
                      const basicAmount = scopeData.reduce((sum, item) => {
                        return sum + (parseFloat(item.Amount) || 0);
                      }, 0);

                      // Calculate taxes total from scope data
                      const taxesTotal = scopeData.reduce((sum, item) => {
                        const qty = parseFloat(item.Quantity) || 0;
                        const netCost = parseFloat(item.Cost || item.NetUnitCost) || 0;
                        const sgst = parseFloat(item.Sgst || item.SGSTTax) || 0;
                        const cgst = parseFloat(item.Cgst || item.CGSTTax) || 0;
                        const igst = parseFloat(item.Igst || item.IGSTTax) || 0;
                        const taxAmount = (qty * netCost * (sgst + cgst + igst)) / 100;
                        return sum + taxAmount;
                      }, 0);

                      // Get freight from selectedRow (parent WorkOrder record)
                      const freight = parseFloat(selectedRow?.Frieght) || 0;

                      // Calculate grand total
                      const grandTotal = basicAmount + freight + taxesTotal;

                      return (
                        <tr>
                          <td
                            style={{
                              border: '1px solid rgb(229, 231, 235)',
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
                              border: '1px solid rgb(229, 231, 235)',
                              padding: '12px 16px',
                              fontSize: '14px',
                              backgroundColor: '#fff',
                              textAlign: 'center',
                            }}
                          >
                            {freight.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            style={{
                              border: '1px solid rgb(229, 231, 235)',
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
                              border: '1px solid rgb(229, 231, 235)',
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
                      );
                    })()}
                  </tbody>
                </table>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Edit Drawer */}
        <CustomDrawer
          open={editModalOpen}
          onClose={handleEditModalClose}
          title="Edit Work Order Details"
          width="82%"
          containerStyle={{ padding: '20px' }}
        >
          <SimpleForm
            selectedRow={currentWorkOrderData}
            columns={editFormConfig.formFields}
            identifier={editFormConfig.identifier}
            apiIdentifier={editFormConfig.apiIdentifier}
            closable
            activeRecordId={currentWorkOrderData ? currentWorkOrderData.WorkOrderId : 'NEW_RECORD'}
            config={editFormConfig}
            enhanceFormConfig={editFormConfig.enhanceFormConfig}
            resetProps={() => {}}
            mode="edit"
            toggle={() => {
              setTimeout(() => {
                setEditModalOpen(false);
                // Reload work order data to refresh the details page
                loadWorkOrderData();
                try {
                  scopeGridPanel && scopeGridPanel.loadData({ currentPage: 1, limit: 50 });
                  financialGridPanel && financialGridPanel.loadData({ currentPage: 1, limit: 50 });
                } catch (e) {}
              }, 800); // Increased timeout to ensure modal closes first
            }}
            onReload={loadWorkOrderData}
          />
        </CustomDrawer>

        {/* Scope Edit Drawer - Shows table with New button and Action column */}
        <CustomDrawer
          open={scopeEditDrawerOpen}
          onClose={handleScopeEditDrawerClose}
          title="Edit Scope Of Work Order"
          containerStyle={{ padding: '0 32px' }}
        >
          <div style={{ marginTop: '50px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => {
                  setEditingScopeItem(null);
                  setScopeItemDrawerOpen(true);
                }}
                sx={{
                  backgroundColor: '#6941C6',
                  '&:hover': { backgroundColor: '#6941C6' },
                  textTransform: 'none',
                }}
              >
                New
              </Button>
            </div>

            {(() => {
              // Use scopeData from state (loaded from table 10819)
              if (!scopeData || scopeData.length === 0) {
                return (
                  <div
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#666',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  >
                    No scope items found. Click "New" to add items.
                  </div>
                );
              }

              return (
                <div
                  style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px' }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '60px',
                          }}
                        >
                          S.no
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '120px',
                          }}
                        >
                          Item order
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '200px',
                          }}
                        >
                          Description
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '130px',
                          }}
                        >
                          Delivery date
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '100px',
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '100px',
                          }}
                        >
                          UOM
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '130px',
                          }}
                        >
                          Net unit cost
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '80px',
                          }}
                        >
                          sgst
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '80px',
                          }}
                        >
                          cgst
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '80px',
                          }}
                        >
                          igst
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'left',
                            minWidth: '150px',
                          }}
                        >
                          Amount (without taxes)
                        </th>
                        <th
                          style={{
                            border: '1px solid #e5e7eb',
                            padding: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'center',
                            minWidth: '100px',
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(scopeData) &&
                        scopeData.map((item, index) => {
                          // Format date to DD-MM-YYYY
                          let formattedDate = item.DeliveryDate || '';
                          if (formattedDate) {
                            const date = new Date(formattedDate);
                            if (!isNaN(date.getTime())) {
                              const day = String(date.getDate()).padStart(2, '0');
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const year = date.getFullYear();
                              formattedDate = `${day}-${month}-${year}`;
                            }
                          }

                          return (
                            <tr key={index}>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {index + 1}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.ItemOrder}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.ItemDescription || item.Description}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {formattedDate}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Quantity}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.UOM || ''}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Cost || item.NetUnitCost}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Sgst || item.SGSTTax}%
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Cgst || item.CGSTTax}%
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Igst || item.IGSTTax}%
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                {item.Amount}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '12px',
                                  fontSize: '12px',
                                  textAlign: 'center',
                                }}
                              >
                                <Dropdown
                                  menu={{
                                    items: [
                                      {
                                        key: 'edit',
                                        label: 'Edit',
                                        onClick: () => {
                                          // Map database field names to form field names
                                          const mappedItem = {
                                            WorkOrderScopeId: item.WorkOrderScopeId,
                                            ItemOrder: item.ItemOrder,
                                            Description: item.ItemDescription || item.Description,
                                            DeliveryDate: item.DeliveryDate,
                                            Quantity: item.Quantity,
                                            NetUnitCost: item.Cost || item.NetUnitCost,
                                            SGSTTax: item.Sgst || item.SGSTTax,
                                            CGSTTax: item.Cgst || item.CGSTTax,
                                            IGSTTax: item.Igst || item.IGSTTax,
                                            Amount: item.Amount,
                                            index,
                                          };
                                          setEditingScopeItem(mappedItem);
                                          setScopeItemDrawerOpen(true);
                                        },
                                      },
                                      {
                                        key: 'delete',
                                        label: 'Delete',
                                        onClick: () => {
                                          setItemToDelete(item);
                                          setDeleteConfirmOpen(true);
                                        },
                                      },
                                    ],
                                  }}
                                  trigger={['click']}
                                >
                                  <AntButton
                                    type="text"
                                    icon={
                                      <MoreOutlined
                                        style={{
                                          fontSize: '20px',
                                          fontWeight: 'bold',
                                          color: '#374151',
                                        }}
                                      />
                                    }
                                    style={{ padding: '4px 8px', color: '#374151' }}
                                  />
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </CustomDrawer>

        {/* Financial Edit Drawer - Shows only table with Edit button */}
        <CustomDrawer
          open={financialEditDrawerOpen}
          onClose={handleFinancialEditDrawerClose}
          title="Edit Financial Details"
          containerStyle={{ padding: '0 32px' }}
        >
          {selectedRow.WorkOrderId && (
            <div
              key={`financial-drawer-${financialDrawerReloadToken}`}
              style={{ marginTop: '20px' }}
            >
              {UIHelper.createChildGrid('10820', 'WorkOrder', selectedRow, {
                hidePaging: true,
                pagination: false,
                readOnly: false,
                isReadOnly: false,
                hideToolbar: false,
                showActions: true,
                uniqueIdentifier: `10820-drawer-${financialDrawerReloadToken}`,
                // customizeGridColumns: (columns) => {
                //   if (!Array.isArray(columns)) return columns;
                //   return columns.filter(
                //     (col) =>
                //       col.dataIndex !== 'CreatedBy' &&
                //       col.dataIndex !== 'CreatedDate' &&
                //       col.dataIndex !== 'ModifiedBy' &&
                //       col.dataIndex !== 'ModifiedDate'
                //   );
                // },
                toggle: (shouldRefresh) => {
                  if (shouldRefresh) {
                    handleFinancialEditDrawerClose(true);
                  }
                },
              })}
            </div>
          )}
        </CustomDrawer>

        {/* Scope Item Add/Edit Drawer */}
        <ScopeOfWorkDrawer
          visible={scopeItemDrawerOpen}
          onClose={() => {
            setScopeItemDrawerOpen(false);
            setEditingScopeItem(null);
          }}
          onSave={async (data) => {
            try {
              // Map form field names to database column names
              const payload = {
                WorkOrderId: workOrderId,
                ItemOrder: data.ItemOrder,
                ItemDescription: data.Description,
                DeliveryDate: data.DeliveryDate,
                Quantity: data.Quantity,
                Cost: data.NetUnitCost,
                Sgst: data.SGSTTax,
                Cgst: data.CGSTTax,
                Igst: data.IGSTTax,
                Amount: data.Amount,
              };

              // Check if editing or adding
              if (editingScopeItem && editingScopeItem.WorkOrderScopeId) {
                // Edit existing item
                payload.WorkOrderScopeId = editingScopeItem.WorkOrderScopeId;
                payload.action = 'update';
              } else {
                // Add new item
                payload.action = 'insert';
              }

              console.log('Saving scope item with payload:', payload);
              await API.triggerMultiPartPost('10819', payload);

              // Close drawer first
              setScopeItemDrawerOpen(false);
              setEditingScopeItem(null);

              // Show success modal
              setScopeSuccessMessage(
                editingScopeItem && editingScopeItem.WorkOrderScopeId
                  ? 'Scope item updated successfully!'
                  : 'Scope item added successfully!',
              );
              setScopeSuccessModalOpen(true);
            } catch (error) {
              console.error('Error saving scope item:', error);
              alert('Failed to save scope item. Please try again.');
            }
          }}
          editingRecord={editingScopeItem}
        />

        {/* Delete Confirmation Modal */}
        <SuccessModal
          open={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
          }}
          title="Are you sure you want to delete this item?"
          iconType="warning"
          showCancelButton={true}
          confirmButtonText="Yes, Delete"
          onConfirm={async () => {
            try {
              // Delete from table 10819
              const payload = {
                WorkOrderScopeId: itemToDelete.WorkOrderScopeId,
                action: 'delete',
              };
              console.log('Deleting scope item with payload:', payload);
              const response = await API.triggerPost('10819', payload);
              console.log('Delete response:', response);

              // Close delete modal
              setDeleteConfirmOpen(false);
              setItemToDelete(null);

              // Show success modal
              setScopeSuccessMessage('Scope item deleted successfully!');
              setScopeSuccessModalOpen(true);
            } catch (error) {
              console.error('Error deleting scope item:', error);
              console.error('Error details:', error.response || error.message);
              alert('Failed to delete scope item. Please try again.');
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }
          }}
        />

        {/* Scope Success Modal */}
        <SuccessModal
          open={scopeSuccessModalOpen}
          onClose={() => {
            setScopeSuccessModalOpen(false);
            // Reload scope data after modal closes
            loadScopeData();
          }}
          title={scopeSuccessMessage}
          iconType="success"
        />

        {/* Success Modal */}
        <SuccessModal
          open={successModalOpen}
          onClose={() => {
            setSuccessModalOpen(false);
            loadWorkOrderData(); // Reload to show updated status
          }}
          title="Work Order Closed Successfully!"
          message="The Work Order has been approved and marked as closed. The team has been notified."
          buttonText="Dismiss"
          iconType="success"
        />
      </Box>
    </>
  );
};

export default WorkOrderDetails;
