export interface Account {
  id: string;
  name: string;
  isActive: boolean;
  value: number;
  debt?: number;
  pockets?: Pocket[];
}

export interface Pocket {
  name: string;
  value: number;
}