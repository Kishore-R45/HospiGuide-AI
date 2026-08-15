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
  registration: <ClipboardList width={16} height={16} />,
  pharmacy: <Pill width={16} height={16} />,
  emergency: <Siren width={16} height={16} />,
  unwell: <HeartPulse width={16} height={16} />,
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

  const handleVoice = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      setIsListening(false);
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

    recognition.start();
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
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-50)]">
      {/* Top Banner Area (Optional) */}
      <div className="px-4 py-3 bg-[var(--surface-0)] border-b border-[var(--surface-200)] shadow-sm z-10">
        <h2 className="text-lg font-bold text-[var(--surface-800)]">{t('assistant.title')}</h2>
      </div>

      {/* Chat Messages */}
      <div className="chat-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 animate-fade-in-up ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div 
              className="w-[36px] h-[36px] rounded-[50%] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
              style={{
                background: msg.type === 'user' ? 'var(--surface-200)' : 'var(--primary-100)',
                color: msg.type === 'user' ? 'var(--surface-500)' : 'var(--primary-600)',
              }}
            >
              {msg.type === 'user' ? <UserCircle width={20} height={20} /> : <Bot width={20} height={20} />}
            </div>

            <div className={`chat-bubble ${msg.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
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
          <div className="flex gap-3 animate-fade-in">
            <div className="w-[36px] h-[36px] rounded-[50%] flex items-center justify-center flex-shrink-0 mt-1 bg-[var(--primary-100)] text-[var(--primary-600)] shadow-sm">
              <Bot width={20} height={20} />
            </div>
            <div className="chat-bubble chat-bubble-assistant flex items-center gap-2">
              <div className="thinking-dots">
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
              <span className="text-sm text-[var(--surface-500)] ml-2">{t('assistant.thinking')}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="chat-input-area">
        {/* Emergency Banner */}
        <div className="mb-3">
          <EmergencyBanner
            label={t('assistant.emergency')}
            onClick={() => handleChip('emergency')}
          />
        </div>

        {/* Quick Chips Row */}
        <div className="frequent-questions scrollbar-hide mb-3">
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
        <div className="chat-input-row">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('assistant.placeholder')}
            className={language === 'ta' ? 'font-tamil' : ''}
            rightElement={
              input.trim() ? (
                <button onClick={handleSend} className="send-btn" type="button" aria-label="Send">
                  <Send width={18} height={18} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
                </button>
              ) : undefined
            }
          />

          <button
            onClick={handleVoice}
            className={`mic-btn ${isListening ? 'mic-btn-listening' : ''}`}
            type="button"
            aria-label={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? <MicOff width={20} height={20} /> : <Mic width={20} height={20} />}
          </button>
        </div>
        
        {isListening && (
          <p className="text-center text-xs font-medium text-[var(--color-error)] mt-2 animate-pulse">
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
      style={{ 
        overflow: 'hidden', 
        borderColor: isEmergency ? 'var(--color-error)' : 'var(--primary-200)',
        borderWidth: isEmergency ? 2 : 1,
        marginTop: 8
      }}
    >
      {isEmergency && (
        <div style={{ background: 'var(--color-error-bg)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--color-error)' }}>
          <Siren width={16} height={16} color="var(--color-error)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-error)' }}>Emergency Department</span>
        </div>
      )}

      <div style={{ padding: 16 }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {t('assistant.recommendation.department')}
          </p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: isEmergency ? 'var(--color-error)' : 'var(--surface-900)' }}>
            {recommendation.department}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-50)', borderRadius: 'var(--radius-md)', padding: 12, marginTop: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User width={20} height={20} color="var(--primary-600)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--surface-800)' }} className="truncate">
              {recommendation.doctorName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--surface-500)', marginTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin width={12} height={12} /> {t('assistant.recommendation.room')} {recommendation.roomNumber}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock width={12} height={12} /> ~{recommendation.walkTime} {t('common.minutes')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
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
            style={{ color: 'var(--primary-600)' }}
          >
            {t('assistant.recommendation.viewDoctors')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssistantScreen;
