'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dataClient } from '../../lib/amplifyClient';
import { useAuth } from '../../contexts/AuthContext';
import { parseJsonField } from '../../utils';
import { ChevronDown, Calendar, User, MapPin, Search, Trash2 } from 'lucide-react';

interface SurveyRecord {
  id: string;
  patient_name: string;
  birth_year: number;
  address: string;
  gender: string;
  created_at: string;
  results: Array<{
    group: string;
    name: string;
    diagnosis: string;
  }>;
}

interface PatientRecordsListProps {
  onBack: () => void;
  onSelectRecord?: (record: SurveyRecord) => void;
}

export const PatientRecordsList: React.FC<PatientRecordsListProps> = ({ 
  onBack, 
  onSelectRecord 
}) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        .map((r) => ({
          id: r.id,
          patient_name: r.patientName ?? 'Không rõ',
          birth_year: r.birthYear ?? 0,
          address: r.address ?? '',
          gender: r.gender ?? 'nam',
          created_at: r.createdAt ?? new Date().toISOString(),
          results: parseJsonField<SurveyRecord['results']>(r.results, []),
        }))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      setRecords(mapped);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { errors } = await dataClient.models.SurveyRecord.delete({ id });
      if (!errors) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredRecords = records.filter((record) =>
    record.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getDominantResults = (results: SurveyRecord['results']) => {
    return results
      .filter((r) => r.diagnosis !== 'Không')
      .slice(0, 2)
      .map((r) => r.name);
  };

  const getStatusColor = (diagnosis: string) => {
    switch (diagnosis) {
      case 'Xác định':
        return 'bg-rose-100 text-rose-700';
      case 'Xu hướng':
        return 'bg-amber-100 text-amber-700';
      case 'Cơ bản':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Lịch sử khảo sát</h2>
          <p className="text-slate-500 text-sm mt-1">
            {records.length} bản ghi
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Search Bar */}
      {records.length > 0 && (
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      )}

      {/* Records List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100"
        >
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {records.length === 0 ? 'Chưa có bản ghi nào' : 'Không tìm thấy kết quả'}
          </h3>
          <p className="text-slate-500 text-sm">
            {records.length === 0
              ? 'Hoàn thành một bài khảo sát để xem kết quả ở đây.'
              : 'Hãy thử tìm kiếm với từ khóa khác.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record, idx) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Record Item */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === record.id ? null : record.id)
                  }
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {record.patient_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(record.created_at)}
                      </div>
                      {record.birth_year > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Năm {record.birth_year}
                        </div>
                      )}
                      {record.address && (
                        <div className="flex items-center gap-1 hidden sm:flex">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{record.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Results Preview */}
                    {record.results.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getDominantResults(record.results).map((name, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                      expandedId === record.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === record.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50"
                    >
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Full Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                              Giới tính
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {record.gender === 'nam' ? '👨 Nam' : '👩 Nữ'}
                            </p>
                          </div>
                          {record.birth_year > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                Năm sinh
                              </p>
                              <p className="text-sm font-medium text-slate-700">
                                {record.birth_year}
                              </p>
                            </div>
                          )}
                        </div>

                        {record.address && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                              Địa chỉ
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {record.address}
                            </p>
                          </div>
                        )}

                        {/* Results */}
                        {record.results.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                              Thể chất phát hiện
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {record.results.map((result, i) => (
                                <div
                                  key={i}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(
                                    result.diagnosis
                                  )}`}
                                >
                                  {result.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          {onSelectRecord && (
                            <button
                              onClick={() => onSelectRecord(record)}
                              className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold active:scale-95"
                            >
                              Xem chi tiết
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(record.id)}
                            className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-semibold active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {deleteConfirm === record.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-slate-100 bg-rose-50 p-4 sm:p-5 flex items-center justify-between gap-3"
                    >
                      <p className="text-sm font-medium text-rose-700">
                        Xóa bản ghi này?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors text-sm font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
