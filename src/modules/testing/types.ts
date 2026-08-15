export type TestLevel = 'UNIT' | 'INTEGRATION' | 'SECURITY' | 'E2E';

export interface TestItem {
  id: string;
  level: TestLevel;
  name: string;
  description: string;
  status: 'IDLE' | 'RUNNING' | 'PASSED' | 'FAILED';
  durationMs?: number;
  message?: string;
  details?: any;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  items: TestItem[];
}
