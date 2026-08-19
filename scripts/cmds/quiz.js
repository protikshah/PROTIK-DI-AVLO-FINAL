module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "6.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Multi-category Quiz Game" },
    category: "games",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, commandName }) {
    const questions = [
       { question: "বিশ্বের বৃহত্তম মহাসাগর কোনটি?", options: ["A) আটলান্টিক", "B) প্রশান্ত মহাসাগর", "C) ভারত মহাসাগর", "D) উত্তর মহাসাগর"], answer: "B", answerText: "B) প্রশান্ত মহাসাগর" },
      { question: "পৃথিবীর ক্ষুদ্রতম দেশ কোনটি?", options: ["A) মোনাকো", "B) মালদ্বীপ", "C) ভ্যাটিকান সিটি", "D) সান মারিনো"], answer: "C", answerText: "C) ভ্যাটিকান সিটি" },
      { question: "কোন দেশকে 'সূর্যোদয়ের দেশ' বলা হয়?", options: ["A) চীন", "B) নরওয়ে", "C) জাপান", "D) থাইল্যান্ড"], answer: "C", answerText: "C) জাপান" },
      { question: "পিরামিডের দেশ কোনটি?", options: ["A) মিশর", "B) সুদান", "C) গ্রিস", "D) ইটালি"], answer: "A", answerText: "A) মিশর" },
      { question: "বিশ্বের দীর্ঘতম নদী কোনটি?", options: ["A) আমাজন", "B) নীল নদ", "C) মিসিসিপি", "D) ইয়াংসি"], answer: "B", answerText: "B) নীল নদ" },
      { question: "হাজার হ্রদের দেশ কোনটি?", options: ["A) ফিনল্যান্ড", "B) সুইজারল্যান্ড", "C) সুইডেন", "D) কানাডা"], answer: "A", answerText: "A) ফিনল্যান্ড" },
      { question: "ক্যানবেরা কোন দেশের রাজধানী?", options: ["A) নিউজিল্যান্ড", "B) অস্ট্রেলিয়া", "C) কানাডা", "D) অস্ট্রিয়া"], answer: "B", answerText: "B) অস্ট্রেলিয়া" },
      { question: "ইউরোপের ককপিট বলা হয় কোন দেশকে?", options: ["A) বেলজিয়াম", "B) ফ্রান্স", "C) জার্মানি", "D) সুইজারল্যান্ড"], answer: "A", answerText: "A) বেলজিয়াম" },
      { question: "আইফেল টাওয়ার কোন শহরে অবস্থিত?", options: ["A) লন্ডন", "B) রোম", "C) প্যারিস", "D) বার্লিন"], answer: "C", answerText: "C) প্যারিস" },
      { question: "কাঙ্গারুর দেশ বলা হয় কোনটিকে?", options: ["A) দক্ষিণ আফ্রিকা", "B) অস্ট্রেলিয়া", "C) ব্রাজিল", "D) আর্জেন্টিনা"], answer: "B", answerText: "B) অস্ট্রেলিয়া" },

      // --- বাংলাদেশের বিনোদন ও সেলিব্রেটি ---
      { question: "কিং খান নামে পরিচিত বাংলাদেশের কোন নায়ক?", options: ["A) শাকিব খান", "B) আরেফিন শুভ", "C) সিয়াম আহমেদ", "D) বাপ্পারাজ"], answer: "A", answerText: "A) শাকিব খান" },
      { question: "বিখ্যাত 'আয়নাবাজি' সিনেমার নায়ক কে?", options: ["A) মোশাররফ করিম", "B) চঞ্চল চৌধুরী", "C) জিয়াউল ফারুক অপূর্ব", "D) আফরান নিশো"], answer: "B", answerText: "B) চঞ্চল চৌধুরী" },
      { question: "বাংলাদেশের বিখ্যাত ব্যান্ড 'জেমস' এর প্রকৃত নাম কী?", options: ["A) ফারুখ মাহফুজ আনাম", "B) সাইফুর রহমান", "C) কাজী মাহফুজ", "D) আশরাফুল আলম"], answer: "A", answerText: "A) ফারুখ মাহফুজ আনাম" },
      { question: "আইয়ুব বাচ্চু কোন ব্যান্ডের লিড গিটারিস্ট ছিলেন?", options: ["A) এলআরবি (LRB)", "B) মাইলস", "C) নগর বাউল", "D) অর্থহীন"], answer: "A", answerText: "A) এলআরবি (LRB)" },
      { question: "তুফান (Tufan) সিনেমার প্রধান অভিনেতা কে?", options: ["A) শাকিব খান", "B) শরিফুল রাজ", "C) দেব", "D) আফরান নিশো"], answer: "A", answerText: "A) শাকিব খান" },
      { question: "'হাওয়া' সিনেমার বিখ্যাত 'সাদা সাদা কালা কালা' গানটির গায়ক কে?", options: ["A) এরফান মৃধা শিবলু", "B) চঞ্চল চৌধুরী", "C) ইমন চৌধুরী", "D) মেজবাউর রহমান সুমন"], answer: "A", answerText: "A) এরফান মৃধা শিবলু" },
      { question: "জনপ্রিয় নাটক 'ব্যাচেলর পয়েন্ট'-এর কাবিলা চরিত্রের অভিনেতা কে?", options: ["A) জিয়াউল হক পলাশ", "B) মিশু সাব্বির", "C) চাষী আলম", "D) মারজুক রাসেল"], answer: "A", answerText: "A) জিয়াউল হক পলাশ" },
      { question: "বাংলাদেশের 'ঢালিউড কুইন' কাকে বলা হয়?", options: ["A) পরীমনি", "B) অপু বিশ্বাস", "C) শবনম বুবলী", "D) বিদ্যা সিনহা মিম"], answer: "B", answerText: "B) অপু বিশ্বাস" },
      { question: "বিখ্যাত কৌতুকাভিনেতা 'ইত্যাদি' অনুষ্ঠানের সঞ্চালক কে?", options: ["A) হানিফ সংকেত", "B) খন্দকার ইসমাইল", "C) আব্দুন নূর তুষার", "D) আনিসুল হক"], answer: "A", answerText: "A) হানিফ সংকেত" },
      { question: "'মনপুরা' চলচ্চিত্রটির পরিচালক কে?", options: ["A) মোস্তফা সরয়ার ফারুকী", "B) গিয়াস উদ্দিন সেলিম", "C) রায়হান রাফি", "D) অমিতাভ রেজা"], answer: "B", answerText: "B) গিয়াস উদ্দিন সেলিম" },

      // --- হলিউড সিনেমা ও পপ কালচার ---
      { question: "মার্ভেল সিনেমাটিক ইউনিভার্সে 'আইরন ম্যান' চরিত্রে অভিনয় করেছেন কে?", options: ["A) ক্রিস ইভান্স", "B) রবার্ট ডাউনি জুনিয়র", "C) ক্রিস হেম্সওয়ার্থ", "D) টম হল্যান্ড"], answer: "B", answerText: "B) রবার্ট ডাউনি জুনিয়র" },
      { question: "অবতার (Avatar) সিনেমার পরিচালক কে?", options: ["A) স্টিভেন স্পিলবার্গ", "B) ক্রিস্টোফার নোলান", "C) জেমস ক্যামেরন", "D) কোয়েন্টিন টারান্টিনো"], answer: "C", answerText: "C) জেমস ক্যামেরন" },
      { question: "ডিসি কমিকসের 'সুপারম্যান' চরিত্রের আসল গ্রহের নাম কী?", options: ["A) ক্রিপ্টন", "B) অ্যাজগার্ড", "C) টাইটান", "D) জেনন"], answer: "A", answerText: "A) ক্রিপ্টন" },
      { question: "'টাইটানিক' সিনেমায় জ্যাক (Jack) চরিত্রে কে অভিনয় করেছিলেন?", options: ["A) ব্র্যাড পিট", "B) লিওনার্দো ডিক্যাপ্রিও", "C) টম ক্রুজ", "D) জনি ডেপ"], answer: "B", answerText: "B) লিওনার্দো ডিক্যাপ্রিও" },
      { question: "'পাইরেটস অব দ্য ক্যারিবিয়ান' এ ক্যাপ্টেন জ্যাক স্প্যারো চরিত্রে কে ছিলেন?", options: ["A) জনি ডেপ", "B) উইল স্মিথ", "C) ক্রিস প্র্যাট", "D) কেয়ানু রিভস"], answer: "A", answerText: "A) জনি ডেপ" },
      { question: "'ওপেনহাইমার' (Oppenheimer) সিনেমার পরিচালক কে?", options: ["A) ক্রিস্টোফার নোলান", "B) জেমস ক্যামেরন", "C) স্পিলবার্গ", "D) রিডলি স্কট"], answer: "A", answerText: "A) ক্রিস্টোফার নোলান" },
      { question: "হ্যারি পটার সিরিজের প্রধান খলনায়কের নাম কী?", options: ["A) ডাম্বলডোর", "B) লর্ড ভল্ডেমর্ট", "C) স্ন্যাপ", "D) সিডিয়াস"], answer: "B", answerText: "B) লর্ড ভল্ডেমর্ট" },
      { question: "ফাস্ট এন্ড ফিউরিয়াস সিরিজে 'ডমিনিক টোরেটো' চরিত্রে কে অভিনয় করেছেন?", options: ["A) দ্য রক", "B) বিন ডিজেল", "C) পল ওয়াকার", "D) জেসন স্টেথাম"], answer: "B", answerText: "B) বিন ডিজেল" },
      { question: "ম্যাট্রিক্স (The Matrix) সিনেমায় নিও (Neo) চরিত্রে কে অভিনয় করেন?", options: ["A) কেয়ানু রিভস", "B) টম ক্রুজ", "C) নিকোলাস কেজ", "D) ব্রুস উইকিস"], answer: "A", answerText: "A) কেয়ানু রিভস" },
      { question: "জোকার (Joker 2019) সিনেমার প্রধান অভিনেতা কে যিনি অস্কার পান?", options: ["A) হিথ লেজার", "B) হোয়াকিন ফিনিক্স", "C) জ্যারেড লেটো", "D) জ্যাক নিকোলসন"], answer: "B", answerText: "B) হোয়াকিন ফিনিক্স" },

      // --- খেলাধুলা (ফুটবল, ক্রিকেট ও অলিম্পিক) ---
      { question: "আন্তর্জাতিক ফুটবলে সর্বাধিক গোলদাতা কে?", options: ["A) লিওনেল মেসি", "B) ক্রিস্টিয়ানো রোনালদো", "C) পেলে", "D) ম্যারাডোনা"], answer: "B", answerText: "B) ক্রিস্টিয়ানো রোনালদো" },
      { question: "ফিফা বিশ্বকাপ ২০২২ জয়ী দেশ কোনটি?", options: ["A) ফ্রান্স", "B) ব্রাজিল", "C) আর্জেন্টিনা", "D) ক্রোয়েশিয়া"], answer: "C", answerText: "C) আর্জেন্টিনা" },
      { question: "ফুটবলের রাজা কাকে বলা হয়?", options: ["A) ম্যারাডোনা", "B) পেলে", "C) জিনেদিন জিদান", "D) রোনালদিনহো"], answer: "B", answerText: "B) পেলে" },
      { question: "আন্তর্জাতিক ক্রিকেটে ১০০০তম সেঞ্চুরি করা একমাত্র ব্যাটার কে?", options: ["A) বিরাট কোহলি", "B) শচীন টেন্ডুলকার", "C) রিকি পন্টিং", "D) ব্রায়ান লারা"], answer: "B", answerText: "B) শচীন টেন্ডুলকার" },
      { question: "বাংলাদেশের ক্রিকেট ইতিহাসের প্রথম টেস্ট সেঞ্চুরিয়ান কে?", options: ["A) মোহাম্মদ আশরাফুল", "B) হাবিবুল বাশার", "C) আমিনুল ইসলাম বুলবুল", "D) আকরাম খান"], answer: "C", answerText: "C) আমিনুল ইসলাম বুলবুল" },
      { question: "ক্রিকেট বিশ্বকাপের ইতিহাসে সবচেয়ে সফল দল কোনটি?", options: ["A) ভারত", "B) অস্ট্রেলিয়া", "C) ওয়েস্ট ইন্ডিজ", "D) ইংল্যান্ড"], answer: "B", answerText: "B) অস্ট্রেলিয়া" },
      { question: "এল ক্লাসিকো (El Clásico) ম্যাচ কোন দুটি দলের মধ্যে হয়?", options: ["A) বার্সেলোনা ও রিয়াল মাদ্রিদ", "B) চেলসি ও আর্সেনাল", "C) বায়ার্ন ও ডর্টমুন্ড", "D) পিএসজি ও মার্সেই"], answer: "A", answerText: "A) বার্সেলোনা ও রিয়াল মাদ্রিদ" },
      { question: "অলিম্পিক পতাকায় কয়টি রিং বা বৃত্ত থাকে?", options: ["A) ৪টি", "B) ৫টি", "C) ৬টি", "D) ৭টি"], answer: "B", answerText: "B) ৫টি" },
      { question: "মেসি কতবার ব্যালন ডি'অর (Ballon d'Or) জিতেছেন?", options: ["A) ৫ বার", "B) ৭ বার", "C) ৮ বার", "D) ৬ বার"], answer: "C", answerText: "C) ৮ বার" },
      { question: "টি-টোয়েন্টি আন্তর্জাতিক ক্রিকেটে প্রথম হ্যাট্রিক করেন কে?", options: ["A) ব্রেট লি", "B) লাসিথ মালিঙ্গা", "C) রশিদ খান", "D) সাকিব আল হাসান"], answer: "A", answerText: "A) ব্রেট লি" },

      // --- বিজ্ঞান ও প্রযুক্তি ---
      { question: "কম্পিউটারের ব্রেইন বা মস্তিষ্ক বলা হয় কাকে?", options: ["A) RAM", "B) Hard Disk", "C) CPU", "D) ROM"], answer: "C", answerText: "C) CPU" },
      { question: "সোশ্যাল মিডিয়া প্লাটফর্ম 'ফেসবুক' এর প্রতিষ্ঠাতা কে?", options: ["A) এলন মাস্ক", "B) মার্ক জাকারবার্গ", "C) বিল গেটস", "D) স্টিভ জবস"], answer: "B", answerText: "B) মার্ক জাকারবার্গ" },
      { question: "পদার্থবিজ্ঞানে মহাকর্ষ সূত্র আবিষ্কার করেন কে?", options: ["A) আলবার্ট আইনস্টাইন", "B) আইজ্যাক নিউটন", "C) গ্যালিলিও", "D) রবার্ট হুক"], answer: "B", answerText: "B) আইজ্যাক নিউটন" },
      { question: "মানবদেহে স্বাভাবিক তাপমাত্রা কত ফারেনহাইট?", options: ["A) ৯৮.৪°F", "B) ৯৭.৫°F", "C) ৯৯.০°F", "D) ৯৬.৮°F"], answer: "A", answerText: "A) ৯৮.৪°F" },
      { question: "পেনিসিলিন ওষুধটি কে আবিষ্কার করেছিলেন?", options: ["A) এডওয়ার্ড জেনার", "B) অ্যালেকজান্ডার ফ্লেমিং", "C) লুই পাস্তুর", "D) রবার্ট কোচ"], answer: "B", answerText: "B) অ্যালেকজান্ডার ফ্লেমিং" },
      { question: "প্লাস্টিক তৈরির প্রধান কাঁচামাল কোনটি?", options: ["A) প্রাকৃতিক গ্যাস", "B) পেট্রোলিয়াম", "C) কয়লা", "D) কাঠ"], answer: "B", answerText: "B) পেট্রোলিয়াম" },
      { question: "রক্তের লোহিত কনিকার আয়ুষ্কাল কতদিন?", options: ["A) ১২০ দিন", "B) ৯০ দিন", "C) ৬০ দিন", "D) ১৫০ দিন"], answer: "A", answerText: "A) ১২০ দিন" },
      { question: "সৌরজগতের সবচেয়ে বড় গ্রহ কোনটি?", options: ["A) শনি", "B) মঙ্গল", "C) বৃহস্পতি", "D) ইউরেনাস"], answer: "C", answerText: "C) বৃহস্পতি" },
      { question: "বিদ্যুৎ প্রবাহ মাপার যন্ত্রের নাম কী?", options: ["A) ব্যারোমিটার", "B) অ্যামিটার", "C) থার্মোমিটার", "D) ভোল্টমিটার"], answer: "B", answerText: "B) অ্যামিটার" },
      { question: "বিশ্বব্যাপী চ্যাট জিপিটি (ChatGPT) তৈরি করেছে কোন কোম্পানি?", options: ["A) Google", "B) OpenAI", "C) Microsoft", "D) Meta"], answer: "B", answerText: "B) OpenAI" },

      // --- ইতিহাস ও বাংলাদেশ ---
      { question: "বাংলাদেশের জাতীয় সংগীদের রচয়িতা কে?", options: ["A) কাজী নজরুল ইসলাম", "B) রবীন্দ্রনাথ ঠাকুর", "C) জীবনানন্দ দাশ", "D) জসীম উদ্দীন"], answer: "B", answerText: "B) রবীন্দ্রনাথ ঠাকুর" },
      { question: "বাংলাদেশের স্বাধীনতা দিবস কবে?", options: ["A) ১৬ ডিসেম্বর", "B) ২৬ মার্চ", "C) ২১ ফেব্রুয়ারি", "D) ১৪ এপ্রিল"], answer: "B", answerText: "B) ২৬ মার্চ" },
      { question: "পদ্মা সেতুর দৈর্ঘ্য কত কিলোমিটার?", options: ["A) ৫.১৫ কিমি", "B) ৬.১৫ কিমি", "C) ৭.২ কিমি", "D) ৮.১ কিমি"], answer: "B", answerText: "B) ৬.১৫ কিমি" },
      { question: "বাংলাদেশের জাতীয় পশু কোনটি?", options: ["A) এশীয় হাতি", "B) রয়্যাল বেঙ্গল টাইগার", "C) চিত্রা হরিণ", "D) সিংহ"], answer: "B", answerText: "B) রয়্যাল বেঙ্গল টাইগার" },
      { question: "মুজিবনগর সরকার কত তারিখে শপথ গ্রহণ করে?", options: ["A) ১০ এপ্রিল ১৯৭১", "B) ১৭ এপ্রিল ১৯৭১", "C) ২৬ মার্চ ১৯৭১", "D) ১৬ ডিসেম্বর ১৯৭১"], answer: "B", answerText: "B) ১৭ এপ্রিল ১৯৭১" },
      { question: "বাংলাদেশের জাতীয় প্রতীক কোনটি?", options: ["A) শাপলা", "B) উড়ন্ত দোয়েল", "C) ধান ও পাট", "D) উভয়ই"], answer: "A", answerText: "A) শাপলা" },
      { question: "বাংলাদেশের বৃহত্তম জেলা কোনটি?", options: ["A) চট্টগ্রাম", "B) রাঙ্গামাটি", "C) ময়মনসিংহ", "D) সিলেট"], answer: "B", answerText: "B) রাঙ্গামাটি" },
      { question: "বাংলাদেশের জাতীয় কবি কে?", options: ["A) জসীম উদ্দীন", "B) কাজী নজরুল ইসলাম", "C) শামসুর রাহমান", "D) সুফিয়া কামাল"], answer: "B", answerText: "B) কাজী নজরুল ইসলাম" },
      { question: "সুন্দরবনকে বিশ্ব ঐতিহ্য ঘোষণা করে কোন সংস্থা?", options: ["A) UNICEF", "B) UNESCO", "C) WHO", "D) FAO"], answer: "B", answerText: "B) UNESCO" },
      { question: "মুক্তিযুদ্ধের সময় বাংলাদেশকে কয়টি সেক্টরে ভাগ করা হয়?", options: ["A) ৮টি", "B) ১০টি", "C) ১১টি", "D) ৬টি"], answer: "C", answerText: "C) ১১টি" },

      // --- সাহিত্য ও সাধারণ জ্ঞান ---
      { question: "গীতাঞ্জলি কাব্যের জন্য নোবেল পুরস্কার পান কে?", options: ["A) রবীন্দ্রনাথ ঠাকুর", "B) মাইকেল মধুসূদন", "C) শরৎচন্দ্র চট্টোপাধ্যায়", "D) বঙ্কিমচন্দ্র"], answer: "A", answerText: "A) রবীন্দ্রনাথ ঠাকুর" },
      { question: "বাংলা ভাষার প্রথম ব্যাকরণ রচনা করেন কে?", options: ["A) মনুয়েল দা আস্সুম্পসাঁউ", "B) উইলিয়াম কেরি", "C) রামমোহন রায়", "D) ড. মুহম্মদ শহীদুল্লাহ"], answer: "A", answerText: "A) মনুয়েল দা আস্সুম্পসাঁউ" },
      { question: "'বিষাদ সিন্ধু' উপন্যাসটি কার লেখা?", options: ["A) মীর মশাররফ হোসেন", "B) কাজী নজরুল ইসলাম", "C) জহির রায়হান", "D) কাজী আনোয়ার হোসেন"], answer: "A", answerText: "A) মীর মশাররফ হোসেন" },
      { question: "হ্যারি পটার বই সিরিজের লেখিকা কে?", options: ["A) জে. কে. রাউলিং", "B) আগাথা ক্রিস্টি", "C) স্টিফেন কিং", "D) ভার্জিনিয়া উলফ"], answer: "A", answerText: "A) জে. কে. রাউলিং" },
      { question: "বিশ্বের প্রথম টেক্সট মেসেজ (SMS) পাঠানো হয় কত সালে?", options: ["A) ১৯৯২", "B) ১৯৯০", "C) ১৯৯৫", "D) ১৯৮৮"], answer: "A", answerText: "A) ১৯৯২" },
      { question: "ভিটামিন 'সি' এর অভাবে কোন রোগ হয়?", options: ["A) রাতকানা", "B) রিকেটস", "C) স্কার্ভি", "D) রক্তশূন্যতা"], answer: "C", answerText: "C) স্কার্ভি" },
      { question: "পৃথিবীর সবচেয়ে দ্রুতগামী স্থলচর প্রাণী কোনটি?", options: ["A) চিতাবাঘ", "B) সিংহ", "C) ঘোড়া", "D) হরিণ"], answer: "A", answerText: "A) চিতাবাঘ" },
      { question: "কোন গ্যাস বেলুনে ভরলে বেলুন আকাশে ওড়ে?", options: ["A) অক্সিজেন", "B) নাইট্রোজেন", "C) হিলিয়াম", "D) কার্বন ডাই অক্সাইড"], answer: "C", answerText: "C) হিলিয়াম" },
      { question: "মানবদেহে মোট হাড়ের সংখ্যা কতটি?", options: ["A) ২০৬টি", "B) ৩০৬টি", "C) ১৫০টি", "D) ২৫০টি"], answer: "A", answerText: "A) ২০৬টি" },
      { question: "বিশ্ব পরিবেশ দিবস কবে পালন করা হয়?", options: ["A) ৫ জুন", "B) ১৫ আগস্ট", "C) ১ মে", "D) ১০ ডিসেম্বর"], answer: "A", answerText: "A) ৫ জুন" },

      // --- পপ কালচার ও বিনোদন মিশ্রণ ---
      { question: "'দ্য গডফাদার' (The Godfather) সিনেমার মূল পরিচালক কে?", options: ["A) ফ্রান্সিস ফোর্ড কপোলা", "B) স্পিলবার্গ", "C) নোলান", "D) আলফ্রেড হিচকক"], answer: "A", answerText: "A) ফ্রান্সিস ফোর্ড কপোলা" },
      { question: "বাংলাদেশের প্রথম রঙিন চলচ্চিত্র কোনটি?", options: ["A) মুখ ও মুখোশ", "B) সঙ্গম", "C) জীবন থেকে নেয়া", "D) তিতাস একটি নদীর নাম"], answer: "B", answerText: "B) সঙ্গম" },
      { question: "গুগল (Google) এর বর্তমান সিইও (CEO) কে?", options: ["A) সত্য নাদেলা", "B) সুন্দর পিচাই", "C) পরাগ আগরওয়াল", "D) টিউক কুক"], answer: "B", answerText: "B) সুন্দর পিচাই" },
      { question: "ক্রিকেট খেলায় স্টাম্পের উচ্চতা কত ইঞ্চি?", options: ["A) ২৮ ইঞ্চি", "B) ৩০ ইঞ্চি", "C) ২৬ ইঞ্চি", "D) ৩২ ইঞ্চি"], answer: "A", answerText: "A) ২৮ ইঞ্চি" },
      { question: "বিশ্বের বৃহত্তম থিম পার্ক 'ডিশনিল্যান্ড' কোথায় অবস্থিত?", options: ["A) টোকিও", "B) ক্যালিফোর্নিয়া, যুক্তরাষ্ট্র", "C) প্যারিস", "D) সাংহাই"], answer: "B", answerText: "B) ক্যালিফোর্নিয়া, যুক্তরাষ্ট্র" },
      { question: "ইউটিউব (YouTube) কত সালে চালু হয়?", options: ["A) ২০০৩", "B) ২০০৫", "C) ২০০৭", "D) ২০১০"], answer: "B", answerText: "B) ২০০৫" },
      { question: "'ফ্ল্যাপি বার্ড' গেমটির মূল নির্মাতা কোন দেশের?", options: ["A) জাপান", "B) ভিয়েতনাম", "C) চীন", "D) কোরিয়া"], answer: "B", answerText: "B) ভিয়েতনাম" },
      { question: "ডব্লিউ ডব্লিউ ই (WWE) এর 'দ্য ডেডম্যান' কাকে বলা হয়?", options: ["A) দ্য রক", "B) আন্ডারটেকার", "C) জন সিনা", "D) ট্রিপল এইচ"], answer: "B", answerText: "B) আন্ডারটেকার" },
      { question: "মার্ভেল কমিকসের সহ-প্রতিষ্ঠাতা কে যিনি মার্ভেল হিরো তৈরি করেছিলেন?", options: ["A) স্ট্যান লি", "B) জ্যাক কার্বি", "C) স্টিভ ডিটকো", "D) কেভিন ফেগি"], answer: "A", answerText: "A) স্ট্যান লি" },
      { question: "হলিউডের সবচেয়ে ব্যয়বহুল অ্যাকশন ফ্র্যাঞ্চাইজি কোনটি?", options: ["A) অ্যাভেঞ্জার্স", "B) ফাস্ট অ্যান্ড ফিউরিয়াস", "C) মিশন ইম্পসিবল", "D) জেমস বন্ড"], answer: "A", answerText: "A) অ্যাভেঞ্জার্স" },
   ];

    if (!questions || questions.length === 0) {
      return message.reply("❌ | Question bank is empty!");
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    const msg = `✨ [▪️] <b>QUIZ CHALLENGE!</b>\n\n` +
                `❖ ${randomQuestion.question}\n` +
                `──────────────────\n` +
                `${randomQuestion.options.join("\n")}\n` +
                `──────────────────\n` +
                `👉 Reply to this message with A, B, C, or D to answer!`;

    return message.reply(msg, (err, info) => {
      if (err) return;
      
      global.GoatBot.onReply.set(info.messageID, {
        commandName: commandName,
        messageID: info.messageID,
        author: event.senderID,
        correctAnswer: randomQuestion.answer,
        answerText: randomQuestion.answerText
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    const { author, correctAnswer, answerText } = Reply;
    const { senderID, body } = event;

    if (senderID !== author) return;

    const userAnswer = body.trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(userAnswer)) {
      return message.reply("❌ | Please reply with only A, B, C, or D!");
    }

    global.GoatBot.onReply.delete(Reply.messageID);

    const rewardCoins = 1000000; // 1 Million coins

    if (userAnswer === correctAnswer) {
      // 1. ডাটাবেস থেকে ইউজারের ডাটা ফেচ করা
      let userData = await usersData.get(senderID);
      
      // 2. বর্তমান টাকা বের করা (যদি না থাকে তবে ০ বা ডিফল্ট ধরা)
      let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);
      let newBalance = currentMoney + rewardCoins;

      // 3. ডাটাবেসে মেইন স্ট্রাকচার এবং ডাটা অবজেক্ট দুটোতেই আপডেট করা
      userData.money = newBalance;
      if (!userData.data) userData.data = {};
      userData.data.money = newBalance;

      // 4. ডাটাবেসে স্থায়ীভাবে সেভ করা
      await usersData.set(senderID, userData);

      return message.reply(
        `🎉 | Awesome! Correct answer!\n` +
        `💰 | $1,000,000 coins added! Current balance: $${newBalance.toLocaleString()}`
      );
    } else {
      return message.reply(
        `❌ | Incorrect answer!\n\n` +
        `💡 Correct answer was: 👉 ${answerText}`
      );
    }
  }
};
