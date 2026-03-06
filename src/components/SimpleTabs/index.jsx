import React from 'react';

import { Tabs, TabsHeader, TabPanel, Tab, TabsBody } from '@material-tailwind/react';

class NavPills extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active,
    };
  }
  handleChange = (event, active) => {
    const { onSelect } = this.props.tabs[active];
    this.setState({ active });
    if (onSelect && typeof onSelect === 'function') onSelect(active);
  };
  handleChangeIndex = (index) => {
    this.setState({ active: index });
  };
  render() {
    const { tabs, alignCenter } = this.props;
    const CustomTabs = (
      <Tabs value={0} onChange={this.handleChange} centered={alignCenter}>
        <TabsHeader>
          {tabs.map((prop, key) => (
            <Tab key={key} value={prop.tabButton}>
              &nbsp;&nbsp;{prop.tabButton}&nbsp;&nbsp;
            </Tab>
          ))}
        </TabsHeader>
        <TabsBody>
          {tabs.map((prop, key) => {
            return (
              <TabPanel key={key} value={prop.tabButton}>
                {prop.tabContent}
              </TabPanel>
            );
          })}
        </TabsBody>
      </Tabs>
    );
    return <div>{CustomTabs}</div>;
  }
}

NavPills.defaultProps = {
  active: 0,
};

export default NavPills;
