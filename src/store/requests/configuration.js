import { URL, APIVersion } from '../../app-config';

export const URLs = {
  login: URL + APIVersion + 'Registration/VerifyAdminUser',
  createSuperAdmin: URL + APIVersion + 'Registration/CreateSuperAdmin',
  changePassword: URL + APIVersion + 'Registration/ChangePassword',
};
