import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FasihProgress,
  WordStatus,
  alignReading,
  buildParentReport,
  emptyProgress,
  recordLessonResult,
  recordPracticeDay,
  recordTashkeelAnswer,
  splitWords,
  starsForAccuracy,
  whatsappShareUrl,
} from './engine';
import { LESSONS, Lesson, MARK_CHAR, MARK_NAME_AR, Mark, TASHKEEL_ITEMS } from './content';

const STORAGE_KEY = 'fasih_kids_progress_v1';

function loadProgress(): FasihProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress(), ...(JSON.parse(raw) as FasihProgress) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function createRecognition(): RecognitionLike | null {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const STATUS_STYLE: Record<WordStatus, string> = {
  correct: 'bg-[#10B981]/25 text-[#A7F3D0] border-[#10B981]',
  wrong: 'bg-[#F59E0B]/25 text-[#FDE68A] border-[#F59E0B]',
  missed: 'bg-[#EF4444]/25 text-[#FECACA] border-[#EF4444]',
  pending: 'bg-white/5 text-white/80 border-white/15',
};

const STATUS_LABEL: Record<WordStatus, string> = {
  correct: 'صحيح',
  wrong: 'نطق مختلف',
  missed: 'لم تُقرأ',
  pending: '',
};

function Stars({ count, size = 'text-xl' }: { count: number; size?: string }) {
  return (
    <span className={`${size} tracking-widest`} aria-label={`${count} من 3 نجوم`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? 'text-[#FBBF24]' : 'text-white/20'}>★</span>
      ))}
    </span>
  );
}

function ReadingScreen({ lesson, onDone, onBack }: { lesson: Lesson; onDone: (stars: number) => void; onBack: () => void }) {
  const [listening, setListening] = useState(false);
  const [spoken, setSpoken] = useState('');
  const [finished, setFinished] = useState(false);
  const [manualMarks, setManualMarks] = useState<Set<number>>(new Set());
  const recRef = useRef<RecognitionLike | null>(null);
  const supported = useMemo(() => createRecognition() !== null, []);
  const words = useMemo(() => splitWords(lesson.text), [lesson.text]);

  const result = useMemo(() => {
    if (!supported) {
      const statuses: WordStatus[] = words.map((_, i) => (manualMarks.has(i) ? 'correct' : finished ? 'missed' : 'pending'));
      const correct = manualMarks.size;
      return { statuses, correct, total: words.length, accuracy: words.length ? correct / words.length : 0 };
    }
    return alignReading(lesson.text, spoken, finished);
  }, [supported, words, manualMarks, finished, lesson.text, spoken]);

  const stars = starsForAccuracy(result.accuracy);

  const finish = useCallback(() => {
    setListening(false);
    setFinished(true);
  }, []);

  const startListening = () => {
    const rec = createRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += ' ' + e.results[i][0].transcript;
      setSpoken(text.trim());
    };
    rec.onend = finish;
    rec.onerror = finish;
    setSpoken('');
    setFinished(false);
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recRef.current?.stop();
    finish();
  };

  useEffect(() => () => recRef.current?.stop(), []);

  const hear = () => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(lesson.text);
    u.lang = 'ar-SA';
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const reset = () => {
    setSpoken('');
    setFinished(false);
    setManualMarks(new Set());
  };

  return (
    <div className="space-y-4" data-testid="reading-screen">
      <button type="button" onClick={onBack} className="text-sm text-[#6EE7B7] underline">← الدروس</button>
      <h2 className="text-xl font-extrabold">{lesson.titleAr}</h2>

      <div className="rounded-2xl bg-[#173A2E] border border-[#10B981]/40 p-4 leading-[3] text-center" data-testid="reading-text">
        {words.map((w, i) => {
          const st = result.statuses[i];
          const tappable = !supported && !finished;
          return (
            <button
              key={i}
              type="button"
              disabled={!tappable}
              data-status={st}
              onClick={() => setManualMarks((prev) => new Set(prev).add(i))}
              className={`inline-block mx-1 px-2 rounded-lg border text-2xl font-bold transition-colors ${STATUS_STYLE[st]}`}
              title={STATUS_LABEL[st]}
            >
              {w}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={hear} className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 py-3 font-bold">🔊 استمع</button>
        {supported ? (
          listening ? (
            <button type="button" data-testid="stop-reading" onClick={stopListening} className="flex-1 rounded-xl bg-[#EF4444] py-3 font-extrabold">⏹ أنهيت القراءة</button>
          ) : (
            <button type="button" data-testid="start-reading" onClick={startListening} className="flex-1 rounded-xl bg-[#10B981] text-[#052e22] py-3 font-extrabold">🎤 ابدأ القراءة</button>
          )
        ) : (
          <button type="button" data-testid="manual-finish" onClick={finish} className="flex-1 rounded-xl bg-[#10B981] text-[#052e22] py-3 font-extrabold">أنهيت القراءة</button>
        )}
      </div>

      {!supported && (
        <p className="text-xs text-[#FDE68A]">متصفحك لا يدعم التعرف على الصوت. اقرأ بصوت عالٍ ثم اضغط على كل كلمة قرأتها صحيحة.</p>
      )}
      {listening && <p className="text-xs text-[#A7F3D0]" aria-live="polite">أستمع إليك... الكلمات تتلوّن أثناء القراءة</p>}

      {finished && (
        <div className="rounded-2xl bg-[#173A2E] border border-[#FBBF24]/50 p-4 text-center space-y-2" data-testid="reading-result">
          <Stars count={stars} size="text-4xl" />
          <p className="font-bold">
            {stars === 3 ? 'ممتاز يا بطل! قراءة فصيحة' : stars >= 1 ? 'أحسنت! حاول مرة أخرى لتنال نجوماً أكثر' : 'لا بأس، استمع ثم جرّب من جديد'}
          </p>
          <p className="text-xs text-white/70">{result.correct} من {result.total} كلمات صحيحة</p>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={reset} className="flex-1 rounded-xl bg-white/10 py-2.5 font-bold">إعادة</button>
            <button type="button" data-testid="save-result" onClick={() => onDone(stars)} className="flex-1 rounded-xl bg-[#FBBF24] text-[#3b2a00] py-2.5 font-extrabold">حفظ والعودة</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TashkeelScreen({ onAnswer, onBack }: { onAnswer: (correct: boolean) => void; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Mark | null>(null);
  const item = TASHKEEL_ITEMS[index % TASHKEEL_ITEMS.length];
  const marks: Mark[] = ['damma', 'fatha', 'kasra'];

  const choose = (m: Mark) => {
    if (picked) return;
    setPicked(m);
    onAnswer(m === item.correct);
  };

  return (
    <div className="space-y-4" data-testid="tashkeel-screen">
      <button type="button" onClick={onBack} className="text-sm text-[#6EE7B7] underline">← الدروس</button>
      <h2 className="text-xl font-extrabold">مدرب التشكيل</h2>
      <p className="text-sm text-white/80">اختر الحركة الصحيحة لآخر الكلمة المُلوَّنة.</p>

      <div className="rounded-2xl bg-[#173A2E] border border-[#10B981]/40 p-5 text-center text-2xl font-bold leading-[2.4]" data-testid="tashkeel-sentence">
        <span>{item.before}</span>
        <span className="text-[#FBBF24]">
          {item.stem}
          {picked ? MARK_CHAR[picked] : '◌'}
        </span>
        <span>{item.after}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {marks.map((m) => {
          const isPicked = picked === m;
          const isRight = picked && m === item.correct;
          return (
            <button
              key={m}
              type="button"
              data-testid={`mark-${m}`}
              onClick={() => choose(m)}
              className={`rounded-xl py-3 font-extrabold border text-lg ${
                isRight
                  ? 'bg-[#10B981] text-[#052e22] border-[#10B981]'
                  : isPicked
                  ? 'bg-[#EF4444]/40 border-[#EF4444]'
                  : 'bg-white/10 border-white/15 hover:bg-white/15'
              }`}
            >
              <span className="block text-3xl leading-none">ـ{MARK_CHAR[m]}</span>
              {MARK_NAME_AR[m]}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="rounded-xl bg-[#173A2E] border border-[#FBBF24]/40 p-3 text-sm" data-testid="tashkeel-feedback">
          <p className="font-extrabold">{picked === item.correct ? '✅ إجابة صحيحة!' : `❌ الإجابة الصحيحة: ${MARK_NAME_AR[item.correct]}`}</p>
          <p className="text-white/80 mt-1">{item.reasonAr}</p>
          <button
            type="button"
            data-testid="tashkeel-next"
            onClick={() => {
              setPicked(null);
              setIndex((i) => i + 1);
            }}
            className="mt-3 w-full rounded-xl bg-[#FBBF24] text-[#3b2a00] py-2.5 font-extrabold"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

export default function FasihApp() {
  const [progress, setProgress] = useState<FasihProgress>(loadProgress);
  const [screen, setScreen] = useState<{ kind: 'home' } | { kind: 'read'; lesson: Lesson } | { kind: 'tashkeel' }>({ kind: 'home' });
  const [childName, setChildName] = useState<string>(() => {
    try {
      return localStorage.getItem('fasih_child_name') || 'بطلنا';
    } catch {
      return 'بطلنا';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      localStorage.setItem('fasih_child_name', childName);
    } catch {
      // storage unavailable: progress lasts for this session only
    }
  }, [progress, childName]);

  const totalStars = Object.values(progress.bestStars).reduce((a, b) => a + b, 0);
  const report = buildParentReport(progress, childName);

  return (
    <div dir="rtl" className="min-h-screen bg-[#10231C] text-[#F4FBF7] font-sans" style={{ fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-md px-4 py-6 space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">فصيح <span className="text-[#FBBF24]">Fasih</span></h1>
            <p className="text-xs text-[#A7F3D0]">اقرأ بصوتك، وتعلّم التشكيل</p>
          </div>
          <div className="text-end">
            <Stars count={Math.min(3, totalStars)} />
            <p className="text-xs tabular-nums text-white/70" data-testid="total-stars">{totalStars} ★ · 🔥 {progress.streakDays}</p>
          </div>
        </header>

        {screen.kind === 'home' && (
          <>
            <button
              type="button"
              data-testid="open-tashkeel"
              onClick={() => setScreen({ kind: 'tashkeel' })}
              className="w-full rounded-2xl bg-gradient-to-l from-[#7C3AED] to-[#2563EB] p-4 text-start font-extrabold"
            >
              🔤 مدرب التشكيل
              <span className="block text-xs font-normal text-white/80 mt-0.5">
                اختر الضمة أو الفتحة أو الكسرة واعرف السبب
                {progress.tashkeelAttempts > 0 && ` · ${progress.tashkeelCorrect}/${progress.tashkeelAttempts} صحيحة`}
              </span>
            </button>

            {(['story', 'poem'] as const).map((kind) => (
              <section key={kind} className="space-y-2">
                <h2 className="text-sm font-bold text-[#6EE7B7]">{kind === 'story' ? 'قصص قصيرة' : 'شعر عربي فصيح'}</h2>
                {LESSONS.filter((l) => l.kind === kind).map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    data-testid={`lesson-${lesson.id}`}
                    onClick={() => setScreen({ kind: 'read', lesson })}
                    className="w-full flex items-center justify-between rounded-xl bg-[#173A2E] hover:bg-[#1c4636] border border-white/10 px-4 py-3"
                  >
                    <span className="font-bold">{lesson.titleAr}</span>
                    <Stars count={progress.bestStars[lesson.id] ?? 0} size="text-base" />
                  </button>
                ))}
              </section>
            ))}

            <section className="rounded-2xl bg-[#173A2E] border border-white/10 p-4 space-y-2">
              <h2 className="text-sm font-bold text-[#6EE7B7]">تقرير الوالدين</h2>
              <label className="block text-xs text-white/70">
                اسم الطفل
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-base"
                />
              </label>
              <pre className="text-xs whitespace-pre-wrap text-white/80 font-sans" data-testid="parent-report">{report}</pre>
              <a
                href={whatsappShareUrl(report)}
                target="_blank"
                rel="noreferrer"
                data-testid="whatsapp-share"
                className="block text-center rounded-xl bg-[#25D366] text-[#052e22] font-extrabold py-2.5"
              >
                أرسل التقرير عبر واتساب
              </a>
            </section>
          </>
        )}

        {screen.kind === 'read' && (
          <ReadingScreen
            lesson={screen.lesson}
            onBack={() => setScreen({ kind: 'home' })}
            onDone={(stars) => {
              setProgress((p) => recordLessonResult(recordPracticeDay(p, todayKey()), screen.lesson.id, stars));
              setScreen({ kind: 'home' });
            }}
          />
        )}

        {screen.kind === 'tashkeel' && (
          <TashkeelScreen
            onBack={() => setScreen({ kind: 'home' })}
            onAnswer={(correct) => setProgress((p) => recordTashkeelAnswer(recordPracticeDay(p, todayKey()), correct))}
          />
        )}
      </div>
    </div>
  );
}
