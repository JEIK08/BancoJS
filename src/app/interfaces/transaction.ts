export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER'
}

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  value: number;
  date: Date;
  account: {
    name: string;
    isActive: boolean;
    pocket?: string;
  }
  destination?: {
    name: string;
    isActive: boolean;
    pocket?: string;
  }
}
