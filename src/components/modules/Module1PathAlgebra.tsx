import React, { useState } from 'react';
import { CodeSnippet } from '../common/CodeSnippet';
import { KatexMath } from '../common/KatexMath';
import {
  FolderTree,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Calculator,
  Sigma
} from 'lucide-react';

export const Module1PathAlgebra: React.FC = () => {
  // Working Directory Resolver State
  const [selectedOS, setSelectedOS] = useState<'windows' | 'unix'>('windows');
  const [rootDir, setRootDir] = useState(
    selectedOS === 'windows' ? 'C:/Projects/BioInformatics' : '/Users/analyst/BioInformatics'
  );
  const [subDir, setSubDir] = useState('data/raw_experiments');
  const [fileName, setFileName] = useState('expression_matrix.csv');
  const [inputRawPath, setInputRawPath] = useState(
    selectedOS === 'windows'
      ? 'C:\\Projects\\BioInformatics\\data\\raw_experiments\\expression_matrix.csv'
      : '/Users/analyst/BioInformatics/data/raw_experiments/expression_matrix.csv'
  );

  // Math formula tab selection in 1.1
  const [activeFormulaTab, setActiveFormulaTab] = useState<'mapping' | 'path_resolve' | 'lexer_types' | 'mmap_zerocopy'>('mapping');

  // Memory & Chunking Algebra State
  const [datasetMb, setDatasetMb] = useState<number>(1200); // 1.2 GB
  const [chunkSizeMb, setChunkSizeMb] = useState<number>(150); // 150 MB
  const [ramSizeGb, setRamSizeGb] = useState<number>(8); // 8 GB

  // Algebra calculations
  const chunkCount = Math.ceil(datasetMb / chunkSizeMb);
  const unchunkedPeakRamMb = Math.round(datasetMb * 3.8); // Base R expands 3~4x due to tokens and copying
  const chunkedPeakRamMb = Math.round(chunkSizeMb * 1.35 + 40); // 1.35x chunk size
  const ramBudgetExceeded = unchunkedPeakRamMb > (ramSizeGb * 1024 * 0.7);
  const memorySavedPercent = Math.round((1 - chunkedPeakRamMb / unchunkedPeakRamMb) * 100);

  // Check Windows backslash danger
  const hasUnescapedBackslash = inputRawPath.includes('\\') && !inputRawPath.includes('\\\\');
  const normalizedPath = inputRawPath.replace(/\\+/g, '/');

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <span>模块 01 · 基础与建模</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              工作路径与数据流代数建模 (Working Directory & Stream Algebra)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              形式化解析 R 语言环境下的工作目录定位机理 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">setwd()</code> 与 <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">here::here()</code>，
              建立数据读写映射 <span className="font-serif italic font-semibold text-slate-800">
                <KatexMath math="f: \text{Path} \times \mathcal{S}_{\text{ByteStream}} \longrightarrow \mathcal{R}_{\text{HeapObject}}" />
              </span>，并从底层推导内存映射 (mmap) 与分块迭代加载的代数开销。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-mono text-indigo-700 font-bold">
              <KatexMath math="f(\text{Path}, \mathcal{S})" />
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-700 font-medium">Data Frame / Tibble</span>
          </div>
        </div>
      </div>

      {/* 切片 1: 形式化代数模型与内存拓扑图 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sigma className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1.1 数据流读写映射代数方程 (Formal Algebraic Mapping · KaTeX)
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold">
              KaTeX 形式化渲染
            </span>
          </div>

          {/* Formula Sub-tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px]">
            <button
              onClick={() => setActiveFormulaTab('mapping')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                activeFormulaTab === 'mapping'
                  ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              复合函数总映射
            </button>
            <button
              onClick={() => setActiveFormulaTab('path_resolve')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                activeFormulaTab === 'path_resolve'
                  ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              路径寻址代数
            </button>
            <button
              onClick={() => setActiveFormulaTab('lexer_types')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                activeFormulaTab === 'lexer_types'
                  ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              词法分词与向量分配
            </button>
            <button
              onClick={() => setActiveFormulaTab('mmap_zerocopy')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                activeFormulaTab === 'mmap_zerocopy'
                  ? 'bg-white font-bold text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              零拷贝映射算子
            </button>
          </div>

          {/* KaTeX Formula Display Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed space-y-3 shadow-inner">
            {activeFormulaTab === 'mapping' && (
              <>
                <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                  <span>// 定理 1.1: 数据文件读入的抽象复合函数映射管线</span>
                  <span className="text-slate-400 font-normal">f = Parse ∘ Lex ∘ Stream</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-white">
                  <KatexMath
                    block
                    math="f: \text{Path}_{\text{abs}} \times \mathcal{S}_{\text{ByteStream}} \xrightarrow{\quad\mathcal{P} \circ \mathcal{L}\quad} \mathcal{R}_{\text{HeapObject}}"
                  />
                </div>
                <p className="text-slate-300 text-[11px] leading-normal font-sans">
                  输入空间由规范化绝对文件路径 <KatexMath math="\text{Path}_{\text{abs}}" className="text-amber-300" /> 与底层离散磁盘字节序列 <KatexMath math="\mathcal{S} = [b_0, b_1, \dots, b_{N-1}]" className="text-emerald-300" /> 张成，输出为 R 运行期堆内存中的 S3/S4 向量对象 <KatexMath math="\mathcal{R} \in \mathbf{DF}(M \times K)" className="text-indigo-300" />。
                </p>
              </>
            )}

            {activeFormulaTab === 'path_resolve' && (
              <>
                <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                  <span>// 定理 1.2: 工作路径 (CWD) 与相对/绝对路径解析方程</span>
                  <span className="text-slate-400 font-normal">Resolve(CWD, Rel)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-white">
                  <KatexMath
                    block
                    math="\text{Path}_{\text{abs}} = \mathcal{R}_{\text{cwd}}(\text{Path}_{\text{input}}) = \begin{cases} \text{Path}_{\text{input}}, & \text{if } \text{Path}_{\text{input}} \in \mathbb{P}_{\text{absolute}} \\ \text{CWD} \mathbin{\scalebox{0.8}{\big/}} \text{Path}_{\text{input}}, & \text{if } \text{Path}_{\text{input}} \in \mathbb{P}_{\text{relative}} \end{cases}"
                  />
                </div>
                <p className="text-slate-300 text-[11px] leading-normal font-sans">
                  其中当前工作目录 <KatexMath math="\text{CWD} = \text{getwd()}" className="text-amber-300" />。若路径硬编码，跨宿主机移植时 <KatexMath math="\text{CWD} \cap \text{Target} = \emptyset" className="text-red-400" /> 必触发 <span className="font-mono text-red-300">No such file</span> 故障；使用 <KatexMath math="\text{here::here()}" className="text-emerald-300" /> 能够锚定项目根节点。
                </p>
              </>
            )}

            {activeFormulaTab === 'lexer_types' && (
              <>
                <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                  <span>// 定理 1.3: 分词矩阵投影与向量内存分配算子</span>
                  <KatexMath math="\mathcal{L}_{\text{sep}} \to \mathbf{T}_{M \times K}" className="text-slate-400 font-normal" />
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-white">
                  <KatexMath
                    block
                    math="\mathcal{L}_{(\text{sep}, \text{quote})}: \mathcal{S} \longrightarrow \mathbf{T}_{M \times K} = \begin{bmatrix} \tau_{1,1} & \cdots & \tau_{1,K} \\ \vdots & \ddots & \vdots \\ \tau_{M,1} & \cdots & \tau_{M,K} \end{bmatrix} \xrightarrow{\mathcal{P}_{\text{type}}} \begin{bmatrix} \mathbf{v}_1 & \cdots & \mathbf{v}_K \end{bmatrix}"
                  />
                </div>
                <p className="text-slate-300 text-[11px] leading-normal font-sans">
                  总堆内存消耗公式：
                  <KatexMath
                    block
                    math="\text{Heap}_{\text{Total}} = \sum_{j=1}^{K} \left( M \cdot \text{sizeof}(\text{type}_j) \right) + K \cdot \Omega_{\text{SEXP}} + \text{Vcells} \cdot 8\text{B} + \text{Ncells} \cdot 56\text{B}"
                  />
                </p>
              </>
            )}

            {activeFormulaTab === 'mmap_zerocopy' && (
              <>
                <div className="flex justify-between items-center text-amber-300 font-bold text-[11px]">
                  <span>// 定理 1.4: Apache Arrow 零拷贝 (Zero-Copy) 系统调用映射</span>
                  <KatexMath math="\Phi_{\text{mmap}}" className="text-slate-400 font-normal" />
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-white">
                  <KatexMath
                    block
                    math="\Phi_{\text{mmap}}: \text{FD} \times \text{Offset} \longrightarrow \text{Addr}_{\text{VirtualMem}} \implies \Delta \text{CopyBytes} = 0"
                  />
                </div>
                <p className="text-slate-300 text-[11px] leading-normal font-sans">
                  通过 Linux/POSIX 内核虚拟内存映射与 R 语言的 ALTREP 指针挂载，绕过逐行分词与深度复制，将加载耗时从 <KatexMath math="\mathcal{O}(N)" className="text-amber-300" /> 直接降维至 <KatexMath math="\mathcal{O}(1)" className="text-emerald-300" />。
                </p>
              </>
            )}

            <div className="text-slate-400 text-[11px] font-sans border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
              <div>• 字节空间大小: <KatexMath math="N = |\mathcal{S}| \text{ Bytes}" className="text-slate-200" /></div>
              <div>• 矩阵行列规格: <KatexMath math="M \text{ 观测 } \times K \text{ 属性}" className="text-slate-200" /></div>
            </div>
          </div>

          {/* 内存流转示意图 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              物理磁盘 → OS Page Cache → R 堆内存流转链路
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-mono">第 1 阶：磁盘扇区</div>
                <div className="font-bold text-slate-800 text-xs mt-1">Sectors / SSD Blocks</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  <KatexMath math="\mathcal{S} = [b_0, \dots, b_N]" /> 原始二进制流
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-indigo-200 shadow-2xs">
                <div className="text-[10px] text-indigo-600 uppercase font-mono">第 2 阶：操作系统层</div>
                <div className="font-bold text-indigo-900 text-xs mt-1">OS Page Cache / mmap</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  <KatexMath math="\Phi_{\text{mmap}}" /> 零拷贝直接挂载
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-400 uppercase font-mono">第 3 阶：R 运行时堆</div>
                <div className="font-bold text-slate-800 text-xs mt-1">R Heap (Vcells / Ncells)</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  分配原子向量并触发 GC 回收
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1.2 交互式路径解析与 Windows 转义诊断沙盒 */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1.2 交互式路径解析与转义沙盒
              </h3>
            </div>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => {
                  setSelectedOS('windows');
                  setRootDir('C:/Projects/BioInformatics');
                  setInputRawPath('C:\\Projects\\BioInformatics\\data\\raw_experiments\\expression_matrix.csv');
                }}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedOS === 'windows' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => {
                  setSelectedOS('unix');
                  setRootDir('/Users/analyst/BioInformatics');
                  setInputRawPath('/Users/analyst/BioInformatics/data/raw_experiments/expression_matrix.csv');
                }}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedOS === 'unix' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                macOS / Linux
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                测试路径输入 (模拟用户代码中的路径字符串)：
              </label>
              <input
                type="text"
                value={inputRawPath}
                onChange={(e) => setInputRawPath(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* 警告切片: 反斜杠转义风险 */}
            {hasUnescapedBackslash && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>致命警报：检测到 Windows 未转义反斜杠 \</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  在 R 词法解析中，单独的反斜杠会被当作转义字符处理（例如 <code className="bg-amber-100 px-1 rounded">\r</code> 会被误认为回车符）。在代码中执行将导致 <span className="font-mono text-red-600">unrecognized escape sequence</span> 语法错误！
                </p>
                <div className="text-[11px] pt-1">
                  <span className="font-semibold">一键修复建议：</span>
                  全平台一律改用正斜杠 <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-indigo-700 font-bold">/</code>
                </div>
              </div>
            )}

            {!hasUnescapedBackslash && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>路径格式安全：已正确使用正斜杠规范，跨平台完全兼容。</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] text-slate-500">规范化解析对比 (Normalization)：</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">normalizePath(..., winslash="/"):</span>
                <span className="font-mono text-indigo-700 font-medium truncate max-w-[220px]">
                  {normalizedPath}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">here::here("data", ...):</span>
                <span className="font-mono text-emerald-700 font-medium truncate max-w-[220px]">
                  here("data", "raw_experiments", "{fileName}")
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 切片 2: 内存映射与分块加载 (Chunking) 代数推导引擎 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              1.3 分块加载 (Chunking) 与内存映射 (mmap) 代数推导模拟器
            </h3>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>推导公式：</span>
            <KatexMath math="k = \left\lceil \frac{S_{\text{Total}}}{S_{\text{Chunk}}} \right\rceil" />
            <span className="text-slate-300">|</span>
            <KatexMath math="\text{PeakRAM}_{\text{Chunk}} \ll \alpha \cdot S_{\text{Total}}" />
          </div>
        </div>

        {/* 调节参数滑块 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>待读取文件总量 (Size)：</span>
              <span className="font-mono text-indigo-600 font-bold">{datasetMb} MB</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={datasetMb}
              onChange={(e) => setDatasetMb(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">相当于 {(datasetMb / 1024).toFixed(2)} GB 磁盘文本</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>单次分块大小 (Chunk Size)：</span>
              <span className="font-mono text-indigo-600 font-bold">{chunkSizeMb} MB</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={chunkSizeMb}
              onChange={(e) => setChunkSizeMb(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">推荐范围：50 MB ~ 250 MB</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>机器可用物理 RAM：</span>
              <span className="font-mono text-indigo-600 font-bold">{ramSizeGb} GB</span>
            </div>
            <input
              type="range"
              min="2"
              max="32"
              step="2"
              value={ramSizeGb}
              onChange={(e) => setRamSizeGb(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">安全警戒水位：70% RAM 阈值</span>
          </div>
        </div>

        {/* 代数指标卡片切片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              分块迭代批次 (<KatexMath math="k" />)
            </span>
            <div className="text-xl font-black font-mono text-slate-800 mt-1">
              {chunkCount} <span className="text-xs font-normal text-slate-500">批次</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">流式迭代 callback 执行次数</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              传统全量读入峰值 RAM (<KatexMath math="\approx 3.8 \times S" />)
            </span>
            <div className={`text-xl font-black font-mono mt-1 ${ramBudgetExceeded ? 'text-red-600' : 'text-slate-800'}`}>
              {(unchunkedPeakRamMb / 1024).toFixed(2)} <span className="text-xs font-normal text-slate-500">GB</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {ramBudgetExceeded ? '⚠️ 极大概率触发 OOM 崩溃' : '约需文件体积的 3.8 倍内存'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase">
              分块/流式峰值 RAM (<KatexMath math="\mathcal{O}(S_{\text{chunk}})" />)
            </span>
            <div className="text-xl font-black font-mono text-emerald-700 mt-1">
              {chunkedPeakRamMb} <span className="text-xs font-normal text-emerald-600">MB</span>
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">
              常数级恒定开销，杜绝 OOM
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-indigo-700 uppercase">内存削峰节约率</span>
            <div className="text-xl font-black font-mono text-indigo-700 mt-1">
              {memorySavedPercent}%
            </div>
            <span className="text-[11px] text-indigo-600 mt-1 block">大幅降低 GC 垃圾回收停顿</span>
          </div>
        </div>

        {/* 对应工业级 R 代码生成 */}
        <div>
          <CodeSnippet
            title={`分块加载与路径工程标准 R 实现 (Chunk Size = ${chunkSizeMb}MB)`}
            badge="readr::read_csv_chunked"
            code={`library(here)
library(readr)
library(dplyr)

# 1. 规范化路径：通过 here() 自动定位项目根节点，防止工作目录偏移
input_file <- here::here("${subDir}", "${fileName}")
stopifnot("文件不存在，请检查路径" = file.exists(input_file))

# 2. 分块迭代器配置：代数分块 k = ${chunkCount} 轮
chunk_rows <- ${Math.round((chunkSizeMb * 1024 * 1024) / 120)} # 约每块 ${chunkSizeMb}MB
total_records <- 0

# 3. 编写流式回调闭包 (在内存中仅保留各块的聚合结果，不膨胀堆内存)
aggregator_callback <- SideEffectChunkCallback$new(function(chunk_df, chunk_index) {
  cat(sprintf("[流式处理] 正在解析第 %d 批次，当前块行数: %d\\n", chunk_index, nrow(chunk_df)))
  # 在此进行实时统计或追加写入数据库，处理完毕后该 chunk 自动被 R GC 回收
})

# 4. 执行流式分块加载 (峰值内存恒定在 ~${chunkedPeakRamMb}MB，彻底杜绝 OOM)
read_csv_chunked(
  file = input_file,
  callback = aggregator_callback,
  chunk_size = chunk_rows,
  col_types = cols(.default = col_guess()),
  progress = TRUE
)`}
          />
        </div>
      </div>
    </div>
  );
};

