const fs = require("fs");
const path = require("path");
const login = require("fb-chat-api");

// Rutas de archivos
const sessionFile = "session.json"; // Archivo de sesión en la raíz del proyecto
const blockedUsersFile = "C:\\Users\\PC\\Desktop\\IBM\\blocked-users.txt"; // Archivo para almacenar usuarios bloqueados
const conversationLogFile = "C:\\Users\\PC\\Desktop\\IBM\\conversation_log.txt"; // Archivo para almacenar la conversación

// Credenciales para iniciar sesión
const loginCred = {
  appState: JSON.parse(fs.readFileSync(sessionFile, "utf-8")),
};

let blockedUsers = {}; // Almacena los usuarios bloqueados
let stopListener; // Variable para detener la escucha

// Función para cargar los usuarios bloqueados desde el archivo al inicio
function loadBlockedUsers() {
  try {
    if (fs.existsSync(blockedUsersFile)) {
      const data = fs.readFileSync(blockedUsersFile, "utf-8");
      blockedUsers = JSON.parse(data);
      console.log("Usuarios bloqueados cargados con éxito.");
    }
  } catch (error) {
    console.error("Error al cargar usuarios bloqueados:", error.message);
  }
}

// Función para guardar los usuarios bloqueados en el archivo
function saveBlockedUsers() {
  try {
    const directory = path.dirname(blockedUsersFile);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const data = JSON.stringify(blockedUsers);
    fs.writeFileSync(blockedUsersFile, data, "utf-8");
    console.log("Usuarios bloqueados guardados con éxito.");
  } catch (error) {
    console.error("Error al guardar usuarios bloqueados:", error.message);
  }
}

// Función para guardar la conversación
function saveConversation(message) {
  try {
    const logMessage = `${message.body}\n`;

    fs.appendFileSync(conversationLogFile, logMessage, 'utf-8');
    // Comenté la línea de log para evitar la salida en la consola
    // console.log(`Guardando mensaje en el registro de conversación: ${message.body}`);
  } catch (error) {
    console.error("Error al guardar la conversación:", error.message);
  }
}


// Función para eliminar tildes de las palabras
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};


const keywordResponses = [
  {
    keywords: ["hakeada","acoso","no me intereza","no me interesa","una solicitud","me distingues","la bloqueo","pelao","no tengo recursos","esta raro","hakear","esa no eres tu","no eres tu","hp","falsa","ya te mande los","bulla","no me interesa", "extorcion", "no mando plata", "falsa", "robadas", "robe", "no envio dinero", "no envío dinero", "no envío dinero", "no pago","no soy de pagar","no es usted","grabacion","no creo","que eres tu","estoy pelado","en canado","no ver no ago","no te voy a enviar","no voy a pagar","no te voy","tu cuento","la misma persona","problemas","zorra","en la carcel","carcel","compu","no te voy a enviar","no te voy mandar","enviame plata tu", "maldita", "compu", "no mando dinero", "no te envio nada", "no insistas", "no te creo", "estoy pobre","sin platica","no doy adelantado", "agua fria","putas","no busco putas", "compu","no te voy a mandar","no mando plata","no me interesa","seas real","estoy preso","preso","no caigo", "diciendo mentiras", "mentiras", "robar a otro","a robar", "no eres la misma", "pura mentira",  "no me interesa", "estoy en la carcel", "la carcel", "estafar","engañar","bloqueo","la bloqueo","bobo","plata no envio","real","fraude","mentira","no eres tu",  "carcel", "maldita", "mentirosa", "bloquear","estafa","haker","robo","ladrona","real","cai","denunciar","estafadora","maquina","Maquina","computadora","una computadora","no real","no cumples","no real","robo","ladrona","no real","no eres Real","falso","me robo",
     "envié los 20","robaste","me robaste","no eres real","malparida","ladrones","que carcel","robot", "banco","mentirosa", "robado","no real","maquina","robando","real","soy de venezuela", "no es normal","y para eso tengo que enviarte plata", "lo das gratis", "porque me cobras", "porque me cobras", "me vas a seguir cobrando", "porque me pides 20 mil","a que me paguen", "grabados", "falso", " no gracias", "cuentas falsa", "cuenta falsa","me pagan hasta","ando pelado","no te puedo enviar plata","no envío plata", "tunvado","tunbado", "no te conozco","ver y no comer", "no me han pagado","no doy plata","una máquina", "no creo", "no hay money", "no hay plata", "esa no es tu panocha", "no es tu panocha","no me gusta enviar plata","¿qué quieres?","que me paguen","que me vas a cumplir", "no me mandes nada", "una repetidera", "no mando nada", "repetidora", "póngase seria", "si eres tú", "que eres tú", "no te entiendo", "me ha pasado", "otro cuento", "ficticios", "no mando plata", "lejos del pueblo", "no, mi vida", "no hay Nequi", "no eres tú", "quien eres", "acá no es", "pidiendo plata", "no haces caso", "pa creerte", "no tengo manda tu", "yo no salgo","mentirosa", "no envío", "no hablas serio", "cosas falsas", "falsas","eres de dinero", "no eres tú", "no me enviaron", "ya te llego la transferencia", "mi sugar", "regálame un paquete", "no me excita", "orita nada", "echate agua","no me gusta","no me gusta","pero tú no", "no voy a pagar",  "cómo se que es verdad", "sin hacer nada", "robos", "estafas", "no se cansa", "estoy sin plata", "no se va poder", "le da asco", "no sé quién es", "insultar", "no me responde", "no la conozco", "no quiero","luego te doy la plata","luego le doy la plata",  "no la conozco", "si no no", "no se qué dices","no eres tú", "orita no", "quién es usted", "no creo", "quien eres", "no salgas con nada", "otra vez con lo mismo", "no hay plata", "no hay dinero", "no hay money", "a bloquear", "no sales con nada", "muy falsa", "falsa", "no me gusta enviar", "vividores", "no te creo", "cómo sé que eso es verdad", "pagan mensual","engañado","engañando", "han engañado", "pura mentira", "no los tengo", "ni siquiera me conoces", "falsa", "no me gusta así", "estoy en una finca", "y me pagan el", "orita no hay",  "estoy ahora sin plata", "no es usted","sin sentindido","sin centido", "a que me paguen", "tunvado", "tumbado", "no te conozco", "no doy plata", "estafándome", "en la finca", "ser falsa", "soy mujer","argentina", "bahamas", "barbados", "belice", "bolivia", "brasil", "chile", "costa rica", "cuba", "dominica", "ecuador", "el salvador", "granada", "guatemala", "guyana", "haití", "honduras", "jamaica", "méxico", "nicaragua", "panamá", "paraguay", "peru", "republica dominicana", "san cristobal y nieves","san vicente y las granadinas", "santa lucía", "surinam", "trinidad y tobago", "uruguay", "venezuela", "españa", "estados unidos", "venezuela"],
    blockUser: true, // Esta palabra clave bloqueará al usuario
  },
  {
keywords: ["hola preciosa", "hola bb", "hola corazon", "hola princesa", "hola amor", "hola princesa", "hola bb", "hola preciosa", "hola reina", "hola como", "hola reina", "hola soy", "hola cariño", "hl","hola","hola","hola","noches", "saludos", "hla"],
responses: ['Hola'],
},

// Tienes WhatsApp

{
keywords: ["tienes Wha","tienes Was","tiene Wha","tiene Was","tu Wha","tu Was","por Wha","por Was","pasame Wha","pasame Was","en Wha","en Was","tu Wha","tu Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was","Wha","Was",
"tiene WhatsApp","tiene WhatsApp", "pasame WhatsApp", "tienes Whatsapp","al wasap","wasat","wasa","Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp",
"por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp", "tu WhatsApp", "tienes WhatsApp","en whatsapp", "por whatsapp", "tu whatsapp", "el whatsapp", "su whatsapp"],
responses: ['mi numero WhatsApp  3164909368 mas tarde te escribo por ahi amor', 'Más tarde te escribo por mi WhatsApp  3164909368', 'Más tarde te escribo en mi WhatsApp 3164909368', 'En un rato te mando mensaje si me escribes a mi WhatsApp 3164909368', 'Luego te lo envío, si me escribes a mi WhatsApp 3164909368', 'Después constesto si me escribes a mi WhatsApp 3164909368', 'Te escribire mas tarde si me escribes a mi WhatsApp 3164909368', 'En un momento te escribo a mi WhatsApp 3164909368  si me envias mensaje', 'En un momento te envio mensaje si me escribes a mi WhatsApp 3164909368', 'En un rato te contesto por mi WhatsApp 3164909368', 'Dentro de un rato WhatsApp 3164909368 te escribo por ahi', 'Más tarde te escribo por mi WhatsApp 3164909368', 'Te envio mensaje mas tarde si me escribes a mi WhatsApp 3164909368'],
},
{
  keywords: ["buenos dias", "feliz mañana","buen dia"],
  responses: ['Hola buenos días amor como amaneciste❤️.', 'Hola buenos dias❤️.', 'Hola feliz mañana🔥.','Hola Buenos dias💋.','Hola Rey','Hola papi'],
},
{
  keywords: ["yo vivo en","yo vivo en","yo soy","tambien vivo"],
  responses: ['Encantada de conocerte'],
},
{
  keywords: ["buena noche", "buenas noches", "feliz noche", "feliz noche"],
  responses: ['Buenas noches amor💋.', 'Feliz noche amor💋.', 'Buenas noches Rey','Buenas noches☺️.','Besos feliz noche amor'],
},
{
  keywords: ["buenas tardes", "buenas tarde","buena tarde", "feliz tarde"],
  responses: ['Buenas tardes amor💋.', 'Feliz tarde amor💋.', 'Feliz tarde Rey','Buena tarde amor☺️.'],
},

// compromiso de mañana

{
  keywords: ["Voy mañana", "vemos mañana", "ver mañana", "Tocará mañana", "Listo mañana", "mañana te coloco", "dije q mañana", "Sería mañana", "te dije mañana", "consinaría mañana", "Mañana te mando", "MAÑANA LE ENVIO", "mañana le envio", "Mañana te envío", "Mañana amor sin falta", "Mañana recargo", "toca mañana", "Mañana puedo", "mañana ahora no", "anda mañana", "mañana te los puedo", "mañana te envío", "vemos mañana", "los paso mañana", "mañana boy", "en la mañana", "mañana si", "Boy mañana", "Para mañana", "mañana te guiro", "mañana te los", "mañana si puedo", "Si pero mañana", "mañana y te los", "Mañana nos vemos", "Mañana cuando", "Mañana se lo", "mañana apenas", "no vemos mañana", "pero mañana", "Mañana se lo", "mañana te pongo", "Toca mañana", "envío mañana", "Pero mañana", "mañana te lo", "pero mañana", "lo mando mañana", "yo mañana le", "envío mañana", "Mañana temprano", "mide mañana", "Mañana te coloco", "será mañana", "Mañana te los pongo", "Mañana te los envío", "Mañana te giro", "Mañana salgo", "puedo mañana", "mañana se los", "tocaría mañana", "te enbio mañana", "doy mañana", "en la mañana", "tu casa mañana", "En la mañana", "si quieres mañana", "puedes mañana", "amor mañana", "mañana te los envío", "te los doy mañana", "mañana te doy", "Mañana amorsito", "mañana te consigno", "Toca mañana", "Mañana bb", "Mañana te mando", "mañana te envío", "mañana si puedo", "Para ir mañana", "será hasta mañana", "culiar mañana", "mañana le pongo", "mando mañana", "Si pero mañana"],
  responses: ['Mañana espero tu pago, pero aún más ansío sentir el placer de nuestros encuentros amor.🔥💯.', 'Con gusto esperaré a que llegue mañana, pero ten en cuenta que la anticipación solo aumenta el placer de lo que está por venir','Claro, estaré aquí esperando tu dulce promesa de mañana, ansioso por dar vida a nuestros deseos compartidos','Estoy ansiosa por descubrir tu pago mañana y dar un paso mas adelante en nuestra conexión amor','Por supuesto, estaré ansiosa a que llegue mañana para recibir tu pago y disfrutar de nuestros momentos juntos amor','Estaré ansiosa a que llegue mañana para disfrutar juntos de muchos placeres amor.','Mañana, cuando me envies, te mostraré a cumplir los deseos más íntimos juntos amor','Mañana te espero ansiosamente para cumplir nuestros deseos más íntimos amor','Seria rico si lo hisieras mañana amor','Esperaré tu pago mañana, para hacerlo rico amor','hagalo ahora seria muy rico amor','Ok, ojalá y esto no sea UNa mentira','Estoy ansiosa por cumplir mañana, desnuda con ganas si me envias amor','Quiero hacerte muchas cosas ricas mañana cuando me envies amor','yo con unas ganas complacerte amor🥵','Seria rico si lo haces amor.','Amor no sabes todos los deseos que tengo de venirme cuando me envies mañana amor','Me encantaría explorar muchas cosas ricas, meñana cuendo me envies amor','sere tu mujer mañana cuendo me envies amor','Me encantaría meterme un dedito en mi culito y mostrarte, si mañana me envias amor', "Si pero usted se me desaparece!",],
},
// expresiones venga y le doy la plata
{
  keywords: ["Cuando será","Cuando será","nos vemos hoy","aqui te los doy","Enviame la ubicación","y te llego","cuando nos","Quieres venir","cuando nos","cuando nos","aqui le doy","aca le doy","cuando","Va venir","cuando","Ven a mi casa","si vienes","vas a venir","vas a venir?","cuando","donde yo vivo","un taxi","mi casa","Venga","Venga asta","Venga","doy en efectivo","aquí te pago","venga hasta aquí",
  "los dos le doy","aca le doy su plata","te pago aca","te doy aca","te doy aqui","alla te pago","aqui le pago","aqui te pago","venga hasta aqui","los dos le doy","te pago aqui","dinero en persona","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","y me visita","mi visita","Vienes","puedo visitar","encontrarnos","cuando te puedo","Cuando sera", "cuando vienes",  "encuentro","nos encontramos", "Cuando nos vemos","pero cuando","y vamos","vamos a","Venga","doy en efectivo", "te pago aca", "te pago acá", "te pago aqui", "acá te pago", "aquí te pago", "pago en efectivo","doy en efectivo", "te pago aca", "te pago acá", "te pago aqui", "acá te pago", "aquí te pago", "pago en efectivo","después la plata","doy en efectivo","aquí te pago", "venga hasta aquí","estemos los dos le doy","cuando estemos", "cuando nos vemos le envío","te pago aca", "te pago aqui",
"te pago acá", "te doy acá","allá te pago", "aquí le pago", "aquí le pago","aquí le pago","adelantado","acá te pago", "no aca te pago","si nos vemos","te pago después","no aguanta","ni te distingo","lástima","que no","pues no","no la conozco","no la verdad","no gracias","plata no "," no gracias","aquí te pago","dinero en persona","conocerte primero","te pago en efectivo","pago en efectivo"],
  responses: ["Bueno transfiere y te creo",'Primero, demuéstrame que hablas en serio enviame por Nequi 3164909368 20 mil. Después, podemos encontrarnos amor❤️.', 'Claro que sí Antes de planear algo, envíame por Nequi 3164909368 20Mil. Para saber que vas en serio amor.', 'Para asegurarnos de que hablas en serio, primero envía por Nequi 20Mil. Después, podemos disfrutar juntos amor. 😉','Para asegurarnos de que hablamos en serio, podrías enviarme primero por mi Nequi 3164909368 los 20Mil..',"Para saber que hablas en serio, primero envía a mi Nequi 20Mil. Después, podemos disfrutar juntos de mi culo amor🥵✨.","amor pues para ver si de verdad te intereso si me puedes enviar a mi nequi para saber que vas enserio amor"],
},
{
  keywords: ["Chao", "chaooo","Chao","Chao","Chaoo", "adios","mañana hablamos", "voy a descansar", "hasta pronto","voy a dormir", "Chaito"],
  responses: ['Chao Besos Amor¡¡🔥💋💋💋💋💋💋💋💋💋','Chao .', 'Chao Besitos Hermoso🔥♥💯💯💯💯💯💯💯💯💯', 'Espero y la pases rico Chao amor🙋‍♀️❤️🔥','Chao Besoss Preciosooo💓💯💯💯','Besossssss💓💯💯💯💯💯💯💯','Chao amor💋💯','Bueno chao que pases soñando conmigo Besos Amor🔥♥💤💤💤💤💤💤💤'],
},
{
  keywords: ["como estas","como vas", "tal", "buenos dias","buenas noches","tal","Como estas?", "muy bien y usted", "bien y tu"],
  responses: ['Estoy, bien gracias', 'Bien Gracias, Cómo estás vale?', 'Muy bien Gracias', 'Bien, gracias.', 'Estoy bien gracias a Dios y tu'],
},
{
  keywords: ["manda mas","manda mas","manda mas","manda mas","manda mas","manda mas", "otro video", "video rico", "videos culiando", "ya los vi", "manda tu", "mande videos", "un video", "enviame otro video", "otro video", "mas video", "mas videos", "mas fotos", "mismos videos", "mande mas videos", "video de su", "video de tu", "tienes videos", "tienes video", "fotos y videos", "mismo video", "video tuyo", "videos culiando", "otro", "otra","otra ft",
  "las enviaste","Ya me enviastes esos","las enviaste","las enviaste","Eso ya lo tengo","mensajes repetitivos","repetitivos","repetidos", "Manda mas","esos ya los vi", "muchas veces", "Ya me enviaste","ya las enviastes", "Ya me envio","foto de ahorita ","ya los tengo","Ya esos los vi","pides","fotos diferentes","ya me envio","con lo mismo", "Dejame verte", "pides", "pides","son los mismos","ya me las envío","envia lo mismo","mismos","mismos","mismos","mismos","los mismos","ya me envio esas", "mismos","mismos","mismos","mismos","mismos","no lo mismo","lo mismo","diferentes","diferentes","diferentes","enviastes","repites","repite",'muestrame'
],
  responses: ['Envíeme a mi Nequi 3164909368 los 20 mil y le hago los videos usted quiera, o no me haga perder más el tiempo, amor.','envíame a mi Nequi 3164909368 los 20 mil y are los videos que tu quieras todo el mes o no me hagas perder el mas el tiempo amor','amor tu me envias a mi Nequi 3164909368 yo te hago los videos como tu quieras todo el mes y si no vallase mejor amor','si me envia mi Nequi 3164909368 yo hago todos los videos que tu quieras todo el mes y si no quiere mejor no me escribas mas en su vida corazon','yo puedo hacerte muchos videos como tu los quieras todo el mes solo me envies a mi Nequi 3164909368 los 20 mil, nesecito dinero soy muy humilde corazon','yo encantada de hacerte todos los videos que tu quieras si me envis a mi Nequi 3164909368 los 20Mil pero si no quieres enviar ni te interesa enviarme no me molestes mas en su vida corazon','si normal igual aqui vamos hacer amigos los envies o no solo que si los mandas tienes mas derechos amor','te hago los videos como tu los quieras si me envias a mi Nequi 3164909368 los 20 mil amor','si quieres que te envié videos como tu los quieres todos los dias mandeme 20mil a mi Nequi 3164909368 y si no vallase y no regrese mas por favor',"me envias los 20 mil a mi nequi te hago todos los videos que como tu los quieras este mes amor"],
},

  {
    keywords: ["tengo parado", "te gusta","te gustaria","mamar","mamar","mamar","mamar","mamar","mamar","cuca", "comer", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grande","masturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito","meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas ", "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrar", "comerte", "verga", "mamarlo", "pechospene", "culito", "meterselo", "pene","culito","trio", "mamarselo","venirme","paraito","culiar", "mojadita","chupo","te chupo", "postura", "mojada", "lo meto", "paja","ruza", "tetas", "Chuparte", "cosita", "muchas ganas", "darte duro", "venir","lengua","sexo","pecho","culea","lo meto", "en cuatro","cuca","paja","pichas","chupadora", "chucha","leche","provoca", "chochita","Parado","exitas","chupas", "vagina","verga","penetrarte","por atras", "clítoris","pezones","clítoris","vagina","panocha","arrecho","vengas","panochota","delicioso","panocha","cuca","venirme","senos", "guevo", "chupar", "oral","detras","sabroso","cuatro","delicioso","venirte","chupo", "pecho","cachuo","teta","chupo","pichas","chuparia","sexo","chupartela","clavo","kuliar","chuparte","parolo","metertelo","teticas", "chorros","colita","senitos","cuka","culo","excitado","vagina", "chuparte","lambertela","piernas","gallito","vengas","chupo","mojar","masturbandose","chocho","vajina","parado","metertelo","duro", "chupar","chuparias","morboso","chupete","sexi","vaginal","cogerte","teticas","culo","benirme","venirme","pechos","rajita","chiquito","cucona","chupo","fisting","palmaditas","masturva","comer", "chupando","huevo","cuquita","cukita","grueso","pechitos","me vengo","puntita","culito","gimes","Llenarlas","Llenarte","comas", "todito","chupas","venir","metiendotelo","consolador","dedo", "chupamelo","dandose","metere","llena de","huevas","mamada","boca", "Piquitos","juguetes","la cara","seno","legua","lengua","follarte", "calientes","ardientes","caliente","la comas","culiarte", "berga","verga","grueso","grande","comas", "pipi", "semen","chorriandome", "masturbes","chorro","la cama", "multiorgasmica","orgasmo","vajina","puchecas", "en 4","culiarmela", "culiamos","chupes","sentirte", "metertelo","chiguito", "clavan","meter","culiamos","chocha","te viniste", "bajina","la paja", "te cojan","kulito", "penetrar","lengua", "cojan","chupas","parar ","soy adicto","cojer", "Sabrozo", "besarte","vaginita","culiarte", "vaginota","morbo", "esas ganas","sexo", "cucota","senos", "venir dentro","anal", "culo","cabeza","clitorix","clitoris","ardiente", "sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo", "venirme", "paja","cenos"],
    responses: ['Así me encanta el huevo rico 🤤 Ami me gusta mucho', 'Cree q con esas labias de q me va hacer feliz', 'Q Rico Eso Me Encanta', 'Ay No Se Que Decir🤭', 'Super rico❤️❤️', 'divino papasito', 'Uf, qué rico. Me encantaría. 😋😋😋😋', 'Ayyy Q RiKo sii', 'Qué delicia 😘😘❤😍😍😍', 'Dime que me harías', 'Q rico seriaa amor 😍😍❤️🤤😈', 'Huuuuy q ricoo Mii bb', 'mee encantaa q ricooo mi amor', '😋😋😋q riicooo me encantaaaaaa', 'yaaa quiroo sentirlooo', 'Aaaaahh uufhssss q ricoooo', 'Riiicooo 😋😋👅', 'Ricooo riicoo ricoooo', 'Uufhsss dioossssss q ricoooooo 😍😍😍😍😍😈😈😈', 'q me deje las piernas temblando sexo rudo contigo amor seria perfectoo', 'Huy q riiicooo uffhsss', 'Quierooo esooo paraaa mi, sentirloo dentro de miii😍😍😍😍', 'Q ricooo sería super😈😋😋😋', 'Mee encantaria sentirlo dentro d mii 😈😋😋', '😋😋😋 seriaaaa ricooo', 'yoo quierooo 😈😈', 'sii Bebé y me mandas videos yoo quiero ver 😋😋😋😈😍😍', 'Waooo q ricoooo bb', 'Q ricooo bb meee encantaaas', 'huy q ricoo bb','Quiero darte mucho culo amor.', 'Uf q ricooooooo mee encantaria tu penee😋😋😋😋', '😋😋😋 ufsss ricoooo', 'Pero no me mandas', '😮😮😋😋😋😈q riiicoooo mee encantaaa','Yo con ganas de que me lo metas bien rico mi amor','Yo quiero venirme amor','Estoy mojada amor','Jajajaja si tú vieras cm hago el amor','Quería estar contigo, amor','la tengo mojada amor.','Webo es lo que quiero amor.',  'Venga y juguemos en la cama',  'Me tienes mil Hermoso.','Se debe sentir rico muy rico','Yo quiero abrazarte para que me metas el pene','Tu pene es mi felicidad',  'Si mi amor te lo hago así y te lo chupo y me trago tu espelma',  'Quiero que me metas el pene en el culo',  'Quiero sentir tu pene en mi cuka pero quiero que me des bien duro amor',  'Si rico no me importa que me duela quiero tu pene grande dentro de mi cuka amor',  'mi cuka ama a tu pene amor','Quiero pene',  'Me haces gritar de placer mi amor amo tu pene y lo quiero para mí solita', 'Rico te lo mamo cuántas veces quieras',  'Quiero cojer con tigo amor','Quiero coger contigo mi príncipe azul','Quiero que me chupes las tetas',  'quiero sentir tu huevo dentro de mi así todo grande por mi Cuca y mi boca uuuff y mi culito rico','Venga y yo lo enseñó a hacerme gritar De placer amor',  'Así me encanta mamá el huevo rico 🤤 Ami me gusta mucho','Tu me darias pene amor',  'Quiero chupar tu pene amor','Quiero venirme amor','Quiero tu pene amor❤.','Yo quiero pene amor♥','quiero que me den por el culito rico',  'tu te imajinas yo consientiendote todos los dias tu pene amor','yo si quiero que me des tu pene amor💋🔥.','Para que se venga en mi cuca amor',  'yo si quiero que seas tu el que me coja amor💋🔥.','Quiero darte mi cuca amor',  'Si que rico seria sentirte dentro de mi amor','lo tienes paradito amor','siento mucho placer cuando chateo amor','me colocas caliente amor','Estaba muy caliente pensándolo amor',  'Quiero que me hagas temblar las piernas amor.','quiero que me hagas venir amor','Quiero saber que se siente tu pene mientras me cojes amor',  'para colocarte el pene, bien erecto, mientras lo lamo hasta la punta y lo devoro con mis labios Amor',  'No te imajinas lo mucho q me exita pensar en ti hermoso','Así me encanta que te gusta que te hagan en la cama',  'Uuf si rico 🤤 yo te haría acabar con mi boca',  'Si tengo ganas ya estoy mojadita','Me dejaste muy mojada','Te quiero sentir RiKo amor','Seré tu esclava sexual','Tengo unas tetas grandes y deliciosas',  'Nesecito culiarte hasta el cansancio','Cual pose te gusta más mi amor lindo dime','Quiero chuparte el pene bien sabroso',  'Me hiciste mojar riko','Ufff me excitas mucho',],
  },
  {
keywords: ['rico','cosota','videito', 'rica','rika','riko', 'provocativa', 'ricota', 'lechita', 'desnuda','video', 'videos', 'mandame', 'fotos','fotico','foto','foticos'],
sequences: [

[
  ['amor si quieres me envias 20Mil a Nequi 3164909368 que yo are todos los videos que tu me digas amor', 6000],
  ['enviar video bebe1.mp4', 6000],
  ['enviar video bebe1a.mp4', 6000],
  ['si usted me quiere ayudar lo hara', 6000],
],
[
  ['Enviame a Nequi 3164909368 que yo lo hago feliz todo el mes corazon', 6000],
  ['enviar video bebe2.jpg', 6000],
  ['enviar video bebe2a.jpg', 6000],
  ['te hago los videos que tu quieras y despues cojemos amor', 6000],
],

[
  ['tenia pensado que si me envias 20mil a mi Nequi 3164909368 te are todos los videos q usted quiera desnuda todo el mes amor', 6000],
  ['enviar video bebe3.mp4', 6000],
  ['enviar video bebe3a.jpg', 6000],
],

[
  ['enviame 20mil a mi Nequi 3164909368 y la pasmos rico todo el mes amor ', 6000],
  ['enviar video bebe4.mp4', 6000],
  ['dime si me vas a enviar si o no?', 6000],
],
[
  ['Mande a mi Nequi 3164909368 20mil y le are los videos que tu quieras todo el mes desnuda amor', 6000],
  ['enviar video bebe5.mp4', 6000],
  ['Si eres hombre envias y si no vallase amor', 6000],
],
[
  ['me envias 20mil a mi Nequi 3164909368 yo le hago los videos que usted quiera todo el mes amor', 6000],
  ['enviar video bebe6.mp4', 6000],
  ['Si me vas a regalar lo que te dije me avisas', 6000],
],
[
  ['Enviame 20Mil a mi Nequi 3164909368 te are los videos que tu quieras amor', 6000],
  ['enviar video dinero2.mp4', 6000],
  ['Enviame y hacemos video llamadas todo el mes amor', 6000],
],
[
  ['Cuando me envie 20Mil a mi Nequi 3164909368 yo le envio todos los videos que usted me diga todo el mes', 6000],
  ['enviar video bebe7.jpg', 6000],
  ['enviar video bebe7a.jpg', 6000],
  ['enviar video bebe7aa.mp4', 6000],
  ['y te muestro el roto de mi culo amor', 6000],

],
    [
  ['Amor enviame 20Mil a mi Nequi 3164909368 y te enseño que es placer todo el mes amor', 6000],
  ['enviar video bebe8.mp4', 6000],
  ['yo si te paro Rico amor', 6000],

],
  [
  ['amor enviame 20mil a mi Nequi 3164909368 que tu me dises como quieres que te haga los videos que yo te complasco amor', 6000],
  ['enviar video bebe9.jpg', 6000],
  ['enviar video bebe9a.jpg', 6000],
  ['enviar video bebe9aa.jpg', 6000],
  ['Me puedes video llamar todo el mes a mi me gusta mucho amor', 6000],
],
[
  ['Enviame 20Mil a mi Nequi 3164909368 que yo le hago lo que usted quiera amor', 6000],
  ['enviar video bebe10.mp4', 6000],
  ['puedes verme como me doy en llamada hasta venirme amor', 6000],

],
[
  ['enviame a mi Nequi 3164909368 20Mil y te hago los videos mas ricos que puedas ver amor', 6000],
  ['enviar video bebe11.mp4', 6000],
  ['yo si hago que se te pare duro amor', 6000],

],
[
  ['Enviame 20Mil a mi Nequi 3164909368 que yo lo complasco con lo que usted me diga amor', 6000],
  ['enviar video bebe12.mp4', 6000],
  ['enviar video bebe12a.jpg', 6000],
  ['puedes verme en video llamada todo el mes amor', 6000],

],
[
  ['si quieres enviame 20Mil a mi Nequi 3164909368 te are los videos que tu quieras amor', 6000],
  ['enviar video bebe13.mp4', 6000],
],
[
  ['Amor si me envías 20 Mil a mi Nequi 3164909368 yo puedo consentirte con todo lo que usted me diga todo el mes, yo soy muy caliente Amor🔥.', 6000],
  ['enviar video bebe14.mp4', 6000],

],
[
  ['Si me envias a mi Nequi 3164909368 20Mil yo le are cosas ricas todo el mes, como tu me digas amor', 6000],
  ['enviar video bebe15.mp4', 6000],
],
[
  ['Amor me envias 20Mil a mi Nequi 3164909368 no pienso dejar que usted pase de largo sin venirse rico todo el mes amor', 6000],
  ['enviar video bebe16.mp4', 6000],
],
[
  ['Amor me envias a mi Nequi 3164909368 20 mil yo lo consiento con todoS los videos que usted quiera todo el mes, para que nunca me deje amor', 6000],
  ['enviar video tivo.mp4', 6000],
  ['enviar video bebe17.jpg', 6000],
  ['enviar video bebe17a.jpg', 6000],
  ],
  [
  ['Yo puedo complacerte soy muy calinte solo enviame a mi Nequi 3164909368 20Mil y te are todos los vides que tu quieras desnuda amor', 6000],
  ['enviar video alfa4.mp4', 6000],
  ['enviar video bebe18a.jpg', 6000],
],
[
  ['Enviame a mi Nequi 3164909368 20Mil y la pasamos rico todo el mes, te hago videos como digas llamadas y lo que tu digas tu amor', 6000],
  ['enviar video alfa2.mp4', 6000],
],
[
  ['Si quieres pasarla rico primero me mandas a mi nequi 3164909368 20 mil y te hago videos ricos todo el mes amor.', 6000],
  ['enviar video bebe19a.mp4', 6000],
],
],
},
{
keywords: ['dinero','dinero','no uso Nequi','no tengo Nequi','no tengo plata en Nequi','no tengo cuenta en Nequi', 'no tengo el Nequi','no tengo Nequi','no tengo Nequi','Nequi', 'plata','neki','en efetivo','"no tengo ahora','plata','plata','plata','plata','plata','plata','plata', 'pagen', 'efetivo', 'pago','daviplata','bancolombia', 'davi plata','numero', 'funciona', 'pagado', 'neqi','si no de una',"no tengo plata","no tengo dinero", "no tengo plata","no tengo el dinero","no tengo plata","pero no tengo plata",
"no tengo dinero","no tengo plata ahora","no tengo dinero"],
sequences: [
[
  ['solo vas a una tienda donde tengan Nequi me envias 20Mil a mi Nequi 3164909368 yo are caso en todo mi Amor.', 6000],
  ['enviar video bebe1.mp4', 6000],
  ['enviar video bebe1a.mp4', 6000],
],
[
  ['Solo vas a una tienda y enviame 20Mil a mi Nequi 3164909368 Con eso ganas tu Amor..', 6000],
  ['enviar video bebe2.jpg', 6000],
  ['enviar video bebe2a.jpg', 6000],
],
],
},
// Agregar más palabras clave y sus respuestas/secuencias asociadas aquí


{
keywords: ["quien vives","tienes pareja","con tu pareja","tiene pareja","o pareja","tener esposo","tener marido","tener novio","tiene novio","tiene marido","soltero y tu","quien vives??","vives con alguien","vives sola","Vives sola","soltera", "comprometida", "casada", "tienes hijos","tienes marido", "tienes novio","quien vives","quién vives","con quien vives","con quien vives","eres soltera",  "tener esposo","tienes esposo","Conkien vives","Vives sola?"],
sequences: [
[
  ['Estoy soltera amor', 6000],
  ['vivo con mi abuela, Yo realmente, quiero salir de aquí, ella no me da nada', 6000],
  ['Tengo problemas con mi familia, tanto como económico', 6000],
  ['enviar video tienepareja.ogg', 6000],
  ['Me están corriendo', 6000],
  ['yo me quiero ir amor', 6000],
],
[
  ['Estaba soltera amor', 6000],
  ['vivo con mi abuela pero ella no me quiere ni me da nada', 6000],
  ['enviar video tienepareja.ogg', 6000],
  ['No puedo comprarme nah porq no tengo plata, y mi familia ya quiere que me valla', 6000],
  ['yo me queria ir igual', 6000],
],
],
},
{
keywords: ["hago", "deliciosa", "que haces", "aces","haces", "que hace","ases", "asiendo","aciendo","haciendo"],
sequences: [
[
  ['Aqui en mi camaJaja, yo paso todo el día con suéter y cobija', 6000],
  ['enviar video alfa4.mp4', 6000],
],
[
  ['Metida en mi cama amor', 6000],
  ['enviar video alfa3.mp4', 6000],
],
    [
  ['yo tenia unas ganas de venirme enviame cosas de sexo amor.', 6000],
],
],
},
{
keywords: ["donde ests","donde vive","donde te encuentras", "dirección","Veamos en tu casa","donde estas","dime donde","donde eres","de donde eres","dónde vives","dime dónde vives","donde es","vives en","donde eres","donde esta","donde eres?","donde vives","donde vives?","donde andas", "parte","en que parte","parte te encuentras","direccion","parte","parte","parte","parte","parte","parte","parte","estas viviendo","ciudad","que lado", "lugar", "pais", "dnde estas", "donde te ecuentras", "te ecuentras","que barrio","q barrio","barrio vives","barrio eres","ubicación","tu ubicación","donde estas","localidad", "país","tu donde vives","país","país", "desde donde","desde donde","que parte", "parte de","parte eres","sitio","estas en bogota","direcion"],
sequences: [
[
      ['Yo Soy Venezolana y estoy aquí en Bogota', 6000],
      ['yo era de un pueblo cerca de Caracas. No puedo regresar para atrás allá voy a pasar trabajo porq no es lo mismo aquí en Bogota no tengo a nadie', 6000],
      ['enviar video  vivo127.ogg', 6000],
      ['Y tú, de qué País eres, bb?', 6000],
     ],
  ],
},
{
keywords: ['llamada','me contesta','Te llamo','videollamada','llamando','yamada','Llamada','no contesta', 'llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamo','te llamo','llamanda','contesta','contestas','llama',"yamarte","contestame"],
sequences: [
[
    ['Cuando me pases 20Mil a mi Nequi 3164909368 me puedes llamar estoy desnuda con unas ganas amor', 6000],
    ['enviar video alfa3.mp4', 6000],
    ['enviar video alfa3.mp4', 6000],
    ['te mando videos y aremos lo que tu quieras amor', 6000],
  ],
[
  ['Si me pasa 20Mil a mi Nequi 3164909368 yo ando desnuda y me puedes llamar todo el mes que despues culiamos amor', 6000],
  ['enviar video bebe4.mp4', 6000],
  ['yo are lo que tú digas amor', 6000],
  ],
[
  ['Envíame 20Mil a mi Nequi 3164909368 que yo ando desnuda y te vídeo llamo todito el mes y vez como me meto un consolador en el culito amor mio', 6000],
  ['enviar video bebe5.mp4', 6000],
],
],
},
{
keywords: ['presencial','persona','en persona','cuanto necesitas','para follar','personal mente','Cuanto bale','Cuanto vale','Cuanto me vale','cuanto cobra','personal','personal','personal','personal', "pides", "cuesta", "Que vale","rato","un rato","el rato","encuentro", "valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","pides"],
sequences: [
[
  ['yo quiero Para confirmar que hablas en serio, primero envía 20 mil a mi Nequi 3164909368 amor.', 6000],
  ['enviar video bebe6.mp4', 6000],
  ['Me gustaría que vinieras así sea para dormir dos días aque sea amor', 6000],
  ],
[
  ['Envíame $20 por Nequi 3164909368 para saber que es de verdad amor.', 6000],
  ['enviar video bebe6.mp4', 6000],
  ['Yo soy, sería si no fuera verdad no te hubiera dicho nada', 6000],
],
],
},
{
keywords: ["audio","envieme nota","envieme una nota","audio para","un audio","audio","escuchar tu voz","nota de voz","un audio","escuchar","tu voz","mensaje de voz","de voz","una nota","nota","nota de voz"],
sequences: [
[
  ['enviar video audio.ogg', 6000],
],
[
  ['enviar video real.ogg', 6000],
],
[
  ['enviar video real2.ogg', 6000],
],
[
  ['no me gustan audios amor', 6000],
],
[
  ['enviar video mujer.ogg', 6000],
],

],
},
{
keywords: ["que edad","que edad", "edad tienes","q edad","que edad","cuantos años","años tienes","Cuanto años","cuanto años tienes","cuantos años tiene","años tenes","cuantos años","años tienes","Cuantos años tienes","Cuántos años tienes?","cuantos años tenes","años tenes","cuántos años tenes","cuántos años tiene","años tiene","Usted años","Ust años","Ust años tiene","años tu","Ust años tiene","cuánto años tiene","años tiene","cuántos años tenés","cuántos años tenes","años tenes","años tienes"],
sequences: [
[
  ['enviar video años22.ogg', 6000],
  ['enviar video cuantos1.ogg', 6000],
],
[
  ['enviar video años.ogg', 6000],
],
],
},

{
keywords: ["trabajas", "trabajando y tu", "estas trabajando","ests trabajando","esta trabajando", "dedicas", "se dedica"],
sequences: [
  [
    ['enviar video trabajo1.ogg', 6000],
    ['y tu en que trabajas amor??', 6000],
  ],
  [
    ['trabajo aveces en un salon de belleza🥹.', 6000],
    ['enviar video trabajas2.ogg', 6000],
  ],
],
},


{
  keywords: ["reina", "atractiva", "guapa", "princesa","belleza", "bb", "linda", "hermosa", "preciosa", "te amo", "amo", "adoro", "te quiero", "belleza", "bellezima", "belleza","encantadora", "fascinante", "atractiva", "hermosa", "maravillosa", "carismática", "espléndida", "elegante", "agradable", "deslumbrante", "deslumbradora", "encantadoramente", "atractivamente", "fascinantemente", "guapa", "encanto", "adorable", "adoracion", "cariñosa", "amorosa"],
  responses: ['Gracias', 'Enserio', 'ay que lindo eres❤️', 'Soy super linda',  'Con gusto mi amor ', 'Pero no tengo plata', 'Gracias amor 💞', 'Gracias mí corazón', 'Y eso q no me conoces','Es usted muy amable.', 'Gracias rey', 'Gracias por ser tan bello', 'Gracias mí amor', 'Gracias bb', 'Usted también es hermoso mi amor', 'Gracias ☺️', 'Gracias 🥴', 'Bello mi amor', 'Hay BB eres la mejor persona 💗','Todo hermoso mi BB ❣️', 'Bello 🤩 meeeee encantaaaaaas', '❤️ tan bello', 'Gracias bb por esas palabras tan lind que me distes', 'Gracias cielo ❤️','Y eso q Nome has visto, si no imagínate', 'Hay amor que lindo 😻', 'Gracias mi vida', 'Tan lindo me agradas mucho', 'Hay cielo que lindo', 'Besos mi amor', 'Hay amor tan lindo 😍', 'Te mando un beso y un abrazo fuerte', 'Tan bello mi amor', 'Gracias encantada amor', 'Es usted un amor', 'Eres demasiado mentiroso 🤥', 'Tengo la cintura bonita y tengo grande cola y mis pechos son grandes tambien', 'Y gracias mi  amor 😍😍❤️💘', 'Y gracias', 'Si de algo pudes estar seguro es que yo quiero venirme Amor👅', '❤️💘 Que bello cariño', 'Yo también te quiero 😘', 'quiero que me cojas amor💖'],
},










];

// Respuestas aleatorias para mensajes desconocidos
const randomResponses = [

  'Bueno pero tiene q enviarme algo de dinero',
   'Sii mándame plata amor',
   'Si te guste amor',
   'Shiiii 🥰❤️',
   'Si mi amor',
   '❤️super rico 🤤',
   'Hay dios 😁',
   'Delicioso está bien',
   'Bien amor',
   'Vale',
   'Que finooo',
   'Ahhh yaa que chevere',
   'Sip',
   'Si claro',
   '❤️super rico 🤤',
   'Si delicioso amor',
   'Divino amor',
   'Unnm eso es bueno',
   'Estaba mas caliente amor',
   'Si Rey',
   'Eso es bueno',
   'Si Rico',
   'Bueno Amor❤️',
   'Lindo',
   'Eres mío Amor',
   'Un ya Rico',
   'Me alegro',
   'Ajá y entonces',
   'Un ya cielo',
   'Vale cielo está bien',
   'Vale mí amor ❤️😍',
   'Que me Arias amor',
   'Vale amor está Bien',
   'Ok esta bien',
   'Hay se ve el interés de una persona',
   'Que bueno mi amor',
   'Usted me agrada amor',
   'mi amorsito rico',
   'Yo puedo ser tu novia si lo quieres asi Amor🔥♥️.',
   'Y no veo tu interés',
   'Me ayudarás',
   'Heres un hombre bello me encantas come me tratas',
   'Envíeme una foto',
   'ya te dire a ti si a todo Amor',
   'Ahh ok sii esta biene alegra',
   'Dime cosas calientes Amor',
   'claro que si🥰',
   'Si gracias 😊',
   'Delicioso ♥️',
   'Uff muy rico bebe',
   'Ahh ya amor',
   'Sii que rico bebe',
   'q ricooo mi amor',
   'Riiicooo 😋😋👅',
   'Ricooo riicoo ricoooo',
   'Qué bien, cariño',
   'Te diré a ti si a todo, amor',
   'delicioso',
   'Siiiiiii Ricoooooo',
   'Uf delicioso amor🔥',
   'Yo te daria todo de mi',
   'Eres lo que deseo amor',
   'Te gusto, mucho💓💯',
   'Soy irresistible amor',
   'Ayyy q delicia ers tu Rey.',
   'Dare lo que sea por tenerlo a mi lado hermoso💋🔥',
   'Me encantas♥♥',
   'Cosita deliciosa✨',
   'Deliciosaa amor❤️.',
   'Q Delicia❤🔥🔥',
   'Me Facinas Bb',
   'Te adoro mi vida',
   'tu me excitas💕',
   'Qué hombre tan Bello.',
   'Tu me excitas mucho',
   'me muero por verlo',
   'Rico pensar en ti amor',
   'Quiero que seas mi amor ❤️',
   'yo quiero verte bb❤',
   'Creo que estoy exitada amor✨',
   'Eres lo máximo Rey',
   'Lo que tu digas lo are🌹✨',
   'Solo espero algún día tenerte cerca, amor🌹',
   'Quiero que hagas cosas ricas amor',
   'me interesa tu amor',
   'Si amor te tengo muchas ganas',
   'Lo quiero sentir dentro de mi amor',
   'Gracias creo que la pasaria genial con tigo amor',
   'pero si estás dispuesto a mandarme plata?',
   'me interesa tu amor',
   'Que rico amor',
   'Mmm si bueno hazme muy feliz entonces',
   'Uf q ricooooooo',
   'Sentir que me amas seria delicioso amor',
   'Soy una adicta al sexo',
   'Te adoro mi vida',
   'riquisimo',
   'Muchos besitos para ti mi Bb💋',
   'Ajá bueno',
   'Bueno',
   'Eres una hermosura',
   'Que me cuentas',
   'Ayy en verdad',
   'Siii Me Encantas',
   'sii pero en verdad quiero que me ayudes',
   'Dime qué te gustan de las venezolanas',
   'Si gracias mi amor',
   'Si muy rico 🤤',
   'Sabías que las venezolanas son demasiado calientes amor',
   'Mi en la cama me gusta que me cojan en 4 bien rico 🤤 y que me lo metas por el culito así rico te lo quiero mamar',
   'hay amor q delicia',
   'Si me gustaría mucho',
   'Mientras me consientas y me hagas feliz siempre estaree contigo amor',
   'Si de verdad te pudiera conocer en verdad',
   'ay q rico amor',
   'que lindo como hablas',
   'no soy de esas mujeres que se van por el físico',
   'yo te are caso en todo mi amor',
   'Yo quiero venirme amor',
   'Dime me vas a enviar amor',
   'Siento unas ganas de cojer amor',
   'Eres Muy caliente amor',
   'Tengo rato sin hacer el amor',
   'Eso me encanta',
   'Delicioso amor',
   'Quiero sentirte dentro de mi amor',
   'Quiero hacer de todo mi amor lindo',
   'K rico amor',
   'Bueno amor❤️.',
   'Delicioso amor',
   'Me tienes muy caliente amor',
   'Y tu eres caliente',
   'Kieres mi cuka',
   'Claro que si mi vida esa es la idea',
   'Uffff seria riquisimo',
   'no tengo plata amor',
   'Con gusto mi amor',
   'Lindo💋',
   'igual yo no pido mucho, soy humilde corazon...',
   'Bueno transfiere y te creo',
   'yo quiero ser toda tuya❤️.',
   'Eres pura mentiras, no soy una niña.',
   '❤️',
   '❤️',
   '❤️',
   'Soy muy Bella amor💘.',

];

// Función para obtener una respuesta aleatoria de una lista
function getRandomResponse(responsesList) {
  const randomIndex = Math.floor(Math.random() * responsesList.length);
  return responsesList[randomIndex];
}

// Función para verificar si el mensaje incluye alguna de las palabras clave asociadas con una secuencia
function findSequence(message) {
  const lowercaseMessage = removeAccents(message.toLowerCase());
  for (const response of keywordResponses) {
    const keywords = response.keywords;
    const found = keywords.some(keyword => {
      const lowercaseKeyword = removeAccents(keyword.toLowerCase());
      return lowercaseMessage.includes(lowercaseKeyword);
    });
    if (found) {
      return response;
    }
  }
  return null;
}

// Función para enviar mensajes con intervalos de tiempo y seleccionar una secuencia aleatoria
async function sendSequenceMessages(api, threadID, sequences) {
  const randomSequenceIndex = Math.floor(Math.random() * sequences.length);
  const randomSequence = sequences[randomSequenceIndex];

  for (const [message, interval] of randomSequence) {
    await sendMessageWithRandomDelay(api, threadID, message);
  }
}

// Función para enviar un mensaje con una demora aleatoria entre 10 y 20 segundos
async function sendMessageWithRandomDelay(api, threadID, message) {
  const typingDelay = Math.floor(Math.random() * 5000) + 4000; // Rango de [4000, 9000] milisegundos
  const sendDelay = Math.floor(Math.random() * 5000) + 5000; // Rango de [10000, 20000] milisegundos

  await new Promise(resolve => setTimeout(resolve, typingDelay));

  // Simular que está escribiendo
  api.sendTypingIndicator(threadID, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  await new Promise(resolve => setTimeout(resolve, sendDelay));

  // Verificar si es una solicitud para enviar un video
  if (message.startsWith('enviar video')) {
    const videoPath = message.substring(12).trim();
    await sendMedia(api, threadID, videoPath, 'video');
  }
  // Verificar si es una solicitud para enviar una imagen
  else if (message.startsWith('enviar imagen')) {
    const imagePath = message.substring(13).trim();
    await sendMedia(api, threadID, imagePath, 'image');
  }
  // Enviar el mensaje normal
  else {
    api.sendMessage({ body: message }, threadID);
  }
}

// Función para enviar videos e imágenes
async function sendMedia(api, threadID, mediaPath, mediaType) {
  if (fs.existsSync(mediaPath)) {
    const formData = {
      body: '',
      attachment: fs.createReadStream(mediaPath),
    };

    api.sendMessage(formData, threadID, (err, messageInfo) => {
      if (err) {
        console.error(`Error al enviar ${mediaType}:`, err);
      } else {
        console.log(`Se ha enviado con éxito ${mediaType}: ${mediaPath}`);
      }
    });
  } else {
    console.log(`No se encontró el ${mediaType}: ${mediaPath}`);
  }
}

































// Función para manejar mensajes entrantes
async function handleIncomingMessage(api, event) {
  const senderID = event.senderID;
  const userBlocked = blockedUsers[senderID];

  if (userBlocked) {
    console.log(`No se responderá al usuario ${senderID}.`);
    return; // No responder al usuario bloqueado
  }

  // Lógica de procesamiento de mensajes aquí
  const matchedResponse = findSequence(event.body);

  if (matchedResponse) {
    if (matchedResponse.responses) {
      const randomResponse = getRandomResponse(matchedResponse.responses);
      await sendMessageWithRandomDelay(api, event.threadID, randomResponse);
    } else if (matchedResponse.sequences) {
      const sequences = matchedResponse.sequences;
      await sendSequenceMessages(api, event.threadID, sequences);
    }

    if (matchedResponse.blockUser) {
      const blockReason = matchedResponse.keywords.join(', '); // Obtener la palabra clave por la cual se bloquea al usuario
      blockedUsers[senderID] = true; // Bloquear al usuario
      console.log(`Usuario ${senderID} bloqueado.`);
      saveBlockedUsers(); // Guardar la lista de usuarios bloqueados

      // Enviar un mensaje al usuario bloqueado solo si se encuentra una palabra clave específica
      const blockMessage = "🔥 Soy modelo webcam de sexo en vivo, si quieres verme y no quieres pagar nada aquí te envió el LINK Amor🥵                             https://webcamsenvivo.netlify.app/";
      await sendMessageWithRandomDelay(api, event.threadID, blockMessage);
    }
  } else {
    // No se encontró ninguna secuencia de palabras clave
    if (containsKeyword(event.body, "ya envie los","sijin", "fiscalía", "investigador","no saliste con nada","ya mande la plata","hay se los envie","ya se los puse",
    "Ya  te envié","Ya te envié","Aller te envie","Ya te envié", "ya se los envie","ya le envie la plata","Ya se los envie","policia",
    "le voy a decir","ya te envie","Ya te envié","envie el dinero","envie la plata","le envie la plata","te envié plata","listo ya te envie",
    "te consine","Ya te gire","Ya yo te mandé la plata","ya te jire","ya le mnde","selo puse", "revise","revisa","te pague","te cancele",
    "le voy a decir","fiscalia","ya te deposite","ya deposite","ya te mande el dinero","ya le page","te transferi","mira el recibo", "ya se los mande","ya te envie",
    "ya te gire", "yo ya le mande", "yo ya le mande", "yo ya le mande", "yo ya le mande", "ya te los gire", "te envie la plata","ya te envié",
    "investigacion","publicar")) {
      // Bloquear al usuario sin enviar un mensaje de bloqueo
      blockedUsers[senderID] = true;
      saveBlockedUsers(); // Guardar la lista de usuarios bloqueados
      console.log(`Usuario ${senderID} bloqueado sin enviar mensaje.`);
      return; // Salir de la función después de bloquear al usuario
    } else {
      // Verificar si el mensaje es un audio
      if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === 'audio') {
        // Respuestas aleatorias para mensajes de audio
        const audioResponses = [
          'los audios no los puedo escuchar',
          'me puedes escribir mi telefono tiene mal el sonido',
          'no puedo escuchar bien los audios',
          'No puedo escuchar el audio bb'
        ];

        const randomAudioResponse = getRandomResponse(audioResponses);
        await sendMessageWithRandomDelay(api, event.threadID, randomAudioResponse);
        return; // Salir de la función después de enviar el mensaje de audio
      }

      // Verificar si el mensaje no contiene texto
      if (!hasText(event.body)) {
        const alertResponse = "❤️";
        await sendMessageWithRandomDelay(api, event.threadID, alertResponse);
        return; // Salir de la función después de enviar el mensaje de alerta
      }

      const randomResponse = getRandomResponse(randomResponses);
      await sendMessageWithRandomDelay(api, event.threadID, randomResponse);
    }
  }

  // Guardar la conversación
  saveConversation(event);

  // Resto de la lógica de manejo de mensajes
}

// Función para verificar si el mensaje contiene texto
function hasText(message) {
  // Expresión regular para buscar letras de la A a la Z o UN
  const textPattern = /[a-zA-Z]/;
  return textPattern.test(message);
}

// Función para verificar si el mensaje contiene una palabra clave específica (insensible a mayúsculas y minúsculas)
function containsKeyword(text, keyword) {
  const normalizedText = removeAccents(text.toLowerCase());
  const normalizedKeyword = removeAccents(keyword.toLowerCase());
  return normalizedText.includes(normalizedKeyword);
}


























// Función para iniciar la escucha de mensajes
function iniciar() {
  login(loginCred, (err, api) => {
    if (err) {
      console.error("Error en las credenciales de inicio de sesión", err);
      return;
    }

    // Asignar el valor de la variable stopListener después de iniciar la escucha
    stopListener = api;

    api.listen((err, event) => {
      try {
        if (err) {
          console.error("Error al escuchar:", err);
          // iniciar(); // No es necesario reiniciar aquí
          return;
        }

        if (event.type === "message") {
          handleIncomingMessage(api, event);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
}

// Cargar usuarios bloqueados al inicio
loadBlockedUsers();

// Iniciar la escucha de mensajes
iniciar();

// Exportar la variable stopListener
module.exports = { stopListener };
