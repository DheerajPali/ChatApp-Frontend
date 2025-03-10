import { X } from "lucide-react";
import { useEffect, useState } from "react";

const ComposeModal = ({
    onClose,
    onSend
  }: {
    onClose: () => void,
    onSend: (phoneNumber: string, message: string) => void
  }) => {
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isValidPhone, setIsValidPhone] = useState<boolean>(false);
    
    // Validate phone number format
    useEffect(() => {
      // Basic validation for now, can be enhanced based on your requirements
      const phoneRegex = /^\+?[0-9]{8,15}$/;
      setIsValidPhone(phoneRegex.test(phoneNumber));
    }, [phoneNumber]);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isValidPhone && message.trim()) {
        onSend(phoneNumber, message);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Message</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                placeholder="e.g. +1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {phoneNumber && !isValidPhone && (
                <p className="text-red-500 text-xs mt-1">Please enter a valid phone number</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 resize-none"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValidPhone || !message.trim()}
                className={`px-4 py-2 rounded-md ${
                  isValidPhone && message.trim()
                    ? 'bg-[#6264A7] hover:bg-[#525399] text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default ComposeModal;