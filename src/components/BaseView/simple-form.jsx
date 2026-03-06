/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
import DocumentUploader from '../../components/DocumentUploader/DocumentUploader';
import { Form, Col, Row, Button, Input, Collapse } from 'antd';
import { connect } from 'react-redux';
import API from '../../store/requests';
import Snackbar from '../Snackbar/Snackbar.jsx';
import SuccessModal from '../common/SuccessModal';
import DateFormat, { Util } from '../../utils/date';
import moment from 'moment';
import { isGuidSystem, isNewBackend } from '../../app-config';
import Guid from 'guid';
import { Modal } from 'antd';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { CircularProgress, Select } from '@mui/material';
import 'moment//locale/es';
import AttachmentIcon from '@mui/icons-material/Attachment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InfoIcon from '@mui/icons-material/Info';
import './simple-form.css';
import secureStorage from '../../utils/secureStorage';

import {
  InputComponent,
  CustomInput,
  CustomDateInput,
  CustomDateTimeInput,
  CustomSwitchInput,
  CustomTextAreaInput,
  TabPanel,
  CustomSelect,
  ImageUpload,
  VideoUpload,
  RichTextBox,
  MultiInput,
  CustomReduxAutoComplete,
} from '../maiden-core/ui-components';
import { color } from '@mui/system';

const { Panel } = Collapse;

const modal = Modal;
var buttonClickChild = '';
var datevalidationobj = {};

const { TextArea } = Input;
const { Option } = Select;
export const FieldTypes = {
  String: 'string',
  Amount: 'float',
  // Need to handle
  Text: 'text',
  Date: 'date',
  Time: 'time',
  // Need to handle
  DateTime: 'datetime',
  // Need to handle
  Lookup: 'combo',
  Toggle: 'boolean',
  Number: 'int',
  TextArea: 'textarea',
  AutoFill: 'autofill',
  Password: 'password',
  ImageUpload: 'imageUpload',
  TextMax: 'textMax',
  MultiImageUpload: 'multiImageUpload',
  MultiInput: 'multiInput',
  Url: 'url',
  Email: 'email',
  LatLong: 'latlong',
  Percentage: 'percentage',
  MacAddress: 'macAddress',
  Numeric: 'numeric',
  Float: 'float',
  Alphanumeric: 'alphanumeric',
  FileUpload: 'fileupload',
  RefMediaUpload: 'refmediaupload',
  AjaxSelect: 'ajaxSelect',
  SearchAjax: 'searchAjax',
  MinMax: 'minmax',
  Dragger: 'dragger',
  Button: 'button',
  VideoUpload: 'videoUpload',
};

const getThemeColor = () => {
  return '';
};

CustomSelect.defaultProps = {
  mappingId: 'LookupId',
};

/*
const CustomSelect = ({ options, onChange, name, value, allowZeros, mode }) => {
  //var a = options.find(item => item.LookupId == value);
  //if (typeof a == 'undefined') options.push({ LookupId: value, DisplayValue: '' });
  return (
    <CustomSelectLarge
      mode={mode}
      name={name}
      value={value}
      className={'select_' + name}
      placeholder="Select..."
      getPopupContainer={() => {
        return document.getElementsByClassName('ant-modal-body')[0];
        //.parentElement.parentElement.parentElement.parentElement.parentElement
      }}
      onChange={onChange}
      style={{ width: '100%' }}
      showSearch
      allowZeros={allowZeros}
      filterOption={(input, option) => {
        if (!option.props.children) {
          return false;
        }
        return input ? option.props.children.toLowerCase().startsWith(input.toLowerCase()) : true;
      }}
    >
      {options.map(option => (
        <Option style={{ zIndex: '999999999' }} value={option.LookupId}>
          {option.DisplayValue}
        </Option>
      ))}
    </CustomSelectLarge>
  );
};
*/
const ReturnComponent = ({
  item,
  data,
  name,
  fieldValue: value,
  onChange,
  activeRecordId,
  stringComboVal,
  params,
  translate,
  mode,
  disabled,
  recProps,
  recState,
}) => {
  if (item.type == FieldTypes.Number) {
    if (item.disabledOnEdit) {
      if (typeof recProps.activeRecordId == 'number') {
        disabled = true;
      }
    }

    return (
      <CustomInput
        type="text"
        name={name}
        value={value}
        placeholder={`Enter ${item.title}`}
        maxLength={item.maxLength ? item.maxLength : 250}
        onChange={(event) => {
          let value = event.target.value;
          if (/^-?\d*[.,]?\d*$/.test(value)) {
            if (item.allowNegatives || value >= 0) {
              onChange(value);
            }
          }
        }}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #F2F4F7',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.String) {
    return (
      <CustomInput
        name={name}
        value={value}
        placeholder={`Enter ${item.title}`}
        onChange={onChange}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #F2F4F7',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.Amount) {
    if (item.disabledOnEdit) {
      if (typeof recProps.activeRecordId == 'number') {
        disabled = true;
      }
    }

    return (
      <CustomInput
        name={name}
        disabled={disabled}
        placeholder={`Enter ${item.title}`}
        maxLength={item.maxLength ? item.maxLength : 250}
        value={value != null ? value?.toString() : item.defaultValue}
        onChange={(event) => {
          let value = event.target.value;
          if (/^-?\d*[.,]?\d*$/.test(value)) onChange(value);
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #F2F4F7',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.Date) {
    return (
      <CustomDateInput
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`Select ${item.title}`}
        format="DD-MM-YYYY"
        disabledDate={
          item.disabledDate ||
          ((current) => {
            if (item.disablePastDate) {
              return current && current < item.disablePastDate;
            } else {
              return false;
            }
          })
        }
      />
    );
  } else if (item.type == FieldTypes.Time) {
    return (
      <CustomInput
        type="time"
        name={name}
        value={value}
        placeholder={`Select ${item.title}`}
        onChange={onChange}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #F2F4F7',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.DateTime) {
    return (
      <CustomDateTimeInput
        showTime
        placeholder="Select Time"
        format="YYYY-MM-DD HH:mm:ss"
        name={name}
        onChange={onChange}
        style={{ width: '10%' }}
        value={value}
        disbled={disabled}
        disabledDate={(current) => {
          if (item.disablePastDate) {
            return current && current < item.disablePastDate;
          } else {
            return false;
          }
        }}
        getCalendarContainer={(trigger) => trigger.parentNode}
      />
    );
  } else if (item.type == FieldTypes.Toggle) {
    return (
      <CustomSwitchInput
        name={name}
        checked={value}
        onChange={onChange}
        // label={item.title}
        disbled={disabled}
      />
    );
  } else if (item.type == FieldTypes.TextArea || item.type == FieldTypes.Text) {
    let props = {};
    if (item.rowSpan)
      props = {
        autoSize: { minRows: item.rowSpan - 2, maxRows: item.rowSpan },
      };

    return (
      <textarea
        style={{ borderRadius: '8px' }}
        rows={item.rowSpan || 1}
        // label={item.title}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    );
  } else if (item.type == FieldTypes.AutoFill) {
    return (
      <CustomReduxAutoComplete
        name={name}
        value={value}
        onChange={onChange}
        activeModule={item.activeModule}
        comboType={item.comboType}
        activeRecordId={activeRecordId}
        params={params}
        allowZeros={item.allowZeros}
      />
    );
  } else if (item.type == FieldTypes.Lookup) {
    return (
      <CustomSelect
        name={name}
        value={item.mode == 'multiple' ? (value ? value : []) : value}
        onChange={onChange}
        options={data}
        allowZeros={item.allowZeros}
        mode={item.mode || 'default'}
        mappingId={item.mappingId}
        placeholder={`Select ${item.title}`}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D0D5DD',
            '&:hover': {
              borderColor: '#98A2B3',
            },
            '&.Mui-focused': {
              borderColor: '#7F56D9',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.Password) {
    return (
      <CustomInput
        name={name}
        value={value}
        type="password"
        placeholder={`Enter ${item.title}`}
        onChange={onChange}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D0D5DD',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  } else if (item.type == FieldTypes.ImageUpload) {
    return (
      <ImageUpload onChange={onChange} name={name} value={value} item={item} disbled={disabled} />
    );
  } else if (item.type == FieldTypes.TextMax) {
    return (
      <RichTextBox onChange={onChange} name={name} value={value} item={item} disbled={disabled} />
    );
  } else if (item.type == FieldTypes.VideoUpload) {
    return <VideoUpload onChange={onChange} name={name} value={value} item={item} />;
  } else if (item.type == FieldTypes.MultiInput) {
    return <MultiInput onChange={onChange} name={name} value={value} />;
  } else if (item.type == FieldTypes.FileUpload) {
    // File upload is handled by DocumentUploader component, so don't render anything here
    return null;
  } else {
    return (
      <CustomInput
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${item.title}`}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #F2F4F7',
            '&:hover': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
            },
          },
        }}
      />
    );
  }
};

class SimpleForm extends PureComponent {
  constructor(props) {
    super(props);
    const { selectedRow, columns } = props;
    this.state = {
      snackBarVisible: false,
      hideField: [],
      notRequiredFields: {},
      columns: [],
      validForm: {},
      collapseViewShow:
        this.props.config?.tableName === '10818' || this.props.config?.entityName === 'WorkOrder'
          ? ['active', 'active', 'active'] // All sections active for WorkOrder
          : ['active'],
      isDisabledField: false,
      showSuccessModal: false,
    };
    this.defaultColSpan = 12;
    this.defaultMinHeight = 105;
    this.updateState({ selectedRow, columns });
  }

  afterDataLoad = () => {
    if (this.props.config && this.props.config.afterRecordLoad) {
      this.props.config.afterRecordLoad({ formPanel: this });
    }
  };

  componentWillMount() {
    this.afterDataLoad();
  }

  isValidLookUp = (value) => {
    if (!isNaN(value)) {
      return value > 0;
    }
    if (isGuidSystem) {
      if (!value) {
        return false;
      }
      var guid = new Guid(value);
      return !guid.equals(Guid.EMPTY);
    } else {
      return value > 0;
    }
  };

  updateState = ({ selectedRow, columns }) => {
    if (selectedRow) {
      for (var col of columns) {
        var key = col.mappingDataIndex || col.dataIndex;
        var formKey = col.dataIndex;
        if (col.type == FieldTypes.Toggle) {
          this.state[formKey] =
            selectedRow[key] == 'Y' ||
            selectedRow[key] == 'true' ||
            selectedRow[key] == 'Active' ||
            selectedRow[key] == 1
              ? true
              : false;
        } else if (col.type == FieldTypes.Text || col.type == FieldTypes.String) {
          if (selectedRow[key] == null) {
            this.state[formKey] = '';
          } else {
            this.state[formKey] = selectedRow[key];
          }
        } else if (col.type == FieldTypes.Date) {
          if (selectedRow[key]) {
            this.state[formKey] = moment(DateFormat.parse(selectedRow[key]));
          } else {
            this.state[formKey] = null;
          }
        } else if (col.type == FieldTypes.DateTime) {
          if (selectedRow[key]) {
            this.state[formKey] = moment(DateFormat.parse(selectedRow[key]));
          } else {
            this.state[formKey] = null;
          }
        } else if (col.type == FieldTypes.MultiInput) {
          if (selectedRow[key]) {
            this.state[formKey] = selectedRow[key].split(',');
          } else {
            this.state[formKey] = [];
          }
        } else if (col.type === FieldTypes.AutoFill || col.type === FieldTypes.Lookup) {
          if (col.mode == 'multiple') {
            if (selectedRow[key]) {
              this.state[formKey] = selectedRow[key]
                .split(',')
                .map((item) => parseInt(item))
                .filter((item) => item);
            } else {
              this.state[formKey] = [];
            }
          } else if (
            this.isValidLookUp(selectedRow[key]) ||
            col.allowZeros ||
            (col.allowIdAsString && selectedRow[key] !== '')
          ) {
            this.state[formKey] = selectedRow[key];
          } else {
            this.state[formKey] = '';
          }
        } else {
          this.state[formKey] = selectedRow[key];
        }
      }
    }
  };

  // else if (col.type == FieldTypes.Lookup ) {
  //   debugger
  //   if (selectedRow[key] == null) {
  //     this.state[formKey] = '';
  //   } else {
  //     this.state[formKey] = selectedRow[key];
  //   }
  // }

  checkCollapseError(errors) {
    let { columns } = this.props;
    if (errors) {
      columns.forEach((fields) => {
        if (fields.isCollapse) {
          var sectionValid = true;
          fields.columns.forEach((columnsFiled) => {
            Object.keys(errors).forEach((ele) => {
              if (columnsFiled.title == ele) {
                if (errors[ele].errors.length !== 0) {
                  sectionValid = false;
                }
              }
            });
          });
          var setErrors = this.state.validForm;
          setErrors[fields.header] = sectionValid;
          this.setState({ validForm: setErrors });
        }
      });
    }
  }

  componentWillReceiveProps({ selectedRow, columns, activeRecordId, visible }) {
    if (
      selectedRow &&
      JSON.stringify(selectedRow) !== JSON.stringify(this.props.selectedRow) &&
      (!this.state.applyLocalChange || this.props.activeRecordId != activeRecordId)
    ) {
      this.updateState({ selectedRow, columns });
      this.setState({ activeRecordId }, this.afterDataLoad);
    }
    if (visible !== this.props.visible && !visible) {
      this.props.form.resetFields();
      for (var col of columns) {
        var formKey = col.dataIndex;
        this.onChange(formKey, null);
      }
      this.setState({});
      this.files = {};
      this.documents = [];
      if (this.props.config.resetFormFields) this.props.config.resetFormFields();
    }
  }
  success = () => {
    // Show the success modal
    this.setState({ showSuccessModal: true });
  };

  getSuccessModalContent = () => {
    const { config, activeRecordId } = this.props;
    const entityName = config?.title || 'Asset';

    const isNewRecord = activeRecordId === 'NEW_RECORD';

    if (isNewRecord) {
      return {
        title: `New ${entityName} Added Successfully!`,
        message: `The new ${entityName.toLowerCase()} has been successfully added to the system.`,
      };
    } else {
      return {
        title: ` ${entityName} Details Updated!`,
        message: `The ${entityName.toLowerCase()} details have been successfully updated.`,
      };
    }
  };

  handleCloseSuccessModal = () => {
    this.setState({ showSuccessModal: false });

    // Refresh data when user manually dismisses modal
    const { toggle } = this.props;
    if (toggle) {
      // Call toggle to refresh the parent component data
      toggle(true);
    }
  };
  componentDidMount() {
    // Call onFormLoad if it exists in props
    if (this.props.config && typeof this.props.config.onFormLoad === 'function') {
      this.props.config.onFormLoad({
        selectedRow: this.props.selectedRow,
        form: this.props.form,
        // Add any other relevant form props here
      });
    }
  }

  onSave = (closeable, callBack) => {
    const { t, documentUploader = false } = this.props;

    this.props.form.validateFields({ validateOnly: false }).then(() => {
      this.files = {};

      const {
        toggle,
        resetProps,
        config: { parentIdColumn },
        selectedRow,
        selectedRowParent,
        activeRecordId,
      } = this.props;
      var values = this.state;
      var json = {
        action: 'save',
        apiIdentifier: this.props.apiIdentifier,
      };
      var columns = this.props.columns;
      for (var col of columns) {
        var fieldId = col.dataIndex;
        if (col.hideInForm) continue;

        // Skip AssetValue - it's auto-calculated, don't send to backend
        if (fieldId === 'AssetValue') continue;

        if (col.type == FieldTypes.Toggle) {
          if (values[fieldId]) {
            json[fieldId] = true;
          } else {
            json[fieldId] = false;
          }
          continue;
        }

        if (activeRecordId == 'NEW_RECORD') {
          if (values[fieldId]) {
            if (col.type == FieldTypes.DateTime) {
              json[fieldId] = values[fieldId].format(Util.dateTimeParamFormat);
            } else if (col.type == FieldTypes.Date) {
              json[fieldId] = values[fieldId].format(Util.dateParamFormat);
            } else if (col.type == FieldTypes.MultiInput) {
              json[fieldId] = values[fieldId].toString();
            } else if (col.type == FieldTypes.ImageUpload) {
              json[fieldId] = values[fieldId];
              this.files[fieldId] = values[fieldId];
            } else if (col.type == FieldTypes.Lookup && col.mode == 'multiple') {
              if (values[fieldId].length == 0) {
                // Not sending key value pair
              } else {
                json[fieldId] = values[fieldId];
              }
            } else {
              if (
                typeof values[fieldId] !== 'undefined' &&
                (values[fieldId] || values[fieldId] === 0)
              ) {
                json[fieldId] = values[fieldId];
              }
            }
          } else {
            // Not sending key value pair
          }
        } else {
          if (selectedRow && selectedRow[fieldId]) {
            // Value exists
            if (values[fieldId]) {
              if (col.type == FieldTypes.DateTime) {
                json[fieldId] = values[fieldId].format(Util.dateTimeParamFormat);
              } else if (col.type == FieldTypes.Date) {
                json[fieldId] = values[fieldId].format(Util.dateParamFormat);
              } else if (col.type == FieldTypes.MultiInput) {
                json[fieldId] = values[fieldId].toString();
              } else if (col.type == FieldTypes.ImageUpload) {
                json[fieldId] = values[fieldId];
                this.files[fieldId] = values[fieldId];
              } else if (col.type == FieldTypes.Lookup && col.mode == 'multiple') {
                if (values[fieldId].length == 0) {
                  // exists in old record but modified to empty in current state
                  json[fieldId] = 'NULL';
                } else {
                  json[fieldId] = values[fieldId];
                }
              } else {
                if (
                  typeof values[fieldId] !== 'undefined' &&
                  (values[fieldId] || values[fieldId] === 0)
                ) {
                  json[fieldId] = values[fieldId];
                } else {
                  if (selectedRow[fieldId]) {
                    // exists in old record but modified to empty in current state
                    json[fieldId] = 'NULL';
                  }
                }
              }
            } else {
              // exists in old record but modified to empty in current state
              json[fieldId] = 'NULL';
            }
          } else {
            // Value not exists earlier
            if (values[fieldId]) {
              if (col.type == FieldTypes.DateTime) {
                json[fieldId] = values[fieldId].format(Util.dateTimeParamFormat);
              } else if (col.type == FieldTypes.Date) {
                json[fieldId] = values[fieldId].format(Util.dateParamFormat);
              } else if (col.type == FieldTypes.MultiInput) {
                json[fieldId] = values[fieldId].toString();
              } else if (col.type == FieldTypes.ImageUpload) {
                json[fieldId] = values[fieldId];
                this.files[fieldId] = values[fieldId];
              } else if (col.type == FieldTypes.Lookup && col.mode == 'multiple') {
                if (values[fieldId].length == 0) {
                } else {
                  json[fieldId] = values[fieldId];
                }
              } else {
                if (
                  typeof values[fieldId] !== 'undefined' &&
                  (values[fieldId] || values[fieldId] === 0)
                ) {
                  json[fieldId] = values[fieldId];
                }
              }
            } else {
              if (
                typeof values[fieldId] !== 'undefined' &&
                (values[fieldId] || values[fieldId] === 0)
              ) {
                json[fieldId] = values[fieldId];
              } else {
              }
            }
          }
        }
      }

      var request = {};
      let me = this;
      if (parentIdColumn) {
        json[parentIdColumn] = selectedRowParent[parentIdColumn];
      }
      if (this.props.config.ParentEntityField && this.props.config.parentRecordId) {
        json[this.props.config.ParentEntityField] = this.props.config.parentRecordId;
      }
      if (isNewBackend) {
        if (this.props.activeRecordId == 'NEW_RECORD') {
          json.action = 'insert';
          if (isGuidSystem) {
            delete json.id;
          }
        } else {
          json.action = 'update';
          json[this.props.config.idColumn] = this.props.activeRecordId;
        }
      } else {
        if (this.props.activeRecordId == 'NEW_RECORD') {
          json.id = 0;
        } else {
          json.id = this.props.activeRecordId;
        }
      }

      request = json;
      var isValid = true;
      if (this.props.config.beforeSave) {
        isValid = this.props.config.beforeSave(request, values, this.props.form);
      }

      if (!isValid) {
        return;
      }

      this.setState({ loading: true });
      API.triggerMultiPartPost(request.apiIdentifier, request, this.files, this.documents)
        .then((response) => {
          this.setState({ loading: false });
          var data = response.data;
          if (data.success) {
            this.props.form.resetFields();
            for (var col of columns) {
              var formKey = col.dataIndex;
              if (!this.props.shouldNotResetFields) me.onChange(formKey, null);
            }
            this.files = {};
            this.documents = [];
            if (this.props.config.resetFormFields) this.props.config.resetFormFields();
            if (callBack) callBack(data);
            // Don't close immediately - let success modal show first
            if (!closeable) resetProps();
            this.success();
          } else if (data.info) {
            this.setState(
              {
                snackBarVisible: true,
                message: data.info,
                color: 'danger',
              },
              () => setTimeout(() => this.setState({ snackBarVisible: false, message: '' }), 5000),
            );
          } else {
            alert(t('Failed'));
          }
        })
        .catch((error) => {
          this.setState({ loading: false });
          if (error.response) alert(error.response.data.Message);
        });
    });
  };

  onChange = (field, control, type) => {
    if (type == 'file' || type == 'multiInput') {
      this.setState({ [field]: control });
      this.props.form.setFieldsValue({ [field]: value });
    } else if (control == null) {
      this.setState({ [field]: control, applyLocalChange: true });
      this.props.form.setFieldsValue({ [field]: value });
    } else if (control._isAMomentObject) {
      var value = '';
      if (typeof control === 'object') value = control; //.format('YYYY-MM-DD hh:mm:ss');
      this.setState({ [field]: value, applyLocalChange: true });
      this.props.form.setFieldsValue({ [field]: value });
    } else {
      var value = '';
      if (typeof control === 'object') {
        if (control.length >= 0) {
          value = control;
        } else value = control.target.value;
      } else if (
        typeof control === 'boolean' ||
        typeof control === 'string' ||
        typeof control === 'number'
      )
        value = control;
      if (value.charAt && value.charAt(0) == ' ') value = value.trim();
      if (typeof this.props.setShowConfMsg === 'function') this.props.setShowConfMsg(true);

      // Check if this is an AMC switch field change that should trigger conditional field visibility
      const isAmcSwitchField =
        field &&
        (field.toLowerCase().includes('amc') ||
          field.toLowerCase().includes('isamc') ||
          field === 'IsAmc');

      this.setState({ [field]: value, applyLocalChange: true }, () => {
        // Force re-render if AMC switch changed to show/hide conditional fields
        if (isAmcSwitchField) {
          this.forceUpdate();
        }
      });
      this.props.form.setFieldsValue({ [field]: value });
    }
  };

  getFieldRules = (item) => {
    const { notRequiredFields } = this.state;
    const id = item.dataIndex;
    const { t, selectedRow } = this.props;
    return [
      {
        required:
          item.type == FieldTypes.Toggle ? false : !notRequiredFields[id] && !!item.isRequired,
        message: `${item.title}` + ' ' + 'is required',
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          // Custom validation for Asset Name in asset form (identifier '10738')
          // if (item.dataIndex === 'AssetName' && this.props.identifier === '10738') {
          //   if (!value || value.trim() === '') {
          //     return callback('Asset Name is required');
          //   }
          // }
          if (rule.required && !notRequiredFields[id]) {
            if (value == null || typeof value == 'undefined') {
              return callback(true);
            } else if (
              (item.type === FieldTypes.String ||
                item.type === FieldTypes.Alphanumeric ||
                item.type === FieldTypes.Text ||
                item.type === FieldTypes.TextArea ||
                item.type === FieldTypes.Password ||
                item.type === FieldTypes.Numeric ||
                item.type === FieldTypes.Float ||
                item.type === FieldTypes.AjaxSelect ||
                item.type === FieldTypes.SearchAjax) &&
              (value == '' || value == ' ') &&
              !item.allowZeros
            ) {
              return callback(true);
            } else if (
              (item.type === FieldTypes.Number || item.type === FieldTypes.Amount) &&
              !/^-?\d*[.,]?\d*$/.test(value)
            ) {
              return callback(true);
            } else if (
              item.type === FieldTypes.Url &&
              !/^(ftp|http|https):\/\/[^ "]+$/.test(value)
            ) {
              rule.message = item.title + ' ' + 'must be a valid url';
              return callback(true);
            } else if (
              item.type === FieldTypes.MacAddress &&
              !/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/.test(value)
            ) {
              rule.message = item.title + ' ' + 'must be a valid Mac Address';
              return callback(true);
            } else if (
              item.type === FieldTypes.Email &&
              !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                value,
              )
            ) {
              rule.message = item.title + ' ' + 'must be a valid email';
              return callback(true);
            } else if (item.type === FieldTypes.AutoFill || item.type === FieldTypes.Lookup) {
              if (value === 0 && !item.allowZeros) {
                return callback(true);
              }
              if (value === '' || value.length == 0) {
                return callback(true);
              } else return callback();
            } else if (item.type === FieldTypes.MultiInput) {
              if (value.length == 0) {
                return callback(true);
              } else return callback();
            } else if (item.type === FieldTypes.Dragger) {
              var fileExtension = value?.name.match(/\.[0-9a-z]+$/i)[0];
              if (fileExtension != item.validExtn) {
                return callback(true);
              } else return callback();
            } else return callback();
          }
          return callback();
        },
      },
      {
        daterange: item.type == 'date' ? true : false,
        message: "Program's to date can not be less than max to date of program item",
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          if (rule.daterange && !notRequiredFields[id] && value && selectedRow.ChildMaxDate) {
            if (rule.field === 'Valid To') {
              let momentchildMaxDate = moment(DateFormat.parse(selectedRow.ChildMaxDate));
              let childMaxDate = momentchildMaxDate.valueOf();
              let selectedToDate = value.valueOf();
              if (childMaxDate > selectedToDate) {
                return callback(true);
              } else {
                return callback();
              }
            }
          }
          return callback();
        },
      },
      {
        daterange: item.type == 'date' ? true : false,
        message: "Valid To can't be less than Valid From",
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          if (rule.daterange && !notRequiredFields[id] && value) {
            if (rule.field === 'Valid From' || rule.field === 'Valid To') {
              if (rule.field === 'Valid From') {
                datevalidationobj['lower'] = value;
              } else if (rule.field === 'Valid To') {
                datevalidationobj['upper'] = value;
                // if(selectedRow.ValidFrom){;
                //   let momentValidFrmDate = moment(DateFormat.parse(selectedRow.ValidFrom));
                //    datevalidationobj['lower'] = momentValidFrmDate.valueOf();
                // }
              }
              if (
                datevalidationobj.hasOwnProperty('lower') &&
                datevalidationobj.hasOwnProperty('upper')
              ) {
                let date1 = datevalidationobj['lower'].valueOf();
                let date2 = datevalidationobj['upper'].valueOf();
                if (date1 > date2) {
                  return callback(true);
                } else {
                  datevalidationobj = {};
                  return callback();
                }
              }
            }
          }
          return callback();
        },
      },
      {
        daterange: item.type == 'date' ? true : false,
        message: "Valid To and Valid From should be in range of Program's date Interval",
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          let isProgramItemScreen = window.location.href.indexOf('ProgramItem') > -1;
          if (isProgramItemScreen) {
            let datevalidationparentobj = JSON.parse(
              secureStorage.getItem('datevalidationparentobj') || 'null',
            )
              ? JSON.parse(secureStorage.getItem('datevalidationparentobj'))
              : {};
            if (rule.daterange && !notRequiredFields[id] && value) {
              if (rule.field === 'Valid From' || rule.field === 'Valid To') {
                if (rule.field === 'Valid From') {
                  datevalidationparentobj['ProgramItemValidFrom'] = value.startOf('day').valueOf();
                  secureStorage.setItem(
                    'datevalidationparentobj',
                    JSON.stringify(datevalidationparentobj),
                  );
                } else if (rule.field === 'Valid To') {
                  datevalidationparentobj['ProgramItemValidTo'] = value.startOf('day').valueOf();
                  secureStorage.setItem(
                    'datevalidationparentobj',
                    JSON.stringify(datevalidationparentobj),
                  );
                }
                if (
                  datevalidationparentobj.hasOwnProperty('ProgramItemValidFrom') ||
                  datevalidationparentobj.hasOwnProperty('ProgramItemValidTo')
                ) {
                  let programitemvalidFrom = datevalidationparentobj['ProgramItemValidFrom'];
                  let programitemvalidTo = datevalidationparentobj['ProgramItemValidTo'];

                  if (rule.field === 'Valid From') {
                    return callback();
                  } else if (rule.field === 'Valid To') {
                    return callback();
                  }
                }
              }
            }
            return callback();
          } else {
            return callback();
          }
        },
      },
      {
        maxLengthExceed: item.type == FieldTypes.String && item.maxLimitExceeded ? true : false,
        message: `${item.title}` + ' ' + 'should be a valid % value',
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          if (rule.maxLengthExceed) {
            if (!parseFloat(value) && value != 0) {
              return callback(true);
            }
            if (isNaN(Number(value))) {
              return callback(true);
            }
            if (parseFloat(value) > item.maxLimitExceeded) {
              return callback(true);
            }
          }
          return callback();
        },
      },
      {
        commaRestrict: item.type == FieldTypes.String && item.commaRestricted ? true : false,
        message: `${item.title}` + ' ' + 'cant have commas in it.',
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          if (rule.commaRestrict) {
            if (value.indexOf(',') > -1) {
              return callback(true);
            }
          }
          return callback();
        },
      },
      {
        minLength: item.type == FieldTypes.String && item.minLimit ? true : false,
        message: `${item.title}` + ' ' + 'should be a valid % value',
        transform: (value) => (value && value.trim && value.trim()) || value,
        validator: (rule, value, callback) => {
          if (rule.minLength == 0) {
            if (parseFloat(value) < item.minLimit) {
              return callback(true);
            }
          }
          return callback();
        },
      },
      {
        validateMsg: item.validateMsg && item.type === FieldTypes.Numeric,
        validator: (rule, value, callback) => {
          if (rule.validateMsg) {
            if (item.maxValueValidate < value) {
              return callback('Max supported limit is' + ' ' + item.maxValueValidate);
            }
            if (item.minValueValidate > value) {
              return callback('Min supported limit is' + ' ' + item.minValueValidate);
            }
          }
          return callback();
        },
      },
      {
        validateMsg: item.validateMsg && item.type === FieldTypes.Float && item.checkFloatValue,
        validator: (rule, value, callback) => {
          if (rule.validateMsg) {
            if (item.maxValueValidate < value) {
              return callback('Max supported limit is' + ' ' + item.maxValueValidate);
            }
            if (item.minValueValidate > value) {
              return callback('Min supported limit is' + ' ' + item.minValueValidate);
            }
          }
          return callback();
        },
      },

      {
        validateMsg: item.validateMsg && item.type === FieldTypes.Numeric && item.checkIntValue,
        validator: (rule, value, callback) => {
          if (rule.validateMsg) {
            if (!(value % 1 === 0)) {
              return callback('Value must be a integer number');
            }
          }
          return callback();
        },
      },
      {
        validateMsg: item.validateMsg && item.type === FieldTypes.Float && item.checkFloatValue,
        validator: (rule, value, callback) => {
          if (rule.validateMsg) {
            if (
              !/(^-?\d\d*\.\d\d*$)|(^-?\.[0-9]\d\d*$)/.test(value) &&
              value !== '' &&
              value !== null
            ) {
              return callback('Value must be a decimal number');
            }
          }
          return callback();
        },
      },
    ];
  };

  defaultButtonsRender = () => {
    const { mode } = this.props;

    if (mode === 'view') {
      return null;
    }

    return (
      <div
        className="form-footer-absolute"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '30px 24px', // Increased from 16px to 20px for better button visibility
          gap: '10px',
          backgroundColor: 'transparent',
          zIndex: 100,
        }}
      >
        {this.defaultButton().map((item, index) => {
          const isSubmitButton = item.buttonText.toLowerCase().includes('save');

          if (item.buttonText.toLowerCase().includes('cancel')) return null;

          return (
            <Tooltip title={item.buttonText} key={index}>
              <Button
                style={{
                  borderRadius: '6px',
                  border: 'none',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                  ...(isSubmitButton
                    ? { background: '#6941C6', color: 'white' }
                    : { background: '#F9FAFB', color: '#374151' }),
                }}
                onClick={() => item.onClick({ formPanel: this })}
              >
                {isSubmitButton ? 'Submit' : item.buttonText}
              </Button>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  defaultButton = () => {
    const { t, config, buttonClick, toggle } = this.props;
    let { saveAndNextButton, saveButtonText, customButtonsInForm } = config;
    let buttonsInForm = customButtonsInForm || {};

    let saveAndNextButtonObj = saveAndNextButton
      ? [
          {
            buttonText: t('Save & New'),
            onClick: () => this.onSave(false),
          },
        ]
      : [];

    if (saveButtonText == 'Add' && buttonClick == 'EDIT') {
      saveButtonText = 'Save';
    }
    if (buttonClick == 'CLONE') {
      saveButtonText = 'Clone';
    }

    let buttonsToMap = [
      ...saveAndNextButtonObj,
      ...(buttonsInForm.beforeSaveButton || []),
      {
        buttonText: saveButtonText || 'Save',
        onClick: () => this.onSave(true),
      },
      ...(buttonsInForm.afterSaveButton || []),
      ...(buttonsInForm.afterCancelButton || []),
    ];
    return buttonsToMap;
  };

  formItemStyles = (item) => {
    return item.customStyle;
  };

  // Method to check if a field should be shown based on conditional logic
  shouldShowField = (item) => {
    // Check for AMC-related date fields that should be conditionally visible
    if (
      item.dataIndex &&
      (item.dataIndex.toLowerCase().includes('amcstartdate') ||
        item.dataIndex.toLowerCase().includes('amc_start_date') ||
        item.dataIndex.toLowerCase().includes('amcenddate') ||
        item.dataIndex.toLowerCase().includes('amc_end_date') ||
        (item.title &&
          (item.title.toLowerCase().includes('amc start date') ||
            item.title.toLowerCase().includes('amc end date'))))
    ) {
      // Look for AMC switch field value in form state
      const amcSwitchValue =
        this.state['AMC'] ||
        this.state['amc'] ||
        this.state['IsAMC'] ||
        this.state['isAMC'] ||
        this.state['IsAmc'];

      // Only show AMC date fields if AMC switch is enabled
      return amcSwitchValue === true || amcSwitchValue === 'true' || amcSwitchValue === 'Y';
    }

    // For all other fields, show by default
    return true;
  };

  renderFieldCompoenent = (item) => {
    if (item.hideInForm) {
      return <></>;
    }

    const { hideField } = this.state;
    const { combos, buttonClick, apiIdentifier } = this.props;
    var id = item.dataIndex;
    var index = hideField.findIndex((hideItem) => hideItem === id);
    if (index >= 0) return;

    if (apiIdentifier === 'planogram') {
      if (buttonClick === 'ADD' || buttonClick === 'EDIT') {
        if (item.showForBulk) {
          return;
        }
      }
      if (buttonClick === 'BULK') {
        if (item.showForAdd) {
          return;
        }

        if (item.showOnImportToggle && !this.state['IsImportDefinition']) {
          return;
        }
      }
    }

    var value = '';
    value = typeof this.state[id] === 'undefined' ? null : this.state[id];
    var data = [],
      params = {};
    if (item.ParentRecordType) {
      params = {
        ParentRecordType: item.ParentRecordType,
        ScopeId: this.state[item.ScopeId],
      };
    }
    if (item.queryParams) {
      params = {
        [item.queryParams]: this.state[item.queryParams],
      };
    }
    if (item.comboType) {
      data = combos[item.comboType] || [];
      if (item.filterBy && this.state[item.filterBy]) {
        data = data.filter((dataitem) => dataitem[item.filterBy] === this.state[item.filterBy]);
      }
      if (item.filterWithParent) {
        let { mappingId } = item;
        if (!mappingId) mappingId = 'LookupId';
        let { combo, value, indexTofilter, parentMappingId } = item.filterWithParent;
        if (!parentMappingId) parentMappingId = 'LookupId';
        if (this.state[value] && this.state[value] !== '') {
          let parentCombo = combos[combo].filter(
            (filterItem) => filterItem[parentMappingId] === this.state[value],
          );
          if (parentCombo.length > 0) {
            parentCombo = parentCombo[0][indexTofilter].split(',').map((item) => parseInt(item));
            data = data.filter((item) => parentCombo.indexOf(item[mappingId]) >= 0);
          }
        }
      }
    }
    return this.renderReturnComponent(item, id, value, data, params);
  };

  renderReturnComponent = (item, id, value, data, params) => {
    const { t, activeRecordId, combos, stringComboVal } = this.props;
    // const { getFieldDecorator } = this.props.form;
    const isTargetColumn = item.type === 'textMax';
    // const customStyle = isTargetColumn ? { width: '100%', display: 'block', height: '500px' } : {};

    let disabledFields = item.disabledField
      ? item.disabledField
      : item.disabledFieldBasedonCondition && this.state.isDisabledField
        ? this.state.isDisabledField
        : false;

    if (item.enableisNewRecordCanBeAdded) {
      item.isNewRecordCanBeAdded = item.enableisNewRecordCanBeAdded();
    }
    return item.title === 'gutter' ? (
      <Col
        span={item.colSpan || this.defaultColSpan}
        style={{
          height: (item.rowSpan && item.rowSpan * 25) || this.defaultMinHeight,
        }}
      />
    ) : (
      <>
        {/* {isTargetColumn && <Row gutter={[16, 16]} />} */}

        <div
          key={item.title}
          className={`formitem_${item.dataIndex} modern-form-field`}
          style={{
            width: '100%',
            display:
              this.props.documentUploader &&
              (item.type === FieldTypes.FileUpload ||
                item.type === 'fileupload' ||
                item.dataIndex?.toLowerCase().includes('file'))
                ? 'none'
                : 'flex',
            flexDirection: 'column',
          }}
        >
          {!item.hideLabel && (
            <label
              style={{
                fontWeight: '500',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              {item.title}
              {item.isRequired && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
            </label>
          )}
          <Form.Item
            name={id}
            rules={this.getFieldRules(item, t, id)}
            initialValue={value}
            style={{
              margin: 0,
              width: '100%',
              // Hide file upload fields when documentUploader is enabled
              ...(this.props.documentUploader &&
              (item.type === FieldTypes.FileUpload ||
                item.type === 'fileupload' ||
                item.dataIndex?.toLowerCase().includes('file'))
                ? { display: 'none' }
                : {}),
            }}
          >
            <div
              className={
                item.isNewRecordCanBeAdded || item.InfoIconLabel || item.informationIcon
                  ? 'has-plus'
                  : ''
              }
              style={{
                width: '100%',
                position: 'relative',
              }}
            >
              <ReturnComponent
                item={item}
                disabled={disabledFields}
                recProps={this.props}
                recState={this.state}
                data={data}
                comboType={item.comboType}
                name={id}
                fieldValue={value}
                activeRecordId={activeRecordId}
                stringComboVal={stringComboVal}
                onChange={(newValue, type, options) => {
                  // Check if this is one of the fields that triggers calculation
                  const isPurchaseValue = id === 'PurchaseValue';
                  const isDepreciation = id === 'Depreciation';

                  // Always update the field first
                  if (item.onChange) {
                    item.onChange(
                      newValue,
                      value,
                      this.onChange.bind(null, id),
                      { formPanel: this },
                      options,
                    );
                  } else {
                    this.onChange(id, newValue, type);
                  }

                  // Auto-calculate AssetValue when PurchaseValue, Depreciation, or PurchaseDate changes
                  const isPurchaseDate = id === 'PurchaseDate';

                  if (isPurchaseValue || isDepreciation || isPurchaseDate) {
                    // Wait for state to update, then calculate
                    setTimeout(() => {
                      // Read all three values from state
                      const purchaseValue = parseFloat(this.state.PurchaseValue || 0) || 0;
                      const depValue = this.state.Depreciation || 0;
                      const depStr = String(depValue).replace('%', '').trim();
                      const depreciationPercent = parseFloat(depStr) || 0;
                      const purchaseDate = this.state.PurchaseDate;

                      // Calculate years since purchase
                      let yearsSincePurchase = 0;
                      if (purchaseDate) {
                        const purchaseMoment = moment(purchaseDate);
                        const currentMoment = moment();
                        yearsSincePurchase = currentMoment.diff(purchaseMoment, 'years', true); // true for decimal years
                        // Round to nearest year for calculation
                        yearsSincePurchase = Math.max(0, Math.floor(yearsSincePurchase));
                      }

                      // Calculate using compound depreciation formula
                      // AssetValue = PurchaseValue × (1 - Depreciation%)^Years
                      let assetValue = purchaseValue;
                      if (depreciationPercent > 0 && yearsSincePurchase > 0) {
                        const depreciationRate = depreciationPercent / 100;
                        assetValue =
                          purchaseValue * Math.pow(1 - depreciationRate, yearsSincePurchase);
                      }

                      // Round to 2 decimal places
                      assetValue = Math.round(assetValue * 100) / 100;

                      // Update AssetValue field
                      if (assetValue >= 0 && purchaseValue > 0) {
                        this.onChange('AssetValue', assetValue);
                      }
                    }, 200);
                  }
                }}
                params={params}
                translate={t}
              />
              {item.informationIcon && (
                <Tooltip title={item.information}>
                  <InfoIcon className={`add-record ${item.title}`} />
                </Tooltip>
              )}
              {item.isNewRecordCanBeAdded && (
                <>
                  plus-circle
                  <Modal
                    visible={this.state[item.modalProps.stateValue]}
                    footer={null}
                    destroyOnClose
                    width={1024}
                    onCancel={() => {
                      this.setState({
                        [item.modalProps.stateValue]: false,
                      });
                    }}
                  >
                    <ChildForm
                      combos={combos}
                      parentField={item}
                      isChild
                      selectedRow={{}}
                      selectedRows={[{}]}
                      activeRecordId={'NEW_RECORD'}
                      {...item.modalProps}
                      config={item.modalProps}
                      t={t}
                      toggle={() =>
                        this.setState({
                          [item.modalProps.stateValue]: !this.state[item.modalProps.stateValue],
                        })
                      }
                    />
                  </Modal>
                </>
              )}
            </div>
          </Form.Item>
        </div>
      </>
    );
  };

  getCollapseView = (item, index) => {
    const { validForm, collapseViewShow } = this.state;
    return (
      <Collapse defaultActiveKey={collapseViewShow}>
        <Panel
          header={
            <div className="header-collapse">
              <div className="header-title">{item.header}</div>
              <div className="header-second">
                {validForm[item.header] && (
                  <CheckCircleOutlineIcon style={{ color: '#10d210', float: 'right' }} />
                )}
                {validForm[item.header] !== undefined && !validForm[item.header] && (
                  <ErrorOutlineIcon style={{ color: 'yellow', float: 'right' }} />
                )}
              </div>
            </div>
          }
          style={{ background: getThemeColor(), color: '#ffffff' }}
          key={
            // For WorkOrder forms, always expand all sections
            this.props.config?.tableName === '10818' ||
            this.props.config?.entityName === 'WorkOrder' ||
            item.alwaysExpanded
              ? 'active'
              : index == 0 && !validForm[item.header]
                ? 'active'
                : validForm[item.header] !== undefined && !validForm[item.header]
                  ? 'active'
                  : 'deactive'
          }
        >
          <div
            className="form-grid-container"
            style={{
              gridTemplateColumns: item.gridColumns
                ? `repeat(${item.gridColumns}, 1fr)`
                : undefined,
            }}
          >
            {item.columns.map((ele) => (
              <div key={ele.dataIndex} className="form-field-wrapper">
                {this.renderFieldCompoenent(ele)}
              </div>
            ))}
          </div>
        </Panel>
      </Collapse>
    );
  };

  renderSnackbar = () => {
    const { color, message, snackBarVisible } = this.state;
    return (
      <Snackbar
        place="tc"
        color={color}
        message={message}
        open={snackBarVisible}
        close={color == 'danger' ? true : undefined}
        closeNotification={color == 'danger' ? () => this.setState({ snackBarVisible: false }) : ''}
      />
    );
  };

  renderBanner = () => {
    const { editBanner } = this.props.config;
    const { t } = this.props;
    let infoIconColor = editBanner?.infoIconColor || 'red';
    let backgroundColor = editBanner?.background || '#f2e3e3';
    let bannerText = editBanner?.text || '';
    return (
      <div style={{ display: 'flex', padding: '5px', background: backgroundColor }}>
        <div>
          <InfoIcon style={{ color: infoIconColor }}></InfoIcon>
        </div>
        <div
          style={{
            fontSize: '15px',
            color: infoIconColor,
            fontWeight: 'bold',
            paddingLeft: '10px',
          }}
        >
          {bannerText}
        </div>
      </div>
    );
  };

  defaultLoader = () => {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
        }}
      >
        <CircularProgress
          color="secondary"
          style={{ position: 'absolute', top: '50%', left: '50%' }}
        />
      </div>
    );
  };

  render() {
    // Enhance form config if enhanceFormConfig prop is provided
    let { columns } = this.props;
    if (this.props.enhanceFormConfig && typeof this.props.enhanceFormConfig === 'function') {
      const enhancedConfig = this.props.enhanceFormConfig({ ...this.props, columns });
      if (enhancedConfig && enhancedConfig.columns) {
        columns = enhancedConfig.columns;
      }
    }

    let { hideField, loading, validForm } = this.state;
    let {
      isFormTitle,
      t,
      buttonClick,
      selectedRows,
      isTabView,
      classes,
      isReadOnly,
      selectedRow,
      selectedRowParent,
      mode,
      combos,
      documentUploader = false,
    } = this.props;

    // Read-only detail layout
    if (mode === 'view') {
      // Helper to get display value for lookups
      const getDisplayValue = (item, value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (item.type === FieldTypes.Lookup) {
          let lookupOptions = [];
          if (item.options && Array.isArray(item.options) && item.options.length > 0) {
            lookupOptions = item.options;
          } else if (combos && item.comboType && Array.isArray(combos[item.comboType])) {
            lookupOptions = combos[item.comboType];
          }
          if (lookupOptions.length > 0) {
            let valToMatch = value;
            if (typeof value === 'object' && value !== null) {
              valToMatch = value.LookupId;
            }
            const found = lookupOptions.find((opt) => opt.LookupId === valToMatch);
            return found ? found.DisplayValue : 'N/A';
          }
          return 'N/A';
        }
        return value;
      };

      // Filter visible columns
      const visibleColumns = columns ? columns.filter((item) => !item.hideInForm) : [];
      // 4-column grid: each row has up to 4 fields
      const numRows = Math.ceil(visibleColumns.length / 4);
      const gridRows = [];
      for (let i = 0; i < numRows; i++) {
        gridRows.push(visibleColumns.slice(i * 4, i * 4 + 4));
      }

      // Single border for the whole form, grid layout
      return (
        <div
          style={{
            margin: '0',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {gridRows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                borderBottom: rowIdx < gridRows.length - 1 ? '1px solid #e5e7eb' : 'none',
                minHeight: 48,
              }}
            >
              {row.map((item, colIdx) => {
                const value = selectedRow ? selectedRow[item.dataIndex] : '';
                return (
                  <div
                    key={item.dataIndex || colIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRight: colIdx < 3 ? '1px solid #e5e7eb' : 'none',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}:
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#111827',
                        fontWeight: 400,
                        wordBreak: 'break-word',
                        flex: 1,
                      }}
                    >
                      {getDisplayValue(item, value)}
                    </span>
                  </div>
                );
              })}
              {/* Fill empty columns if not enough for last row */}
              {row.length < 4 &&
                Array.from({ length: 4 - row.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      padding: '12px 16px',
                      borderRight: idx < 3 - row.length ? '1px solid #e5e7eb' : 'none',
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        style={{
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        className={`${classes ? classes.antdIcon : ''} form-wrapper-main`}
      >
        {loading && this.defaultLoader()}
        {this.renderSnackbar()}

        {/* Scrollable content area */}
        <div
          className="form-content-scrollable"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: '100px',
          }}
        >
          {this.props.config?.editBanner && this.renderBanner()}
          {isFormTitle && (
            <h5
              style={{
                fontSize: '20px',
                marginBottom: '24px',
                color: '#374151',
                fontWeight: '600',
              }}
            >
              {isFormTitle}
            </h5>
          )}
          <div
            className={`modern-form-container formidentifier_${this.props.identifier} drawer-form`}
            data-entity={this.props.config?.entityName}
            data-table={this.props.config?.tableName}
            data-is-child={this.props.config?.isChild ? 'true' : 'false'}
            style={{
              border: 'none',
              boxShadow: 'none',
              padding: '0',
              borderRadius: '0',
              background: 'transparent',
            }}
          >
            <Form
              name="simpleForm"
              form={this.props.form}
              style={{
                display: 'contents',
              }}
            >
              {/* Render custom content at the top of the form */}
              {this.props.config?.customContent &&
                typeof this.props.config.customContent === 'function' && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                    {this.props.config.customContent({
                      selectedRow: this.props.selectedRow,
                      form: this.props.form,
                      onReload: () => this.forceUpdate(),
                    })}
                  </div>
                )}
              <div
                className={`form-grid-container ${this.props.identifier === '10738' ? 'asset-form-grid' : ''}`}
              >
                {columns &&
                  (() => {
                    // Separate fields by type and description
                    const regularFields = [];
                    const descriptionFields = [];
                    const richTextFields = [];
                    const imageFields = [];
                    const collapsibleFields = [];
                    const assetValueFields = []; // New array for AMC Due Date, PurchaseDate, PurchaseValue, Depreciation, AssetValue
                    let amcFieldIndex = -1; // Track AMC field position

                    columns.forEach((item, index) => {
                      // Separate AMC Due Date and the 4 asset value fields to appear after AMC toggle
                      if (
                        item.dataIndex === 'AMCEndDate' ||
                        item.dataIndex === 'PurchaseDate' ||
                        item.dataIndex === 'PurchaseValue' ||
                        item.dataIndex === 'Depreciation' ||
                        item.dataIndex === 'AssetValue'
                      ) {
                        // Make AssetValue disabled (it's auto-calculated)
                        if (item.dataIndex === 'AssetValue') {
                          const modifiedItem = { ...item, disabledField: true };
                          assetValueFields.push({ item: modifiedItem, index });
                        } else {
                          assetValueFields.push({ item, index });
                        }
                      } else if (item.type === 'textMax') {
                        richTextFields.push({ item, index });
                      } else if (item.type === 'imageUpload') {
                        imageFields.push({ item, index });
                      } else if (item.isCollapse) {
                        // Treat collapse sections as full-width to stack them vertically
                        collapsibleFields.push({ item, index });
                      } else if (item.title && item.title.toLowerCase().includes('description')) {
                        // Convert description fields to textarea type and treat as full-width
                        const modifiedItem = { ...item, type: FieldTypes.TextArea, rowSpan: 4 };
                        descriptionFields.push({ item: modifiedItem, index });
                      } else {
                        if (!item.hideInForm) {
                          // Check for conditional visibility based on AMC switch
                          const shouldShowField = this.shouldShowField(item);
                          if (shouldShowField) {
                            regularFields.push({ item, index });
                            // Track AMC field position
                            if (item.dataIndex === 'IsAmc') {
                              amcFieldIndex = regularFields.length - 1;
                            }
                          }
                        }
                      }
                    });

                    return (
                      <>
                        {/* Render regular fields in two-column grid, with asset value fields inserted after AMC */}
                        {regularFields.map(({ item, index }, idx) => (
                          <React.Fragment key={index}>
                            <div className="form-field-wrapper">
                              {item.isCollapse
                                ? this.getCollapseView(item, index)
                                : this.renderFieldCompoenent(item)}
                            </div>
                            {/* Insert asset value fields right after AMC toggle */}
                            {idx === amcFieldIndex && assetValueFields.length > 0 && (
                              <>
                                {assetValueFields.map(({ item: assetItem, index: assetIndex }) => {
                                  // Check if field should be shown (for conditional fields like AMC Due Date)
                                  const shouldShow = this.shouldShowField(assetItem);
                                  if (!shouldShow) return null;

                                  return (
                                    <div key={assetIndex} className="form-field-wrapper">
                                      {assetItem.isCollapse
                                        ? this.getCollapseView(assetItem, assetIndex)
                                        : this.renderFieldCompoenent(assetItem)}
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </React.Fragment>
                        ))}
                        {/* For asset forms, show image and description side by side in a single row */}
                        {this.props.identifier === '10738' && imageFields.length > 0 && (
                          <div
                            style={{
                              gridColumn: '1 / -1',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '16px',
                              marginBottom: '16px',
                            }}
                          >
                            {/* Description field - right side */}
                            {descriptionFields.map(({ item, index }) => (
                              <div
                                key={`desc-${index}`}
                                className="asset-description-field"
                                style={{ width: '100%' }}
                              >
                                <div className="form-field-wrapper" style={{ height: '100%' }}>
                                  {item.isCollapse
                                    ? this.getCollapseView(item, index)
                                    : this.renderFieldCompoenent(item)}
                                </div>
                              </div>
                            ))}
                            {/* Image field - left side */}
                            {imageFields.map(({ item, index }) => (
                              <div
                                key={index}
                                className="asset-image-field"
                                style={{ width: '100%' }}
                              >
                                <div className="form-field-wrapper" style={{ height: '100%' }}>
                                  {item.isCollapse
                                    ? this.getCollapseView(item, index)
                                    : this.renderFieldCompoenent(item)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Original image fields for non-asset forms */}
                        {this.props.identifier !== '10738' &&
                          imageFields.map(({ item, index }) => (
                            <div key={index} className="form-field-full-width">
                              {item.isCollapse
                                ? this.getCollapseView(item, index)
                                : this.renderFieldCompoenent(item)}
                            </div>
                          ))}

                        {/* Render description fields after regular fields - full width */}
                        {this.props.identifier !== '10738' &&
                          descriptionFields.map(({ item, index }) => (
                            <div key={`desc-${index}`} className="form-field-full-width">
                              {item.isCollapse
                                ? this.getCollapseView(item, index)
                                : this.renderFieldCompoenent(item)}
                            </div>
                          ))}

                        {/* Render collapse fields */}
                        {collapsibleFields.map(({ item, index }) => (
                          <div key={index} className="form-field-full-width">
                            {item.isCollapse
                              ? this.getCollapseView(item, index)
                              : this.renderFieldCompoenent(item)}
                          </div>
                        ))}

                        {/* Render rich text fields last */}
                        {richTextFields.map(({ item, index }) => (
                          <div key={index} className="form-field-full-width">
                            {item.isCollapse
                              ? this.getCollapseView(item, index)
                              : this.renderFieldCompoenent(item)}
                          </div>
                        ))}
                      </>
                    );
                  })()}
              </div>

              {documentUploader && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <DocumentUploader
                    onFilesChange={(files) => {
                      this.documents = [...files];
                      // Call onFilesChange from config if it exists
                      if (
                        this.props.config &&
                        typeof this.props.config.onFilesChange === 'function'
                      ) {
                        this.props.config.onFilesChange(files);
                      }
                      // Also call onFilesChange from props for backward compatibility
                      if (this.props.onFilesChange) {
                        this.props.onFilesChange(files);
                      }
                    }}
                  />
                </div>
              )}
              {this.props.customContent && (
                <div style={{ gridColumn: '1 / -1' }}>{this.props.customContent}</div>
              )}
            </Form>
            {this.props.config?.renderCustomContent &&
              this.props.config.renderCustomContent(
                () => {
                  this.forceUpdate();
                },
                {
                  selectedRow: this.props.selectedRow,
                  form: this.props.form,
                  toggle: this.props.toggle,
                  toogle: this.props.toogle,
                  onClose: this.props.onClose,
                  // Add any other relevant form props here
                },
              )}
          </div>
        </div>

        {/* Fixed footer outside scroll area */}
        {this.defaultButtonsRender()}

        {/* Success Modal */}
        <SuccessModal
          open={this.state.showSuccessModal}
          onClose={this.handleCloseSuccessModal}
          title={this.getSuccessModalContent().title}
          message={this.getSuccessModalContent().message}
          buttonText="Dismiss"
          iconType="success"
        />
      </div>
    );
  }
}

SimpleForm.defaultProps = {
  identifier: '220',
  columns: [],
  documentUploader: false,
};

const ChildForm = connect()(
  class extends React.Component {
    render() {
      return <SimpleForm {...this.props} name="ChildForm" />;
    }
  },
);
const mapsStateToProps = ({ combos }) => {
  return { combos };
};

export default connect(mapsStateToProps)((props) => {
  const [form] = Form.useForm();
  return (
    <div
      sx={{
        '& .anticon': {
          color: getThemeColor(),
        },
      }}
    >
      <SimpleForm form={form} {...props} />
    </div>
  );
});

export { SimpleForm as SimpleFormClass, ReturnComponent };
