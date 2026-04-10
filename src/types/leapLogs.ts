export interface LeapLogStep {
  timestamp: string;
  app_instance: string | number;
  module_id: string;
  method: string;
  status: string | number;
  tid: string;
  system_source: string;
  execution_ms: string | number;
  payload: any;
  identifier?: string | null;
}

export interface LeapJourney {
  app_instance: number;
  msisdn: string;
  start_time: string;
  end_time: string;
  step_count: number;
  has_error: boolean;
  logs: LeapLogStep[];
}

export interface LeapParseResponse {
  success: boolean;
  data: LeapJourney[];
}
