import React from 'react';
import { Card, Alert, Button, Space } from 'antd';
import ViewRegistry from '../../core/ViewRegistry';

/**
 * TestView - A simple test component to verify ViewManager functionality
 */
const TestView = (props) => {
  const { tableName, config, baseViewInstance, viewManager, renderDefault } = props;

  const handleTestAction = () => {
    console.log('Test action triggered for table:', tableName);
    console.log('Available props:', Object.keys(props));
    console.log('ViewManager instance:', viewManager);
  };

  return (
    <div className="test-view p-4">
      <Alert
        message="ViewManager Test View Active"
        description={`This is a test view for table: ${tableName}. The ViewManager system is working correctly.`}
        type="success"
        showIcon
        className="mb-4"
      />

      <Card title="ViewManager System Test" className="mb-4">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>Table Name:</strong> {tableName}
          </div>
          <div>
            <strong>Config Available:</strong> {config ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Base View Instance:</strong> {baseViewInstance ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>ViewManager:</strong> {viewManager ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Render Default Available:</strong> {renderDefault ? 'Yes' : 'No'}
          </div>

          <Button type="primary" onClick={handleTestAction}>
            Test ViewManager
          </Button>
        </Space>
      </Card>

      {renderDefault && (
        <Card title="Default View" className="mb-4">
          <p className="mb-2">Below is the default view rendered by the base system:</p>
          {renderDefault()}
        </Card>
      )}
    </div>
  );
};

// Register this test view for a specific table (you can change this to any table name you want to test)
// Uncomment the line below to activate the test view
// ViewRegistry.registerViewWrapper('Tasks', TestView, {
//   priority: 999,
//   description: 'Test view for ViewManager system verification'
// });

export default TestView;
