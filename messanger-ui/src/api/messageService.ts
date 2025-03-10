import axios from 'axios';

// Constants
const BASE_URL = 'https://etcmessanger-g3edgqbncsdchkau.centralindia-01.azurewebsites.net'; // Using your local URL as specified

// Interfaces
export interface Message {
  id: string;
  contact: string;
  from?: string;
  to?: string;
  timestamp?: string;
  text: { body: string } | string;
  type?: string;
  direction?: 'sent' | 'received';
}

export interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  isTeam: boolean;
  members?: number;
}


//EmptyStateProps interface 
export interface EmptyStateProps {
  onComposeClick: () => void;
}

// API Services
export const getMessages = async (contactId?: string): Promise<Message[]> => {
  try {
    const url = contactId 
      ? `${BASE_URL}/messages/${contactId}`
      : `${BASE_URL}/messages`;
    
    const response = await axios.get<Message[]>(url, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verification_token':
          'EAAQT08BiTmABO4WkwgCccy3ZA6qiuG83ROsyPXnjvHxBzo6SRnP8WZBBkWmqvB0gxuZCTq58FIwpgZAvLfAcAc6EpObATZBsYmjFV4fGJzJLssyaUIcM9IGTkvytsceIihExoyTzZAfXM5Nn6yIOS5pmZCahXWtNTkzTnq4H4snTIPKhMzgaYQyU6tvEYPZALpGhoAMWX3bu1ZAwDfI8GNii4tDzvfvIIySNfpqGJlMjBYf0rND6t40sZD',
        challenge: '123k',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (message: Message): Promise<boolean> => {
  try {
    await axios.post(`${BASE_URL}/new-send-message`, { tempMessage: message });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Helper Functions
export const getUniqueContacts = (messages: Message[]): Contact[] => {
  const contactMap = new Map<string, Message>();
  
  // Get the latest message for each contact
  messages.forEach(message => {
    const contactId = message.contact === 'me' ? message.to : message.contact;
    if (!contactId || contactId === 'me') return;
    
    if (!contactMap.has(contactId) || 
        new Date(message.timestamp || '').getTime() > new Date(contactMap.get(contactId)?.timestamp || '').getTime()) {
      contactMap.set(contactId, message);
    }
  });
  
  // Convert to contacts array
  return Array.from(contactMap.entries()).map(([id, message]) => {
    const lastMessage = typeof message.text === 'object' ? message.text.body : message.text;
    const time = formatMessageTime(message.timestamp || '');
    
    return {
      id,
      name: getContactName(id),
      lastMessage: message.direction === 'sent' ? `You: ${lastMessage}` : lastMessage,
      time,
      unread: 0, // You'll need to implement unread count logic
      isOnline: Math.random() > 0.5, // Placeholder for online status
      isTeam: false
    };
  });
};

export const formatMessageTime = (timestamp: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export const getContactName = (contactId: string): string => {
  // Map of contact IDs to names
  const contactNames: {[key: string]: string} = {
    "917489638090": "Dheeraj Pali",
    "919427957908": "Nihar Shah"
  };
  
  return contactNames[contactId] || `+${contactId}`;
};

export const formatTime = (timestamp?: string): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (timestamp?: string): string => {
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

export const getMessageBody = (msg: Message): string => {
  if (typeof msg.text === 'object' && msg.text.body) {
    return msg.text.body;
  } else if (typeof msg.text === 'string') {
    return msg.text as string;
  }
  return '';
};

export const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
  return messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = message.timestamp ? formatDate(message.timestamp) : 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
};

// Additional utility functions that might be useful based on the code
export const filterMessages = (allMessages: Message[], chatId: string): Message[] => {
  const filteredMessages = allMessages.filter(message => {
    // Include messages to/from this contact
    return (message.contact === chatId) || 
           (message.from === 'me' && message.to === chatId) ||
           (message.to === 'me' && message.from === chatId);
  });
  
  // Sort by timestamp
  return filteredMessages.sort((a, b) => 
    new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
  );
};

export const createNewMessage = (chatId: string, text: string): Message => {
  return {
    id: `temp-${Date.now()}`,
    contact: chatId,
    from: 'me',
    to: chatId,
    timestamp: new Date().toISOString(),
    text: { body: text },
    type: 'text',
    direction: 'sent',
  };
};



// import axios from 'axios';
// // const BASE_URL = 'https://etcmessanger-g3edgqbncsdchkau.centralindia-01.azurewebsites.net'; // Updated to http instead of https if Postman works on http
// const BASE_URL = 'http://localhost:3000'; // Updated to http instead of https if Postman works on http

// export interface Message {
//   id: string;
//   contact: string;
//   text: {
//     body: string;
//   } | string;
//   timestamp?: string;
//   direction?: 'sent' | 'received';
//   from?: string;
//   to?: string;
//   type?: string;
// }
// // export interface Message {
// //   id: string;
// //   from: string;
// //   timestamp: string;
// //   text: {
// //     body: string;
// //   };
// //   type: string;
// // }


// export const getMessages = async (): Promise<Message[]> => {
//   try {
//     const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
//       params: {
//         'hub.mode': 'subscribe',
//         'hub.verification_token':
//           'EAAQT08BiTmABO2f591d76mba0loWKZCNu2ZAQojXAlJZARfKfZARscUHLgKp4iMYN4twAbC5t5P3H8RNsxpvhxmWFvF1DFZBJVHg2Jq6PM6aGvjeqin5LmTF1S3piqOZA1jb6goSqluToHmYpJLrBO2t7LzFo3K9ymLaat4z1Gwl145ZBfiEXyA5GVbMF7bGPZAyUGt0zw1XFDTnUelR7N3HZBqQy7fQB6ZBEwmtSZCPWpBkq5O3zIUFZAgZD',
//         challenge: '123k',
//       },
//     });
//     console.log(response)
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     return [];
//   }
// };


// Add these functions to your existing services file

export const createNewContact = (phoneNumber: string): Contact => {
  return {
    id: phoneNumber,
    name: getContactName(phoneNumber),
    lastMessage: "",
    time: formatMessageTime(new Date().toISOString()),
    unread: 0,
    isOnline: true,
    isTeam: false
  };
};

export const checkIfContactExists = (contacts: Contact[], phoneNumber: string): boolean => {
  return contacts.some(contact => contact.id === phoneNumber);
};

export const addNewContact = (contacts: Contact[], newContact: Contact): Contact[] => {
  if (!checkIfContactExists(contacts, newContact.id)) {
    return [newContact, ...contacts];
  }
  return contacts;
};

// Optional: Enhanced contact name function to handle new contacts
// export const getContactName = (contactId: string): string => {
//   // Map of contact IDs to names
//   const contactNames: {[key: string]: string} = {
//     "917489638090": "Dheeraj Pali",
//     "919427957908": "Nihar Shah"
//   };
  
//   return contactNames[contactId] || `+${contactId}`;
// };