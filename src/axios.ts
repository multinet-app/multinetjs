import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  CreateGraphOptionsSpec,
  TableMetadata,
  FileUploadOptionsSpec,
  EdgesSpec,
  EdgesOptionsSpec,
  Graph,
  OffsetLimitSpec,
  Paginated,
  GraphSpec,
  TableRow,
  TablesOptionsSpec,
  Table,
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
  setWorkspacePermissions(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec>;
  searchUsers(query: string): AxiosPromise<UserSpec[]>;
  tables(workspace: string, options: TablesOptionsSpec): AxiosPromise<Paginated<Table>>;
  table(workspace: string, table: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  graphs(workspace: string): AxiosPromise<Paginated<Graph>>;
  graph(workspace: string, graph: string): AxiosPromise<GraphSpec>;
  nodes(workspace: string, graph: string, options: OffsetLimitSpec): AxiosPromise<Paginated<TableRow>>;
  attributes(workspace: string, graph: string, nodeId: string): AxiosPromise<{}>;
  edges(workspace: string, graph: string, nodeId: string, options: EdgesOptionsSpec): AxiosPromise<Paginated<EdgesSpec>>;
  createWorkspace(workspace: string): AxiosPromise<string>;
  deleteWorkspace(workspace: string): AxiosPromise<string>;
  renameWorkspace(workspace: string, name: string): AxiosPromise<any>;
  uploadTable(workspace: string, table: string, options: FileUploadOptionsSpec, config?: AxiosRequestConfig): AxiosPromise<Array<{}>>;
  downloadTable(workspace: string, table: string): AxiosPromise<any>;
  deleteTable(workspace: string, table: string): AxiosPromise<string>;
  tableMetadata(workspace: string, table: string): AxiosPromise<TableMetadata>;
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
    return this.get('/user/info');
  };

  Proto.workspaces = function(): AxiosPromise<Paginated<Workspace>> {
    return this.get('workspaces');
  };

  Proto.getWorkspacePermissions = function(workspace: string): AxiosPromise<WorkspacePermissionsSpec> {
    return this.get(`workspaces/${workspace}/permissions`);
  };

  Proto.setWorkspacePermissions = function(workspace: string, permissions: WorkspacePermissionsSpec): AxiosPromise<WorkspacePermissionsSpec> {
    return this.put(`workspaces/${workspace}/permissions`, {
      params: permissions,
    });
  };

  Proto.searchUsers = function(query: string): AxiosPromise<UserSpec[]> {
    return this.get('/user/search', {
      params: {
        query,
      },
    });
  };

  Proto.tables = function(workspace: string, options: TablesOptionsSpec = {}): AxiosPromise<Paginated<Table>> {
    return this.get(`workspaces/${workspace}/tables`, {
      params: options,
    });
  };

  Proto.table = function(workspace: string, table: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/tables/${table}`, {
      params: options,
    });
  };

  Proto.graphs = function(workspace: string): AxiosPromise<Paginated<Graph>> {
    return this.get(`workspaces/${workspace}/graphs`);
  };

  Proto.graph = function(workspace: string, graph: string): AxiosPromise<GraphSpec> {
    return this.get(`workspaces/${workspace}/graphs/${graph}`);
  };

  Proto.nodes = function(workspace: string, graph: string, options: OffsetLimitSpec = {}): AxiosPromise<Paginated<TableRow>> {
    return this.get(`workspaces/${workspace}/graphs/${graph}/nodes`, {
      params: options,
    });
  };

  Proto.attributes = function(workspace: string, graph: string, nodeId: string): AxiosPromise<{}> {
    return this.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/attributes`);
  };

  Proto.edges = function(workspace: string, graph: string, nodeId: string, options: EdgesOptionsSpec = {}): AxiosPromise<Paginated<EdgesSpec>> {
    return this.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/edges`, {
      params: options,
    });
  };

  Proto.createWorkspace = function(workspace: string): AxiosPromise<string> {
    return this.post(`/workspaces/${workspace}`);
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

  Proto.uploadTable = async function(workspace: string, table: string, options: FileUploadOptionsSpec, cfg?: AxiosRequestConfig): Promise<AxiosResponse<Array<{}>>> {
    const headers = cfg ? cfg.headers : undefined;
    const params = cfg ? cfg.params : undefined;
    const { type, data, key, overwrite, columnTypes } = options;

    let text;

    if (typeof data === 'string') {
      text = data;
    } else {
      text = await fileToText(data);
    }

    let metadata;
    if (columnTypes) {
      const columns = Object.keys(columnTypes).map((column) => ({
        key: column,
        type: columnTypes[column],
      }));

      metadata = { columns };
    }

    return this.post(`/${type}/${workspace}/${table}`, text, {
      ...cfg,
      headers: { ...headers, 'Content-Type': 'text/plain' },
      params: {
        ...params,
        key: key || undefined,
        overwrite: overwrite || undefined,
        metadata: metadata || undefined,
      },
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

  Proto.createGraph = function(workspace: string, graph: string, options: CreateGraphOptionsSpec): AxiosPromise<CreateGraphOptionsSpec> {
    return this.post(`/workspaces/${workspace}/graphs/${graph}`, {
      edge_table: options.edgeTable,
    });
  };

  Proto.deleteGraph = function(workspace: string, graph: string): AxiosPromise<string> {
    return this.delete(`/workspaces/${workspace}/graphs/${graph}`);
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
