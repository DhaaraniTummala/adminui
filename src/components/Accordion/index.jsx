import React from 'react';
import PropTypes from 'prop-types';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import accordionStyle from './styles.jsx';

class Accordions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.active != nextProps.active) {
      this.state = {
        active: nextProps.active,
      };
    }
  }
  handleChange = (panel) => (event, expanded) => {
    if (this.state.active == 0) {
      this.setState({
        active: 1,
      });
    } else {
      this.setState({
        active: 0,
      });
    }
  };
  render() {
    const { collapses } = this.props;
    const classes = accordionStyle;

    return (
      <div className={classes.root}>
        {collapses.map((prop, key) => {
          return (
            <Accordion
              className="dark:bg-gray-900 dark:border dark:border-white"
              expanded={this.state.active === key}
              onChange={this.handleChange(key)}
              key={key}
              classes={{
                root: classes.expansionPanel,
                expanded: classes.expansionPanelExpanded,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="dark:text-white" />}
                classes={{
                  root: classes.expansionPanelSummary,
                  expanded: classes.expansionPanelSummaryExpaned,
                  content: classes.expansionPanelSummaryContent,
                  expandIcon: classes.expansionPanelSummaryExpandIcon,
                }}
              >
                <h4 className={`${classes.title} dark:text-white`}>{prop.title}</h4>
              </AccordionSummary>
              <AccordionDetails className={classes.expansionPanelDetails}>
                {prop.content}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  }
}

Accordion.defaultProps = {
  active: -1,
};

Accordion.propTypes = {
  classes: PropTypes.object.isRequired,
  // index of the default active collapse
  active: PropTypes.number,
  collapses: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      content: PropTypes.node,
    }),
  ).isRequired,
};

export default Accordions;
