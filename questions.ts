export interface QuestionItem {
  id: number;
  letter: string;
  ruleEs: string;
  ruleHy: string;
  questionEs: string;
  questionHy: string;
  answerEs: string;
  answerHy: string;
  acceptableAnswers: string[];
}

export const QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    letter: 'A',
    ruleEs: 'Empieza por la A',
    ruleHy: 'Սկսվում է A-ով',
    questionEs: '¿Qué persona viaja al espacio?',
    questionHy: 'Ո՞վ է ճանապարհորդում տիեզերքում։',
    answerEs: 'Astronauta',
    answerHy: 'տիեզերագնաց',
    acceptableAnswers: ['astronauta', 'cosmonauta']
  },
  {
    id: 2,
    letter: 'B',
    ruleEs: 'Empieza por la B',
    ruleHy: 'Սկսվում է B-ով',
    questionEs: '¿Qué profesional apaga incendios?',
    questionHy: 'Ո՞ր մասնագետն է հրդեհներ մարում։',
    answerEs: 'Bombero',
    answerHy: 'հրշեջ',
    acceptableAnswers: ['bombero', 'bombera']
  },
  {
    id: 3,
    letter: 'C',
    ruleEs: 'Empieza por la C',
    ruleHy: 'Սկսվում է C-ով',
    questionEs: '¿Qué utensilio usamos para comer sopa?',
    questionHy: 'Ի՞նչ սպասք ենք օգտագործում ապուր ուտելու համար։',
    answerEs: 'Cuchara',
    answerHy: 'գդալ',
    acceptableAnswers: ['cuchara', 'la cuchara']
  },
  {
    id: 4,
    letter: 'D',
    ruleEs: 'Empieza por la D',
    ruleHy: 'Սկսվում է D-ով',
    questionEs: '¿Qué animal marino es un mamífero y suele saltar fuera del agua?',
    questionHy: 'Ո՞ր ծովային կաթնասունն է հաճախ դուրս ցատկում ջրից։',
    answerEs: 'Delfín',
    answerHy: 'դելֆին',
    acceptableAnswers: ['delfin', 'delfín', 'el delfin', 'el delfín']
  },
  {
    id: 5,
    letter: 'E',
    ruleEs: 'Empieza por la E',
    ruleHy: 'Սկսվում է E-ով',
    questionEs: '¿Qué usamos para subir de un piso a otro a pie?',
    questionHy: 'Ինչո՞վ ենք ոտքով բարձրանում մի հարկից մյուսը։',
    answerEs: 'Escalera',
    answerHy: 'աստիճանավանդակ',
    acceptableAnswers: ['escalera', 'escaleras', 'la escalera']
  },
  {
    id: 6,
    letter: 'F',
    ruleEs: 'Empieza por la F',
    ruleHy: 'Սկսվում է F-ով',
    questionEs: '¿Qué estructura de la costa emite luz para guiar a los barcos?',
    questionHy: 'Ափին գտնվող ո՞ր կառույցն է լույսով ճանապարհ ցույց տալիս նավերին։',
    answerEs: 'Faro',
    answerHy: 'փարոս',
    acceptableAnswers: ['faro', 'el faro']
  },
  {
    id: 7,
    letter: 'G',
    ruleEs: 'Empieza por la G',
    ruleHy: 'Սկսվում է G-ով',
    questionEs: '¿Qué prenda nos ponemos en las manos cuando hace frío?',
    questionHy: 'Ի՞նչ ենք հագնում ձեռքերին, երբ ցուրտ է։',
    answerEs: 'Guantes',
    answerHy: 'ձեռնոցներ',
    acceptableAnswers: ['guantes', 'guante', 'los guantes']
  },
  {
    id: 8,
    letter: 'H',
    ruleEs: 'Empieza por la H',
    ruleHy: 'Սկսվում է H-ով',
    questionEs: '¿Qué insecto pequeño vive en colonias y suele transportar comida en fila?',
    questionHy: 'Ո՞ր փոքր միջատն է ապրում գաղութներով և հաճախ շարքով սնունդ տեղափոխում։',
    answerEs: 'Hormiga',
    answerHy: 'մրջյուն',
    acceptableAnswers: ['hormiga', 'las hormigas', 'hormigas', 'la hormiga']
  },
  {
    id: 9,
    letter: 'I',
    ruleEs: 'Empieza por la I',
    ruleHy: 'Սկսվում է I-ով',
    questionEs: '¿Cómo se llama la estación del año que viene después del otoño?',
    questionHy: 'Ինչպե՞ս է կոչվում աշնանը հաջորդող տարվա եղանակը։',
    answerEs: 'Invierno',
    answerHy: 'ձմեռ',
    acceptableAnswers: ['invierno', 'el invierno']
  },
  {
    id: 10,
    letter: 'J',
    ruleEs: 'Empieza por la J',
    ruleHy: 'Սկսվում է J-ով',
    questionEs: '¿En qué lugar de una casa cultivamos flores y otras plantas al aire libre?',
    questionHy: 'Տան ո՞ր բացօթյա տարածքում ենք ծաղիկներ և այլ բույսեր աճեցնում։',
    answerEs: 'Jardín',
    answerHy: 'պարտեզ',
    acceptableAnswers: ['jardin', 'jardín', 'el jardin', 'el jardín']
  },
  {
    id: 11,
    letter: 'K',
    ruleEs: 'Empieza por la K',
    ruleHy: 'Սկսվում է K-ով',
    questionEs: '¿Qué fruta tiene la piel marrón, la pulpa verde y pequeñas semillas negras?',
    questionHy: 'Ո՞ր միրգն ունի շագանակագույն կեղև, կանաչ միջուկ և փոքրիկ սև սերմեր։',
    answerEs: 'Kiwi',
    answerHy: 'կիվի',
    acceptableAnswers: ['kiwi', 'el kiwi']
  },
  {
    id: 12,
    letter: 'L',
    ruleEs: 'Empieza por la L',
    ruleHy: 'Սկսվում է L-ով',
    questionEs: '¿Qué objeto portátil funciona con pilas y sirve para iluminar en la oscuridad?',
    questionHy: 'Ո՞ր շարժական առարկան է աշխատում մարտկոցներով և լուսավորում մթության մեջ։',
    answerEs: 'Linterna',
    answerHy: 'լապտեր',
    acceptableAnswers: ['linterna', 'la linterna']
  },
  {
    id: 13,
    letter: 'M',
    ruleEs: 'Empieza por la M',
    ruleHy: 'Սկսվում է M-ով',
    questionEs: '¿Qué objeto usamos para llevar ropa cuando viajamos?',
    questionHy: 'Ի՞նչ ենք օգտագործում ճանապարհորդելիս հագուստը տեղափոխելու համար։',
    answerEs: 'Maleta',
    answerHy: 'ճամպրուկ',
    acceptableAnswers: ['maleta', 'la maleta', 'valija', 'maletín', 'maletin']
  },
  {
    id: 14,
    letter: 'N',
    ruleEs: 'Empieza por la N',
    ruleHy: 'Սկսվում է N-ով',
    questionEs: '¿Qué cae del cielo en forma de copos blancos cuando hace mucho frío?',
    questionHy: 'Ի՞նչ է ընկնում երկնքից սպիտակ փաթիլներով, երբ շատ ցուրտ է։',
    answerEs: 'Nieve',
    answerHy: 'ձյուն',
    acceptableAnswers: ['nieve', 'la nieve']
  },
  {
    id: 15,
    letter: 'Ñ',
    ruleEs: 'Contiene la Ñ',
    ruleHy: 'Պարունակում է Ñ',
    questionEs: '¿Qué fruta tropical tiene una corona de hojas y una piel dura?',
    questionHy: 'Ո՞ր արևադարձային միրգն ունի տերևներից կազմված պսակ և կոշտ կեղև։',
    answerEs: 'Piña',
    answerHy: 'արքայախնձոր',
    acceptableAnswers: ['pina', 'piña', 'la pina', 'la piña', 'ananá', 'anana']
  },
  {
    id: 16,
    letter: 'O',
    ruleEs: 'Empieza por la O',
    ruleHy: 'Սկսվում է O-ով',
    questionEs: '¿Qué animal grande puede ser pardo o polar?',
    questionHy: 'Ո՞ր մեծ կենդանին կարող է լինել գորշ կամ սպիտակ՝ բևեռային։',
    answerEs: 'Oso',
    answerHy: 'արջ',
    acceptableAnswers: ['oso', 'el oso']
  },
  {
    id: 17,
    letter: 'P',
    ruleEs: 'Empieza por la P',
    ruleHy: 'Սկսվում է P-ով',
    questionEs: '¿Qué ave no vuela y vive principalmente en el hemisferio sur?',
    questionHy: 'Ո՞ր թռչունը չի թռչում և հիմնականում ապրում է հարավային կիսագնդում։',
    answerEs: 'Pingüino',
    answerHy: 'պինգվին',
    acceptableAnswers: ['pinguino', 'pingüino', 'el pinguino', 'el pingüino']
  },
  {
    id: 18,
    letter: 'Q',
    ruleEs: 'Empieza por la Q',
    ruleHy: 'Սկսվում է Q-ով',
    questionEs: '¿Qué verbo significa sentir amor por alguien?',
    questionHy: 'Ո՞ր բայն է նշանակում որևէ մեկի հանդեպ սեր զգալ։',
    answerEs: 'Querer',
    answerHy: 'սիրել',
    acceptableAnswers: ['querer', 'amar']
  },
  {
    id: 19,
    letter: 'R',
    ruleEs: 'Empieza por la R',
    ruleHy: 'Սկսվում է R-ով',
    questionEs: '¿Qué objeto sirve para saber qué hora es?',
    questionHy: 'Ո՞ր առարկան է օգնում իմանալ, թե ժամը քանիսն է։',
    answerEs: 'Reloj',
    answerHy: 'ժամացույց',
    acceptableAnswers: ['reloj', 'el reloj']
  },
  {
    id: 20,
    letter: 'S',
    ruleEs: 'Empieza por la S',
    ruleHy: 'Սկսվում է S-ով',
    questionEs: '¿Qué astro tiene anillos y es el sexto planeta desde el Sol?',
    questionHy: 'Ո՞ր մոլորակն ունի օղակներ և Արեգակից հաշված վեցերորդն է։',
    answerEs: 'Saturno',
    answerHy: 'Սատուրն',
    acceptableAnswers: ['saturno']
  },
  {
    id: 21,
    letter: 'T',
    ruleEs: 'Empieza por la T',
    ruleHy: 'Սկսվում է T-ով',
    questionEs: '¿Qué instrumento utilizamos para medir la temperatura?',
    questionHy: 'Ո՞ր գործիքով ենք չափում ջերմաստիճանը։',
    answerEs: 'Termómetro',
    answerHy: 'ջերմաչափ',
    acceptableAnswers: ['termometro', 'termómetro', 'el termometro', 'el termómetro']
  },
  {
    id: 22,
    letter: 'U',
    ruleEs: 'Empieza por la U',
    ruleHy: 'Սկսվում է U-ով',
    questionEs: '¿Qué fruta crece en racimos y se utiliza para hacer vino?',
    questionHy: 'Ո՞ր միրգն է աճում ողկույզներով և օգտագործվում գինի պատրաստելու համար։',
    answerEs: 'Uva',
    answerHy: 'խաղող',
    acceptableAnswers: ['uva', 'uvas', 'la uva', 'las uvas']
  },
  {
    id: 23,
    letter: 'V',
    ruleEs: 'Empieza por la V',
    ruleHy: 'Սկսվում է V-ով',
    questionEs: '¿Qué recipiente usamos normalmente para beber agua?',
    questionHy: 'Ի՞նչ տարայով ենք սովորաբար ջուր խմում։',
    answerEs: 'Vaso',
    answerHy: 'բաժակ',
    acceptableAnswers: ['vaso', 'el vaso']
  },
  {
    id: 24,
    letter: 'W',
    ruleEs: 'Contiene la W',
    ruleHy: 'Պարունակում է W',
    questionEs: '¿Qué fruta tiene la piel marrón y peluda y suele ser verde por dentro?',
    questionHy: 'Ո՞ր միրգն ունի շագանակագույն մազոտ կեղև և ներսից սովորաբար կանաչ է։',
    answerEs: 'Kiwi',
    answerHy: 'կիվի',
    acceptableAnswers: ['kiwi', 'el kiwi']
  },
  {
    id: 25,
    letter: 'X',
    ruleEs: 'Contiene la X',
    ruleHy: 'Պարունակում է X',
    questionEs: '¿Qué gas del aire necesitamos para respirar?',
    questionHy: 'Օդում պարունակվող ո՞ր գազն է անհրաժեշտ մեզ շնչելու համար։',
    answerEs: 'Oxígeno',
    answerHy: 'թթվածին',
    acceptableAnswers: ['oxigeno', 'oxígeno', 'el oxigeno', 'el oxígeno']
  },
  {
    id: 26,
    letter: 'Y',
    ruleEs: 'Empieza por la Y',
    ruleHy: 'Սկսվում է Y-ով',
    questionEs: '¿Qué alimento lácteo fermentado solemos comer con una cuchara?',
    questionHy: 'Կաթից պատրաստված ո՞ր թթվեցրած մթերքն ենք սովորաբար ուտում գդալով։',
    answerEs: 'Yogur',
    answerHy: 'յոգուրտ',
    acceptableAnswers: ['yogur', 'yogurt', 'el yogur', 'el yogurt']
  },
  {
    id: 27,
    letter: 'Z',
    ruleEs: 'Empieza por la Z',
    ruleHy: 'Սկսվում է Z-ով',
    questionEs: '¿Qué nos ponemos en los pies para caminar por la calle?',
    questionHy: 'Ի՞նչ ենք հագնում ոտքերին՝ փողոցում քայլելու համար։',
    answerEs: 'Zapatos',
    answerHy: 'կոշիկներ',
    acceptableAnswers: ['zapatos', 'zapato', 'los zapatos']
  }
];

export function normalizeSpanish(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents: á -> a, é -> e, etc.
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?¿!¡]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkAnswer(userInput: string, question: QuestionItem): boolean {
  const normalizedUser = normalizeSpanish(userInput);
  if (!normalizedUser) return false;

  const normalizedCorrect = normalizeSpanish(question.answerEs);
  if (normalizedUser === normalizedCorrect) return true;

  // Check acceptable answers
  return question.acceptableAnswers.some(ans => normalizeSpanish(ans) === normalizedUser);
}
