/** Secular children's reading lessons and classical poetry, fully voweled, plus Tashkeel (case-ending) drills. */

export interface Lesson {
  id: string;
  kind: 'story' | 'poem';
  titleAr: string;
  text: string;
}

export const LESSONS: Lesson[] = [
  { id: 's1', kind: 'story', titleAr: 'الشمس', text: 'الشَّمْسُ تُشْرِقُ كُلَّ صَبَاحٍ' },
  { id: 's2', kind: 'story', titleAr: 'القطة الصغيرة', text: 'الْقِطَّةُ الصَّغِيرَةُ تَشْرَبُ الْحَلِيبَ' },
  { id: 's3', kind: 'story', titleAr: 'إلى المدرسة', text: 'ذَهَبَ الْوَلَدُ إِلَى الْمَدْرَسَةِ مَعَ أَصْدِقَائِهِ' },
  { id: 's4', kind: 'story', titleAr: 'مجلس الجد', text: 'يَسْقِي الْجَدُّ ضُيُوفَهُ الْقَهْوَةَ' },
  { id: 'p1', kind: 'poem', titleAr: 'المتنبي: علو الهمة', text: 'عَلَى قَدْرِ أَهْلِ الْعَزْمِ تَأْتِي الْعَزَائِمُ وَتَأْتِي عَلَى قَدْرِ الْكِرَامِ الْمَكَارِمُ' },
  { id: 'p2', kind: 'poem', titleAr: 'أحمد شوقي: المعلم', text: 'قُمْ لِلْمُعَلِّمِ وَفِّهِ التَّبْجِيلَا كَادَ الْمُعَلِّمُ أَنْ يَكُونَ رَسُولَا' },
  { id: 'p3', kind: 'poem', titleAr: 'حكمة: العلم نور', text: 'الْعِلْمُ نُورٌ وَالْجَهْلُ ظَلَامٌ' },
];

export type Mark = 'damma' | 'fatha' | 'kasra';

export const MARK_CHAR: Record<Mark, string> = {
  damma: 'ُ',
  fatha: 'َ',
  kasra: 'ِ',
};

export const MARK_NAME_AR: Record<Mark, string> = {
  damma: 'ضمة',
  fatha: 'فتحة',
  kasra: 'كسرة',
};

export interface TashkeelItem {
  id: string;
  before: string;
  /** The target word without its final vowel mark. */
  stem: string;
  after: string;
  correct: Mark;
  reasonAr: string;
}

export const TASHKEEL_ITEMS: TashkeelItem[] = [
  { id: 't1', before: '', stem: 'الشَّمْس', after: ' تُشْرِقُ', correct: 'damma', reasonAr: 'مبتدأ مرفوع، وعلامة رفعه الضمة' },
  { id: 't2', before: 'ذَهَبَ الْوَلَدُ إِلَى ', stem: 'الْمَدْرَسَة', after: '', correct: 'kasra', reasonAr: 'اسم مجرور بحرف الجر «إلى»، وعلامة جره الكسرة' },
  { id: 't3', before: 'شَرِبَ الْوَلَدُ ', stem: 'الْحَلِيب', after: '', correct: 'fatha', reasonAr: 'مفعول به منصوب، وعلامة نصبه الفتحة' },
  { id: 't4', before: 'إِنَّ ', stem: 'الْعِلْم', after: ' نُورٌ', correct: 'fatha', reasonAr: 'اسم «إنّ» منصوب، وعلامة نصبه الفتحة' },
  { id: 't5', before: 'خَرَجَ الطَّالِبُ مِنَ ', stem: 'الْمَكْتَب', after: '', correct: 'kasra', reasonAr: 'اسم مجرور بحرف الجر «من»، وعلامة جره الكسرة' },
  { id: 't6', before: 'كَتَبَ ', stem: 'الطَّالِب', after: ' الدَّرْسَ', correct: 'damma', reasonAr: 'فاعل مرفوع، وعلامة رفعه الضمة' },
];
