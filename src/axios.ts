import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import S3FileFieldClient, { S3FileFieldProgress, S3FileFieldProgressState } from 'django-s3-file-field';

import {
  CreateGraphOptionsSpec,
  TableMetadata,
  TableUploadOptionsSpec,
  NetworkUploadOptionsSpec,
  EdgesSpec,
  EdgesOptionsSpec,
  Graph,
  OffsetLimitSpec,
  Paginated,
  GraphSpec,
  TableRow,
  TablesOptionsSpec,
  Table,
  SingleUserWorkspacePermissionSpec,
  UserSpec,
  WorkspacePermissionsSpec,
  Workspace,
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
  getCurrentUserWorkspacePermissions(workspace: string): AxiosPromise<SingleUserWorkspacePermissionSpec>
  setWorkspacePermissions(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec>;
  searchUsers(username: string): AxiosPromise<UserSpec[]>;
  tables(workspace: string, options: TablesOptionsSpec): AxiosPromise<Paginated<Table>>;
  table(workspace: string, table: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  graphs(workspace: string): AxiosPromise<Paginated<Graph>>;
  graph(workspace: string, graph: string): AxiosPromise<GraphSpec>;
  nodes(workspace: string, graph: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  edges(workspace: string, graph: string, options: EdgesOptionsSpec): AxiosPromise<Paginated<EdgesSpec>>;
  createWorkspace(workspace: string): AxiosPromise<string>;
  deleteWorkspace(workspace: string): AxiosPromise<string>;
  renameWorkspace(workspace: string, name: string): AxiosPromise<any>;
  uploadTable(workspace: string, table: string, options: TableUploadOptionsSpec, config?: AxiosRequestConfig): AxiosPromise<Array<{}>>;
  downloadTable(workspace: string, table: string): AxiosPromise<any>;
  deleteTable(workspace: string, table: string): AxiosPromise<string>;
  tableMetadata(workspace: string, table: string): AxiosPromise<TableMetadata>;
  uploadNetwork(workspace: string, network: string, options: NetworkUploadOptionsSpec, config?: AxiosRequestConfig): AxiosPromise<Array<{}>>;
  createGraph(workspace: string, graph: string, options: CreateGraphOptionsSpec): AxiosPromise<CreateGraphOptionsSpec>;
  deleteGraph(workspace: string, graph: string): AxiosPromise<string>;
  aql(workspace: string, query: string): AxiosPromise<any[]>;
  createAQLTable(workspace: string, table: string, query: string): AxiosPromise<any[]>;
  downloadGraph(workspace: string, graph: string): AxiosPromise<any>;
}

export function multinetAxiosInstance(config: AxiosRequestConfig): MultinetAxiosInstance {
  const axiosInstance = axios.create(config);
  const Proto = Object.getPrototypeOf(axiosInstance);

  Proto.logout = function(): void {
    this.get('/user/logout');
  };

  Proto.userInfo = function(): AxiosPromise<UserSpec | null> {
    return this.get('/users/me');
  };

  Proto.workspaces = function(): AxiosPromise<Paginated<Workspace>> {
    return this.get('workspaces');
  };

  Proto.getWorkspacePermissions = function(workspace: string): AxiosPromise<WorkspacePermissionsSpec> {
    return this.get(`workspaces/${workspace}/permissions/`);
  };

  Proto.getCurrentUserWorkspacePermissions = function(workspace: string): AxiosPromise<SingleUserWorkspacePermissionSpec> {
    return this.get(`workspaces/${workspace}/permissions/me/`);
  }

  Proto.setWorkspacePermissions = function(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec> {
    return this.put(`workspaces/${workspace}/permissions/`, permissions)
  };

  Proto.searchUsers = function(username: string): AxiosPromise<UserSpec[]> {
    return this.get('/users/search', {
      params: {
        username,
      },
    });
  };

  Proto.tables = function(workspace: string, options: TablesOptionsSpec = {}): AxiosPromise<Paginated<Table>> {
    return this.get(`workspaces/${workspace}/tables`, {
      params: options,
    });
  };

  Proto.table = function(workspace: string, table: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/tables/${table}/rows`, {
      params: options,
    });
  };

  Proto.graphs = function(workspace: string): AxiosPromise<Paginated<Graph>> {
    return this.get(`workspaces/${workspace}/networks`);
  };

  Proto.graph = function(workspace: string, graph: string): AxiosPromise<GraphSpec> {
    return this.get(`workspaces/${workspace}/networks/${graph}`);
  };

  Proto.nodes = function(workspace: string, graph: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/networks/${graph}/nodes`, {
      params: options,
    });
  };

  Proto.edges = function(workspace: string, graph: string, options: EdgesOptionsSpec = {}): AxiosPromise<Paginated<EdgesSpec>> {
    return this.get(`workspaces/${workspace}/networks/${graph}/edges`, {
      params: options,
    });
  };

  Proto.createWorkspace = function(workspace: string): AxiosPromise<string> {
    return this.post(`/workspaces/`, {
      name: workspace,
    });
  };

  Proto.deleteWorkspace = function(workspace: string): AxiosPromise<string> {
    return this.delete(`/workspaces/${workspace}`);
  };

  Proto.renameWorkspace = function(workspace: string, name: string): AxiosPromise<any> {
    return this.put(`workspaces/${workspace}/name`, null, {
      params: {
        name,
      },
    });
  };

  Proto.uploadTable = async function(workspace: string, table: string, options: TableUploadOptionsSpec): Promise<AxiosResponse<Array<{}>>> {
    const { data, edgeTable, columnTypes } = options;
    const s3ffClient = new S3FileFieldClient({
      baseUrl: `${this.defaults.baseURL}/s3-upload/`,
      apiConfig: this.defaults,
    });

    const fieldValue = await s3ffClient.uploadFile(data, 'api.Upload.blob');

    return this.post(`/workspaces/${workspace}/uploads/csv/`, {
      field_value: fieldValue.value,
      edge: edgeTable,
      table_name: table,
      columns: columnTypes
    });
  };

  Proto.downloadTable = function(workspace: string, table: string): AxiosPromise<any> {
    return this.get(`/workspaces/${workspace}/tables/${table}/download`);
  };

  Proto.deleteTable = function(workspace: string, table: string): AxiosPromise<string> {
    return this.delete(`/workspaces/${workspace}/tables/${table}`);
  };

  Proto.tableMetadata = function(workspace: string, table: string): AxiosPromise<TableMetadata> {
    return this.get(`/workspaces/${workspace}/tables/${table}/metadata`);
  };

  Proto.uploadNetwork = async function(workspace: string, network: string, options: NetworkUploadOptionsSpec): Promise<AxiosResponse<Array<{}>>> {
    const { type, data } = options;
    const s3ffClient = new S3FileFieldClient({
      baseUrl: `${this.defaults.baseURL}/s3-upload/`,
      apiConfig: this.defaults,
    });

    const fieldValue = await s3ffClient.uploadFile(data, 'api.Upload.blob');

    return this.post(`/workspaces/${workspace}/uploads/${type}/`, {
      field_value: fieldValue.value,
      network_name: network
    });
  };

  Proto.createGraph = function(workspace: string, graph: string, options: CreateGraphOptionsSpec): AxiosPromise<CreateGraphOptionsSpec> {
    return this.post(`/workspaces/${workspace}/networks/`, {
      name: graph,
      edge_table: options.edgeTable,
    });
  };

  Proto.deleteGraph = function(workspace: string, graph: string): AxiosPromise<string> {
    return this.delete(`/workspaces/${workspace}/networks/${graph}`);
  };

  Proto.aql = function(workspace: string, query: string): AxiosPromise<any[]> {
    return this.post(`/workspaces/${workspace}/aql`, query, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  };

  Proto.createAQLTable = function(workspace: string, table: string, query: string): AxiosPromise<any[]> {
    return this.post(`/workspaces/${workspace}/tables`, query, {
      headers: {
        'Content-Type': 'text/plain',
      },
      params: {
        table,
      },
    });
  };

  Proto.downloadGraph = function(workspace: string, graph: string): AxiosPromise<any> {
    return this.get(`/workspaces/${workspace}/graphs/${graph}/download`);
  };

  return axiosInstance as MultinetAxiosInstance;
}
