export type Account = AccountData & Partial<ActiveAccount> & Partial<PassiveAccount> & (
  ({ isActive: true } & ActiveAccount & AllUndefined<PassiveAccount>) |
  ({ isActive: false } & PassiveAccount & AllUndefined<ActiveAccount>)
);

type AllUndefined<T> = {
  [K in keyof T]?: undefined;
};

interface AccountData {
  id: string;
  name: string;
  value: number;
  order: number;
}

interface ActiveAccount {
  monthExpenses: {
    value: number;
    lastUpdate: Date;
  }
  boxValue?: number;
  pockets: Pocket[];
}

interface PassiveAccount {
  limit: number;
}

export interface Pocket {
  name: string;
  value: number;
}