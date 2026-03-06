import React from 'react';
import { Widget, addResponseMessage, toggleMsgLoader, dropMessages } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import API from '../store/requests';
import { Modal } from 'antd';
import { CacheStorage } from '..//core/utils/cache';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import Tooltip from '@mui/material/Tooltip';
import './component.css';
import '../index.css';

const { confirm } = Modal;

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      showTyping: false,
      showResetButton: false,
      isChatboxOpen: false,
    };
  }

  /*componentDidMount() {
    //this.initiateChat();
    setQuickButtons([{ label: 'Reset', value: 'reset'}]);
  }

  handleQuickButtonClicked = (selectedItem)=>{
    if(selectedItem == 'reset'){
      this.reset();
    }
  }*/

  reset = () => {
    CacheStorage.clear();
    dropMessages();
    this.initiateChat();
    this.setState({ showResetButton: false });
  };

  showConfirm = () => {
    confirm({
      title: 'Are you sure you want to delete this conversation?',
      content: 'This action cannot be undone.',
      onOk: () => {
        this.reset();
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  };

  initiateChat = () => {
    let params = {
      action: 'InitiateConversation',
    };
    CacheStorage.setItem('isFirstTime', false);
    this.setState({ loader: true });
    API.triggerPost('DataUploader', params)
      .then((response) => {
        if (response.status === 200 && response.data.success) {
          let result = response.data.result;
          addResponseMessage(result.initialText);
          CacheStorage.setItem('conversationId', result.conversationId);
          this.setState({
            loader: false,
          });
        } else {
          this.setState({ loader: false });
          this.showModal(response.data.message || 'Unknown error occurred', 'error');
        }
      })
      .catch((err) => {
        this.setState({ loader: false });
        this.showModal(err.message || 'Network error occurred', 'error');
      });
  };

  showModal = (msg, type) => {
    modal.destroyAll();
    modal[type]({
      title: msg,
      okButtonProps: { style: { backgroundColor: '#c31d1d', border: 'none', display: 'none' } },
    });
    setTimeout(() => {
      modal.destroyAll();
    }, 2000);
  };

  handleNewUserMessage = (newMessage) => {
    this.setState({ loader: true, showTyping: true, showResetButton: true });
    toggleMsgLoader();
    let params = {
      question: newMessage,
      action: 'GetReply',
      conversationId: CacheStorage.getItem('conversationId'),
    };
    API.triggerPost('DataUploader', params)
      .then((response) => {
        toggleMsgLoader();
        this.setState({ showTyping: false });
        if (response.status === 200 && response.data.success) {
          addResponseMessage(response.data.result);
        } else {
          this.showModal(response.data.message || 'Unknown error occurred', 'error');
        }
      })
      .catch((err) => {
        toggleMsgLoader();
        this.setState({ showTyping: false });
        this.showModal(err.message || 'Network error occurred', 'error');
      })
      .finally(() => {
        this.setState({ loader: false });
      });
  };

  handleToggleChatbox = (opened) => {
    let isFirstTime = CacheStorage.getItem('isFirstTime');
    if (opened && null == isFirstTime) {
      this.initiateChat();
    }
    this.setState({ isChatboxOpen: opened });
  };

  render() {
    return (
      <div className="App customStyleForChatBox">
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          title="Maiden Cube Pvt Ltd"
          subTitle=""
          emojis={true}
          handleToggle={this.handleToggleChatbox}
          handleQuickButtonClicked={this.handleQuickButtonClicked}
          className="dark:bg-gray-900"
        />

        {this.state.showResetButton && this.state.isChatboxOpen && (
          <button onClick={this.showConfirm} className="reset__button">
            <Tooltip title="reset" style={{ zIndex: '100000000000000000' }}>
              <RestartAltOutlinedIcon className="button__icon" />
            </Tooltip>
          </button>
        )}
      </div>
    );
  }
}

export default ChatBox;
