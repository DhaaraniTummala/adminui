import React from 'react';
import BaseView, { ReduxGridPanel } from './BaseView';
import SimpleForm from './simple-form';
import { generateConfig } from '../EnhancedDynamicBaseView';
import { Table, Button, Tooltip, message, Modal } from 'antd';
import { DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { CircularProgress } from '@mui/material';
import API from '../../store/requests';
import viewManager from '../../core/ViewManager';

/**
 * UIHelper - Utility methods for creating grids and forms
 */
const UIHelper = {
  /**
   * Create a read-only child grid (ReduxGridPanel) for a given configId, parent entity, and parent context
   * @param {string|number} configId
   * @param {string} parentEntity
   * @param {object} selectedRowParent
   * @param {object} extraConfig - Any config overrides
   * @returns {JSX.Element}
   */
  createReadOnlyChildGrid: (configId, parentEntity, selectedRowParent, extraConfig = {}) => {
    return UIHelper.createChildGrid(configId, parentEntity, selectedRowParent, {
      ...extraConfig,
      isReadOnly: true,
    });
  },
  /**
   * Create a standard grid (ReduxGridPanel) for a given configId
   * @param {string|number} configId
   * @param {object} extraConfig - Any config overrides
   * @returns {JSX.Element}
   */
  createGrid: (configId, extraConfig = {}) => {
    const baseConfig = generateConfig(configId);
    const baseViewInstance = new BaseView({});
    const config = baseViewInstance.constructConfig(baseConfig, viewManager);
    Object.assign(config, extraConfig);
    return <ReduxGridPanel config={config} />;
  },

  /**
   * Create a child grid (ReduxGridPanel) for a given configId, parent entity, and parent context
   * @param {string|number} configId
   * @param {string} parentEntity
   * @param {object} selectedRowParent
   * @param {object} extraConfig - Any config overrides
   * @returns {JSX.Element}
   */
  createChildGrid: (configId, parentEntity, selectedRowParent, extraConfig = {}) => {
    const baseConfig = generateConfig(configId);
    const baseViewInstance = new BaseView({});
    const config = baseViewInstance.constructConfig({ ...baseConfig, ...extraConfig }, viewManager);
    config.isChild = true;
    config.parentRecordId = selectedRowParent[parentEntity + 'Id'];
    config.ParentEntity = parentEntity;
    config.ParentEntityField = parentEntity + 'Id';
    config.selectedRowParent = selectedRowParent;

    Object.assign(config, extraConfig);
    return (
      <ReduxGridPanel
        config={config}
        parentIdColumn={config.ParentEntityField}
        parentRecordId={config.parentRecordId}
      />
    );
  },

  /**
   * Create an editable form for a given configId and row data
   * @param {string|number} configId
   * @param {object} selectedRow
   * @param {object} extraProps - Any extra props for SimpleForm
   * @returns {JSX.Element}
   */
  createForm: (configId, entity, selectedRow, extraProps = {}) => {
    const baseConfig = generateConfig(configId);
    const baseViewInstance = new BaseView({});
    const config = baseViewInstance.constructConfig(baseConfig, viewManager);
    return (
      <SimpleForm
        selectedRow={selectedRow}
        columns={config.formFields}
        identifier={config.identifier}
        apiIdentifier={config.apiIdentifier}
        closable
        activeRecordId={selectedRow ? selectedRow[entity + 'Id'] : undefined}
        config={config}
        resetProps={() => {}}
        {...extraProps}
      />
    );
  },

  /**
   * Create a read-only form for a given configId and row data
   * @param {string|number} configId
   * @param {object} selectedRow
   * @param {object} extraProps - Any extra props for SimpleForm
   * @returns {JSX.Element}
   */
  createReadOnlyForm: (configId, entity, selectedRow, extraProps = {}) => {
    return UIHelper.createForm(configId, entity, selectedRow, { ...extraProps, mode: 'view' });
  },

  /**
   * Create Asset Documents grid with dynamic data loading matching DocumentHandler
   * @param {string|number} configId
   * @param {string} parentEntity
   * @param {object} selectedRowParent
   * @param {object} extraConfig - Any config overrides
   * @returns {JSX.Element}
   */
  createAssetDocumentsGrid: (configId, parentEntity, selectedRowParent, extraConfig = {}) => {
    class AssetDocumentHandler {
      constructor(config) {
        this.config = {
          entityName: 'Asset',
          documentEntity: 'AssetDocument',
          documentUploader: true,
          ...config,
          apiEndpoints: {
            list: '10817',
            delete: '10817',
          },
        };
        this.documents = [];
        this.loadingDocuments = false;
        this.formRef = null;
        this.forceUpdateFn = null;
        this.viewModalVisible = false;
        this.currentDocument = null;

        // Bind methods
        this.onFormLoad = this.onFormLoad.bind(this);
        this.handleDeleteDocument = this.handleDeleteDocument.bind(this);
        this.renderDocumentList = this.renderDocumentList.bind(this);
        this.forceUpdate = this.forceUpdate.bind(this);
        this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
        this.showDocumentViewer = this.showDocumentViewer.bind(this);
        this.closeDocumentViewer = this.closeDocumentViewer.bind(this);
        this.renderDocumentViewer = this.renderDocumentViewer.bind(this);
      }

      // Set force update function
      setForceUpdate(fn) {
        this.forceUpdateFn = fn;
      }

      // Force update the component
      forceUpdate() {
        if (this.forceUpdateFn) {
          this.forceUpdateFn();
        }
      }

      // Load documents when form is loaded
      async onFormLoad(formProps) {
        // Store the form reference for later use
        this.formRef = { props: { formProps } };

        // Clear documents if no selected row or no parent record ID (new record)
        if (!formProps?.selectedRow || !formProps.selectedRow[`${this.config.entityName}Id`]) {
          this.documents = [];
          this.loadingDocuments = false;
          this.forceUpdate();
          return;
        }

        // Get the parent record ID
        const parentIRecordId = formProps.selectedRow[`${this.config.entityName}Id`];

        // Clear documents immediately when switching records or loading a new record
        this.documents = [];
        this.loadingDocuments = true;
        this.forceUpdate();

        try {
          const response = await API.triggerPost(this.config.apiEndpoints.list, {
            parentId: parentIRecordId,
            parentEntity: this.config.entityName,
            parentEntityField: `${this.config.entityName}Id`,
            action: 'list',
          });

          if (response?.data?.success) {
            this.documents = Array.isArray(response.data.data) ? response.data.data : [];
            this.forceUpdate();
          } else {
            this.documents = [];
          }
        } catch (error) {
          message.error(`Failed to load ${this.config.entityName} documents`);
          this.documents = [];
        } finally {
          this.loadingDocuments = false;
          this.forceUpdate();
        }
      }

      // Handle document deletion
      async handleDeleteDocument(documentId) {
        try {
          const response = await API.triggerPost(this.config.apiEndpoints.delete, {
            [`${this.config.documentEntity}Id`]: documentId,
            action: 'delete',
            identifier: this.config.apiEndpoints.delete,
          });

          if (response.data?.success) {
            // Refresh the document list from the server
            if (this.formRef?.props?.formProps) {
              await this.onFormLoad(this.formRef.props.formProps);
            }
            message.success('Document deleted successfully');
            return true;
          }
        } catch (error) {
          message.error('Failed to delete document');
          return false;
        }
      }

      showDeleteConfirm(documentId) {
        Modal.confirm({
          title: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ff4d4f',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="Alert-popup.svg" alt="Alert-popup.svg" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>
                  Delete Document
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  Are you sure you want to delete this document?
                </div>
              </div>
            </div>
          ),
          content: null,
          icon: null,
          okText: 'Confirm',
          cancelText: 'Cancel',
          okButtonProps: {
            danger: true,
            style: { backgroundColor: '#B54708', borderColor: '#B54708' },
          },
          cancelButtonProps: {
            style: { color: '#04080B', borderColor: '#F9FAFB' },
          },
          centered: true,
          width: 480,
          onOk: () => this.handleDeleteDocument(documentId),
        });
      }

      showDocumentViewer(doc) {
        this.currentDocument = doc;
        this.viewModalVisible = true;
        this.forceUpdate();
      }

      closeDocumentViewer() {
        this.viewModalVisible = false;
        this.currentDocument = null;
        this.forceUpdate();
      }

      renderDocumentViewer() {
        if (!this.viewModalVisible || !this.currentDocument) {
          return null;
        }

        const doc = this.currentDocument;
        const fileExtension = doc.FileName?.split('.').pop()?.toLowerCase();

        let content;
        if (fileExtension === 'pdf') {
          content = (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                  PDF Document: {doc.FileName}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#6941C6',
                      borderColor: '#6941C6',
                      pointerEvents: 'auto',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#6941C6';
                      e.target.style.borderColor = '#6941C6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#6941C6';
                      e.target.style.borderColor = '#6941C6';
                    }}
                    onClick={() => {
                      // Use Google Docs viewer to force viewing instead of downloading
                      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.FilePath)}&embedded=true`;
                      window.open(viewerUrl, '_blank');
                    }}
                  >
                    Open PDF in New Tab
                  </Button>
                  <Button
                    size="large"
                    style={{
                      borderColor: '#6941C6',
                      color: '#6941C6',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#6941C6';
                      e.target.style.color = '#6941C6';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#6941C6';
                      e.target.style.color = '#6941C6';
                    }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = doc.FilePath;
                      link.download = doc.FileName;
                      link.click();
                    }}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
              <div
                style={{
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '40px',
                  backgroundColor: '#fafafa',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <p style={{ color: '#666', margin: 0 }}>
                  Click "Open PDF in New Tab" to view the document
                </p>
              </div>
            </div>
          );
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
          content = (
            <div style={{ textAlign: 'center' }}>
              <img
                src={doc.FilePath}
                alt={doc.FileName}
                style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', padding: '40px' }}>
                <p>Unable to load image. Please try downloading the file.</p>
                <Button type="primary" onClick={() => window.open(doc.FilePath, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          );
        } else {
          content = (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                Preview not available for {fileExtension?.toUpperCase()} files
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => window.open(doc.FilePath, '_blank')}
              >
                Open in New Tab
              </Button>
            </div>
          );
        }

        return (
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📄</span>
                <span>{doc.FileName}</span>
              </div>
            }
            open={this.viewModalVisible}
            onCancel={this.closeDocumentViewer}
            footer={[
              <Button
                key="download"
                icon={<span>⬇️</span>}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = doc.FilePath;
                  link.download = doc.FileName;
                  link.click();
                }}
              >
                Download
              </Button>,
              <Button key="close" onClick={this.closeDocumentViewer}>
                Close
              </Button>,
            ]}
            width={800}
            centered
          >
            {content}
          </Modal>
        );
      }

      // Render the document list component
      renderDocumentList() {
        // Don't show anything if there's no parent record ID (new record)
        const parentIRecordId =
          this.formRef?.props?.formProps?.selectedRow?.[`${this.config.entityName}Id`];
        if (!parentIRecordId) {
          return null;
        }

        // Show loading state if we're still loading or haven't loaded anything yet
        if (this.loadingDocuments || !this.documents) {
          return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CircularProgress size={24} />
              <div>Loading documents...</div>
            </div>
          );
        }

        // Show empty state if no documents
        if (this.documents.length === 0) {
          return (
            <div style={{ margin: '16px 0', width: '100%' }}>
              <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                No documents attached
              </div>
            </div>
          );
        }

        return (
          <div style={{ margin: '16px 0', width: '100%' }}>
            <Table
              size="small"
              bordered
              dataSource={this.documents}
              pagination={false}
              columns={[
                {
                  title: '#',
                  key: 'index',
                  width: 50,
                  render: (_, __, index) => (
                    <span style={{ color: '#666' }}>{String(index + 1).padStart(2, '0')}</span>
                  ),
                },
                {
                  title: 'Action',
                  key: 'document',
                  render: (_, doc) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: doc.FileName?.endsWith('.pdf')
                            ? '#ff4d4f'
                            : doc.FileName?.endsWith('.jpg') || doc.FileName?.endsWith('.jpeg')
                              ? '#52c41a'
                              : '#1890ff',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {doc.FileName?.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{doc.FileName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {doc.FileSize ? `${Math.round(doc.FileSize / 1024)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Upload Date & Time',
                  key: 'uploadDate',
                  width: 200,
                  render: (_, doc) => {
                    // Backend sends time in UTC without 'Z' suffix
                    // Add 'Z' to properly parse as UTC and convert to local time (IST)
                    let date;
                    if (doc.CreatedDate) {
                      const dateStr = doc.CreatedDate.toString();
                      // Check if it already has timezone indicator
                      if (
                        !dateStr.includes('Z') &&
                        !dateStr.includes('+') &&
                        !dateStr.includes('-', 10)
                      ) {
                        // Add 'Z' to indicate UTC
                        date = new Date(dateStr + 'Z');
                      } else {
                        date = new Date(dateStr);
                      }
                    } else {
                      date = new Date();
                    }

                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const time = date.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return (
                      <span style={{ color: '#666' }}>{`${day}-${month}-${year} ; ${time}`}</span>
                    );
                  },
                },
                {
                  title: 'Action',
                  key: 'actions',
                  width: 120,
                  render: (_, doc) => {
                    // If hideActions is true, don't show any action buttons
                    if (this.config.hideActions) {
                      return <span style={{ color: '#999' }}>-</span>;
                    }

                    return (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Tooltip title="View">
                          <Button
                            type="text"
                            size="small"
                            icon={
                              <span style={{ fontSize: '16px' }}>
                                <img src="view.svg" alt="view.svg" />
                              </span>
                            }
                            onClick={() => this.showDocumentViewer(doc)}
                          />
                        </Tooltip>
                        {/* Hide delete button if hideDelete is true */}
                        {!this.config.hideDelete && (
                          <Tooltip title="Delete">
                            <Button
                              type="text"
                              size="small"
                              icon={
                                <span style={{ fontSize: '16px' }}>
                                  {' '}
                                  <img src="Delete.svg" alt="Delete.svg" />
                                </span>
                              }
                              onClick={() => this.showDeleteConfirm(doc.AssetDocumentId)}
                            />
                          </Tooltip>
                        )}
                        <Tooltip title="Download">
                          <Button
                            type="text"
                            size="small"
                            icon={
                              <span style={{ fontSize: '16px' }}>
                                {' '}
                                <img src="Download.svg" alt="Download.svg" />
                              </span>
                            }
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.FilePath;
                              link.download = doc.FileName;
                              link.click();
                            }}
                          />
                        </Tooltip>
                      </div>
                    );
                  },
                },
              ]}
            />
          </div>
        );
      }

      // Get customizations for the view
      getCustomizations() {
        // Create a bound version of renderDocumentList that maintains the correct 'this' context
        const boundRender = (forceUpdate) => {
          // Update the forceUpdate function if provided
          if (forceUpdate && typeof forceUpdate === 'function') {
            this.setForceUpdate(forceUpdate);
          }
          // Call the original renderDocumentList with the current context
          return this.renderDocumentList(forceUpdate);
        };

        return {
          tableName: this.config.tableName,
          entityName: this.config.entityName,
          documentUploader: this.config.documentUploader,
          onFormLoad: this.onFormLoad,
          renderCustomContent: boundRender.bind(this),
        };
      }
    }

    // Create React component that uses the handler
    const AssetDocumentsDisplay = () => {
      const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
      const handlerRef = React.useRef(null);

      if (!handlerRef.current) {
        handlerRef.current = new AssetDocumentHandler(extraConfig);
        handlerRef.current.setForceUpdate(forceUpdate);
      }

      React.useEffect(() => {
        if (selectedRowParent?.AssetId) {
          handlerRef.current.onFormLoad({ selectedRow: selectedRowParent });
        }
      }, [selectedRowParent?.AssetId]);

      const result = handlerRef.current.renderDocumentList();
      const documentViewer = handlerRef.current.renderDocumentViewer();
      return (
        <div>
          {result}
          {documentViewer}
        </div>
      );
    };

    return <AssetDocumentsDisplay />;
  },
};

export default UIHelper;
