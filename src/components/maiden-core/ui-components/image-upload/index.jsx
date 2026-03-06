import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './image-upload.css';

export class ImageUpload extends React.Component {
  state = {
    file: '',
    dragActive: false,
    preview: null,
  };

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      this.setState({ dragActive: true });
    } else if (e.type === 'dragleave') {
      this.setState({ dragActive: false });
    }
  };

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragActive: false });

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  };

  handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = window.URL.createObjectURL(file);
      this.setState({ file: url, preview: url });
      this.props.onChange(file, 'file');
    }
  };

  handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      this.handleFile(e.target.files[0]);
    }
  };

  render() {
    let { name, value, item } = this.props;
    const { dragActive, preview } = this.state;

    // Determine the image URL to display
    let displayUrl = preview;
    if (!displayUrl && value) {
      if (typeof value === 'object' && value) {
        displayUrl = window.URL.createObjectURL(value);
      } else if (typeof value === 'string') {
        displayUrl = value;
      }
    }

    return (
      <Box sx={{ width: '100%' }}>
        {/* Upload Area */}
        <Box
          onDragEnter={this.handleDrag}
          onDragLeave={this.handleDrag}
          onDragOver={this.handleDrag}
          onDrop={this.handleDrop}
          sx={{
            border: '2px dashed #6941C6',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            padding: displayUrl ? '8px' : '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '120px',
            display: 'flex',
            flexDirection: displayUrl ? 'row' : 'column',
            alignItems: displayUrl ? 'flex-start' : 'center',
            justifyContent: displayUrl ? 'flex-start' : 'center',
            position: 'relative',
            '&:hover': {
              borderColor: '#5a2d91',
            },
          }}
          onClick={() => document.getElementById(`image-upload-${name}`).click()}
        >
          {displayUrl ? (
            // Show uploaded image inside the dashed border
            <>
              <img
                src={displayUrl}
                alt="Uploaded"
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  display: 'block',
                  marginRight: '12px',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#6941C6',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  alignSelf: 'center',
                  marginLeft: '10px',
                  background: '#F9FAFB',
                  padding: '16px 16px',
                  borderRadius: '8px',
                }}
              >
                <CloudUploadIcon
                  sx={{
                    color: '#6941C6',
                    fontSize: 16,
                    marginRight: '8px',
                  }}
                />
                Change Image
              </Typography>

              {/* Remove Button */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ file: '', preview: null });
                  this.props.onChange(null, 'file');
                }}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  width: 20,
                  height: 20,
                  fontSize: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                ×
              </IconButton>
            </>
          ) : (
            // Show upload interface when no image
            <>
              <CloudUploadIcon
                sx={{
                  color: '#6941C6',
                  fontSize: 32,
                  marginBottom: '8px',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#6941C6',
                  fontSize: '14px',
                  fontWeight: 400,
                }}
              >
                Upload Image
              </Typography>
            </>
          )}

          {/* Hidden File Input */}
          <input
            id={`image-upload-${name}`}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={this.handleFileChange}
          />
        </Box>
      </Box>
    );
  }
}
