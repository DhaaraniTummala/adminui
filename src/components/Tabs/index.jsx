import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

// @mui/material components
import { Box } from '@mui/material';

// core components
import GridContainer from '../Grid/GridContainer.jsx';
import GridItem from '../Grid/GridItem.jsx';
import { disableRippleEffect } from '../../app-config/index';
import { StyledTabs, StyledTab, TabContentWrapper, TabIcon } from './StyledTabs';

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
    const { tabs, direction, color = 'primary', horizontal, alignCenter, noRadius } = this.props;
    const { active } = this.state;

    const tabButtons = (
      <StyledTabs
        disableRipple={disableRippleEffect}
        value={active}
        onChange={this.handleChange}
        orientation={horizontal ? 'vertical' : 'horizontal'}
        variant={horizontal ? 'scrollable' : 'standard'}
        aria-label="nav tabs example"
        sx={{
          '& .MuiTabs-flexContainer': {
            flexDirection: horizontal ? 'column' : 'row',
          },
        }}
      >
        {tabs.map((prop, key) => {
          const icon = prop.tabIcon ? <TabIcon as={prop.tabIcon} /> : null;

          return (
            <StyledTab
              key={key}
              label={prop.tabButton}
              icon={icon}
              horizontal={horizontal ? 1 : 0}
              noRadius={noRadius ? 1 : 0}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${color}.main`,
                },
              }}
            />
          );
        })}
      </StyledTabs>
    );

    const tabContent = (
      <TabContentWrapper>
        <SwipeableViews
          axis={direction === 'rtl' ? 'x-reverse' : 'x'}
          index={active}
          onChangeIndex={this.handleChangeIndex}
        >
          {tabs.map((prop, key) => (
            <div key={key}>{prop.tabContent}</div>
          ))}
        </SwipeableViews>
      </TabContentWrapper>
    );

    if (horizontal) {
      return (
        <GridContainer>
          <GridItem {...horizontal.tabsGrid}>{tabButtons}</GridItem>
          <GridItem {...horizontal.contentGrid}>{tabContent}</GridItem>
        </GridContainer>
      );
    }

    return (
      <Box>
        {tabButtons}
        {tabContent}
      </Box>
    );
  }
}

NavPills.defaultProps = {
  active: 0,
  color: 'primary',
};

NavPills.propTypes = {
  // index of the default active pill
  active: PropTypes.number,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButton: PropTypes.string,
      tabIcon: PropTypes.elementType,
      tabContent: PropTypes.node,
      onSelect: PropTypes.func,
    }),
  ).isRequired,
  color: PropTypes.oneOf(['primary', 'warning', 'danger', 'success', 'info', 'rose']),
  direction: PropTypes.oneOf(['ltr', 'rtl']),
  direction: PropTypes.string,
  horizontal: PropTypes.shape({
    tabsGrid: PropTypes.object,
    contentGrid: PropTypes.object,
  }),
  alignCenter: PropTypes.bool,
};

export default NavPills;
