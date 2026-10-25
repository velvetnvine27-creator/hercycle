import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Clock,
  Sparkles,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Play,
  Pause,
  Info
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

interface ProductTimer {
  type: 'tampon' | 'pad' | 'cup' | 'disc' | 'underwear';
  name: string;
  recommendedHours: number;
  maxHours: number;
  info: string;
}

const PRODUCTS: ProductTimer[] = [
  {
    type: 'tampon',
    name: 'Tampon',
    recommendedHours: 4,
    maxHours: 8,
    info: 'Change every 4–8 hours. Never leave a single tampon in for more than 8 hours to prevent Toxic Shock Syndrome (TSS).'
  },
  {
    type: 'pad',
    name: 'Menstrual Pad',
    recommendedHours: 4,
    maxHours: 6,
    info: 'Change regularly every 3–5 hours to stay fresh and prevent moisture and skin chafing.'
  },
  {
    type: 'cup',
    name: 'Menstrual Cup',
    recommendedHours: 8,
    maxHours: 12,
    info: 'Medical-grade silicone collects flow internally. Empty and wash with clean water every 8–12 hours.'
  },
  {
    type: 'disc',
    name: 'Menstrual Disc',
    recommendedHours: 8,
    maxHours: 12,
    info: 'Sits below the cervix in the vaginal fornix. Wear for up to 12 hours before removing and cleansing.'
  },
  {
    type: 'underwear',
    name: 'Period Underwear',
    recommendedHours: 8,
    maxHours: 10,
    info: 'Multi-layer absorbent moisture-wicking gusset. Rinse in cold water after use before washing.'
  }
];

export const HygieneView: React.FC = () => {
  // Timer state
  const [selectedProduct, setSelectedProduct] = useState<ProductTimer>(PRODUCTS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(selectedProduct.recommendedHours * 3600);

  // Period Emergency Kit Checklist (persisted in localStorage)
  const [kitItems, setKitItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bloom_period_kit');
      return saved ? JSON.parse(saved) : {
        '2–3 Spare Pads or Tampons': true,
        'Extra clean cotton underwear': true,
        'Small discreet waterproof pouch': true,
        'Fragrance-free feminine/flush-free wipes': true,
        'Ibuprofen / Naproxen pain reliever': true,
        'Single-use adhesive heat patch': false,
        'Compact dark chocolate bar': false,
        'Mini hand sanitizer': true
      };
    } catch {
      return {};
    }
  });

  const toggleKitItem = (item: string) => {
    const updated = { ...kitItems, [item]: !kitItems[item] };
    setKitItems(updated);
    try {
      localStorage.setItem('bloom_period_kit', JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            notificationService.sendNotification(
              'Bloom Cycle Product Reminder 🌸',
              `Time to change or check your ${selectedProduct.name}! Keep your body fresh and comfortable.`,
              'hygiene'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, selectedProduct]);

  const handleSelectProduct = (p: ProductTimer) => {
    setSelectedProduct(p);
    setIsRunning(false);
    setSecondsRemaining(p.recommendedHours * 3600);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(selectedProduct.recommendedHours * 3600);
  };

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
          Body Wellness & Care
        </span>
        <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
          Hygiene & Self-Care Rituals
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gentle reminders, product change timers, and science-backed intimate wellness guidance.
        </p>
      </div>

      {/* Product Change Live Timer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cherry-600" />
              <h2 className="font-serif text-xl font-bold text-burgundy-900">
                Period Product Change Timer
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Set a discreet alert so you never forget to refresh or empty your product
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rosepink-100 text-burgundy-900 self-start sm:self-auto border border-rosepink-200">
            Max limit: {selectedProduct.maxHours} hrs
          </span>
        </div>

        {/* Product selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRODUCTS.map(p => (
            <button
              key={p.type}
              type="button"
              onClick={() => handleSelectProduct(p)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedProduct.type === p.type
                  ? 'bg-rosepink-100 border-cherry-500 text-burgundy-900 font-bold shadow-xs'
                  : 'bg-white border-rosepink-200 text-gray-600 hover:border-rosepink-300'
              }`}
            >
              <span className="text-xs block">{p.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{p.recommendedHours} hrs</span>
            </button>
          ))}
        </div>

        {/* Big Digital Countdown Display */}
        <div className="p-6 rounded-3xl bg-blush-50/70 border border-rosepink-200 text-center space-y-4">
          <div className="font-serif text-5xl sm:text-6xl font-extrabold text-burgundy-900 tracking-tight font-mono">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <p className="text-xs text-gray-600 max-w-md mx-auto">
            {selectedProduct.info}
          </p>

          <div className="flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg transition-all"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Timer'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-2.5 rounded-full bg-white border border-rosepink-200 text-burgundy-900 hover:bg-rosepink-100 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Intimate Vulva Care vs Vaginal Douching Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-cherry-600" />
          <h2 className="font-serif text-xl font-bold text-burgundy-900">
            Intimate Care: Vulva vs. Vagina
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 leading-relaxed">
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gentle Vulva Care (External)</span>
            </div>
            <p>
              • The vulva refers to the <em>outside</em> external genitalia (labia, clitoris, pubic mound).
            </p>
            <p>
              • Wash externally with plain warm water or a gentle, fragrance-free cleanser if desired.
            </p>
            <p>
              • Always pat dry with a clean towel from front to back to prevent intestinal bacteria transfer.
            </p>
            <p>
              • Opt for breathable 100% organic cotton underwear and loose sleepwear to allow airflow.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Why to Avoid Vaginal Douching</span>
            </div>
            <p>
              • The vagina is an internal, self-cleaning canal with an acidic microbiome (pH 3.8 to 4.5).
            </p>
            <p>
              • Douching washes away beneficial <em>Lactobacillus</em> bacteria, skyrocketing the risk of bacterial vaginosis (BV), yeast infections, and pelvic inflammatory disease.
            </p>
            <p>
              • Never insert soaps, perfumed sprays, or herbal steams into the vaginal canal.
            </p>
          </div>
        </div>
      </div>

      {/* Reusable Product Care Instructions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-4">
        <h2 className="font-serif text-xl font-bold text-burgundy-900">
          Reusable Product Care Guide
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
          <div className="p-4 rounded-2xl bg-blush-50 border border-rosepink-200 space-y-2">
            <span className="font-bold text-burgundy-900 text-sm block">Menstrual Cup & Disc Care</span>
            <p>• <strong>Before & After Cycle:</strong> Submerge in a pot of boiling water for 5–7 minutes to sanitize. Ensure it doesn't touch the metal bottom of the pot.</p>
            <p>• <strong>During Cycle:</strong> Empty and wash with clean water and mild oil-free soap before re-inserting.</p>
            <p>• <strong>Storage:</strong> Store in a breathable cotton pouch, never in an airtight plastic container.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blush-50 border border-rosepink-200 space-y-2">
            <span className="font-bold text-burgundy-900 text-sm block">Period Underwear & Cloth Pads</span>
            <p>• <strong>Pre-Rinse:</strong> Rinse immediately under cold running water until the water runs clear. Never use hot water, as heat binds blood proteins into fabrics.</p>
            <p>• <strong>Washing:</strong> Machine wash on gentle cold cycle with standard detergent. Avoid fabric softeners or bleach, which coat absorbent fibers.</p>
            <p>• <strong>Drying:</strong> Hang to air dry. Tumble drying on high heat breaks down waterproof TPU layers.</p>
          </div>
        </div>
      </div>

      {/* Interactive Period Emergency Kit Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-burgundy-900">
              Period Emergency Kit Checklist
            </h2>
            <p className="text-xs text-gray-500">Keep these essentials packed in your backpack or tote bag</p>
          </div>
          <span className="text-xs font-bold text-cherry-600 bg-rosepink-100 px-3 py-1 rounded-full border border-rosepink-200">
            {Object.values(kitItems).filter(Boolean).length} / {Object.keys(kitItems).length} Packed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {Object.entries(kitItems).map(([item, isChecked]) => (
            <label
              key={item}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                isChecked
                  ? 'bg-rosepink-50/80 border-cherry-300 text-burgundy-900 font-semibold'
                  : 'bg-white border-rosepink-100 text-gray-600 hover:border-rosepink-200'
              }`}
            >
              <span className="text-xs">{item}</span>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleKitItem(item)}
                className="w-4 h-4 accent-cherry-500 rounded cursor-pointer shrink-0 ml-2"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
