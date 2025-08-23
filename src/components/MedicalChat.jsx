// import React, { useEffect, useState } from 'react';
// import './MedicalChat.css';

// // Use the AI backend URL from .env
// const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL;

// // Inside MedicalChat.jsx
// const MedicalChat = ({ patient }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem('token');
//   const patientId = patient?._id || localStorage.getItem('patientId'); // fallback to localStorage


//   useEffect(() => {
//   if (!patientId || !token) return; // don't fetch until ready

//   const fetchChatHistory = async () => {
//     try {
//       const res = await fetch(`${AI_API_BASE_URL}/chat-history/${patientId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error('Failed to fetch chat history');
//       const data = await res.json();
//       setMessages(data.history || []);
//     } catch (err) {
//       console.error('Error fetching chat history:', err);
//     }
//   };

//   fetchChatHistory();
// }, [patientId, token]);

//   // Handle sending a message
//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     setLoading(true);

//     const userMessage = { role: 'user', content: input };
//     setMessages(prev => [...prev, userMessage]);

//     try {
//       const res = await fetch(`${AI_API_BASE_URL}/medical-assistant`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ query: input }),
//       });

//       if (!res.ok) throw new Error('Failed to send message');
//       const data = await res.json();

//       const assistantMessage = { role: 'assistant', content: data.response };
//       setMessages(prev => [...prev, assistantMessage]);
//       setInput('');
//     } catch (err) {
//       console.error('Error sending message:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') sendMessage();
//   };

//   return (
//     <div className="medical-chat-container">
//       <h3>💬 Medical Chat</h3>
//       <div className="chat-box">
//         {messages.length === 0 && <p>No chat history yet.</p>}
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
//           >
//             <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
//           </div>
//         ))}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={handleKeyPress}
//           placeholder="Type your message..."
//         />
//         <button onClick={sendMessage} disabled={loading}>
//           {loading ? 'Sending...' : 'Send'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MedicalChat;



import React, { useEffect, useState } from 'react';
import './MedicalChat.css';

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL;

const MedicalChat = ({ patient }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For showing errors

  const token = localStorage.getItem('token');
  const patientId = patient?._id || localStorage.getItem('patientId');

  useEffect(() => {
    if (!patientId || !token) {
      setError('Missing token or patient information. Please login again.');
      return;
    }

    const fetchChatHistory = async () => {
      try {
        setError(null);
        const res = await fetch(`${AI_API_BASE_URL}/chat-history/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch chat history');
        }

        const data = await res.json();
        setMessages(data.history || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError(err.message);
      }
    };

    fetchChatHistory();
  }, [patientId, token]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!token || !patientId) {
      setError('Cannot send message. Missing token or patient info.');
      return;
    }

    setLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch(`${AI_API_BASE_URL}/medical-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: input }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send message');
      }

      const data = await res.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="medical-chat-container">
      <h3>💬 Medical Chat</h3>
      {error && <div className="chat-error">⚠️ {error}</div>}
      <div className="chat-box">
        {messages.length === 0 && !error && <p>No chat history yet.</p>}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={!token || !patientId}
        />
        <button onClick={sendMessage} disabled={loading || !token || !patientId}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MedicalChat;


