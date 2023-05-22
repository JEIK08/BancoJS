export interface Account {
  id: string;
  name: string;
  isActive: boolean;
  value: number;
  debt?: number;
  account: Account;
  innerAccounts: Account[];
}
