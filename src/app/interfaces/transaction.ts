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
    pocket?: string;
  }
  destination?: {
    name: string;
    pocket?: string;
  }

  dateText?: string;
  isLastOfDay?: boolean;
}
