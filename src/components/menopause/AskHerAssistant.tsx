import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, AlertTriangle, BookOpen, Info, Sparkles } from 'lucide-react';
import { MenopauseSymptomEntry, MoodLog, MedicalLog, UserSettings } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isUrgent?: boolean;
}

interface AskHerProps {
  menopauseSymptoms: MenopauseSymptomEntry[];
  moodLogs: MoodLog[];
  medicalLogs: MedicalLog[];
  settings: UserSettings;
}

// ── Knowledge base (deterministic, no external API) ──────────────────────────
const URGENT_KEYWORDS = [
  'chest pain', 'fainting', 'fainted', 'unconscious', 'severe pain', 'can\'t breathe',
  'difficulty breathing', 'heart attack', 'stroke', 'emergency', 'very heavy bleeding',
  'soaking pad every hour', 'collapsing', 'dizzy and weak'
];

const QA_PAIRS: Array<{ patterns: string[]; answer: string; sources?: string }> = [
  {
    patterns: ['hot flash', 'hot flashes', 'flush', 'flushing', 'vasomotor'],
    answer: `Hot flashes are sudden feelings of warmth, usually most intense over the face, neck, and chest, often followed by sweating. They are caused by changes in the body's temperature regulation related to falling estrogen levels during perimenopause and menopause.\n\nCommon self-care approaches include keeping cool (light clothing, fans, cool drinks), identifying triggers (caffeine, alcohol, spicy food, stress, heat), and maintaining a healthy weight. Some people find relaxation techniques helpful.\n\nIf hot flashes are severely affecting your quality of life or sleep, speak with your healthcare provider. There are effective medical treatments available.`,
    sources: 'Based on NHS and NAMS (North American Menopause Society) guidance'
  },
  {
    patterns: ['night sweat', 'night sweats', 'sweating at night', 'wake up sweating'],
    answer: `Night sweats are hot flashes that occur during sleep, often disrupting rest. They are very common during perimenopause and menopause.\n\nPractical tips: keep your bedroom cool, use moisture-wicking bedding, avoid caffeine and alcohol in the evening, and keep a change of clothes nearby. Some people find a fan or open window helpful.\n\nIf night sweats are causing significant sleep disruption, discuss this with your healthcare provider. Effective treatments exist.`,
  },
  {
    patterns: ['perimenopause', 'peri-menopause', 'what is perimenopause'],
    answer: `Perimenopause is the transition period leading up to menopause. It typically begins in a person's mid-to-late 40s, though it can start earlier or later.\n\nDuring perimenopause, the ovaries gradually produce less estrogen, and cycle patterns change — periods may become irregular, lighter, heavier, or further apart. Symptoms may include hot flashes, night sweats, mood changes, sleep disturbances, and vaginal dryness.\n\nPerimenopause ends with menopause (12 consecutive months without a period). It typically lasts 4–8 years, though this varies greatly. There is no single test that confirms perimenopause — it is diagnosed based on age, symptoms, and menstrual history.`,
  },
  {
    patterns: ['menopause', 'what is menopause'],
    answer: `Menopause is a natural biological process marking the end of menstrual cycles. It is confirmed after 12 consecutive months without a period (when no other cause is identified).\n\nThe average age is 51, though it can occur from the late 40s to mid-50s. Early menopause (before 45) and premature ovarian insufficiency (before 40) are separate conditions that warrant medical evaluation.\n\nAfter menopause, estrogen levels remain low. This changes risk profiles for bone density and cardiovascular health, which is why regular healthcare check-ups remain important.`,
  },
  {
    patterns: ['postmenopause', 'post menopause', 'after menopause'],
    answer: `Postmenopause refers to the years after menopause. Many menopausal symptoms (like hot flashes) gradually lessen, though they can continue for years in some people.\n\nImportant health considerations after menopause include bone density (risk of osteoporosis increases), cardiovascular health, and genital/urinary health (genitourinary syndrome of menopause).\n\nAny vaginal bleeding after menopause — including spotting — should be reported to a healthcare provider promptly. It is usually benign but always requires assessment.`,
  },
  {
    patterns: ['sleep', 'insomnia', 'can\'t sleep', 'trouble sleeping'],
    answer: `Sleep disturbances are very common during perimenopause and menopause, often linked to night sweats, anxiety, and hormonal changes.\n\nSleep hygiene tips: maintain a consistent sleep schedule, keep your bedroom cool and dark, limit caffeine after midday, avoid alcohol (which disrupts sleep quality), reduce screen time before bed, and try relaxation techniques such as deep breathing.\n\nIf sleep problems are significantly affecting your daily life, speak with your healthcare provider. There are effective options including cognitive behavioural therapy for insomnia (CBT-I) and, where appropriate, medical treatments.`,
  },
  {
    patterns: ['mood', 'anxiety', 'irritable', 'depression', 'sad', 'emotional'],
    answer: `Mood changes, irritability, and anxiety are common during perimenopause and menopause, linked to hormonal fluctuations and sleep disruption.\n\nSelf-care approaches include regular physical activity (which has good evidence for mood), prioritising sleep, stress reduction techniques, social connection, and limiting alcohol.\n\nIf you are experiencing low mood, persistent anxiety, or feelings of hopelessness, please speak with your healthcare provider. These are treatable conditions, and support is available. This app does not provide mental health diagnoses or treatment.`,
  },
  {
    patterns: ['brain fog', 'memory', 'concentration', 'forgetfulness', 'foggy'],
    answer: `Many people experience cognitive changes during perimenopause and menopause, including difficulty with memory, concentration, and "word finding." This is often called "brain fog."\n\nThis is common and, for most people, improves after the menopause transition. Adequate sleep, regular exercise, stress management, and mental engagement may help.\n\nIf cognitive concerns are significant or worsening, speak with your healthcare provider to rule out other causes.`,
  },
  {
    patterns: ['vaginal dryness', 'vaginal', 'dryness', 'intimate dryness', 'painful sex', 'dyspareunia'],
    answer: `Vaginal dryness is caused by reduced oestrogen, which thins and dries vaginal tissues (a condition called genitourinary syndrome of menopause). It is very common but often under-discussed.\n\nOptions include non-hormonal vaginal moisturisers (used regularly), lubricants (used during sex), and — where appropriate — vaginal oestrogen (which is local and minimally absorbed). Sexual activity and vaginal moisturisers can help maintain tissue health.\n\nSpeak with your healthcare provider if dryness is affecting your quality of life. Effective treatments are available.`,
  },
  {
    patterns: ['hormone', 'hrt', 'hormone therapy', 'mht', 'hormone replacement'],
    answer: `Hormone therapy (HT or MHT) uses hormones — usually oestrogen alone or combined with progesterone — to relieve menopausal symptoms. It is one of the most effective treatments for hot flashes, night sweats, and vaginal symptoms.\n\nDecisions about hormone therapy are highly individual, depending on your symptoms, health history, preferences, and discussions with your healthcare provider. This app does not recommend or discourage hormone therapy — that is a conversation for you and your clinician.\n\nIf you are considering hormone therapy, prepare your questions (you can use this app's doctor report feature) and discuss the benefits and risks with your healthcare provider.`,
  },
  {
    patterns: ['bone', 'osteoporosis', 'bone density', 'fracture'],
    answer: `Oestrogen plays an important role in maintaining bone density. After menopause, bone loss accelerates, increasing the risk of osteoporosis (fragile bones) and fractures.\n\nBone-protective habits include: adequate calcium (from food where possible), vitamin D (through sunlight and/or supplementation as advised), weight-bearing exercise, not smoking, and limiting alcohol.\n\nAsk your healthcare provider about bone density screening (DEXA scan) — this is typically recommended for people at higher risk.`,
  },
  {
    patterns: ['heart', 'cardiovascular', 'heart health', 'cholesterol'],
    answer: `After menopause, oestrogen's protective effect on the heart decreases, and cardiovascular risk increases. Blood pressure, cholesterol, and blood sugar may change.\n\nHeart-protective habits include: regular physical activity, not smoking, maintaining a healthy weight, a heart-healthy diet, managing blood pressure and cholesterol, and regular health checks.\n\nIf you experience chest pain, shortness of breath, or other cardiac symptoms, seek urgent medical attention.`,
  },
  {
    patterns: ['doctor', 'appointment', 'gp', 'clinic', 'what to tell', 'prepare', 'questions'],
    answer: `Preparing for a healthcare appointment helps you get the most from your limited time. Consider:\n\n• Describe your main symptoms (use this app's export for a summary)\n• Note when symptoms started and how they affect daily life\n• List current medications and supplements\n• Bring a list of your top 3 questions\n• Note any family history of early menopause, osteoporosis, or cardiovascular disease\n\nYou can generate a printable summary from the Profile section of this app to share with your provider.`,
  },
  {
    patterns: ['bleed', 'bleeding', 'postmenopausal bleeding', 'spotting after menopause'],
    answer: `Any vaginal bleeding after menopause (12+ months without a period) — including spotting — should be evaluated by a healthcare provider promptly.\n\nPostmenopausal bleeding is usually caused by benign conditions (such as atrophic vaginitis or polyps), but it can occasionally indicate endometrial or other gynaecological conditions that require assessment. Early evaluation leads to better outcomes.\n\nDo not wait — book an appointment with your healthcare provider. If bleeding is very heavy or accompanied by weakness, dizziness, or severe pain, seek urgent care.`,
    sources: 'NHS, RCOG guidance on postmenopausal bleeding'
  },
];

const SUGGESTIONS = [
  'What are hot flashes?',
  'How long does perimenopause last?',
  'Tips for better sleep during menopause',
  'What is vaginal dryness and how can I manage it?',
  'How do I prepare for my doctor appointment?',
];

function getAnswer(query: string, symptoms: MenopauseSymptomEntry[], moodLogs: MoodLog[], medicalLogs: MedicalLog[], settings: UserSettings): { text: string; isUrgent?: boolean } {
  const q = query.toLowerCase();

  // Urgent check first
  if (URGENT_KEYWORDS.some(k => q.includes(k))) {
    return {
      text: `This sounds like it may need urgent medical attention.\n\nIf you are experiencing:\n• Chest pain\n• Difficulty breathing\n• Fainting or feeling faint\n• Very heavy bleeding (soaking a pad every hour) with weakness or dizziness\n• Sudden severe pain\n\nPlease call emergency services (112 / 999 / 911 depending on your country) or go to your nearest emergency department immediately.\n\nDo not delay — please seek help now.`,
      isUrgent: true
    };
  }

  // Data summary queries
  if (q.includes('my symptoms') || q.includes('my data') || q.includes('my history') || q.includes('summary')) {
    const recent = symptoms.slice(0, 7);
    if (recent.length === 0) {
      return { text: 'I do not have any recorded symptom data to summarise yet. Start logging your daily check-ins in the Symptom Tracker section, and I can provide a personalised summary.' };
    }
    const avgHotFlash = (recent.reduce((s, e) => s + e.hotFlashes, 0) / recent.length).toFixed(1);
    const avgSleep = (recent.filter(e => e.sleepHours).reduce((s, e) => s + (e.sleepHours || 0), 0) / recent.filter(e => e.sleepHours).length || 0).toFixed(1);
    const avgMood = (recent.reduce((s, e) => s + e.moodRating, 0) / recent.length).toFixed(1);
    return {
      text: `Based on your last ${recent.length} check-in${recent.length !== 1 ? 's' : ''} (${recent[recent.length - 1]?.date} to ${recent[0]?.date}):\n\n• Average hot flashes per day: ${avgHotFlash}\n• Average sleep: ${avgSleep} hours\n• Average mood rating: ${avgMood}/5\n\nThis is a summary of what you have recorded. Use the Insights section for charts and trends.\n\nImportant: This summary is based on your self-reported data only. It is not a clinical assessment.`
    };
  }

  if (q.includes('stage') || q.includes('what stage')) {
    const stage = settings.menopauseStage || 'not set';
    return { text: `Your selected stage is: ${stage.replace(/_/g, ' ')}.\n\nYou can update this in Profile > Settings at any time. Menopause stage is self-selected based on your experience — this app does not determine your stage from symptoms or test results.` };
  }

  // Search QA pairs
  for (const qa of QA_PAIRS) {
    if (qa.patterns.some(p => q.includes(p))) {
      return { text: qa.answer + (qa.sources ? `\n\n— ${qa.sources}` : '') };
    }
  }

  // Fallback
  return {
    text: `I do not have a specific answer for that question in my knowledge base.\n\nFor accurate medical information, I recommend:\n• NHS website (nhs.uk)\n• North American Menopause Society (menopause.org)\n• Your healthcare provider\n\nYou can also use the Health Library section of this app for evidence-informed articles.\n\nRemember: I am a local assistant using curated educational content — I am not a generative AI and cannot provide medical advice.`
  };
}

export const AskHerAssistant: React.FC<AskHerProps> = ({ menopauseSymptoms, moodLogs, medicalLogs, settings }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am Ask HER, your local menopause education assistant.\n\nI can answer questions about menopause, explain your recorded symptoms, and help you prepare for healthcare appointments.\n\nI use curated educational content — I cannot diagnose conditions, prescribe treatments, or recommend hormone dosages. For urgent symptoms, always contact a healthcare provider.\n\nWhat would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text, timestamp: new Date() };
    const { text: answerText, isUrgent } = getAnswer(text, menopauseSymptoms, moodLogs, medicalLogs, settings);
    const assistantMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', text: answerText, timestamp: new Date(), isUrgent };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-12rem)]">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-rosepink-200 mb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burgundy-800 to-cherry-500 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-burgundy-900">Ask HER</h2>
          <p className="text-[11px] text-gray-500">Local menopause education assistant · No AI API · No data sharing</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 modal-scroll">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-cherry-500 to-burgundy-800 text-white rounded-br-sm'
                : msg.isUrgent
                  ? 'bg-red-50 border border-red-300 text-red-900 rounded-bl-sm'
                  : 'bg-white border border-rosepink-200 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.isUrgent && (
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Urgent</span>
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="py-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)}
              className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-rosepink-100 text-burgundy-900 border border-rosepink-200 hover:bg-rosepink-200 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask about menopause, your symptoms..."
          className="flex-1 px-4 py-3 rounded-2xl border border-rosepink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20"
        />
        <button onClick={handleSend} disabled={!input.trim()}
          className="p-3 rounded-2xl bg-gradient-to-br from-cherry-500 to-burgundy-800 text-white disabled:opacity-40 transition-all">
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mt-2 justify-center">
        <Info className="w-3 h-3 text-gray-400" />
        <p className="text-[10px] text-gray-400">Educational content only. Not a diagnosis. Not a substitute for medical care.</p>
      </div>
    </div>
  );
};
