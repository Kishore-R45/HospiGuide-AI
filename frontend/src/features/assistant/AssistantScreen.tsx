import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../../shared/store';
import { Chip, EmergencyBanner, Input } from '../../shared/components';
import { Mic, MicOff, Send, ClipboardList, Pill, Siren, HeartPulse, Bot, UserCircle } from 'lucide-react';

const chipIcons: Record<string, React.ReactNode> = {
  registration: <ClipboardList width={14} height={14} />,
  pharmacy: <Pill width={14} height={14} />,
  emergency: <Siren width={14} height={14} />,
  unwell: <HeartPulse width={14} height={14} />,
};

import { useChatStore } from '../../store/useChatStore';


const AssistantScreen: React.FC = () => {
  const { t, language } = useLanguageStore();
  
  // Use Zustand store instead of local state
  const { messages: storeMessages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  // Initial greeting if store is empty
  useEffect(() => {
    if (storeMessages.length === 0) {
      addMessage({
        role: 'assistant',
        content: t('assistant.greeting'),
      });
    }
  }, [language, t, storeMessages.length, addMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storeMessages]);

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    const userContent = text.trim();
    addMessage({
      role: 'user',
      content: userContent,
    });
    
    setInput('');
    setIsThinking(true);

    try {
      // Call Backend API
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userContent,
          language: language, // 'en' or 'ta'
          history: storeMessages // Send history for context
        }),
      });

      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      
      addMessage({
        role: 'assistant',
        content: data.response || 'I am sorry, I could not generate a response.',
      });

    } catch (error) {
      console.error('Chat API error:', error);
      addMessage({
        role: 'assistant',
        content: language === 'ta'
          ? 'மன்னிக்கவும், சர்வரில் பிழை ஏற்பட்டுள்ளது.'
          : 'I am sorry, there was an error connecting to the server.',
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    processMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (chipKey: string) => {
    const chipTexts: Record<string, string> = {
      registration: 'I need to go to registration',
      pharmacy: 'Where is the pharmacy?',
      emergency: 'Emergency - I need urgent help',
      unwell: 'I don\'t feel well',
    };
    processMessage(chipTexts[chipKey] || chipKey);
  };

  const handleVoice = async () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // Explicitly request microphone access if not already granted
      // This ensures the browser prompt appears even if they skipped the onboarding permission screen
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the tracks immediately as we only needed it to trigger the permission prompt
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn("Microphone access denied or not available", error);
      return;
    }

    setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      processMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-surface-50">
      {/* Top Banner Area (Optional) */}
      <div className="px-4 py-3 bg-surface-0 border-b border-surface-200 shadow-sm z-10">
        <h2 className="text-lg font-bold text-surface-800">{t('assistant.title')}</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-50">
        {storeMessages.map((msg, index) => (
          <div key={index} className={`flex w-full gap-3 animate-fade-in-up items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div 
              className={`flex items-center justify-center flex-shrink-0 mt-1 shadow-sm w-9 h-9 rounded-full ${msg.role === 'user' ? 'bg-surface-200 text-surface-500' : 'bg-primary-100 text-primary-600'}`}
            >
              {msg.role === 'user' ? <UserCircle width={20} height={20} /> : <Bot width={20} height={20} />}
            </div>

            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm self-end' : 'bg-surface-0 border border-surface-200 text-surface-800 rounded-tl-sm self-start'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex w-full gap-3 animate-fade-in items-start">
            <div 
              className="flex items-center justify-center flex-shrink-0 mt-1 bg-primary-100 text-primary-600 shadow-sm w-9 h-9 rounded-full"
            >
              <Bot width={20} height={20} />
            </div>
            <div className="max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-surface-0 border border-surface-200 text-surface-800 rounded-tl-sm self-start flex items-center gap-2">
              <div className="flex items-center gap-1 h-5">
                <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-sm text-surface-500 ml-2">{t('assistant.thinking')}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="bg-surface-0 p-4 pb-[calc(64px+env(safe-area-inset-bottom)+16px)] border-t border-surface-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {/* Emergency Banner */}
        <div className="mb-3">
          <EmergencyBanner
            label={t('assistant.emergency')}
            onClick={() => handleChip('emergency')}
          />
        </div>

        {/* Quick Chips Row */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide mb-2">
          {['registration', 'pharmacy', 'emergency', 'unwell'].map((key) => (
            <Chip
              key={key}
              label={t(`assistant.chips.${key}`)}
              icon={chipIcons[key]}
              onClick={() => handleChip(key)}
            />
          ))}
        </div>

        {/* Input Field & Mic */}
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('assistant.placeholder')}
            className={language === 'ta' ? 'font-tamil' : ''}
            rightElement={
              input.trim() ? (
                <button onClick={handleSend} className="w-9 h-9 flex items-center justify-center bg-primary-500 text-white rounded-full transition-all duration-200 hover:bg-primary-600 active:scale-95" type="button" aria-label="Send">
                  <Send width={18} height={18} className="-translate-x-[1px] translate-y-[1px]" />
                </button>
              ) : undefined
            }
          />

          <button
            onClick={handleVoice}
            className={`w-[52px] h-[52px] flex items-center justify-center rounded-full shrink-0 transition-all duration-200 active:scale-95 ${isListening ? 'bg-error-bg text-error shadow-[0_0_0_4px_rgba(220,38,38,0.1)] animate-pulse' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
            type="button"
            aria-label={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? <MicOff width={20} height={20} /> : <Mic width={20} height={20} />}
          </button>
        </div>
        
        {isListening && (
          <p className="text-center text-xs font-medium text-error mt-2 animate-pulse">
            {t('assistant.listening')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssistantScreen;
