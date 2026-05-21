export type BillingComponent = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  isPaid: boolean;
};

export type UnitDummy = {
  id: string;
  code: string;
  residentName: string;
  activeComponents: string;
};
