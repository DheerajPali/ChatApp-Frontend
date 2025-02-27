import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Updated to http instead of https if Postman works on http

export interface Message {
  id: string;
  contact: string;
  text: {
    body: string;
  } | string;
  timestamp?: string;
  direction?: 'sent' | 'received';
  from?: string;
  to?: string;
  type?: string;
}
// export interface Message {
//   id: string;
//   from: string;
//   timestamp: string;
//   text: {
//     body: string;
//   };
//   type: string;
// }


export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await axios.get<Message[]>(`${BASE_URL}/messages`, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verification_token':
          'EAAQT08BiTmABO9ycTVLM0Id1yuumjCUwWVXmRMGUKiQGZBcxxmwnyyiHrUyM8gjUR77dbkPGnxbCDm01zU42QcKi29sDBgE8LVelJ6erJM0XXkcKzck1J0DraAa5V43rjM54si6wwnUxpNLx6CoLzsu9eZCFu6oL3ueXllARXSfX2HR4BBf389s5UrXagfItLEzw6gUwQgttZB0OoSPCEVhsUY0dHdZB9VUasosmngZDZD',
        challenge: '123k',
      },
    });
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
