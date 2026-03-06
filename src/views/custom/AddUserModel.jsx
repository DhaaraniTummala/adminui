import { useState, useEffect } from 'react';
import { Drawer, Button, message, Modal, Switch, Checkbox, Typography } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CustomSelect from '../../components/maiden-core/ui-components/custom-select';
import { CustomDateInput } from '../../components/maiden-core/ui-components';
import API from '../../store/requests';
import SuccessModal from '../../components/common/SuccessModal';
import CustomDrawer from '../../components/common/CustomDrawer';
import { MdErrorOutline } from 'react-icons/md';
import moment from 'moment';

const { Text } = Typography;
AddNewUserModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  toggle: PropTypes.func,
  combos: PropTypes.object,
  onSuccess: PropTypes.func,
  activeRecordId: PropTypes.string,
  initialData: PropTypes.object,
  onSave: PropTypes.func,
};

function AddNewUserModal({
  visible,
  toggle,
  combos,
  onSuccess,
  activeRecordId,
  initialData,
  onSave,
}) {
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [section, setSection] = useState(null);

  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState(null);
  const [joiningDate, setJoiningDate] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingResponseData, setPendingResponseData] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Permissions state
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [screens, setScreens] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const phoneRegex = /^\d{10}$/;

  const isEdit = activeRecordId !== 'NEW_RECORD';

  // Fetch available screens/menus for permissions
  const fetchScreens = async () => {
    try {
      setLoadingScreens(true);
      const response = await API.triggerPost('Plant', {
        action: 'JsonRequest',
        RequestType: 'Admin_UserRole_Get',
        InputJson: JSON.stringify({}),
      });

      if (response?.data?.success) {
        setScreens(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoadingScreens(false);
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      const [roleId, type] = permissionId.split('_');

      if (checked) {
        updated[permissionId] = true;
        // If edit is checked, automatically check view
        if (type === 'edit') {
          updated[`${roleId}_view`] = true;
        }
      } else {
        delete updated[permissionId];
        // If view is unchecked, also uncheck edit
        if (type === 'view') {
          delete updated[`${roleId}_edit`];
        }
      }

      return updated;
    });
  };

  // Handle drawer close
  const handleClose = () => {
    // Don't clear cache here - let it persist so permissions show when reopening
    // The cache will naturally be overwritten when permissions are updated
    toggle();
  };

  useEffect(() => {
    if (visible) {
      // Clear validation errors and success modal when drawer opens
      setErrors({});
      setSuccessModalOpen(false);

      if (isEdit && initialData) {
        // Store the display ID for showing in the form
        setUserId(initialData.UserLabelId || '');
        setFullName(initialData.Name || '');
        setEmail(initialData.Email || '');
        setPhone(initialData.Phone || '');
        setDesignation(initialData.Designation || '');
        setJoiningDate(initialData.JoiningDate ? moment(initialData.JoiningDate) : null);
        if (combos['10739']) {
          const sec = combos['10739'].find((s) => s.LookupId === initialData.SectionTypeId);
          setSection(sec || null);
        }
        if (combos['10742']) {
          const loc = combos['10742'].find((l) => l.LookupId === initialData.LocationTypeId);
          setLocation(loc || null);
        }
        const adminStatus = initialData.IsAdmin || false;
        setIsAdmin(adminStatus);

        // Always fetch screens in edit mode (needed for when user toggles IsAdmin)
        fetchScreens();

        // Load existing permissions from cache or initialData (for non-admin users)
        if (!adminStatus) {
          const cacheKey = `user_${activeRecordId}_permissions`;
          let parsedRoles = [];
          let loadedFromCache = false;

          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              const parsedCache = JSON.parse(cached);
              parsedRoles = parsedCache.permissions || [];
              loadedFromCache = true;
            }
          } catch (e) {
            console.error('Error reading permissions cache:', e);
          }

          // Only use initialData.UserRoleJson if NO cache exists
          if (!loadedFromCache && initialData.UserRoleJson) {
            try {
              parsedRoles =
                typeof initialData.UserRoleJson === 'string'
                  ? JSON.parse(initialData.UserRoleJson)
                  : initialData.UserRoleJson;
            } catch (err) {
              console.error('Invalid UserRoleJson format', err);
            }
          }

          // Map saved roles to checkbox states
          if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
            const permissions = {};
            parsedRoles.forEach((role) => {
              if (role.IsView || role.IsView === 1) {
                permissions[`${role.PlantMenuId}_view`] = true;
              }
              if (role.IsEdit || role.IsEdit === 1) {
                permissions[`${role.PlantMenuId}_edit`] = true;
              }
            });
            setSelectedPermissions(permissions);
          } else {
            setSelectedPermissions({});
          }
        } else {
          // Clear permissions for admin users
          setSelectedPermissions({});
        }
      } else {
        // Add mode - reset all fields
        setUserId('');
        setFullName('');
        setEmail('');
        setPhone('');
        setSection(null);
        setDesignation('');
        setLocation(null);
        setJoiningDate(null);
        setIsAdmin(false);
        setSelectedPermissions({});

        // Fetch screens for add mode too
        fetchScreens();
      }
    }
  }, [visible, isEdit, activeRecordId, initialData, combos]);

  const handleSubmit = async () => {
    // Clear previous validation errors
    const newErrors = {};

    // Validate all required fields
    if (!fullName) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!email) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone) {
      newErrors.phone = 'Contact Number is required';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Contact Number must be exactly 10 digits';
    }

    // Only validate Section and Location if user is NOT admin
    if (!isAdmin) {
      if (!section) {
        newErrors.section = 'Section is required';
      }

      if (!location) {
        newErrors.location = 'Location is required';
      }
    }

    // Always validate Designation
    if (!designation) {
      newErrors.designation = 'Designation is required';
    }

    if (!joiningDate) {
      newErrors.joiningDate = 'Joining Date is required';
    }

    // If there are validation errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    setSubmitting(true);
    try {
      // Build user info object
      const userInfo = {
        ...(isEdit && { UserId: activeRecordId }),
        Email: email,
        FullName: fullName,
        Phone: phone,
        SectionTypeId: section?.LookupId,
        LocationTypeId: location?.LookupId,
        Designation: designation,
        JoiningDate: joiningDate ? joiningDate.format('YYYY-MM-DD') : null,
        IsAdmin: isAdmin,
      };

      // Include permissions for non-admin users (both add and edit mode)
      if (!isAdmin) {
        // Convert selectedPermissions to UserRoleJson format
        const rolePermissions = {};
        Object.entries(selectedPermissions).forEach(([key, isSelected]) => {
          if (!isSelected) return;

          const [roleId, type] = key.split('_');

          if (!rolePermissions[roleId]) {
            rolePermissions[roleId] = {
              PlantMenuId: parseInt(roleId),
              IsView: 0,
              IsEdit: 0,
            };
          }

          if (type === 'view') rolePermissions[roleId].IsView = 1;
          if (type === 'edit') {
            rolePermissions[roleId].IsEdit = 1;
            rolePermissions[roleId].IsView = 1;
          }
        });

        const finalUserRole = Object.values(rolePermissions);
        userInfo.UserRoleJson = finalUserRole;

        // Update cache with latest permissions (only in edit mode)
        if (isEdit) {
          const cacheKey = `user_${activeRecordId}_permissions`;
          const cacheData = {
            permissions: finalUserRole,
            lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }
      }

      const payload = {
        action: 'JsonRequest',
        RequestType: 'Admin_UserAdd',
        InputJson: JSON.stringify({
          UserInfo: [userInfo],
        }),
      };

      const response = await API.triggerPost('Plant', payload);
      if (response?.data?.success) {
        // Keep the cache updated with the data we just sent
        // This ensures permissions show correctly when reopening, even if LoadView doesn't return them
        if (isEdit && userInfo.UserRoleJson) {
          const cacheKey = `user_${activeRecordId}_permissions`;
          const cacheData = {
            permissions: userInfo.UserRoleJson,
            lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }

        // Store response data for later use
        setPendingResponseData(response.data);

        // Show success modal
        setSuccessMessage(isEdit ? 'User Updated Successfully!' : 'User Added Successfully!');
        setSuccessModalOpen(true);

        // Close the form drawer
        toggle();
      } else {
        // Handle specific error messages from API
        const errorMessage =
          response?.data?.data ||
          response?.data?.info ||
          `Failed to ${isEdit ? 'update' : 'add'} user`;

        // Check if it's an email already exists error
        if (errorMessage.toLowerCase().includes('email already exists')) {
          setErrorMessage('Email Already Exists.');
          setErrorModalOpen(true);
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} user:`, error);
      message.error(`Error ${isEdit ? 'updating' : 'adding'} user. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const title = activeRecordId === 'NEW_RECORD' ? 'Add User' : 'Edit User';

  return (
    <>
      <style>{`
        /* Custom scrollbar styles */
        .custom-scrollbarr::-webkit-scrollbar {
          width: 8px;
          height:20px;
        }
        .custom-scrollbarr::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbarr::-webkit-scrollbar-thumb {
          background: #6941C6;
          border-radius: 4px;
        }
        .custom-scrollbarr::-webkit-scrollbar-thumb:hover {
          background: #6941C6;
        }
        
        /* Custom checkbox styles */
        .ant-checkbox-wrapper {
          display: inline-flex;
          align-items: center;
        }
        .ant-checkbox {
          top: 0;
        }
        .ant-checkbox-inner {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid rgb(209, 213, 219) !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #6941C6 !important;
          border-color: #6941C6 !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner::after {
          border: 2px solid #fff !important;
          border-top: 0 !important;
          border-left: 0 !important;
          width: 5px;
          height: 9px;
          transform: rotate(45deg) scale(1) translate(-50%, -50%);
          position: absolute;
          top: 50%;
          left: 22%;
        }
        .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .ant-checkbox:hover .ant-checkbox-inner {
          border-color: #6941C6 !important;
        }
        .ant-checkbox-input:focus + .ant-checkbox-inner {
          border-color: #6941C6 !important;
        }
        
        /* Date picker styles */
        .css-1hgcujo-MuiPickersInputBase-root-MuiPickersOutlinedInput-root {
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          font-weight: 400;
          font-size: 1rem;
          line-height: 1.5;
          letter-spacing: 0.00938em;
          color: rgba(0, 0, 0, 0.87);
          cursor: text;
          padding: 0;
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-pack: start;
          -ms-flex-pack: start;
          -webkit-justify-content: flex-start;
          justify-content: flex-start;
          -webkit-align-items: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          position: relative;
          box-sizing: border-box;
          width: 100%;
          padding: 0 14px;
          border-radius: 4px;
          height:48px;
            background: #ffffff;
        }
        
        /* Drawer content wrapper */
        .drawer-content-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background-color: #ffffff;
        }
        
       
        
        /* Fixed footer */
        .fixed-footer {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 24px;   
          background: #fff;
       border-top: 0px solid #ffffff;
         
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
        title={title}
        open={visible}
        onClose={handleClose}
        width={1100}
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
        className="custom-scrollbarr"
      >
        <div className="drawer-content-wrapper" style={{ height: '100%' }}>
          <div
            className="scrollable-content custom-scrollbarr"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px',
              paddingBottom: '80px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '20px',
                minWidth: 0,
                width: '100%',
                alignItems: 'flex-start',
              }}
            >
              {/* Left side: User form */}
              <div
                style={{
                  flex: !isAdmin ? '0 0 60%' : '1',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '15px' }}>
                    Personal Information
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr',
                      gap: '24px',
                      marginBottom: '20px',
                    }}
                  >
                    {isEdit && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                          User ID <span style={{ color: 'red' }}>*</span>
                        </p>
                        <input
                          type="text"
                          placeholder="Enter User ID"
                          value={userId}
                          disabled={isEdit}
                          onChange={(e) => setUserId(e.target.value)}
                          style={{
                            width: '100%',
                            height: '50px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0 14px',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: isEdit ? '#f5f5f5' : '#FFFFFF',
                            transition: 'border-color 0.15s ease-in-out',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                        Full Name <span style={{ color: 'red' }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Enter Full Name"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrors((prevErrors) => {
                            const newErrors = { ...prevErrors };
                            delete newErrors.fullName;
                            return newErrors;
                          });
                        }}
                        style={{
                          width: '100%',
                          height: '50px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '0 14px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                          transition: 'border-color 0.15s ease-in-out',
                        }}
                      />
                      {errors.fullName && (
                        <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                        Email Address <span style={{ color: 'red' }}>*</span>
                      </p>
                      <input
                        type="email"
                        placeholder="eg. jhone@sab.gov.sa"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prevErrors) => {
                            const newErrors = { ...prevErrors };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }}
                        disabled={isEdit}
                        style={{
                          width: '100%',
                          height: '50px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '0 14px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          backgroundColor: isEdit ? '#f5f5f5' : '#FFFFFF',
                          transition: 'border-color 0.15s ease-in-out',
                        }}
                      />
                      {errors.email && (
                        <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                        Contact Number <span style={{ color: 'red' }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Enter 10 Digit Mobile Number"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow digits
                          if (/^\d*$/.test(value)) {
                            setPhone(value);
                            setErrors((prevErrors) => {
                              const newErrors = { ...prevErrors };
                              delete newErrors.phone;
                              return newErrors;
                            });
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '50px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '0 14px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                          transition: 'border-color 0.15s ease-in-out',
                        }}
                      />
                      {errors.phone && (
                        <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '15px' }}>
                    Professional Information
                  </p>

                  {/* Row 1: Section | Location (hide both if admin) */}
                  {!isAdmin && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '24px',
                        marginBottom: '20px',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                          Section <span style={{ color: 'red' }}>*</span>
                        </p>
                        <CustomSelect
                          name="section"
                          title="Section"
                          options={combos['10739'] || []}
                          mappingId="LookupId"
                          value={section?.LookupId || null}
                          onChange={(value) => {
                            setSection(
                              (combos['10739'] || []).find((s) => s.LookupId === value) || null,
                            );
                            setErrors((prevErrors) => {
                              const newErrors = { ...prevErrors };
                              delete newErrors.section;
                              return newErrors;
                            });
                          }}
                        />
                        {errors.section && (
                          <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                            {errors.section}
                          </p>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                          Location <span style={{ color: 'red' }}>*</span>
                        </p>
                        <CustomSelect
                          name="location"
                          title="Location"
                          options={combos['10742'] || []}
                          mappingId="LookupId"
                          value={location?.LookupId || null}
                          onChange={(value) => {
                            setLocation(
                              (combos['10742'] || []).find((l) => l.LookupId === value) || null,
                            );
                            setErrors((prevErrors) => {
                              const newErrors = { ...prevErrors };
                              delete newErrors.location;
                              return newErrors;
                            });
                          }}
                        />
                        {errors.location && (
                          <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                            {errors.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Row 2: Designation | Joining Date (always show in 2 columns) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                        Designation <span style={{ color: 'red' }}>*</span>
                      </p>
                      <input
                        type="text"
                        placeholder="Enter Designation"
                        value={designation}
                        onChange={(e) => {
                          setDesignation(e.target.value);
                          setErrors((prevErrors) => {
                            const newErrors = { ...prevErrors };
                            delete newErrors.designation;
                            return newErrors;
                          });
                        }}
                        style={{
                          width: '100%',
                          height: '50px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '0 14px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                          transition: 'border-color 0.15s ease-in-out',
                        }}
                      />
                      {errors.designation && (
                        <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                          {errors.designation}
                        </p>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 500, marginBottom: '8px' }}>
                        Joining Date <span style={{ color: 'red' }}>*</span>
                      </p>
                      <CustomDateInput
                        className="custom-date-input"
                        value={joiningDate}
                        onChange={(date) => {
                          setJoiningDate(date);
                          setErrors((prevErrors) => {
                            const newErrors = { ...prevErrors };
                            delete newErrors.joiningDate;
                            return newErrors;
                          });
                        }}
                        placeholder="Select Joining Date"
                      />
                      {errors.joiningDate && (
                        <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>
                          {errors.joiningDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '20px',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>Admin</p>
                    <Switch
                      checked={isAdmin}
                      onChange={(checked) => setIsAdmin(checked)}
                      style={{
                        backgroundColor: isAdmin ? '#6941C6' : '#d1d5db',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right side: Permissions (show for non-admin users in both add and edit mode) */}
              {!isAdmin && (
                <div
                  style={{
                    flex: '0 0 35%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>
                    Permissions
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      maxHeight: '415px',
                    }}
                  >
                    {/* Table header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        background: '#6941c6',
                        color: '#fff',
                        padding: '12px 16px',
                        fontWeight: 500,
                        border: '1px solid rgb(209, 213, 219)',
                        borderRadius: '6px 6px 0 0',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      <div>Menu</div>
                      <div style={{ textAlign: 'center' }}>View</div>
                      <div style={{ textAlign: 'center' }}>Edit</div>
                    </div>

                    {/* Scrollable permissions list */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        border: '1px solid rgb(209, 213, 219)',
                        borderTop: 'none',
                        borderRadius: '0 0 6px 6px',
                        minHeight: 0,
                      }}
                      className="custom-scrollbarr"
                    >
                      {loadingScreens ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                      ) : screens.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                          No menus available
                        </div>
                      ) : (
                        screens.map((screen) => (
                          <div
                            key={screen.PlantMenuId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1fr',
                              padding: '15px 16px',
                              borderBottom: '1px solid #F0F0F0',
                              fontSize: '13px',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                paddingRight: '8px',
                              }}
                            >
                              {screen.DisplayName}
                            </div>

                            <div
                              style={{
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Checkbox
                                checked={selectedPermissions[`${screen.PlantMenuId}_view`] || false}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    `${screen.PlantMenuId}_view`,
                                    e.target.checked,
                                  )
                                }
                              />
                            </div>
                            <div
                              style={{
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Checkbox
                                checked={selectedPermissions[`${screen.PlantMenuId}_edit`] || false}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    `${screen.PlantMenuId}_edit`,
                                    e.target.checked,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="fixed-footer" style={{ padding: '16px 24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                style={{
                  backgroundColor: '#6941C6',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 20px',
                  fontWeight: 500,
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </CustomDrawer>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          // Trigger page refresh/reload after user closes the modal
          if (onSuccess) onSuccess();
          if (onSave && pendingResponseData) onSave(pendingResponseData);
          setPendingResponseData(null);
        }}
        title={successMessage}
        iconType="success"
      />

      {/* Error Modal */}
      <Modal
        title=""
        open={errorModalOpen}
        onOk={() => setErrorModalOpen(false)}
        onCancel={() => setErrorModalOpen(false)}
        centered
        width={500}
        style={{
          borderRadius: '12px',
        }}
        bodyStyle={{
          padding: '32px 0px',
        }}
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
          }}
        >
          <MdErrorOutline style={{ fontSize: '20px', color: '#DC2626' }} />
          <span style={{ fontSize: '16px', color: '#000', lineHeight: '1.6' }}>{errorMessage}</span>
        </div>
      </Modal>
    </>
  );
}

const mapStateToProps = ({ combos }) => {
  return { combos };
};

export default connect(mapStateToProps)(AddNewUserModal);
