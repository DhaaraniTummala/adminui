import React from 'react';
import UIHelper from './UIHelper';

const AssetHistory = ({ selectedRowParent }) => {
  return UIHelper.createChildGrid('10758', 'Asset', selectedRowParent);
};

export default AssetHistory;
