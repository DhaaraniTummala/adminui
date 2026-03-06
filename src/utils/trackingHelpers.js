/**
 * Shared utilities for Vehicle and Visitor Tracking
 */

/**
 * Enhances form config to split DateTime fields into separate Date and Time fields
 * @param {Object} config - The form configuration object
 * @returns {Object} Enhanced configuration
 */
export const enhanceTrackingFormConfig = (config) => {
  if (!config || !config.columns) return config;

  const inDateTimeIndex = config.columns.findIndex((col) => col.dataIndex === 'InDateTime');
  const outDateTimeIndex = config.columns.findIndex((col) => col.dataIndex === 'OutDateTime');

  if (inDateTimeIndex !== -1) {
    const inDateTimeField = config.columns[inDateTimeIndex];
    config.columns.splice(
      inDateTimeIndex,
      1,
      {
        ...inDateTimeField,
        dataIndex: 'InDate',
        title: 'In Date',
        label: 'In Date',
        type: 'date',
        fieldType: 'date',
        required: false, // Optional - will auto-populate with current date if not provided
      },
      {
        ...inDateTimeField,
        dataIndex: 'InTime',
        title: 'In Time',
        label: 'In Time',
        type: 'time',
        fieldType: 'time',
        required: false, // Optional - will auto-populate with current time if not provided
      },
    );
  }

  if (outDateTimeIndex !== -1) {
    const actualIndex =
      outDateTimeIndex >= inDateTimeIndex ? outDateTimeIndex + 1 : outDateTimeIndex;
    const outDateTimeField = config.columns[actualIndex];
    if (outDateTimeField) {
      config.columns.splice(
        actualIndex,
        1,
        {
          ...outDateTimeField,
          dataIndex: 'OutDate',
          title: 'Out Date',
          label: 'Out Date',
          type: 'date',
          fieldType: 'date',
          required: outDateTimeField.required,
        },
        {
          ...outDateTimeField,
          dataIndex: 'OutTime',
          title: 'Out Time',
          label: 'Out Time',
          type: 'time',
          fieldType: 'time',
          required: outDateTimeField.required,
        },
      );
    }
  }

  return config;
};

/**
 * Formats a date object to local DateTime string for API
 * @param {Date} date - The date object to format
 * @returns {string} Formatted datetime string (YYYY-MM-DDTHH:mm:ss)
 */
const formatLocalDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Combines separate Date and Time fields back into DateTime before saving
 * @param {Object} payload - The payload object to modify
 * @param {Object} formValues - The form values containing date and time fields
 * @returns {boolean} Always returns true to allow save to proceed
 */
export const beforeTrackingSave = (payload, formValues) => {
  // Handle InDateTime - combine Date/Time fields OR use current timestamp
  if (formValues.InDate && formValues.InTime) {
    // User provided both date and time
    const inDate = new Date(formValues.InDate);
    const [hours, minutes] = formValues.InTime.split(':');
    inDate.setHours(parseInt(hours), parseInt(minutes), 0);
    payload.InDateTime = formatLocalDateTime(inDate);
    delete payload.InDate;
    delete payload.InTime;
  } else if (!payload.InDateTime) {
    // No InDateTime provided - automatically set to current time (IST)
    const now = new Date();
    payload.InDateTime = formatLocalDateTime(now);
  }

  // Handle OutDateTime - only if user provided both date and time
  if (formValues.OutDate && formValues.OutTime) {
    const outDate = new Date(formValues.OutDate);
    const [hours, minutes] = formValues.OutTime.split(':');
    outDate.setHours(parseInt(hours), parseInt(minutes), 0);
    payload.OutDateTime = formatLocalDateTime(outDate);
    delete payload.OutDate;
    delete payload.OutTime;
  }

  return true;
};
