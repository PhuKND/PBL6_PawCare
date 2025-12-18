import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../config/server';

/**
 * Hook để quản lý WebSocket connection cho chat
 * @param {string} currentUserId - UUID của user hiện tại (KHÔNG phải username)
 * @param {Function} onMessage - Callback khi nhận được tin nhắn mới
 * @returns {Object} - { connected, sendMessage, disconnect }
 */
export function useChatSocket(currentUserId, onMessage) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    const connectHeaders = {};
    if (accessToken) {
      connectHeaders.Authorization = `Bearer ${accessToken}`;
    }

    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected for user:', currentUserId);
        setConnected(true);

        // Subscribe vào queue của currentUserId (UUID)
        const subscription = client.subscribe(
          `/queue/chat.${currentUserId}`,
          (message) => {
            try {
              const body = JSON.parse(message.body);
              if (onMessageRef.current) {
                onMessageRef.current(body);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          }
        );
        subscriptionRef.current = subscription;
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        if (frame.headers && (frame.headers['message']?.includes('401') || frame.headers['message']?.includes('403'))) {
          console.warn('WebSocket auth error. Check backend handshake configuration.');
          console.warn('Connect headers:', connectHeaders);
        }
        setConnected(false);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        setConnected(false);
      }
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setConnected(false);
    };
  }, [currentUserId]);

  /**
   * Gửi tin nhắn qua WebSocket
   * @param {Object} messageData - { senderId, receiverId, content }
   * @returns {boolean} - true nếu gửi thành công
   */
  const sendMessage = useCallback((messageData) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          content: messageData.content
        })
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  return { connected, sendMessage, disconnect };
}
