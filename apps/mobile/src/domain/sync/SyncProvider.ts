export interface SyncProvider {
  readonly id: string;
  readonly displayName: string;
  isAuthenticated(): Promise<boolean>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  pushDirty(): Promise<void>;
  pullRemote(since: number): Promise<void>;
}
