export interface Action {
  distance: string; // 距離
  place: string; // 地點
  carType: string; // 車種
  oil: string; // 油耗
  time: string;
}

export interface ActionResponse {
  action: Action;
  timestamp: number;
  id: string;
}

export interface totalRecords {
  email: string;
  id: string;
  name: string;
  records: ActionResponse[];
  totalCount: number;
  totalDistance: number;
  totalOil: number;
  totalTime: number;
  totalPoints: number;
}

export interface TotalRecord {
  totalDistance: string;
  totalCount: string;
  totalOil: string;
}

export interface TaskOptions {
  title: string;
  target: string;
  point: string;
}

export interface TotalUserDataRecord {
  email: string;
  id: string;
  name: string;
  records?: ActionResponse[];
}

export interface PercentProgress {
  distance: string;
  count: string;
  oil: string;
}

export interface TaskProgress {
  title: string;
  current: string;
  target: string;
  unit: string;
  percent: string;
  point: string;
}
