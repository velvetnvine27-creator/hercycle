import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EDUCATION_ARTICLES } from '../../services/educationData';
import { EducationArticle } from '../../types';

interface EducationViewProps {
  initialArticleId?: string;
}

export const EducationView: React.FC<EducationViewProps> = ({ initialArticleId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(initialArticleId || null);

  const filteredArticles = EDUCATION_ARTICLES.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
          Menstrual Literacy & Evidence-Based Knowledge
        </span>
        <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
          Health Education Library
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Clear, compassionate, medically reviewed guides to help you understand your reproductive biology and advocate for yourself.
        </p>
      </div>

      {/* Urgent Warning Banner */}
      <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-cherry-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-burgundy-900">
              When to Seek Urgent Emergency Care
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 max-w-xl">
              Sudden severe pelvic pain, fainting, soaking 2+ pads/hour with dizziness, or fever while using a tampon requires immediate medical triage.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpandedArticleId('warning-signs')}
          className="px-4 py-2 rounded-full bg-cherry-500 text-white text-xs font-bold shadow-xs hover:bg-cherry-600 transition-colors shrink-0"
        >
          View Red Flags Guide
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, phases, PCOS, cramps, endometriosis, discharge..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-500/20 focus:border-cherry-500 bg-white shadow-2xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All Guides' },
            { key: 'warning', label: 'Red Flags & Emergency' },
            { key: 'menopause', label: 'Menopause & Perimenopause' },
            { key: 'phases', label: 'Cycle Phases & Hormones' },
            { key: 'pain', label: 'Cramps & PMS / PMDD' },
            { key: 'basics', label: 'Discharge & Cervical Fluid' },
            { key: 'conditions', label: 'PCOS & Endometriosis' },
            { key: 'doctor', label: 'Doctor Visit Prep' }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-burgundy-900 text-white shadow-xs'
                  : 'bg-white border border-rosepink-200 text-gray-600 hover:border-rosepink-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List / Accordion */}
      <div className="space-y-4">
        {filteredArticles.map(article => {
          const isExpanded = expandedArticleId === article.id;

          return (
            <div
              key={article.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 shadow-soft border transition-all ${
                article.isWarning
                  ? 'border-rose-300 bg-rose-50/20'
                  : isExpanded
                  ? 'border-cherry-400 ring-1 ring-cherry-400/20'
                  : 'border-rosepink-200/80 hover:border-rosepink-300'
              }`}
            >
              <div
                onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                className="cursor-pointer flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        article.isWarning
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-rosepink-100 text-burgundy-900 border-rosepink-200'
                      }`}
                    >
                      {article.badge}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-burgundy-900 tracking-tight">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <button
                  type="button"
                  className="p-2 rounded-full text-gray-400 hover:text-burgundy-900 hover:bg-rosepink-100 transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Article Body */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-rosepink-100 space-y-4 animate-fade-in text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {article.content.map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}

                  {/* Key Takeaways Box */}
                  {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blush-50 border border-rosepink-200/80 space-y-2 mt-4">
                      <span className="font-serif font-bold text-sm text-burgundy-900 block">
                        Key Medical Takeaways
                      </span>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {article.keyTakeaways.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-cherry-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-gray-400 italic">
                    Medical content is informational and educational only. Always seek personalized guidance from a qualified physician.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
