'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { dataClient } from '../lib/amplifyClient';
import { useAuth, Profile } from '../contexts/AuthContext';
import { questions } from '../data/questions';

interface SurveyRecord {
  id: string;
  user_id: string;
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
  ownerEmail?: string | null;
  ownerName?: string | null;
}

interface AdminDashboardProps {
  onBack: () => void;
}

type Tab = 'users' | 'records';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
    fetchRecords();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, errors } = await dataClient.models.Profile.list({ limit: 500 });
    if (!errors && data) {
      setUsers(
        data.map((p) => ({
          id: p.id,
          email: p.email,
          role: (p.role as 'admin' | 'user') ?? 'user',
          full_name: p.fullName ?? null,
          created_at: p.createdAt ?? new Date().toISOString(),
          updated_at: p.updatedAt ?? new Date().toISOString(),
        }))
      );
    }
    setLoading(false);
  };

  const fetchRecords = async () => {
    const { data, errors } = await dataClient.models.SurveyRecord.list({ limit: 500 });
    if (!errors && data) {
      setRecords(
        data.map((r) => ({
          id: r.id,
          user_id: r.owner ?? r.ownerEmail ?? '',
          patient_name: r.patientName ?? 'Không rõ',
          birth_year: r.birthYear ?? 0,
          address: r.address ?? '',
          gender: r.gender ?? 'nam',
          answers: (r.answers as Record<string, number>) ?? {},
          results: (r.results as SurveyRecord['results']) ?? [],
          created_at: r.createdAt ?? new Date().toISOString(),
          ownerEmail: r.ownerEmail,
          ownerName: r.ownerName,
        }))
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.userId) {
      setDeleteConfirm(null);
      return;
    }

    const { errors } = await dataClient.models.Profile.delete({ id: userId });
    if (!errors) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirm(null);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const { errors } = await dataClient.models.SurveyRecord.delete({ id: recordId });
    if (!errors) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      setDeleteConfirm(null);
    }
  };

  const handleExportCSV = () => {
    const filteredRecords =
      filterUserId === 'all'
        ? records
        : records.filter(
            (r) =>
              r.user_id === filterUserId ||
              r.ownerEmail === users.find((u) => u.id === filterUserId)?.email
          );

    if (filteredRecords.length === 0) return;

    const baseHeaders = [
      'STT', 'Ngày khảo sát', 'Người thực hiện', 'Họ tên bệnh nhân',
      'Năm sinh', 'Giới tính', 'Địa chỉ',
      'Bình hòa (Điểm)', 'Bình hòa (KL)',
      'Khí hư (Điểm)', 'Khí hư (KL)',
      'Dương hư (Điểm)', 'Dương hư (KL)',
      'Âm hư (Điểm)', 'Âm hư (KL)',
      'Đàm thấp (Điểm)', 'Đàm thấp (KL)',
      'Thấp nhiệt (Điểm)', 'Thấp nhiệt (KL)',
      'Huyết ứ (Điểm)', 'Huyết ứ (KL)',
      'Khí uất (Điểm)', 'Khí uất (KL)',
      'Đặc bẩm (Điểm)', 'Đặc bẩm (KL)',
    ];

    const questionHeaders = questions.map((q) => `Câu ${q.id}`);
    const headers = [...baseHeaders, ...questionHeaders];
    const groupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    const rows = filteredRecords.map((record, index) => {
      const resultMap: Record<string, { score: number; diagnosis: string }> = {};
      (record.results || []).forEach((r) => {
        resultMap[r.group] = { score: r.convertedScore, diagnosis: r.diagnosis };
      });

      const row: (string | number)[] = [
        index + 1,
        new Date(record.created_at).toLocaleString('vi-VN'),
        record.ownerName || record.ownerEmail || '',
        record.patient_name,
        record.birth_year,
        record.gender === 'nam' ? 'Nam' : 'Nữ',
        record.address || '',
      ];

      groupOrder.forEach((g) => {
        const r = resultMap[g];
        row.push(r ? r.score.toFixed(1) : '0');
        row.push(r ? r.diagnosis : 'Không');
      });

      questions.forEach((q) => {
        const ans = record.answers && record.answers[q.id];
        row.push(ans ? ans : '');
      });

      return row;
    });

    const BOM = '\uFEFF';
    const csvContent =
      BOM +
      [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-nghien-cuu-ccmq_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords =
    filterUserId === 'all'
      ? records
      : records.filter((r) => {
          const u = users.find((x) => x.id === filterUserId);
          return (
            r.user_id === filterUserId ||
            (u && (r.ownerEmail === u.email || r.user_id.includes(u.email)))
          );
        });

  const StatusBadge = ({ diagnosis }: { diagnosis: string }) => {
    switch (diagnosis) {
      case 'Xác định':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">Xác định</span>;
      case 'Xu hướng':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Xu hướng</span>;
      case 'Cơ bản':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Cơ bản</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto py-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Quản trị hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý người dùng và dữ liệu khảo sát (Cognito Google SSO · DynamoDB)
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm active:scale-95 self-start"
        >
          ← Quay lại
        </button>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-100 text-sm text-violet-800">
        Người dùng mới đăng nhập Google được gán nhóm <strong>USER</strong>. Để cấp quyền admin,
        thêm họ vào nhóm Cognito <strong>ADMIN</strong> trong AWS Console.
      </div>

      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('users')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'users'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          👥 Người dùng ({users.length})
        </button>
        <button
          onClick={() => setTab('records')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            tab === 'records'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          📊 Bản ghi ({records.length})
        </button>
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Họ tên</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Email</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Vai trò</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Ngày tạo</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-800">{u.full_name || '—'}</td>
                        <td className="px-5 py-4 text-slate-600">{u.email}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              u.role === 'admin'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {u.id === user?.userId || u.email === user?.email ? (
                            <span className="text-xs text-slate-400 italic">Bạn</span>
                          ) : deleteConfirm === u.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Xóa hồ sơ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600">Lọc theo:</label>
              <select
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả ({records.length})</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email} (
                    {records.filter((r) => r.ownerEmail === u.email || r.user_id === u.id).length})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Xuất CSV ({filteredRecords.length} bản ghi)
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500">Không có bản ghi nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-slate-800">{record.patient_name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {record.gender === 'nam' ? 'Nam' : 'Nữ'} • {record.birth_year}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Bởi: {record.ownerName || record.ownerEmail || '—'}</span>
                        <span>•</span>
                        <span>
                          {new Date(record.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(record.results || [])
                          .filter((r) => r.diagnosis !== 'Không')
                          .map((r) => (
                            <div key={r.group} className="flex items-center gap-1">
                              <StatusBadge diagnosis={r.diagnosis} />
                              <span className="text-xs text-slate-500">{r.name}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      {deleteConfirm === record.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(record.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
