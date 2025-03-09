import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  ResponseType
} from 'axios';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import get from 'lodash-es/get.js';
import isFunction from 'lodash-es/isFunction.js';

// ref by lodash get https://lodash.com/docs/4.17.15#get
interface NotificationMapping {
  titlePath: string | Array<string>
  msgPath?: string | Array<string>
  noticeType?: 'success' | 'info' | 'warning' | 'error'
}

type ResponseCallback = (data: any, resp: AxiosResponse) => void;

type ErrorCallback = (resp: AxiosResponse<unknown, any> | undefined, err: AxiosError) => void | boolean;

export interface ApiConfig {
  url: string
  data?: any
  headers?: Record<string, string>
  responseType?: ResponseType
  success?: ResponseCallback
  invalidResHandler?: NotificationMapping | ResponseCallback
  errorHandler?: NotificationMapping | ErrorCallback
}

export type IsapiMethodType = 'get' | 'post' | 'delete' | 'put';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT
});

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    return res;
  },
  (err: AxiosError) => {
    console.log(err);
    // if (err.response?.data?.message) {

    // }
    return Promise.reject(err);
  }
);

const isapi = {
  _api: (
    method: IsapiMethodType,
    {
      url,
      data,
      headers,
      responseType,
      success,
      invalidResHandler,
      errorHandler
    }: ApiConfig
  ): Promise<AxiosResponse | boolean> => {
    const options = {
      method,
      url,
      data,
      headers,
      responseType
    };
    const promise = axiosInstance(options)
      .then((res: AxiosResponse) => handleThen(res, success, invalidResHandler))
      .catch((err: AxiosError) => handleCatch(err, errorHandler))
      .finally(() => {});

    return promise;
  },
  get(params: ApiConfig) {
    return this._api('get', params);
  },
  post(params: ApiConfig) {
    return this._api('post', params);
  },
  put(params: ApiConfig) {
    return this._api('put', params);
  },
  delete(params: ApiConfig) {
    return this._api('delete', params);
  }
};

function handleThen(
  res: AxiosResponse,
  success?: ResponseCallback,
  invalidResHandler?: NotificationMapping | ResponseCallback
) {
  if (success && isFunction(success)) {
    success(res.data, res);
  }
  if (invalidResHandler) {
    if (isFunction(invalidResHandler)) {
      invalidResHandler(res.data, res);
    } else {
      const noticeType = (invalidResHandler as NotificationMapping).noticeType
        ? (invalidResHandler as NotificationMapping).noticeType
        : 'info';
      const notice = generateNotice(
        res.data,
        invalidResHandler as NotificationMapping
      );
      if (notice.title && noticeType) {
        ElNotification({
          type: noticeType,
          ...notice
        });
      }
    }
  }
  return res;
}

function handleCatch(
  err: AxiosError,
  errorHandler?: NotificationMapping | ErrorCallback
) {
  console.error(err);
  // handle error by function
  if (errorHandler && isFunction(errorHandler)) {
    if (errorHandler(err.response, err) === false) {
      return false;
    }
  }
  // handle error by notification and mapping function
  if (errorHandler && err.response?.data) {
    const noticeType = (errorHandler as NotificationMapping).noticeType
      ? (errorHandler as NotificationMapping).noticeType
      : 'error';
    const notice = generateNotice(
      err.response.data,
      errorHandler as NotificationMapping
    );
    if (notice.title && noticeType) {
      ElNotification({
        type: noticeType,
        ...notice
      });
      return false;
    }
  }
  // default by axios data format
  const defaultNotice = generateNotice(err, {
    titlePath: 'response.statusText',
    msgPath: 'message'
  });
  defaultNotice.message = defaultNotice.message
    ? defaultNotice.message
    : err.name;
  ElNotification({
    type: 'error',
    ...defaultNotice
  });
  return false;
}

function generateNotice(obj: any, mappingHdr: NotificationMapping) {
  const notice: any = {};
  const { msgPath, titlePath } = mappingHdr;
  if (titlePath) {
    const title = get(obj, titlePath);
    title && (notice['title'] = title);
  }
  if (msgPath) {
    const msg = get(obj, msgPath);
    msg && (notice['message'] = msg);
  }
  return notice;
}

export default isapi;
