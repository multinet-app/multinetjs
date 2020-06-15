import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class Client {
  public axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      withCredentials: true,
    });
  }

  public get(path: string, params: {} = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.axios.get(path, { params, })
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((resp) => {
          reject(resp.response);
        });
    });
  }

  public post(path: string, data: any = null, params: AxiosRequestConfig = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.axios.post(path, data, params)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((resp) => {
          reject(resp.response);
        });
    });
  }

  public delete(path: string, params: {} = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.axios.delete(path, params)
        .then((resp) => {
          resolve(resp.data);
        })
        .catch((resp) => {
          reject(resp.response);
        });
    });
  }
}
