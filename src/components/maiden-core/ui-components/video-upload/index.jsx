import React from 'react';

export class VideoUpload extends React.Component {
  state = { file: '' };
  render() {
    let { name, value, item } = this.props;

    let url;
    if (typeof value == 'object' && value) {
      url = window.URL.createObjectURL(value);
    } else {
      url = value;
    }
    // if (value == '0.png' || value == null) {
    //   value = '/imageNotFound.png';
    // }
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div class="upload-btn-wrapper">
          <input
            type="file"
            name="myfile"
            accept="video/*"
            onChange={(e) => {
              var a = window.URL.createObjectURL(e.target.files[0]);
              this.props.onChange(e.target.files[0], 'file');
              this.setState({ file: a });
            }}
          />
          <button class="btn" style={{ marginRight: 5 }}>
            Upload a file
          </button>
          {/* <p
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: 100,
                textOverflow: 'ellipsis',
                margin: 0,
              }}
            >
              {this.state.file}
            </p> */}
        </div>
        <video src={url} style={{ height: 200 }} controls></video>
        {/* <canvas id={'imageCanvas' + name} style={{ height: 100, width: 100 }}></canvas> */}
      </div>
    );
  }
}
