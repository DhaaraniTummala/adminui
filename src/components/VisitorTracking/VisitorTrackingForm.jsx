import React from 'react';
import TrackingSimpleForm from '../BaseView/tracking-simple-form';

/**
 * Custom form component for Visitor Tracking
 * Uses TrackingSimpleForm which has built-in two-column layout support
 */
const VisitorTrackingForm = (props) => {
  return <TrackingSimpleForm {...props} />;
};

export default VisitorTrackingForm;
