import React from 'react';
import TrackingSimpleForm from '../BaseView/tracking-simple-form';

/**
 * Custom form component for Vehicle Tracking
 * Uses TrackingSimpleForm which has built-in two-column layout support
 */
const VehicleTrackingForm = (props) => {
  return <TrackingSimpleForm {...props} />;
};

export default VehicleTrackingForm;
