export type CleaningSchedule = {
  id: string;
  workspace_id: string;
  activity: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CleaningSchedulePayload = {
  activity: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
};

export type SecuritySchedule = {
  id: string;
  workspace_id: string;
  officer_name: string;
  shift_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type SecuritySchedulePayload = {
  officer_name: string;
  shift_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  notes: string;
};

export type BulkCleaningSchedulePayload = {
  items: CleaningSchedulePayload[];
};

export type BulkSecuritySchedulePayload = {
  items: SecuritySchedulePayload[];
};
