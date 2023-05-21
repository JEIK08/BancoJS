export interface Account {
  name: string;
  isActive: boolean;
  value: number;
  debt?: number;
  account?: Account;
}
