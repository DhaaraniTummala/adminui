import React, { PureComponent } from 'react';
import DropOption from '../../../components/DropOption';
import Dates from '../../../core/utils/date';
import { ReduxHelper } from '../../../core/redux-helper';
import API from '../../../store/requests';
import secureStorage from '../../../utils/secureStorage';

const Actions = ReduxHelper.Actions;

class CustomCellRenderer extends PureComponent {
  render() {
    const { value } = this.props;
    return <span title={value}>{value}</span>;
  }
}

class IconCellRenderer extends PureComponent {
  render() {
    return (
      <img
        src={require('./small-right.svg')}
        style={{
          position: 'relative',
          left: -12,
        }}
      />
    );
  }
}

class ComboCellRenderer extends PureComponent {
  constructor(props) {
    super(props);

    var comboType = this.props.colDef.comboType;
    let value = '';
    if (this.props.context.componentParent.props.combos[comboType])
      value = this.props.context.componentParent.props.combos[comboType].find(
        (item) => item.LookupId == props.value,
      );
    this.state = {
      value,
      defaultValue: value,
      isChanged: false,
    };
  }

  refresh = (props) => {
    const { defaultValue } = this.state;
    if (!this.state.value || props.value !== this.state.value.LookupId) {
      var comboType = this.props.colDef.comboType;
      let value = '',
        isWarning = true;
      const combos = this.props.context.componentParent.props.combos;
      const checkWarning = this.props.colDef.checkWarning;
      if (combos[comboType]) {
        value = combos[comboType].find((item) => item.LookupId == props.value);
        if (checkWarning) {
          isWarning = defaultValue[checkWarning] == value[checkWarning];
        } else isWarning = false;
      }
      this.setState({ value, isChanged: true, isWarning });
    }
    return true;
  };

  render() {
    const { value, isChanged, isWarning } = this.state;

    return (
      <span
        className={isChanged ? (isWarning ? 'value-changed-yellow' : 'value-changed-red') : ''}
        title={value && value.DisplayValue}
      >
        {value && value.DisplayValue}
      </span>
    );
  }
}

class ComboCellRendererMulti extends PureComponent {
  constructor(props) {
    super(props);
    let filterVal = props.value && props.value.split ? props.value.split(',') : '';
    if (filterVal == '') {
      this.state = {
        value: [],
      };
    } else {
      var comboType = this.props.colDef.comboType;
      let value = [];
      let combos = this.props.context.componentParent.props.combos;
      if (combos[comboType] && combos[comboType].length > 0) {
        value = combos[comboType].filter((item) => {
          return filterVal.indexOf(item.LookupId.toString()) >= 0;
        });
      }

      value = value.map((item) => item.DisplayValue).toString();
      this.state = {
        value,
      };
    }
  }

  render() {
    const { value } = this.state;

    return <span title={value}>{value}</span>;
  }
}

class OparationCellRenderer extends PureComponent {
  constructor(props) {
    super(props);
    var isFullAccess = sessionStorage.getItem('fullAccess');

    let entityTable = props.context.config.key;
    let masterConfig = JSON.parse(secureStorage.getItem('entityMapping') || '{}');
    let { entity, moduleName } = masterConfig[entityTable];

    this.state = {
      options:
        isFullAccess == 0
          ? [{ key: 'View', name: 'View' }]
          : moduleName == 'ProjectTracking' && entity == 'Maiden_Task'
            ? [
                // { key: 'View', name: 'View' },
                { key: 'Update', name: 'Edit' },
                { key: 'Delete', name: 'Delete' },
                // { key: 'CopyId', name: 'Copy Id' },
                { key: 'SetCompleted', name: 'Set Completed' },
                { key: 'SetInProgress', name: 'Set In Progress' },
              ]
            : [
                // { key: 'View', name: 'View' },
                { key: 'Update', name: 'Edit' },
                { key: 'Delete', name: 'Delete' },
                // { key: 'CopyId', name: 'Copy Id' },
              ],
    };
  }

  componentDidMount() {
    if (this.props.data.ControlRoomRequestId) {
      this.setState({
        options: [{ key: 'Reply', name: 'Reply' }],
      });
    } else
      this.setState({
        options: this.state.options,
      });
  }

  handleMenuClick = (e) => {
    const { data } = this.props;
    if (e.key === 'CopyId') {
      const idColumn = this.props.context.componentParent.props.config.idColumn;
      const idValue = data[idColumn];
      if (idValue) {
        navigator.clipboard
          .writeText(idValue)
          .then(() => {
            alert(idColumn + ' copied to clipboard!');
          })
          .catch((err) => {
            console.error('Failed to copy ' + idColumn + ':', err);
          });
      } else {
        alert(idColumn + ' is not available.');
      }
    } else if (e.key === 'SetCompleted') {
      let { Maiden_TaskId } = this.props.data;
      var payload = {
        action: 'update',
        Maiden_TaskId,
        Maiden_TaskStatusId: '5b419841-89b4-446a-b459-e8d1d037114d',
      };
      var gridPanel = this.props.context.componentParent;
      API.triggerPost(this.props.context.config.key, payload)
        .then((response) => {
          var data = response.data;
          if (data.success) {
            gridPanel.refreshData();
          } else {
            alert(t('Failed'));
          }
        })
        .catch((error) => {
          alert(JSON.stringify(error));
        });
      /*this.props.context.dispatch(Actions['update10715']({
        Maiden_TaskId,
        Maiden_TaskStatusId: '5b419841-89b4-446a-b459-e8d1d037114d'
      }));*/
    } else if (e.key === 'SetInProgress') {
      let { Maiden_TaskId } = this.props.data;
      var payload = {
        action: 'update',
        Maiden_TaskId,
        Maiden_TaskStatusId: 'd288e1ce-dbdb-4868-8ece-48ecc27115f7',
      };
      var gridPanel = this.props.context.componentParent;
      API.triggerPost(this.props.context.config.key, payload)
        .then((response) => {
          var data = response.data;
          if (data.success) {
            gridPanel.refreshData();
          } else {
            alert(t('Failed'));
          }
        })
        .catch((error) => {
          alert(JSON.stringify(error));
        });
    } else {
      this.props.context.componentParent.props.selectRow(this.props.rowIndex, e.key);
    }
  };

  render() {
    return (
      <>
        <DropOption
          onMenuClick={(e) => this.handleMenuClick(e)}
          menuOptions={this.state.options}
          dropdownProps={{ trigger: ['click'] }}
        />
      </>
    );
  }
}

class DateTimeCellRenderer extends PureComponent {
  render() {
    let { value } = this.props;
    if (value) {
      return <span title={Dates.standardDateTime(value)}>{Dates.standardDateTime(value)}</span>;
    } else {
      return '';
    }
  }
}

class BooleanCellRenderer extends PureComponent {
  render() {
    let { value } = this.props;
    return <span title={value ? 'Yes' : 'No'}>{value ? 'Yes' : 'No'}</span>;
  }
}

class DateWithTimeZoneCellRenderer extends PureComponent {
  render() {
    let { value } = this.props;

    if (value) {
      return (
        <span title={Dates.DateWithLocalTimeZone(value)}>{Dates.DateWithLocalTimeZone(value)}</span>
      );
    } else {
      return '';
    }
  }
}

class DateTimeWithTimeZoneCellRenderer extends PureComponent {
  render() {
    let { value } = this.props;

    if (value) {
      return (
        <span title={Dates.DateTimeWithLocalTimeZone(value)}>
          {Dates.DateTimeWithLocalTimeZone(value)}
        </span>
      );
    } else {
      return '';
    }
  }
}

class DateCellRenderer extends PureComponent {
  render() {
    let { value } = this.props;
    if (value) {
      return <span title={Dates.standardDate(value)}>{Dates.standardDate(value)}</span>;
    } else {
      return <span>-</span>;
    }
  }
}

class FloatCellRenderer extends PureComponent {
  render() {
    const {
      value,
      colDef: { decimal },
    } = this.props;
    if (value == null || isNaN(value)) {
      return <span title={value}>{value}</span>;
    } else {
      let parsedecimal = parseInt(decimal) || 2;
      let parsevalue = parseFloat(value);
      // Format with commas and decimal places
      const formattedValue = parsevalue.toLocaleString('en-IN', {
        minimumFractionDigits: parsedecimal,
        maximumFractionDigits: parsedecimal,
      });
      return <span title={formattedValue}>{formattedValue}</span>;
    }
  }
}

class AMCDateCellRenderer extends PureComponent {
  render() {
    const { value, data } = this.props;

    // Check if AMC (IsAmc) is enabled for this row
    const isAmcEnabled = data?.IsAmc === true || data?.IsAmc === 'Y' || data?.IsAmc === 'Yes';

    // Only show date if AMC is enabled
    if (isAmcEnabled && value) {
      return <span title={Dates.standardDate(value)}>{Dates.standardDate(value)}</span>;
    } else {
      return <span>-</span>;
    }
  }
}

// Image Cell Renderer for displaying image thumbnails in grid
class ImageCellRenderer extends PureComponent {
  handleImageClick = () => {
    const { value } = this.props;
    if (value) {
      window.open(value, '_blank');
    }
  };

  handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML =
      '<span style="color: #ff4d4f; font-size: 12px;">Error</span>';
  };

  render() {
    const { value, imageWidth, imageHeight, imageShape } = this.props;

    if (!value) {
      return <span style={{ color: '#999', fontSize: '12px' }}>No Image</span>;
    }

    // Get custom dimensions from props (passed via cellRendererParams), or use defaults
    const width = imageWidth || '75px';
    const height = imageHeight || '50px';
    const shape = imageShape || 'rectangle'; // 'rectangle' or 'circle'

    // Determine border radius based on shape
    const borderRadius = shape === 'circle' ? '50%' : '8px';

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '8px',
        }}
      >
        <img
          src={value}
          alt="Image"
          style={{
            width: width,
            height: height,
            objectFit: 'cover',
            borderRadius: borderRadius,
            cursor: 'pointer',
            border: '2px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onClick={this.handleImageClick}
          onError={this.handleImageError}
        />
      </div>
    );
  }
}

export {
  CustomCellRenderer,
  OparationCellRenderer,
  ComboCellRenderer,
  ComboCellRendererMulti,
  DateCellRenderer,
  BooleanCellRenderer,
  DateWithTimeZoneCellRenderer,
  DateTimeWithTimeZoneCellRenderer,
  FloatCellRenderer,
  DateTimeCellRenderer,
  IconCellRenderer,
  AMCDateCellRenderer,
  ImageCellRenderer,
};
