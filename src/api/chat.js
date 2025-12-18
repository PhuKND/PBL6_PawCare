import http from './http';
import { CHAT_HISTORY_URL, CHAT_PEOPLE_URL, CHAT_SEND_URL } from '../config/server';

/**
 * Lấy lịch sử chat với một người bạn (friendId là UUID)
 * @param {string} friendId - UUID của người bạn
 * @returns {Promise<Array>} - Mảng các tin nhắn đã normalize
 */
export async function getChatHistory(friendId) {
  try {
    const response = await http.get(CHAT_HISTORY_URL, {
      params: { friendId }
    });
    
    const data = response?.data;
    if (Array.isArray(data?.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Lấy danh sách người đã từng chat với current user
 * @returns {Promise<Array>} - Mảng các UserResponse
 */
export async function getChatPeople() {
  try {
    const response = await http.get(CHAT_PEOPLE_URL);
    
    const data = response?.data;
    if (Array.isArray(data?.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching chat people:', error);
    return [];
  }
}

/**
 * Gửi tin nhắn qua REST (fallback khi websocket disconnect)
 * @param {string} senderId - UUID của người gửi
 * @param {string} receiverId - UUID của người nhận
 * @param {string} content - Nội dung tin nhắn
 * @returns {Promise<Object|null>} - Response từ server hoặc null nếu lỗi
 */
export async function sendChatRest(senderId, receiverId, content) {
  try {
    const response = await http.post(CHAT_SEND_URL, {
      senderId,
      receiverId,
      content: content.trim()
    });
    return response?.data?.data || response?.data || null;
  } catch (error) {
    console.error('Error sending chat via REST:', error);
    return null;
  }
}

/**
 * Normalize message từ backend về format thống nhất
 * @param {Object} raw - Message raw từ backend
 * @returns {Object} - Message đã normalize
 */
export function normalizeMessage(raw) {
  if (!raw) return null;
  
  const sender = raw.sender || {};
  const receiverObj = raw.receiver || raw.reciever || {};
  
  return {
    id: raw.id ?? raw.messageId ?? `temp-${Date.now()}-${Math.random()}`,
    senderId: raw.senderId ?? sender.id ?? raw.sender,
    senderUsername: sender.username ?? raw.senderUsername ?? raw.sender ?? '',
    receiverId: raw.receiverId ?? receiverObj.id ?? raw.receiver ?? raw.reciever,
    receiverUsername: receiverObj.username ?? raw.receiverUsername ?? raw.receiver ?? raw.reciever ?? '',
    content: raw.content ?? raw.message ?? '',
    createdAt: raw.createdAt ?? raw.createAt ?? raw.created_at ?? new Date().toISOString()
  };
}
