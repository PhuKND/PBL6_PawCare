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

const INSECT_LABEL_MAP = {
  'bo cap': 'bọ cạp',
  'bo ve': 'bọ ve',
  'buom': 'bướm',
  'gian': 'gián',
  'kien': 'kiến',
  'muoi': 'muỗi',
  'nhen': 'nhện',
  'ret': 'rết',
  'ruoi': 'ruồi',
  'sau': 'sâu',
};

export function insectLabelToVi(labelEn) {
  if (!labelEn) return labelEn;
  const key = normalize(labelEn);
  return INSECT_LABEL_MAP[key] || labelEn;
}

const INSECT_KEYWORD_MAP = {
  'bo cap': 'cap',
  'bo ve': 've',
  'buom': 'buom',
  'gian': 'gian',
  'kien': 'kien',
  'muoi': 'muoi',
  'nhen': 'nhen',
  'ret': 'ret',
  'ruoi': 'ruoi',
  'sau': 'sau',
};

export function insectLabelToSearchKeyword(labelEn) {
  if (!labelEn) return '';
  const key = normalize(labelEn);
  return INSECT_KEYWORD_MAP[key] || key;
}

export default mapAiPredictionToVietnamese;


