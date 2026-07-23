export type Gender = 'nam' | 'nu';

export interface Question {
  id: string;
  group: string;
  text: string;
  isReverse?: boolean;
  genderSpecific?: Gender;
}

export type ScoreLevel = 1 | 2 | 3 | 4 | 5;

export type DiagnosisStatus = 'Xác định' | 'Cơ bản' | 'Xu hướng' | 'Không';

export interface GroupResult {
  group: string;
  name: string;
  rawScore: number;
  convertedScore: number;
  questionCount: number;
  diagnosis: DiagnosisStatus;
}

export interface FoodRecommendation {
  section_key: string;
  loai_the_chat: string;
  de_xuat: string;
  nen_kieng: string;
  luan_giai: string;
}

