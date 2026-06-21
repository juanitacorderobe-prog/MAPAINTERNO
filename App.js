import { useState } from "react";

const COLORS = {
  bg: "#FAF6F0",
  card: "#FFFFFF",
  text: "#2C1810",
  textLight: "#7A6055",
  accent: "#C4622D",
  accentLight: "#F0E6DF",
  green: "#7A9E7E",
  greenLight: "#EBF2EC",
  border: "#E8DDD4",
};

// ⚠️ PASO PENDIENTE: pegar acá la URL de tu Google Apps Script (Web App)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzAgkV4i2aFOYfYPu9viEYFYTqHtOMBhVIvcK4JN9ajfiJt1gHmoe3cbr7TdFzuTiiqUw/exec";

const sections = [
  { id: "datos", label: "Tus datos", emoji: "✨" },
  { id: "cuerpo", label: "Tu cuerpo", emoji: "🌿" },
  { id: "hormonal", label: "Perfil hormonal", emoji: "🔥" },
  { id: "china", label: "Medicina China", emoji: "🌊" },
  { id: "arquetipo", label: "Tu naturaleza", emoji: "🦅" },
  { id: "cierre", label: "El cierre", emoji: "🗺️" },
];

const questions = {
  datos: [
    { id: "nombre", label: "¿Cómo te llamás?", type: "text", placeholder: "Tu nombre" },
    { id: "mail", label: "¿Cuál es tu mail?", type: "email", placeholder: "tu@mail.com" },
    { id: "edad", label: "¿Cuántos años tenés?", type: "number", placeholder: "Tu edad" },
    { id: "momento", label: "¿En qué momento vital estás?", type: "single", options: ["Edad fértil", "Perimenopausia", "Menopausia", "No sé / no me identifico con ninguno"] },
  ],
  cuerpo: [
    { id: "pelo", label: "¿Cómo está tu pelo?", type: "multi", options: ["Se me cae más de lo habitual", "Está seco o sin brillo", "Está bien"] },
    { id: "unas", label: "¿Cómo están tus uñas?", type: "multi", options: ["Se quiebran fácil", "Corrugadas o con manchitas", "Están bien"] },
    { id: "evacuaciones", label: "¿Cómo son tus evacuaciones?", type: "multi", options: ["Todos los días sin problema", "Irregular, un día sí un día no", "Me cuesta o voy cada varios días"] },
    { id: "inflamacion", label: "¿Sentís inflamación abdominal?", type: "multi", options: ["Casi siempre", "Solo con ciertos alimentos", "Solo antes de la menstruación", "No"] },
    { id: "memoria", label: "¿Cómo está tu memoria y concentración?", type: "multi", options: ["Me cuesta las dos", "Solo la memoria", "Solo la concentración", "Estoy bien"] },
    { id: "bruxismo", label: "¿Apretás los dientes o tenés bruxismo?", type: "multi", options: ["Sí", "Me lo dijeron pero no lo noto", "No"] },
    { id: "emociones_mes", label: "¿Cómo son tus emociones a lo largo del mes?", type: "multi", options: ["Picos de inestabilidad ligados al ciclo", "Inestabilidad sostenida todo el mes", "Estable salvo en situaciones de estrés", "Bastante estable"] },
    { id: "alergias", label: "¿Tenés alergias o picazón en la piel?", type: "multi", options: ["Alergias frecuentes", "Picazón, sobre todo de noche", "Ambas", "A veces", "No"] },
    { id: "inmune", label: "¿Cómo es tu sistema inmune?", type: "multi", options: ["Me enfermo seguido (resfríos, anginas, infecciones)", "Tengo dolores articulares o musculares frecuentes sin causa clara", "Tardo mucho en recuperarme cuando me enfermo", "Tengo procesos inflamatorios diagnosticados (autoinmune, articular, intestinal)", "Mi sistema inmune funciona bien"] },
    { id: "permeabilidad", label: "¿Te pasa algo de esto con tu peso o tu digestión?", type: "multi", options: ["Quiero bajar de peso y no logro resultados aunque me cuide", "Hinchazón abdominal después de casi cualquier comida", "Reacciono mal a alimentos que antes toleraba bien", "Niebla mental después de comer", "Nada de esto me pasa"] },
  ],
  hormonal: [
    { id: "acumulacion", label: "¿Dónde sentís que tu cuerpo acumula más grasa?", type: "multi", options: ["Caderas y piernas", "Abdomen", "Brazos", "Por todo el cuerpo de forma pareja", "No noto acumulación particular"] },
    { id: "frio", label: "¿Cómo te relacionás con el frío?", type: "multi", options: ["Muy friolenta, siempre tengo frío", "Normal, no lo noto especialmente", "Me da más calor que frío"] },
    { id: "premenstrual", label: "¿Cómo vivís los días previos a tu menstruación?", type: "multi", options: ["Hinchazón en mamas y mucho cambio de humor", "Muy cansada, sin energía", "Ansiosa o irritable", "Sin mayores cambios"] },
    { id: "estres", label: "¿Cómo es tu relación con el estrés?", type: "multi", options: ["Me llevo al límite, necesito cumplir expectativas ajenas", "Vivo en estrés sostenido y no puedo desconectarme, mi mente rumiando 24/7", "Solo en momentos puntuales", "Lo manejo bastante bien"] },
    { id: "deseo", label: "¿Cómo está tu deseo sexual?", type: "multi", options: ["Presente y frecuente", "Varía mucho según el momento del ciclo", "Bajo o casi ausente", "Siento que me desconecté de eso"] },
    { id: "menstruacion", label: "¿Cómo son tus menstruaciones?", type: "multi", options: ["Abundante con coágulos", "Sangre oscura", "Irregular o escasa", "Dolorosa", "Sin mayores molestias"] },
    { id: "identidad", label: "¿Con cuál de estas frases te identificás más?", type: "multi", options: [
      "Me gusta liderar, destacarme y aprendo con obsesión, siempre hay algo nuevo que quiero saber",
      "Soy competitiva, me cuesta bajar el ritmo y necesito ganar",
      "Soy adicta al trabajo, me cuesta relajarme y siento que siempre tengo que producir",
      "Noto vello en zonas poco habituales como mentón, ombligo o pezones",
      "Soy muy sensible a los climas emocionales de mi entorno, absorbo lo que sienten los demás",
      "Tengo pensamientos múltiples o varias voces internas dialogando a la vez",
      "Mi cuerpo se mueve antes de que mi cabeza piense, actúo en imágenes más que en palabras",
      "Ninguna especialmente",
    ]},
  ],
  china: [
    { id: "emocion_frecuente", label: "¿Con qué emoción te encontrás más seguido últimamente?", type: "multi", options: [
      "Irritación, frustración o enojo que no siempre puedo expresar",
      "Miedo, inseguridad o sensación de no tener piso",
      "Tristeza, melancolía o dificultad para soltar",
      "Ansiedad, preocupación o la cabeza que no para",
      "Sobreexcitación o agitación interna que me cuesta bajar",
    ]},
    { id: "sueno_horario", label: "¿Cómo es tu sueño?", type: "multi", options: [
      "Me cuesta dormirme antes de la medianoche",
      "Me despierto entre 1 y 3 de la madrugada",
      "Me desvelo entre 3 y 5 de la mañana",
      "Me levanto muy temprano sin querer, antes de las 7",
      "Duermo de un tirón pero me levanto cansada",
      "Mi descanso es profundo y reparador",
    ]},
    { id: "soltar", label: "¿Cómo es tu relación con el soltar?", type: "multi", options: ["Me cuesta mucho, tiendo a retener emociones, vínculos y situaciones", "Suelto fácil, a veces demasiado", "Depende del momento", "Soltar no me genera conflicto"] },
    { id: "miedo", label: "¿El miedo juega un rol importante en tu vida cotidiana?", type: "multi", options: ["Sí, hay un miedo de fondo que no siempre puedo nombrar", "Solo ante situaciones concretas", "No, no es una emoción que me domine"] },
    { id: "energia_dia", label: "¿Cómo está tu energía a lo largo del día?", type: "multi", options: ["Bien a la mañana y caigo a la tarde", "Arranco lento y recién agarro vuelo al mediodía", "En montaña rusa — momentos de mucha energía y caídas bruscas", "Baja todo el día", "Bastante pareja y sostenida"] },
  ],
  arquetipo: [
    { id: "energia_natural", label: "¿Adónde va tu energía naturalmente?", type: "multi", options: [
      "A resolver cosas, moverme, construir, conquistar",
      "A los vínculos, las emociones, percibir el mundo",
      "A cuidar y estar presente para los demás",
      "A aprender, explorar ideas nuevas, crear",
      "A anticipar, analizar, prevenir problemas",
    ]},
    { id: "desafios", label: "¿Cómo reaccionás ante los desafíos?", type: "multi", options: [
      "Los enfrento directo, me activan",
      "Los siento profundamente antes de actuar",
      "Pienso en cómo sostener a los demás mientras los atravieso",
      "Me dan curiosidad y busco entenderlos",
      "Los anticipo tanto que a veces me paralizo",
    ]},
    { id: "vinculo_descanso", label: "¿Cómo es tu vínculo con el descanso?", type: "multi", options: [
      "Me cuesta parar, siento que siempre hay algo que hacer",
      "Siento que necesito ganarme el descanso para poder disfrutarlo",
      "No puedo descansar, tengo que ocuparme de otras cosas (familia, trabajo, casa)",
      "No necesito descansar, prefiero estar siendo productiva",
      "Descanso bárbaro, no me genera conflicto",
    ]},
    { id: "calidad_descanso", label: "¿Cómo es tu descanso cuando lográs dormir?", type: "multi", options: ["Profundo y reparador", "Duermo pero me levanto cansada", "Liviano, cualquier cosa me despierta", "Variable, hay noches buenas y noches malas"] },
    { id: "sexo", label: "¿Cómo te relacionás con el sexo?", type: "multi", options: [
      "Lo busco directo cuando lo siento",
      "Necesito conexión emocional o un clima especial primero",
      "Me resulta más fácil dar placer que recibirlo",
      "Me atrae lo nuevo, lo desconocido, lo que me sorprende",
      "Me cuesta conectar con el deseo, algo lo inhibe o lo bloquea",
    ]},
    { id: "ocio", label: "¿Podés disfrutar de los momentos de ocio?", type: "multi", options: [
      "Sí, sin problemas, puedo conectar con el momento presente",
      "Más o menos, puedo estar en una juntada con personas pero desconectada",
      "Voy a lugares por compromiso",
      "No logro disfrutar",
    ]},
    { id: "agotamiento", label: "¿Qué te genera más agotamiento?", type: "multi", options: [
      "No tener nada que resolver o conquistar",
      "Estar rodeada de personas que no me comprenden emocionalmente",
      "No poder cuidar o ayudar a quien quiero",
      "La rutina, la repetición, lo predecible",
      "La incertidumbre y lo que no puedo controlar",
    ]},
  ],
  cierre: [
    { id: "vinculo_cercano", label: "¿Cómo te describís en un vínculo cercano?", type: "multi", options: [
      "Intensa, apasionada, a veces explosiva",
      "Sensible, empática, me afecta mucho lo del otro",
      "Contenedora, siempre disponible, a veces me olvido de mí",
      "Curiosa, estimulante, necesito espacio y novedad",
      "Leal, precavida, necesito confianza antes de abrirme",
    ]},
    { id: "sintomas_preocupan", label: "¿Qué síntomas físicos te preocupan más?", type: "multi", options: ["Fatiga o falta de energía", "Digestión o inflamación", "Ciclo menstrual o síntomas hormonales", "Sueño", "Piel, pelo o uñas", "Estado de ánimo o ansiedad"] },
    { id: "por_que_aqui", label: "¿Qué te trajo hasta acá?", type: "multi", options: [
      "Síntomas físicos que quiero entender",
      "Quiero conocerme más a fondo",
      "Estoy en un momento de cambio y busco orientación",
      "Me llegó por una recomendación y tenía curiosidad",
      "Todo junto",
    ]},
  ],
};

const archetypes = {
  guerrera: { name: "La Guerrera", emoji: "⚔️",
    desc: "Tu energía va hacia la acción, el movimiento y la conquista. Eso tiene una biología, andrógenos y dopamina en primer plano. Sos de las que resuelven, lideran y construyen. El desafío de la guerrera no es hacer más, es aprender a parar sin sentir que está fallando.",
    question: "¿Qué pasa en tu cuerpo cuando no hay nada que resolver? ¿Podés descansar sin culpa?" },
  creadora: { name: "La Creadora Sensible", emoji: "🌸",
    desc: "Tu energía va hacia los vínculos, las emociones y la percepción del mundo. Eso también tiene una biología, estrógenos y oxitocina en primer plano. Sentís mucho y profundo. El desafío de la creadora es aprender a distinguir lo que es propio de lo que absorbe del entorno.",
    question: "¿Sabés cuándo estás sintiendo algo tuyo y cuándo estás absorbiendo lo de otros?" },
  cuidadora: { name: "La Cuidadora del Clan", emoji: "🌿",
    desc: "Tu energía va hacia sostener, acompañar, estar presente para los demás. Oxitocina y progesterona en primer plano. Sos el ancla de todos. El desafío de la cuidadora es recordar que no podés dar desde el vacío.",
    question: "¿Quién te cuida a vos? ¿Podés recibir sin sentir que le debés algo a cambio?" },
  exploradora: { name: "La Exploradora", emoji: "🧭",
    desc: "Tu energía va hacia lo nuevo, lo que todavía no conocés, el próximo desafío. Dopamina y hormona de crecimiento en primer plano. La vida necesita ser interesante para ser vivida. El desafío de la exploradora es aprender a quedarse con algo incompleto sin que eso la consuma.",
    question: "¿Podés quedarte con algo incompleto sin que te genere ansiedad? ¿Qué pasa cuando dejás de moverte?" },
  guardiana: { name: "La Guardiana Alerta", emoji: "🦉",
    desc: "Tu energía va hacia anticipar, proteger, prever. Cortisol y vasopresina en primer plano. Sos quien ve lo que otros no ven. El desafío de la guardiana es enseñarle al sistema nervioso que a veces el peligro ya pasó.",
    question: "¿Tu sistema nervioso sabe cuándo el peligro pasó? ¿Podés soltar la guardia aunque sea un rato?" },
};

const hormonalProfiles = {
  progesterona: { name: "Eje Progesterona", emoji: "🌙",
    funcion: "La progesterona es la hormona de la calma, la receptividad y el sostén. Prepara el cuerpo para implantar, equilibra al estrógeno y actúa como un ansiolítico natural a través de su metabolito, la alopregnanolona.",
    regulado: "Una mente que puede bajar el ritmo, que tolera el descanso sin culpa, que conecta con la introspección sin angustiarse.",
    desregulado: "Dificultad para decidir, desmotivación, sensación de estar sin piso en la segunda mitad del ciclo, irritabilidad que aparece de la nada.",
    causas: "Estrés sostenido (la progesterona y el cortisol comparten una misma vía de producción, y el cuerpo prioriza el cortisol), baja disponibilidad de grasas en la dieta, anovulación ocasional.",
    tips: "La invitación es a encontrar fuentes de estrés y fugas energéticas, dónde estás dando más de lo que tenés. Evaluar y priorizar el descanso. Para arrancar el día, podés romper el ayuno con proteína y grasas saludables como palta, huevo, nueces o aceite de oliva.",
    lab: "Progesterona en día 21 del ciclo. Conviene tener también curva de cortisol salival (muestra AM y PM)." },
  estrogeno: { name: "Dominancia Estrogénica", emoji: "🌺",
    funcion: "El estrógeno construye, expande y da motivación. Mejora la sensibilidad a la serotonina y la dopamina, sostiene la densidad ósea y la salud cardiovascular. El problema no es el estrógeno en sí, sino cuando queda sin el contrapeso de la progesterona, o cuando el hígado no logra metabolizarlo bien.",
    regulado: "Sociabilidad, buena memoria verbal, tolerancia al estrés, sensación de expansión.",
    desregulado: "Exigencia interna muy alta, sensibilidad emocional que se vive como excesiva, autocrítica cíclica que aparece en ciertos momentos del mes.",
    sintomas: "Mamas hinchadas o dolorosas, menstruaciones abundantes con coágulos, sangre oscura, inflamación cíclica.",
    tips: "Las verduras crucíferas como brócoli, coliflor y kale ayudan al hígado a metabolizar el estrógeno. Te invitamos a reducir el alcohol, que compite con esa misma vía hepática. La fibra es clave para eliminarlo por vía intestinal, una zanahoria rallada con vinagre de manzana es una combinación simple y efectiva para sumar a las comidas.",
    lab: "Estrona, estradiol, LH y FSH, idealmente tomados entre el día 1 y 5 de la menstruación." },
  tiroideo: { name: "Eje Tiroideo", emoji: "🦋",
    funcion: "La tiroides es el metabolismo del cuerpo entero, regula la temperatura, la energía, el ritmo cardíaco, la digestión y hasta el estado de ánimo. Es como el acelerador y el freno de todos los demás sistemas.",
    regulado: "Energía mental sostenida, foco, capacidad de aprender y sostener proyectos en el tiempo.",
    desregulado: "Dificultad para concentrarse, niebla mental, o en el otro extremo, agitación y dificultad para frenar el pensamiento.",
    causas: "Déficit de yodo, selenio o zinc, estrés sostenido, procesos autoinmunes, exceso de alimentos ultraprocesados.",
    tips: "Tratá de reducir el gluten, la soja y los ultraprocesados, que pueden interferir en la función tiroidea. Los micronutrientes clave son el yodo, el selenio y el zinc, presentes en algas, nueces de Brasil y semillas.",
    lab: "Perfil tiroideo completo (TSH, T3 libre, T4 libre, anticuerpos TPO y anti-TG). Hierro completo: ferritina, ferremia y saturación de transferrina." },
  androgenico: { name: "Predominancia Androgénica", emoji: "🔥",
    funcion: "Los andrógenos (testosterona y DHEA) dan fuerza, motivación, libido y capacidad de acción. En su justa medida son energía pura. El patrón que tus respuestas muestran es compatible con un perfil de andrógenos elevados, el mismo cuadro que suele explorarse cuando se investiga lo que históricamente se conoció como Síndrome de Ovario Poliquístico (SOP) y que hoy se está renombrando como Síndrome Ovárico Metabólico Poliendocrino (SOMP), un nombre que refleja mejor su verdadera naturaleza metabólica y hormonal. Solo un estudio puede confirmarlo.",
    regulado: "Determinación, foco en objetivos, energía orientada a la acción.",
    desregulado: "Impulsividad, irritabilidad, necesidad de ganar o tener razón, dificultad para bajar revoluciones.",
    causas: "Resistencia a la insulina, estrés sostenido, alteraciones en la microbiota.",
    tips: "Revisá tu consumo de azúcar y carbohidratos refinados, ya que la insulina elevada es uno de los principales disparadores de andrógenos. Sumá movimiento regular de intensidad moderada y priorizá el sueño.",
    lab: "Testosterona total y libre, DHEA-S, androstenediona, insulina en ayunas y glucemia." },
  adrenal: { name: "Fatiga Adrenal", emoji: "⚡",
    funcion: "Las glándulas adrenales producen cortisol, la hormona que nos permite responder al estrés y sostener la energía a lo largo del día. Cuando el eje HPA lleva mucho tiempo bajo presión, el sistema puede estar quedándose sin recursos para sostener esa respuesta.",
    regulado: "Energía estable, capacidad de activarse y de frenar según haga falta.",
    desregulado: "Todo parece demasiado. Cansancio que no se va con el descanso, sensación de estar exigida incluso en momentos de calma, dificultad para entusiasmarse.",
    causas: "Estrés sostenido en el tiempo, mal descanso, exigencia física o mental crónica.",
    tips: "Los carbohidratos complejos nocturnos, como una batata crujiente con un poco de miel, ayudan a sostener la energía durante la noche. Evitá los ayunos prolongados, desayuná aunque sea un huevo duro. La sal marina de calidad y los snacks dulces saludables a media tarde también son aliados en este momento.",
    lab: "Cortisol salival en dos puntos (AM y PM), perfil hormonal completo, glucemia e insulina en ayunas." },
  cortisol: { name: "Exceso de Cortisol", emoji: "🌊",
    funcion: "El cortisol es la hormona de la alerta y la acción inmediata. En su justa medida nos despierta a la mañana y nos da foco. El problema aparece cuando se mantiene elevado de forma sostenida, sin las pausas que el cuerpo necesita para recuperarse.",
    regulado: "Alerta funcional, capacidad de resolver y después soltar.",
    desregulado: "Sobreanálisis constante, sensación de amenaza sin causa clara, mente que no logra apagarse ni en el descanso.",
    causas: "Estrés crónico, sobrecarga de trabajo o entrenamiento, mal descanso sostenido.",
    tips: "Los carbohidratos complejos nocturnos como una batata con miel, o un dátil con pasta de maní, ayudan a bajar el cortisol antes de dormir. Tratá de bajar la intensidad del entrenamiento por un tiempo, ya que el ejercicio de alto impacto puede generar un efecto rebote sobre este eje.",
    lab: "Cortisol salival en dos puntos (AM y PM)." },
};

const chineseOrgans = {
  higado: { name: "Meridiano de Hígado / Vesícula Biliar — Elemento Madera", emoji: "🌿",
    funcion: "El hígado en medicina china guarda la sangre, asegura el libre flujo del Qi por todo el cuerpo y le da al ser humano la capacidad de planificar y decidir. La vesícula biliar acompaña esa función con la capacidad de tomar decisiones y sostenerlas.",
    regulado: "Claridad para decidir, capacidad de poner límites sin culpa, enojo que aparece, se expresa y se va.",
    desregulado: "Irritabilidad que se acumula, frustración que no encuentra salida, rumiación con bronca, sensación de estar trabada sin poder avanzar.",
    tip: "El movimiento suave libera el Qi de hígado, caminar, bailar o estirar el cuerpo hacen una diferencia real. Reducir el consumo de alcohol y de grasas saturadas en exceso también alivia la carga sobre este meridiano." },
  rinon: { name: "Meridiano de Riñón / Vejiga — Elemento Agua", emoji: "💧",
    funcion: "El riñón es la raíz de toda la energía vital, el banco de reservas del cuerpo. Sostiene la voluntad, la fuerza de los huesos, la fertilidad y la capacidad de sostenerse en el tiempo sin agotarse. La vejiga acompaña esa función regulando los fluidos.",
    regulado: "Sensación de tener piso, confianza de fondo, capacidad de sostener proyectos a largo plazo sin agotar las reservas.",
    desregulado: "Miedo de fondo que no siempre se puede nombrar, inseguridad, sensación de estar viviendo de las reservas y no del ingreso diario de energía.",
    tip: "Nutrir el riñón implica priorizar el descanso real, reducir el exceso de trabajo y de exigencia física, e incorporar alimentos oscuros y salados como las algas con moderación." },
  pulmon: { name: "Meridiano de Pulmón / Intestino Grueso — Elemento Metal", emoji: "🍂",
    funcion: "El pulmón regula la entrada y la salida, de aire, de emociones, de vínculos. El intestino grueso acompaña esa función en el plano físico, eliminando lo que el cuerpo ya no necesita.",
    regulado: "Capacidad de soltar lo que ya cumplió su ciclo, respiración amplia, sensación de espacio interno.",
    desregulado: "Tristeza que se sostiene en el tiempo, melancolía, dificultad para soltar, sensación de nudo en el pecho o la garganta.",
    tip: "La respiración consciente es la medicina más directa para este meridiano. Cinco minutos de respiración profunda por la mañana y mantener buenos hábitos intestinales con fibra e hidratación ayudan a su regulación." },
  bazo: { name: "Meridiano de Bazo / Estómago — Elemento Tierra", emoji: "🌍",
    funcion: "El bazo y el estómago transforman el alimento en energía utilizable, y también digieren las ideas y las preocupaciones. Son el centro desde donde se sostiene todo lo demás.",
    regulado: "Pensamiento claro y ordenado, capacidad de digerir una situación y avanzar, energía estable después de comer.",
    desregulado: "Preocupación constante, pensamiento circular que no llega a una conclusión.",
    tip: "Comer despacio y sin distracciones es la práctica más poderosa para este meridiano. Reducir los alimentos fríos y crudos e incorporar comidas tibias y cocidas ayuda a su digestión." },
  corazon: { name: "Meridiano de Corazón / Intestino Delgado — Elemento Fuego", emoji: "🔥",
    funcion: "El corazón en medicina china es la morada del Shen, el espíritu. Organiza la mente, la alegría y la conexión con los demás. El intestino delgado acompaña esa función separando lo puro de lo impuro, en el cuerpo y en los pensamientos.",
    regulado: "Alegría genuina, conexión fácil con otros, mente clara y en calma incluso en momentos activos.",
    desregulado: "Agitación interna, sobreexcitación, dificultad para apagar la mente antes de dormir, palpitaciones sin causa aparente.",
    tip: "Crear rituales de desaceleración antes de dormir, apagar pantallas con tiempo, y bajar el consumo de estimulantes como la cafeína ayuda a calmar este meridiano." },
};

function getArchetype(answers) {
  const scores = { guerrera: 0, creadora: 0, cuidadora: 0, exploradora: 0, guardiana: 0 };
  const maps = {
    energia_natural: ["guerrera", "creadora", "cuidadora", "exploradora", "guardiana"],
    desafios: ["guerrera", "creadora", "cuidadora", "exploradora", "guardiana"],
    agotamiento: ["guerrera", "creadora", "cuidadora", "exploradora", "guardiana"],
  };
  Object.entries(maps).forEach(([key, map]) => {
    const val = answers[key];
    const opts = questions.arquetipo.find(q => q.id === key)?.options || [];
    if (Array.isArray(val)) val.forEach(v => { const i = opts.indexOf(v); if (i >= 0 && map[i]) scores[map[i]]++; });
    else if (val) { const i = opts.indexOf(val); if (i >= 0 && map[i]) scores[map[i]]++; }
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function getHormonal(answers) {
  const scores = { progesterona: 0, estrogeno: 0, tiroideo: 0, androgenico: 0, adrenal: 0, cortisol: 0 };
  if (answers.acumulacion?.includes("Caderas y piernas")) scores.progesterona++;
  if (answers.acumulacion?.includes("Abdomen")) { scores.cortisol++; scores.androgenico++; }
  if (answers.frio?.includes("Muy friolenta, siempre tengo frío")) scores.tiroideo += 2;
  if (answers.frio?.includes("Me da más calor que frío")) scores.estrogeno++;
  if (answers.premenstrual?.includes("Hinchazón en mamas y mucho cambio de humor")) { scores.estrogeno++; scores.adrenal++; }
  if (answers.premenstrual?.includes("Muy cansada, sin energía")) scores.progesterona += 2;
  if (answers.premenstrual?.includes("Ansiosa o irritable")) { scores.estrogeno++; scores.androgenico++; }
  if (answers.estres?.includes("Me llevo al límite, necesito cumplir expectativas ajenas")) scores.adrenal += 2;
  if (answers.estres?.includes("Vivo en estrés sostenido y no puedo desconectarme, mi mente rumiando 24/7")) scores.cortisol += 2;
  if (answers.deseo?.includes("Bajo o casi ausente")) { scores.adrenal++; scores.tiroideo++; }
  if (answers.deseo?.includes("Siento que me desconecté de eso")) scores.cortisol++;
  if (answers.identidad?.includes("Me gusta liderar, destacarme y aprendo con obsesión, siempre hay algo nuevo que quiero saber")) scores.tiroideo++;
  if (answers.identidad?.includes("Soy competitiva, me cuesta bajar el ritmo y necesito ganar")) scores.androgenico++;
  if (answers.identidad?.includes("Soy adicta al trabajo, me cuesta relajarme y siento que siempre tengo que producir")) scores.cortisol++;
  if (answers.identidad?.includes("Noto vello en zonas poco habituales como mentón, ombligo o pezones")) scores.androgenico += 2;
  if (answers.identidad?.includes("Soy muy sensible a los climas emocionales de mi entorno, absorbo lo que sienten los demás")) scores.estrogeno++;
  if (answers.menstruacion?.includes("Abundante con coágulos")) scores.estrogeno++;
  if (answers.menstruacion?.includes("Sangre oscura")) scores.estrogeno++;
  if (answers.menstruacion?.includes("Dolorosa")) { scores.estrogeno++; scores.progesterona++; }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function getChineseOrgan(answers) {
  const scores = { higado: 0, rinon: 0, pulmon: 0, bazo: 0, corazon: 0 };
  const emocMap = {
    "Irritación, frustración o enojo que no siempre puedo expresar": "higado",
    "Miedo, inseguridad o sensación de no tener piso": "rinon",
    "Tristeza, melancolía o dificultad para soltar": "pulmon",
    "Ansiedad, preocupación o la cabeza que no para": "bazo",
    "Sobreexcitación o agitación interna que me cuesta bajar": "corazon",
  };
  const suenoMap = {
    "Me despierto entre 1 y 3 de la madrugada": "higado",
    "Me desvelo entre 3 y 5 de la mañana": "pulmon",
    "Me cuesta dormirme antes de la medianoche": "corazon",
    "Me levanto muy temprano sin querer, antes de las 7": "pulmon",
  };
  (answers.emocion_frecuente || []).forEach(e => { if (emocMap[e]) scores[emocMap[e]] += 2; });
  (answers.sueno_horario || []).forEach(e => { if (suenoMap[e]) scores[suenoMap[e]]++; });
  if (answers.miedo?.includes("Sí, hay un miedo de fondo que no siempre puedo nombrar")) scores.rinon += 2;
  if (answers.soltar?.includes("Me cuesta mucho, tiendo a retener emociones, vínculos y situaciones")) scores.higado++;
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

async function sendToGoogleSheets(payload) {
  if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes("PEGAR_ACA")) {
    console.warn("Google Sheets URL no configurada todavía.");
    return;
  }
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Error enviando a Google Sheets:", e);
  }
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: COLORS.textLight }}>
        <span>Tu mapa se está trazando...</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 4, background: COLORS.border, borderRadius: 99 }}>
        <div style={{ height: 4, background: COLORS.accent, borderRadius: 99, width: `${pct}%`, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function OptionButton({ label, selected, onClick, multi }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "12px 16px", marginBottom: 8, borderRadius: 12,
        border: `2px solid ${selected ? COLORS.accent : COLORS.border}`,
        background: selected ? "#F7EDE7" : COLORS.card,
        color: selected ? COLORS.accent : COLORS.text,
        fontSize: 15, cursor: "pointer", transition: "all 0.15s ease",
        display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit", lineHeight: 1.4,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: multi ? 6 : "50%",
        border: `2px solid ${selected ? COLORS.accent : COLORS.border}`,
        background: selected ? COLORS.accent : "transparent",
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
      </span>
      {label}
    </button>
  );
}

function ResultCard({ emoji, title, subtitle, children, highlight }) {
  return (
    <div style={{
      background: highlight ? COLORS.accentLight : COLORS.card,
      border: `1.5px solid ${highlight ? COLORS.accent : COLORS.border}`,
      borderRadius: 16, padding: 20, marginBottom: 16,
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 12, lineHeight: 1.3 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoBlock({ label, text, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: color || COLORS.text, marginBottom: 3 }}>{label}</div>
      <p style={{ fontSize: 13.5, color: COLORS.textLight, lineHeight: 1.65, margin: 0 }}>{text}</p>
    </div>
  );
}

export default function MapaInterno() {
  const [step, setStep] = useState("intro");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const sectionKeys = Object.keys(questions);
  const currentSection = sectionKeys[sectionIdx];
  const currentQuestions = questions[currentSection] || [];
  const totalQuestions = Object.values(questions).reduce((a, b) => a + b.length, 0);
  const answeredSoFar = sectionIdx * 5;

  function handleSelect(qid, option, multi) {
    setAnswers(prev => {
      if (multi) {
        const cur = prev[qid] || [];
        return { ...prev, [qid]: cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option] };
      }
      return { ...prev, [qid]: option };
    });
  }

  function handleTextChange(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  }

  function canProceed() {
    return currentQuestions.every(q => {
      if (q.type === "text" || q.type === "email" || q.type === "number") return answers[q.id]?.trim?.()?.length > 0;
      if (q.type === "multi") return (answers[q.id]?.length || 0) > 0;
      return !!answers[q.id];
    });
  }

  async function handleNext() {
    if (sectionIdx < sectionKeys.length - 1) {
      setSectionIdx(s => s + 1);
      window.scrollTo(0, 0);
    } else {
      const archetype = getArchetype(answers);
      const hormonal = getHormonal(answers);
      const organ = getChineseOrgan(answers);
      setResult({ archetype, hormonal, organ });
      setStep("result");
      window.scrollTo(0, 0);

      setSending(true);
      await sendToGoogleSheets({
        timestamp: new Date().toISOString(),
        nombre: answers.nombre || "",
        mail: answers.mail || "",
        edad: answers.edad || "",
        momento_vital: answers.momento || "",
        eje_hormonal: hormonalProfiles[hormonal].name,
        eje_hormonal_funcion: hormonalProfiles[hormonal].funcion,
        eje_hormonal_regulado: hormonalProfiles[hormonal].regulado,
        eje_hormonal_desregulado: hormonalProfiles[hormonal].desregulado,
        eje_hormonal_tips: hormonalProfiles[hormonal].tips,
        eje_hormonal_lab: hormonalProfiles[hormonal].lab,
        meridiano: chineseOrgans[organ].name,
        meridiano_funcion: chineseOrgans[organ].funcion,
        meridiano_regulado: chineseOrgans[organ].regulado,
        meridiano_desregulado: chineseOrgans[organ].desregulado,
        meridiano_tip: chineseOrgans[organ].tip,
        arquetipo: archetypes[archetype].name,
        arquetipo_desc: archetypes[archetype].desc,
        arquetipo_pregunta: archetypes[archetype].question,
        respuestas_completas: JSON.stringify(answers),
      });
      setSending(false);
    }
  }

  function handleBack() {
    if (sectionIdx > 0) { setSectionIdx(s => s - 1); window.scrollTo(0, 0); }
    else setStep("intro");
  }

  const sec = sections[sectionIdx];

  if (step === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", fontFamily: "'Georgia', serif" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, margin: "0 0 8px 0", lineHeight: 1.2 }}>
            Comenzá a trazar<br />tu mapa interno
          </h1>
          <p style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: 0.5, margin: "0 0 16px 0", textTransform: "uppercase" }}>
            Basado en el enfoque de la Psiconeuroinmunoendocrinología (PNIE)
          </p>
          <p style={{ fontSize: 15, color: COLORS.textLight, lineHeight: 1.7, margin: "0 0 8px 0" }}>
            Esto no es un diagnóstico. Es una aproximación a una hipótesis de trabajo, que después se profundiza en consulta con el acompañamiento responsable de un profesional de la salud.
          </p>
          <p style={{ fontSize: 13, color: COLORS.textLight, fontStyle: "italic", margin: "0 0 32px 0" }}>
            No reemplaza la consulta médica ni profesional.
          </p>
          <div style={{ background: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 28, border: `1px solid ${COLORS.border}` }}>
            {["🌿 Perfil hormonal", "🌊 Medicina China", "🦅 Tu arquetipo evolutivo"].map(item => (
              <div key={item} style={{ fontSize: 14, color: COLORS.text, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>{item}</div>
            ))}
            <div style={{ fontSize: 14, color: COLORS.text, padding: "6px 0" }}>🗺️ Tu mapa personalizado al final</div>
          </div>
          <button onClick={() => setStep("quiz")} style={{
            width: "100%", padding: "16px 24px", background: COLORS.accent, color: "white",
            border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Empezar el cuestionario →
          </button>
        </div>
      </div>
    );
  }

  if (step === "result") {
    const arch = archetypes[result.archetype];
    const horm = hormonalProfiles[result.hormonal];
    const org = chineseOrgans[result.organ];
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", fontFamily: "'Georgia', serif" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, margin: "0 0 8px 0" }}>Tu mapa interno</h2>
            <p style={{ fontSize: 14, color: COLORS.textLight, margin: 0 }}>
              Hola {answers.nombre || ""}. Esto es lo que tu cuerpo está mostrando hoy.
              {sending && <span style={{ display: "block", fontSize: 11, marginTop: 4 }}>Guardando tus respuestas...</span>}
            </p>
          </div>

          <ResultCard emoji={horm.emoji} subtitle="Eje hormonal predominante" title={horm.name}>
            <InfoBlock label="Su función" text={horm.funcion} />
            <InfoBlock label="Discurso interno regulado" text={horm.regulado} color={COLORS.green} />
            <InfoBlock label="Discurso interno desregulado" text={horm.desregulado} color={COLORS.accent} />
            {horm.causas && <InfoBlock label="Posibles causas" text={horm.causas} />}
            {horm.sintomas && <InfoBlock label="Síntomas físicos del ciclo" text={horm.sintomas} />}
            <div style={{ background: COLORS.greenLight, borderRadius: 10, padding: 12, fontSize: 13, color: "#4A6B4E", lineHeight: 1.6, marginTop: 10 }}>
              <strong>Tips orientativos:</strong> {horm.tips}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 10, fontStyle: "italic" }}>
              <strong>Laboratorio sugerido:</strong> {horm.lab}
            </div>
          </ResultCard>

          <ResultCard emoji={org.emoji} subtitle="Tu meridiano — Medicina China" title={org.name}>
            <InfoBlock label="Su función" text={org.funcion} />
            <InfoBlock label="Discurso interno regulado" text={org.regulado} color={COLORS.green} />
            <InfoBlock label="Discurso interno desregulado" text={org.desregulado} color={COLORS.accent} />
            <div style={{ background: COLORS.greenLight, borderRadius: 10, padding: 12, fontSize: 13, color: "#4A6B4E", lineHeight: 1.6, marginTop: 10 }}>
              <strong>Tip:</strong> {org.tip}
            </div>
          </ResultCard>

          <ResultCard emoji={arch.emoji} subtitle="Tu arquetipo evolutivo" title={arch.name} highlight>
            <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.7, margin: "0 0 10px 0" }}>{arch.desc}</p>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, fontSize: 13.5, color: COLORS.text, lineHeight: 1.6 }}>
              <strong>Tu pregunta para explorar:</strong><br /><em>{arch.question}</em>
            </div>
          </ResultCard>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 24, fontSize: 12, color: COLORS.textLight, lineHeight: 1.6, textAlign: "center" }}>
            ⚠️ Este mapa es una aproximación a una hipótesis, no un diagnóstico. Trabajarla con responsabilidad significa profundizarla en consulta con un profesional de la salud, que es quien puede confirmar o descartar lo que aquí aparece.
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, #A8501F)`,
            borderRadius: 18, padding: "26px 22px", marginBottom: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗺️✨</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 6px 0", lineHeight: 1.4 }}>
              ¿Estás lista para entender y abordar tu mapa interno?
            </p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", margin: "0 0 18px 0", lineHeight: 1.6 }}>
              Lo que viste acá es un punto de partida. En una consulta particular podemos profundizar juntas, mirar tu caso con más detalle y armar un camino concreto.
            </p>
            <a
              href="https://calendly.com/juanitacorderobe/consultamedicinaintegral"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", background: "white", color: COLORS.accent,
                padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                textDecoration: "none", fontFamily: "inherit",
              }}
            >
              Agendar mi consulta →
            </a>
          </div>

          <button onClick={() => { setStep("intro"); setSectionIdx(0); setAnswers({}); setResult(null); }} style={{
            width: "100%", padding: "14px 24px", background: "transparent", color: COLORS.accent,
            border: `2px solid ${COLORS.accent}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 20px", fontFamily: "'Georgia', serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <ProgressBar current={answeredSoFar} total={totalQuestions} />
        {currentSection === "china" && (
          <div style={{ background: COLORS.greenLight, border: `1px solid ${COLORS.green}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: "#4A6B4E", lineHeight: 1.5, textAlign: "center" }}>
            Recordá: cada respuesta es una pieza del mapa, no una conclusión. El diagnóstico siempre lo da un profesional.
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>{sec?.emoji}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
              Parte {sectionIdx + 1} de {sectionKeys.length}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{sec?.label}</div>
          </div>
        </div>

        {currentQuestions.map((q) => (
          <div key={q.id} style={{ background: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, margin: "0 0 14px 0", lineHeight: 1.4 }}>
              {q.label}
              {q.type === "multi" && <span style={{ fontSize: 12, color: COLORS.textLight, fontWeight: 400, display: "block", marginTop: 4 }}>Podés elegir más de una</span>}
            </p>

            {(q.type === "text" || q.type === "email" || q.type === "number") && (
              <input
                type={q.type}
                placeholder={q.placeholder}
                value={answers[q.id] || ""}
                onChange={e => handleTextChange(q.id, e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 15,
                  border: `2px solid ${answers[q.id] ? COLORS.accent : COLORS.border}`,
                  background: COLORS.bg, color: COLORS.text, fontFamily: "inherit", boxSizing: "border-box", outline: "none",
                }}
              />
            )}

            {(q.type === "single" || q.type === "multi") && q.options.map((opt) => {
              const selected = q.type === "multi" ? (answers[q.id] || []).includes(opt) : answers[q.id] === opt;
              return <OptionButton key={opt} label={opt} selected={selected} multi={q.type === "multi"} onClick={() => handleSelect(q.id, opt, q.type === "multi")} />;
            })}
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 32 }}>
          <button onClick={handleBack} style={{
            flex: 1, padding: "14px", background: "transparent", color: COLORS.textLight,
            border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
          }}>
            ← Atrás
          </button>
          <button onClick={handleNext} disabled={!canProceed()} style={{
            flex: 2, padding: "14px", background: canProceed() ? COLORS.accent : COLORS.border,
            color: canProceed() ? "white" : COLORS.textLight, border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: canProceed() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s ease",
          }}>
            {sectionIdx === sectionKeys.length - 1 ? "Ver mi mapa →" : "Continuar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
