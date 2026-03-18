/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Calendar, ChevronRight, Zap, Moon, Sun } from 'lucide-react';

// --- Logic Helpers ---

const reduceArcana = (n: number): number => {
  if (n === 0) return 22; // In some systems 0 is 22
  let res = n;
  while (res > 22) {
    res = String(res).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return res === 0 ? 22 : res;
};

const sumDigits = (n: number): number => {
  return String(n).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
};

// --- Knowledge Base ---

const ARCANA_INFO: Record<number, { title: string; plus: string; minus: string }> = {
  1: {
    title: "Маг",
    plus: "Лидерство, новаторство, сила мысли, умение управлять реальностью, коммуникабельность.",
    minus: "Эгоизм, манипуляции, подавление других, неверие в свои силы, болтливость."
  },
  2: {
    title: "Верховная Жрица",
    plus: "Интуиция, дипломатия, умение хранить тайны, понимание законов природы, мягкость.",
    minus: "Двуличность, сплетни, скрытность, пассивность, нерешительность."
  },
  3: {
    title: "Императрица",
    plus: "Плодородие, изобилие, женственность, забота, умение создавать уют и красоту.",
    minus: "Контроль, деспотизм, зацикленность на материальном, проблемы с женщинами."
  },
  4: {
    title: "Император",
    plus: "Власть, структура, ответственность, защита, умение руководить и строить бизнес.",
    minus: "Тирания, жесткость, агрессия, нежелание брать ответственность, проблемы с отцом."
  },
  5: {
    title: "Иерофант",
    plus: "Учительство, традиции, порядок, духовный поиск, умение передавать знания.",
    minus: "Гордыня, поучительство, фанатизм, нежелание учиться новому, нарушение правил."
  },
  6: {
    title: "Влюбленные",
    plus: "Любовь, выбор сердцем, коммуникация, эстетика, умение строить партнерство.",
    minus: "Нерешительность, зависимость от мнения других, поверхностность, идеализация."
  },
  7: {
    title: "Колесница",
    plus: "Целеустремленность, победа, движение, лидерство, умение достигать целей.",
    minus: "Агрессия, лень, отсутствие цели, воинственность, неумение доводить до конца."
  },
  8: {
    title: "Справедливость",
    plus: "Баланс, понимание причинно-следственных связей, честность, объективность.",
    minus: "Осуждение, борьба за правду, обидчивость, нарушение закона, предвзятость."
  },
  9: {
    title: "Отшельник",
    plus: "Мудрость, глубина, самопознание, умение быть в одиночестве, аналитический склад ума.",
    minus: "Замкнутость, гордыня, страх одиночества, нежелание делиться знаниями, угрюмость."
  },
  10: {
    title: "Колесо Фортуны",
    plus: "Удача, поток, легкость, циклы, умение доверять судьбе и ловить возможности.",
    minus: "Пассивность, неверие в удачу, застой, зависимость от обстоятельств, лень."
  },
  11: {
    title: "Сила",
    plus: "Потенциал, страсть, выносливость, умение управлять инстинктами, харизма.",
    minus: "Агрессия, бессилие, давление на других, трудоголизм до изнеможения."
  },
  12: {
    title: "Повешенный",
    plus: "Служение, новый взгляд, креативность, милосердие, умение видеть суть.",
    minus: "Жертвенность, застой, неумение сказать 'нет', депрессия, иллюзии."
  },
  13: {
    title: "Смерть",
    plus: "Трансформация, перемены, умение отпускать старое, решительность, экстрим.",
    minus: "Страх перемен, зацикленность на прошлом, риск жизнью, жестокость."
  },
  14: {
    title: "Умеренность",
    plus: "Гармония, искусство, исцеление, терпение, связь с ангелом-хранителем.",
    minus: "Несдержанность, зависимости, отсутствие вкуса, неуравновешенность."
  },
  15: {
    title: "Дьявол",
    plus: "Харизма, материальный успех, видение теней, сексуальность, влияние.",
    minus: "Зависимости, манипуляции, жажда наживы, агрессия, гордыня."
  },
  16: {
    title: "Башня",
    plus: "Духовное пробуждение, разрушение старого, сила духа, лидерство в кризис.",
    minus: "Агрессия, разрушение жизни, травматизм, жесткость, нежелание меняться."
  },
  17: {
    title: "Звезда",
    plus: "Вдохновение, талант, надежда, известность, чистота, связь с космосом.",
    minus: "Гордыня, 'звездная болезнь', нереализованность, серость, оторванность от реальности."
  },
  18: {
    title: "Луна",
    plus: "Магия, воображение, материализация мыслей, глубокая интуиция, психология.",
    minus: "Страхи, иллюзии, обман, зависимости, депрессия, магические откаты."
  },
  19: {
    title: "Солнце",
    plus: "Успех, радость, процветание, лидерство, щедрость, любовь к детям.",
    minus: "Выгорание, эгоцентризм, властность, самобичевание, агрессия."
  },
  20: {
    title: "Суд",
    plus: "Связь с родом, пробуждение, призвание, работа с информацией, обновление.",
    minus: "Осуждение близких, родовые проклятия, застой, страх смерти."
  },
  21: {
    title: "Мир",
    plus: "Глобальность, миротворчество, свобода, расширение границ, принятие всех.",
    minus: "Ограниченность, враждебность к миру, апатия, нежелание развиваться."
  },
  22: {
    title: "Шут",
    plus: "Свобода, начало нового пути, доверие богу, креативность, отсутствие рамок.",
    minus: "Безответственность, глупость, зависимости, хаос, ограничение свободы."
  }
};

const POSITION_INFO: Record<string, { label: string; desc: string }> = {
  A: { label: "Визитная карточка (День)", desc: "Ваши личные качества, таланты и то, как вас воспринимают окружающие при первой встрече." },
  B: { label: "Связь с Высшим (Месяц)", desc: "Ваш духовный потенциал, интуиция и связь с ангелом-хранителем. Ваши мысли." },
  V: { label: "Материальный мир (Год)", desc: "Ваши задачи в социуме, деньги, здоровье и материальные достижения." },
  G: { label: "Кармическая задача (Низ)", desc: "Главный урок из прошлого воплощения, который нужно проработать в этой жизни." },
  D: { label: "Зона комфорта (Центр)", desc: "Ваша суть, то состояние, в котором ваша душа чувствует себя максимально гармонично." },
  D1: { label: "Точка D1", desc: "Связующая энергия кармического хвоста, показывающая через что идет проработка." },
  D2: { label: "Точка D2", desc: "Глубинная причина кармического долга, требующая осознания." }
};

const KARMIC_TAILS: Record<string, { title: string; description: string }> = {
  '18-9-9': {
    title: "Волшебник / Отшельник",
    description: "В прошлом вы обладали тайными знаниями, но не передали их или использовали во вред. Сейчас вы можете чувствовать себя одиноко или бояться проявлять свои способности. Задача: выйти из тени, делиться мудростью и не бояться быть 'белой вороной'."
  },
  '18-6-6': {
    title: "Любовная магия",
    description: "В прошлом вы привязывали к себе людей магией или манипуляциями. Сейчас — страх одиночества и сложности в любви. Задача: научиться любить безусловно, давать свободу партнеру."
  },
  '15-5-8': {
    title: "Предательство в семье",
    description: "Нарушение семейных устоев или измена. Задача: верность, честность и создание крепких семейных традиций."
  },
  '9-15-6': {
    title: "Мир страстей",
    description: "Зависимости и жизнь ради удовольствий в прошлом. Задача: духовная чистота и умение видеть истинную любовь за физическим влечением."
  },
  '12-19-7': {
    title: "Воин",
    description: "Агрессия и подавление в прошлом. Задача: мирное лидерство, созидание и защита слабых."
  },
  '21-4-10': {
    title: "Угнетение",
    description: "Ограничение свободы других или жизнь в рабстве. Задача: освобождение от внутренних оков и уважение чужой свободы."
  },
  '3-22-19': {
    title: "Нерожденное дитя",
    description: "Прерванная жизнь или отказ от детей. Задача: безусловная любовь к детям и развитие своей 'внутренней матери/отца'."
  },
  '6-17-11': {
    title: "Загубленный талант",
    description: "Гордыня помешала реализации дара. Задача: проявлять таланты ярко и смело, служа людям."
  },
  '15-8-11': {
    title: "Физическая агрессия",
    description: "Насилие в прошлом. Задача: управление силой, спорт, защита и созидание."
  },
  '9-12-3': {
    title: "Одинокая женщина",
    description: "Отказ от любви ради аскезы. Задача: раскрытие женственности/мужественности и создание семьи."
  },
  '6-5-17': {
    title: "Гордыня",
    description: "Возвышение над другими. Задача: смирение и признание ценности каждого человека."
  },
  '15-20-5': {
    title: "Бунт в роду",
    description: "Конфликт с предками. Задача: примирение с родом и восстановление родовых связей."
  },
  '21-10-16': {
    title: "Духовный лидер",
    description: "Ошибка в управлении массами. Задача: вести людей к свету через истинные ценности."
  },
  '18-6-15': {
    title: "Темный маг",
    description: "Использование способностей во вред. Задача: светлое целительство и помощь людям."
  },
  '6-8-20': {
    title: "Разочарование рода",
    description: "Неоправданные ожидания предков. Задача: найти свой путь и прославить свой род достижениями."
  },
  '3-7-22': {
    title: "Узник",
    description: "Ограничение свободы (тюрьма или зависимость). Задача: обретение внутренней свободы и помощь другим освободиться."
  }
};

// --- Components ---

export default function App() {
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [matrix, setMatrix] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const calculate = () => {
    const { day, month, year } = birthDate;
    if (!day || !month || !year) return;

    const A = reduceArcana(parseInt(day));
    const B = reduceArcana(parseInt(month));
    const V = reduceArcana(sumDigits(parseInt(year)));
    const G = reduceArcana(A + B + V);
    const D = reduceArcana(A + B + V + G);

    const D1 = reduceArcana(D + G);
    const D2 = reduceArcana(D1 + G);

    setMatrix({ A, B, V, G, D, D1, D2 });
    setSelectedPoint(null);
  };

  const karmicTailKey = useMemo(() => {
    if (!matrix) return '';
    return `${matrix.G}-${matrix.D2}-${matrix.D1}`;
  }, [matrix]);

  const tailInterpretation = useMemo(() => {
    return KARMIC_TAILS[karmicTailKey] || null;
  }, [karmicTailKey]);

  const currentPointInfo = useMemo(() => {
    if (!selectedPoint || !matrix) return null;
    const arcanaNum = matrix[selectedPoint];
    return {
      pos: POSITION_INFO[selectedPoint],
      arcana: ARCANA_INFO[arcanaNum],
      num: arcanaNum
    };
  }, [selectedPoint, matrix]);

  return (
    <div className="mystic-bg flex flex-col items-center py-12 px-4 shimmer min-h-screen">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-serif text-5xl md:text-6xl gold-text mb-4 tracking-widest">
          Матрица Судьбы
        </h1>
        <p className="text-white/60 italic text-lg max-w-md mx-auto">
          Древние знания Арканов для вашего пути
        </p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl w-full max-w-xl mb-12"
      >
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-1">День</label>
            <input 
              type="number" 
              placeholder="ДД"
              value={birthDate.day}
              onChange={(e) => setBirthDate({ ...birthDate, day: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-center focus:outline-none focus:border-[#d4af37] transition-colors text-xl text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Месяц</label>
            <input 
              type="number" 
              placeholder="ММ"
              value={birthDate.month}
              onChange={(e) => setBirthDate({ ...birthDate, month: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-center focus:outline-none focus:border-[#d4af37] transition-colors text-xl text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Год</label>
            <input 
              type="number" 
              placeholder="ГГГГ"
              value={birthDate.year}
              onChange={(e) => setBirthDate({ ...birthDate, year: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-center focus:outline-none focus:border-[#d4af37] transition-colors text-xl text-white"
            />
          </div>
        </div>
        <button 
          onClick={calculate}
          className="w-full py-4 bg-[#d4af37] text-black font-serif text-xl uppercase tracking-widest rounded-lg glow-button flex items-center justify-center gap-2"
        >
          Раскрыть Судьбу <Sparkles size={20} />
        </button>
      </motion.div>

      <AnimatePresence>
        {matrix && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full max-w-5xl"
          >
            {/* Octagram Visualization */}
            <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] mb-16">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_20px_rgba(212,175,55,0.15)] pointer-events-auto">
                {/* Background Shapes */}
                <rect x="100" y="100" width="200" height="200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" transform="rotate(0 200 200)" />
                <rect x="100" y="100" width="200" height="200" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1" transform="rotate(45 200 200)" />
                <line x1="200" y1="50" x2="200" y2="350" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="50" y1="200" x2="350" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Interactive Nodes */}
                {/* Top (Month) - B */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('B')}>
                  <circle cx="200" cy="50" r="22" fill="#0f0f1a" stroke={selectedPoint === 'B' ? "#fff" : "#d4af37"} strokeWidth="2" />
                  <text x="200" y="57" textAnchor="middle" fill={selectedPoint === 'B' ? "#fff" : "#d4af37"} className="font-serif text-base font-bold select-none">{matrix.B}</text>
                </g>
                
                {/* Right (Year) - V */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('V')}>
                  <circle cx="350" cy="200" r="22" fill="#0f0f1a" stroke={selectedPoint === 'V' ? "#fff" : "#d4af37"} strokeWidth="2" />
                  <text x="350" y="207" textAnchor="middle" fill={selectedPoint === 'V' ? "#fff" : "#d4af37"} className="font-serif text-base font-bold select-none">{matrix.V}</text>
                </g>

                {/* Bottom (Bottom) - G */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('G')}>
                  <circle cx="200" cy="350" r="22" fill="#0f0f1a" stroke={selectedPoint === 'G' ? "#fff" : "#d4af37"} strokeWidth="2" />
                  <text x="200" y="357" textAnchor="middle" fill={selectedPoint === 'G' ? "#fff" : "#d4af37"} className="font-serif text-base font-bold select-none">{matrix.G}</text>
                </g>

                {/* Left (Day) - A */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('A')}>
                  <circle cx="50" cy="200" r="22" fill="#0f0f1a" stroke={selectedPoint === 'A' ? "#fff" : "#d4af37"} strokeWidth="2" />
                  <text x="50" y="207" textAnchor="middle" fill={selectedPoint === 'A' ? "#fff" : "#d4af37"} className="font-serif text-base font-bold select-none">{matrix.A}</text>
                </g>

                {/* Center (Comfort) - D */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('D')}>
                  <circle cx="200" cy="200" r="28" fill="#0f0f1a" stroke={selectedPoint === 'D' ? "#fff" : "#d4af37"} strokeWidth="3" />
                  <text x="200" y="208" textAnchor="middle" fill={selectedPoint === 'D' ? "#fff" : "#d4af37"} className="font-serif text-xl font-bold select-none">{matrix.D}</text>
                </g>

                {/* Karmic Tail Points */}
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('D1')}>
                  <circle cx="200" cy="250" r="16" fill="#0f0f1a" stroke={selectedPoint === 'D1' ? "#fff" : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                  <text x="200" y="255" textAnchor="middle" fill={selectedPoint === 'D1' ? "#fff" : "rgba(255,255,255,0.5)"} className="font-serif text-sm select-none">{matrix.D1}</text>
                </g>
                <g className="matrix-node cursor-pointer" onClick={() => setSelectedPoint('D2')}>
                  <circle cx="200" cy="300" r="16" fill="#0f0f1a" stroke={selectedPoint === 'D2' ? "#fff" : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                  <text x="200" y="305" textAnchor="middle" fill={selectedPoint === 'D2' ? "#fff" : "rgba(255,255,255,0.5)"} className="font-serif text-sm select-none">{matrix.D2}</text>
                </g>
              </svg>
            </div>

            {/* Detailed Interpretation */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Point Info Card */}
              <motion.div 
                layout
                className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-2xl min-h-[300px]"
              >
                {currentPointInfo ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-[#d4af37] font-serif text-2xl mb-1">{currentPointInfo.pos.label}</h3>
                        <p className="text-white/40 text-sm italic">{currentPointInfo.pos.desc}</p>
                      </div>
                      <div className="text-4xl font-serif gold-text">{currentPointInfo.num}</div>
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
                        Аркан {currentPointInfo.num}: {currentPointInfo.arcana.title}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 uppercase text-xs tracking-widest">
                            <Sun size={14} /> В плюсе
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">{currentPointInfo.arcana.plus}</p>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
                          <div className="flex items-center gap-2 text-rose-400 font-bold mb-2 uppercase text-xs tracking-widest">
                            <Moon size={14} /> В минусе
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">{currentPointInfo.arcana.minus}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 text-center">
                    <Zap size={48} className="mb-4 opacity-10" />
                    <p className="max-w-xs">Выберите любую точку на матрице выше, чтобы увидеть подробную расшифровку позиции и энергии Аркана.</p>
                  </div>
                )}
              </motion.div>

              {/* Karmic Tail Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 border border-[#d4af37]/30 p-8 rounded-2xl relative overflow-hidden flex flex-col"
              >
                <div className="absolute -top-4 -right-4 opacity-5">
                  <Sparkles size={120} color="#d4af37" />
                </div>
                <h3 className="font-serif text-2xl gold-text mb-6 flex items-center gap-2">
                  Кармический хвост
                </h3>
                <div className="flex justify-center gap-3 mb-8">
                  {[matrix.G, matrix.D2, matrix.D1].map((val, i) => (
                    <div key={i} className="w-14 h-14 rounded-full border-2 border-[#d4af37]/50 flex items-center justify-center font-serif text-2xl bg-[#d4af37]/10 text-[#d4af37]">
                      {val}
                    </div>
                  ))}
                </div>
                
                {tailInterpretation ? (
                  <div className="fade-in flex-grow">
                    <h4 className="text-xl font-bold mb-3 text-white/90 border-l-4 border-[#d4af37] pl-3">
                      {tailInterpretation.title}
                    </h4>
                    <p className="text-white/70 leading-relaxed italic text-sm">
                      {tailInterpretation.description}
                    </p>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-center text-white/40 italic text-sm">
                    <p>Ваше сочетание энергий {karmicTailKey} требует индивидуального анализа. Основная задача — проработка нижнего аркана {matrix.G}.</p>
                  </div>
                )}
                
                <div className="mt-8 pt-4 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/30 text-center">
                  Нижняя тройка энергий
                </div>
              </motion.div>

            </div>

            <footer className="text-center text-white/20 text-xs mt-12 border-t border-white/5 pt-8 w-full pb-12">
              <p>© 2026 Матрица Судьбы • Сакральная Геометрия Души</p>
              <p className="mt-2 max-w-lg mx-auto">Все расчеты основаны на методе 22 Арканов. Помните, что матрица — это лишь карта, а путь выбираете вы сами.</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
