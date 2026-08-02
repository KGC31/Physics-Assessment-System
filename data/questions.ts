import { Question } from '../types';

export const CONSTITUTION_GROUPS: Record<string, string> = {
  A: 'Thể chất bình hòa',
  B: 'Thể chất khí hư',
  C: 'Thể chất dương hư',
  D: 'Thể chất âm hư',
  E: 'Thể chất đàm thấp',
  F: 'Thể chất thấp nhiệt',
  G: 'Thể chất huyết ứ',
  H: 'Thể chất khí uất',
  I: 'Thể chất cơ địa, bẩm sinh',
};

export const questions: Question[] = [
  // Nhóm A
  { id: 'A1', group: 'A', text: 'Tinh thần và thể lực của ông bà có đầy đủ không?' },
  { id: 'A2', group: 'A', text: 'Ông bà có dễ bị mệt mỏi không?', isReverse: true },
  { id: 'A3', group: 'A', text: 'Giọng nói của ông bà có bị thấp hoặc thiếu lực không?', isReverse: true },
  { id: 'A4', group: 'A', text: 'Ông bà có cảm thấy tâm trạng khó chịu không vui hoặc dễ bị trầm lắng không?', isReverse: true },
  { id: 'A5', group: 'A', text: 'Ông bà có cảm thấy không chịu được lạnh với người bình thường không? (Lạnh của mùa đông, lạnh của điều hòa, quạt…)', isReverse: true },
  { id: 'A6', group: 'A', text: 'Ông bà có khả năng thích ứng với sự thay đổi của hoàn cảnh ngoài tự nhiên và hoàn cảnh xã hội không?' },
  { id: 'A7', group: 'A', text: 'Ông bà có dễ bị mất ngủ không?' },
  { id: 'A8', group: 'A', text: 'Ông bà có hay quên không?' },

  // Nhóm B
  { id: 'B1', group: 'B', text: 'Ông bà có dễ mệt mỏi không?' },
  { id: 'B2', group: 'B', text: 'Ông bà có dễ bị hụt hơi, thiếu khí không?' },
  { id: 'B3', group: 'B', text: 'Ông bà có dễ bị hồi hộp trống ngực không?' },
  { id: 'B4', group: 'B', text: 'Ông bà có dễ bị váng đầu hoặc chóng mặt khi đứng không?' },
  { id: 'B5', group: 'B', text: 'Ông bà có dễ bị cảm mạo so với người bình thường không?' },
  { id: 'B6', group: 'B', text: 'Ông bà có thích yên tĩnh, ngại nói chuyện không?' },
  { id: 'B7', group: 'B', text: 'Khi nói, tiếng nói của ông bà có bị vô lực không?' },
  { id: 'B8', group: 'B', text: 'Khi vận động hơi nặng ông bà có dễ ra mồ hôi không?' },

  // Nhóm C
  { id: 'C1', group: 'C', text: 'Tay chân của ông bà có hay bị lạnh không?' },
  { id: 'C2', group: 'C', text: 'Vùng dạ dày, vùng sau lưng hoặc vùng thắt lưng đầu gối của ông bà có cảm giác sợ lạnh không?' },
  { id: 'C3', group: 'C', text: 'Ông bà có cảm giác sợ lạnh, mặc nhiều quần áo so với người khác không?' },
  { id: 'C4', group: 'C', text: 'Ông bà có cảm thấy không chịu được lạnh với người bình thường không? (Lạnh của mùa đông, lạnh của điều hòa, quạt…)' },
  { id: 'C5', group: 'C', text: 'Ông bà có dễ bị cảm mạo so với người bình thường không?' },
  { id: 'C6', group: 'C', text: 'Ông bà ăn (uống) đồ lạnh có cảm giác khó chịu hoặc sợ khi ăn (uống) đồ lạnh không?' },
  { id: 'C7', group: 'C', text: 'Ông bà sau khi bị lạnh hoặc sau khi ăn uống đồ lạnh ông bà có dễ bị đi ngoài không?' },

  // Nhóm D
  { id: 'D1', group: 'D', text: 'Ông bà có cảm giác lòng bàn tay chân nóng không?' },
  { id: 'D2', group: 'D', text: 'Ông bà có cảm giác mặt và thân mình nóng không?' },
  { id: 'D3', group: 'D', text: 'Da dẻ hoặc môi của ông bà có bị khô không?' },
  { id: 'D4', group: 'D', text: 'Sắc môi miệng của ông bà có bị đỏ so với người bình thường không?' },
  { id: 'D5', group: 'D', text: 'Ông bà có hay bị đại tiện táo bón hoặc khô không?' },
  { id: 'D6', group: 'D', text: 'Mặt và hai gò má của ông bà có bị đỏ, hơi đỏ về chiều hoặc cơn nóng phừng mặt không?' },
  { id: 'D7', group: 'D', text: 'Ông bà có cảm giác hai mắt khô sáp không?' },
  { id: 'D8', group: 'D', text: 'Ông bà có cảm thấy miệng khô táo muốn uống nước không?' },

  // Nhóm E
  { id: 'E1', group: 'E', text: 'Ông bà có cảm giác khó chịu trong lồng ngực hoặc vùng bụng trướng đầy hay không?' },
  { id: 'E2', group: 'E', text: 'Ông bà có cảm giác mình mẩy nặng nề không thoải mái không?' },
  { id: 'E3', group: 'E', text: 'Ông bà có thấy bụng béo mềm nhão không?' },
  { id: 'E4', group: 'E', text: 'Ông bà có thấy hiện tượng vùng trán tiết nhờn không?' },
  { id: 'E5', group: 'E', text: 'Ông bà có thấy mi mắt trên nề hơn so với người bình thường không? (Mi mắt trên có hiện tượng phù nhẹ vào lúc ngủ dậy?)' },
  { id: 'E6', group: 'E', text: 'Ông bà có cảm giác dính nhớt trong miệng không?' },
  { id: 'E7', group: 'E', text: 'Bình thường cũng có thấy đờm nhiều, đặc biệt là vùng họng thường có cảm giác đờm vướng không?' },
  { id: 'E8', group: 'E', text: 'Ông bà có cảm thấy rêu lưỡi dày nhờn hoặc cảm thấy rêu lưỡi dầy không?' },

  // Nhóm F
  { id: 'F1', group: 'F', text: 'Vùng mặt hoặc mũi của ông bà có cảm giác nhờn dính hoặc bóng mỡ không?' },
  { id: 'F2', group: 'F', text: 'Ông bà có dễ bị mụn nhọt, trứng cá không?' },
  { id: 'F3', group: 'F', text: 'Ông bà có cảm thấy miệng đắng hoặc trong miệng có vị khác thường không?' },
  { id: 'F4', group: 'F', text: 'Ông bà khi đại tiện có bị dính trệ không thoải mái hoặc không hết bãi không?' },
  { id: 'F5', group: 'F', text: 'Ông bà khi đi tiểu có cảm giác trong đường tiểu nóng, nước tiểu màu đậm (sẫm màu) không?' },
  { id: 'F6a', group: 'F', text: 'Bà có thấy khí hư màu vàng không?', genderSpecific: 'nu' },
  { id: 'F6b', group: 'F', text: 'Ông có thấy vùng hạ bộ ẩm ướt không?', genderSpecific: 'nam' },

  // Nhóm G
  { id: 'G1', group: 'G', text: 'Trên da của ông bà có tự nhiên xuất hiện những đám màu xanh tím (hoặc xuất huyết dưới da) không?' },
  { id: 'G2', group: 'G', text: 'Trên hai gò má của ông bà có những mạch đỏ nhỏ li ti không?' },
  { id: 'G3', group: 'G', text: 'Trên thân thể của ông bà có chỗ nào đau không?' },
  { id: 'G4', group: 'G', text: 'Sắc mặt của ông bà có ám tối hoặc dễ bị sạm đen không?' },
  { id: 'G5', group: 'G', text: 'Ông bà có dễ bị thâm quầng mắt không?' },
  { id: 'G6', group: 'G', text: 'Ông bà hay quên không? (kiện vong)' },
  { id: 'G7', group: 'G', text: 'Môi của ông bà có bị thâm không?' },

  // Nhóm H
  { id: 'H1', group: 'H', text: 'Ông bà có cảm giác khó chịu không vui, tâm trạng trầm lắng không?' },
  { id: 'H2', group: 'H', text: 'Ông bà có dễ bị căng thẳng, lo lắng không yên không?' },
  { id: 'H3', group: 'H', text: 'Ông bà có cảm giác đa sầu đa cảm, dễ tổn thương không?' },
  { id: 'H4', group: 'H', text: 'Ông bà có cảm giác dễ sợ hãi hoặc dễ hoảng hốt không?' },
  { id: 'H5', group: 'H', text: 'Mạng sườn hoặc vùng ngực có bị đau trướng không?' },
  { id: 'H6', group: 'H', text: 'Ông bà có vô duyên vô cớ thở dài không?' },
  { id: 'H7', group: 'H', text: 'Vùng hầu họng của ông bà có cảm giác có dị vật mà khạc không ra, nuốt không xuống không?' },

  // Nhóm I
  { id: 'I1', group: 'I', text: 'Ông bà khi không bị cảm cũng có thể bị hắt hơi không?' },
  { id: 'I2', group: 'I', text: 'Ông bà khi không bị cảm mạo cũng có thể bị ngạt mũi không?' },
  { id: 'I3', group: 'I', text: 'Ông bà có ho khi thay đổi thời tiết, biến đổi nhiệt độ hoặc có mùi khó chịu không?' },
  { id: 'I4', group: 'I', text: 'Ông bà có dễ bị dị ứng (Đối với động vật, thức ăn, mùi vị, phấn hoa hoặc thời tiết giao mùa, khí hậu thay đổi) không?' },
  { id: 'I5', group: 'I', text: 'Da của ông bà có dễ bị dị ứng (nổi mề đay, phát ban…) không?' },
  { id: 'I6', group: 'I', text: 'Da của ông bà khi bị dị ứng có xuất hiện tử ban (Ban đỏ tím, ban ứ) không?' },
  { id: 'I7', group: 'I', text: 'Da của ông bà có hiện tượng khi gãi là đỏ, kèm xuất hiện vạch gãi không?' },
];
