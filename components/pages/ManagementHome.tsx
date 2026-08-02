'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, BookOpen, ClipboardList, Settings } from 'lucide-react';

interface ManagementHomeProps {
  onNavigate: (page: 'records' | 'reports' | 'settings') => void;
  recordCount: number;
  onBack: () => void;
}

export const ManagementHome: React.FC<ManagementHomeProps> = ({ 
  onNavigate, 
  recordCount, 
  onBack 
}) => {
  const menuItems = [
    {
      id: 'records',
      icon: ClipboardList,
      title: 'Lịch sử khảo sát',
      description: 'Xem và quản lý các bản ghi khảo sát của bạn',
      color: 'emerald',
      count: recordCount,
      action: () => onNavigate('records'),
    },
    {
      id: 'reports',
      icon: BookOpen,
      title: 'Báo cáo chi tiết',
      description: 'Phân tích kết quả và xu hướng theo thời gian',
      color: 'blue',
      action: () => onNavigate('reports'),
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Cài đặt & Dữ liệu',
      description: 'Quản lý thông tin cá nhân và tùy chọn',
      color: 'slate',
      action: () => onNavigate('settings'),
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto py-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Quản lý hồ sơ
          </h1>
          <p className="text-slate-500">
            Tổ chức và theo dõi các bản ghi khảo sát của bạn một cách dễ dàng
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, idx) => {
          const colors = colorClasses[item.color];
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={item.action}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all text-left group active:scale-95`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white border ${colors.border}`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                {item.count !== undefined && (
                  <div className={`px-3 py-1 rounded-full bg-white text-sm font-bold ${colors.text} border ${colors.border}`}>
                    {item.count}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                {item.description}
              </p>

              <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm group-hover:gap-3 transition-all`}>
                Truy cập
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-200"
      >
        <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo sử dụng</h3>
        <p className="text-blue-700 text-sm">
          Bạn có thể xem lại tất cả các bài khảo sát trước đó, so sánh kết quả theo thời gian, 
          và xuất báo cáo để chia sẻ với bác sĩ của mình.
        </p>
      </motion.div>
    </motion.div>
  );
};
