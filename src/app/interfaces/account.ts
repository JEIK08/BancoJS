export interface Account<IsActive extends boolean = true> {
  id: string;
  name: string;
  isActive: boolean;
  value: number;
  debt: IsActive extends true ? number : undefined;
  pockets: IsActive extends true ? Pocket[] : undefined;
}

export interface Pocket {
  name: string;
  value: number;
}