import { ModuleMeta } from '../types';

export const MODULES_CONFIG: ModuleMeta[] = [
  {
    id: 'path_algebra',
    index: 1,
    title: '路径与流代数建模',
    subtitle: 'setwd() 机理、相对/绝对路径解析、f:Path×Stream→Object 与内存映射',
    icon: 'Network',
    category: '基础与建模'
  },
  {
    id: 'text_io',
    index: 2,
    title: '文本格式 (CSV/TSV/TXT) 读写',
    subtitle: 'read.csv vs readr vs data.table 对比、分隔符与 GBK/UTF-8 乱码演播',
    icon: 'FileText',
    category: '格式实操'
  },
  {
    id: 'spreadsheet_io',
    index: 3,
    title: '复杂电子表格 (Excel/SPSS/SAS)',
    subtitle: 'readxl, openxlsx 与 haven；多Sheet合并、样式写出与Value Labels转换',
    icon: 'Sheet',
    category: '格式实操'
  },
  {
    id: 'binary_db',
    index: 4,
    title: '二进制与数据库 (RDS/Parquet/SQLite)',
    subtitle: 'readRDS, arrow::read_parquet 与 RSQLite；列式压缩比及零拷贝加载',
    icon: 'Database',
    category: '格式实操'
  },
  {
    id: 'case_studies',
    index: 5,
    title: '四大文件读写实战案例库',
    subtitle: 'GB级金融Tick、生信多Sheet合并、R/Python Parquet跨语言与高并发SQLite',
    icon: 'Briefcase',
    category: '工程实战'
  },
  {
    id: 'code_engine',
    index: 6,
    title: 'R / Tidyverse 代码引擎',
    subtitle: '实时参数改写 setwd, read_csv, fread, write_parquet 并模拟虚拟终端运行',
    icon: 'Terminal',
    category: '工程实战'
  },
  {
    id: 'ai_diagnosis',
    index: 7,
    title: 'AI 诊断与大模型 Q&A 随诊',
    subtitle: '随诊 No such file, 转义异常, 内存溢出 OOM 与字符乱码，Gemini 智能交互',
    icon: 'BotMessageSquare',
    category: '智能与体系'
  },
  {
    id: 'workflow_pipeline',
    index: 8,
    title: '全流程导引流水线',
    subtitle: '路径设置 → 文件读入 → 内存加工 → 持久化写出 四步状态机导引',
    icon: 'GitFork',
    category: '智能与体系'
  },
  {
    id: 'export_reports',
    index: 9,
    title: '数据集与分析报告导出',
    subtitle: '导出 CSV/Parquet 实体、Benchmark 基准比对、R 会话环境清单与 Markdown/PDF',
    icon: 'DownloadCloud',
    category: '智能与体系'
  },
  {
    id: 'knowledge_slices',
    index: 10,
    title: '读写与工作路径知识切片',
    subtitle: '切片一至五精粹 (含R包管理与全局设置)、三大读写陷阱与互动自测',
    icon: 'BookOpenCheck',
    category: '基础与建模'
  }
];
