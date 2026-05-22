import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';
import { normalizeUserModel } from '../utils/user.js';

const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosConversion = axios.create({
  baseURL: import.meta.env.VITE_CURRENCY_CONVERSION_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosBank = axios.create({
  baseURL: import.meta.env.VITE_BANK_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosCoreBanking = axios.create({
  baseURL: import.meta.env.VITE_CORE_BANKING_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAccountType = axios.create({
  baseURL: import.meta.env.VITE_ACCOUNT_TYPE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const applyAuthHeaders = (config, clientName) => {
  config._axiosClient = clientName;
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
};

axiosAuth.interceptors.request.use((config) => applyAuthHeaders(config, 'auth'));

axiosAdmin.interceptors.request.use((config) => applyAuthHeaders(config, 'admin'));

axiosBank.interceptors.request.use((config) => applyAuthHeaders(config, 'bank'));

axiosCoreBanking.interceptors.request.use((config) => applyAuthHeaders(config, 'coreBanking'));

axiosAccountType.interceptors.request.use((config) => applyAuthHeaders(config, 'accountType'));

axiosConversion.interceptors.request.use((config) => applyAuthHeaders(config, 'conversion'));


let _isRefreshing = false; 
let failedQueue = []; 

function _processQueue(_error, token = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    _error ? reject(_error) : resolve(token)
  );
  failedQueue = [];
}

const handleRefreshToken = async function (_error) {
  const _original = _error.config;
  if (!_original || _original._retry) {
    return Promise.reject(_error);
  }
  const status = _error.response?.status;
  const errorCode = _error.response?.data?.error;
  const requestUrl = _original.url || '';
  const isRefreshEndpoint = requestUrl.includes('/auth/refresh');
  const shouldAttemptRefresh =
    !isRefreshEndpoint &&
    status === 401;

  const shouldAttemptRefreshFrom403 =
    !isRefreshEndpoint && status === 403 && errorCode === 'TOKEN_EXPIRED';

  const shouldRefresh = shouldAttemptRefresh || shouldAttemptRefreshFrom403;

  if (shouldRefresh) {
    const retryClient =
      _original._axiosClient === 'admin'
        ? axiosAdmin
        : _original._axiosClient === 'conversion'
        ? axiosConversion
        : axiosAuth;
    if (_isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          _original.headers['Authorization'] = 'Bearer ' + token;
          return retryClient(_original);
        })
        .catch((err) => Promise.reject(err));
    }
    _original._retry = true;
    _isRefreshing = true;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(_error);
    }
    try {
      const response = await axiosAuth.post('/auth/refresh', { refreshToken });
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        userDetails,
        user,
        User,
      } = response.data;
      const normalizedUser = normalizeUserModel(userDetails || user || User) || useAuthStore.getState().user;
      useAuthStore.setState({
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresIn,
        user: normalizedUser,
        isAuthenticated: true,
      });
      _processQueue(null, accessToken);
      _original.headers['Authorization'] = 'Bearer ' + accessToken;
      return retryClient(_original);
    } catch (err) {
      _processQueue(err, null);
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
  return Promise.reject(_error);
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);

axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);

axiosBank.interceptors.response.use((res) => res, handleRefreshToken);

axiosCoreBanking.interceptors.response.use((res) => res, handleRefreshToken);

axiosAccountType.interceptors.response.use((res) => res, handleRefreshToken);

axiosConversion.interceptors.response.use((res) => res, handleRefreshToken);

export { handleRefreshToken };
export { axiosAuth, axiosAdmin, axiosConversion, axiosBank, axiosCoreBanking, axiosAccountType };
