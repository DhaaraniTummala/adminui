// src/views/custom/Asset.jsx
import DocumentHandler from './DocumentHandler';
import ViewRegistry from '../../core/ViewRegistry';
import secureStorage from '../../utils/secureStorage';

class AssetCustomizations extends DocumentHandler {
  constructor() {
    // Get user info from secureStorage first
    const isAdmin = secureStorage.getItem('isAdmin') === 'true';
    const sectionTypeId = secureStorage.getItem('sectionTypeId');
    const locationTypeId = secureStorage.getItem('locationTypeId');

    // Prepare options object
    const options = {
      tableName: '10738',
      entityName: 'Asset',
      documentEntity: 'AssetDocument',
      documentUrl: '10817',
      title: 'Assets',
      // subTitle: 'Effortlessly Manage And Track Assets With Full Control Over Status, Usage, And Compliance.'
    };

    // Add default filters for non-admin users
    if (!isAdmin && sectionTypeId != 'null' && locationTypeId != 'null') {
      options.defaultFilterInfo = [
        {
          filterTerm: sectionTypeId,
          filterBy: 'SectionTypeId',
          filterType: 'MULTI',
        },
        {
          filterTerm: locationTypeId,
          filterBy: 'LocationTypeId',
          filterType: 'MULTI',
        },
      ];
    } else {
      options.defaultFilterInfo = [];
    }

    // Call parent constructor with all options
    super(options);

    // Store user info as instance properties
    this.isAdmin = isAdmin;
    this.sectionTypeId = sectionTypeId;
    this.locationTypeId = locationTypeId;

    // Bind methods
    this.customizeGridColumns = this.customizeGridColumns.bind(this);
    this.enhanceFormConfig = this.enhanceFormConfig.bind(this);

    // Add enhanceFormConfig to options so it gets passed to the form
    options.enhanceFormConfig = this.enhanceFormConfig;
  }

  /**
   * Reorders form fields to move new fields after AMC toggle
   * @param {Object} props - Form props including columns
   * @returns {Object} - Enhanced config with reordered columns
   */
  enhanceFormConfig(props) {
    let { columns } = props;
    if (!Array.isArray(columns)) return props;

    // Create a copy of columns
    let updatedColumns = [...columns];

    // Find the 4 new fields
    const purchaseDateField = updatedColumns.find((col) => col.dataIndex === 'PurchaseDate');
    const purchaseValueField = updatedColumns.find((col) => col.dataIndex === 'PurchaseValue');
    const depreciationField = updatedColumns.find((col) => col.dataIndex === 'Depreciation');
    const assetValueField = updatedColumns.find((col) => col.dataIndex === 'AssetValue');

    // If any of the fields exist, reorder them
    if (purchaseDateField || purchaseValueField || depreciationField || assetValueField) {
      // Remove the 4 fields from their current positions
      updatedColumns = updatedColumns.filter(
        (col) =>
          col.dataIndex !== 'PurchaseDate' &&
          col.dataIndex !== 'PurchaseValue' &&
          col.dataIndex !== 'Depreciation' &&
          col.dataIndex !== 'AssetValue',
      );

      // Change AssetValue to textarea
      if (assetValueField) {
        assetValueField.type = 'textarea';
        assetValueField.rowSpan = 2;
      }

      // Find AMC toggle
      const amcIndex = updatedColumns.findIndex((col) => col.dataIndex === 'IsAmc');

      if (amcIndex !== -1) {
        // Insert the 4 fields after AMC
        const fieldsToInsert = [
          purchaseDateField,
          purchaseValueField,
          depreciationField,
          assetValueField,
        ].filter(Boolean);

        updatedColumns.splice(amcIndex + 1, 0, ...fieldsToInsert);
      } else {
        if (purchaseDateField) updatedColumns.push(purchaseDateField);
        if (purchaseValueField) updatedColumns.push(purchaseValueField);
        if (depreciationField) updatedColumns.push(depreciationField);
        if (assetValueField) updatedColumns.push(assetValueField);
      }
    }

    return { ...props, columns: updatedColumns };
  }

  /**
   * Customizes the grid columns for the Asset screen
   * @param {Array} columns - The original grid columns
   * @returns {Array} - The modified grid columns
   */
  customizeGridColumns(columns) {
    if (!Array.isArray(columns)) return columns;

    // Create a copy of the columns array
    let updatedColumns = [...columns];

    // For non-admin users, hide SectionTypeId and LocationTypeId columns
    /*if (!this.isAdmin) {
      const columnsToHide = ['SectionTypeId', 'LocationTypeId'];
      updatedColumns = updatedColumns.filter(column => !columnsToHide.includes(column.dataIndex));
    }*/

    // Set Asset Id column width (applies to all users)
    const assetIdColumn = updatedColumns.find((col) => col.dataIndex === 'EquipmentId');
    if (assetIdColumn) {
      assetIdColumn.width = 100;
      assetIdColumn.minWidth = 100;
      assetIdColumn.maxWidth = 100;
      assetIdColumn.flex = 0;
    }

    // Find and pin EquipmentId to the left
    const assetLabelIndex = updatedColumns.findIndex((col) => col.dataIndex === 'EquipmentId');

    if (assetLabelIndex !== -1) {
      const assetLabelColumn = updatedColumns.splice(assetLabelIndex, 1)[0];
      assetLabelColumn.pinned = 'left';
      assetLabelColumn.lockPinned = true;
      assetLabelColumn.width = assetLabelColumn.width || 120;
      updatedColumns.unshift(assetLabelColumn);
    }

    // Find and pin AssetStatusTypeId to the right
    const statusIndex = updatedColumns.findIndex((col) => col.dataIndex === 'AssetStatusTypeId');

    if (statusIndex !== -1) {
      const statusColumn = updatedColumns.splice(statusIndex, 1)[0];
      statusColumn.pinned = 'right';
      statusColumn.lockPinned = true;
      statusColumn.width = statusColumn.width || 120;
      updatedColumns.push(statusColumn);
    }

    // Remove Action column if it exists
    return updatedColumns.filter((col) => col.dataIndex !== 'Action');
  }
}

const assetCustomizations = new AssetCustomizations();

// Register with ViewRegistry for reliable access
ViewRegistry.registerEntityCustomizations('10738', assetCustomizations);
export default assetCustomizations;
