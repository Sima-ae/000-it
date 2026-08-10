/** Exact EN → NL replacements for legal/cookie policy strings. Longer keys first. */
const EXACT: Record<string, string> = {
  'This Cookie Policy was last updated on 01-07-2026 and applies to citizens and legal permanent residents of the European Economic Area and Switzerland.':
    'Dit cookiebeleid is voor het laatst bijgewerkt op 01-07-2026 en is van toepassing op burgers en wettelijke permanente inwoners van de Europese Economische Ruimte en Zwitserland.',
  '1. Introduction': '1. Inleiding',
  '2. What are cookies?': '2. Wat zijn cookies?',
  '3. What are scripts?': '3. Wat zijn scripts?',
  '4. What is a web beacon?': '4. Wat is een webbaken?',
  '5. Cookies': '5. Cookies',
  '6. Placed cookies': '6. Geplaatste cookies',
  '7. Consent': '7. Toestemming',
  '8. Enabling/disabling and deleting cookies': '8. Cookies in-/uitschakelen en verwijderen',
  '9. Your rights with respect to personal data': '9. Uw rechten met betrekking tot persoonsgegevens',
  '10. Contact details': '10. Contactgegevens',
  '5.1 Technical or functional cookies': '5.1 Technische of functionele cookies',
  '5.2 Statistics cookies': '5.2 Statistiekcookies',
  '5.3 Marketing/Tracking cookies': '5.3 Marketing-/trackingcookies',
  '5.4 Social media': '5.4 Social media',
  '7.1 Manage your consent settings': '7.1 Beheer uw toestemmingsinstellingen',
  Usage: 'Gebruik',
  'Sharing data': 'Gegevens delen',
  Functional: 'Functioneel',
  Statistics: 'Statistieken',
  'Statistics (anonymous)': 'Statistieken (anoniem)',
  Marketing: 'Marketing',
  'Marketing/Tracking': 'Marketing/Tracking',
  'Purpose pending investigation': 'Doel in onderzoek',
  Miscellaneous: 'Overig',
  Name: 'Naam',
  Expiration: 'Verloop',
  Function: 'Functie',
  session: 'sessie',
  persistent: 'persistent',
  '1 year': '1 jaar',
  '6 months': '6 maanden',
  '2 days': '2 dagen',
  '365 days': '365 dagen',
  'Store items in shopping cart': 'Items in winkelwagen opslaan',
  'Store user preferences': 'Gebruikersvoorkeuren opslaan',
  'Store browser details': 'Browsergegevens opslaan',
  'Read if cookies can be placed': 'Controleren of cookies mogen worden geplaatst',
  'Store logged in users': 'Ingelogde gebruikers opslaan',
  'Store performed actions on the website': 'Uitgevoerde acties op de website opslaan',
  'Provide the prevention of cached pages': 'Voorkomen van gecachte pagina’s',
  'This data is not shared with third parties.': 'Deze gegevens worden niet gedeeld met derden.',
  'Sharing of data is pending investigation': 'Het delen van gegevens is in onderzoek',
  'We use WooCommerce for webshop management.': 'Wij gebruiken WooCommerce voor webshopbeheer.',
  'We use WordPress for website development.': 'Wij gebruiken WordPress voor websiteontwikkeling.',
  'We use Elementor for content creation.': 'Wij gebruiken Elementor voor contentcreatie.',
  'We use Sourcebuster JS for visitor tracking.': 'Wij gebruiken Sourcebuster JS voor bezoekersregistratie.',
  'We use LiteSpeed for website hosting.': 'Wij gebruiken LiteSpeed voor websitehosting.',
  'We use Google Fonts for display of webfonts.': 'Wij gebruiken Google Fonts voor het tonen van webfonts.',
  'We use Google Maps for maps display.': 'Wij gebruiken Google Maps voor het tonen van kaarten.',
  'We use YouTube for video display.': 'Wij gebruiken YouTube voor het tonen van video’s.',
  'We use Facebook for display of recent social posts and/or social share buttons.':
    'Wij gebruiken Facebook voor het tonen van recente social posts en/of deelknoppen.',
  'We use Twitter for display of recent social posts and/or social share buttons.':
    'Wij gebruiken Twitter voor het tonen van recente social posts en/of deelknoppen.',
  'We use LinkedIn for display of recent social posts and/or social share buttons.':
    'Wij gebruiken LinkedIn voor het tonen van recente social posts en/of deelknoppen.',
  'We use WhatsApp for chat support.': 'Wij gebruiken WhatsApp voor chatsupport.',
  'We use TikTok for video display.': 'Wij gebruiken TikTok voor het tonen van video’s.',
  'For more information, please read the Google Fonts Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van Google Fonts.',
  'For more information, please read the Google Maps Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van Google Maps.',
  'For more information, please read the YouTube Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van YouTube.',
  'For more information, please read the Facebook Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van Facebook.',
  'For more information, please read the Twitter Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van Twitter.',
  'For more information, please read the LinkedIn Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van LinkedIn.',
  'For more information, please read the WhatsApp Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van WhatsApp.',
  'For more information, please read the TikTok Privacy Statement.':
    'Voor meer informatie, lees de privacyverklaring van TikTok.',
  'You have the right to know why your personal data is needed, what will happen to it, and how long it will be retained for.':
    'U heeft het recht te weten waarom uw persoonsgegevens nodig zijn, wat ermee gebeurt en hoe lang zij worden bewaard.',
  'Right of access: You have the right to access your personal data that is known to us.':
    'Recht op inzage: u heeft het recht inzage te krijgen in uw persoonsgegevens die bij ons bekend zijn.',
  'Right to rectification: you have the right to supplement, correct, have deleted or blocked your personal data whenever you wish.':
    'Recht op rectificatie: u heeft het recht uw persoonsgegevens aan te vullen, te corrigeren, te laten verwijderen of te laten blokkeren wanneer u dat wenst.',
  'If you give us your consent to process your data, you have the right to revoke that consent and to have your personal data deleted.':
    'Als u ons toestemming geeft om uw gegevens te verwerken, heeft u het recht die toestemming in te trekken en uw persoonsgegevens te laten verwijderen.',
  'Right to transfer your data: you have the right to request all your personal data from the controller and transfer it in its entirety to another controller.':
    'Recht op overdracht van uw gegevens: u heeft het recht al uw persoonsgegevens bij de verwerkingsverantwoordelijke op te vragen en deze in hun geheel over te dragen aan een andere verwerkingsverantwoordelijke.',
  'Right to object: you may object to the processing of your data. We comply with this, unless there are justified grounds for processing.':
    'Recht van bezwaar: u kunt bezwaar maken tegen de verwerking van uw gegevens. Wij voldoen hieraan, tenzij er gerechtvaardigde gronden voor de verwerking zijn.',
  'You have the following rights with respect to your personal data:':
    'U heeft de volgende rechten met betrekking tot uw persoonsgegevens:',
  'For questions and/or comments about our Cookie Policy and this statement, please contact us by using the following contact details:':
    'Voor vragen en/of opmerkingen over ons cookiebeleid en deze verklaring kunt u contact met ons opnemen via de volgende contactgegevens:',
  'This Cookie Policy was synchronized with cookiedatabase.org on 01-07-2026':
    'Dit cookiebeleid is gesynchroniseerd met cookiedatabase.org op 01-07-2026',
  'United Arab Emirates': 'Verenigde Arabische Emiraten',
  Website: 'Website',
  Email: 'E-mail',
};

const PARTIAL: [RegExp, string][] = [
  [
    /^Our website, https:\/\/000-it\.com \(hereinafter: "the website"\) uses cookies and other related technologies \(for convenience all technologies are referred to as "cookies"\)\. Cookies are also placed by third parties we have engaged\. In the document below we inform you about the use of cookies on our website\.$/,
    'Onze website, https://000-it.com (hierna: “de website”) maakt gebruik van cookies en andere gerelateerde technologieën (voor het gemak worden alle technologieën aangeduid als “cookies”). Cookies worden ook geplaatst door derden die wij hebben ingeschakeld. In het onderstaande document informeren wij u over het gebruik van cookies op onze website.',
  ],
  [
    /^A cookie is a small simple file that is sent along with pages of this website and stored by your browser on the hard drive of your computer or another device\. The information stored therein may be returned to our servers or to the servers of the relevant third parties during a subsequent visit\.$/,
    'Een cookie is een klein eenvoudig bestand dat meegestuurd wordt met pagina’s van deze website en door uw browser wordt opgeslagen op de harde schijf van uw computer of een ander apparaat. De daarin opgeslagen informatie kan bij een volgend bezoek naar onze servers of naar de servers van de betreffende derden worden teruggestuurd.',
  ],
  [
    /^A script is a piece of program code that is used to make our website function properly and interactively\. This code is executed on our server or on your device\.$/,
    'Een script is een stuk programmacode dat wordt gebruikt om onze website goed en interactief te laten functioneren. Deze code wordt uitgevoerd op onze server of op uw apparaat.',
  ],
  [
    /^A web beacon \(or a pixel tag\) is a small, invisible piece of text or image on a website that is used to monitor traffic on a website\. In order to do this, various data about you is stored using web beacons\.$/,
    'Een webbaken (of pixel-tag) is een klein, onzichtbaar stukje tekst of afbeelding op een website dat wordt gebruikt om het verkeer op een website te monitoren. Om dit te doen, worden diverse gegevens over u opgeslagen via webbakens.',
  ],
  [
    /^Some cookies ensure that certain parts of the website work properly and that your user preferences remain known\. By placing functional cookies, we make it easier for you to visit our website\. This way, you do not need to repeatedly enter the same information when visiting our website and, for example, the items remain in your shopping cart until you have paid\. We may place these cookies without your consent\.$/,
    'Sommige cookies zorgen ervoor dat bepaalde onderdelen van de website goed werken en dat uw gebruikersvoorkeuren bekend blijven. Door functionele cookies te plaatsen, maken wij het voor u makkelijker om onze website te bezoeken. Zo hoeft u niet herhaaldelijk dezelfde informatie in te voeren bij een bezoek aan onze website en blijven items bijvoorbeeld in uw winkelwagen tot u heeft betaald. Wij mogen deze cookies plaatsen zonder uw toestemming.',
  ],
  [
    /^We use statistics cookies to optimize the website experience for our users\. With these statistics cookies we get insights in the usage of our website\.\s*We ask your permission to place statistics cookies\.$/,
    'Wij gebruiken statistiekcookies om de website-ervaring voor onze gebruikers te optimaliseren. Met deze statistiekcookies krijgen wij inzicht in het gebruik van onze website. Wij vragen uw toestemming om statistiekcookies te plaatsen.',
  ],
  [
    /^Marketing\/Tracking cookies are cookies or any other form of local storage, used to create user profiles to display advertising or to track the user on this website or across several websites for similar marketing purposes\.$/,
    'Marketing-/trackingcookies zijn cookies of enige andere vorm van lokale opslag, gebruikt om gebruikersprofielen te maken om advertenties te tonen of om de gebruiker op deze website of over meerdere websites te volgen voor vergelijkbare marketingdoeleinden.',
  ],
  [
    /^On our website, we have included content from Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest and Disqus to promote web pages \(e\.g\. “like”, “pin”\) or share \(e\.g\. “tweet”\) on social networks like Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest and Disqus\. This content is embedded with code derived from Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest and Disqus and places cookies\. This content might store and process certain information for personalized advertising\.$/,
    'Op onze website hebben wij content van Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest en Disqus opgenomen om webpagina’s te promoten (bijv. “like”, “pin”) of te delen (bijv. “tweet”) op sociale netwerken zoals Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest en Disqus. Deze content is ingebed met code van Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest en Disqus en plaatst cookies. Deze content kan bepaalde informatie opslaan en verwerken voor gepersonaliseerde advertenties.',
  ],
  [
    /^Please read the privacy statement of these social networks \(which can change regularly\) to read what they do with your \(personal\) data which they process using these cookies\. The data that is retrieved is anonymized as much as possible\. Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest and Disqus are located in the United States\.$/,
    'Lees de privacyverklaring van deze sociale netwerken (die regelmatig kan wijzigen) om te zien wat zij doen met uw (persoons)gegevens die zij via deze cookies verwerken. De opgehaalde gegevens worden zoveel mogelijk geanonimiseerd. Facebook, Twitter, LinkedIn, WhatsApp, Instagram, TikTok, Pinterest en Disqus zijn gevestigd in de Verenigde Staten.',
  ],
  [
    /^When you visit our website for the first time, we will show you a pop-up with an explanation about cookies\. As soon as you click on "Save preferences", you consent to us using the categories of cookies and plug-ins you selected in the pop-up, as described in this Cookie Policy\. You can disable the use of cookies via your browser, but please note that our website may no longer work properly\.$/,
    'Wanneer u onze website voor het eerst bezoekt, tonen wij u een pop-up met uitleg over cookies. Zodra u op “Voorkeuren opslaan” klikt, stemt u ermee in dat wij de categorieën cookies en plug-ins gebruiken die u in de pop-up heeft geselecteerd, zoals beschreven in dit cookiebeleid. U kunt het gebruik van cookies via uw browser uitschakelen, maar houd er rekening mee dat onze website dan mogelijk niet meer goed werkt.',
  ],
  [
    /^You have loaded the Cookie Policy without javascript support\.\s*On AMP, you can use the manage consent button on the bottom of the page\.$/,
    'U heeft het cookiebeleid geladen zonder JavaScript-ondersteuning. Op AMP kunt u de knop voor het beheren van toestemming onderaan de pagina gebruiken.',
  ],
  [
    /^You can use your internet browser to automatically or manually delete cookies\. You can also specify that certain cookies may not be placed\. Another option is to change the settings of your internet browser so that you receive a message each time a cookie is placed\. For more information about these options, please refer to the instructions in the Help section of your browser\.$/,
    'U kunt uw internetbrowser gebruiken om cookies automatisch of handmatig te verwijderen. U kunt ook aangeven dat bepaalde cookies niet mogen worden geplaatst. Een andere optie is de instellingen van uw internetbrowser te wijzigen zodat u een melding krijgt telkens wanneer een cookie wordt geplaatst. Voor meer informatie over deze opties, raadpleeg de instructies in de Help-sectie van uw browser.',
  ],
  [
    /^Please note that our website may not work properly if all cookies are disabled\. If you do delete the cookies in your browser, they will be placed again after your consent when you visit our website again\.$/,
    'Houd er rekening mee dat onze website mogelijk niet goed werkt als alle cookies zijn uitgeschakeld. Als u de cookies in uw browser verwijdert, worden zij na uw toestemming opnieuw geplaatst wanneer u onze website opnieuw bezoekt.',
  ],
  [
    /^To exercise these rights, please contact us\. Please refer to the contact details at the bottom of this Cookie Policy\. If you have a complaint about how we handle your data, we would like to hear from you, but you also have the right to submit a complaint to the supervisory authority \(the Data Protection Authority\)\.$/,
    'Om deze rechten uit te oefenen, neem contact met ons op. Raadpleeg de contactgegevens onderaan dit cookiebeleid. Als u een klacht heeft over hoe wij met uw gegevens omgaan, horen wij dat graag, maar u heeft ook het recht een klacht in te dienen bij de toezichthoudende autoriteit (de Autoriteit Persoonsgegevens).',
  ],
];

export function translateLegalToNl(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  if (EXACT[trimmed]) return EXACT[trimmed];

  // Strip trailing "Read more"
  const withoutReadMore = trimmed.replace(/\s*Read more\s*$/i, "").trim();
  if (withoutReadMore !== trimmed && EXACT[withoutReadMore]) {
    return EXACT[withoutReadMore];
  }

  for (const [re, nl] of PARTIAL) {
    if (re.test(trimmed)) return nl;
  }

  // Common fragments
  let out = trimmed
    .replace(/\bConsent to service\b/gi, "Toestemming voor dienst")
    .replace(/\bUnited Arab Emirates\b/g, "Verenigde Arabische Emiraten")
    .replace(/\bEmail:\b/g, "E-mail:")
    .replace(/\bRead more\b/gi, "");

  return out.trim();
}

export function translateSectionToNl(section: {
  heading: string;
  paragraphs: string[];
  bullets: string[];
}) {
  return {
    heading: translateLegalToNl(section.heading || ""),
    paragraphs: (section.paragraphs || []).map(translateLegalToNl),
    bullets: (section.bullets || []).map(translateLegalToNl),
  };
}
