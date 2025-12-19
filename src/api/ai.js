import axios from 'axios';

const SKIN_BASE_URL = import.meta.env.VITE_AI_SKIN_BASE_URL || '';
const PET_BASE_URL = import.meta.env.VITE_AI_PET_BASE_URL || '';
const INSECT_BASE_URL = import.meta.env.VITE_AI_INSECT_BASE_URL || 'http://127.0.0.1:5000';

const normalizeResponse = (data) => {
  const label = data?.label || data?.prediction || data?.prediction_vi || data?.prediction_en || null;
  const confidence = 
    typeof data?.confidence === 'number' 
      ? data.confidence 
      : typeof data?.probability === 'number'
        ? data.probability * 100
        : typeof data?.confidence === 'string'
          ? parseFloat(data.confidence)
          : null;
  
  const extra = data?.extra || data?.details || data?.explanation || null;

  return {
    label: label || 'Không xác định',
    confidence: Number.isFinite(confidence) ? confidence : null,
    extra: extra,
    raw: data,
  };
};

export const predictInsectType = async ({ file }) => {
  if (!INSECT_BASE_URL) {
    throw new Error('VITE_AI_INSECT_BASE_URL chưa được cấu hình');
  }

  if (!file) {
    throw new Error('Vui lòng chọn ảnh');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${INSECT_BASE_URL}/api/classify-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return normalizeResponse(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.message || `Lỗi server: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw new Error(error.message || 'Lỗi không xác định');
    }
  }
};

/**
 *
 * @param {Object} params
 * @param {File} params.file 
 * @param {string} params.petType 
 * @returns {Promise<{label: string, confidence: number|null, extra: any, raw: any}>}
 */
export const predictSkinDisease = async ({ file, petType = 'dog' }) => {
  if (!SKIN_BASE_URL) {
    throw new Error('VITE_AI_SKIN_BASE_URL chưa được cấu hình');
  }

  if (!file) {
    throw new Error('Vui lòng chọn ảnh');
  }

  const formData = new FormData();
  formData.append('image', file);
  if (petType) {
    formData.append('pet_type', petType);
  }

  try {
    const response = await axios.post(`${SKIN_BASE_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return normalizeResponse(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw new Error(error.message || 'Lỗi không xác định');
    }
  }
};

/**
 *
 * @param {Object} params
 * @param {File} params.file 
 * @returns {Promise<{label: string, confidence: number|null, extra: any, raw: any}>}
 */
export const predictPetType = async ({ file }) => {
  if (!PET_BASE_URL) {
    throw new Error('VITE_AI_PET_BASE_URL chưa được cấu hình');
  }

  if (!file) {
    throw new Error('Vui lòng chọn ảnh');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${PET_BASE_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return normalizeResponse(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw new Error(error.message || 'Lỗi không xác định');
    }
  }
};

/**
 *
 */
export const checkSkinApiHealth = async () => {
  if (!SKIN_BASE_URL) return false;
  try {
    const response = await axios.get(`${SKIN_BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const checkPetApiHealth = async () => {
  if (!PET_BASE_URL) return false;
  try {
    const response = await axios.get(`${PET_BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const checkInsectApiHealth = async () => {
  if (!INSECT_BASE_URL) return false;
  try {
    const response = await axios.get(`${INSECT_BASE_URL}/api/health`, { timeout: 5000 });
    return response.status === 200 && response.data?.model_loaded;
  } catch {
    return false;
  }
};

export const predictInsectType2Model = async ({ file }) => {
  if (!INSECT_BASE_URL) {
    throw new Error('VITE_AI_INSECT_BASE_URL chưa được cấu hình');
  }

  if (!file) {
    throw new Error('Vui lòng chọn ảnh');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${INSECT_BASE_URL}/api/classify-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    const data = response.data;
    
    return {
      resnet18: {
        label: data?.resnet18?.prediction || null,
        confidence: typeof data?.resnet18?.confidence === 'number' ? data.resnet18.confidence : null,
        class_index: data?.resnet18?.class_index || null,
      },
      efficientnetb3: {
        label: data?.efficientnetb3?.prediction || null,
        confidence: typeof data?.efficientnetb3?.confidence === 'number' ? data.efficientnetb3.confidence : null,
        class_index: data?.efficientnetb3?.class_index || null,
      },
      raw: data,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.message || `Lỗi server: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw new Error(error.message || 'Lỗi không xác định');
    }
  }
};

