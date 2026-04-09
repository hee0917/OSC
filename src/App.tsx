import { useState, ReactNode } from 'react';
import { 
  ShieldAlert, 
  Truck, 
  Construction, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Wind, 
  Settings,
  Activity,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeOSCSafety, SafetyAnalysis } from './lib/gemini';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SafetyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectType: 'PC 공사',
    equipment: '타워크레인',
    windSpeed: '5',
    environment: '인접 구조물 협소, 도심지 공사'
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeOSCSafety(formData);
      setAnalysis(result);
    } catch (err) {
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      {/* Header */}
      <header className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">OSC Safety Intelligence Guide</h1>
            <p className="text-xs text-gray-400">건설안전 지능형 가이드 시스템 v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
            <Activity className="w-3 h-3 animate-pulse" />
            AI System Active
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Input Section */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="dashboard-card p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-blue" />
              작업 조건 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">프로젝트 공종</label>
                <select 
                  className="form-select"
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                >
                  <option>PC 공사</option>
                  <option>모듈러 공사</option>
                  <option>기계설비 유닛 공사</option>
                  <option>목조 모듈러 공사</option>
                </select>
              </div>
              <div>
                <label className="input-label">주요 장비</label>
                <select 
                  className="form-select"
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                >
                  <option>타워크레인</option>
                  <option>하이드로크레인</option>
                  <option>트레일러 (운반)</option>
                  <option>지게차 (대형)</option>
                </select>
              </div>
              <div>
                <label className="input-label flex items-center gap-2">
                  <Wind className="w-4 h-4" /> 풍속 (m/s)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="예: 5"
                  value={formData.windSpeed}
                  onChange={(e) => setFormData({...formData, windSpeed: e.target.value})}
                />
              </div>
              <div>
                <label className="input-label">작업 환경 특이사항</label>
                <textarea 
                  className="form-input h-24 resize-none" 
                  placeholder="인접 구조물 유무, 지반 상태 등..."
                  value={formData.environment}
                  onChange={(e) => setFormData({...formData, environment: e.target.value})}
                />
              </div>
              <button 
                className="btn-primary w-full py-3 mt-2"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    AI 안전 분석 실행
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="text-sm font-bold text-brand-blue flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              OSC 안전 팁
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              OSC 공법은 현장 외 제작 부재의 양중 및 접합 과정에서 사고 위험이 높습니다. 특히 양중 전 부재의 무게 중심 확인과 전용 줄걸이 사용이 필수적입니다.
            </p>
          </div>
        </aside>

        {/* Analysis Content */}
        <div className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200"
              >
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <ShieldAlert className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">분석 대기 중</h3>
                <p className="text-gray-400 max-w-md">
                  좌측 패널에서 작업 조건을 입력하고 'AI 안전 분석 실행' 버튼을 클릭하여 실시간 위험 분석을 시작하세요.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12"
              >
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-brand-blue animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-brand-blue/50" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-medium text-brand-gray">AI가 위험 요소를 분석하고 있습니다...</h3>
                <p className="text-sm text-gray-400 mt-2">KOSHA Guide 및 최신 OSC 안전 지침을 참조 중입니다.</p>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* 3 Major Risks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <RiskCard 
                    icon={<Truck className="w-6 h-6" />}
                    title="Transport (운반)"
                    content={analysis.risks.transport}
                    color="blue"
                  />
                  <RiskCard 
                    icon={<Construction className="w-6 h-6" />}
                    title="Lifting (양중)"
                    content={analysis.risks.lifting}
                    color="orange"
                  />
                  <RiskCard 
                    icon={<LinkIcon className="w-6 h-6" />}
                    title="Connection (접합)"
                    content={analysis.risks.connection}
                    color="indigo"
                  />
                </div>

                {/* KOSHA Summary */}
                <div className="dashboard-card p-6 bg-gradient-to-br from-brand-dark to-slate-800 text-white border-none">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    안전보건관리 지침 요약 (KOSHA Guide 기반)
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {analysis.koshaSummary}
                  </p>
                </div>

                {/* JSA Table */}
                <div className="dashboard-card">
                  <div className="px-6 py-4 border-bottom bg-gray-50 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Interactive JSA (위험성 평가)
                    </h3>
                    <span className="text-xs text-brand-gray bg-white px-2 py-1 rounded border border-gray-200">
                      자동 생성됨
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-brand-gray font-medium border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 w-1/4">작업 단계</th>
                          <th className="px-6 py-3 w-1/3">유해위험요인</th>
                          <th className="px-6 py-3">위험감소대책</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analysis.jsa.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-brand-dark">{item.step}</td>
                            <td className="px-6 py-4 text-red-600">
                              <div className="flex items-start gap-2">
                                <span className="mt-1 min-w-[4px] h-1 bg-red-500 rounded-full" />
                                {item.hazard}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-brand-gray">
                              <div className="flex items-start gap-2">
                                <span className="mt-1 min-w-[4px] h-1 bg-green-500 rounded-full" />
                                {item.measure}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Checklist */}
                <div className="dashboard-card p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    현장 안전 체크리스트
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-blue/30 transition-all group cursor-pointer">
                        <div className="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-brand-blue flex items-center justify-center transition-colors">
                          <CheckCircle2 className="w-3 h-3 text-brand-blue opacity-0 group-hover:opacity-100" />
                        </div>
                        <span className="text-sm text-brand-gray">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
        © 2026 OSC Safety Intelligence Guide. All rights reserved. | Powered by Gemini AI
      </footer>
    </div>
  );
}

function RiskCard({ icon, title, content, color }: { icon: ReactNode, title: string, content: string, color: 'blue' | 'orange' | 'indigo' }) {
  const colorMap = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 icon-blue',
    orange: 'border-orange-200 bg-orange-50 text-orange-700 icon-orange',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 icon-indigo',
  };

  const iconColorMap = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className={`dashboard-card p-5 border-l-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconColorMap[color]}`}>
          {icon}
        </div>
        <h4 className="font-bold text-sm uppercase tracking-wider">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-brand-dark/80">
        {content}
      </p>
    </div>
  );
}

