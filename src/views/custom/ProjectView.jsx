import React from 'react';
import { Card, Statistic, Row, Col, Button, Space, message, Modal } from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ViewRegistry from '../../core/ViewRegistry';

/**
 * Custom Project View - Example of a view wrapper that enhances the default view
 * This adds project-specific dashboard elements above the default grid
 */
const ProjectView = ({ renderDefault, renderBase, ...props }) => {
  console.log('ProjectView props:', props);

  // Use either prop name for backward compatibility
  const renderGridView = renderDefault || renderBase;

  // Store reference to the GridPanel instance
  const [gridPanelRef, setGridPanelRef] = React.useState(null);

  const ProjectDashboard = () => (
    <div className="mb-4" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Card
        className="text-center"
        style={{ flex: '1', minWidth: '200px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div className="text-sm text-gray-500 mb-2">Active Projects</div>
        <div className="text-3xl font-bold text-black">12</div>
      </Card>

      <Card
        className="text-center"
        style={{ flex: '1', minWidth: '200px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div className="text-sm text-gray-500 mb-2">Team Members</div>
        <div className="text-3xl font-bold text-black">28</div>
      </Card>

      <Card
        className="text-center"
        style={{ flex: '1', minWidth: '200px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div className="text-sm text-gray-500 mb-2">Due This Week</div>
        <div className="text-3xl font-bold text-black">5</div>
      </Card>

      <Card
        className="text-center"
        style={{ flex: '1', minWidth: '200px' }}
        bodyStyle={{ padding: '16px' }}
      >
        <div className="text-sm text-gray-500 mb-2">Completion Rate</div>
        <div className="text-3xl font-bold text-black">87.5%</div>
      </Card>
    </div>
  );

  // Button action handlers
  const handleNewProject = () => {
    try {
      console.log('Attempting to trigger Add functionality using GridPanel...');
      console.log('gridPanelRef:', gridPanelRef);

      // Proper GridPanel approach
      if (gridPanelRef && gridPanelRef.createRow) {
        console.log('Calling GridPanel createRow method');
        gridPanelRef.createRow();
        message.success('Opening new project form...');
        return;
      }

      // If GridPanel ref is not available, show informative message
      console.warn('GridPanel reference not available');
      Modal.info({
        title: 'New Project',
        content: (
          <div>
            <p>GridPanel reference is not yet available.</p>
            <p>
              Please use the <strong>"Add"</strong> button in the grid below to create a new
              project.
            </p>
          </div>
        ),
        onOk: () => {
          message.info('Use the Add button in the grid below');
        },
      });

      /* COMMENTED OUT - DOM MANIPULATION APPROACH
      // Method 1: Try to find the Add button by various selectors
      const addButtonSelectors = [
        'button[title="Add"]',
        'button:contains("Add")',
        'button[aria-label="Add"]',
        '.main-button-color:contains("Add")',
        'button[class*="main-button-color"]',
        'button[style*="background: #056EE9"]'
      ];
      
      for (const selector of addButtonSelectors) {
        let addButton;
        if (selector.includes(':contains')) {
          // Handle :contains selector manually since it's not standard CSS
          const buttons = document.querySelectorAll('button');
          addButton = Array.from(buttons).find(btn => 
            btn.textContent && btn.textContent.trim().toLowerCase().includes('add')
          );
        } else {
          addButton = document.querySelector(selector);
        }
        
        if (addButton) {
          console.log(`Found Add button with selector: ${selector}`);
          addButton.click();
          message.success('Opening new project form...');
          return;
        }
      }
      
      // Method 2: Try to find any button with "Add" text
      const allButtons = document.querySelectorAll('button');
      const addButton = Array.from(allButtons).find(btn => {
        const text = btn.textContent || btn.innerText || '';
        return text.toLowerCase().includes('add') && 
               !text.toLowerCase().includes('dashboard') && 
               !text.toLowerCase().includes('project');
      });
      
      if (addButton) {
        console.log('Found Add button by text search');
        addButton.click();
        message.success('Opening new project form...');
        return;
      }
      
      // Method 3: Wait a bit and try again (in case the grid is still loading)
      setTimeout(() => {
        const retryButton = document.querySelector('button[title="Add"]');
        if (retryButton) {
          console.log('Found Add button on retry');
          retryButton.click();
          message.success('Opening new project form...');
        } else {
          // Final fallback - show helpful message
          Modal.info({
            title: 'New Project',
            content: (
              <div>
                <p>To create a new project, please click the <strong>"Add"</strong> button in the grid below.</p>
                <p>The Add button should appear in the top-right area of the grid.</p>
              </div>
            ),
            onOk: () => {
              // Try to scroll to where the Add button should be
              const gridArea = document.querySelector('.ag-root-wrapper, .ant-table, [class*="grid"]');
              if (gridArea) {
                gridArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          });
        }
      }, 1000);
      */
    } catch (error) {
      console.error('Error opening new project form:', error);
      message.error('Unable to open new project form');
    }
  };

  const handleImportProjects = () => {
    Modal.confirm({
      title: 'Import Projects',
      content: 'Select a file to import projects from Excel or CSV format.',
      okText: 'Select File',
      cancelText: 'Cancel',
      onOk: () => {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            message.loading('Importing projects...', 2);
            setTimeout(() => {
              message.success(`Successfully imported projects from ${file.name}`);
            }, 2000);
          }
        };
        input.click();
      },
    });
  };

  const handleExportReport = () => {
    Modal.confirm({
      title: 'Export Report',
      content: 'Export project data to Excel format?',
      okText: 'Export',
      cancelText: 'Cancel',
      onOk: () => {
        message.loading('Generating report...', 2);
        setTimeout(() => {
          // Simulate file download
          const link = document.createElement('a');
          link.href = 'data:text/plain;charset=utf-8,Project Report Data';
          link.download = `project-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          message.success('Report exported successfully!');
        }, 2000);
      },
    });
  };

  const handleProjectTemplates = () => {
    const templates = [
      'Software Development Project',
      'Marketing Campaign',
      'Product Launch',
      'Research & Development',
      'Infrastructure Upgrade',
    ];

    Modal.info({
      title: 'Project Templates',
      width: 500,
      content: (
        <div>
          <p>Choose from available project templates:</p>
          <div style={{ marginTop: 16 }}>
            {templates.map((template, index) => (
              <Button
                key={index}
                block
                style={{ marginBottom: 8, textAlign: 'left' }}
                onClick={() => {
                  message.success(`Selected template: ${template}`);
                  Modal.destroyAll();
                }}
              >
                <FileTextOutlined /> {template}
              </Button>
            ))}
          </div>
        </div>
      ),
      okText: 'Close',
    });
  };

  const ProjectActions = () => (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
      <Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleNewProject}>
          New Project
        </Button>
        <Button icon={<ImportOutlined />} onClick={handleImportProjects}>
          Import Projects
        </Button>
        <Button icon={<ExportOutlined />} onClick={handleExportReport}>
          Export Report
        </Button>
        <Button icon={<FileTextOutlined />} onClick={handleProjectTemplates}>
          Project Templates
        </Button>
      </Space>
    </div>
  );

  // Enhanced render function to capture GridPanel reference
  const renderGrid = () => {
    if (renderGridView) {
      // Use the new renderBaseWithConfig function to enhance the config
      const enhancedConfig = {
        onGridPanelReady: ({ gridPanel }) => {
          console.log('GridPanel ready in ProjectView:', gridPanel);
          debugger;
          setGridPanelRef(gridPanel);

          // Call original onGridPanelReady if it exists
          if (props.config && props.config.onGridPanelReady) {
            props.config.onGridPanelReady({ gridPanel });
          }
        },
      };

      debugger;
      return renderGridView(enhancedConfig);
    }
    return null;
  };

  return (
    <div>
      <ProjectDashboard />
      <ProjectActions />
      {renderGrid()}
    </div>
  );
};

// Register as a wrapper view (enhances default, doesn't replace)
ViewRegistry.registerViewWrapper('10719', ProjectView, {
  priority: 5,
  description: 'Enhanced project view with dashboard',
});

export default ProjectView;
