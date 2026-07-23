'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dataClient } from '../lib/amplifyClient';
import { useAuth } from '../contexts/AuthContext';

interface SurveyRecord {
  id: string;
  patient_name: string;
  birth_year: number;
  address: string;
  gender: string;
  answers: Record<string, number>;
  results: Array<{
    group: string;
    name: string;
    rawScore: number;
    convertedScore: number;
    questionCount: number;
    diagnosis: string;
  }>;
  created_at: string;
}

interface UserRecordsProps {
  onBack: () => void;
}

function mapRecord(raw: {
  id: string;
  patientName?: string | null;
  birthYear?: number | null;
  address?: string | null;
  gender?: string | null;
  answers?: unknown;
  results?: unknown;
  createdAt?: string | null;
}): SurveyRecord {
  return {
    id: raw.id,
    patient_name: raw.patientName ?? 'Không rõ',
    birth_year: raw.birthYear ?? 0,
    address: raw.address ?? '',
    gender: raw.gender ?? 'nam',
    answers: (raw.answers as Record<string, number>) ?? {},
    results: (raw.results as SurveyRecord['results']) ?? [],
    created_at: raw.createdAt ?? new Date().toISOString(),
  };
}

export const UserRecords: React.FC<UserRecordsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SurveyRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, errors } = await dataClient.models.SurveyRecord.list({
      limit: 200,
    });

    if (!errors && data) {
      const mapped = data
        .map(mapRecord)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      setRecords(mapped);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { errors } = await dataClient.models.SurveyRecord.delete({ id });
    if (!errors) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    }
  };

  const StatusBadge = ({ diagnosis }: { diagnosis: string }) => {
    switch (diagnosis) {
      case 'Xác định':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">Xác định</span>;
      case 'Xu hướng':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Xu hướng</span>;
      case 'Cơ bản':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Cơ bản</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-400">Bình thường</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Lịch sử khảo sát</h2>
          <p className="text-slate-500 text-sm mt-1">Các bản ghi khảo sát đã lưu của bạn</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm active:scale-95"
        >
          ← Quay lại
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bản ghi nào</h3>
          <p className="text-slate-500 text-sm">Hoàn thành một bài khảo sát và lưu kết quả để xem ở đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, idx) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{record.patient_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>Năm sinh: {record.birth_year}</span>
                      <span>•</span>
                      <span>{record.gender === 'nam' ? '👨 Nam' : '👩 Nữ'}</span>
                      {record.address && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{record.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">
                    {new Date(record.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(record.results || [])
                    .filter(r => r.diagnosis === 'Xác định' || r.diagnosis === 'Xu hướng' || r.diagnosis === 'Cơ bản')
                    .map(r => (
                      <div key={r.group} className="flex items-center gap-1.5">
                        <StatusBadge diagnosis={r.diagnosis} />
                        <span className="text-xs text-slate-600 font-medium">{r.name}</span>
                      </div>
                    ))
                  }
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                  {deleteConfirm === record.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-600 font-medium">Xác nhận xóa?</span>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(record.id)}
                      className="px-4 py-2 rounded-lg bg-slate-50 text-slate-500 text-sm font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedRecord.patient_name}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedRecord.gender === 'nam' ? 'Nam' : 'Nữ'} • Sinh năm {selectedRecord.birth_year}
                    {selectedRecord.address && ` • ${selectedRecord.address}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <h3 className="font-semibold text-slate-800 mb-4">Kết quả các nhóm thể chất</h3>
                <div className="space-y-3">
                  {(selectedRecord.results || []).map(r => (
                    <div key={r.group} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 font-semibold">Nhóm {r.group}</div>
                        <div className="font-medium text-slate-800">{r.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                          {r.convertedScore.toFixed(1)} điểm
                        </span>
                        <StatusBadge diagnosis={r.diagnosis} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
