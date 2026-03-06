import API from './requests';
import secureStorage from '../utils/secureStorage';

const defaultActions = ['list', 'listview', 'gridpreference'];

// Key is mapping for Page Section.
// actions are mapping for APIS
// if actions are not defined then default API is key.
// each action item has to be in camel case
// mostly controller is the key name.
export const CONFIG = [
  { key: 'Login', api: API.login },
  { key: 'CreateSuperAdmin', api: API.createSuperAdmin },
  { key: 'ChangePassword', api: API.changePassword },
  { key: 'RecoverPassword', api: API.recoverPassword },
  { key: 'Combos', actions: [...defaultActions] },
  { key: 'Activity', actions: [...defaultActions] },
  { key: 'ActivityType', actions: [...defaultActions] },
  { key: 'AttachmentType', actions: [...defaultActions] },
  { key: 'City', actions: [...defaultActions] },
  { key: 'Product', actions: [...defaultActions] },
  { key: 'Menu', actions: [...defaultActions] },
  { key: 'Survey', actions: [...defaultActions] },
  { key: 'SurveyQuestion', actions: [...defaultActions] },
  { key: 'SurveyDetail', actions: [...defaultActions] },
  { key: 'SecurityModule', actions: [...defaultActions] },
  { key: 'Comment', actions: [...defaultActions] },
  { key: 'ControlRoomRequest', actions: [...defaultActions] },
  { key: 'ControlRoomRequestReply', actions: [...defaultActions] },
  { key: 'Logs', actions: [...defaultActions] },
  { key: 'Mobile', actions: ['RequestForJson', 'OperationRequest'] },
  { key: 'News', actions: [...defaultActions] },
  { key: 'ToDo', actions: [...defaultActions] },
  { key: 'User', actions: [...defaultActions] },
  { key: 'UserRole', actions: [...defaultActions] },
  { key: 'Videos', actions: [...defaultActions] },
  { key: 'VideoBatch', actions: ['RequestForAPI'], controller: 'Mobile' },
  { key: 'WellnessCenter', actions: [...defaultActions] },
  { key: 'WellnessCenterType', actions: [...defaultActions] },
  { key: 'Feedback', actions: ['insert'], controller: '10408' },
  {
    key: 'ActivityBatch',
    actions: ['RequestForAPI', 'OperationRequest'],
    controller: 'cube/Scouter Galactic Pvt Ltd/night life/ActivityManagement/Mobile',
  },
  {
    key: 'OfferPostBatch',
    actions: ['RequestForAPI', 'OperationRequest'],
    controller: 'cube/Scouter Galactic Pvt Ltd/night life/ActivityManagement/Mobile',
  },
  {
    key: 'Analytics',
    actions: ['RequestForJson', 'OperationRequest'],
    controller: 'cube/Scouter Galactic Pvt Ltd/night life/ActivityManagement/Mobile',
  },
  {
    key: 'ScouterCity',
    actions: ['RequestForJson', 'OperationRequest'],
    controller: 'cube/Scouter Galactic Pvt Ltd/night life/ActivityManagement/Mobile',
  },
  { key: 'ScouterPlace', actions: [...defaultActions], controller: '10057' },
];

let dynamicConfig = secureStorage.getJSONSafe('dynamicConfig', []);
let mapping = [];
if (null != dynamicConfig && Array.isArray(dynamicConfig)) {
  mapping = dynamicConfig.map((item) => {
    return { ...item, actions: [...defaultActions] };
  });
}
export const newConfig = mapping;
