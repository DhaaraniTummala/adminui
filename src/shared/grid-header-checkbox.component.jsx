import { Checkbox } from '@material-tailwind/react';
import React, { useState } from 'react';

const GridHeaderCheckbox = (props) => {
  const [state, setState] = useState(false);

  const selectAllRows = (bool) => {
    props.api.forEachNode((row) => {
      props.api.getRowNode(row.id).setSelected(bool);
    });
  };

  const updateState = (e) => {
    setState(e.target.checked);
    selectAllRows(e.target.checked);
  };

  return (
    <div className="custom-header-checkbox">
      {/* <Checkbox onChange={updateState} /> */}
      <Checkbox color="blue" onChange={updateState} className=" h-5 w-5" />
    </div>
  );
};

export default GridHeaderCheckbox;
