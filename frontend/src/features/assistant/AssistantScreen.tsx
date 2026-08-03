import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Button, Chip, Card, EmergencyBanner, Input } from '../../shared/components';
import { getMockAIResponse, locations, getMockRoute } from '../../data/mockData';
import {
  Mic, MicOff, Send, Navigation, MapPin, Clock, User, ChevronRight,
  ClipboardList, Pill, Siren, HeartPulse, Settings, Bot, UserCircle,
} from 'lucide-react';

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
  registration: <ClipboardList className="w-4 h-4" />,
  pharmacy: <Pill className="w-4 h-4" />,
  emergency: <Siren className="w-4 h-4" />,
  unwell: <HeartPulse className="w-4 h-4" />,
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
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const response = getMockAIResponse(text);

    if (response) {
      const recMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'recommendation',
        text: response.urgency === 'emergency'
          ? t('assistant.greeting') // Will be overridden by recommendation card
          : `Based on your description, I recommend visiting the **${response.department}** department.`,
        timestamp: new Date(),
        recommendation: response,
      };
      setMessages(prev => [...prev, recMsg]);
    } else {
      const clarifyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: language === 'ta'
          ? 'மன்னிக்கவும், உங்கள் அறிகுறிகளை இன்னும் விரிவாக விவரிக்க முடியுமா? எடுத்துக்காட்டாக: "எனக்கு கண் வலி" அல்லது "தலைவலி".'
          : 'I\'m sorry, could you describe your symptoms in more detail? For example: "I have eye pain" or "I have a headache".',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, clarifyMsg]);
    }

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

    const route = getMockRoute(1, rec.locationId); // From entrance (id=1)
    if (!route) return;

    startNavigation({
      destinationNodeId: rec.locationId,
      destinationName: locations.find(l => l.id === rec.locationId)?.name || rec.department,
      departmentName: rec.department,
      roomNumber: rec.roomNumber,
      steps: route.steps.map(s => ({
        instruction: s.instruction,
        instructionKey: s.instructionKey,
        distance: s.distance,
        landmark: s.landmark,
        nodeId: s.nodeId,
        floor: s.floor,
      })),
      routeCoordinates: route.coordinates,
      totalDistance: route.distance,
      eta: route.eta,
    });

    navigate('/map');
  };

  const handleViewDoctors = (departmentId: number) => {
    navigate(`/doctors/${departmentId}`);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-950 relative">
      {/* Header */}
      <header className="glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{t('app.name')}</h1>
            <p className="text-xs text-primary-400">{t('assistant.title')}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full bg-surface-800/60 flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-700/60 transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 animate-fade-in-up ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Avatar */}
            {msg.type !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-first' : ''}`}>
              {msg.type === 'user' ? (
                /* User bubble */
                <div className="bg-primary-600/90 text-white px-4 py-3 rounded-[var(--radius-lg)] rounded-tr-sm shadow-md">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              ) : msg.type === 'recommendation' && msg.recommendation ? (
                /* Recommendation Card */
                <RecommendationCard
                  recommendation={msg.recommendation}
                  onStartNavigation={() => handleStartNavigation(msg.recommendation)}
                  onViewDoctors={() => handleViewDoctors(msg.recommendation!.departmentId)}
                  t={t}
                />
              ) : (
                /* Assistant bubble */
                <div className="bg-surface-800/70 text-surface-200 px-4 py-3 rounded-[var(--radius-lg)] rounded-tl-sm border border-surface-700/40">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              )}
            </div>

            {/* User avatar */}
            {msg.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-surface-700/60 flex items-center justify-center flex-shrink-0 mt-1">
                <UserCircle className="w-4 h-4 text-surface-400" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-400" />
            </div>
            <div className="bg-surface-800/70 px-4 py-3 rounded-[var(--radius-lg)] rounded-tl-sm border border-surface-700/40">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-surface-400">{t('assistant.thinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 glass border-t border-surface-700/40 px-4 pt-3 pb-5 space-y-3">
        {/* Emergency Banner */}
        <EmergencyBanner
          label={t('assistant.emergency')}
          onClick={() => handleChip('emergency')}
        />

        {/* Quick Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['registration', 'pharmacy', 'emergency', 'unwell'].map((key) => (
            <Chip
              key={key}
              label={t(`assistant.chips.${key}`)}
              icon={chipIcons[key]}
              onClick={() => handleChip(key)}
            />
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('assistant.placeholder')}
            className={`flex-1 ${language === 'ta' ? 'font-tamil' : ''}`}
            rightElement={
              input.trim() ? (
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-400 transition-all active:scale-90"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />

          {/* Mic Button */}
          <button
            onClick={handleVoice}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-500/40'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {isListening && (
          <p className="text-center text-sm text-red-400 animate-pulse">{t('assistant.listening')}</p>
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
      variant="glass"
      className={`overflow-hidden ${isEmergency ? 'border-red-500/40' : 'border-primary-500/20'}`}
    >
      {/* Urgency Bar */}
      {isEmergency && (
        <div className="bg-red-500/20 px-4 py-2 flex items-center gap-2 border-b border-red-500/20">
          <Siren className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-red-400">Emergency Department</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Department */}
        <div>
          <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">
            {t('assistant.recommendation.department')}
          </p>
          <h3 className={`text-xl font-bold ${isEmergency ? 'text-red-400' : 'text-white'}`}>
            {recommendation.department}
          </h3>
        </div>

        {/* Doctor Info */}
        <div className="flex items-center gap-3 bg-surface-800/50 rounded-[var(--radius-md)] p-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/15 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-100 truncate">{recommendation.doctorName}</p>
            <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {t('assistant.recommendation.room')} {recommendation.roomNumber}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{recommendation.walkTime} {t('common.minutes')}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isEmergency ? 'bg-red-500' : 'bg-primary-500'}`}
              style={{ width: `${recommendation.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-surface-400 tabular-nums">
            {Math.round(recommendation.confidence * 100)}%
          </span>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-surface-500 italic leading-relaxed">
          {t('assistant.recommendation.disclaimer')}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant={isEmergency ? 'danger' : 'primary'}
            size="md"
            fullWidth
            onClick={onStartNavigation}
            icon={<Navigation className="w-4 h-4" />}
          >
            {t('assistant.recommendation.startNav')}
          </Button>
        </div>
        <button
          onClick={onViewDoctors}
          className="w-full flex items-center justify-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors py-1"
        >
          {t('assistant.recommendation.viewDoctors')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

export default AssistantScreen;
