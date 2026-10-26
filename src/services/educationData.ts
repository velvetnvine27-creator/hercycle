import { EducationArticle } from '../types';

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: 'warning-signs',
    title: '⚠️ Urgent Warning Signs: When to Seek Immediate Medical Care',
    category: 'warning',
    readTime: '2 min read',
    badge: 'Urgent Care & Safety',
    isWarning: true,
    summary: 'Essential red flags that require urgent medical evaluation or emergency hospital care, never to be ignored or postponed.',
    content: [
      'While mild to moderate cramps and cycle fluctuations can be normal, certain symptoms indicate acute medical emergencies that require prompt clinical assessment.',
      'Seek emergency medical evaluation immediately if you experience:',
      '• Sudden, severe, agonizing pelvic or abdominal pain (especially unilateral/one-sided, which could signal an ectopic pregnancy or ruptured ovarian cyst).',
      '• Extremely heavy bleeding: completely soaking through two or more regular-to-heavy pads or tampons per hour for two or more consecutive hours.',
      '• Passing blood clots larger than the size of a quarter (approx. 2.5 cm / 1 inch), accompanied by weakness.',
      '• Dizziness, lightheadedness, shortness of breath, confusion, or fainting (syncope) during or after bleeding.',
      '• Sudden high fever (over 102°F / 38.9°C), vomiting, diarrhea, sunburn-like rash, and rapid heart rate while using tampons or menstrual cups (signs of Toxic Shock Syndrome - TSS).',
      '• Foul-smelling or unusual greyish/greenish vaginal discharge accompanied by pelvic fever or painful urination.'
    ],
    keyTakeaways: [
      'Never wait out sudden debilitating pelvic pain.',
      'Soaking 2+ pads/hr for 2+ hours warrants urgent medical triage.',
      'Remove tampons immediately and seek emergency care if high fever with vomiting develops.'
    ]
  },
  {
    id: 'cycle-phases',
    title: 'Decoding the 4 Menstrual Phases: Hormones & Energy',
    category: 'phases',
    readTime: '5 min read',
    badge: 'Hormonal Science',
    summary: 'A clear guide to your monthly rhythm: Menstrual, Follicular, Ovulatory, and Luteal phases, and how each influences your body and mind.',
    content: [
      'Your menstrual cycle is much more than just your bleeding days. It is an intricate, four-act symphony governed by fluctuating levels of estrogen, progesterone, luteinizing hormone (LH), and follicle-stimulating hormone (FSH).',
      '1. Menstrual Phase (Days 1–5): Estrogen and progesterone drop to baseline levels, causing the uterine lining to shed. Energy is naturally lower; the body demands rest, gentle hydration, and iron replenishment.',
      '2. Follicular Phase (Days 6–13): FSH stimulates ovarian follicles. Estrogen rises steadily, rebuilding the endometrium, sharpening cognitive focus, lifting stamina, and boosting skin glow.',
      '3. Ovulatory Phase (Days 14–16): A surge in LH triggers the release of a mature egg. You reach peak vitality, higher libido, and social confidence. This is the only window in which conception can occur.',
      '4. Luteal Phase (Days 17–28): The ruptured follicle transforms into the corpus luteum, producing progesterone. Progesterone calms the nervous system and warms body temperature. If fertilization does not happen, progesterone and estrogen decline, leading into PMS or the next period.'
    ],
    keyTakeaways: [
      'Cycle length naturally varies between 21 and 35 days for most healthy adults.',
      'Estrogen fuels creativity and physical endurance; progesterone encourages recovery and reflection.',
      'Phase estimates in HerCycle help you plan self-care, but should never be used as a contraceptive method.'
    ]
  },
  {
    id: 'pms-pmdd',
    title: 'Understanding PMS & PMDD: Mood, Brain Chemistry & Relief',
    category: 'pain',
    readTime: '4 min read',
    badge: 'Emotional Wellness',
    summary: 'How hormonal shifts interact with serotonin to create premenstrual symptoms, and how to identify Premenstrual Dysphoric Disorder.',
    content: [
      'Premenstrual Syndrome (PMS) encompasses physical and emotional symptoms that arise 7 to 10 days before menstruation and vanish shortly after flow begins.',
      'Why does it happen? As progesterone and estrogen drop in the late luteal phase, they directly influence brain neurotransmitters, particularly serotonin and GABA. This drop can trigger irritability, tearfulness, breast soreness, food cravings, and mild insomnia.',
      'What is PMDD? Premenstrual Dysphoric Disorder (PMDD) is a severe, debilitating medical condition affecting 3–8% of menstruating individuals. It is characterized by extreme mood swings, overwhelming despair, panic attacks, severe anger, and feelings of hopelessness that severely disrupt daily life.',
      'Tracking with HerCycle provides objective historical data. If your severe emotional distress reliably occurs solely during the luteal window and resolves with menstruation, bring your log to a compassionate healthcare provider.'
    ],
    keyTakeaways: [
      'PMS is common, but debilitating emotional distress is not something you must silently suffer.',
      'PMDD is a genuine neurobiological sensitivity to normal hormonal fluctuations, not a personal flaw.',
      'Evidence-based lifestyle supports include magnesium glycinate, vitamin B6, regular aerobic exercise, and stress-reduction therapies.'
    ]
  },
  {
    id: 'cramps-dysmenorrhea',
    title: 'Period Pain & Cramps: Primary vs Secondary Dysmenorrhea',
    category: 'pain',
    readTime: '4 min read',
    badge: 'Pain Management',
    summary: 'Why uterine prostaglandins cause cramping, evidence-based pain management tips, and when pain signals an underlying condition.',
    content: [
      'Uterine cramping (dysmenorrhea) is caused by prostaglandins—hormone-like lipids produced in the uterine lining that cause the uterine muscle to contract and shed its lining.',
      'Primary Dysmenorrhea refers to common menstrual cramps that begin shortly after menarche without an identifiable underlying pelvic disease. The pain typically peaks on day 1 or 2 and responds well to heat therapy (heating pad at 104°F / 40°C), NSAIDs like ibuprofen, and gentle pelvic movement.',
      'Secondary Dysmenorrhea is pain caused by an underlying reproductive condition such as endometriosis, adenomyosis, uterine fibroids, or pelvic inflammatory disease (PID). Red flags include pain that starts years after first periods, worsens over time, persists throughout the entire month, or causes pain during intercourse or bowel movements.'
    ],
    keyTakeaways: [
      'Prostaglandins drive normal uterine contractions; anti-inflammatory foods and targeted NSAIDs block prostaglandin production.',
      'Severe pain that renders you unable to work, attend school, or get out of bed is NOT "just part of being a woman" and warrants clinical investigation.',
      'Continuous heat application has been shown in clinical trials to be as effective as standard doses of ibuprofen for primary dysmenorrhea.'
    ]
  },
  {
    id: 'cervical-discharge',
    title: 'Cervical Mucus & Discharge Types Demystified',
    category: 'basics',
    readTime: '3 min read',
    badge: 'Body Literacy',
    summary: 'Learn to read your body’s natural secretions: from dry to sticky, creamy, and raw egg-white fertile mucus.',
    content: [
      'Cervical fluid is produced by glands in the cervix and changes texture and volume in direct response to circulating estrogen levels throughout your cycle.',
      '• Dry / Sticky (Early Follicular): Immediately post-period, discharge is minimal, pasty, or tacky. Sperm cannot easily travel; fertility is low.',
      '• Creamy / Lotion-like (Mid Follicular): As estrogen rises, mucus becomes cloudy, moist, and resembles lotion or milk. Fertility begins to rise.',
      '• Egg-white / Watery (Ovulatory Peak): High estrogen produces abundant, clear, slippery, highly stretchy mucus (can stretch between two fingers). This creates microscopic channels that nourish and guide sperm. This marks your peak fertile window.',
      '• Thick / Clumpy / Dry (Luteal): Progesterone thickens mucus to form a protective plug at the cervix.'
    ],
    keyTakeaways: [
      'Clear, white, or pale yellow odorless discharge that varies through the cycle is completely healthy.',
      'Discharge that is cottage-cheese clumpy with intense itching suggests a yeast infection.',
      'Discharge that is foamy, greenish, grey, or has a strong fishy odor suggests bacterial vaginosis or trichomoniasis.'
    ]
  },
  {
    id: 'pcos-awareness',
    title: 'PCOS Awareness: Signs, Hormones & Holistic Management',
    category: 'conditions',
    readTime: '5 min read',
    badge: 'Endocrine Health',
    summary: 'A compassionate guide to Polycystic Ovary Syndrome (PCOS), the Rotterdam diagnostic criteria, and supportive daily habits.',
    content: [
      'Polycystic Ovary Syndrome (PCOS) is a common hormonal condition affecting an estimated 1 in 10 individuals of reproductive age worldwide.',
      'Under the Rotterdam diagnostic criteria, a diagnosis generally requires at least two of the following three features:',
      '1. Irregular, infrequent, or absent menstrual cycles (oligo- or anovulation).',
      '2. Clinical or biochemical signs of elevated androgens (male-type hormones), such as hirsutism (excess facial/body hair), persistent cystic acne, or male-pattern hair thinning.',
      '3. Polycystic appearance of ovaries on an ultrasound (numerous small, immature follicles).',
      'Managing PCOS: While PCOS cannot be cured, its symptoms can be managed effectively through stabilizing insulin resistance with balanced protein/fiber meals, regular physical activity, stress mitigation, inositol supplementation, and medical therapies prescribed by an endocrinologist or gynecologist.'
    ],
    keyTakeaways: [
      'You can have PCOS without having visible ovarian cysts, and you can have ovarian cysts without having PCOS.',
      'Insulin resistance is a central driver in up to 70% of individuals with PCOS.',
      'Tracking cycle intervals in HerCycle provides essential documentation for your physician.'
    ]
  },
  {
    id: 'endometriosis-guide',
    title: 'Endometriosis Awareness & Tracking Symptoms for Your Doctor',
    category: 'conditions',
    readTime: '5 min read',
    badge: 'Chronic Health',
    summary: 'Understanding this inflammatory condition where tissue similar to the uterine lining grows outside the uterus, and how to advocate for yourself.',
    content: [
      'Endometriosis occurs when tissue similar to the endometrium (the lining of the uterus) grows outside the uterus—most commonly on the ovaries, fallopian tubes, outer uterine surface, bowel, bladder, and peritoneum.',
      'Unlike normal endometrial tissue that sheds and exits during menstruation, these lesions have no way to exit the body. They inflame surrounding tissue, causing chronic pain, adhesions (internal scar bands), and potential organ dysfunction.',
      'Hallmark symptoms include:',
      '• Deep, debilitating pelvic pain before and during periods that does not respond to standard pain relievers.',
      '• Pain with bowel movements or urination during menstruation.',
      '• Deep pelvic pain during or after sexual intercourse (dyspareunia).',
      '• Chronic lower back and hip pain, and unexplainable chronic fatigue.',
      'Diagnosis historically takes 7 to 10 years due to normalized pain myths. Keeping rigorous records in Bloom Cycle of pain severity, flow intensity, and missed activities helps validate your symptoms during consultations.'
    ],
    keyTakeaways: [
      'Severe pain that interferes with your everyday life is never "normal".',
      'Definitive diagnosis is achieved via minimally invasive laparoscopy by an excision specialist.',
      'A multi-disciplinary care team (OB/GYN, pelvic floor physical therapist, pain specialist) yields the best outcomes.'
    ]
  },
  {
    id: 'preparing-doctor-visit',
    title: 'Preparing for Your OB/GYN Visit: Practical Checklist',
    category: 'doctor',
    readTime: '3 min read',
    badge: 'Doctor Visit Prep',
    summary: 'How to organize your cycle history, symptom trends, and questions so you feel confident and heard at your next clinical appointment.',
    content: [
      'Doctor visits are often brief (15–20 minutes). Arriving prepared empowers you to advocate for your health and ensures critical details are not missed.',
      'Checklist to Bring:',
      '1. Your HerCycle Stats: Date of last period, average cycle length, longest and shortest cycles over the past 6 months.',
      '2. Symptom Trend Log: Note which cycle phase your symptoms peak (e.g. "Severe migraines consistently occur 3 days before bleeding starts").',
      '3. Medication & Supplement List: Exact dosages of prescriptions, birth control, and over-the-counter pain relievers.',
      '4. Specific Questions: Write down your top 3 concerns at the top of your notepad so you can raise them first.',
      '5. Family History: Any known diagnoses of endometriosis, early menopause, PCOS, fibroids, or gynecological cancers in mother, sisters, or maternal relatives.'
    ],
    keyTakeaways: [
      'Quantify your symptoms: say "Pain rated 8/10 for 3 consecutive days, preventing me from standing" instead of "I have cramps".',
      'Export or review your HerCycle history before stepping into the examination room.',
      'You are always entitled to ask for a chaperone, request a smaller speculum, or seek a second opinion.'
    ]
  }
];
