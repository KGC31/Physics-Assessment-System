import React from 'react';
import { Gender } from '../types';

interface PatientInfoFormProps {
  patientName: string;
  setPatientName: (v: string) => void;
  birthYear: string;
  setBirthYear: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  gender: Gender | null;
  onSelectGender: (g: Gender) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  patientName, setPatientName,
  birthYear, setBirthYear,
  address, setAddress,
  gender,
  onSelectGender,
  onSubmit,
  onBack,
}) => {
  const canSubmit = patientName.trim() && birthYear.trim() && gender;

  const handleSubmit = () => {
    if (canSubmit && gender) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 w-full max-w-xl mx-auto min-h-[50vh]">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center">
        Thông tin người được khảo sát
      </h2>

      {/* Patient info fields */}
      <div className="w-full space-y-5">
        <div>
          <label className="block text-base font-semibold text-slate-700 mb-2">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-lg text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-colors placeholder:text-slate-400"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-700 mb-2">
            Năm sinh <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={birthYear}
            onChange={e => setBirthYear(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-lg text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-colors placeholder:text-slate-400"
            placeholder="VD: 1965"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-slate-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-lg text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-colors placeholder:text-slate-400"
            placeholder="Nhập địa chỉ (không bắt buộc)"
          />
        </div>
      </div>

      {/* Gender selection - enlarged for elderly users */}
      <div className="w-full">
        <label className="block text-base font-semibold text-slate-700 mb-4 text-center">
          Giới tính <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-5 w-full">
          <button
            type="button"
            onClick={() => onSelectGender('nam')}
            className={`group flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 transition-all duration-300 ${
              gender === 'nam'
                ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100'
                : 'border-slate-100 bg-white hover:border-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 mb-5 flex items-center justify-center text-5xl sm:text-6xl transition-colors shadow-sm ${
              gender === 'nam'
                ? 'bg-emerald-600 border-emerald-600'
                : 'bg-slate-50 border-slate-100 group-hover:bg-emerald-600 group-hover:border-emerald-600'
            }`}>👨</div>
            <span className={`text-2xl sm:text-2xl font-bold ${
              gender === 'nam' ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'
            }`}>Nam giới</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectGender('nu')}
            className={`group flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 transition-all duration-300 ${
              gender === 'nu'
                ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100'
                : 'border-slate-100 bg-white hover:border-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 mb-5 flex items-center justify-center text-5xl sm:text-6xl transition-colors shadow-sm ${
              gender === 'nu'
                ? 'bg-emerald-600 border-emerald-600'
                : 'bg-slate-50 border-slate-100 group-hover:bg-emerald-600 group-hover:border-emerald-600'
            }`}>👩</div>
            <span className={`text-2xl sm:text-2xl font-bold ${
              gender === 'nu' ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'
            }`}>Nữ giới</span>
          </button>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex flex-col items-center gap-4 w-full pt-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full max-w-sm px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg ${
            canSubmit
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-slate-100'
          }`}
        >
          Bắt đầu khảo sát
        </button>
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors uppercase tracking-wider text-xs active:scale-95"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};
