import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore, useDealStore, useUIStore } from '@/store';
import { api, ChatMessage } from '@/services/api';

export function ChatPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentDeal, fetchDeal } = useDealStore();
  const { addToast } = useUIStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileSheet, setShowFileSheet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: string; filename: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    if (!dealId) return;

    try {
      const response = await api.getMessages(dealId, { limit: 100 });
      setMessages(response.messages);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId) {
      fetchDeal(dealId);
      loadMessages();
    }
  }, [dealId, fetchDeal, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Only poll for messages on active deals (not completed/cancelled)
  useEffect(() => {
    const terminalStatuses = ['completed', 'cancelled', 'expired', 'disputed', 'refunded'];
    const isTerminal = currentDeal && terminalStatuses.includes(currentDeal.status);

    if (!isTerminal) {
      pollIntervalRef.current = setInterval(loadMessages, 5000);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadMessages, currentDeal?.status]);

  const handleFileUpload = async (file: File) => {
    if (!dealId) return;

    setIsUploading(true);
    setShowFileSheet(false);

    try {
      const result = await api.uploadChatFile(dealId, file);
      setPendingAttachment({
        url: result.url,
        type: result.type,
        filename: result.filename,
      });
      addToast('File attached. Add a message and send.', 'success');
    } catch (err) {
      addToast((err as Error).message || 'Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleChooseImage = () => {
    imageInputRef.current?.click();
  };

  const handleTakePicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const handleSend = async () => {
    if (!dealId || (!newMessage.trim() && !pendingAttachment) || isSending) return;

    const messageText = newMessage.trim() || (pendingAttachment ? `Sent ${pendingAttachment.type === 'image' ? 'an image' : 'a file'}` : '');
    const attachment = pendingAttachment ? { url: pendingAttachment.url, type: pendingAttachment.type } : undefined;

    setNewMessage('');
    setPendingAttachment(null);
    setIsSending(true);

    try {
      const sentMessage = await api.sendMessage(dealId, messageText, attachment);
      setMessages(prev => [...prev, sentMessage]);
      scrollToBottom();
    } catch (err) {
      addToast((err as Error).message || 'Failed to send message', 'error');
      setNewMessage(messageText);
      if (attachment) {
        setPendingAttachment({ ...attachment, filename: '' });
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const removeAttachment = () => {
    setPendingAttachment(null);
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  const isBuyer = user?.id === currentDeal?.buyerId;
  const counterpartyName = isBuyer ? currentDeal?.sellerUsername : currentDeal?.buyerUsername;
  if (isLoading) {
    return (
      <div className="figma-chat">
        <div className="figma-chat-loading">
          <div className="figma-chat-spinner" />
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="figma-chat">
        <div className="figma-chat-header">
          <button className="figma-chat-back" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
            </svg>
          </button>
          <div className="figma-chat-header-info">
            <h1 className="figma-chat-header-title">Chat</h1>
          </div>
        </div>
        <div className="figma-chat-empty">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: 16, color: '#bfed33', background: 'none', border: 'none', cursor: 'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="figma-chat">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />

      {/* Header - Figma exact: Deal #1001 title, @bot_help subtitle, Cancel dispute action */}
      <div className="figma-chat-header">
        <button className="figma-chat-back" onClick={() => navigate(`/deal/${dealId}`)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.66135 4.72419C10.054 4.40396 10.6331 4.42683 10.9992 4.79254C11.3653 5.15864 11.3879 5.73766 11.0676 6.13044L10.9992 6.20661L6.20529 11.0006H20.0022C20.5545 11.0006 21.0022 11.4483 21.0022 12.0006C21.002 12.5527 20.5543 13.0006 20.0022 13.0006H6.20725L10.9992 17.7925C11.3898 18.1831 11.3897 18.8161 10.9992 19.2066C10.6087 19.5971 9.9757 19.5971 9.58518 19.2066L3.43869 13.0601L3.33615 12.9459C2.88807 12.396 2.88782 11.603 3.33615 11.0533L3.43869 10.939L9.58518 4.79254L9.66135 4.72419Z"
              fill="white"
            />
          </svg>
        </button>
        <div className="figma-chat-header-info">
          <h1 className="figma-chat-header-title">
            Deal #{currentDeal?.dealNumber || ''}
          </h1>
          {counterpartyName && (
            <span className="figma-chat-header-subtitle">@{counterpartyName}</span>
          )}
        </div>
        {currentDeal?.status === 'disputed' && (
          <button className="figma-chat-cancel-dispute" onClick={() => navigate(`/deal/${dealId}`)}>
            Cancel dispute
          </button>
        )}

      </div>

      {/* Messages */}
      <div className="figma-chat-messages">
        {messages.length === 0 ? (
          <div className="figma-chat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p>No messages yet</p>
            <span>Send a message to start the conversation</span>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="figma-chat-date-divider">
                <span>{date}</span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                const senderLabel = isOwn ? 'You' : `@${msg.senderUsername || 'Unknown'}`;

                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="figma-chat-system-message">
                      <span>{msg.message}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`figma-chat-message ${isOwn ? 'figma-chat-message--own' : 'figma-chat-message--other'}`}
                  >
                    {/* Sender label with time - Figma shows "You HH:MM ✓✓" or "@bot_help HH:MM ✓✓" */}
                    <div className="figma-chat-message-sender">
                      <span className="figma-chat-message-sender-name">{senderLabel}</span>
                      <span className="figma-chat-message-time">{formatTime(msg.createdAt)}</span>
                      {isOwn && (
                        <span className="figma-chat-message-read">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1.45703 8.06877L3.4987 10.2077L4.09604 9.58188M9.6237 3.79102L6.08695 7.49617" stroke="#BFED33" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                            {msg.isRead && <path d="M4.375 8.06877L6.41667 10.2077L12.5417 3.79102" stroke="#BFED33" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />}
                          </svg>
                        </span>
                      )}
                    </div>
                    {/* Message bubble */}
                    <div className="figma-chat-message-bubble">
                      {/* Attachment */}
                      {msg.attachmentUrl && (
                        <div className="figma-chat-attachment">
                          {msg.attachmentType === 'image' ? (
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              className="figma-chat-attachment-image"
                              onClick={() => window.open(msg.attachmentUrl, '_blank')}
                            />
                          ) : (
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="figma-chat-attachment-file"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <span>View file</span>
                            </a>
                          )}
                        </div>
                      )}
                      <p>{msg.message}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="figma-chat-pending-attachment">
          <div className="figma-chat-pending-attachment-info">
            {pendingAttachment.type === 'image' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
            <span>{pendingAttachment.filename || 'File attached'}</span>
          </div>
          <button className="figma-chat-pending-attachment-remove" onClick={removeAttachment}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8.05427 13.8268L11.1497 6.87436C11.3743 6.36987 11.9655 6.14293 12.47 6.36755C12.9745 6.59218 13.2014 7.18331 12.9768 7.68783L9.88136 14.6402L9.84253 14.7395C9.67602 15.2361 9.91218 15.7187 10.2949 15.8891L10.5037 15.982L10.5824 16.0117C10.9546 16.131 11.4203 15.9745 11.6607 15.549L11.7085 15.4537L15.1149 7.80277C15.8103 6.24031 15.1852 4.51366 13.8336 3.82334L13.7005 3.75979L13.6273 3.72722C12.1607 3.07422 10.3425 3.77007 9.61335 5.40785L6.08856 13.3246L5.98478 13.5745C4.98196 16.1556 6.10309 18.986 8.45694 20.034L8.65321 20.1214L8.8826 20.2161C11.1896 21.0993 13.9009 20.0289 15.1077 17.6364L15.224 17.392L18.458 10.1283C18.6827 9.62376 19.2738 9.39682 19.7783 9.62144C20.2828 9.84607 20.5097 10.4372 20.2851 10.9417L17.0511 18.2055L16.8945 18.5356C15.2577 21.7787 11.4991 23.3611 8.17113 22.0854L7.83974 21.9485L7.64347 21.8611C4.2372 20.3445 2.76227 16.3477 4.12094 12.8484L4.26147 12.5112L7.78625 4.59437C8.92959 2.02639 11.888 0.763528 14.4408 1.90013L14.514 1.9327L14.7467 2.04381C17.1054 3.24663 18.0386 6.15264 16.942 8.61624L13.5355 16.2672L13.4014 16.5324C12.6975 17.7726 11.1958 18.3911 9.83096 17.8675L9.6902 17.8091L9.48144 17.7162C8.08049 17.0924 7.48076 15.5035 7.94691 14.1039L8.05427 13.8268Z" fill="white" fillOpacity="0.56" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area - Figma: rounded input with attach + send buttons */}
      <div className="figma-deals-footer">
        <div className="figma-chat-input-container">

          <textarea
            ref={inputRef}
            className="figma-chat-input"
            placeholder="Enter message here"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isSending}
          />
          <button
            className="figma-chat-attach-btn"
            onClick={() => setShowFileSheet(true)}
            disabled={isUploading || isSending}
          >
            {isUploading ? (
              <div className="figma-chat-spinner" style={{ width: 20, height: 20 }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.71255 11.521L9.29205 5.72733C9.47927 5.30692 9.97186 5.1178 10.3923 5.30499C10.8127 5.49218 11.0018 5.98479 10.8146 6.40523L8.23512 12.1989L8.20276 12.2816C8.064 12.6954 8.2608 13.0976 8.57975 13.2396L8.75371 13.317L8.81931 13.3418C9.12946 13.4412 9.51757 13.3108 9.7179 12.9562L9.7577 12.8768L12.5964 6.501C13.1759 5.19896 12.655 3.76008 11.5287 3.18481L11.4177 3.13186L11.3568 3.10471C10.1345 2.56054 8.61942 3.14043 8.01177 4.50524L5.07445 11.1026L4.98797 11.3108C4.15228 13.4617 5.08656 15.8204 7.0481 16.6937L7.21166 16.7665L7.40281 16.8454C9.32533 17.5815 11.5847 16.6895 12.5904 14.6957L12.6873 14.492L15.3824 8.43891C15.5696 8.0185 16.0622 7.82938 16.4826 8.01657C16.903 8.20376 17.0921 8.69637 16.9049 9.1168L14.2099 15.1699L14.0794 15.445C12.7154 18.1476 9.58321 19.4663 6.80992 18.4032L6.53377 18.2891L6.37021 18.2163C3.53165 16.9525 2.30254 13.6218 3.43477 10.7057L3.55187 10.4247L6.4892 3.82734C7.44198 1.68736 9.90729 0.634971 12.0347 1.58214L12.0956 1.60928L12.2896 1.70187C14.2552 2.70422 15.0328 5.1259 14.119 7.1789L11.2803 13.5547L11.1685 13.7757C10.5819 14.8092 9.33047 15.3246 8.19312 14.8883L8.07582 14.8396L7.90185 14.7622C6.73439 14.2424 6.23462 12.9183 6.62307 11.752L6.71255 11.521Z" fill="white" />
              </svg>
            )}
          </button>
          <button
            className="figma-chat-send-btn"
            onClick={handleSend}
            disabled={(!newMessage.trim() && !pendingAttachment) || isSending}
          >
            {isSending ? (
              <div className="figma-chat-spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19.3379 1.54909C20.9623 1.196 22.3848 2.73354 21.9053 4.34499L17.1319 20.4192C16.5865 22.2539 14.1281 22.5784 13.1348 20.9339L9.69436 15.2327L15.4209 9.46706C15.8101 9.0752 15.8079 8.44121 15.416 8.05202C15.0242 7.66352 14.391 7.66539 14.002 8.0569L8.28713 13.8098L2.55178 10.2805C0.924364 9.27865 1.24812 6.80664 3.09085 6.2698L19.1807 1.58913L19.3379 1.54909Z" fill="white" fillOpacity="0.56" />
              </svg>
            )}
          </button>
        </div>
        <div className="figma-home-indicator">
          <div className="figma-home-indicator-bar-specific" />
        </div>
      </div>

      {/* File action sheet - Figma exact design */}
      {showFileSheet && (
        <>
          <div className="figma-chat-file-sheet-overlay" onClick={() => setShowFileSheet(false)} />
          <div className="figma-chat-file-sheet">
            <div className="figma-chat-file-sheet-title">Add file</div>
            <div className="figma-chat-file-sheet-options ">
              <button className="figma-chat-file-sheet-option figma-chat-divider" onClick={handleChooseFile}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6.71352 11.522L9.29303 5.72831C9.48024 5.3079 9.97284 5.11878 10.3933 5.30597C10.8137 5.49315 11.0028 5.98577 10.8156 6.4062L8.2361 12.1999L8.20374 12.2826C8.06498 12.6964 8.26178 13.0986 8.58072 13.2406L8.75469 13.318L8.82028 13.3428C9.13043 13.4422 9.51855 13.3118 9.71888 12.9571L9.75867 12.8778L12.5974 6.50198C13.1769 5.19993 12.6559 3.76106 11.5296 3.18579L11.4187 3.13283L11.3577 3.10569C10.1355 2.56152 8.6204 3.1414 8.01275 4.50621L5.07543 11.1035L4.98894 11.3118C4.15326 13.4627 5.08753 15.8214 7.04908 16.6947L7.21264 16.7675L7.40379 16.8464C9.32631 17.5824 11.5857 16.6904 12.5914 14.6966L12.6883 14.493L15.3833 8.43989C15.5705 8.01948 16.0631 7.83036 16.4836 8.01754C16.904 8.20473 17.0931 8.69734 16.9059 9.11778L14.2109 15.1709L14.0804 15.446C12.7164 18.1486 9.58419 19.4673 6.8109 18.4041L6.53474 18.2901L6.37119 18.2173C3.53263 16.9535 2.30352 13.6228 3.43575 10.7067L3.55285 10.4257L6.49017 3.82832C7.44295 1.68834 9.90827 0.635948 12.0356 1.58311L12.0966 1.61026L12.2906 1.70285C14.2561 2.7052 15.0338 5.12688 14.1199 7.17987L11.2813 13.5557L11.1695 13.7767C10.5829 14.8102 9.33145 15.3256 8.1941 14.8893L8.0768 14.8406L7.90283 14.7631C6.73537 14.2434 6.2356 12.9193 6.62405 11.7529L6.71352 11.522Z" fill="white" />
                </svg>
                <span>Choose file</span>
              </button>
              <button className="figma-chat-file-sheet-option figma-chat-divider" onClick={handleTakePicture}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  {/* Camera Body */}
                  <path
                    d="M1.66602 6.98134C1.66602 6.68941 1.66602 6.54345 1.6782 6.4205C1.79568 5.23472 2.73374 4.29666 3.91952 4.17917C4.04247 4.16699 4.19631 4.16699 4.504 4.16699C4.62256 4.16699 4.68184 4.16699 4.73217 4.16394C5.37486 4.12502 5.93764 3.71939 6.1778 3.12199C6.19661 3.07521 6.21419 3.02247 6.24935 2.91699C6.28451 2.81152 6.30209 2.75878 6.32089 2.71199C6.56106 2.11459 7.12384 1.70896 7.76653 1.67004C7.81686 1.66699 7.87245 1.66699 7.98363 1.66699H12.0151C12.1262 1.66699 12.1818 1.66699 12.2322 1.67004C12.8749 1.70896 13.4376 2.11459 13.6778 2.71199C13.6966 2.75878 13.7142 2.81152 13.7493 2.91699C13.7845 3.02247 13.8021 3.07521 13.8209 3.12199C14.0611 3.71939 14.6238 4.12502 15.2665 4.16394C15.3169 4.16699 15.3761 4.16699 15.4947 4.16699C15.8024 4.16699 15.9562 4.16699 16.0792 4.17917C17.265 4.29666 18.203 5.23472 18.3205 6.4205C18.3327 6.54345 18.3327 6.68941 18.3327 6.98134V13.5003C18.3327 14.9005 18.3327 15.6005 18.0602 16.1353C17.8205 16.6057 17.4381 16.9882 16.9677 17.2278C16.4329 17.5003 15.7328 17.5003 14.3327 17.5003H5.66602C4.26588 17.5003 3.56582 17.5003 3.03104 17.2278C2.56063 16.9882 2.17818 16.6057 1.9385 16.1353C1.66602 15.6005 1.66602 14.9005 1.66602 13.5003V6.98134Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Camera Lens */}
                  <path
                    d="M9.99935 13.7503C11.8403 13.7503 13.3327 12.2579 13.3327 10.417C13.3327 8.57604 11.8403 7.08366 9.99935 7.08366C8.1584 7.08366 6.66602 8.57604 6.66602 10.417C6.66602 12.2579 8.1584 13.7503 9.99935 13.7503Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Take a picture</span>
              </button>
              <button className="figma-chat-file-sheet-option figma-last-chat" onClick={handleChooseImage}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* The circle (sun/moon) in the top left */}
                  <path
                    d="M7.50065 6.25033C8.19101 6.25033 8.75065 6.80997 8.75065 7.50033C8.75065 8.19068 8.19101 8.75033 7.50065 8.75033C6.8103 8.75033 6.25065 8.19068 6.25065 7.50033C6.25065 6.80997 6.8103 6.25033 7.50065 6.25033Z"
                    fill="white"
                  />
                  {/* The frame and mountains */}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.084 2.91699C18.2346 2.91699 19.1673 3.84973 19.1673 5.00033V15.0003C19.1673 16.1509 18.2346 17.0837 17.084 17.0837H2.91732C1.76672 17.0837 0.833984 16.1509 0.833984 15.0003V5.00033C0.833985 3.84973 1.76672 2.91699 2.91732 2.91699H17.084ZM9.21777 13.6283C8.72963 14.1164 7.93834 14.1164 7.4502 13.6283L5.83398 12.012L2.59017 15.255C2.66642 15.3528 2.78371 15.417 2.91732 15.417H17.084C17.2174 15.417 17.3341 15.3526 17.4103 15.255L12.5007 10.3454L9.21777 13.6283ZM2.91732 4.58366C2.6872 4.58366 2.50065 4.77021 2.50065 5.00033V12.9886L4.9502 10.5391L5.04541 10.4536C5.50363 10.0799 6.16434 10.0799 6.62256 10.4536L6.71777 10.5391L8.33398 12.1553L11.6169 8.8724L11.7121 8.78695C12.1703 8.41324 12.831 8.41324 13.2892 8.78695L13.3844 8.8724L17.5007 12.9886V5.00033C17.5007 4.77021 17.3141 4.58366 17.084 4.58366H2.91732Z"
                    fill="white"
                  />
                </svg>
                <span>Choose from gallery</span>
              </button>
            </div>
            <button className="figma-chat-file-sheet-cancel" onClick={() => setShowFileSheet(false)}>
              Cancel
            </button>
            <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
          </div>

        </>
      )}
    </div>
  );
}
