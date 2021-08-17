import { multinetAxiosInstance, MultinetAxiosInstance } from './axios';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Table {
  name: string;
  edge: boolean;
  id: number;
  created: string;
  modified: string;
  workspace: Workspace;
}

export interface TableRow {
  _key: string;
  _id: string;
  _rev: string;
}

export interface Graph {
  id: number;
  name: string;
  created: string;
  modified: string;
}

export interface GraphSpec {
  id: number;
  name: string;
  node_count: number;
  edge_count: number;
  created: string;
  modified: string;
  workspace: Workspace;
}

export interface EdgesSpec {
  _key: string;
  _id: string;
  _from: string;
  _to: string;
  _rev: string;
}

export interface UserSpec {
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  email: string;
  id: number;
}

export interface WorkspacePermissionsSpec {
  owner: UserSpec;
  maintainers: UserSpec[];
  writers: UserSpec[];
  readers: UserSpec[];
  public: boolean;
}

export interface Workspace {
  id: number;
  name: string;
  created: string;
  modified: string;
  arango_db_name: string;
}



export type TableType = 'all' | 'node' | 'edge';

export type TableUploadType = 'csv';
export type GraphUploadType = 'nested_json' | 'newick' | 'd3_json';
export type UploadType = TableUploadType | GraphUploadType;

export function validTableUploadType(type: string): type is TableUploadType {
  return type === 'csv';
}

export function validGraphUploadType(type: string): type is GraphUploadType {
  return ['nested_json', 'newick', 'd3_json'].includes(type);
}

export function validUploadType(type: string): type is UploadType {
  return validTableUploadType(type) || validGraphUploadType(type);
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

export interface TableUploadOptionsSpec {
  data: File;
  edgeTable: boolean;
  columnTypes?: {
    [key: string]: ColumnType;
  };
}

export interface NetworkUploadOptionsSpec {
  data: File;
  type: GraphUploadType;
}

export interface CreateGraphOptionsSpec {
  edgeTable: string;
}

class MultinetAPI {
  public axios: MultinetAxiosInstance;

  constructor(baseURL: string) {
    this.axios = multinetAxiosInstance({ baseURL });

  }

  public logout(): void {
    this.axios.logout();
  }

  public async userInfo(): Promise<UserSpec | null> {
    return (await this.axios.userInfo()).data;
  }

  public async workspaces(): Promise<Paginated<Workspace>> {
    return (await this.axios.workspaces()).data;
  }

  public async getWorkspacePermissions(workspace: string): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return (await this.axios.getWorkspacePermissions(workspace)).data;
  }

  public async setWorkspacePermissions(
    workspace: string, permissions: WorkspacePermissionsSpec
  ): Promise<WorkspacePermissionsSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return (await this.axios.setWorkspacePermissions(workspace, permissions)).data;
  }

  public async searchUsers(username: string): Promise<UserSpec[]> {
    return (await this.axios.searchUsers(username)).data;
  }

  public async tables(workspace: string, options: TablesOptionsSpec = {}): Promise<Paginated<Table>> {
    return (await this.axios.tables(workspace, options)).data;
  }

  public async table(workspace: string, table: string, options: OffsetLimitSpec = {}): Promise<Paginated<TableRow>> {
    return (await this.axios.table(workspace, table, options)).data;
  }

  public async graphs(workspace: string): Promise<Paginated<Graph>> {
    return (await this.axios.graphs(workspace)).data;
  }

  public async graph(workspace: string, graph: string): Promise<GraphSpec> {
    return (await this.axios.graph(workspace, graph)).data;
  }

  public async nodes(workspace: string, graph: string, options: OffsetLimitSpec = {}): Promise<Paginated<TableRow>> {
    return (await this.axios.nodes(workspace, graph, options)).data;
  }

  public async edges(workspace: string, graph: string, options: EdgesOptionsSpec = {}): Promise<Paginated<EdgesSpec>> {
    return (await this.axios.edges(workspace, graph, options)).data;
  }

  public async createWorkspace(workspace: string): Promise<string> {
    return (await this.axios.createWorkspace(workspace)).data;
  }

  public async deleteWorkspace(workspace: string): Promise<string> {
    return (await this.axios.deleteWorkspace(workspace)).data;
  }

  public async renameWorkspace(workspace: string, name: string): Promise<any> {
    return (await this.axios.renameWorkspace(workspace, name)).data;
  }

  public async uploadTable(workspace: string, table: string, options: TableUploadOptionsSpec): Promise<Array<{}>> {
    return (await this.axios.uploadTable(workspace, table, options)).data;
  }

  public async downloadTable(workspace: string, table: string): Promise<any> {
    return (await this.axios.downloadTable(workspace, table)).data;
  }

  public async deleteTable(workspace: string, table: string): Promise<string> {
    return (await this.axios.deleteTable(workspace, table)).data;
  }

  public async tableMetadata(workspace: string, table: string): Promise<TableMetadata> {
    return (await this.axios.tableMetadata(workspace, table)).data;
  }

  public async tableColumnTypes(workspace: string, table: string): Promise<ColumnTypes> {
    const metadata = await this.tableMetadata(workspace, table);

    const types: ColumnTypes = {};
    metadata.table.columns.forEach((entry) => {
      types[entry.key] = entry.type;
    });
    return types;
  }

  public async uploadNetwork(workspace: string, network: string, options: NetworkUploadOptionsSpec): Promise<Array<{}>> {
    return (await this.axios.uploadNetwork(workspace, network, options)).data;
  }

  public async createGraph(workspace: string, graph: string, options: CreateGraphOptionsSpec): Promise<CreateGraphOptionsSpec> {
    return (await this.axios.createGraph(workspace, graph, options)).data;
  }

  public async deleteGraph(workspace: string, graph: string): Promise<string> {
    return (await this.axios.deleteGraph(workspace, graph)).data;
  }

  public async aql(workspace: string, query: string): Promise<any[]> {
    return (await this.axios.aql(workspace, query)).data;
  }

  public async createAQLTable(workspace: string, table: string, query: string): Promise<any[]> {
    return (await this.axios.createAQLTable(workspace, table, query)).data;
  }

  public async downloadGraph(workspace: string, graph: string): Promise<any> {
    return (await this.axios.downloadGraph(workspace, graph)).data;
  }
}

export function multinetApi(baseURL: string): MultinetAPI {
  return new MultinetAPI(baseURL);
}
