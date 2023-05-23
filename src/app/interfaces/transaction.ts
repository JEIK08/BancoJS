export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER'
}

export interface Transaction {
  description: string;
  type: TransactionType;
  value: number;
  date: Date;
  account: string;
  activeAccount?: string;
  installments?: number;
  destination?: string;
  affectDebts?: boolean;
}
