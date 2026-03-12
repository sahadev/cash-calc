import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import type { SalaryInput } from './types/salary';
import type { CityId } from './data/cityPolicies';
import { getCityPolicy } from './data/cityPolicies';
import { useCalculation } from './hooks/useCalculation';
import { useHistory } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import InputForm from './components/InputForm';
import MonthlyDetail from './components/MonthlyDetail';
import AnnualSummary from './components/AnnualSummary';
import History from './components/History';
import AdSlot from './components/AdSlot';
import AD_SLOTS from './config/adSlots';

const SalaryConverter = lazy(() => import('./components/SalaryConverter'));
const CrossCityCompare = lazy(() => import('./components/CrossCityCompare'));
const MultiOfferCompare = lazy(() => import('./components/MultiOfferCompare'));
const TaxReconciliation = lazy(() => import('./components/TaxReconciliation'));
const CityLanding = lazy(() => import('./components/CityLanding'));
const ArticlePage = lazy(() => import('./components/ArticlePage'));
const SearchLanding = lazy(() => import('./components/SearchLanding'));
const SharedRecordViewer = lazy(() => import('./components/SharedRecordViewer'));

const defaultInput: SalaryInput = {
  monthlyBase: 10000,
  totalMonths: 15,
  housingFundRate: getCityPolicy('beijing').housingFund.defaultRate,
  additionalDeduction: 0,
  bonusTaxMode: 'auto',
  city: 'beijing' as CityId,
};

interface TabConfig {
  path: string;
  label: string;
  icon: string;
  mobileOnly?: boolean;
}

const TAB_CONFIG: TabConfig[] = [
  { path: '/', label: '计算', icon: '💰' },
  { path: '/converter', label: '转换', icon: '⚖️' },
  { path: '/cross-city', label: '跨城', icon: '🏙️' },
  { path: '/multi-offer', label: '对比', icon: '📊' },
  { path: '/tax-recon', label: '汇算', icon: '🧾' },
  { path: '/history', label: '存档', icon: '📋' },
];

export default function App() {
  const [input, setInput] = useState<SalaryInput>(defaultInput);
  const summary = useCalculation(input);
  const { records, addRecord, removeRecord, clearAll } = useHistory();
  const { resolved, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSave = () => {
    if (summary) {
      addRecord(input, summary);
    }
  };

  const handleLoad = (savedInput: SalaryInput) => {
    setInput({ ...savedInput, city: savedInput.city || 'beijing' });
    navigate('/');
  };

  useEffect(() => {
    const state = location.state as { loadShared?: { input: SalaryInput } } | null;
    if (state?.loadShared?.input) {
      setInput({ ...state.loadShared.input, city: state.loadShared.input.city || 'beijing' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const currentPolicy = getCityPolicy(input.city);
  const activePath = location.pathname;

  return (
    <div className="min-h-screen bg-page text-t1 transition-colors duration-200 pb-16 sm:pb-0">
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <header className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="min-w-0 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              <span className="text-amber-500">Cash</span>
              <span className="text-t3">Calc</span>
              <span className="text-t5 text-xs sm:text-sm font-normal ml-2 sm:ml-3">
                薪资计算器
              </span>
              <a href="https://kakacut.cn" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-t6 text-[10px] sm:text-xs font-normal ml-1.5 sm:ml-2 hover:text-amber-500 transition-colors">
                KaKaCut 旗下产品
              </a>
            </h1>
            <p className="text-t5 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
              五险一金 · 个税 · 年终奖 · 结构转换 · 到手明细
            </p>
            <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {[
              ].map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={toggle}
            className="shrink-0 p-2.5 sm:p-2 rounded-lg bg-elevated text-t3 hover:bg-hover active:bg-hover transition-colors"
            title={resolved === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {resolved === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </header>

        {/* Tab 导航 (桌面端) */}
        <div className="hidden sm:flex gap-1 mb-6 bg-elevated rounded-xl p-1 w-fit card-shadow-sm">
          {TAB_CONFIG.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activePath === path
                  ? 'bg-card text-amber-500 shadow-sm font-medium'
                  : 'text-t4 hover:text-t2'
              }`}
            >
              {label === '存档' ? `${label} (${records.length})` : label}
            </button>
          ))}
        </div>

        <Routes>
          <Route path="/" element={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-4">
                <div className="sticky top-4 sm:top-6 space-y-4 sm:space-y-6">
                  <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
                    <InputForm input={input} onChange={setInput} />
                  </div>
                  {summary && (
                    <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 space-y-3 card-shadow">
                      <h3 className="text-xs text-t4 uppercase tracking-widest">快速预览</h3>
                      <div className="space-y-2">
                        <QuickStat label="月到手 (平均)" value={`${(summary.totalNetCash / 12).toLocaleString('zh-CN', { maximumFractionDigits: 0 })} 元`} color="text-emerald-500" />
                        <QuickStat label="年到手现金" value={`${(summary.totalNetCash / 10000).toFixed(2)}万`} color="text-emerald-500" />
                        <QuickStat label="综合价值" value={`${(summary.totalValue / 10000).toFixed(2)}万`} color="text-amber-500" />
                        <QuickStat label="全年个税" value={`${(summary.totalTax / 10000).toFixed(2)}万`} color="text-orange-500" />
                      </div>
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <AdSlot {...AD_SLOTS.calculatorSidebar} className="mx-auto" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                {summary ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
                      <AnnualSummary summary={summary} input={input} onSave={handleSave} />
                    </div>
                    <AdSlot {...AD_SLOTS.resultBottom} />
                    <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
                      <MonthlyDetail months={summary.monthlyDetails} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-card border border-b1 p-8 sm:p-12 text-center card-shadow">
                    <div className="text-5xl mb-4 opacity-30">💰</div>
                    <p className="text-t4">输入月 Base 开始计算</p>
                  </div>
                )}
              </div>
            </div>
          } />
          <Route path="/converter" element={<Suspense fallback={<Loading />}><SalaryConverter /></Suspense>} />
          <Route path="/cross-city" element={<Suspense fallback={<Loading />}><CrossCityCompare /></Suspense>} />
          <Route path="/multi-offer" element={<Suspense fallback={<Loading />}><MultiOfferCompare /></Suspense>} />
          <Route path="/tax-recon" element={<Suspense fallback={<Loading />}><TaxReconciliation /></Suspense>} />
          <Route path="/city" element={<Suspense fallback={<Loading />}><CityLanding /></Suspense>} />
          <Route path="/city/:cityId" element={<Suspense fallback={<Loading />}><CityLanding /></Suspense>} />
          <Route path="/s/:id" element={<Suspense fallback={<Loading />}><SharedRecordViewer /></Suspense>} />
          <Route path="/q" element={<Suspense fallback={<Loading />}><SearchLanding /></Suspense>} />
          <Route path="/q/:query" element={<Suspense fallback={<Loading />}><SearchLanding /></Suspense>} />
          <Route path="/guide" element={<Suspense fallback={<Loading />}><ArticlePage /></Suspense>} />
          <Route path="/guide/:slug" element={<Suspense fallback={<Loading />}><ArticlePage /></Suspense>} />
          <Route path="/history" element={
            <div className="rounded-2xl bg-card border border-b1 p-4 sm:p-5 card-shadow">
              <History records={records} onRemove={removeRecord} onClear={clearAll} onLoad={handleLoad} />
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <footer className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-b1 text-[11px] sm:text-xs text-t6 space-y-3">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <Link to="/q" className="hover:text-amber-500 transition-colors">薪资速算</Link>
            <Link to="/city" className="hover:text-amber-500 transition-colors">城市速查</Link>
            <Link to="/guide" className="hover:text-amber-500 transition-colors">实用攻略</Link>
            <Link to="/guide/bonus-tax" className="hover:text-amber-500 transition-colors">年终奖计税</Link>
            <Link to="/guide/salary-negotiation" className="hover:text-amber-500 transition-colors">跳槽谈薪</Link>
            <Link to="/guide/housing-fund" className="hover:text-amber-500 transition-colors">公积金全解</Link>
          </div>
          <div className="text-center space-y-1">
            <p>数据基于{currentPolicy.name} {currentPolicy.policyYear} 年度社保/公积金政策</p>
            <p>社保 {currentPolicy.socialInsurance.base.min.toLocaleString()}~{currentPolicy.socialInsurance.base.max.toLocaleString()} · 公积金 {currentPolicy.housingFund.base.min.toLocaleString()}~{currentPolicy.housingFund.base.max.toLocaleString()} · 起征 5,000/月</p>
          </div>
          <div className="text-center pt-2 border-t border-b1 space-y-1">
            <p>
              <a href="https://kakacut.cn" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">KaKaCut 咔咔剪</a>
              {' · '}
              <span>CashCalc 薪资计算器</span>
            </p>
            <p>
              联系我们：<a href="mailto:sahadev@foxmail.com" className="hover:text-amber-500 transition-colors">sahadev@foxmail.com</a>
            </p>
            <p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">京ICP备2026010115号</a>
            </p>
          </div>
        </footer>
      </div>

      {/* 底部 Tab 栏 (移动端) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-b1 z-50 safe-area-pb">
        <div className="flex">
          {TAB_CONFIG.map(({ path, label, icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 transition-colors ${
                activePath === path ? 'text-amber-500' : 'text-t4 active:text-t2'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              <span className="text-[10px] font-medium">
                {label}{path === '/history' && records.length > 0 ? ` ${records.length}` : ''}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-t4">{label}</span>
      <span className={`font-mono font-semibold text-sm ${color}`}>{value}</span>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}
