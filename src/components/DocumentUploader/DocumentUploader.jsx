import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { CloudUpload, Delete, Description } from '@mui/icons-material';

const DocumentUploader = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      }
    },
    [files, onFilesChange],
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#374151' }}>
        Assets Documents <span style={{ color: '#ef4444' }}>*</span>
      </Typography>
      <Paper
        variant="outlined"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 4,
          border: dragActive ? '2px dashed #6941C6' : '2px dashed #6941C6',
          borderRadius: 2,
          backgroundColor: dragActive ? 'rgba(105, 65, 198, 0.05)' : '#fafbfc',
          transition: 'all 0.3s ease',
          mb: 2,
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <img src="uploadDocument.svg" alt="" />
          </Box>
          <Typography variant="body2" sx={{ color: '#374151', mb: 2, fontSize: '14px' }}>
            Easily upload and manage your asset-related images and warranty documents in JPG or PDF
            format.
          </Typography>
          <Button component="label">
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          {/* <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
          </Typography> */}
        </Box>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {files.map((file, index) => {
            const getFileIcon = (fileName) => {
              const ext = fileName.split('.').pop()?.toLowerCase();
              if (ext === 'pdf') return '📄';
              if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
              if (['doc', 'docx'].includes(ext)) return '📝';
              return '📄';
            };

            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {getFileIcon(file.name)}
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: '#374151',
                        maxWidth: '300px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  onClick={() => removeFile(index)}
                  sx={{
                    color: '#6b7280',
                    textTransform: 'none',
                    fontSize: '14px',
                    minWidth: 'auto',
                    padding: '4px 8px',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                    },
                  }}
                >
                  Remove
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default DocumentUploader;
