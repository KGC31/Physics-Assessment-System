'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, TrendingUp, AlertCircle } from 'lucide-react';

interface Result {
  group: string;
  name: string;
  rawScore: number;
  convertedScore: number;
  diagnosis: string;
}

interface ResultsDetailProps {
  results: Result[];
  patientName: string;
  gender: string;
  birthYear: number;
  createdAt: string;
  onBack: () => void;
}

export const ResultsDetail: React.FC<ResultsDetailProps> = ({
  results,
  patientName,
  gender,
  birthYear,
  createdAt,
  onBack,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDiagnosisLevel = (diagnosis: string) => {
    switch (diagnosis) {
      case 'Xác định':
        return { color: 'rose', icon: '⚠️', label: 'Xác định rõ' };
      case 'Xu hướng':
        return { color: 'amber', icon: '⚡', label: 'Xu hướng' };
      case 'Cơ bản':
        return { color: 'emerald', icon: '✓', label: 'Cơ bản' };
      default:
        return { color: 'slate', icon: '○', label: 'Bình thường' };
    }
  };

  const constitutionDescriptions: Record<string, string> = {
    A: 'Thể bình hòa - Trạng thái lý tưởng với cân bằng khí huyết',
    B: 'Thể khí hư - Dễ mệt, thiếu năng lượng, cần bổ trợ',
    C: 'Thể dương hư - Sợ lạnh, cần ấm áp, tăng cường dương khí',
    D: 'Thể âm hư - Khô miệng, nóng bàn tay chân, cần nuôi âm',
    E: 'Thể đàm thấp - Thừa cân, dễ buồn nôn, cần thanh nhiệt',
    F: 'Thể thấp nhiệt - Mụn nhiều, miệng đắng, cần giải độc',
    G: 'Thể huyết ứ - Sắc mặt tối, bầm tím, cần hoạt huyết',
    H: 'Thể khí uất - Lo âu, buồn, cần giải uất',
    I: 'Thể dị ứng bẩm sinh - Dễ dị ứng, cần tăng miễn dịch',
  };

  // Sort results by diagnosis priority
  const sortedResults = [...results].sort((a, b) => {
    const priority: Record<string, number> = {
      'Xác định': 0,
      'Xu hướng': 1,
      'Cơ bản': 2,
      'Không': 3,
    };
    return (priority[a.diagnosis] ?? 4) - (priority[b.diagnosis] ?? 4);
  });

  const highlightedResults = sortedResults.filter(r => r.diagnosis !== 'Không');
  const normalResults = sortedResults.filter(r => r.diagnosis === 'Không');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Chi tiết kết quả</h2>
          <p className="text-slate-500 text-sm mt-1">
            {formatDate(createdAt)}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Patient Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Bệnh nhân
            </p>
            <p className="text-base font-bold text-slate-900">{patientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Giới tính
            </p>
            <p className="text-base font-bold text-slate-900">
              {gender === 'nam' ? '👨 Nam' : '👩 Nữ'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Năm sinh
            </p>
            <p className="text-base font-bold text-slate-900">{birthYear}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Results */}
      {highlightedResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Thể chất chính
          </h3>

          <div className="space-y-3">
            {highlightedResults.map((result, idx) => {
              const diagnosisInfo = getDiagnosisLevel(result.diagnosis);

              return (
                <motion.div
                  key={result.group}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl border-2 bg-white overflow-hidden`}
                >
                  {/* Result Header */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === result.group ? null : result.group)
                    }
                    className="w-full p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-slate-400">
                          {result.group}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {result.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {constitutionDescriptions[result.group]}
                          </p>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">
                            Điểm số
                          </span>
                          <span className="text-slate-900 font-bold">
                            {result.convertedScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                            style={{
                              width: `${Math.min(result.convertedScore, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold text-center min-w-fit ${
                          diagnosisInfo.color === 'rose'
                            ? 'bg-rose-100 text-rose-700'
                            : diagnosisInfo.color === 'amber'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {diagnosisInfo.icon} {diagnosisInfo.label}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedId === result.group ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === result.group && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                            Điểm thô
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.rawScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                            Tỷ lệ
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {((result.rawScore / (result.rawScore + result.convertedScore - result.rawScore + 0.01)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Diễn giải
                        </p>
                        <p className="text-sm text-blue-700">
                          {constitutionDescriptions[result.group]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Results */}
      {normalResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-700 mb-3 text-slate-600">
            Thể chất bình thường
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {normalResults.map((result) => (
              <div
                key={result.group}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center"
              >
                <p className="text-sm font-bold text-slate-900">{result.group}</p>
                <p className="text-xs text-slate-500 mt-1">{result.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-lg bg-blue-50 border border-blue-200"
      >
        <p className="text-sm text-blue-700">
          <strong>💡 Mẹo:</strong> Bạn nên tham khảo ý kiến của bác sĩ về các kết quả này để có kế hoạch chăm sóc sức khỏe phù hợp.
        </p>
      </motion.div>
    </motion.div>
  );
};
