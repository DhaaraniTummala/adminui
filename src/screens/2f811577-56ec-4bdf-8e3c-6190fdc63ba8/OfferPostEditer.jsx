import React, { Component } from 'react';
import Layout from '../../components/Layout';
import { ReduxHelper } from '../../core/redux-helper';
import { connect } from 'react-redux';
import { Pagination, Row, Col, Select, Modal, Checkbox, Button } from 'antd';
import { CustomSelect } from '../../components/maiden-core/ui-components';
import SimpleForm from '../../components/BaseView/simple-form';
import API from '../../store/requests';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import '../2f811577-56ec-4bdf-8e3c-6190fdc63ba8/style.css';
import { useNavigate } from 'react-router-dom';

function withNavigation(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

const OfferPost = {
  idColumn: 'OfferPostId',
};

const Actions = ReduxHelper.Actions;
class OfferPostEditer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNo: 1,
      count: 0,
      batchName: null,
      selectedRow: {},
      visible: false,
      activeRecordId: '',
      delOfferPost: {},
    };
  }

  componentDidMount() {
    this.props.dispatch(
      Actions.requestForAPIOfferPostBatch({
        action: 'RequestForAPI',
        StoredProcedureName: 'LOAD_DISTINCT_OFFERPOST_BATCHES',
      }),
    );
    this.getOfferPosts(1);
  }

  deleteBatch = () => {
    this.sendBAtchReq('DeleteBatch', 'API_DELETE_OFFERPOST_BATCH');
  };

  showBatch = () => {
    this.sendBAtchReq('ShowBatch', 'API_SHOW_OFFERPOST_BATCH');
  };

  hideBatch = () => {
    this.sendBAtchReq('HideBatch', 'API_HIDE_OFFERPOST_BATCH');
  };

  sendBAtchReq = (identifier, StoredProcedureName) => {
    if (this.state.batchName == null || this.state.batchName == '') {
      alert('select batch');
      return;
    }
    this.props.dispatch(
      Actions.operationRequestOfferPostBatch({
        StoredProcedureName,
        Params1: this.state.batchName,
      }),
    );
    this.getOfferPosts(this.state.pageNo, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);
  };

  getOfferPosts = (pageNo, filter) => {
    this.props.dispatch(
      Actions.list10720({
        filterInfo: this.state.batchName ? filter : null,
        pageNo: pageNo - 1,
        pageSize: 20,
        comboTypes:
          pageNo == 1
            ? [
                {
                  IDField: 'PlaceId',
                  ValueField: 'PlaceName',
                  type: '10057',
                },
              ]
            : [],
      }),
    );
  };

  onChange = (page) => {
    this.getOfferPosts(page, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);
    this.setState({
      pageNo: page,
    });
  };

  handleAddClick = (item) => {
    this.props.navigate('/Enhancers/OfferPostDetails', { state: { item: item } });
  };

  componentWillReceiveProps({ count }) {
    if (count && this.props.count !== count) {
      this.setState({ count });
    }
  }

  handleChange = (events) => {
    let batchName = events[0];
    this.setState({ batchName }, () =>
      this.getOfferPosts(this.state.pageNo, [
        { filterTerm: batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
      ]),
    );
  };

  refresh = () => {
    this.getOfferPosts(this.state.pageNo, [
      { filterTerm: this.state.batchName, filterBy: 'BatchName', filterType: 'EQUALS' },
    ]);

    this.props.dispatch(
      Actions.requestForAPIOfferPostBatch({
        action: 'RequestForAPI',
        StoredProcedureName: 'LOAD_DISTINCT_OFFERPOST_BATCHES',
      }),
    );
  };

  toggle = (tog, selectedRow) => {
    this.setState({
      visible: tog,
      selectedRow,
      activeRecordId: selectedRow ? selectedRow[OfferPost.idColumn] : '',
    });
  };

  deleteAll = () => {
    let { delOfferPost } = this.state;
    let offerPosts = Object.values(delOfferPost).filter((item) => item);
    let me = this;
    Modal.confirm({
      title: 'Are you sure u want to delete ' + offerPosts.length + ' offer post',
      content: (
        <Row gutter={16}>
          {offerPosts && offerPosts.map((item, index) => this.renderItem(item))}
        </Row>
      ),
      onOk: async () => {
        for (var item in offerPosts) {
          me.confirmDelete(offerPosts[item], offerPosts.length - 1 == item);
        }
        this.setState({ delOfferPost: {} });
        //alert('competed');
        Modal.destroyAll();
      },
      onCancel: () => {
        Modal.destroyAll();
      },
      width: 1000,
    });
  };

  confirmDelete = (selectedRow, isRefresh) => {
    var idColumn = OfferPost.idColumn;
    var activeRecordId = selectedRow[idColumn];

    var payload = null;

    payload = {
      action: 'delete',
      OfferPostId: activeRecordId,
    };

    API.triggerPost('10720', payload)
      .then((response) => {
        var data = response.data;
        if (data.success) {
          if (isRefresh) this.onChange(this.state.pageNo);
          //this.setState({ isRefresh: true }, () => (this.state.isRefresh = false));
        } else {
          alert('Failed');
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error));
      });
  };

  renderItem(item) {
    if (item.PostType == 'Image' || item.PostType == 'Event') {
      if (item.AttachmentUrl.split(',').length > 1) {
        return (
          <Carousel style={{ height: '200px', width: 'calc(100%)' }} showThumbs={false}>
            {item.AttachmentUrl.split(',').map((imageSrc) => (
              <div>
                <img src={imageSrc} style={{ height: '200px', width: 'calc(100%)' }} />
              </div>
            ))}
          </Carousel>
        );
      } else {
        return <img src={item.AttachmentUrl} style={{ height: '200px', width: 'calc(100%)' }} />;
      }
    } else if (item.PostType == 'Video') {
      return (
        <>
          <video
            poster={item.ThumbnailUrl}
            controls
            style={{ height: '200px', width: 'calc(100%)' }}
          >
            <source src={item.AttachmentUrl} type="video/mp4" />
          </video>

          <div>
            <p>{item.Description ? item.Description : 'No description available'}</p>
            <p>{item.BatchName}</p>
          </div>
        </>
      );
    } else {
      return <div>Event</div>;
    }
  }

  render() {
    const { data, OfferPosts, dataS } = this.props;
    const { count, selectedRow, visible, activeRecordId, batchName, delOfferPost } = this.state;
    const { Option } = Select;

    const columns = [
      { title: 'Batch Name', dataIndex: 'BatchName' },
      { title: 'Description', dataIndex: 'Description' },
      { title: 'PlaceId', type: 'combo', dataIndex: 'PlaceId', comboType: '10057' },
      { title: 'Post Type', dataIndex: 'PostType' },
    ];

    return (
      <div>
        <CustomSelect
          key={dataS.length}
          name={'Batches'}
          onChange={this.handleChange}
          options={dataS}
          value={batchName}
          mappingId="LookupId"
        />
        <Button onClick={this.refresh} style={{ margin: '10px' }}>
          Refresh
        </Button>
        <Button onClick={this.deleteAll} style={{ margin: '10px' }}>
          Delete Selected
        </Button>
        {batchName && batchName !== '' && OfferPosts[0] && (
          <>
            <Button onClick={this.deleteBatch} style={{ margin: '10px' }}>
              Delete Batch
            </Button>
            {OfferPosts[0].Hide ? (
              <Button onClick={this.showBatch} className="hidden-batch-buttons">
                BATCH hidden
              </Button>
            ) : (
              <Button onClick={this.hideBatch} className="live-batch-buttons">
                BATCH live
              </Button>
            )}
          </>
        )}
        <br />
        <Row className="custom-row">
          {OfferPosts.map((item, index) => (
            <Col key={index} xs={24} sm={12} md={7} lg={7}>
              <div className="custom-item">
                <Checkbox
                  checked={delOfferPost[item.OfferPostId]}
                  onChange={(eve) => {
                    this.setState({
                      delOfferPost: {
                        ...delOfferPost,
                        [item.OfferPostId]: eve.target.checked ? item : false,
                      },
                    });
                  }}
                />
                <button
                  style={{ marginRight: '5px', marginLeft: '3px' }}
                  onClick={() => this.toggle(true, item)}
                >
                  Edit
                </button>
                <button
                  style={{ marginRight: '5px', marginLeft: '3px' }}
                  onClick={() => this.confirmDelete(item)}
                >
                  Delete
                </button>
                <button onClick={() => this.handleAddClick(item)}>Add</button>
                <div>
                  {this.renderItem(item)}

                  {/* <div style={{ height: 25 }}>
                    {item.Latitude}, {item.Longitude}, {item.Place}
                  </div> */}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <br />
        {count !== 0 ? (
          <Pagination
            defaultPageSize={20}
            current={this.state.pageNo}
            onChange={this.onChange}
            total={count}
          />
        ) : (
          ''
        )}
        <Modal
          visible={visible}
          footer={null}
          onCancel={() => {
            return this.toggle(false);
          }}
          width={1024}
          destroyOnClose
        >
          <SimpleForm
            columns={columns}
            selectedRow={selectedRow}
            identifier={'10720'}
            apiIdentifier={'10720'}
            toggle={this.toggle}
            visible={visible}
            config={OfferPost}
            activeRecordId={activeRecordId}
          />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({
  requestForAPI_OfferPostBatch,
  list_10720,
  operationrequest_showbatch,
  operationrequest_hidebatch,
  operationrequest_deletebatch,
}) => {
  let data = [],
    dataS = [],
    OfferPosts = [],
    count = null;
  if (
    requestForAPI_OfferPostBatch &&
    requestForAPI_OfferPostBatch.data &&
    requestForAPI_OfferPostBatch.data.data
  ) {
    // debugger;
    data = requestForAPI_OfferPostBatch?.data?.data;
    data?.forEach((item) => dataS.push({ LookupId: item.BatchName, DisplayValue: item.BatchName }));
    dataS.sort();
  }

  if (list_10720.data && list_10720.data.data) {
    OfferPosts = list_10720.data.data;
    count = list_10720.data.total;
  }
  return { data, OfferPosts, count, dataS };
};

export default withNavigation(Layout(connect(mapStateToProps)(OfferPostEditer)));
