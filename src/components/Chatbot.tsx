'use client'
import { useState, useEffect, useRef } from 'react';
import { Send, Mic } from 'lucide-react';
import { WellDataRow } from '@/types/well';

interface ChatbotProps {
  wellData: WellDataRow[];
}

export default function Chatbot({ wellData }: ChatbotProps) {
  const welcomeMessage = { role: 'bot', content: "Hi I'm Drill Ai, ask me anything about this well " };
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
     const SpeechRecognition =
  window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          handleSend(transcript);
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('SpeechRecognition not supported in this browser.');
      }
    }
  }, []);

  // Handle sending message
  // Handle sending message
const handleSend = async (text?: string) => {
  const message = text ?? input;
  if (!message.trim()) return;

  setMessages((prev) => [...prev, { role: 'user', content: message }]);
  setInput('');
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, wellData }),
    });

    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const json = await res.json();

    const botMessage = { role: 'bot', content: json.answer };
    setMessages((prev) => [...prev, botMessage]);

    // 🔇 Removed speech synthesis so the bot won't read aloud
  } catch (err) {
    console.error('Error sending message:', err);
    setMessages((prev) => [...prev, { role: 'bot', content: 'Error: Could not get response' }]);
  } finally {
    setLoading(false);
  }
};

  const handleClearHistory = () => {
    setMessages([welcomeMessage]);
  };

  const startVoiceChat = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      alert('Voice chat not supported in this browser.');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full pb-2">
      <div className="flex flex-col items-end p-2 border-b border-gray-300 space-y-1">
        <div className="flex justify-between w-full items-center">
          <h3 className="font-bold text-lg">Drill Ai</h3>
          <button
            onClick={handleClearHistory}
            className="text-sm text-gray-400 cursor-pointer"
          >
            Clear History
          </button>
        </div>

        <button
          onClick={startVoiceChat}
          className={`flex items-center gap-1 text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded cursor-pointer ${
            listening ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={listening}
        >
          <Mic size={16} /> {listening ? 'Listening...' : 'Start Voice Chat'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded max-w-[90%] break-words ${
              msg.role === 'user' ? 'bg-gray-100 self-end ms-auto' : 'bg-blue-100 self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="p-2 rounded max-w-[90%] break-words bg-blue-100 self-start">
            Typing...
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex p-2 border-t border-gray-300 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the well data..."
          className="flex-1 px-3 py-2 border rounded-xl outline-none focus:ring focus:ring-blue-300"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={() => handleSend()}
          className="cursor-pointer text-gray-300 px-3 rounded-r flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
