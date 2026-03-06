import Dates from '../core/utils/date';
import moment from 'moment';

export const assetFields = [
  {
    key: 'EquipmentId',
    title: 'Equipment ID',
    fullWidth: false,
  },
  { key: 'AssetName', title: 'Asset Name', fullWidth: false },
  { key: 'AssetCategory', title: 'Asset Category', fullWidth: false },
  { key: 'Asset', title: 'Asset Type', fullWidth: false },
  { key: 'Status', title: 'Status', format: (value) => value || 'Available', fullWidth: false },
  { key: 'Location', title: 'Location', fullWidth: false },
  { key: 'Section', title: 'Section', fullWidth: false },
  { key: 'ProductSerialNumber', title: 'Product Serial Number', fullWidth: false },
  { key: 'VendorDetails', title: 'Vendor Details', fullWidth: false },
  {
    key: 'CommissionDate',
    title: 'Commission Date',
    formatter: Dates.standardDate,
    fullWidth: false,
  },
  {
    key: 'WarrantyDate',
    title: 'Warranty Date',
    formatter: Dates.standardDate,
    fullWidth: false,
  },
  {
    key: 'IsAmc',
    title: 'AMC',
    formatter: (value) => (value ? 'Yes' : 'No'),
    fullWidth: false,
  },

  {
    key: 'AMCEndDate',
    title: 'AMC Due Date',
    formatter: Dates.standardDate,
    fullWidth: false,
    conditional: (rowData) =>
      rowData?.IsAmc === true || rowData?.IsAmc === 'Y' || rowData?.IsAmc === 'Yes',
  },

  {
    key: 'PurchaseDate',
    title: 'Purchase Date',
    formatter: Dates.standardDate,
    fullWidth: false,
    
  },
 
  {
    key: 'PurchaseValue',
    title: 'Purchase Value',
    fullWidth: true,
    format: (value) => value || 'No description available',
  },
 
 {
    key: 'Depreciation',
    title: 'Depreciation',
    fullWidth: true,
    format: (value) => value || 'No description available',
  },
 
 {
    key: 'AssetValue',
    title: 'Asset Value',
    fullWidth: true,
    format: (value) => value || 'No description available',
  },
  
  { key: 'CreatedByUserName', title: 'Created By', fullWidth: false },
  { key: 'ModifiedByUserName', title: 'Modified By', fullWidth: false },
  { key: 'CreatedDate', title: 'Created Date', formatter: Dates.DateTimeWithLocalTimeZone },
  {
    key: 'ModifiedDate',
    title: 'Modified Date',
    formatter: Dates.DateTimeWithLocalTimeZone,
  },
  {
    key: 'AssetDescription',
    title: 'Description',
    fullWidth: true,
    format: (value) => value || 'No description available',
  },
 

];
export const userFields = [
  {
    key: 'UserLabelId',
    title: 'User ID',
    fullWidth: false,
  },
  { key: 'Name', label: 'Name', fullWidth: false },
  { key: 'Email', label: 'Email Address', fullWidth: false },
  { key: 'Phone', label: 'Phone Number', fullWidth: false },
  { key: 'Designation', label: 'Designation', fullWidth: false },
  // {
  //   key: 'DateofBirth',
  //   label: 'Date of Birth',
  //   format: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
  //   fullWidth: false,
  // },
  {
    key: 'JoiningDate',
    label: 'Joining Date',
    formatter: Dates.standardDate,
    fullWidth: false,
  },
  // {
  //   key: 'Blocked',
  //   label: 'Blocked',
  //   format: (value) => (value ? 'Yes' : 'No'),
  //   fullWidth: false,
  // },
  // {
  //   key: 'IsArchived',
  //   label: 'Archived',
  //   format: (value) => (value ? 'Yes' : 'No'),
  //   fullWidth: false,
  // },
  // {
  //   key: 'IsInvite',
  //   label: 'Is Invite',
  //   format: (value) => (value ? 'Yes' : 'No'),
  //   fullWidth: false,
  // },
  // { key: 'DeviceId', label: 'Device ID', fullWidth: false },
  { key: 'Section', label: 'Section Type ID', fullWidth: false },
  { key: 'Location', label: 'Location Type ID', fullWidth: false },
  {
    key: 'IsAdmin',
    title: 'Is Admin',
    label: 'Is Admin',
    formatter: (value) => (value ? 'Yes' : 'No'),
    fullWidth: false,
  },
  { key: 'CreatedDate', title: 'Created Date', formatter: Dates.DateTimeWithLocalTimeZone },
  {
    key: 'ModifiedDate',
    title: 'Modified Date',
    formatter: Dates.DateTimeWithLocalTimeZone,
  },
];

export const workOrderFields = [
  {
    key: 'WorkOrderLabelId',
    title: 'Work Order ID',
    format: (value) => `WO-${String(value).padStart(4, '0')}`,
    fullWidth: false,
  },
  {
    key: 'AssetCompliantLabelId',
    title: 'Compliant ID',
    formatter: (value, row) => {
      // If value exists at root, return it
      if (value) return value;

      // Parse AssetCompliantJson if it's a string
      let compliantJson = row?.AssetCompliantJson;
      if (typeof compliantJson === 'string') {
        try {
          compliantJson = JSON.parse(compliantJson);
        } catch (e) {
          return '';
        }
      }

      // Extract from AssetCompliantJson (could be object or array)
      if (compliantJson) {
        const data = Array.isArray(compliantJson) ? compliantJson[0] : compliantJson;
        if (data && data.AssetCompliantLabelId) {
          return data.AssetCompliantLabelId;
        }
      }
      return '';
    },
    fullWidth: false,
  },
  {
    key: 'EquipmentId',
    title: 'Equipment ID',
    formatter: (value, row) => {
      // If value exists at root, return it
      if (value) return value;

      // Parse AssetCompliantJson if it's a string
      let compliantJson = row?.AssetCompliantJson;
      if (typeof compliantJson === 'string') {
        try {
          compliantJson = JSON.parse(compliantJson);
        } catch (e) {
          return '';
        }
      }

      // Extract from AssetCompliantJson.AssetJson array
      if (compliantJson) {
        const data = Array.isArray(compliantJson) ? compliantJson[0] : compliantJson;
        if (data && data.AssetJson && Array.isArray(data.AssetJson) && data.AssetJson[0]) {
          return data.AssetJson[0].EquipmentId || '';
        }
      }
      return '';
    },
    fullWidth: false,
  },
  { key: 'Vendor', title: 'Vendor', fullWidth: false },
  { key: 'PreparedBy', title: 'Prepared By', fullWidth: false },
  {
    key: 'WODate',
    title: 'Work Order Date',
    formatter: Dates.standardDate,
    fullWidth: false,
    disabledDate: (current) => {
      // Disable all dates before today
      return current && current < moment().startOf('day');
    },
  },
  { key: 'IECCode', title: 'IEC Code', fullWidth: false },
  { key: 'InsurancePolicyNo', title: 'Insurance Policy No', fullWidth: false },
  { key: 'BillingAddress', title: 'Billing Address', fullWidth: true },
  { key: 'ShippingAddress', title: 'Shipping Address', fullWidth: true },
  { key: 'CINno', title: 'CIN No', fullWidth: true },
  {
    key: 'InsurancePolicyDate',
    title: 'Insurance Policy Date',
    formatter: Dates.standardDate,
    fullWidth: true,
  },
  { key: 'CreatedDate', title: 'Created Date', formatter: Dates.DateTimeWithLocalTimeZone },
  { key: 'ModifiedDate', title: 'Modified Date', formatter: Dates.DateTimeWithLocalTimeZone },
];

// export const workOrderFinancialFields = [
//   { key: 'WorkOrderFinancialId', title: 'Financial ID', fullWidth: false },
//   { key: 'WorkOrderId', title: 'Work Order ID', fullWidth: false },
//   { key: 'Quantity', title: 'Quantity', fullWidth: false },
//   { key: 'UnitPrice', title: 'Unit Price', fullWidth: false },
//   { key: 'Freight', title: 'Freight', fullWidth: false },
//   { key: 'Discount', title: 'Discount', fullWidth: false },
//   { key: 'Tax', title: 'Tax', fullWidth: false },
//   { key: 'TotalPrice', title: 'Total Price', fullWidth: false },
//   { key: 'CreatedBy', title: 'Created By', fullWidth: false },
//   { key: 'ModifiedBy', title: 'Modified By', fullWidth: false },
//   {
//     key: 'CreatedDate',
//     title: 'Created Date',
//     format: (value) => {
//       if (!value) return 'N/A';
//       const date = new Date(value);
//       const day = date.getDate();
//       const month = date.toLocaleString('default', { month: 'short' });
//       const year = date.getFullYear();
//       const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//       return `${day}/${month}/${year} ${time}`;
//     },
//     fullWidth: false,
//   },
//   {
//     key: 'ModifiedDate',
//     title: 'Modified Date',
//     format: (value) => {
//       if (!value) return 'N/A';
//       const date = new Date(value);
//       const day = date.getDate();
//       const month = date.toLocaleString('default', { month: 'short' });
//       const year = date.getFullYear();
//       const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//       return `${day}/${month}/${year} ${time}`;
//     },
//     fullWidth: false,
//   },
// ];

// export const workOrderScopeFields = [
//   { key: 'WorkOrderScopeId', title: 'Scope ID', fullWidth: false },
//   { key: 'WorkOrderId', title: 'Work Order ID', fullWidth: false },
//   { key: 'ItemNo', title: 'Item No', fullWidth: false },
//   { key: 'ItemDescription', title: 'Item Description', fullWidth: false },
//   { key: 'JobDrawingNumber', title: 'Job Drawing Number', fullWidth: false },
//   {
//     key: 'RequiredDate',
//     title: 'Required Date',
//     format: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
//     fullWidth: false,
//   },
//   { key: 'InStock', title: 'In Stock', fullWidth: false },
//   { key: 'RequiredQty', title: 'Required Qty', fullWidth: false },
//   { key: 'UOMName', title: 'UOM Name', fullWidth: false },
//   { key: 'YetToReceive', title: 'Yet To Receive', fullWidth: false },
//   { key: 'YetToOrder', title: 'Yet To Order', fullWidth: false },
//   { key: 'IssueQty', title: 'Issue Qty', fullWidth: false },
//   { key: 'IssueReference', title: 'Issue Reference', fullWidth: false },
//   { key: 'CreatedBy', title: 'Created By', fullWidth: false },
//   { key: 'ModifiedBy', title: 'Modified By', fullWidth: false },
//   {
//     key: 'CreatedDate',
//     title: 'Created Date',
//     format: (value) => {
//       if (!value) return 'N/A';
//       const date = new Date(value);
//       const day = date.getDate();
//       const month = date.toLocaleString('default', { month: 'short' });
//       const year = date.getFullYear();
//       const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//       return `${day}/${month}/${year} ${time}`;
//     },
//     fullWidth: false,
//   },
//   {
//     key: 'ModifiedDate',
//     title: 'Modified Date',
//     format: (value) => {
//       if (!value) return 'N/A';
//       const date = new Date(value);
//       const day = date.getDate();
//       const month = date.toLocaleString('default', { month: 'short' });
//       const year = date.getFullYear();
//       const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//       return `${day}/${month}/${year} ${time}`;
//     },
//     fullWidth: false,
//   },
// ];

export const complaintFields = [
  // Add complaint fields configuration here when needed
];

export const assetComplaintDetailsFields = [
  {
    key: 'EquipmentId',
    title: 'Equipment ID',
    dataIndex: 'AssetId',
  },
  {
    key: 'AssetDescription',
    title: 'Equipment Description',
  },
  {
    key: 'AssetCompliantLabelId',
    title: 'Complaint ID',
    dataIndex: 'CompliantId',
  },
  {
    key: 'CompliantDescription',
    title: 'Complaint Description',
  },
];

export const vehicleTrackingFields = [
  {
    key: 'VehicleNo',
    title: 'Vehicle Number',
    fullWidth: false,
  },
  {
    key: 'VehicleType',
    title: 'Vehicle Type',
    fullWidth: false,
  },
  {
    key: 'DriverName',
    title: 'Driver Name',
    fullWidth: false,
  },
  {
    key: 'MobileNumber',
    title: 'Mobile Number',
    fullWidth: false,
  },
  {
    key: 'VisitPurpose',
    title: 'Purpose of Visit',
    fullWidth: false,
  },
  {
    key: 'VisitPurposeName',
    title: 'Purpose of Visit Name',
    fullWidth: false,
  },
  {
    key: 'PassangerCount',
    title: 'No of Passengers',
    fullWidth: false,
  },

  {
    key: 'InDateTime',
    title: 'In Date & Time',
    formatter: Dates.standardDateTime,
    fullWidth: false,
  },

  {
    key: 'OutDateTime',
    title: 'Out Date & Time',
    formatter: Dates.standardDateTime,
    fullWidth: false,
  },

  {
    key: 'CreatedByUserName',
    title: 'Created By',
    fullWidth: false,
  },

  {
    key: 'CreatedDate',
    title: 'Created Date',
    formatter: Dates.DateTimeWithLocalTimeZone,
    fullWidth: false,
  },
  // {
  //   key: 'Remarks',
  //   title: 'Remarks',
  //   fullWidth: true,
  // },
];

export const visitorTrackingFields = [
  {
    key: 'FullName',
    title: 'Full Name',
    fullWidth: false,
  },

  {
    key: 'EmailId',
    title: 'Email ID',
    fullWidth: false,
  },

  {
    key: 'MobileNo',
    title: 'Mobile Number',
    fullWidth: false,
  },

  // { key: 'TagNo', title: 'Tag No', fullWidth: false },

  { key: 'VisitArea', title: 'Visit Area', fullWidth: false },

  { key: 'VisitPurpose', title: 'Visit Purpose', fullWidth: false },
  { key: 'VisitPurposeName', title: 'Visit Purpose Name', fullWidth: false },
  { key: 'VisitorCompany', title: 'Visitor Company', fullWidth: false },
  { key: 'VisitorType', title: 'Visitor Type', fullWidth: false },

  {
    key: 'InDateTime',
    title: 'In Date & Time',
    formatter: Dates.standardDateTime,
    fullWidth: false,
  },

  {
    key: 'OutDateTime',
    title: 'Out Date & Time',
    formatter: Dates.standardDateTime,
    fullWidth: false,
  },

  {
    key: 'CreatedByUserName',
    title: 'Created By',
    fullWidth: false,
  },

  {
    key: 'CreatedDate',
    title: 'Created Date',
    formatter: Dates.DateTimeWithLocalTimeZone,
    fullWidth: false,
  },

  // {
  //   key: 'Remarks',
  //   title: 'Remarks',
  //   fullWidth: true,
  // },
];

export const entityConfigs = {
  asset: {
    fields: assetFields,
    configId: '10738',
    historyConfigId: '10758',
    title: 'Asset Details',
    withdrawalOptions: {
      reasons: ['damaged', 'obsolete', 'sold', 'donation', 'transfer', 'return'],
      methods: ['disposal', 'sale', 'donation', 'transfer', 'return'],
      conditions: ['Poor', 'Good', 'Repairable'],
    },
  },
  user: {
    fields: userFields,
    configId: '10689',
    historyConfigId: '10689',
    title: 'User Details',
  },
  workOrder: {
    fields: workOrderFields,
    configId: '10818',
    historyConfigId: '10818',
    title: 'Work Order Details',
  },
  vehicleTracking: {
    fields: vehicleTrackingFields,
    configId: '10825',
    title: 'Vehicle Tracking Details',
  },

  visitorTracking: {
    fields: visitorTrackingFields,
    configId: '10826',
    title: 'Visitor Tracking Details',
  },
  complaint: {
    // Add complaint configuration here when needed
  },
};

export default entityConfigs;
