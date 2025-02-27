import { useEffect, useRef, useState } from 'react';
import { getMessages, Message } from '../api/messageService';
import axios from 'axios';
import {
  Send, Paperclip, Mic, Smile, User, Search,
  MoreVertical, Phone, Video, Grid, Calendar,
  Bell, MessageSquare, Settings, ChevronDown,
  Image, File, Gift, Sticker, PlusCircle,
  ThumbsUp, Edit3, Ellipsis
} from 'lucide-react';

// Main component
const TeamsUI = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [selectedChat, setSelectedChat] = useState<string | null>('917458123456');

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      {/* Left Navigation Bar */}
      <NavigationSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Chat List Sidebar */}
      {showSidebar && <ChatsSidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChat ? (
          <ChatView
            chatId={selectedChat}
            toggleSidebar={() => setShowSidebar(!showSidebar)}
            showSidebar={showSidebar}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

// Left navigation sidebar with icons
const NavigationSidebar = ({
  activeTab,
  setActiveTab
}: {
  activeTab: string,
  setActiveTab: (tab: string) => void
}) => {
  const navItems = [
    { id: 'activity', icon: Bell, label: 'Activity' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'teams', icon: Grid, label: 'Teams' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'calls', icon: Phone, label: 'Calls' },
  ];

  return (
    <div className="w-16 bg-[#2b2a2c] flex flex-col items-center text-white">
      {/* User avatar */}
      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center my-4 cursor-pointer">
        <User size={20} />
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center w-full">
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex flex-col items-center py-3 cursor-pointer relative
              ${activeTab === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
            )}
            <item.icon size={22} />
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="mb-4 w-full flex flex-col items-center py-3 cursor-pointer text-gray-400 hover:text-gray-200">
        <Settings size={22} />
        <span className="text-xs mt-1">Settings</span>
      </div>
    </div>
  );
};

// Chat list sidebar
const ChatsSidebar = ({
  selectedChat,
  setSelectedChat
}: {
  selectedChat: string | null,
  setSelectedChat: (id: string) => void
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  const chats = [
    { id: '917458123456', name: 'ETG', lastMessage: 'Hey, how are you?', time: '2:30 PM', unread: 0, isOnline: true, isTeam: false },
    // { id: '917498765432', name: 'Marketing Team', lastMessage: 'Jane: Let me know when you\'re free', time: '10:15 AM', unread: 0, isOnline: false, isTeam: true, members: 5 },
    // { id: '917424681012', name: 'Mike Johnson', lastMessage: 'The project is ready for review', time: 'Yesterday', unread: 0, isOnline: true, isTeam: false },
    // { id: '917424681013', name: 'Development Team', lastMessage: 'Alex: The latest update has been deployed', time: 'Yesterday', unread: 3, isOnline: false, isTeam: true, members: 8 },
    // { id: '917424681014', name: 'Sarah Williams', lastMessage: 'Can we schedule a call tomorrow?', time: 'Feb 24', unread: 0, isOnline: false, isTeam: false },
  ];

  const filteredChats = chats.filter(chat => {
    if (filter === 'teams' && !chat.isTeam) return false;
    if (filter === 'direct' && chat.isTeam) return false;
    if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-72 flex flex-col h-full bg-[#f0f0f0] border-r border-gray-200">
      {/* Chat Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Chat</h2>
        <div className="flex items-center">
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200">
            <Edit3 size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 ml-1">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="bg-white rounded-md border border-gray-300 px-3 py-2 flex items-center">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 flex space-x-2 text-sm">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-[#e1e1e1]' : 'hover:bg-[#e5e5e5]'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('teams')}
          className={`px-3 py-1 rounded-md ${filter === 'teams' ? 'bg-[#e1e1e1]' : 'hover:bg-[#e5e5e5]'}`}
        >
          Teams
        </button>
        <button
          onClick={() => setFilter('direct')}
          className={`px-3 py-1 rounded-md ${filter === 'direct' ? 'bg-[#e1e1e1]' : 'hover:bg-[#e5e5e5]'}`}
        >
          People
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className={`flex items-center p-3 cursor-pointer hover:bg-[#e5e5e5] ${selectedChat === chat.id ? 'bg-[#e1e1e1]' : ''
              }`}
          >
            <div className="relative">
              {chat.isTeam ? (
                <div className="w-10 h-10 rounded-sm bg-purple-100 flex items-center justify-center mr-3 text-purple-600 font-bold text-sm">
                  {chat.name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <User size={18} className="text-blue-600" />
                </div>
              )}
              {chat.isOnline && (
                <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-[#f0f0f0]"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`truncate ${chat.unread > 0 ? 'font-semibold' : 'font-normal'}`}>
                  {chat.name}
                </h3>
                <span className="text-xs text-gray-500 ml-2">{chat.time}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <div className="ml-2 min-w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center px-1.5 text-xs text-white">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Chat view component
const ChatView = ({
  chatId,
  toggleSidebar,
  showSidebar
}: {
  chatId: string,
  toggleSidebar: () => void,
  showSidebar: boolean
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [contact, setContact] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Contact details
  useEffect(() => {
    // Simulate fetching contact details
    const contacts = [
      { id: '7489638090', name: 'Dheeraj Pali', status: 'Available', isTeam: false },
      // { id: '917498765432', name: 'Marketing Team', membersCount: 5, isTeam: true },
      // { id: '917424681012', name: 'Mike Johnson', status: 'In a meeting', isTeam: false },
      // { id: '917424681013', name: 'Development Team', membersCount: 8, isTeam: true },
      // { id: '917424681014', name: 'Sarah Williams', status: 'Away', isTeam: false },
    ];

    const foundContact = contacts.find(c => c.id === chatId);
    setContact(foundContact || null);
  }, [chatId]);

  // Fetch messages on component mount
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => prevTime + 1); // Update time every second
    }, 1000);
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getMessages();
        console.log(fetchedMessages);
  
        const extendedMessages = [...fetchedMessages];
        setMessages(extendedMessages);
        setIsTyping(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsTyping(false);
      }
    };
  
    fetchMessages();
  }, [chatId, time]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea height based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Reset height to get the actual scroll height
    e.target.style.height = 'auto';

    // Set new height
    const scrollHeight = e.target.scrollHeight;
    e.target.style.height = scrollHeight <= 120 ? `${scrollHeight}px` : '120px';
  };

  const handleSendMessage = async () => {

    if (!newMessage.trim()) return;

    // Add user message to chat
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      contact: chatId,
      from: 'me',
      to: chatId,
      timestamp: new Date().toISOString(),
      text: { body: newMessage },
      type: 'text',
      direction: 'sent',
    };



    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    // Reset input height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Set typing indicator
    setIsTyping(true);

    console.log("inside call")
    try {
      // Send message to server (simulated)
      await axios.post('http://localhost:3000/new-send-message', {
        tempMessage
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper function to get message body from different formats
  const getMessageBody = (msg: Message): string => {
    if (typeof msg.text === 'object' && msg.text.body) {
      return msg.text.body;
    } else if (typeof msg.text === 'string') {
      return msg.text as string;
    }
    return '';
  };

  // Format timestamp to readable time
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message groups
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = message.timestamp ? formatDate(message.timestamp) : 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

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
            <h2 className="font-semibold">{contact?.name || 'ETG'}</h2>
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
        {messages.length === 0 ? (
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
                const isSent = msg.direction === 'sent';
                const messageBody = getMessageBody(msg);
                const showAvatar = idx === 0 ||
                  dateMessages[idx - 1]?.direction !== msg.direction;

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
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
          <Image size={16} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
          <File size={16} />
        </button>
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

// Empty state when no chat is selected
const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
        <MessageSquare size={40} className="text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Connect and collaborate with your team members through instant messaging
      </p>
      <button className="bg-[#6264A7] text-white px-4 py-2 rounded-md hover:bg-[#525399]">
        Start a new conversation
      </button>
    </div>
  );
};

export default TeamsUI;