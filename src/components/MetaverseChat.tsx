import { useState, useEffect, useRef } from 'react';
import { metaverseService, ChatMessage } from '../services/metaverse';
import { MessageCircle, Send, X } from 'lucide-react';

interface MetaverseChatProps {
  userId: string;
}

export default function MetaverseChat({ userId }: MetaverseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();

    const channel = metaverseService.subscribeToChat((message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await metaverseService.getChatHistory(50);
      setMessages(history.reverse());
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await metaverseService.sendChatMessage(userId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <form onSubmit={handleSendMessage} className="bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-yellow-500 p-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={18} className="text-yellow-500" />
          <span className="text-yellow-400 text-sm font-bold">채팅 (캐릭터 위에 말풍선으로 표시됩니다)</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요... (Enter로 전송, 5초간 표시됩니다)"
            maxLength={100}
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-yellow-500 text-red-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-right">
          {newMessage.length}/100
        </div>
      </form>
    </div>
  );
}
