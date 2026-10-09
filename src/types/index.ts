export type ModuleId =
  | 'path_algebra'
  | 'text_io'
  | 'spreadsheet_io'
  | 'binary_db'
  | 'case_studies'
  | 'code_engine'
  | 'ai_diagnosis'
  | 'workflow_pipeline'
  | 'export_reports'
  | 'knowledge_slices';

export interface ModuleMeta {
  id: ModuleId;
  index: number;
  title: string;
  subtitle: string;
  icon: string;
  category: '基础与建模' | '格式实操' | '工程实战' | '智能与体系';
}

export interface DelimiterOption {
  label: string;
  value: string;
  name: string;
  sample: string;
}

export interface EncodingOption {
  code: string;
  name: string;
  description: string;
  sampleByte: string;
  normalText: string;
  corruptedText: string;
}

export interface BenchmarkItem {
  format: string;
  pkg: string;
  writeTimeMs: number;
  readTimeMs: number;
  fileSizeBytes: number;
  memoryPeakMb: number;
  preservesTypes: boolean;
  crossLanguage: boolean;
  notes: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  tag: string;
  scale: string;
  industry: string;
  background: string;
  challenge: string;
  solutionSummary: string;
  rCode: string;
  pythonCode?: string;
  sampleData: Array<Record<string, any>>;
  metrics: {
    datasetRows: string;
    throughput: string;
    compressionRatio: string;
    speedup: string;
  };
}

export interface KnowledgeSlice {
  id: string;
  sliceNumber: string;
  title: string;
  tag: string;
  summary: string;
  theory: string[];
  codeContrast: {
    badLabel: string;
    badCode: string;
    goodLabel: string;
    goodCode: string;
  };
  keyTakeaway: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rSnippet?: string;
}
