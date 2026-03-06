import React, { useState, useEffect } from 'react';
import { Checkbox, Input, Typography, Button, message, Divider, ConfigProvider } from 'antd';
import CustomDrawer from '@/components/common/CustomDrawer';
import API from '@/store/requests';

const { Text } = Typography;

const UserPermissionsDrawer = ({ visible, onClose, onSuccess, userId, userLabelId, isEdit = false, userRoleJson }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  console.log("userRoleJson in Drawer:", userRoleJson);
  console.log("userRoleJson in selectedPermissions:", selectedPermissions);

  const fetchScreens = async () => {
    try {
      setLoading(true);
      const response = await API.triggerPost('Plant', {
        action: 'JsonRequest',
        RequestType: 'Admin_UserRole_Get',
        InputJson: JSON.stringify({})
      });

      if (response?.data?.success) {
        setScreens(response.data.data || []);
      }
    } catch (error) {
      message.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userId && userId !== 'NEW_RECORD') {
      setSelectedPermissions({});
      fetchScreens();

      // ALWAYS prioritize cache over userRoleJson prop
      // Cache contains the most recent changes, even if backend hasn't updated yet
      const cacheKey = `user_${userId}_permissions`;
      let parsedRoles = [];
      let loadedFromCache = false;

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          parsedRoles = parsedCache.permissions || [];
          loadedFromCache = true;
          console.log('✅ Loaded permissions from cache (most recent):', parsedRoles);
        }
      } catch (e) {
        console.error('Error reading permissions cache:', e);
      }

      // Only use userRoleJson prop if NO cache exists
      if (!loadedFromCache && userRoleJson) {
        try {
          parsedRoles = typeof userRoleJson === "string"
            ? JSON.parse(userRoleJson)
            : userRoleJson;
          console.log('📦 Loaded permissions from database (userRoleJson prop):', parsedRoles);
        } catch (err) {
          console.error("Invalid UserRoleJson format", err);
        }
      }

      // Map saved roles to checkbox states
      if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
        const permissions = {};

        parsedRoles.forEach(role => {
          if (role.IsView || role.IsView === 1) {
            permissions[`${role.PlantMenuId}_view`] = true;
          }
          if (role.IsEdit || role.IsEdit === 1) {
            permissions[`${role.PlantMenuId}_edit`] = true;
          }
        });

        setSelectedPermissions(permissions);
        console.log('✅ Set selected permissions:', permissions);
      }
    }
  }, [visible, userId]);


  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      const [roleId, type] = permissionId.split("_");

      if (checked) {
        updated[permissionId] = true;

        if (type === "edit") {
          updated[`${roleId}_view`] = true;
        }
      } else {
        delete updated[permissionId];

        if (type === "view") {
          delete updated[`${roleId}_edit`];
        }
      }

      return updated;
    });
  };

  const handleSubmit = () => {
    console.log('handleSubmit - selectedPermissions:', selectedPermissions);
    const rolePermissions = {};
    Object.entries(selectedPermissions).forEach(([key, isSelected]) => {
      if (!isSelected) return;

      const [roleId, type] = key.split('_');

      if (!rolePermissions[roleId]) {
        rolePermissions[roleId] = {
          PlantMenuId: parseInt(roleId),
          IsView: 0,
          IsEdit: 0
        };
      }

      if (type === 'view') rolePermissions[roleId].IsView = 1;
      if (type === 'edit') {
        rolePermissions[roleId].IsEdit = 1;
        rolePermissions[roleId].IsView = 1;
      }
    });

    const finalUserRole = Object.values(rolePermissions);
    console.log('handleSubmit - finalUserRole to save:', finalUserRole);
    const cacheKey = `user_${userId || 'temp'}_permissions`;
    const cacheData = {
      permissions: finalUserRole,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    message.success('Permissions Granted');
    onSuccess?.(finalUserRole);
    onClose();
  };



  const filteredScreens = screens.filter(screen =>
    screen?.DisplayName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (


    <ConfigProvider>
      <>
        <style>{`
    /* scope under our wrapper to avoid side-effects */
    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #6941C6 !important;
      border-color: #6941C6 !important;
    }
    .custom-permissions-drawer .ant-checkbox-checked .ant-checkbox-inner::after {
      border: 2px solid #fff !important; /* white tick */
      transform: rotate(45deg) scale(1) !important;
      top: 2px !important;
      left: 6px !important;
    }
    /* optional: hover state */
    .custom-permissions-drawer .ant-checkbox-wrapper:hover .ant-checkbox-inner,
    .custom-permissions-drawer .ant-checkbox:hover .ant-checkbox-inner {
      border-color: #6941C6 !important;
    }
  `}
        </style>
        <CustomDrawer
          title="Assign Permissions"
          open={visible}
          onClose={onClose}
          width={650}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
          className="custom-permissions-drawer"
        >
          <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 500 }}>
              <Text>{userLabelId || 'N/A'}</Text>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              background: '#F9FAFB',
              padding: '12px 16px',
              fontWeight: 500,
              border: '1px solid #EAECF0',
            }}>
              <div>Menu</div>
              <div style={{ textAlign: 'center' }}>View</div>
              <div style={{ textAlign: 'center' }}>Edit</div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #EAECF0' }}>
              {filteredScreens.map(screen => (
                <div
                  key={screen.PlantMenuId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: 12,
                    borderBottom: '1px solid #F0F0F0'
                  }}
                >
                  <div>{screen.DisplayName}</div>

                  <div style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={selectedPermissions[`${screen.PlantMenuId}_view`] || false}
                      onChange={(e) => handlePermissionChange(`${screen.PlantMenuId}_view`, e.target.checked)}

                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Checkbox
                      checked={selectedPermissions[`${screen.PlantMenuId}_edit`] || false}
                      onChange={(e) => handlePermissionChange(`${screen.PlantMenuId}_edit`, e.target.checked)}

                    />

                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button type="primary" onClick={handleSubmit} loading={submitting} style={{
                backgroundColor: '#6941C6',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 20px',
                fontWeight: 500,
              }}>
                Next
              </Button>
            </div>
          </div>
        </CustomDrawer></>

    </ConfigProvider>

  );
};

export default UserPermissionsDrawer;
