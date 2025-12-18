const PREDICTION_MAP = {
  'medical tape': 'băng keo y tế',
  'medical tweezers': 'nhíp y tế',
  'medicine cup': 'cốc y tế',
  'mercury thermometer': 'nhiệt kế thủy ngân',
  'nebulizer mask': 'mặt nạ máy xông',
  'pulse oximeter': 'máy đo độ bão hòa oxy',
  'reflex hammer': 'búa phản xạ',
  'stethoscope': 'ống nghe',
  'surgical scissors': 'kéo phẫu thuật',
  'medical mask': 'khẩu trang',
  'cotton balls': 'bông gòn y tế',
  'medical gloves': 'găng tay y tế',
  'infrared thermometer': 'nhiệt kế hồng ngoại',
  'blood pressure monitor': 'máy đo huyết áp'
};

function normalize(text) {
  return (text || '')
    .toString()
    .trim()
    .toLowerCase();
}

export function mapAiPredictionToVietnamese(prediction) {
  const key = normalize(prediction);
  return PREDICTION_MAP[key] || prediction;
}

export default mapAiPredictionToVietnamese;


