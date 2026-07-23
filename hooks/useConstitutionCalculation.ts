import { useMemo } from 'react';
import { GroupResult, Gender, DiagnosisStatus } from '../types';
import { CONSTITUTION_GROUPS, questions } from '../data/questions';

export function useConstitutionCalculation(answers: Record<string, number>, gender: Gender | null) {
  return useMemo(() => {
    if (!gender || Object.keys(answers).length === 0) return [];

    const results: GroupResult[] = [];
    const groupRawScores: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};

    // Khởi tạo
    Object.keys(CONSTITUTION_GROUPS).forEach((group) => {
      groupRawScores[group] = 0;
      groupCounts[group] = 0;
    });

    // Tính điểm thô
    questions.forEach((q) => {
      if (q.genderSpecific && q.genderSpecific !== gender) return;

      const ans = answers[q.id];
      if (ans !== undefined) {
        // Chỉ cộng điểm nếu câu hỏi này được trả lời
        let score = ans;
        if (q.isReverse) {
          // Tính điểm đảo chiều: 1->5, 2->4, 3->3, 4->2, 5->1
          score = 6 - ans;
        }
        groupRawScores[q.group] += score;
        groupCounts[q.group] += 1;
      }
    });

    // Tính điểm chuyển hóa
    const groupConvertedScores: Record<string, number> = {};
    Object.keys(groupRawScores).forEach((group) => {
      const raw = groupRawScores[group];
      const count = groupCounts[group];

      if (count === 0) {
        groupConvertedScores[group] = 0;
      } else {
        groupConvertedScores[group] = ((raw - count) * 100) / (count * 4);
      }
    });

    // Chẩn đoán Nhóm A
    const scoreA = groupConvertedScores['A'];
    let isAllOthersUnder30 = true;
    let isAllOthersUnder40 = true;

    Object.keys(groupConvertedScores).forEach((group) => {
      if (group !== 'A') {
        const score = groupConvertedScores[group];
        if (score >= 30) isAllOthersUnder30 = false;
        if (score >= 40) isAllOthersUnder40 = false;
      }
    });

    let diagnosisA: DiagnosisStatus = 'Không';
    if (scoreA >= 60 && isAllOthersUnder30) {
      diagnosisA = 'Xác định';
    } else if (scoreA >= 60 && isAllOthersUnder40) {
      diagnosisA = 'Cơ bản';
    }

    results.push({
      group: 'A',
      name: CONSTITUTION_GROUPS['A'],
      rawScore: groupRawScores['A'],
      convertedScore: scoreA,
      questionCount: groupCounts['A'],
      diagnosis: diagnosisA,
    });

    // Chẩn đoán Nhóm B -> I
    Object.keys(groupConvertedScores).forEach((group) => {
      if (group === 'A') return;

      const score = groupConvertedScores[group];
      let diagnosis: DiagnosisStatus = 'Không';

      if (score >= 40) {
        diagnosis = 'Xác định';
      } else if (score >= 30 && score < 40) {
        diagnosis = 'Xu hướng';
      }

      results.push({
        group,
        name: CONSTITUTION_GROUPS[group],
        rawScore: groupRawScores[group],
        convertedScore: score,
        questionCount: groupCounts[group],
        diagnosis,
      });
    });

    return results;
  }, [answers, gender]);
}
