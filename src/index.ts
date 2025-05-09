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

export interface Network {
  id: number;
  name: string;
  created: string;
  modified: string;
}

export interface NetworkSpec {
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

export interface SingleUserWorkspacePermissionSpec {
  username: string;
  workspace: string;
  permission: number | null;
  permission_label: string | null;
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
  public: boolean;
  starred: boolean;
}

export type TableType = 'all' | 'node' | 'edge';

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

export type ColumnType = 'primary key' | 'edge source' | 'edge target' | 'label' | 'string' | 'boolean' | 'category' | 'number' | 'date' | 'ignored';

export interface ColumnTypes {
  [key: string]: ColumnType;
}

export interface TableUploadOptionsSpec {
  data: File;
  edgeTable: boolean;
  columnTypes?: Record<string, ColumnType>;
  fileType: 'json' | 'csv';
  delimiter?: string;
  quoteChar?: string;
}

export interface NetworkUploadOptionsSpec {
  data: File;
}

export interface CreateNetworkOptionsSpec {
  edgeTable: string;
}

export interface AQLQuerySpec {
  query: string;
  bind_vars: Record<string, string>;
}

export interface Session {
  id: number;
  created: string;
  modified: string;
  name: string;
  visapp: string;
  state: object;
  network?: number;
  table?: number;
  starred: boolean;
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

  public async getCurrentUserWorkspacePermissions(workspace: string): Promise<SingleUserWorkspacePermissionSpec> {
    if (!workspace) {
      throw new Error('argument "workspace" must not be empty');
    }

    return (await this.axios.getCurrentUserWorkspacePermissions(workspace)).data;
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

  public async networks(workspace: string): Promise<Paginated<Network>> {
    return (await this.axios.networks(workspace)).data;
  }

  public async network(workspace: string, network: string): Promise<NetworkSpec> {
    return (await this.axios.network(workspace, network)).data;
  }

  public async nodes(workspace: string, network: string, options: OffsetLimitSpec = {}): Promise<Paginated<TableRow>> {
    return (await this.axios.nodes(workspace, network, options)).data;
  }

  public async edges(workspace: string, network: string, options: EdgesOptionsSpec = {}): Promise<Paginated<EdgesSpec>> {
    return (await this.axios.edges(workspace, network, options)).data;
  }

  public async networkTables(workspace: string, network: string, type: TableType = 'all'): Promise<Table[]> {
    return (await this.axios.networkTables(workspace, network, type)).data;
  }

  public async createWorkspace(workspace: string): Promise<string> {
    return (await this.axios.createWorkspace(workspace)).data;
  }

  public async deleteWorkspace(workspace: string): Promise<string> {
    return (await this.axios.deleteWorkspace(workspace)).data;
  }

  public async forkWorkspace(workspace: string): Promise<Workspace> {
    return (await this.axios.forkWorkspace(workspace)).data;
  }

  public async renameWorkspace(workspace: string, name: string): Promise<Workspace> {
    return (await this.axios.renameWorkspace(workspace, name)).data;
  }

  public async uploadTable(workspace: string, table: string, options: TableUploadOptionsSpec): Promise<Array<{}>> {
    return (await this.axios.uploadTable(workspace, table, options)).data;
  }

  public async deleteTable(workspace: string, table: string): Promise<string> {
    return (await this.axios.deleteTable(workspace, table)).data;
  }

  public async columnTypes(workspace: string, table: string): Promise<ColumnTypes> {
    const types = (await this.axios.columnTypes(workspace, table)).data;
    return types;
  }

  public async uploadNetwork(workspace: string, network: string, data: File, nodeColumns: Record<string, ColumnType>, edgeColumns: Record<string, ColumnType>): Promise<Array<{}>> {
    return (await this.axios.uploadNetwork(workspace, network, data, nodeColumns, edgeColumns)).data;
  }

  public async createNetwork(workspace: string, network: string, options: CreateNetworkOptionsSpec): Promise<CreateNetworkOptionsSpec> {
    return (await this.axios.createNetwork(workspace, network, options)).data;
  }

  public async deleteNetwork(workspace: string, network: string): Promise<string> {
    return (await this.axios.deleteNetwork(workspace, network)).data;
  }

  public async aql(workspace: string, payload: AQLQuerySpec): Promise<any[]> {
    return (await this.axios.aql(workspace, payload)).data;
  }

  public async uploads(workspace: string): Promise<any> {
    return (await this.axios.uploads(workspace)).data;
  }

  public async createSession(workspace: string, itemId: number, type: 'network' | 'table', visApp: string, name: string): Promise<any> {
    return (await this.axios.createSession(workspace, itemId, type, visApp, name)).data;
  }

  public async listSessions(workspace: string, type: 'network' | 'table'): Promise<any> {
    return (await this.axios.listSessions(workspace, type)).data;
  }

  public async deleteSession(workspace: string, sessionId: number, type: 'network' | 'table'): Promise<any> {
    return (await this.axios.deleteSession(workspace, sessionId, type)).data;
  }

  public async updateSession(workspace: string, sessionId: number, type: 'network' | 'table', state: object): Promise<any> {
    return (await this.axios.updateSession(workspace, sessionId, type, state)).data;
  }

  public async renameSession(workspace: string, sessionId: number, type: 'network' | 'table', name: string): Promise<any> {
    return (await this.axios.renameSession(workspace, sessionId, type, name)).data;
  }

  public async getSession(workspace: string, sessionId: number, type: 'network' | 'table'): Promise<any> {
    return (await this.axios.getSession(workspace, sessionId, type)).data;
  }

  public async generateAltText(structured: boolean, data: object, title?: string, level?: number): Promise<any> {
    return (await this.axios.generateAltText(structured, data, title, level)).data;
  }

  public async networkBuildRequests(workspace: string): Promise<number[]> {
    return (await this.axios.networkBuildRequests(workspace)).data;
  }

}

export function multinetApi(baseURL: string): MultinetAPI {
  return new MultinetAPI(baseURL);
}

export function writeSharedLoginCookie(token: string, domain?: string) {
  if (domain === undefined) {
    domain = window.location.hostname.split('.').slice(-2).join('.');
  }
  document.cookie = `sharedLogin=${token}; Domain=${domain}`;
}

export function readSharedLoginCookie(): string | null {
  let value = null;

  const cookie = document.cookie.split('; ')
    .find((c) => c.startsWith('sharedLogin='));

  if (cookie !== undefined) {
    value = cookie.split('=')[1];
  }

  return value;
}

export function invalidateSharedLoginCookie(domain?: string) {
  if (domain === undefined) {
    domain = window.location.hostname.split('.').slice(-2).join('.');
  }
  document.cookie = `sharedLogin=; Domain=${domain}; Max-Age=0`;
}
