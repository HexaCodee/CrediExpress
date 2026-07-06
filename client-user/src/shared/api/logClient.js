// src/shared/api/logClient.js
//
// Cliente para log-service (.NET, puerto 5062): login, logout y MFA.
//
// En el prompt de referencia (KinalSports) este archivo se llamaba
// "userClient.js" porque ese proyecto tiene un único servicio de auth que
// también expone /refresh. CrediExpress separó login/logout en un servicio
// aparte (log-service), así que el equivalente real aquí es "logClient.js".

import { ENDPOINTS } from '../constants/endpoints';
import { createHttpClient } from './httpClient';

const logClient = createHttpClient(ENDPOINTS.LOG);

export default logClient;

export function login(emailOrUsername, password, mfaCode) {
  return logClient.post('/login', { emailOrUsername, password, mfaCode });
}

export function logout() {
  return logClient.post('/logout');
}
