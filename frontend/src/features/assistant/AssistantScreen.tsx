import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Button, Chip, Card, EmergencyBanner, Input } from '../../shared/components';
import { Mic, MicOff, Send, Navigation, MapPin, Clock, User, ChevronRight, ClipboardList, Pill, Siren, HeartPulse, Bot, UserCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'recommendation';
  text: string;
  timestamp: Date;
  recommendation?: {
    department: string;
    departmentId: number;
    confidence: number;
    urgency: 'routine' | 'prompt' | 'emergency';
    doctorName: string;
    roomNumber: string;
    walkTime: number;
    locationId: number;
  };
}

const chipIcons: Record<string, React.ReactNode> = {
  registration: <ClipboardList width={14} height={14} />,
  pharmacy: <Pill width={14} height={14} />,
  emergency: <Siren width={14} height={14} />,
  unwell: <HeartPulse width={14} height={14} />,
};

const AssistantScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguageStore();
  const { startNavigation } = useNavigationStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        type: 'assistant',
        text: t('assistant.greeting'),
        timestamp: new Date(),
      },
    ]);
  }, [language, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate API call for now since we removed mock data
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fallback response for prototype
    const clarifyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      text: language === 'ta'
        ? 'மன்னிக்கவும், உங்கள் அறிகுறிகளை இன்னும் விரிவாக விவரிக்க முடியுமா?'
        : 'I\'m sorry, could you describe your symptoms in more detail?',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, clarifyMsg]);
    setIsThinking(false);
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

  const handleStartNavigation = (rec: ChatMessage['recommendation']) => {
    if (!rec) return;
    
    // Empty implementation for now - wait for real backend
    startNavigation({
      destinationNodeId: rec.locationId,
      destinationName: rec.department,
      departmentName: rec.department,
      roomNumber: rec.roomNumber,
      steps: [],
      routeCoordinates: [],
      totalDistance: 0,
      eta: 0,
    });
    navigate('/app/map');
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-surface-50">
      {/* Top Banner Area (Optional) */}
      <div className="px-4 py-3 bg-surface-0 border-b border-surface-200 shadow-sm z-10">
        <h2 className="text-lg font-bold text-surface-800">{t('assistant.title')}</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full gap-3 animate-fade-in-up items-start ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div 
              className={`flex items-center justify-center flex-shrink-0 mt-1 shadow-sm w-9 h-9 rounded-full ${msg.type === 'user' ? 'bg-surface-200 text-surface-500' : 'bg-primary-100 text-primary-600'}`}
            >
              {msg.type === 'user' ? <UserCircle width={20} height={20} /> : <Bot width={20} height={20} />}
            </div>

            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-primary-500 text-white rounded-tr-sm self-end' : 'bg-surface-0 border border-surface-200 text-surface-800 rounded-tl-sm self-start'}`}>
              {msg.type === 'recommendation' && msg.recommendation ? (
                <RecommendationCard
                  recommendation={msg.recommendation}
                  onStartNavigation={() => handleStartNavigation(msg.recommendation)}
                  onViewDoctors={() => navigate('/app/doctors')}
                  t={t}
                />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              )}
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

/* ============================================
   Recommendation Card Sub-component
   ============================================ */
const RecommendationCard: React.FC<{
  recommendation: NonNullable<ChatMessage['recommendation']>;
  onStartNavigation: () => void;
  onViewDoctors: () => void;
  t: (key: string) => string;
}> = ({ recommendation, onStartNavigation, onViewDoctors, t }) => {
  const isEmergency = recommendation.urgency === 'emergency';

  return (
    <Card
      className={`overflow-hidden mt-2 ${isEmergency ? 'border-2 border-error' : 'border border-primary-200'}`}
    >
      {isEmergency && (
        <div className="bg-error-bg px-4 py-2 flex items-center gap-2 border-b border-error">
          <Siren width={16} height={16} className="text-error" />
          <span className="text-sm font-semibold text-error">Emergency Department</span>
        </div>
      )}

      <div className="p-4">
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
            {t('assistant.recommendation.department')}
          </p>
          <h3 className={`text-xl font-bold ${isEmergency ? 'text-error' : 'text-surface-900'}`}>
            {recommendation.department}
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-surface-50 rounded-md p-3 mt-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User width={20} height={20} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate">
              {recommendation.doctorName}
            </p>
            <div className="flex items-center gap-3 text-xs text-surface-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin width={12} height={12} /> {t('assistant.recommendation.room')} {recommendation.roomNumber}
              </span>
              <span className="flex items-center gap-1">
                <Clock width={12} height={12} /> ~{recommendation.walkTime} {t('common.minutes')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-col">
          <Button
            variant={isEmergency ? 'danger' : 'primary'}
            size="md"
            fullWidth
            onClick={onStartNavigation}
            icon={<Navigation width={16} height={16} />}
          >
            {t('assistant.recommendation.startNav')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onViewDoctors}
            icon={<ChevronRight width={16} height={16} />}
            className="text-primary-600"
          >
            {t('assistant.recommendation.viewDoctors')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssistantScreen;
