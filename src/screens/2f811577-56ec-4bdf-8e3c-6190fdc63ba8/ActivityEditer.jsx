import React, { Component } from 'react';
import Layout from '../../components/Layout';
import { ReduxHelper } from '../../core/redux-helper';
import { connect } from 'react-redux';
import { Pagination, Row, Modal, Checkbox, Button, Spin } from 'antd';
import { CustomSelect } from '../../components/maiden-core/ui-components';
import SimpleForm from '../../components/BaseView/simple-form';
import API from '../../store/requests';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import './style.css';

const Comment = {
  idColumn: 'ActivityId',
};

const Actions = ReduxHelper.Actions;

class ActivityEditer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      count: 0,
      batchName: null,
      selectedRow: {},
      visible: false,
      activeRecordId: '',
      delActivity: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.props.dispatch(
      Actions.requestForAPIActivityBatch({
        action: 'RequestForAPI',
        StoredProcedureName: 'LOAD_DISTINCT_COMMENT_BATCHES',
      }),
    );
    this.getActivities(1);
  }

  deleteBatch = () => {
    this.sendBatchReq('DeleteBatch', 'API_DELETE_COMMENTS_BATCH');
  };

  showBatch = () => {
    this.sendBatchReq('ShowBatch', 'API_SHOW_COMMENTS_BATCH');
  };

  hideBatch = () => {
    this.sendBatchReq('HideBatch', 'API_HIDE_COMMENTS_BATCH');
  };

  sendBatchReq = (identifier, StoredProcedureName) => {
    if (!this.state.batchName) {
      alert('Select batch');
      return;
    }
    this.setState({ loading: true });
    this.props.dispatch(
      Actions.operationRequestActivityBatch({
        StoredProcedureName,
        Params1: this.state.batchName,
      }),
    );
    this.getActivities(this.state.pageNo, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);
  };

  getActivities = (pageNo, filter) => {
    this.setState({ loading: true });
    this.props.dispatch(
      Actions.listview10607({
        filterInfo: this.state.batchName ? filter : null,
        pageNo: pageNo - 1,
        pageSize: 20,
      }),
    );
  };

  onChange = (page) => {
    this.setState({ loading: true });
    this.getActivities(page, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);
    this.setState({ pageNo: page });
  };

  componentWillReceiveProps({ count }) {
    if (count && this.props.count !== count) {
      this.setState({ count, loading: false });
    }
  }

  handleChange = (events) => {
    const batchName = events[0];
    this.setState({ batchName, loading: true }, () =>
      this.getActivities(this.state.pageNo, [
        { filterTerm: batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
      ]),
    );
  };

  refresh = () => {
    this.setState({ loading: true });
    this.getActivities(this.state.pageNo, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);

    this.props.dispatch(
      Actions.requestForAPIActivityBatch({
        action: 'RequestForAPI',
        StoredProcedureName: 'LOAD_DISTINCT_COMMENT_BATCHES',
      }),
    );
  };

  toggle = (tog, selectedRow) => {
    this.setState({
      visible: tog,
      selectedRow,
      activeRecordId: selectedRow ? selectedRow[Comment.idColumn] : '',
    });
  };

  deleteAll = () => {
    const { delActivity } = this.state;
    const activities = Object.values(delActivity).filter((item) => item);
    Modal.confirm({
      title: `Are you sure you want to delete ${activities.length} ${activities.length === 1 ? 'comment' : 'comments'}?`,
      content: (
        <div className="item-grid">
          {activities.map((item, index) => (
            <div key={index} className="item-card">
              {this.renderItem(item)}
              <p>{item.Place}</p>
            </div>
          ))}
        </div>
      ),
      onOk: async () => {
        for (let item of activities) {
          this.confirmDelete(item, activities.length - 1 === activities.indexOf(item));
        }
        this.setState({ delActivity: {} });
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
      width: 800,
      className: 'custom-modal',
    });
  };
  confirmDelete = (selectedRow, isRefresh) => {
    const activeRecordId = selectedRow[Comment.idColumn];
    const payload = {
      action: 'delete',
      ActivityId: activeRecordId,
    };

    API.triggerPost('10607', payload)
      .then((response) => {
        if (response.data.success) {
          if (isRefresh) this.onChange(this.state.pageNo);
        } else {
          alert('Failed');
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error));
      });
  };

  renderItem(item) {
    if (item.ActivityType === 'Image' || item.ActivityType === 'Event') {
      if (item.AttachmentUrl.split(',').length > 1) {
        return (
          <Carousel style={{ height: '200px', width: '100%' }} showThumbs={false}>
            {item.AttachmentUrl.split(',').map((imageSrc, index) => (
              <div key={index}>
                <img
                  src={imageSrc}
                  style={{ height: '200px', width: '100%' }}
                  alt={`Slide ${index}`}
                />
              </div>
            ))}
          </Carousel>
        );
      } else {
        return (
          <img
            src={item.AttachmentUrl}
            style={{ height: '200px', width: '100%' }}
            alt="Attachment"
          />
        );
      }
    } else if (item.ActivityType === 'Video') {
      return (
        <video poster={item.ThumbnailUrl} controls style={{ height: '200px', width: '100%' }}>
          <source src={item.AttachmentUrl} type="video/mp4" />
        </video>
      );
    } else {
      return <div>Event</div>;
    }
  }

  render() {
    const { Activities, dataS } = this.props;
    const { count, selectedRow, visible, activeRecordId, batchName, delActivity, loading } =
      this.state;

    const columns = [
      { title: 'BatchName', dataIndex: 'BatchName' },
      { title: 'UserId', type: 'combo', dataIndex: 'UserId', comboType: 'Users' },
      { title: 'ActivityId', dataIndex: 'ActivityId' },
      { title: 'PlaceId', type: 'combo', dataIndex: 'PlaceId', comboType: '10057' },
      { title: 'InLocation', type: 'boolean', dataIndex: 'InLocation', isRequired: true },
      { title: 'CityId', type: 'combo', dataIndex: 'CityId', comboType: 'City' },
      { title: 'Hashtag', type: 'string', dataIndex: 'Hashtag' },
      { title: 'Hashtag1', type: 'string', dataIndex: 'Hashtag1' },
      { title: 'Hashtag2', type: 'string', dataIndex: 'Hashtag2' },
      { title: 'Hashtag3', type: 'string', dataIndex: 'Hashtag3' },
      { title: 'Hashtag4', type: 'string', dataIndex: 'Hashtag4' },
      { title: 'Hashtag5', type: 'string', dataIndex: 'Hashtag5' },
      { title: 'Emoji', type: 'string', dataIndex: 'Emoji' },
      { title: 'Latitude', type: 'float', dataIndex: 'Latitude' },
      { title: 'Longitude', type: 'float', dataIndex: 'Longitude' },
      { title: 'MigratedDate', type: 'datetime', dataIndex: 'MigratedDate' },
      { title: 'Date', type: 'datetime', dataIndex: 'Date' },
      {
        title: 'Text',
        dataIndex: 'Text',
        type: 'textarea',
        colSpan: 12,
        rowSpan: 12,
        isRequired: true,
      },
      {
        title: 'ImageUrl',
        dataIndex: 'ImageUrl',
        type: 'imageUpload',
        colSpan: 12,
        rowSpan: 13,
        height: 200,
        width: 200,
      },
    ];

    return (
      <div className="activity-editor-container">
        <div className="batch-controls">
          <CustomSelect
            key={dataS.length}
            name="Batches"
            onChange={this.handleChange}
            options={dataS}
            value={batchName}
            mappingId="LookupId"
          />
          <Button className="refresh-button" onClick={this.refresh}>
            Refresh
          </Button>
          <Button className="delete-selected-button" onClick={this.deleteAll}>
            Delete Selected
          </Button>
          {batchName && Activities[0] && (
            <>
              <Button className="delete-batch-button" onClick={this.deleteBatch}>
                Delete Batch
              </Button>
              {Activities[0].Hide ? (
                <Button className="hidden-batch-buttons" onClick={this.showBatch}>
                  BATCH hidden
                </Button>
              ) : (
                <Button className="live-batch-buttons" onClick={this.hideBatch}>
                  BATCH live
                </Button>
              )}
            </>
          )}
        </div>
        <div className="activity-grid-container">
          {loading && (
            <div className="loader-overlay">
              <Spin size="large" />
            </div>
          )}
          <div className="activity-grid">
            {Activities.map((item, index) => (
              <div key={index} className="activity-card">
                <div className="card-header">
                  <Checkbox
                    checked={delActivity[item.ActivityId]}
                    onChange={(e) => {
                      this.setState({
                        delActivity: {
                          ...delActivity,
                          [item.ActivityId]: e.target.checked ? item : false,
                        },
                      });
                    }}
                  />
                  <button onClick={() => this.toggle(true, item)}>Edit</button>
                  <button onClick={() => this.confirmDelete(item)}>Delete</button>
                </div>
                <div className="card-content">
                  {this.renderItem(item)}
                  <div className="card-details">
                    <p>{item.Place}</p>
                    {(() => {
                      const match = item.Description?.match(/https?:\/\/[^\s]+/);
                      return match ? (
                        <a href={match[0]} target="_blank" rel="noopener noreferrer">
                          Instagram Post Url
                        </a>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pagination-container">
          {!loading && ( // Only show pagination when not loading
            <Pagination
              defaultPageSize={20}
              current={this.state.pageNo}
              onChange={this.onChange}
              total={count}
            />
          )}
        </div>
        <Modal
          visible={visible}
          footer={null}
          onCancel={() => this.toggle(false)}
          width={1024}
          destroyOnClose
        >
          <SimpleForm
            columns={columns}
            sssssssssss
            selectedRow={selectedRow}
            identifier="10607"
            apiIdentifier="10607"
            toggle={this.toggle}
            visible={visible}
            config={Comment}
            activeRecordId={activeRecordId}
          />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ requestForAPI_ActivityBatch, listview_10607 }) => {
  let data = [],
    dataS = [],
    Activities = [],
    count = null;
  if (requestForAPI_ActivityBatch?.data?.data) {
    data = requestForAPI_ActivityBatch.data.data;
    dataS = data.map((item) => ({ LookupId: item.BatchName, DisplayValue: item.BatchName }));
    dataS.sort();
  }
  if (listview_10607?.data?.data) {
    Activities = listview_10607.data.data;
    count = listview_10607.data.total;
  }
  return { data, Activities, count, dataS };
};

export default Layout(connect(mapStateToProps)(ActivityEditer));
