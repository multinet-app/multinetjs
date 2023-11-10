import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import S3FileFieldClient, { S3FileFieldProgress, S3FileFieldProgressState } from 'django-s3-file-field';

import {
  CreateNetworkOptionsSpec,
  ColumnTypes,
  TableUploadOptionsSpec,
  NetworkUploadOptionsSpec,
  EdgesSpec,
  EdgesOptionsSpec,
  Network,
  OffsetLimitSpec,
  Paginated,
  NetworkSpec,
  TableRow,
  TablesOptionsSpec,
  Table,
  TableType,
  SingleUserWorkspacePermissionSpec,
  UserSpec,
  WorkspacePermissionsSpec,
  Workspace,
  AQLQuerySpec,
  ColumnType,
} from './index';

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target === null || typeof e.target.result !== 'string') {
        throw new Error();
      }
      resolve(e.target.result);
    };
    reader.onerror = (e) => {
      reject();
    };

    reader.readAsText(file);
  });
}

export interface MultinetAxiosInstance extends AxiosInstance {
  logout(): void;
  userInfo(): AxiosPromise<UserSpec | null>;
  workspaces(): AxiosPromise<Paginated<Workspace>>;
  getWorkspacePermissions(workspace: string): AxiosPromise<WorkspacePermissionsSpec>;
  getCurrentUserWorkspacePermissions(workspace: string): AxiosPromise<SingleUserWorkspacePermissionSpec>;
  setWorkspacePermissions(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec>;
  searchUsers(username: string): AxiosPromise<UserSpec[]>;
  tables(workspace: string, options: TablesOptionsSpec): AxiosPromise<Paginated<Table>>;
  table(workspace: string, table: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  networks(workspace: string): AxiosPromise<Paginated<Network>>;
  network(workspace: string, network: string): AxiosPromise<NetworkSpec>;
  nodes(workspace: string, network: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  edges(workspace: string, network: string, options: EdgesOptionsSpec): AxiosPromise<Paginated<EdgesSpec>>;
  networkTables(workspace: string, network: string, type: TableType): AxiosPromise<Table[]>;
  createWorkspace(workspace: string): AxiosPromise<string>;
  deleteWorkspace(workspace: string): AxiosPromise<string>;
  renameWorkspace(workspace: string, name: string): AxiosPromise<Workspace>;
  uploadTable(workspace: string, table: string, options: TableUploadOptionsSpec, config?: AxiosRequestConfig): AxiosPromise<Array<{}>>;
  deleteTable(workspace: string, table: string): AxiosPromise<string>;
  columnTypes(workspace: string, table: string): AxiosPromise<ColumnTypes>;
  uploadNetwork(workspace: string, network: string, data: File, nodeColumns: Record<string, ColumnType>, edgeColumns: Record<string, ColumnType>, config?: AxiosRequestConfig): AxiosPromise<Array<{}>>;
  createNetwork(workspace: string, network: string, options: CreateNetworkOptionsSpec): AxiosPromise<CreateNetworkOptionsSpec>;
  deleteNetwork(workspace: string, network: string): AxiosPromise<string>;
  aql(workspace: string, payload: AQLQuerySpec): AxiosPromise<any[]>;
  uploads(workspace: string): AxiosPromise<any>;
  createSession(workspace: string, itemId: number, type: 'network' | 'table', visApp: string, name: string): AxiosPromise<any>;
  listSessions(workspace: string, type: 'network' | 'table'): AxiosPromise<any>;
  deleteSession(workspace: string, sessionId: number, type: 'network' | 'table'): Promise<any>;
  updateSession(workspace: string, sessionId: number, type: 'network' | 'table', state: object): AxiosPromise<any>;
  renameSession(workspace: string, sessionId: number, type: 'network' | 'table', name: string): AxiosPromise<any>;
  getSession(workspace: string, sessionId: number, type: 'network' | 'table'): AxiosPromise<any>;
  generateAltText(verbosity: string, explain: string, data: object, title?: string, level?: number): AxiosPromise<any>;
  networkBuildRequests(workspace: string): AxiosPromise<number[]>;
}

export function multinetAxiosInstance(config: AxiosRequestConfig): MultinetAxiosInstance {
  const axiosInstance = axios.create(config);
  const Proto = Object.getPrototypeOf(axiosInstance);

  Proto.logout = function(): void {
    this.get('user/logout');
  };

  Proto.userInfo = function(): AxiosPromise<UserSpec | null> {
    return this.get('users/me');
  };

  Proto.workspaces = function(): AxiosPromise<Paginated<Workspace>> {
    return this.get('workspaces/');
  };

  Proto.getWorkspacePermissions = function(workspace: string): AxiosPromise<WorkspacePermissionsSpec> {
    return this.get(`workspaces/${workspace}/permissions/`);
  };

  Proto.getCurrentUserWorkspacePermissions = function(workspace: string): AxiosPromise<SingleUserWorkspacePermissionSpec> {
    return this.get(`workspaces/${workspace}/permissions/me/`);
  };

  Proto.setWorkspacePermissions = function(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec> {
    return this.put(`workspaces/${workspace}/permissions/`, permissions);
  };

  Proto.searchUsers = function(username: string): AxiosPromise<UserSpec[]> {
    return this.get('users/search', {
      params: {
        username,
      },
    });
  };

  Proto.tables = function(workspace: string, options: TablesOptionsSpec = {}): AxiosPromise<Paginated<Table>> {
    return this.get(`workspaces/${workspace}/tables/`, {
      params: options,
    });
  };

  Proto.table = function(workspace: string, table: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/tables/${table}/rows/`, {
      params: options,
    });
  };

  Proto.networks = function(workspace: string): AxiosPromise<Paginated<Network>> {
    return this.get(`workspaces/${workspace}/networks/`);
  };

  Proto.network = function(workspace: string, network: string): AxiosPromise<NetworkSpec> {
    return this.get(`workspaces/${workspace}/networks/${network}/`);
  };

  Proto.nodes = function(workspace: string, network: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/networks/${network}/nodes/`, {
      params: options,
    });
  };

  Proto.edges = function(workspace: string, network: string, options: EdgesOptionsSpec = {}): AxiosPromise<Paginated<EdgesSpec>> {
    return this.get(`workspaces/${workspace}/networks/${network}/edges/`, {
      params: options,
    });
  };

  Proto.networkTables = function(workspace: string, network: string, type: TableType = 'all'): AxiosPromise<Table[]> {
    return this.get(`workspaces/${workspace}/networks/${network}/tables/`, { params: {type} });
  };

  Proto.createWorkspace = function(workspace: string): AxiosPromise<string> {
    return this.post(`workspaces/`, {
      name: workspace,
    });
  };

  Proto.deleteWorkspace = function(workspace: string): AxiosPromise<string> {
    return this.delete(`workspaces/${workspace}/`);
  };

  Proto.renameWorkspace = function(workspace: string, name: string): AxiosPromise<Workspace> {
    return this.put(`workspaces/${workspace}/`, {
      name,
    });
  };

  Proto.uploadTable = async function(workspace: string, table: string, options: TableUploadOptionsSpec): Promise<AxiosResponse<Array<{}>>> {
    const { data, edgeTable, columnTypes, fileType, delimiter, quoteChar } = options;
    const s3ffClient = new S3FileFieldClient({
      baseUrl: `${this.defaults.baseURL}/s3-upload/`,
      apiConfig: this.defaults,
    });

    const fieldValue = await s3ffClient.uploadFile(data, 'api.Upload.blob');

    if (fileType === 'csv') {
      return this.post(`workspaces/${workspace}/uploads/csv/`, {
        field_value: fieldValue.value,
        edge: edgeTable,
        table_name: table,
        columns: columnTypes,
        delimiter,
        quotechar: quoteChar,
      });
    }

    // else if json
    return this.post(`workspaces/${workspace}/uploads/json_table/`, {
      field_value: fieldValue.value,
      edge: edgeTable,
      table_name: table,
      columns: columnTypes,
    });
  };

  Proto.deleteTable = function(workspace: string, table: string): AxiosPromise<string> {
    return this.delete(`workspaces/${workspace}/tables/${table}/`);
  };

  Proto.columnTypes = function(workspace: string, table: string): AxiosPromise<ColumnTypes> {
    return this.get(`workspaces/${workspace}/tables/${table}/annotations/`);
  };

  Proto.uploadNetwork = async function(workspace: string, network: string, data: File, nodeColumns: Record<string, ColumnType>, edgeColumns: Record<string, ColumnType>): Promise<AxiosResponse<Array<{}>>> {
    const s3ffClient = new S3FileFieldClient({
      baseUrl: `${this.defaults.baseURL}/s3-upload/`,
      apiConfig: this.defaults,
    });

    const fieldValue = await s3ffClient.uploadFile(data, 'api.Upload.blob');

    return this.post(`workspaces/${workspace}/uploads/json_network/`, {
      field_value: fieldValue.value,
      network_name: network,
      node_columns: nodeColumns,
      edge_columns: edgeColumns,
    });
  };

  Proto.createNetwork = function(workspace: string, network: string, options: CreateNetworkOptionsSpec): AxiosPromise<CreateNetworkOptionsSpec> {
    return this.post(`workspaces/${workspace}/networks/`, {
      name: network,
      edge_table: options.edgeTable,
    });
  };

  Proto.deleteNetwork = function(workspace: string, network: string): AxiosPromise<string> {
    return this.delete(`workspaces/${workspace}/networks/${network}/`);
  };

  Proto.aql = function(workspace: string, payload: AQLQuerySpec): AxiosPromise<any[]> {
    return this.post(`workspaces/${workspace}/aql/`, payload);
  };

  Proto.uploads = function(workspace: string): AxiosPromise<any> {
    return this.get(`workspaces/${workspace}/uploads/`);
  };

  Proto.createSession = function(workspace: string, itemId: number, type: 'network' | 'table', visApp: string, name: string): AxiosPromise<any> {
    return this.post(`workspaces/${workspace}/sessions/${type}/`, {
      name,
      visapp: visApp,
      state: {},
      [type]: itemId,
    });
  };

  Proto.listSessions = function(workspace: string, type: 'network' | 'table'): AxiosPromise<any> {
    return this.get(`workspaces/${workspace}/sessions/${type}/`);
  };

  Proto.deleteSession = function(workspace: string, sessionId: number, type: 'network' | 'table'): AxiosPromise<any> {
    return this.delete(`workspaces/${workspace}/sessions/${type}/${sessionId}/`);
  };

  Proto.updateSession = function(workspace: string, sessionId: number, type: 'network' | 'table', state: object): AxiosPromise<any> {
    return this.patch(`workspaces/${workspace}/sessions/${type}/${sessionId}/state/`, {
      state,
    });
  };

  Proto.renameSession = function(workspace: string, sessionId: number, type: 'network' | 'table', name: string): AxiosPromise<any> {
    return this.patch(`workspaces/${workspace}/sessions/${type}/${sessionId}/name/`, {
      name,
    });
  };

  Proto.getSession = function(workspace: string, sessionId: number, type: 'network' | 'table'): AxiosPromise<any> {
    return this.get(`workspaces/${workspace}/sessions/${type}/${sessionId}/`);
  };

  Proto.generateAltText = function(verbosity: string, explain: string, data: object, title?: string, level?: number): AxiosPromise<any> {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'data.json');

    const formData = new FormData();

    formData.append('verbosity', verbosity);
    formData.append('explain', explain);
    formData.append('data', file);
    if (title) {
      formData.append('title', title);
    }
    if (level) {
      formData.append('level', level.toString());
    }

    return this.post(`alttxt/`, formData);
  };

  Proto.networkBuildRequests = function(workspace: string): AxiosPromise<number[]> {
    return this.get(`workspaces/${workspace}/network_build_requests/`);
  };

  return axiosInstance as MultinetAxiosInstance;
}
