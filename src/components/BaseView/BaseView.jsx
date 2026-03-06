import { PureComponent } from 'react';
import RowDetailView from '../RowDetailView';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import viewManager from '../../core/ViewManager';
import { ReduxHelper } from '../../core/redux-helper';
import { Select, Menu, Modal, Input, Tooltip, Drawer } from 'antd';
import SimpleForm from './simple-form';
//import DialogForm from "./DialogForm";
import AgGrid from '../ag-grid';
import NavPills from '../Tabs';
import Button from '@mui/material/Button';
import API from '../../store/requests';
import { EnableLogs } from '../../app-config';
import Snackbar from '../../components/Snackbar/Snackbar.jsx';
import AddIcon from '@mui/icons-material/AddCircleSharp';
import CardView from '../CardsLayout';
import { CONFIG, newConfig } from '../../store/config';
import Accordion from '../Accordion';
import { withTranslation } from 'react-i18next';
import { triggerAPI, defaultLoader } from '../../core/utils';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

import ToolbarManagerComponent from './ToolbarManagerComponent.jsx';
import '../../index.css';
import GenericViewModal from '@/common/GenericViewModal';
import ComplaintViewMode from '../ComplaintViewMode';
import BreakDownViewMode from '../BreakDownViewMode';
import SuccessModal from '../common/SuccessModal';
import CustomDrawer from '../common/CustomDrawer';
import secureStorage from '../../utils/secureStorage';

const { Option } = Select;
const modal = Modal;
const { confirm } = Modal;
const Actions = ReduxHelper.Actions;

const DialogForm = () => <div>Need to implement1</div>;

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const history = useNavigate();
    return <Component history={history} {...props} />;
  };
  return Wrapper;
};

const isTrue = (value) => {
  if (typeof value != 'undefined') {
    if (value && value == true) {
      return true;
    }
  }
  return false;
};

export default class BaseView extends PureComponent {
  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  handleHashChange = () => {
    this.setState({ urlHash: window.location.hash });
  };
  renderDetailViewIfNeeded() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const mode = params.get('mode');
    const assetId = params.get('Id');
    if (mode === 'viewDetail' && assetId) {
      return <RowDetailView assetId={assetId} />;
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      selectedRow: null,
      activeRecordId: null,
      gridPreferences: JSON.stringify({ filterInfo: [], sortInfo: [] }),
      error: '',
      startData: '',
      endDate: '',
      urlHash: window.location.hash,
    };

    // Initialize viewManager instance
    this.viewManager = viewManager;
  }

  isFunction = (func) => {
    return func && typeof func == 'function';
  };

  /**
   * Refresh grid data
   */
  refreshGrid = async () => {
    if (this.gridApi) {
      this.gridApi.refreshInfiniteCache();
    }
    // Trigger data reload
    if (this.props.config.apiIdentifier) {
      await this.generateAction(this.props.config.apiIdentifier).list();
    }
  };

  /**
   * Show notification to user
   */
  showNotification = (message, type = 'info') => {
    // This would integrate with your notification system
    console.log(`Notification [${type}]: ${message}`);
    // You can integrate with antd notification, toast, or your existing system
  };

  /**
   * Get current user permissions
   */
  getUserPermissions = () => {
    // This would integrate with your permission system
    // For now, return empty array - implement based on your auth system
    return [];
  };

  /**
   * Check if current entity has custom toolbar
   */
  hasCustomToolbar = () => {
    const tableName = this.props.config?.tableName || this.props.config?.entity?.tableName;
    return this.viewManager.hasCustomToolbar(tableName);
  };

  /**
   * Get available buttons for current entity
   */
  getAvailableButtons = () => {
    const tableName = this.props.config?.tableName || this.props.config?.entity?.tableName;
    return this.viewManager.getAvailableButtons(tableName);
  };

  /**
   * Get toolbar layout configuration
   */
  getToolbarLayout = () => {
    const tableName = this.props.config?.tableName || this.props.config?.entity?.tableName;
    return this.viewManager.getToolbarLayout(tableName);
  };

  /**
   * Handle row double click to navigate to detail screen
   */
  handleRowDoubleClick = (node) => {
    if (node?.data) {
      const currentPath = window.location.hash.split('?')[0];
      const pathSegments = currentPath.split('/').filter(Boolean);
      const entityName = pathSegments[pathSegments.length - 1];

      const idProperty = `${entityName}Id`;
      const recordId = node.data[idProperty] || node.data.Id || node.data.id;

      if (recordId) {
        window.location.hash = `${currentPath}?mode=viewDetail&Id=${recordId}`;
      }
    }
  };

  /**
   * Handle actions from custom entity components (like ProjectTask.jsx)
   * This method delegates to the entity's handleAction method if available,
   * otherwise falls back to the base executeAction method
   */
  handleAction = async (actionKey, params = {}) => {
    const tableName = this.props.config?.tableName || this.props.config?.entity?.tableName;
    const customizations = this.viewManager.entityCustomizations.get(tableName);

    // If the entity has a custom handleAction method, use it
    if (
      customizations &&
      customizations.helperMethods &&
      customizations.helperMethods.handleAction
    ) {
      try {
        return await customizations.helperMethods.handleAction(actionKey, params, this);
      } catch (error) {
        console.error(`BaseView.handleAction: Error in custom handler for ${actionKey}:`, error);
        throw error;
      }
    }

    // No generic action fallback anymore (ActionManager removed). Common toolbar
    // actions are handled by ToolbarManagerComponent via explicit props.
    console.warn(`BaseView.handleAction: No handler for '${actionKey}'.`);
    return null;
  };

  /**
   * Get current user ID (implement based on your auth system)
   */
  getCurrentUserId = () => {
    // This should be implemented based on your authentication system
    return secureStorage.getItem('userId') || 'unknown';
  };

  generateAction = (identifier) => {
    let generatedAction = {},
      configActions = [];
    for (const item of CONFIG) {
      if (item.key == identifier) configActions = item.actions;
    }

    for (const item of newConfig) {
      if (item.key == identifier) {
        configActions = item.actions;
      }
    }

    configActions.map((item) => {
      let lowerCase = item.charAt(0).toLowerCase() + item.slice(1),
        upperCase = item.charAt(0).toUpperCase() + item.slice(1),
        upperCaseKey = identifier.charAt(0).toUpperCase() + identifier.slice(1);
      generatedAction[lowerCase] = (payload) =>
        Actions[lowerCase + upperCaseKey]({
          identifier,
          action: item,
          ...payload,
        });
      generatedAction['reset' + upperCase] = (payload) =>
        Actions['reset' + upperCase + upperCaseKey]({
          identifier,
          action: item,
          ...payload,
        });
      generatedAction['set' + upperCase] = (payload) =>
        Actions['set' + upperCase + upperCaseKey]({
          identifier,
          action: item,
          ...payload,
        });
    });
    return generatedAction;
  };

  constructChildWithParentConfig = (parentTab) => {
    return parentTab.childs().map((child) => {
      var customViewMode = false;
      var childIsEditable = false;
      if (typeof child.showCustomContent == 'boolean') {
        customViewMode = child.showCustomContent;
      }
      if (typeof child.isEditable == 'boolean') {
        childIsEditable = child.isEditable;
      }

      var formColumns = this.constructFormFields(child.getFormColumns(), child.onChange);
      var gridColumns = this.constructGridColumns(
        child,
        child.getGridColumns(),
        childIsEditable,
        formColumns.length,
        child.filters,
        child.sort,
        child.isReadOnly || false,
      );

      child.comboTypes = child.comboTypes || [];
      return {
        mapper: child.mapper,
        comboTypes: [
          ...child.comboTypes,
          {
            type: 'User',
            ValueField: 'Name',
            IDField: 'UserId',
          },
        ],
        autoRefresh: false,
        isChild: true,
        readOnlyGrid: child.readOnlyGrid,
        listAPI: child.listAPI,
        gridColumns: gridColumns,
        formFields: formColumns,
        key: child.key, //item.ad_window_id,
        tabId: child.key, //tabId,
        title: child.title, //item.title || item.windowname || item.name,
        type: 'grid',
        identifier: child.key, //identifier,
        idColumn: child.idColumn,
        hidePaging: child.hidePaging,
        extraParams: child.extraParams || {},
        onGridPanelReady: child.onGridPanelReady || (() => {}),
        tabTitle: child.tabTitle,
        gridHeight: child.gridHeight,
        pagination: child.pagination,
        onRowDoubleClicked: child.onRowDoubleClicked,
        pageSize: child.pageSize,
        hideTitle: child.hideTitle,
        childView: child.childView || parentTab.childView,
        uniqueIdentifier: child.uniqueIdentifier,
        GridPanelWrapper: child.GridPanelWrapper,
        saveAndNextButton: child.saveAndNextButton,
        parentIdColumn: parentTab.idColumn,
        isEditable: childIsEditable,
        showCustomContent: customViewMode,
        // To Do: 2nd level child
        childs: child.childs,
      };
    });
  };

  /**
   * Constructs the configuration object for the view
   * @param {Object} entity - The base configuration object
   * @param {Object} [viewManager] - Optional view manager for hooks and overrides
   * @param {boolean|Object} [customView] - Custom view configuration or boolean flag
   * @returns {Object} The constructed configuration object
   */
  constructConfig(entity, viewManager, customView) {
    // Apply view manager hooks if available
    let context = {};
    if (viewManager?.executeHooks) {
      context =
        viewManager.executeHooks('beforeConstruct', entity.key, {
          props: this.props,
          entity,
          tableName: entity.key,
        }) || {};
    }

    // Apply any additional config from hooks
    if (context.config) {
      entity = { ...entity, ...context.config };
    }

    const childs = this.constructChildWithParentConfig(entity);
    let showCustomContent = false;
    let isEditable = false;

    if (typeof customView === 'boolean') {
      showCustomContent = customView;
    }

    if (typeof entity.isEditable === 'boolean') {
      isEditable = entity.isEditable;
    }

    var formColumns = this.constructFormFields(entity.getFormColumns(), entity.onChange);
    var gridColumns = this.constructGridColumns(
      entity,
      entity.getGridColumns(),
      isEditable,
      formColumns.length,
      entity.filters,
      entity.sort,
      entity.isReadOnly || false,
    );

    let extraConfigs = {};
    if (this.isFunction(this.gridFooter)) {
      extraConfigs = { ...extraConfigs, gridFooter: this.gridFooter };
    }
    if (this.isFunction(this.customContent)) {
      extraConfigs = { ...extraConfigs, customContent: this.customContent };
    }
    if (this.isFunction(this.loadData)) {
      extraConfigs = { ...extraConfigs, loadData: this.loadData };
    }
    if (this.isFunction(this.onRowSelection)) {
      extraConfigs = { ...extraConfigs, onRowSelection: this.onRowSelection };
    }
    var autoRefresh = true;
    if (typeof entity.autoRefresh == 'boolean') {
      autoRefresh = entity.autoRefresh;
    }

    // Get customizations from ViewManager
    const customizations = viewManager?.loadCustomizationsSync(entity.key) || {};
    entity.overides = entity.overides || {};
    entity.comboTypes = entity.comboTypes || [];
    return {
      // Spread all properties from entity/config first to preserve custom props like isChild, selectedRowParent, etc.
      ...entity,
      mapper: entity.mapper,
      autoRefresh: autoRefresh,
      comboTypes: [
        ...entity.comboTypes,
        {
          type: secureStorage.getItem('userTable') || 'User',
          ValueField: 'Name',
          IDField: 'UserId',
        },
      ],
      readOnlyGrid: entity.readOnlyGrid,
      listAPI: entity.listAPI,
      loadAPI: entity.loadAPI,
      gridColumns: gridColumns,
      formFields: formColumns,
      key: entity.key, //item.ad_window_id,
      tabId: entity.key, //tabId,
      title: entity.title, //item.title || item.windowname || item.name,
      type: 'grid',
      identifier: entity.key,
      apiIdentifier: entity.key.toLowerCase(),
      idColumn: entity.idColumn,
      child: this.constructChilds(childs, entity.key),
      childView: entity.childView,
      hidePaging: entity.hidePaging,
      gridPreferences: entity.gridPreferences || {
        sortInfo: [{ sort: entity.idColumn, dir: entity.idColumnSorting || 'desc' }],
        filterInfo: [],
      },
      extraParams: entity.extraParams || {},
      onGridPanelReady: entity.onGridPanelReady || (() => {}),
      gridHeight: entity.gridHeight,
      pagination: entity.pagination,
      onRowDoubleClicked: entity.onRowDoubleClicked || this.handleRowDoubleClick,
      pageSize: entity.pageSize,
      uniqueIdentifier: entity.uniqueIdentifier,
      GridPanelWrapper: entity.GridPanelWrapper,
      saveAndNextButton: entity.saveAndNextButton,
      saveButtonText: entity.saveButtonText,
      customButtonsInForm: entity.customButtonsInForm,
      actions: this.generateAction(entity.key),
      isEditable,
      getCardView: entity.getCardView,
      showCustomContent,
      formTitle: entity.formTitle,
      tabTitle: entity.tabTitle,
      ...extraConfigs,
      ...entity.overides,
      ...customizations,
    };
  }

  constructChild = (child, parentIdentifier) => {
    var childs = this.constructChildWithParentConfig(child);
    parentIdentifier = parentIdentifier || '';
    var identifier = parentIdentifier + '_' + child.tabId;
    return {
      ...child,
      key: child.tabId,
      type: 'grid', //change the gridonly in type to see only grid
      value: child.tabId,
      buttons: [],
      parentIdentifier,
      apiIdentifier: child.tabId.toLowerCase(),
      identifier,
      child: this.constructChilds(childs, identifier),
      actions: this.generateAction(identifier),
      // To Do: 2nd level child
      //child: this.parseItem(tab)
    };
  };

  constructFormFields = (items, onChange) => {
    var fields = items
      .filter((item) => item.header)
      .filter((item) => !item.hidden)
      .map(({ header, ...rest }) => {
        var returnObject = {
          title: header,
          type: rest.type || 'string',
          ...rest,
        };
        if (onChange && onChange[rest.dataIndex]) {
          returnObject.onChange = onChange[rest.dataIndex];
        }
        if (rest.type == 'int') {
          if (typeof rest.allowNegatives == 'boolean') {
            returnObject.allowNegatives = rest.allowNegatives;
          } else {
            returnObject.allowNegatives = true;
          }
        }
        return returnObject;
      });
    var formFields = [...fields];
    return formFields;
  };

  constructGridColumns = (
    entity,
    items,
    isEditable,
    formItemCount,
    entityFilters,
    entitySort,
    isReadOnly,
  ) => {
    // Get table name for customizations
    const tableName = entity?.tableName || entity?.key;
    const customizations = this.viewManager?.entityCustomizations?.get(tableName);

    // Process base columns
    let fields = items
      .filter((item) => item.header)
      .filter((item) => !item.hidden)
      .map(({ header, dataIndex, isEditable: isEditableCol, filters, sort, ...rest }) => ({
        dataIndex,
        title: header,
        editable: isEditableCol || isEditable || false,
        nofiltertype: (entityFilters || filters) === 'none',
        notsortabletype: entitySort === 'none' || sort === 'none',
        cellClass: this.getCellClass(rest.type, header),
        ...rest,
      }));

    // Add Action column only if explicitly requested via showActions config
    // This allows specific grids to opt-in to showing Action column
    if (!isReadOnly && entity.showActions === true) {
      fields.push({
        dataIndex: 'Action',
        title: 'Action',
        width: 80,
        type: 'operation',
        editable: false,
        nofiltertype: true,
        notsortabletype: true,
        pinned: 'right',
        suppressSizeToFit: true,
        maxWidth: 400,
        minWidth: 80,
      });
    }

    // Apply custom column transformations if available from viewManager
    if (customizations?.customizeGridColumns) {
      try {
        fields = customizations.customizeGridColumns(fields) || fields;
      } catch (error) {
        console.error(`Error applying custom column transformations for ${tableName}:`, error);
      }
    }
    // Also apply customizeGridColumns from entity config (e.g., passed via extraConfig)
    else if (entity.customizeGridColumns) {
      try {
        fields = entity.customizeGridColumns(fields) || fields;
      } catch (error) {
        console.error(`Error applying custom column transformations for ${tableName}:`, error);
      }
    } else {
      // Default column handling if no customizations
      const idColumn = fields.find((col) => col.dataIndex === (entity.idColumn || 'Id'));
      if (idColumn) {
        idColumn.sortingOrder = ['desc', 'asc'];
      }
    }

    // Final safeguard: enforce Work Order list column order if applicable
    try {
      const t = (tableName || '').toString().toLowerCase();
      if (['10818', 'workorder', 'work order', 'workorder', 'work order'].includes(t)) {
        const norm = (v) => (v || '').toString().toLowerCase().replace(/\s+/g, '');
        const is = (c, names) => names.some((n) => norm(c.dataIndex) === n || norm(c.title) === n);
        const weight = (c, idx) => {
          if (is(c, ['assetid', 'asset'])) return 0;
          if (is(c, ['compliantid', 'complaintid', 'assetcompliantid', 'assetcompliantlabelid']))
            return 1;
          if (is(c, ['workorderid', 'workorder'])) return 2;
          return 100 + idx;
        };
        fields = fields
          .map((c, idx) => ({ c, w: weight(c, idx) }))
          .sort((a, b) => a.w - b.w)
          .map(({ c }) => c);

        const assetCol = fields.find((c) => is(c, ['assetid', 'asset']));
        if (assetCol) {
          assetCol.pinned = 'left';
          assetCol.lockPosition = true;
        }
      }
    } catch (e) {
      // ignore
    }

    return fields;
  };

  /**
   * Get CSS class for cell based on column type
   * @private
   */
  getCellClass = (type, header) => {
    if (type === 'number') {
      return header?.toLowerCase() === 'id' ? 'left-number-cell' : 'number-cell';
    }
    return type === 'float' ? 'float-cell' : null;
  };

  constructChilds = (tabs, identifier) => {
    var childs = [];
    for (var tab of tabs) {
      childs.push(this.constructChild(tab, identifier));
    }
    return childs;
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  handleMenuClick = (selectedRow, e) => {
    if (Number(e.key) == 1) {
      this.setState({
        selectedRow,
        operationType: Number(e.key),
        modal1Visible: true,
        activeRecordId: 1,
      });
    } else if (Number(e.key) == 2) {
      this.setState({
        selectedRow,
        operationType: Number(e.key),
        modal2Visible: true,
        recordIdToDelete: selectedRow.assetId,
      });
    } else if (Number(e.key) == 3) {
      this.setState({
        selectedRow: null,
        operationType: Number(e.key),
        modal1Visible: true,
        activeRecordId: null,
      });
    }
  };

  render() {
    // If in detail mode, render detail view as full screen
    const detailView = this.renderDetailViewIfNeeded();
    if (detailView) return detailView;

    let className = '';
    if (this.config.childView == 'flex' && !this.config.parentIdentifier) {
      className = 'grid-view-flex';
    }

    return (
      <div className={className}>
        <GridContainer
          config={this.config}
          parentRecordId={-1}
          onRowDoubleClicked={this.handleRowDoubleClick}
        />
      </div>
    );
  }
}

// Helper function to get drawer width based on entity type
const getDrawerWidth = (config) => {
  // Check if this is WorkOrder entity (table 10818) or by identifier
  const isWorkOrder = config?.tableName === '10818';

  // Return same width for WorkOrder and Asset, normal width for others
  const isAsset = config?.tableName === '10738';

  // Check for Vehicle Tracking (table 10825)
  const isVehicleTracking = config?.tableName === '10825';

  // Check for Visitor Tracking (table 10826)
  const isVisitorTracking = config?.tableName === '10826';

  if (isWorkOrder) return '82%';
  if (isAsset) return '82%';
  if (isVehicleTracking) return '95%';
  if (isVisitorTracking) return '95%';
  return 650;
};

const ModalForm = ({
  visible,
  toggle,
  selectedRow,
  selectedRowParent,
  columns,
  identifier,
  apiIdentifier,
  activeRecordId,
  mode,
  config,
  resetProps,
  showDialogForm,
  closeDialogForm,
  data,
  combos,
  selectRow,
  formChilds,
}) => {
  // Check if this is WorkOrder for special styling
  const isWorkOrder =
    config?.tableName === '10818' ||
    config?.identifier === 'WorkOrder' ||
    config?.entityName === 'WorkOrder' ||
    (config?.displayName && config.displayName.toLowerCase().includes('work order'));
  const isAsset =
    config?.tableName === '10738' ||
    config?.identifier === 'Asset' ||
    config?.entityName === 'Asset';

  // Determine drawer title based on entity and mode
  let drawerTitle;
  if (isAsset) {
    drawerTitle = activeRecordId === 'NEW_RECORD' ? 'Add Assets' : 'Edit Asset Details';
  } else if (isWorkOrder) {
    drawerTitle = activeRecordId === 'NEW_RECORD' ? 'Add Work Order' : 'Edit Work Order';
  } else {
    // Check for specific child table sections
    const displayName = config?.displayName || config?.title || '';
    const entityName = config?.entityName || '';

    // Helper function to check section type
    const getSectionType = () => {
      const text = `${displayName} ${entityName}`.toLowerCase();
      if (text.includes('scope')) return 'Scope of Work Order';
      if (text.includes('financial') || text.includes('finance')) return 'Financial Detail';

      // Use displayName or entityName if available, otherwise default to 'Record'
      if (displayName) return displayName;
      if (entityName) return entityName;
      return 'Record';
    };

    // Set title based on mode and section
    const action = activeRecordId === 'NEW_RECORD' ? 'Add' : 'Edit';
    const sectionType = getSectionType();
    drawerTitle = `${action} ${sectionType}`;
  }
  if (showDialogForm) {
    return (
      <DialogForm
        open={showDialogForm}
        onclose={closeDialogForm}
        data={data}
        combos={combos}
        selectRow={selectRow}
      />
    );
  } else {
    const CustomFormComponent = config.customFormComponent;
    return (
      <>
        <style>{`
          .custom-drawer-header .ant-drawer-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .custom-drawer-header .ant-drawer-header .ant-drawer-title {
            order: 1 !important;
            flex: 1 !important;
            text-align: left !important;
          }
          .custom-drawer-header .ant-drawer-header .ant-drawer-close {
            order: 2 !important;
            margin-left: auto !important;
            margin-right: 0 !important;
          }
          
          /* Basic drawer styling */
        `}</style>
        <CustomDrawer
          open={visible}
          onClose={() => {
            return toggle(false);
          }}
          width={getDrawerWidth(config)}
          title={drawerTitle}
          bodyStyle={{
            padding: '24px',
            backgroundColor: '#ffffff',
          }}
          containerStyle={{
            padding: 0,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {CustomFormComponent ? (
              <CustomFormComponent
                columns={columns}
                selectedRow={selectedRow}
                selectedRowParent={selectedRowParent}
                identifier={identifier}
                apiIdentifier={apiIdentifier}
                toggle={toggle}
                activeRecordId={activeRecordId}
                visible={visible}
                mode={mode}
                config={config}
                resetProps={resetProps}
                documentUploader={config.documentUploader || false}
                enhanceFormConfig={config.enhanceFormConfig}
              />
            ) : (
              <SimpleForm
                columns={columns}
                selectedRow={selectedRow}
                selectedRowParent={selectedRowParent}
                identifier={identifier}
                apiIdentifier={apiIdentifier}
                toggle={toggle}
                activeRecordId={activeRecordId}
                visible={visible}
                mode={mode}
                config={config}
                resetProps={resetProps}
                documentUploader={config.documentUploader || false}
                enhanceFormConfig={config.enhanceFormConfig}
              />
            )}
          </div>
        </CustomDrawer>
      </>
    );
  }
};

const PreferenceMenu = ({ allPreferences, onPreferenceSelect, visible, toggle }) => {
  const { t } = this.props;
  var preferences = [];
  if (allPreferences) {
    for (var item of allPreferences) {
      preferences.push(
        <Menu.Item onClick={onPreferenceSelect.bind(null, item.preference)}>
          <a target="_blank" rel="noopener noreferrer">
            {item.key}
          </a>
        </Menu.Item>,
      );
    }
  }

  return (
    <div>
      <Menu>
        {preferences}
        <hr />
        <Menu.Item>
          <a target="_blank" rel="noopener noreferrer" onClick={toggle}>
            {t('Add Preference')}
          </a>
        </Menu.Item>
        <Modal
          visible={visible}
          title={t('Preference')}
          footer={[
            <Tooltip title={t('Cancel')}>
              <Button key="back" onClick={toggle}>
                {t('Cancel')}
              </Button>
            </Tooltip>,
            <Tooltip title={t('Submit')}>
              <Button key="submit" type="primary" onClick={toggle}>
                {t('Submit')}
              </Button>
            </Tooltip>,
          ]}
        >
          <p>
            {t('Name')}:
            <Input placeholder="" />
          </p>
          <p>
            {t('Description')}:
            <Input placeholder="" />
          </p>
        </Modal>
      </Menu>
    </div>
  );
};
const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer">
        PDF
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer">
        EXCEL
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer">
        JSON
      </a>
    </Menu.Item>
  </Menu>
);

class GridFooter extends PureComponent {
  render() {
    return <>{/*Custom Paging Bar*/}</>;
  }
}

class GridPanel extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedRow: null,
      selectedRowParent: null,
      tabId: this.props.config.tabId,
      activeRecordId: 'NEW_RECORD',
      visible: false,
      isRefresh: false,
      mode: '',
      showDialogForm: false,
      isMineSelected: true,
      isPendingSelected: true,
      showDeleteModal: false,
      deleteIndex: null,
      deleteRowName: '',
      showDeleteSuccessModal: false,
    };
    const {
      config: { identifier, gridPreferences, onGridPanelReady },
      dispatch,
    } = props;
    if (gridPreferences && identifier) {
      /*dispatch(
        Actions['gridpreference' + identifier]({
          localGridPreferences: true,
          gridPreferences,
          action: 'gridpreference',
          identifier,
        }),
      );*/
    }
    onGridPanelReady({ gridPanel: this });
  }

  componentDidMount() {
    // Ensure initial data is loaded when using a custom GridComponent
    const { config } = this.props;
    if (!config?.showCustomContent && config?.GridComponent) {
      const limit = config.pageSize || 50;
      try {
        this.loadData({ filterInfo: [], sortInfo: [], currentPage: 1, limit });
      } catch (e) {
        // no-op
      }
    }
  }
  componentWillUnmount() {
    const {
      config: { identifier, actions },
      dispatch,
    } = this.props;
    dispatch(actions.resetList());
    var preference = { ...this.props.config.gridPreferences };
    if (this.props.config.showCustomContent === false && this.gridColumnApi) {
      preference[(this.props.config.uniqueIdentifier || identifier) + 'columns'] =
        this.gridColumnApi.getColumnState();
    }
    dispatch(actions.setGridpreference(preference));
  }

  createRow = () => {
    const {
      config: { loadAPI, identifier, apiIdentifier, comboTypes, isLoadFetching },
      dispatch,
      combos,
      selectedRowParent,
    } = this.props;

    if (loadAPI) {
      var options = {
        action: 'load',
        identifier,
        apiIdentifier,
        id: 0,
      };

      if (comboTypes) {
        var listCombos = [];
        for (var combo of comboTypes) {
          if (!combo.loaded && combos[combo.type]) {
            combo.loaded = true;
          }
          if (!combo.loaded) {
            //combo.loaded = true;
            listCombos.push(combo);
          }
        }
        options.comboTypes = JSON.stringify(listCombos);
      }
      dispatch(loadAPI({ ...options, ...this.props.config.extraParams }));
    }
    if (!isLoadFetching && isLoadFetching != this.props.isLoadFetching) {
      modal.destroyAll();
      setTimeout(() => {
        this.setState({
          selectedRowParent: { ...selectedRowParent },
          selectedRow: {},
          activeRecordId: 'NEW_RECORD',
          visible: true,
          mode: 'edit',
        });
      }, 1000);
    }
  };

  toogle = (toggleAction) => {
    if (this.state.visible) {
      if (this.props.config.comboTypes)
        for (var combo of this.props.config.comboTypes) combo.loaded = false;
      if (!toggleAction) {
        this.setState({
          visible: false,
          isRefresh: false,
          activeRecordId: null,
        });
      } else {
        this.setState({ visible: false, isRefresh: true, activeRecordId: null }, () => {
          this.state.isRefresh = false;
          // Call custom toggle callback if provided
          if (this.props.config.toggle && typeof this.props.config.toggle === 'function') {
            this.props.config.toggle(true);
          }
        });
      }
    } else {
      this.setState({ visible: true });
    }
  };

  applyDateRangeFilter = (value) => {
    let gridApi = this.gridApi;
    let fromDate, toDate;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    switch (value) {
      case 'today':
        fromDate = yesterday;
        toDate = today;
        break;
      case 'yesterday':
        fromDate = new Date(yesterday);
        fromDate.setDate(yesterday.getDate() - 1);
        toDate = new Date(yesterday);
        break;
      case 'last7days':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        toDate = new Date(today);
        break;
      case 'last30days':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        toDate = new Date(today);
        break;
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        break;
      case 'reset':
        // Reset filter
        gridApi.setFilterModel(null);
        gridApi.onFilterChanged();
        return;

      default:
        break;
    }

    if (gridApi) {
      let filterModel = {};

      if (value === 'today' || value === 'yesterday') {
        // For 'today', use dateEqual with the current date
        filterModel = {
          CreatedDate: {
            type: 'equals',
            dateEqual: moment(toDate)
          }
        };
      } else {
        // For other date ranges, use the existing date range logic
        filterModel = {
          CreatedDate: {
            type: 'inRange',
            dateFrom: moment(fromDate),
            dateTo: moment(toDate),
          },
        };
      }

      gridApi.setFilterModel(filterModel);
      // Small delay to ensure the filter is applied before refreshing
      setTimeout(() => {
        gridApi.onFilterChanged();
      }, 100);
    }
  };

  loadData = ({ filterInfo, sortInfo, currentPage, limit, filter }) => {
    /*if (!this.props.config.listAPI) {
      return;
    }*/
    if (this.props.config.loadData)
      this.props.config.loadData({
        filterInfo,
        sortInfo,
        currentPage,
        limit,
        filter,
        gridPanel: this,
      });
    else {
      let newFilterInfo = [];
      if (filterInfo) {
        for (var index in filterInfo) {
          if (!newFilterInfo) {
            newFilterInfo = [];
          }
          newFilterInfo.push({
            filterTerm: filterInfo[index].filterValue || filterInfo[index].filterTerm,
            filterBy: filterInfo[index].filterBy,
          });
        }
      }
      if (filter) {
        for (var item of filter) {
          if (!newFilterInfo) {
            newFilterInfo = [];
          }
          var filterType = 'EQUALS';
          if (item.data.type == 'string') {
            filterType = 'CONTAINS';
          } else if (item.data.type == 'boolean') {
            item.data.value = item.data.value ? 1 : 0;
          } else if (item.data.type == 'numeric') {
            if (item.data.comparison == 'gt') {
              filterType = 'GREATERTHANEQUAL';
            } else if (item.data.comparison == 'lt') {
              filterType = 'LESSERTHANEQUAL';
            } else if (item.data.comparison == 'eq') {
              filterType = 'EQUALS';
            }
          } else if (item.data.type == 'date') {
            if (item.data.comparison == 'gt' || item.data.comparison == 'gte') {
              filterType = 'DATEGREATERTHANEQUAL';
            } else if (item.data.comparison == 'lt' || item.data.comparison == 'lte') {
              filterType = 'DATELESSERTHANEQUAL';
            } else if (item.data.comparison == 'eq') {
              filterType = 'DATEEQUALS';
            }
          } else if (item.data.type == 'list') {
            filterType = 'MULTI';
          }
          newFilterInfo.push({
            filterTerm: item.data.value,
            filterBy: item.field,
            filterType,
          });
        }
      }

      if (this.props.config.defaultFilterInfo && this.props.config.defaultFilterInfo.length > 0)
        newFilterInfo = [...newFilterInfo, ...this.props.config.defaultFilterInfo];

      var options = {
        pageNo: currentPage,
        pageSize: limit,
        filterInfo: newFilterInfo,
        action: 'list',
        sortInfo: sortInfo && sortInfo.length === 0 ? null : sortInfo,
        identifier: this.props.config.identifier,
        apiIdentifier: this.props.config.apiIdentifier,
      };

      if (this.props.config.comboTypes) {
        var combos = [];
        for (var combo of this.props.config.comboTypes) {
          if (!combo.loaded) {
            //combo.loaded = true;
            combos.push(combo);
          }
        }
        options.comboTypes = combos;
      }

      if (this.props.config.isChild) {
        // Support both new (ParentEntity, ParentEntityField) and old (identifier, parentIdColumn) config
        options.PageNo = 0;
        options.PageSize = 50;
        // ParentEntity: prefer config.ParentEntity, fallback to identifier split
        let parentEntity = this.props.config.ParentEntity;
        if (
          !parentEntity &&
          this.props.config.identifier &&
          this.props.config.identifier.includes('_')
        ) {
          const parts = this.props.config.identifier.split('_');
          parentEntity = parts[parts.length - 2];
        }
        options.ParentEntity = parentEntity;
        // ParentEntityField: prefer config.ParentEntityField, fallback to parentIdColumn
        const parentField = this.props.config.ParentEntityField || this.props.config.parentIdColumn;
        options.ParentEntityField = parentField;
        // ParentId: prefer parentRecordId, fallback to selectedRowParent[parentField], fallback to selectedRowParent[parentIdColumn]
        options.ParentId =
          this.props.config.parentRecordId !== undefined
            ? this.props.config.parentRecordId
            : this.props.selectedRowParent &&
                parentField &&
                this.props.selectedRowParent[parentField] !== undefined
              ? this.props.selectedRowParent[parentField]
              : this.props.selectedRowParent && this.props.config.parentIdColumn
                ? this.props.selectedRowParent[this.props.config.parentIdColumn]
                : undefined;
      }

      this.props.dispatch(
        Actions['list' + options.identifier]({
          ...options,
          ...this.props.config.extraParams,
        }),
      );
    }
  };

  onRowChange = (selectedRowKeys, selectedRows) => {
    if (this.props.config.onRowSelection)
      this.props.config.onRowSelection({ selectedRows, gridPanel: this });
    if (selectedRows.length === 1)
      this.props.updateState({
        selectedRow: selectedRows[0],
        activeRecordId: selectedRows[0][this.props.config.idColumn],
        toogle: this.loadData,
      });
  };

  updatePreference = (existingPreferences) => {
    // TO DO - Need to move to NOTON Components
    var identifier = this.props.config.tabId;
    var type = identifier + '_GRIDPREFERENCE_REQUEST';

    this.props.dispatch({
      type: type,
      payload: existingPreferences,
      identifier: identifier,
      request: 'SET_PREFERENCE',
    });
  };

  loadFetchingModal = () => {
    const { t } = this.props;
    modal.destroyAll();
    modal.success({
      title: t('Please wait') + '..',
      okButtonProps: {
        style: { backgroundColor: '#24b5ee', border: 'none', display: 'none' },
      },
    });
  };

  deleteSuccess = () => {
    // Show the delete success modal
    this.setState({ showDeleteSuccessModal: true });
  };

  handleDeleteConfirm = () => {
    const { deleteIndex, deleteIdColumn } = this.state;
    this.confirmDelete(deleteIndex, deleteIdColumn);
    this.deleteSuccess();
    this.setState({ showDeleteModal: false });
  };

  handleDeleteCancel = () => {
    this.setState({ showDeleteModal: false });
  };

  handleDeleteSuccessClose = () => {
    this.setState({ showDeleteSuccessModal: false });
  };

  confirmDelete = (index, idColumn) => {
    const { t } = this.props;
    var row = this.props.data[index];
    var activeRecordId = row[idColumn];

    var payload = {
      action: 'delete',
      [idColumn]: activeRecordId,
      identifier: this.props.config.identifier,
    };

    // TO DO: Need to Show Modal Popup to ask for Delete
    API.triggerPost(this.props.config.apiIdentifier, payload)
      .then((response) => {
        var data = response.data;
        if (data.success) {
          this.setState({ isRefresh: true }, () => (this.state.isRefresh = false));
        } else {
          alert(t('Failed'));
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error));
      });
  };
  selectRow = (index, type) => {
    const { t } = this.props;
    this.selectedRowType = type;
    if (type === 'Delete') {
      const {
        data: gridRows,
        config: { idColumn, tabTitle },
      } = this.props;
      let indexWiseData = gridRows[index];
      let rowName = indexWiseData[tabTitle[0]];
      // Show custom delete confirmation modal
      this.setState({
        showDeleteModal: true,
        deleteIndex: index,
        deleteRowName: rowName,
        deleteIdColumn: idColumn,
      });
    } else if (type === 'Reply') {
      this.setState({ showDialogForm: true });
    } else {
      const {
        data: gridRows,
        config: { idColumn, loadAPI, identifier, apiIdentifier, comboTypes },
        dispatch,
        combos,
      } = this.props;

      var row = gridRows[index];
      var activeRecordId = row[idColumn];
      if (loadAPI) {
        var options = {
          action: 'load',
          identifier,
          apiIdentifier,
          id: activeRecordId,
        };

        if (comboTypes) {
          var listCombos = [];
          for (var combo of comboTypes) {
            if (!combo.loaded && combos[combo.type]) {
              combo.loaded = true;
            }
            if (!combo.loaded) {
              //combo.loaded = true;
              listCombos.push(combo);
            }
          }
          options.comboTypes = JSON.stringify(listCombos);
        }

        dispatch(loadAPI({ ...options, ...this.props.config.extraParams }));
      } else {
        var initialValues = {};
        var selectRowValues = {};
        for (var key in row) {
          //initialValues['field_'+key] = row[key + '_iden'] || row[key];
          initialValues[key] = null;
          selectRowValues[key] = row[key];
        }

        this.setState(
          {
            mode: this.selectedRowType,
            selectedRow: type === 'Create' ? {} : initialValues,
            activeRecordId: 'NEW_RECORD',
          },
          () => {
            this.setState({
              selectedRow: selectRowValues,
              visible: true,
              activeRecordId,
              selectedRowParent: this.props.selectedRowParent,
            });
          },
        );
      }
    }
  };

  resetProps = () => this.createRow();

  onGridReady = (params) => {
    const {
      gridPreferences,
      config: { identifier, uniqueIdentifier },
    } = this.props;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (gridPreferences) {
      let pref = JSON.parse(gridPreferences);
      const { sortInfo, filterInfo } = JSON.parse(gridPreferences);
      if (sortInfo && sortInfo.length > 0) {
        let sort = sortInfo.map((item) => ({
          colId: item.sort,
          sort: item.dir,
        }));
        // To Do: need to handle sort model if needed
        if (this.gridApi.setSortModel) {
          this.gridApi.setSortModel(sort);
        }
      }
      if (filterInfo && filterInfo.length > 0) {
        // TO DO : need to handle for grid prferences
      }
      if (pref[(uniqueIdentifier || identifier) + 'columns']) {
        if (this.gridColumnApi.setColumnState) {
          this.gridColumnApi.setColumnState(pref[(uniqueIdentifier || identifier) + 'columns']);
        }
      }
    }
    let masterConfig = JSON.parse(secureStorage.getItem('entityMapping') || '{}');
    let { entity, moduleName } = masterConfig[this.props.config.key];

    if (moduleName == 'ProjectTracking' && entity == 'Maiden_Task') {
      var statusCombos = this.props.combos['10713'] || [];
      var filterList = [];
      statusCombos
        .filter((item) => item.DisplayValue == 'Not Started' || item.DisplayValue == 'In Progress')
        .forEach((item) => {
          filterList.push(item.LookupId);
        });
      var model = {
        AssignedUserId: {
          type: 'list',
          value: secureStorage.getItem('userId') || '',
        },
        Maiden_TaskStatusId: {
          type: 'list',
          value: filterList.join(','),
        },
      };
      this.gridApi.setFilterModel(model);
      setTimeout(() => {
        this.gridApi.onFilterChanged();
      }, 500);
    }
  };

  onAddRow = () => {
    this.gridApi.updateRowData({ add: [{}] });
  };

  getRowData = () => {
    var rowData = [];
    this.gridApi.forEachNode(function (node) {
      rowData.push(node.data);
    });
    console.debug('Row Data:', JSON.stringify(rowData));
  };

  exportToXlsx = () => {
    let me = this;
    let filter = this.gridApi.getFilterData();
    let filterInfo = [];
    if (filter) {
      for (var item of filter) {
        var filterType = 'EQUALS';
        if (item.data.type == 'string') {
          filterType = 'CONTAINS';
        } else if (item.data.type == 'boolean') {
          item.data.value = item.data.value ? 1 : 0;
        } else if (item.data.type == 'numeric') {
          if (item.data.comparison == 'gt') {
            filterType = 'GREATERTHANEQUAL';
          } else if (item.data.comparison == 'lt') {
            filterType = 'LESSERTHANEQUAL';
          } else if (item.data.comparison == 'eq') {
            filterType = 'EQUALS';
          }
        } else if (item.data.type == 'date') {
          if (item.data.comparison == 'gt' || item.data.comparison == 'gte') {
            filterType = 'DATEGREATERTHANEQUAL';
          } else if (item.data.comparison == 'lt' || item.data.comparison == 'lte') {
            filterType = 'DATELESSERTHANEQUAL';
          } else if (item.data.comparison == 'eq') {
            filterType = 'DATEEQUALS';
          }
        } else if (item.data.type == 'list') {
          filterType = 'MULTI';
        }
        filterInfo.push({
          filterTerm: item.data.value,
          filterBy: item.field,
          filterType,
        });
      }
    }
    let options = {};
    if (this.props.config.isChild) {
      let parentEntity = this.props.config.ParentEntity;
      options.ParentEntity = parentEntity;
      options.ParentEntityField = this.props.config.ParentEntityField;
      options.ParentId = this.props.config.parentRecordId;
    }

    triggerAPI({
      t: me.props.t,
      controller: me.props.config.identifier,
      params: {
        action: 'ExportData',
        filterInfo: filterInfo,
        ...options
      },
      gridPanel: me,
      addProgressBar: true,
      resSuccessCallBack: (response) => {
        var jsonArray = response.data.data;

        // Remove keys containing 'Json' from each object
        jsonArray = jsonArray.map((row) => {
          const filteredRow = {};
          for (const key in row) {
            if (!key.toLowerCase().includes('json')) {
              filteredRow[key] = row[key];
            }
          }
          return filteredRow;
        });

        if (jsonArray.length > 0) {
          let key = 'xlsx';
          let fileType = {
            csv: 'text/plain;charset=UTF-8',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
          };
          var headers = [];
          for (var objectKey in jsonArray[0]) {
            headers.push(objectKey);
          }
          let timeStamp = moment().format('DD.MM.YY hh.mm');
          const fileName = me.props.config.title + ' ' + timeStamp;
          const ws = XLSX.utils.json_to_sheet(jsonArray, {
            header: headers,
          });
          const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
          let excelBuffer = XLSX.write(wb, { bookType: key, type: 'array' });
          const data = new Blob([excelBuffer], { type: fileType[key] });
          FileSaver.saveAs(data, fileName + '.' + key);
        } else {
          modal.error({
            title: me.props.t('No Entries for ' + me.props.config.title),
            maskClosable: false,
            okButtonProps: {
              style: { backgroundColor: '#C31D1D', border: 'none' },
            },
          });
        }
      },
    });
  };

  gridFooter = () => {
    if (this.props.config.gridFooter) {
      return this.props.config.gridFooter({
        gridPanel: this,
        config: this.props.config,
      });
    }
    return <></>;
  };

  componentWillReceiveProps({ combos: newCombos, errorMessage, selectedRow, isLoadFetching }) {
    if (this.props.config.comboTypes && newCombos) {
      const { combos: oldCombos } = this.props;
      if (oldCombos && Object.keys(oldCombos).length != Object.keys(newCombos).length) {
        var comboTypes = this.props.config.comboTypes;
        for (var comboType of comboTypes) {
          if (newCombos[comboType.type] && newCombos[comboType.type].length > 0) {
            comboType.loaded = true;
          }
        }
      }
    }
    if (errorMessage && errorMessage != this.props.errorMessage) {
      this.setState({ snackBarVisible: true, message: errorMessage, color: 'danger' }, () =>
        setTimeout(() => this.setState({ snackBarVisible: false, message: '' }), 5000),
      );
    }

    if (selectedRow && this.props.selectedRow != selectedRow) {
      var mode = 'edit';
      if (this.selectedRowType === 'View') {
        mode = 'view';
      }

      var activeRecordId = selectedRow['Id'];
      var initialValues = {};
      var selectRowValues = {};
      for (var key in selectedRow) {
        //initialValues['field_'+key] = row[key + '_iden'] || row[key];
        initialValues[key] = null;
        selectRowValues[key] = selectedRow[key];
      }
    }

    if (isLoadFetching && isLoadFetching != this.props.isLoadFetching) {
      this.loadFetchingModal();
    }
    if (!isLoadFetching && isLoadFetching != this.props.isLoadFetching) {
      var activeRecordId = selectedRow['Id'];
      modal.destroyAll();
      this.setState(
        {
          mode: mode,
          visible: true,
          selectedRow: this.selectedRowType === 'Create' ? {} : initialValues,
          activeRecordId: 'NEW_RECORD',
        },
        () => {
          this.setState({ selectedRow: selectRowValues, activeRecordId });
        },
      );
    }
  }

  buildButtons = (isFetching) => {
    const { t } = this.props;
    return (
      <>
        <span>
          <Button
            variant="outlined"
            className="add-button"
            startIcon={<AddIcon fontSize="small" />}
            onClick={this.createRow}
            disabled={isFetching}
          >
            {t('Add')}
          </Button>
        </span>
      </>
    );
  };

  closeDialogForm = (close) => {
    this.setState({ showDialogForm: close });
  };

  render() {
    const {
      config,
      data,
      total,
      isFetching,
      combos,
      gridPreferences,
      GridPanelWrapper: GridPanelWrapperProps,
      parentIdColumn,
    } = this.props;
    const { isRefresh, snackBarVisible, color, message } = this.state;
    const {
      childView,
      showCustomContent,
      isChild,
      hideTitle,
      identifier,
      gridColumns,
      autoRefresh,
      gridHeight,
      enableAdvanceSearch,
      hidePaging,
      pagination,
      onCellClicked,
      GridPanelWrapper: GridPanelWrapperConfig,
      childs,
      getCardView,
      formChilds,
      title,
      key,
    } = config;

    const GridPanelWrapper = GridPanelWrapperConfig || GridPanelWrapperProps;
    return (
      <GridPanelWrapper>
        <div
          className={identifier + '-class'}
          style={{
            width: '100%',
            marginLeft: '5px',
            marginRight: '5px',
            border: 'none',
            backgroundColor: 'transparent',
            height: config.GridComponent ? 'auto' : gridHeight || '600px',
          }}
        >
          {isChild &&
            !hideTitle &&
            (childView == 'section' || childView == 'flex') &&
            !config.parentIdentifier && (
              <div className="child-view-section-header">{config.title}</div>
            )}

          {!config.hideToolbar && (
            <ToolbarManagerComponent
              tableName={key}
              gridPanel={this}
              onRefresh={() =>
                this.setState({ isRefresh: true }, () => (this.state.isRefresh = false))
              }
              readOnlyGrid={this.props.config?.readOnlyGrid}
              isChild={this.props.config?.isChild}
              isEditable={this.props.config?.isEditable}
              isReadOnly={this.props.config?.isReadOnly}
              displayLoader={this.state.displayLoader}
              ParentEntity={this.props.config?.ParentEntity}
              onCreateRow={() => {
                if (this.props.config.onCreateRow) {
                  this.props.config.onCreateRow();
                } else {
                  this.createRow();
                }
              }}
              onExportToXlsx={() => this.exportToXlsx()}
              onApplyDateRangeFilter={(value) => this.applyDateRangeFilter(value)}
              onAddRow={() => this.onAddRow()}
              onGetRowData={() => this.getRowData()}
              gridApi={this.gridApi}
              combos={this.props.combos}
              t={this.props.t}
              title={this.props.config?.title}
              subTitle={this.props.config?.subTitle}
              customEditButton={this.props.config?.customEditButton}
            />
          )}

          <Snackbar place="tc" color={color} message={message} open={snackBarVisible} />
          {showCustomContent ? (
            <CardView
              loadData={this.loadData}
              data={data}
              combos={combos}
              selectRow={this.selectRow}
              getCardView={getCardView}
              isRefresh={isRefresh}
              isFetching={isFetching}
              total={total}
              gridPreferences={gridPreferences || JSON.stringify(config.gridPreferences)}
              autoRefresh={autoRefresh}
              config={config}
              onGridReady={this.onGridReady}
            />
          ) : config.GridComponent ? (
            <config.GridComponent
              columns={
                parentIdColumn
                  ? gridColumns.filter((item) => item.dataIndex !== parentIdColumn)
                  : gridColumns
              }
              loadData={this.loadData}
              data={data}
              autoRefresh={autoRefresh}
              enableAdvanceSearch={enableAdvanceSearch}
              total={total}
              isFetching={isFetching}
              selectRow={this.selectRow}
              combos={combos}
              isRefresh={isRefresh}
              onRowChange={this.onRowChange}
              onGridReady={this.onGridReady}
              hidePaging={hidePaging}
              height={gridHeight}
              pagination={pagination}
              onRowDoubleClicked={config.onRowDoubleClicked}
              gridPreferences={gridPreferences || JSON.stringify(config.gridPreferences)}
              pageSize={config.pageSize}
              onCellClicked={onCellClicked}
              childs={childs}
              config={config}
              showDeleteButton={config.showDeleteButton !== false}
              showEditButton={config.showEditButton !== false}
              drawerMode={config.drawerMode || false}
            />
          ) : (
            <AgGrid
              columns={
                parentIdColumn
                  ? gridColumns.filter((item) => item.dataIndex !== parentIdColumn)
                  : gridColumns
              }
              loadData={this.loadData}
              data={data}
              autoRefresh={autoRefresh}
              enableAdvanceSearch={enableAdvanceSearch}
              total={total}
              isFetching={isFetching}
              selectRow={this.selectRow}
              combos={combos}
              isRefresh={isRefresh}
              onRowChange={this.onRowChange}
              onGridReady={this.onGridReady}
              hidePaging={hidePaging}
              height={gridHeight}
              pagination={pagination}
              onRowDoubleClicked={config.onRowDoubleClicked}
              gridPreferences={gridPreferences || JSON.stringify(config.gridPreferences)}
              pageSize={config.pageSize}
              onCellClicked={onCellClicked}
              childs={childs}
              config={config}
            />
          )}
          {this.gridFooter()}
          <GridFooter />
          {!config.isReadOnly && (
            <ModalForm
              identifier={config.identifier}
              apiIdentifier={config.apiIdentifier}
              visible={this.state.visible}
              toggle={this.toogle}
              selectedRowParent={this.state.selectedRowParent}
              selectedRow={this.state.selectedRow}
              mode={this.state.mode}
              columns={
                parentIdColumn
                  ? config.formFields.filter((item) => item.dataIndex !== parentIdColumn)
                  : config.formFields
              }
              activeRecordId={this.state.activeRecordId}
              config={config}
              resetProps={this.resetProps}
              showDialogForm={this.state.showDialogForm}
              closeDialogForm={this.closeDialogForm}
              data={data}
              combos={combos}
              selectRow={this.selectRow}
              formChilds={formChilds}
            />
          )}

          {/* Delete Confirmation Modal */}
          <SuccessModal
            open={this.state.showDeleteModal}
            onClose={this.handleDeleteCancel}
            title="Are you sure you want to delete this record?"
            message={`This action will permanently delete "${this.state.deleteRowName}". This action cannot be undone.`}
            showCancelButton={true}
            onConfirm={this.handleDeleteConfirm}
            confirmButtonText="Yes, Delete"
            cancelButtonText="Cancel"
            iconType="warning"
          />

          {/* Delete Success Modal */}
          <SuccessModal
            open={this.state.showDeleteSuccessModal}
            onClose={this.handleDeleteSuccessClose}
            title="Record Deleted Successfully!"
            message="It has been successfully deleted from the system."
            buttonText="Dismiss"
            iconType="success"
          />
        </div>
      </GridPanelWrapper>
    );
  }
}

GridPanel.defaultProps = {
  GridPanelWrapper: (props) => <>{props.children}</>,
};

const mapStateToProps = (state, props) => {
  var listIdentifier = 'list_' + props.config.identifier.toLowerCase();
  var loadIdentifier = 'load_' + props.config.identifier.toLowerCase();
  var gridPreferenceIdentifier = 'gridpreference_' + props.config.identifier.toLowerCase();

  let selectedRowParent = {};
  if (props.config.isChild && props.config.parentIdentifier) {
    var listparentIdentifier = 'list_' + props.config.parentIdentifier.toLowerCase();
    if (state[listparentIdentifier].data)
      selectedRowParent = {
        ...(state[listparentIdentifier].data.selectedRowParent || {}),
      };
  }
  var gridData = state[listIdentifier];
  var rowData = state[loadIdentifier];
  var gridPreferenceState = state[gridPreferenceIdentifier] || {};

  var listErrorMessage = '';
  var loadErrorMessage = '';

  var isLoadFetching = false;

  var selectedRow = null;

  if (rowData) {
    if (rowData.isFetching) {
      isLoadFetching = true;
    }
    if (rowData.data && rowData.data.data) {
      selectedRow = rowData.data.data;
    }
  }
  /*var gridPreferences = JSON.stringify({
    sortInfo: [],
    filterInfo: [],
  });*/

  var gridPreferences = '';

  if (gridPreferenceState && gridPreferenceState.data) {
    gridPreferences = JSON.stringify(gridPreferenceState.data);
  }

  var allPreferences = [];
  // Sample JSON for All Preferences
  /*
    allPreferences = [
      {
        key: 'Preference1',
        preference: {
          sortInfo: [
            { sortBy: '2145', sortDirection: 'ASC' },
            { sortBy: '2155', sortDirection: 'DESC' },
          ],
          filterInfo: [{ filterBy: '2145', filterTerm: 'Be Soft Drinker' }],
        },
      },
      {
        key: 'Preference2',
        preference: {
          sortInfo: [{ sortBy: '2145', sortDirection: 'DESC' }],
          filterInfo: [{ filterBy: '2145', filterTerm: 'Be Soft Drinker' }],
        },
      },
      {
        key: 'Preference3',
        preference: {
          sortInfo: [{ sortBy: '2145', sortDirection: 'DESC' }],
          filterInfo: [{ filterBy: '2145', filterTerm: 'Demo' }],
        },
      },
    ];
    
    // Sample JSON for Grid Preferences
    gridPreferences = {
      sortInfo: [
        { sortBy: '2145', sortDirection: 'ASC' },
        { sortBy: '2155', sortDirection: 'DESC' },
      ],
      filterInfo: [{ filterBy: '2145', filterTerm: 'Be Soft Drinker' }],
    };*/

  if (gridData) {
    var data = [];
    var count = 0;
    if (gridData.data) {
      if (gridData.data && gridData.data.data) {
        data = gridData.data.data;
        count = gridData.data.total;
      }
    } else if (gridData.error) {
      listErrorMessage = gridData.error;
    }

    return {
      selectedRow,
      errorMessage: listErrorMessage || loadErrorMessage,
      data: data,
      combos: state.combos,
      isFetching: gridData.isFetching,
      isLoadFetching: isLoadFetching,
      total: count,
      gridPreferences: gridPreferences,
      allPreferences: allPreferences,
      selectedRowParent,
    };
  }

  return {
    selectedRow,
    data: [],
    errorMessage: listErrorMessage || loadErrorMessage,
    combos: {},
    isFetching: false,
    isLoadFetching: isLoadFetching,
    total: 0,
    gridPreferences: gridPreferences,
  };
};
export const ReduxGridPanel = withTranslation()(connect(mapStateToProps)(withRouter(GridPanel)));

class GridContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: null,
      tabId: this.props.config.tabId,
      activeRecordId: null,
      title: '',
      activePanel: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (EnableLogs) {
      Object.keys(nextProps)
        .filter((key) => {
          return nextProps[key] !== this.props[key];
        })
        .map((key) => {
          console.debug(
            'GridContainer - changed property:',
            key,
            'from',
            this.props[key],
            'to',
            nextProps[key],
          );
        });
    }
  }

  updateState = (object) => {
    this.setState({ ...object, activePanel: 1 });
  };

  render() {
    const { config } = this.props;
    const { selectedRow, activeRecordId, toogle, activePanel } = this.state;
    let title = ''; //config.title;
    if (selectedRow) {
      if (config.tabTitle && config.tabTitle.length > 0) {
        config.tabTitle.forEach((column) => {
          title += column + ': ' + selectedRow[column] + ' ';
        });
      }
    }
    if (
      config.child.length == 0 ||
      ((config.childView == 'flex' || config.childView == 'section') && !config.parentIdentifier)
    ) {
      return (
        <>
          <ReduxGridPanel
            config={config}
            activeRecordId={activeRecordId}
            parentRecordId={this.props.parentRecordId}
            updateState={this.updateState}
            parentIdColumn={this.props.parentIdColumn}
          />
          <ReduxFormContainer
            config={config}
            childView={config.childView}
            selectedRow={selectedRow}
            activeRecordId={activeRecordId}
            toogle={toogle}
          />
        </>
      );
    }
    return (
      <>
        <Accordion
          active={activePanel}
          collapses={[
            {
              title: title,
              content: (
                <ReduxGridPanel
                  config={config}
                  activeRecordId={activeRecordId}
                  parentRecordId={this.props.parentRecordId}
                  updateState={this.updateState}
                  parentIdColumn={this.props.parentIdColumn}
                />
              ),
            },
            {
              //title: "Form Container",
              content: (
                <ReduxFormContainer
                  config={config}
                  childView={config.childView}
                  selectedRow={selectedRow}
                  activeRecordId={activeRecordId}
                  toogle={toogle}
                />
              ),
            },
          ]}
        />
      </>
    );
  }
}

class FormContainer extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { config } = this.props;

    // UnComment below code to see Form Panel as First Child
    var childs = [
      /*{
        title: 'Details',
        index: 0,
        key: config.key,
        type: 'form-panel',
        columns: config.formFields,
        parentIdColumn: config.parentIdColumn,
      },*/
    ];

    if (config.child) {
      for (var child of config.child) {
        var tabConfig = { ...child };
        childs.push(tabConfig);
      }
    }
    this.state = {
      childs,
    };
  }

  loadTabData = (
    { actions, parentIdentifier, parentIdColumn, type, comboTypes },
    { filterInfo, sortInfo, currentPage, limit },
  ) => {
    const { selectedRow } = this.props;
    if (type === 'form-panel') return;
    if (Object.keys(selectedRow).length === 0) return;
    let newFilterInfo = null;
    if (filterInfo) {
      for (var index in filterInfo) {
        if (!newFilterInfo) {
          newFilterInfo = [];
        }
        newFilterInfo.push({
          filterTerm: filterInfo[index].filterValue || filterInfo[index].filterTerm,
          filterBy: filterInfo[index].filterBy,
        });
      }
    }
    let parentEntity = parentIdentifier.split('_');
    var options = {
      PageNo: 0,
      PageSize: 50,
      ParentEntity: parentEntity[parentEntity.length - 1],
      ParentEntityField: parentIdColumn,
      ParentId: selectedRow[parentIdColumn],
      filterInfo: newFilterInfo,
      sortInfo: sortInfo && sortInfo.length === 0 ? null : sortInfo,
    };
    if (comboTypes) {
      var combos = [];
      for (var combo of comboTypes) {
        combos.push(combo);
        // TO DO: Need to see why childs are loaded on parent row click
        /*if (!combo.loaded) {
          //combo.loaded = true;
          combos.push(combo);
        }*/
      }
      options.comboTypes = combos;
    }
    if (!selectedRow[parentIdColumn]) return;

    this.props.dispatch(actions.list(options));
  };

  onSelect = (tabIndex) => {
    var tab = this.state.childs[tabIndex];
    this.loadTabData(tab, {});
    return;
  };

  render() {
    const { childs } = this.state;
    const { selectedRow, childView } = this.props;

    return (
      <>
        <TabContainer
          items={childs}
          selectedRow={selectedRow}
          onSelect={this.onSelect}
          parentRecordId={this.props.activeRecordId}
          childView={childView}
          {...this.props}
        />
      </>
    );
  }
}

const mapStateToPropsFrom = (state, props) => {
  let selectedRowParent = {};
  if (props.config.isChild && props.config.identifier) {
    var listIdentifier = 'list_' + props.config.identifier.toLowerCase();
    if (state[listIdentifier] && state[listIdentifier].data)
      selectedRowParent = {
        ...(state[listIdentifier].data.selectedRowParent || {}),
      };
  }
  return { selectedRowParent };
};

const ReduxFormContainer = connect(mapStateToPropsFrom)(FormContainer);

class TabContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      preferences: {},
    };
  }

  onSelect = (item, tabIndex) => {
    // To Do: key has to be parent_child
    var newPreferences = { ...this.state.preferences };
    if (!newPreferences[item.key]) {
      newPreferences[item.key] = {};
    }
    newPreferences[item.key]['tabIndex'] = tabIndex;
    this.setState({ preferences: newPreferences });
  };

  constructTabItem = (item) => {
    const { selectedRow, parentRecordId, toogle, config } = this.props;
    var recordId = 0;
    if (selectedRow) {
      //debugger;
    }
    /*
    var tabIndex = 0;
    if(this.state.preferences && this.state.preferences[item.key]){
      tabIndex = this.state.preferences[item.key].tabIndex;
    }
    */

    if (item.type === 'grid') {
      return (
        <GridContainer
          config={item}
          parentRecordId={parentRecordId}
          parentIdColumn={item.parentIdColumn}
        />
      );
    } else if (item.type === 'form-panel') {
      return (
        <SimpleForm
          selectedRow={selectedRow}
          columns={item.columns.filter((column) => column.dataIndex !== item.parentIdColumn)}
          identifier={config.identifier}
          apiIdentifier={config.apiIdentifier}
          toggle={toogle}
          closable
          activeRecordId={parentRecordId}
          shouldNotResetFields={true}
          // mode={mode}
          config={config}
          resetProps={() => {}}
          enhanceFormConfig={config.enhanceFormConfig}
        />
      );
    } else if (item.type === 'gridonly') {
      //return <OnlyGridContainer config={item} />;
    } else {
      return <div>Need to Implement</div>;
    }
  };

  componentWillReceiveProps(nextProps) {
    if (EnableLogs) {
      Object.keys(nextProps)
        .filter((key) => {
          return nextProps[key] !== this.props[key];
        })
        .map((key) => {
          console.debug(
            'TabContainer - changed property:',
            key,
            'from',
            this.props[key],
            'to',
            nextProps[key],
          );
        });
    }
  }

  render() {
    const { items, closeButton, onSelect, tabIndex, childView } = this.props;
    // TO DO: need to implement close button when tabs are showing in parent container
    return (
      <>
        {childView == 'section' || childView == 'flex'
          ? items &&
            items.length > 0 &&
            items.map((item) => {
              return this.constructTabItem(item);
            })
          : items &&
            items.length > 0 && (
              <NavPills
                tabs={items.map((item, index) => ({
                  tabButton: item.title,
                  tabContent: this.constructTabItem(item),
                  onSelect: (tabindex) => onSelect(tabindex),
                }))}
              />
            )}
      </>
    );
  }
}
