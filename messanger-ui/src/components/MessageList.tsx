import { useEffect, useRef, useState } from 'react';
import { User, Search,
  MoreVertical,MessageSquare, Edit3, Plus
} from 'lucide-react';
// import io from 'socket.io-client';
import ComposeModal from './ComposeModal';
import NavigationSidebar from './NavigationSidebar';
// Import from your TS file
import {
  Message,
  Contact,
  getMessages,
  sendMessage,
  getUniqueContacts,
  // formatTime,
  createNewMessage,
  EmptyStateProps
} from '../api/messageService'; // Assuming your TS file is named messageService.ts

import { io } from "socket.io-client";
import ChatView from './ChatView';

const socket = io("https://etcmessanger-g3edgqbncsdchkau.centralindia-01.azurewebsites.net", {
  transports: ["websocket", "polling"], // Ensure polling is enabled
});

socket.on("connect", () => {
  console.log("Connected to WebSocket:", socket.id);
});

socket.on("serverMessage", (message: any) => {
  console.log("Server says:", message);
});

socket.on("newMessage", (message: any) => {
  console.log("New message received:", message);
});

// Main component
const TeamsUI = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const selectedChatRef = useRef<string | null>(null);

  // Keep the ref in sync with the state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Initial fetch of messages and socket setup
  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const messages = await getMessages();
        setAllMessages(messages);

        // Auto-select first contact if none selected
        if (!selectedChat && messages.length > 0) {
          const uniqueContacts = getUniqueContacts(messages);
          if (uniqueContacts.length > 0) {
            setSelectedChat(uniqueContacts[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching all messages:", error);
      }
    };

    fetchAllMessages();

    // Socket.io setup for receiving new messages
    socket.on('newMessage', (message: Message) => {
      setAllMessages(prevMessages => {
        // Check if message already exists
        const messageExists = prevMessages.some(msg => msg.id === message.id);
        if (messageExists) return prevMessages;

        return [...prevMessages, message];
      });
    });

    // Socket.io setup for message status updates
    socket.on('messageStatus', (update: { id: string, status: string }) => {
      setAllMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === update.id ? { ...msg, status: update.status } : msg
        )
      );
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageStatus');
    };
  }, []);


  // Function to safely change selected chat
  const handleChatSelection = (chatId: string) => {
    setSelectedChat(chatId);
  };

  // Function to handle compose button click
  const handleComposeClick = () => {
    setShowComposeModal(true);
  };

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      {/* Left Navigation Bar */}
      <NavigationSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Chat List Sidebar */}
      {showSidebar && (
        <ChatsSidebar
          selectedChat={selectedChat}
          setSelectedChat={handleChatSelection}
          allMessages={allMessages}
          onComposeClick={handleComposeClick}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChat ? (
          <ChatView
            chatId={selectedChat}
            toggleSidebar={() => setShowSidebar(!showSidebar)}
            showSidebar={showSidebar}
            allMessages={allMessages}
            setAllMessages={setAllMessages}
            socket={socket}
          />
        ) : (

          <EmptyState onComposeClick={handleComposeClick} />
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal
          onClose={() => setShowComposeModal(false)}
          onSend={(phoneNumber, message) => {
            // Create a contact if it doesn't exist
            // const newContact = {
            //   id: phoneNumber,
            //   name: phoneNumber,
            //   isOnline: false,
            //   isTeam: false,
            //   unread: 0,
            //   time: formatTime(new Date().toString()),
            //   lastMessage: message
            // };

            // Create a new message
            const newMsg = createNewMessage(phoneNumber, message);

            // Add message to the state
            setAllMessages(prev => [...prev, newMsg]);

            // Send via socket
            socket.emit('sendMessage', newMsg);

            // Also send through regular API to WhatsApp
            sendMessage(newMsg).catch(error => {
              console.error("Error sending new message to WhatsApp:", error);
            });

            // Close modal and select the new chat
            setShowComposeModal(false);
            setSelectedChat(phoneNumber);
          }}
        />
      )}
    </div>
  );
};


// Chat list sidebar with compose button
const ChatsSidebar = ({
  selectedChat,
  setSelectedChat,
  allMessages,
  onComposeClick
}: {
  selectedChat: string | null,
  setSelectedChat: (id: string) => void,
  allMessages: Message[],
  onComposeClick: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Generate contact list from messages
  useEffect(() => {
    if (allMessages.length > 0) {
      const uniqueContacts = getUniqueContacts(allMessages);
      setContacts(uniqueContacts);
    }
  }, [allMessages]);

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'teams' && !contact.isTeam) return false;
    if (filter === 'direct' && contact.isTeam) return false;
    if (searchQuery && !contact.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-72 flex flex-col h-full bg-[#f0f0f0] border-r border-gray-200">
      {/* Chat Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Chat</h2>
        <div className="flex items-center">
          <button
            onClick={onComposeClick}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200"
            title="New message"
          >
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

      {/* New Chat Button */}
      <div className="px-4 py-2">
        <button
          onClick={onComposeClick}
          className="w-full flex items-center justify-center py-2 bg-[#6264A7] hover:bg-[#525399] text-white rounded-md"
        >
          <Plus size={16} className="mr-2" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedChat(contact.id)}
              className={`flex items-center p-3 cursor-pointer hover:bg-[#e5e5e5] ${selectedChat === contact.id ? 'bg-[#e1e1e1]' : ''
                }`}
            >
              <div className="relative">
                {contact.isTeam ? (
                  <div className="w-10 h-10 rounded-sm bg-purple-100 flex items-center justify-center mr-3 text-purple-600 font-bold text-sm">
                    {contact.name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <User size={18} className="text-blue-600" />
                  </div>
                )}
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-[#f0f0f0]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={`truncate ${contact.unread > 0 ? 'font-semibold' : 'font-normal'}`}>
                    {contact.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">{contact.time}</span>
                </div>
                <p className={`text-sm truncate ${contact.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {contact.lastMessage}
                </p>
              </div>
              {contact.unread > 0 && (
                <div className="ml-2 min-w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center px-1.5 text-xs text-white">
                  {contact.unread}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
};

// Compose Modal Component

// Chat view component

const EmptyState: React.FC<EmptyStateProps> = ({ onComposeClick }) => {
  // Your component implementation
  return (
    <div>
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
      {/* Your existing EmptyState UI */}
      <button onClick={onComposeClick}>Compose New Message</button>
    </div>
  );
};



export default TeamsUI;