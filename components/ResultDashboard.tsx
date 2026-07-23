import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GroupResult, Question, FoodRecommendation } from '../types';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { dataClient } from '../lib/amplifyClient';
import { Apple, BookOpen, Utensils, Ban } from 'lucide-react';

const LOCAL_FOOD_RECOMMENDATIONS: FoodRecommendation[] = [
  {
    section_key: 'TC_A',
    loai_the_chat: 'Thể Bình Hòa (Dạng A)',
    de_xuat: 'Yến mạch, Đậu xanh, Gạo, Gạo lứt, Đậu nành, Bắp, Đào, Dứa, Xoài, Vải, Nho, Cà chua, Bí đao, Bông cải xanh, Thịt heo, Thịt gà, Cá saba, Sữa bò tươi, Hạt sen.',
    nen_kieng: 'Không có hạn chế đặc biệt, nhưng nên duy trì ăn uống điều độ để giữ cân bằng.',
    luan_giai: 'Người thể bình hòa có tinh thần và thể lực đầy đủ, khả năng thích ứng tốt. Nhóm thực phẩm có tính vị Bình hoặc được ghi chú phù hợp với bất kỳ thể chất nào giúp duy trì sự ổn định của khí huyết và ngũ tạng.'
  },
  {
    section_key: 'TC_B',
    loai_the_chat: 'Thể Khí Hư (Dạng B)',
    de_xuat: 'Hạt dẻ cười, Kê, Hạt dẻ ngựa, Sầu riêng, Nhãn, Nghệ, Gạo, Nếp, Gạo lứt, Bơ, Khoai môn, Cá saba, Thịt gà.',
    nen_kieng: 'Cua.',
    luan_giai: 'Người khí hư thường dễ mệt mỏi, hụt hơi, vô lực. Các thực phẩm này có công dụng bổ trung ích khí, kiện tỳ hòa vị, nâng cao vị khí và trung khí, giúp nhanh chóng bổ sung năng lượng và giảm mệt mỏi.'
  },
  {
    section_key: 'TC_C',
    loai_the_chat: 'Thể Dương Hư (Dạng C)',
    de_xuat: 'Hạt dẻ cười, Kê, Hạt óc chó, Hạt dẻ ngựa, Nhãn, Hẹ, Gừng, Thịt dê, Thịt gà, Tôm, Lươn.',
    nen_kieng: 'Tắc, thực phẩm tính hàn lạnh như Dưa hấu, Mồng tơi, Cua.',
    luan_giai: 'Biểu hiện đặc trưng là sợ lạnh, tay chân lạnh. Nhóm thực phẩm có tính Ấm, giúp ôn bổ dương khí, tráng dương, hỗ trợ sưởi ấm tỳ vị và cơ thể từ bên trong.'
  },
  {
    section_key: 'TC_D',
    loai_the_chat: 'Thể Âm Hư (Dạng D)',
    de_xuat: 'Lúa mì, Kê, Hạt óc chó, Sầu riêng, Dâu tằm, Nho, Lê, Thịt vịt, Hàu, Trứng gà, Đậu hũ.',
    nen_kieng: 'Chôm chôm, Thịt dê.',
    luan_giai: 'Người âm hư thường nóng lòng bàn tay chân, miệng khô táo. Các thực phẩm này giúp tư âm nhuận táo, sinh tân dịch, nuôi dưỡng âm dịch để làm dịu các chứng khô khát và táo nhiệt.'
  },
  {
    section_key: 'TC_E',
    loai_the_chat: 'Thể Đàm Thấp (Dạng E)',
    de_xuat: 'Lúa mì, Ý dĩ, Kê, Lá khoai lang, Giá đậu nành, Bí đao, Củ cải trắng, Tần ô.',
    nen_kieng: 'Chôm chôm, Mía, Hải sâm, Cá hồi.',
    luan_giai: 'Thể chất này thường thấy mình mẩy nặng nề, bụng béo, đờm nhiều. Nhóm thực phẩm này có tác dụng thanh nhiệt thẩm thấp, lợi thủy tiêu thũng, giúp đào thái thấp khí và nước thừa ra khỏi cơ thể.'
  },
  {
    section_key: 'TC_F',
    loai_the_chat: 'Thể Thấp Nhiệt (Dạng F)',
    de_xuat: 'Lúa mì, Ý dĩ, Kê, Trà xanh, Rau đắng, Khổ qua, Bí đao, Củ cải trắng, Tần ô, Trứng gà, Vịt.',
    nen_kieng: 'Hẹ, Ớt chuông, Nhãn, Sầu riêng, Mía, Thịt dê.',
    luan_giai: 'Biểu hiện là mặt dầu, dễ mọc mụn, miệng đắng. Các thực phẩm này giúp thanh nhiệt lợi thấp, giải độc, hỗ trợ thanh lọc cơ thể và cải thiện tình trạng nóng trong.'
  },
  {
    section_key: 'TC_G',
    loai_the_chat: 'Thể Huyết Ứ (Dạng G)',
    de_xuat: 'Ý dĩ, Hạt óc chó, Sầu riêng, Người lớn, Nghệ, Hẹ, Gừng, Giấm, Thịt dê, Tôm, Lươn, Cá hồi.',
    nen_kieng: 'Các thực phẩm có tính chất gây trì trệ, quá nhiều dầu mỡ.',
    luan_giai: 'Người huyết ứ có sắc mặt tối, dễ bầm tím, đau buốt. Nhóm thực phẩm này giúp hoạt huyết hóa ứ, hành khí thông lạc, thúc đẩy tuần hoàn máu và giảm các triệu chứng ứ trệ.'
  },
  {
    section_key: 'TC_H',
    loai_the_chat: 'Thể Khí Uất (Dạng H)',
    de_xuat: 'Ý dĩ, Hạt óc chó, Sầu riêng, Nghệ, Hẹ, Gừng, Giấm, Nho, Cam, Quýt, Thịt dê, Tôm, Lươn, Cá hồi.',
    nen_kieng: 'Thực phẩm tính hàn lạnh sâu, đồ ăn đóng hộp.',
    luan_giai: 'Đặc trưng là tinh thần hay u uất, lo âu, ngực sườn đầy tức. Thực phẩm này giúp sơ can lý khí, giải uất, điều hòa khí cơ trong cơ thể, giúp cải thiện tâm trạng.'
  },
  {
    section_key: 'TC_I',
    loai_the_chat: 'Thể Cơ Địa Bẩm Sinh (Dạng I)',
    de_xuat: 'Hạt dẻ cười, Hạt óc chó, Hạt dẻ ngựa, Nhãn, Gạo, Nếp, Gạo lứt, Khoai môn, Thịt gà.',
    nen_kieng: 'Tôm, Cua, Xoài, Đào, Vải (các tác nhân dễ gây dị ứng).',
    luan_giai: 'Đây là thể chất dễ dị ứng bẩm sinh (hen suyễn, mề đay). Nhóm thực phẩm này giúp ích khí cố biểu, dưỡng huyết khu phong, nâng cao sức đề kháng của cơ thể chống lại các tác nhân dị ứng bên ngoài.'
  }
];


interface ResultDashboardProps {
  results: GroupResult[];
  onReset: () => void;
  onEditAnswers: () => void;
  answers: Record<string, number>;
  activeQuestions: Question[];
  patientName?: string;
  birthYear?: string;
  address?: string;
  gender?: string;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ 
  results, onReset, onEditAnswers, answers, activeQuestions,
  patientName, birthYear, address, gender
}) => {
  const { user, profile } = useAuth();
  const [selectedGroupResult, setSelectedGroupResult] = useState<GroupResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recommendations] = useState<FoodRecommendation[]>(LOCAL_FOOD_RECOMMENDATIONS);

  // Tách Nhóm A ra riêng để dễ hiển thị
  const groupA = results.find(r => r.group === 'A');
  const otherGroups = results.filter(r => r.group !== 'A');

  // Những nhóm bệnh lý có chẩn đoán xác định hoặc xu hướng
  const positivePathology = otherGroups.filter(r => r.diagnosis === 'Xác định' || r.diagnosis === 'Xu hướng')
    .sort((a, b) => b.convertedScore - a.convertedScore);

  const activeConstitutionKeys = useMemo(() => {
    const keys: string[] = [];
    
    // Nhóm A
    if (groupA && (groupA.diagnosis === 'Xác định' || groupA.diagnosis === 'Cơ bản')) {
      keys.push('TC_A');
    }
    
    // Các nhóm bệnh lý khác
    positivePathology.forEach(r => {
      keys.push(`TC_${r.group}`);
    });
    
    // Nếu hoàn toàn bình thường và không phát hiện bệnh lý, hoặc danh sách trống,
    // mặc định khuyến cáo cho thể Bình Hòa (TC_A)
    if (keys.length === 0 && groupA) {
      keys.push('TC_A');
    }
    
    return keys;
  }, [groupA, positivePathology]);

  const handleSaveRecord = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveError(null);

    // a.json() maps to AWSJSON — AppSync expects a JSON string, not a raw object/array.
    const { errors } = await dataClient.models.SurveyRecord.create({
      patientName: patientName || 'Không rõ',
      birthYear: parseInt(birthYear || '0') || 0,
      address: address || '',
      gender: gender || 'nam',
      answers: JSON.stringify(answers),
      results: JSON.stringify(results),
      ownerEmail: user.email,
      ownerName: profile?.full_name || user.fullName || user.email,
    });

    if (errors && errors.length > 0) {
      setSaveError('Lỗi khi lưu: ' + errors.map((e) => e.message).join(', '));
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const StatusBadge = ({ diagnosis }: { diagnosis: string }) => {
    switch (diagnosis) {
      case 'Xác định':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">Xác định</span>;
      case 'Xu hướng':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Có xu hướng</span>;
      case 'Cơ bản':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Cơ bản thuộc</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">Bình thường</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800">Kết quả đánh giá thể chất</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Dựa trên hệ thống phân loại Y học cổ truyền. Thông tin này nhằm mục đích tham khảo và giáo dục sức khỏe.
          </p>
          {patientName && (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="text-sm text-emerald-800 font-medium">
                {patientName} • {gender === 'nam' ? 'Nam' : 'Nữ'} • Sinh năm {birthYear}
                {address && ` • ${address}`}
              </span>
            </div>
          )}
        </div>

        {/* Tổng quan Bình hòa */}
        {groupA && (
          <div 
            onClick={() => setSelectedGroupResult(groupA)}
            className={cn(
            "p-8 rounded-2xl border-2 transition-all shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-300",
            (groupA.diagnosis === 'Xác định' || groupA.diagnosis === 'Cơ bản')
              ? "bg-emerald-50 border-emerald-200"
              : "bg-white border-slate-100"
          )}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Nhóm A</div>
                <h2 className="text-2xl font-bold text-slate-800">{groupA.name}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <StatusBadge diagnosis={groupA.diagnosis} />
                  <span className="text-sm font-medium text-slate-600">
                    Điểm: <span className="text-slate-900">{groupA.convertedScore.toFixed(1)}</span>/100
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 max-w-xs">
                Thể chất bình hòa phản ánh sự cân bằng về âm dương, khí huyết sung túc. 
                {groupA.diagnosis === 'Xác định' && ' Xin chúc mừng, bạn có một thể chất khỏe mạnh!'}
              </div>
            </div>
          </div>
        )}

        {/* Thể chất bệnh lý nổi bật */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-800">Các Thể Chất Cần Lưu Ý</h3>
          {positivePathology.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {positivePathology.map((result, idx) => (
                <motion.div
                  key={result.group}
                  onClick={() => setSelectedGroupResult(result)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-6 rounded-2xl border cursor-pointer hover:shadow-md transition-all",
                    result.diagnosis === 'Xác định' 
                      ? "bg-rose-50 border-rose-100 hover:border-rose-300" 
                      : "bg-amber-50 border-amber-100 hover:border-amber-300"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Nhóm {result.group}</div>
                      <h4 className="text-lg font-bold text-slate-800">{result.name}</h4>
                    </div>
                    <StatusBadge diagnosis={result.diagnosis} />
                  </div>
                  <div className="flex bg-white/60 rounded-lg p-3">
                    <span className="text-sm text-slate-700">Điểm chuyển hóa: <strong>{result.convertedScore.toFixed(1)}</strong></span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500">Tuyệt vời, bạn không có dấu hiệu nổi bật của 8 loại thể chất bệnh lý.</p>
            </div>
          )}
        </div>

        {/* Các nhóm còn lại */}
        <div className="space-y-4 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Chi tiết các nhóm bệnh lý khác</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherGroups.filter(r => r.diagnosis === 'Không').map((result) => (
              <div 
                key={result.group} 
                onClick={() => setSelectedGroupResult(result)}
                className="p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50 cursor-pointer transition-all"
              >
                <div className="text-xs font-semibold text-slate-400">Nhóm {result.group}</div>
                <div className="text-sm font-medium text-slate-700 line-clamp-1" title={result.name}>{result.name}</div>
                <div className="text-xs text-slate-500 mt-2">Điểm: {result.convertedScore.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chế độ dinh dưỡng đề xuất tổng quan */}
        {activeConstitutionKeys.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Apple className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Chế độ dinh dưỡng đề xuất theo thể chất</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {activeConstitutionKeys.map((key) => {
                const rec = recommendations.find(r => r.section_key === key);
                if (!rec) return null;
                return (
                  <div key={key} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        {rec.loai_the_chat}
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase tracking-wider">
                        Đang áp dụng
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100/50">
                      <strong>Luận giải y khoa:</strong> {rec.luan_giai}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                      <div className="bg-emerald-50/50 hover:bg-emerald-50/80 p-4 rounded-xl border border-emerald-100/70 transition-colors flex flex-col">
                        <span className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                          <Utensils className="w-4.5 h-4.5 text-emerald-600" /> Thực phẩm khuyên dùng
                        </span>
                        <p className="text-emerald-950 leading-relaxed font-normal">{rec.de_xuat}</p>
                      </div>

                      <div className="bg-rose-50/50 hover:bg-rose-50/80 p-4 rounded-xl border border-rose-100/70 transition-colors flex flex-col">
                        <span className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                          <Ban className="w-4.5 h-4.5 text-rose-600" /> Thực phẩm nên kiêng
                        </span>
                        <p className="text-rose-950 leading-relaxed font-normal">{rec.nen_kieng}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save record section */}
        <div className="pt-8 border-t border-slate-200">
          {user ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6 text-center">
              {saved ? (
                <div className="space-y-3">
                  <div className="text-4xl">✅</div>
                  <h3 className="text-lg font-bold text-emerald-800">Đã lưu kết quả thành công!</h3>
                  <p className="text-sm text-emerald-600">Bạn có thể xem lại trong mục "Lịch sử khảo sát".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Lưu kết quả khảo sát</h3>
                  <p className="text-sm text-slate-600">Lưu kết quả vào tài khoản <strong>{profile?.full_name || profile?.email}</strong> để xem lại sau.</p>
                  {saveError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      {saveError}
                    </div>
                  )}
                  <button
                    onClick={handleSaveRecord}
                    disabled={saving}
                    className="px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Lưu kết quả
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center space-y-3">
              <div className="text-3xl">🔐</div>
              <h3 className="text-lg font-bold text-slate-700">Đăng nhập để lưu kết quả</h3>
              <p className="text-sm text-slate-500">Bạn cần đăng nhập hoặc tạo tài khoản để lưu kết quả khảo sát vào hệ thống.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center flex-wrap gap-4 pt-8">
          <button
            onClick={onEditAnswers}
            className="px-8 py-4 mt-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95"
          >
            Sửa đáp án
          </button>
          <button
            onClick={onReset}
            className="px-10 py-4 mt-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm shadow-lg shadow-slate-200 active:scale-95"
          >
            Làm bài khảo sát lại
          </button>
        </div>

        <AnimatePresence>
          {selectedGroupResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <div className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-1">
                      Nhóm {selectedGroupResult.group}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedGroupResult.name}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedGroupResult(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 min-w-[120px]">
                      <div className="text-xs text-slate-500 font-medium mb-1">Kết luận</div>
                      <div className="font-bold text-slate-800"><StatusBadge diagnosis={selectedGroupResult.diagnosis} /></div>
                    </div>
                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 min-w-[120px]">
                      <div className="text-xs text-slate-500 font-medium mb-1">Điểm chuyển hóa</div>
                      <div className="font-bold text-xl text-emerald-600">{selectedGroupResult.convertedScore.toFixed(1)} <span className="text-sm text-slate-400 font-medium">/ 100</span></div>
                    </div>
                  </div>

                  {(() => {
                    const selectedGroupRec = recommendations.find(r => r.section_key === 'TC_' + selectedGroupResult.group);
                    return selectedGroupRec ? (
                      <div className="mb-8 p-5 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 rounded-2xl border border-emerald-100/80 space-y-4">
                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                          <Apple className="w-5 h-5 text-emerald-600" />
                          Chế độ ăn uống đề xuất cho {selectedGroupResult.name}
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-100">
                            <span className="font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-slate-400" /> Luận giải:
                            </span>
                            <p className="text-slate-700 leading-relaxed font-normal">{selectedGroupRec.luan_giai}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 flex flex-col">
                              <span className="font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                                <Utensils className="w-4 h-4 text-emerald-600" /> Thực phẩm nên dùng:
                              </span>
                              <p className="text-emerald-950 leading-relaxed font-normal">{selectedGroupRec.de_xuat}</p>
                            </div>
                            
                            <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-100 flex flex-col">
                              <span className="font-semibold text-rose-800 mb-1.5 flex items-center gap-1.5">
                                <Ban className="w-4 h-4 text-rose-600" /> Thực phẩm nên kiêng:
                              </span>
                              <p className="text-rose-950 leading-relaxed font-normal">{selectedGroupRec.nen_kieng}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <h3 className="font-semibold text-slate-800 mb-4 px-1">Chi tiết câu trả lời</h3>
                  <div className="space-y-3">
                    {activeQuestions.filter(q => q.group === selectedGroupResult.group).map((q, idx) => {
                      const ans = answers[q.id];
                      let formattedAns = '';
                      if (ans === 1) formattedAns = 'Không có';
                      else if (ans === 2) formattedAns = 'Hiếm khi có';
                      else if (ans === 3) formattedAns = 'Thỉnh thoảng có';
                      else if (ans === 4) formattedAns = 'Thường xuyên có';
                      else if (ans === 5) formattedAns = 'Luôn luôn có';

                      let scorePoints = ans;
                      if (q.isReverse) scorePoints = 6 - ans;

                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col gap-3">
                          <div className="flex gap-3">
                            <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{q.text}</p>
                          </div>
                          <div className="ml-9 flex items-center flex-wrap gap-3">
                            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 shrink-0">
                              {formattedAns} ({ans} điểm)
                            </span>
                            {q.isReverse && (
                              <span className="text-xs text-amber-600 font-medium italic">
                                (Câu hỏi đảo: tính {scorePoints} điểm)
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
