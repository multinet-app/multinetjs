import axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface TableRow {
  _key: string;
  _id: string;
}

export interface GraphSpec {
  edgeTable: string;
  nodeTables: string[];
}

export interface NodesSpec {
  count: number;
  nodes: TableRow[];
}

export interface RowsSpec {
  count: number;
  rows: TableRow[];
}

export interface Edge {
  edge: string;
  from: string;
  to: string;
}

export interface EdgesSpec {
  count: number;
  edges: Edge[];
}

export interface UserSpec {
  family_name: string;
  given_name: string;
  name: string;
  picture: string;
  email: string;
  sub: string;
}

export interface WorkspacePermissionsSpec {
  owner: UserSpec;
  maintainers: UserSpec[];
  writers: UserSpec[];
  readers: UserSpec[];
  public: boolean;
}


export type TableType = 'all' | 'node' | 'edge';

export type TableUploadType = 'csv';
export type GraphUploadType = 'nested_json' | 'newick' | 'd3_json';
export type UploadType = TableUploadType | GraphUploadType;

export function validUploadType(type: string): type is UploadType {
  return ['csv', 'nested_json', 'newick', 'd3_json'].includes(type);
}

export type Direction = 'all' | 'incoming' | 'outgoing';

export interface TablesOptionsSpec {
  type?: TableType;
}

export interface OffsetLimitSpec {
  offset?: number;
  limit?: number;
}

export type EdgesOptionsSpec = OffsetLimitSpec & {
  direction?: Direction;
};

export type ColumnType = 'number' | 'label' | 'category' | 'date' | 'boolean';

export interface ColumnTypesEntry {
  key: string;
  type: ColumnType;
}

export interface ColumnTypes {
  [key: string]: ColumnType;
}

export interface TableMetadata {
  item_id: string;
  table: {
    columns: ColumnTypesEntry[];
  };
}

export interface FileUploadOptionsSpec {
  type: UploadType;
  data: string | File;
  key?: string;
  overwrite?: boolean;
  columnTypes?: {
    [key: string]: ColumnType;
  };
}

export interface CreateGraphOptionsSpec {
  edgeTable: string;
}

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

function extract<T>(promise: AxiosPromise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    promise.then((resp) => resolve(resp.data))
      .catch((err) => reject(err.response));
  });
}

class MultinetAPI {
  public axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
    });
  }

  public logout() {
    this.axios.get('/user/logout');
  }

  public _userInfo(): AxiosPromise<UserSpec | null> {
    return this.axios.get('/user/info');
  }

  public userInfo(): Promise<UserSpec | null> {
    return extract(this._userInfo());
  }

  public _workspaces(): AxiosPromise<string[]> {
    return this.axios.get('workspaces');
  }

  public workspaces(): Promise<string[]> {
    return extract(this._workspaces());
  }

  public _getWorkspacePermissions(workspace: string): AxiosPromise<WorkspacePermissionsSpec> {
    return this.axios.get(`workspaces/${workspace}/permissions`);
  }

  public getWorkspacePermissions(workspace: string): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return extract(this._getWorkspacePermissions(workspace));
  }

  public _setWorkspacePermissions(
    workspace: string, permissions: WorkspacePermissionsSpec
  ): AxiosPromise<WorkspacePermissionsSpec> {
    return this.axios.put(`workspaces/${workspace}/permissions`, {
      params: permissions,
    });
  }

  public setWorkspacePermissions(
    workspace: string, permissions: WorkspacePermissionsSpec
  ): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return extract(this._setWorkspacePermissions(workspace, permissions));
  }

  public _searchUsers(query: string): AxiosPromise<UserSpec[]> {
    return this.axios.get('/user/search', {
      params: {
        query,
      },
    });
  }

  public searchUsers(query: string): Promise<UserSpec[]> {
    return extract(this._searchUsers(query));
  }

  public _tables(workspace: string, options: TablesOptionsSpec = {}): AxiosPromise<string[]> {
    return this.axios.get(`workspaces/${workspace}/tables`, {
      params: options,
    });
  }

  public tables(workspace: string, options: TablesOptionsSpec = {}): Promise<string[]> {
    return extract(this._tables(workspace, options));
  }

  public _table(workspace: string, table: string, options: OffsetLimitSpec = {}): AxiosPromise<RowsSpec> {
    return this.axios.get(`workspaces/${workspace}/tables/${table}`, {
      params: options,
    });
  }

  public table(workspace: string, table: string, options: OffsetLimitSpec = {}): Promise<RowsSpec> {
    return extract(this._table(workspace, table, options));
  }

  public _graphs(workspace: string): AxiosPromise<string[]> {
    return this.axios.get(`workspaces/${workspace}/graphs`);
  }

  public graphs(workspace: string): Promise<string[]> {
    return extract(this._graphs(workspace));
  }

  public _graph(workspace: string, graph: string): AxiosPromise<GraphSpec> {
    return this.axios.get(`workspaces/${workspace}/graphs/${graph}`);
  }

  public graph(workspace: string, graph: string): Promise<GraphSpec> {
    return extract(this._graph(workspace, graph));
  }

  public _nodes(workspace: string, graph: string, options: OffsetLimitSpec = {}): AxiosPromise<NodesSpec> {
    return this.axios.get(`workspaces/${workspace}/graphs/${graph}/nodes`, {
      params: options,
    });
  }

  public nodes(workspace: string, graph: string, options: OffsetLimitSpec = {}): Promise<NodesSpec> {
    return extract(this._nodes(workspace, graph, options));
  }

  public _attributes(workspace: string, graph: string, nodeId: string): AxiosPromise<{}> {
    return this.axios.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/attributes`);
  }

  public attributes(workspace: string, graph: string, nodeId: string): Promise<{}> {
    return extract(this._attributes(workspace, graph, nodeId));
  }

  public _edges(
    workspace: string, graph: string, nodeId: string, options: EdgesOptionsSpec = {}
  ): AxiosPromise<EdgesSpec> {
    return this.axios.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/edges`, {
      params: options,
    });
  }

  public edges(workspace: string, graph: string, nodeId: string, options: EdgesOptionsSpec = {}): Promise<EdgesSpec> {
    return extract(this._edges(workspace, graph, nodeId, options));
  }

  public _createWorkspace(workspace: string): AxiosPromise<string> {
    return this.axios.post(`/workspaces/${workspace}`);
  }

  public createWorkspace(workspace: string): Promise<string> {
    return extract(this._createWorkspace(workspace));
  }

  public _deleteWorkspace(workspace: string): AxiosPromise<string> {
    return this.axios.delete(`/workspaces/${workspace}`);
  }

  public deleteWorkspace(workspace: string): Promise<string> {
    return extract(this._deleteWorkspace(workspace));
  }

  public _renameWorkspace(workspace: string, name: string): AxiosPromise<any> {
    return this.axios.put(`workspaces/${workspace}/name`, null, {
      params: {
        name,
      },
    });
  }

  public renameWorkspace(workspace: string, name: string): Promise<any> {
    return extract(this._renameWorkspace(workspace, name));
  }

  public async _uploadTable(
    workspace: string, table: string, options: FileUploadOptionsSpec, config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Array<{}>>> {
    const headers = config ? config.headers : undefined;
    const params = config ? config.params : undefined;
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

    return this.axios.post(`/${type}/${workspace}/${table}`, text, {
      ...config,
      headers: { ...headers, 'Content-Type': 'text/plain' },
      params: {
        ...params,
        key: key || undefined,
        overwrite: overwrite || undefined,
        metadata: metadata || undefined,
      },
    });
  }

  public async uploadTable(
    workspace: string, table: string, options: FileUploadOptionsSpec, config?: AxiosRequestConfig
  ): Promise<Array<{}>> {
    return extract(this._uploadTable(workspace, table, options, config));
  }

  public _downloadTable(workspace: string, table: string): AxiosPromise<any> {
    return this.axios.get(`/workspaces/${workspace}/tables/${table}/download`);
  }

  public downloadTable(workspace: string, table: string): Promise<any> {
    return extract(this._downloadTable(workspace, table));
  }

  public _deleteTable(workspace: string, table: string): AxiosPromise<string> {
    return this.axios.delete(`/workspaces/${workspace}/tables/${table}`);
  }

  public deleteTable(workspace: string, table: string): Promise<string> {
    return extract(this._deleteTable(workspace, table));
  }

  public _tableMetadata(workspace: string, table: string): AxiosPromise<TableMetadata> {
    return this.axios.get(`/workspaces/${workspace}/tables/${table}/metadata`);
  }

  public tableMetadata(workspace: string, table: string): Promise<TableMetadata> {
    return extract(this._tableMetadata(workspace, table));
  }

  public async tableColumnTypes(workspace: string, table: string): Promise<ColumnTypes> {
    const metadata = await this.tableMetadata(workspace, table);

    const types: ColumnTypes = {};
    metadata.table.columns.forEach((entry) => {
      types[entry.key] = entry.type;
    });
    return types;
  }

  public _createGraph(workspace: string, graph: string, options: CreateGraphOptionsSpec): AxiosPromise<string> {
    return this.axios.post(`/workspaces/${workspace}/graphs/${graph}`, {
      edge_table: options.edgeTable,
    });
  }

  public createGraph(workspace: string, graph: string, options: CreateGraphOptionsSpec): Promise<string> {
    return extract(this._createGraph(workspace, graph, options));
  }

  public _deleteGraph(workspace: string, graph: string): AxiosPromise<string> {
    return this.axios.delete(`/workspaces/${workspace}/graphs/${graph}`);
  }

  public deleteGraph(workspace: string, graph: string): Promise<string> {
    return extract(this._deleteGraph(workspace, graph));
  }

  public _aql(workspace: string, query: string): AxiosPromise<any[]> {
    return this.axios.post(`/workspaces/${workspace}/aql`, query, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  public aql(workspace: string, query: string): Promise<any[]> {
    return extract(this._aql(workspace, query));
  }

  public _createAQLTable(workspace: string, table: string, query: string): AxiosPromise<any[]> {
    return this.axios.post(`/workspaces/${workspace}/tables`, query, {
      headers: {
        'Content-Type': 'text/plain',
      },
      params: {
        table,
      },
    });
  }

  public createAQLTable(workspace: string, table: string, query: string): Promise<any[]> {
    return extract(this._createAQLTable(workspace, table, query));
  }

  public _downloadGraph(workspace: string, graph: string): AxiosPromise<any> {
    return this.axios.get(`/workspaces/${workspace}/graphs/${graph}/download`);
  }

  public downloadGraph(workspace: string, graph: string): Promise<any> {
    return extract(this._downloadGraph(workspace, graph));
  }
}

export function multinetApi(baseURL: string): MultinetAPI {
  return new MultinetAPI(baseURL);
}
