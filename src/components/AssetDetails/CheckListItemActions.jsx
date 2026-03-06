import React, { useState } from 'react';
import { Menu, Dropdown } from 'antd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { message } from 'antd';

const CheckListItemActions = ({ data, onEdit, onDelete, onCopyId }) => {
  const [visible, setVisible] = useState(false);

  const handleMenuClick = (e) => {
    e.domEvent.stopPropagation();
    setVisible(false);

    if (e.key === 'Edit') {
      if (onEdit) onEdit(data);
    } else if (e.key === 'Delete') {
      if (onDelete) onDelete(data);
    } else if (e.key === 'CopyId') {
      const itemId = data.CheckListItemId || data.Id;
      if (itemId) {
        navigator.clipboard
          .writeText(itemId)
          .then(() => {
            message.success('ID copied to clipboard!');
          })
          .catch((err) => {
            console.error('Failed to copy ID:', err);
            message.error('Failed to copy ID');
          });
      }
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="Edit">Edit</Menu.Item>
      <Menu.Item key="Delete">Delete</Menu.Item>
      <Menu.Item key="CopyId">Copy Id</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
      getPopupContainer={(trigger) => trigger.parentElement}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '8px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setVisible(!visible);
        }}
      >
        <MoreVertIcon />
      </div>
    </Dropdown>
  );
};

export default CheckListItemActions;
