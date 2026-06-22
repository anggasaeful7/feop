export type ResourcePermission = {
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  manage?: boolean;
  export?: boolean;
  approve?: boolean;
  reject?: boolean;
  generate?: boolean;
  pay?: boolean;
};

export type ResourcePermissionsMap = {
  bill_components?: ResourcePermission;
  complaints?: ResourcePermission;
  facilities?: ResourcePermission;
  facility_bookings?: ResourcePermission;
  family_members?: ResourcePermission;
  financial_reports?: ResourcePermission;
  general_facilities?: ResourcePermission;
  guest_reports?: ResourcePermission;
  letter_requests?: ResourcePermission;
  notifications?: ResourcePermission;
  password_reset?: ResourcePermission;
  payment_fees?: ResourcePermission;
  persons?: ResourcePermission;
  platform_billing?: ResourcePermission;
  regions?: ResourcePermission;
  renovation_permits?: ResourcePermission;
  resident_bills?: ResourcePermission;
  resident_users?: ResourcePermission;
  schedules?: ResourcePermission;
  specific_billings?: ResourcePermission;
  units?: ResourcePermission;
  workspace_contacts?: ResourcePermission;
  [key: string]: ResourcePermission | undefined;
};

export type UserPermissionsScope = {
  workspace_id: string;
};

export type UserPermissionsData = {
  role: string;
  scope: UserPermissionsScope;
  resources: ResourcePermissionsMap;
};

export type UserPermissionsResponse = {
  data: UserPermissionsData;
};
