import { ChevronDown, User, Video, Phone, Search, Edit3, Gift, Sticker, Paperclip, PlusCircle, Smile, ThumbsUp, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Message, getContactName, filterMessages, getMessages, createNewMessage, sendMessage, groupMessagesByDate, getMessageBody, formatTime } from "../api/messageService";

const ChatView = ({
    chatId,
    toggleSidebar,
    showSidebar,
    allMessages,
    setAllMessages,
    socket
}: {
    chatId: string,
    toggleSidebar: () => void,
    showSidebar: boolean,
    allMessages: Message[],
    setAllMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    socket: any
}) => {
    const [newMessage, setNewMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [contact, setContact] = useState<any>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const currentChatIdRef = useRef<string>(chatId);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    // Update the ref when chatId changes
    useEffect(() => {
        currentChatIdRef.current = chatId;
    }, [chatId]);

    // Set contact info based on chatId
    useEffect(() => {
        setContact({
            id: chatId,
            name: getContactName(chatId),
            status: 'Available',
            isTeam: false
        });
    }, [chatId]);

    // Filter messages for current chat
    useEffect(() => {
        const filteredMessages = filterMessages(allMessages, chatId);
        setChatMessages(filteredMessages);
    }, [chatId, allMessages]);

    // Fetch messages for specific contact - only on initial load
    useEffect(() => {
        const fetchContactMessages = async () => {
            try {
                setIsTyping(true);
                const messages = await getMessages(chatId);

                // Use a functional update to prevent race conditions
                setAllMessages(prevMessages => {
                    // Get IDs of existing messages
                    const existingMessageIds = new Set(prevMessages.map(msg => msg.id));

                    // Only add messages that don't already exist
                    const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));

                    return [...prevMessages, ...newMessages];
                });

                setIsTyping(false);
            } catch (error) {
                console.error("Error fetching contact messages:", error);
                setIsTyping(false);
            }
        };

        if (chatId) {
            fetchContactMessages();

            // Join a socket room for this chat
            socket.emit('joinChat', chatId);
        }

        // Clean up when component unmounts or chatId changes
        return () => {
            socket.emit('leaveChat', chatId);
        };
    }, [chatId, socket]);

    // Listen for typing indicators
    useEffect(() => {
        const handleTypingStarted = (typingChatId: string) => {
            if (typingChatId === currentChatIdRef.current) {
                setIsTyping(true);
            }
        };

        const handleTypingStopped = (typingChatId: string) => {
            if (typingChatId === currentChatIdRef.current) {
                setIsTyping(false);
            }
        };

        socket.on('typingStarted', handleTypingStarted);
        socket.on('typingStopped', handleTypingStopped);

        return () => {
            socket.off('typingStarted', handleTypingStarted);
            socket.off('typingStopped', handleTypingStopped);
        };
    }, [socket]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Auto-resize textarea height based on content
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);

        // Emit typing indicator
        socket.emit('typing', chatId);

        // Clear typing indicator after delay
        const typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', chatId);
        }, 3000);

        // Reset height to get the actual scroll height
        e.target.style.height = 'auto';

        // Set new height
        const scrollHeight = e.target.scrollHeight;
        e.target.style.height = scrollHeight <= 120 ? `${scrollHeight}px` : '120px';

        return () => clearTimeout(typingTimeout);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        // Create new message object using our helper function
        const tempMessage = createNewMessage(chatId, newMessage);

        // Add to local state immediately
        // setAllMessages(prevMessages => [...prevMessages, tempMessage]); 
        setNewMessage('');

        // Reset input height
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        try {
            // Send message via socket
            socket.emit('sendMessage', tempMessage);

            // Also send through regular API for backup
            await sendMessage(tempMessage);
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Group messages by date using our helper function
    const groupedMessages = groupMessagesByDate(chatMessages);

    return (
        <>
            {/* Chat Header */}
            <div className="h-14 bg-white border-b border-gray-300 flex items-center px-4 justify-between flex-shrink-0">
                <div className="flex items-center">
                    {!showSidebar && (
                        <button
                            onClick={toggleSidebar}
                            className="mr-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
                        >
                            <ChevronDown size={20} />
                        </button>
                    )}

                    {contact?.isTeam ? (
                        <div className="w-8 h-8 rounded-sm bg-purple-100 flex items-center justify-center mr-2 text-purple-600 font-bold text-sm">
                            {contact.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <User size={16} className="text-blue-600" />
                        </div>
                    )}

                    <div>
                        <h2 className="font-semibold">{contact?.name || getContactName(chatId)}</h2>
                        <p className="text-xs text-gray-500">
                            {contact?.isTeam
                                ? `${contact.membersCount} members`
                                : contact?.status || (isTyping ? 'Typing...' : 'Available')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                        <Video size={18} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                        <Phone size={18} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 bg-white"
            >
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <User size={32} className="text-blue-500" />
                        </div>
                        <p className="text-center max-w-md">
                            No messages yet. Send a message to start the conversation.
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="mb-6">
                            {/* Date separator */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                    {date}
                                </div>
                            </div>

                            {/* Messages for this date */}
                            {dateMessages.map((msg, idx) => {
                                const isSent = msg.direction === 'sent' || msg.from === 'me';
                                const messageBody = getMessageBody(msg);
                                const showAvatar = idx === 0 ||
                                    (dateMessages[idx - 1]?.direction !== msg.direction);

                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1`}
                                    >
                                        {!isSent && showAvatar && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                        )}

                                        {!isSent && !showAvatar && <div className="w-8 mr-2"></div>}

                                        <div className="max-w-md flex flex-col">
                                            {showAvatar && !isSent && (
                                                <span className="text-xs text-gray-500 mb-1 ml-1">
                                                    {contact?.name} • {formatTime(msg.timestamp)}
                                                </span>
                                            )}

                                            <div
                                                className={`py-2 px-3 rounded-lg ${isSent
                                                    ? 'bg-[#6264A7] text-white'
                                                    : 'bg-[#F0F0F0] text-gray-800'
                                                    }`}
                                            >
                                                <div className="whitespace-pre-wrap">{messageBody}</div>
                                            </div>

                                            {showAvatar && isSent && (
                                                <span className="text-xs text-gray-500 mt-1 mr-1 self-end">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>

                                        {isSent && showAvatar && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                        )}

                                        {isSent && !showAvatar && <div className="w-8 ml-2"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-start mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <User size={16} className="text-blue-600" />
                        </div>
                        <div className="bg-[#F0F0F0] rounded-lg py-3 px-4 rounded-tl-none">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Format toolbar */}
            <div className="px-6 pt-2 bg-white flex">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit3 size={16} />
                </button>
                <div className="border-l border-gray-300 h-6 mx-2 my-auto"></div>
                {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
            <Image size={16} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
            <File size={16} />
          </button> */}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Gift size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Sticker size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Paperclip size={16} />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <PlusCircle size={16} />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-2 pb-6 bg-white">
                <div className="flex items-end bg-white rounded-md border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 focus-within:border-blue-500">
                    <textarea
                        ref={inputRef}
                        placeholder="Type a new message"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 outline-none resize-none py-1 max-h-32 overflow-y-auto"
                        rows={1}
                    />

                    <div className="flex space-x-1 items-center ml-2">
                        <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100">
                            <Smile size={20} />
                        </button>

                        <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100">
                            <ThumbsUp size={20} />
                        </button>

                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className={`p-1.5 rounded ${newMessage.trim()
                                ? 'text-[#6264A7] hover:bg-gray-100'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};


export default ChatView;