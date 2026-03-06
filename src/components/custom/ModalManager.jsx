import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const ModalManager = ({ children, eventName, onShow = () => {}, onHide = () => {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [context, setContext] = useState(null);

  const showModal = useCallback(
    (eventContext = null) => {
      debugger;
      setContext(eventContext);
      setIsVisible(true);
      onShow(eventContext);
    },
    [onShow],
  );

  const hideModal = useCallback(() => {
    setIsVisible(false);
    setContext(null);
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (eventName) {
      const handleEvent = (e) => showModal(e.detail);
      window.addEventListener(eventName, handleEvent);
      return () => {
        window.removeEventListener(eventName, handleEvent);
      };
    }
  }, [eventName, showModal]);

  const renderChildren = () => {
    if (!children) return null;
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          isVisible,
          onClose: hideModal,
          context,
          key: 'modal-content',
        });
      }
      return child;
    });
  };

  // Always render the ModalManager, but control visibility through the isVisible prop
  return <div className="modal-manager">{renderChildren()}</div>;
};

ModalManager.propTypes = {
  children: PropTypes.node,
  eventName: PropTypes.string,
  onHide: PropTypes.func,
};

export default ModalManager;
