// NewChatButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewChatButtonProps {
  onNewChatCreated: (phoneNumber: string) => void;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onNewChatCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setShowModal(true);
    setPhoneNumber('');
    setIsValid(true);
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const validatePhoneNumber = (number: string) => {
    // Basic validation: must be numbers only, and between 10-15 digits
    const regex = /^\d{10,15}$/;
    return regex.test(number);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value.length > 0) {
      const isValidNumber = validatePhoneNumber(value);
      setIsValid(isValidNumber);
      setErrorMessage(isValidNumber ? '' : 'Please enter a valid phone number (10-15 digits)');
    } else {
      setIsValid(true);
      setErrorMessage('');
    }
  };

  const handleStartChat = () => {
    if (validatePhoneNumber(phoneNumber)) {
      onNewChatCreated(phoneNumber);
      setShowModal(false);
      navigate(`/chat/${phoneNumber}`);
    } else {
      setIsValid(false);
      setErrorMessage('Please enter a valid phone number (10-15 digits)');
    }
  };

  return (
    <>
      <button 
        onClick={handleOpenModal}
        className="flex items-center p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-4 w-full justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Start a New Chat</h2>
            <p className="mb-4">Enter the phone number you want to chat with:</p>
            
            <div className="mb-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className={`w-full p-2 border rounded ${!isValid ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Phone number (e.g., 919427957908)"
              />
              {!isValid && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleStartChat}
                disabled={!phoneNumber || !isValid}
                className={`px-4 py-2 rounded text-white ${
                  !phoneNumber || !isValid ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChatButton;