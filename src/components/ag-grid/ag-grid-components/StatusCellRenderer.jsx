import React from 'react';
import StatusBadge from '../../common/StatusBadge';

const StatusCellRenderer = (props) => {
  return <StatusBadge statusId={props.value} size="grid" />;
};

export default StatusCellRenderer;
