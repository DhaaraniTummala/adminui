import React from 'react';
import { Button, Table, message, Tooltip } from 'antd';
import CircularProgress from '@mui/material/CircularProgress';
import API from '../../store/requests';

class DocumentHandler {
  constructor(config) {
    if (!config || !config.tableName || !config.entityName || !config.documentUrl) {
      throw new Error('DocumentHandler requires tableName, entityName, and documentUrl in config');
    }
    this.config = {
      documentEntity: 'Document',
      documentUploader: true,
      ...config,
      apiEndpoints: {
        list: config.documentUrl,
        delete: config.documentUrl,
      },
    };

    this.documents = [];
    this.loadingDocuments = false;
    this.formRef = null;
    this.forceUpdateFn = null;

    // Bind methods
    this.onFormLoad = this.onFormLoad.bind(this);
    this.handleDeleteDocument = this.handleDeleteDocument.bind(this);
    this.renderDocumentList = this.renderDocumentList.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
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
      console.error(`Error loading ${this.config.entityName} documents:`, error);
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
      console.error('Error deleting document:', error);
      message.error('Failed to delete document');
      return false;
    }
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
          <h4>Attached Documents</h4>
          <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
            No documents attached
          </div>
        </div>
      );
    }

    return (
      <div style={{ margin: '16px 0', width: '63vw' }}>
        <Table
          size="small"
          bordered
          dataSource={this.documents}
          pagination={false}
          columns={[
            {
              title: '#',
              key: 'index',
              width: '60px',
              render: (_, __, index) => (
                <span style={{ color: '#666' }}>{String(index + 1).padStart(2, '0')}</span>
              ),
            },
            {
              title: 'Document',
              key: 'document',
              flex: 1,
              render: (_, doc) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: this.getFileTypeColor(doc.FileName),
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
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{doc.FileName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {this.formatFileSize(doc.FileSize)}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Upload Date & Time',
              key: 'uploadDate',
              width: '180px',
              render: (_, doc) => (
                <span style={{ color: '#666' }}>{this.formatDate(doc.CreatedDate)}</span>
              ),
            },
            {
              title: 'Action',
              key: 'actions',
              width: '140px',
              render: (_, doc) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Tooltip title="View">
                    <Button
                      type="text"
                      size="small"
                      icon={
                        <img src="view.svg" alt="View" style={{ width: '16px', height: '16px' }} />
                      }
                      onClick={() => window.open(doc.FilePath, '_blank')}
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      size="small"
                      icon={
                        <img
                          src="Delete.svg"
                          alt="Delete"
                          style={{ width: '16px', height: '16px' }}
                        />
                      }
                      onClick={() =>
                        this.handleDeleteDocument(doc[`${this.config.documentEntity}Id`])
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Download">
                    <Button
                      type="text"
                      size="small"
                      icon={
                        <img
                          src="Download.svg"
                          alt="Download"
                          style={{ width: '16px', height: '16px' }}
                        />
                      }
                      onClick={() => this.handleDownload(doc.FilePath, doc.FileName)}
                    />
                  </Tooltip>
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }

  // Helper method to get file type color
  getFileTypeColor(fileName) {
    if (fileName?.endsWith('.pdf')) return '#ff4d4f';
    if (fileName?.endsWith('.jpg') || fileName?.endsWith('.jpeg') || fileName?.endsWith('.png'))
      return '#52c41a';
    return '#1890ff';
  }

  // Helper method to format file size
  formatFileSize(fileSize) {
    return fileSize ? `${Math.round(fileSize / 1024)} KB` : 'Unknown size';
  }

  // Helper method to format date
  formatDate(dateString) {
    if (!dateString) return '-';

    // Backend sends time in UTC without 'Z' suffix
    // Add 'Z' to properly parse as UTC and convert to local time (IST)
    let date;
    const dateStrRaw = dateString.toString();
    if (!dateStrRaw.includes('Z') && !dateStrRaw.includes('+') && !dateStrRaw.includes('-', 10)) {
      date = new Date(dateStrRaw + 'Z');
    } else {
      date = new Date(dateStrRaw);
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${day}-${month}-${year} ; ${time}`;
  }

  // Helper method to handle file download
  handleDownload(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.click();
  }

  // Get customizations for the view
  getCustomizations() {
    const boundRender = (forceUpdate) => {
      if (forceUpdate && typeof forceUpdate === 'function') {
        this.setForceUpdate(forceUpdate);
      }
      return this.renderDocumentList(forceUpdate);
    };

    return {
      tableName: this.config.tableName,
      entityName: this.config.entityName,
      documentUploader: this.config.documentUploader,
      onFormLoad: this.onFormLoad,
      renderCustomContent: boundRender.bind(this),
      title: this.config.title,
      subTitle: this.config.subTitle,
      defaultFilterInfo: this.config.defaultFilterInfo,
    };
  }
}

export default DocumentHandler;
