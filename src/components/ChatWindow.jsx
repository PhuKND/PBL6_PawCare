import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useChatSocket } from '../chat/useChatSocket';
import { getChatHistory, normalizeMessage, sendChatRest } from '../api/chat';

/**
 * ChatWindow component - Hiển thị cửa sổ chat realtime
 * @param {Object} props
 * @param {Object} props.currentUser - { id: UUID, username: string }
 * @param {Object} props.partnerUser - { id: UUID, username: string, fullName?: string, avatarUrl?: string }
 * @param {string} props.partnerDisplayName - Tên hiển thị của partner (optional)
 * @param {Array<string>} props.quickPrompts - Mảng các prompt nhanh
 * @param {Function} props.onHeaderRender - Callback để render header tùy chỉnh
 */
export default function ChatWindow({
  currentUser,
  partnerUser,
  partnerDisplayName,
  quickPrompts = [],
  onHeaderRender
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesMapRef = useRef(new Map());

  const handleIncomingMessage = useCallback((rawMessage) => {
    const normalized = normalizeMessage(rawMessage);
    if (!normalized) return;

    const isRelevant = 
      (normalized.senderId === currentUser?.id && normalized.receiverId === partnerUser?.id) ||
      (normalized.senderId === partnerUser?.id && normalized.receiverId === currentUser?.id);

    if (!isRelevant) {
      return;
    }

    const messageId = normalized.id;
    if (messagesMapRef.current.has(messageId)) {
      return;
    }

    messagesMapRef.current.set(messageId, normalized);
    
    setMessages((prev) => {
      if (prev.some(m => m.id === messageId)) {
        return prev;
      }

      if (normalized.senderId === currentUser?.id) {
        const now = Date.now();
        const tempMessageIndex = prev.findIndex(m => {
          if (m.id && m.id.startsWith('temp-') && m.content === normalized.content) {
            const tempTime = new Date(m.createdAt || 0).getTime();
            const diff = Math.abs(now - tempTime);
            return diff < 5000;
          }
          return false;
        });

        if (tempMessageIndex !== -1) {
          const updated = [...prev];
          updated[tempMessageIndex] = normalized;
          updated.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateA - dateB;
          });
          return updated;
        }
      }
      
      const updated = [...prev, normalized];
      updated.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
      return updated;
    });
  }, [currentUser?.id, partnerUser?.id]);

  const { connected, sendMessage: sendMessageWS } = useChatSocket(currentUser?.id, handleIncomingMessage);

  useEffect(() => {
    if (!currentUser?.id || !partnerUser?.id) {
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        setLoading(true);
        messagesMapRef.current.clear();
        const historyRaw = await getChatHistory(partnerUser.id);
        
        const normalized = historyRaw
          .map(normalizeMessage)
          .filter(Boolean);
        
        normalized.forEach(msg => {
          messagesMapRef.current.set(msg.id, msg);
        });
        
        normalized.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        });
        
        setMessages(normalized);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [currentUser?.id, partnerUser?.id]);

  useEffect(() => {
    if (messagesContainerRef.current && bottomRef.current) {
      const container = messagesContainerRef.current;
      const bottom = bottomRef.current;
      
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !partnerUser?.id || !currentUser?.id || sending) {
      return;
    }

    const messageData = {
      senderId: currentUser.id,
      receiverId: partnerUser.id,
      content: trimmed
    };

    setSending(true);
    setInput('');

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = normalizeMessage({
      id: tempId,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      receiverId: partnerUser.id,
      receiverUsername: partnerUser.username,
      content: trimmed,
      createdAt: new Date().toISOString()
    });

    messagesMapRef.current.set(tempId, tempMessage);

    setMessages((prev) => {
      const updated = [...prev, tempMessage];
      updated.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
      return updated;
    });

    const success = sendMessageWS(messageData);
    
    if (!success && connected === false) {
      console.warn('WebSocket not connected, trying REST fallback');
      try {
        const restResult = await sendChatRest(messageData.senderId, messageData.receiverId, messageData.content);
        if (restResult) {
          const serverMsg = normalizeMessage(restResult);
          if (serverMsg) {
            messagesMapRef.current.delete(tempId);
            messagesMapRef.current.set(serverMsg.id, serverMsg);
            
            setMessages((prev) => {
              const filtered = prev.filter(m => m.id !== tempId);
              filtered.push(serverMsg);
              filtered.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateA - dateB;
              });
              return filtered;
            });
          }
        } else {
          console.error('Failed to send message via REST');
        }
      } catch (err) {
        console.error('Error sending via REST:', err);
      }
    }
    
    setSending(false);
  }, [input, partnerUser?.id, currentUser?.id, sending, connected, sendMessageWS]);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const defaultHeader = useMemo(() => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={partnerUser?.avatarUrl}
        sx={{ bgcolor: 'primary.main' }}
      >
        {partnerUser?.avatarUrl ? null : <PersonIcon />}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
          {partnerDisplayName || partnerUser?.fullName || partnerUser?.username || 'Người dùng'}
        </Typography>
        <Chip
          label={connected ? 'Trực tuyến' : 'Đang kết nối...'}
          color={connected ? 'success' : 'default'}
          size="small"
        />
      </Box>
    </Box>
  ), [partnerUser, partnerDisplayName, connected, isMobile]);

  const header = useMemo(() => {
    if (onHeaderRender) {
      return onHeaderRender({ connected, partnerUser, partnerDisplayName });
    }
    return defaultHeader;
  }, [onHeaderRender, connected, partnerUser, partnerDisplayName, defaultHeader]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.200' }}>
        {header}
      </Box>

      <Box
        ref={messagesContainerRef}
        sx={{
          p: { xs: 2, md: 3 },
          flex: 1,
          overflowY: 'auto',
          bgcolor: 'grey.50',
          minHeight: 0,
          position: 'relative'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </Typography>
              </Box>
            ) : (
              messages.map((m) => {
                const isOwn = m.senderId === currentUser?.id;
                return (
                  <Box
                    key={m.id}
                    sx={{
                      display: 'flex',
                      mb: 2,
                      justifyContent: isOwn ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isOwn && (
                      <Avatar
                        src={partnerUser?.avatarUrl}
                        sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}
                      >
                        {partnerUser?.avatarUrl ? null : <PersonIcon fontSize="small" />}
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '75%' }}>
                      <Paper
                        sx={{
                          p: 1.25,
                          px: 1.75,
                          bgcolor: isOwn ? 'primary.main' : 'white',
                          color: isOwn ? 'white' : 'text.primary',
                          borderRadius: 3,
                          borderTopLeftRadius: isOwn ? 12 : 4,
                          borderTopRightRadius: isOwn ? 4 : 12
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {m.content}
                        </Typography>
                      </Paper>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          display: 'block',
                          textAlign: isOwn ? 'right' : 'left'
                        }}
                      >
                        {formatTime(m.createdAt)}
                      </Typography>
                    </Box>
                    {isOwn && (
                      <Avatar
                        sx={{ width: 32, height: 32, ml: 1, bgcolor: 'secondary.main' }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}
                  </Box>
                );
              })
            )}
            <div ref={bottomRef} />
          </>
        )}
      </Box>

      <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'grey.200' }}>
        {quickPrompts.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {quickPrompts.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => setInput(prompt)}
                sx={{ cursor: 'pointer' }}
                size="small"
              />
            ))}
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending || (!connected && !currentUser?.id)}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={sending || !input.trim() || (!connected && !currentUser?.id)}
            sx={{
              bgcolor: 'primary.light',
              color: 'white',
              '&:hover': { bgcolor: 'primary.main' },
              '&:disabled': { bgcolor: 'grey.300' }
            }}
          >
            {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
        {!connected && currentUser?.id && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
            Đang kết nối... (sẽ thử gửi qua REST nếu cần)
          </Typography>
        )}
      </Box>
    </Box>
  );
}
