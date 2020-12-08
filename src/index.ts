import { Client } from './client';
import { AxiosPromise, AxiosRequestConfig } from 'axios';

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

class MultinetAPI {
  private client: Client;

  constructor(baseURL: string) {
    this.client = new Client(baseURL);
  }

  public logout() {
    this.client.get('/user/logout');
  }

  public userInfo(): Promise<UserSpec | null> {
    return this.client.get('/user/info');
  }

  public workspaces(): Promise<string[]> {
    return this.client.get('workspaces');
  }

  public getWorkspacePermissions(workspace: string): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return this.client.get(`workspaces/${workspace}/permissions`);
  }

  public setWorkspacePermissions(
    workspace: string, permissions: WorkspacePermissionsSpec
  ): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return this.client.put(`workspaces/${workspace}/permissions`, permissions);
  }

  public searchUsers(query: string): Promise<UserSpec[]> {
    return this.client.get('/user/search', { query });
  }

  public tables(workspace: string, options: TablesOptionsSpec = {}): Promise<string[]> {
    return this.client.get(`workspaces/${workspace}/tables`, options);
  }

  public table(workspace: string, table: string, options: OffsetLimitSpec = {}): Promise<RowsSpec> {
    return this.client.get(`workspaces/${workspace}/tables/${table}`, options);
  }

  public graphs(workspace: string): Promise<string[]> {
    return this.client.get(`workspaces/${workspace}/graphs`);
  }

  public graph(workspace: string, graph: string): Promise<GraphSpec> {
    return this.client.get(`workspaces/${workspace}/graphs/${graph}`);
  }

  public nodes(workspace: string, graph: string, options: OffsetLimitSpec = {}): Promise<NodesSpec> {
    return this.client.get(`workspaces/${workspace}/graphs/${graph}/nodes`, options);
  }

  public attributes(workspace: string, graph: string, nodeId: string): Promise<{}> {
    return this.client.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/attributes`);
  }

  public edges(workspace: string, graph: string, nodeId: string, options: EdgesOptionsSpec = {}): Promise<EdgesSpec> {
    return this.client.get(`workspaces/${workspace}/graphs/${graph}/nodes/${nodeId}/edges`, options);
  }

  public createWorkspace(workspace: string): Promise<string> {
    return this.client.post(`/workspaces/${workspace}`);
  }

  public deleteWorkspace(workspace: string): Promise<string> {
    return this.client.delete(`/workspaces/${workspace}`);
  }

  public renameWorkspace(workspace: string, name: string): AxiosPromise {
    return this.client.axios.put(`workspaces/${workspace}/name`, null, { params: { name } });
  }

  public async uploadTable(
    workspace: string, table: string, options: FileUploadOptionsSpec, config?: AxiosRequestConfig
  ): Promise<Array<{}>> {
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

    return this.client.post(`/${type}/${workspace}/${table}`, text, {
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

  public downloadTable(workspace: string, table: string): AxiosPromise {
    return this.client.axios.get(`/workspaces/${workspace}/tables/${table}/download`);
  }

  public deleteTable(workspace: string, table: string): Promise<string> {
    return this.client.delete(`/workspaces/${workspace}/tables/${table}`);
  }

  public tableMetadata(workspace: string, table: string): Promise<TableMetadata> {
    return this.client.get(`/workspaces/${workspace}/tables/${table}/metadata`);
  }

  public async tableColumnTypes(workspace: string, table: string): Promise<ColumnTypes> {
    const metadata = await this.tableMetadata(workspace, table);

    const types: ColumnTypes = {};
    metadata.table.columns.forEach((entry) => {
      types[entry.key] = entry.type;
    });
    return types;
  }

  public createGraph(workspace: string, graph: string, options: CreateGraphOptionsSpec): Promise<string> {
    return this.client.post(`/workspaces/${workspace}/graphs/${graph}`, {
      edge_table: options.edgeTable,
    });
  }

  public deleteGraph(workspace: string, graph: string): Promise<string> {
    return this.client.delete(`/workspaces/${workspace}/graphs/${graph}`);
  }

  public aql(workspace: string, query: string): Promise<any[]> {
    return this.client.post(`/workspaces/${workspace}/aql`, query, { headers: { 'Content-Type': 'text/plain' } });
  }

  public createAQLTable(workspace: string, table: string, query: string): Promise<any[]> {
    return this.client.post(`/workspaces/${workspace}/tables`, query, {
      headers: { 'Content-Type': 'text/plain' },
      params: {
        table,
      },
    });
  }

  public downloadGraph(workspace: string, graph: string): AxiosPromise {
    return this.client.axios.get(`/workspaces/${workspace}/graphs/${graph}/download`);
  }
}

export function multinetApi(baseURL: string): MultinetAPI {
  return new MultinetAPI(baseURL);
}
