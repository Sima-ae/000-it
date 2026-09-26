/**
 * Dutch kennisbank bodies for Veilig Online topics (TripleZero iT).
 * New articles use tz-vo-*.
 */
function p(...paras: string[]) {
  return paras.map((t) => `<p>${t}</p>`).join("\n");
}

function h2(t: string) {
  return `<h2>${t}</h2>`;
}

function ol(items: string[]) {
  return `<ol>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ol>`;
}

function ul(items: string[]) {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`;
}

function tip(t: string) {
  return `<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong> ${t}</p></aside>`;
}

function warn(t: string) {
  return `<aside class="kb-callout kb-callout-warn"><p><strong>Let op:</strong> ${t}</p></aside>`;
}

function outro(related?: string) {
  return p(
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem. Vermeld je domeinnaam of dienst en een korte omschrijving van het risico of incident.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in Veilig Online over phishing, wachtwoorden, malware, netwerk en privacy.`,
  );
}

type Ctx = { title: string; topic: string };

export const veiligOnlineTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-vo-2fa": () =>
    [
      p(
        `<strong>Twee-factorauthenticatie (2FA)</strong> vraagt naast je wachtwoord een tweede bewijs — meestal een code uit een authenticator-app of sms. Zo bescherm je accounts ook als een wachtwoord uitlekt.`,
      ),
      h2("Waarom 2FA"),
      ul([
        "Gestolen of gelekte wachtwoorden alleen zijn vaak niet genoeg om in te loggen.",
        "Je ziet sneller verdachte inlogpogingen via meldingen of gebruikte herstelcodes.",
        "Voor e-mail, hostingpanel, bankieren en cloudopslag is 2FA een basismaatregel.",
      ]),
      h2("Zo schakel je 2FA in"),
      ol([
        "Open de beveiligings- of accountinstellingen van de dienst (Microsoft, Google, klantenpanel, bank).",
        "Kies <strong>Authenticator-app</strong> bij voorkeur boven sms (sms is vatbaarder voor SIM-swap).",
        "Scan de QR-code met een authenticator-app en bevestig met de zescijferige code.",
        "Sla backup- of herstelcodes veilig op — buiten je inbox, bijvoorbeeld in een wachtwoordmanager.",
        "Test: log uit en opnieuw in met wachtwoord + 2FA-code.",
      ]),
      tip("Gebruik waar mogelijk één authenticator-app voor al je accounts en maak een beveiligde back-up van die app."),
      warn("Deel nooit 2FA-codes of herstelcodes met ‘helpdesk’ die jou belt of mailt. Echte support vraagt dat niet ongevraagd."),
      outro("Wachtwoordmanager; account terugkrijgen na een hack; SIM-swap voorkomen."),
    ].join("\n"),

  "tz-vo-smishing": () =>
    [
      p(
        `<strong>Smishing</strong> is phishing via sms, WhatsApp of andere chatapps. Het bericht lijkt urgent: een pakket, bank, Belastingdienst of ‘je account wordt geblokkeerd’.`,
      ),
      h2("Herkenningspunten"),
      ul([
        "Korte links of links die niet bij de echte organisatie horen.",
        "Druk om ‘nu te handelen’ of te betalen via een onbekende betaallink.",
        "Fouten in taal, of een afzender die net iets anders heet dan verwacht.",
        "Verzoek om codes, pincodes of Remote Desktop-toegang te geven.",
      ]),
      h2("Wat je doet"),
      ol([
        "Klik niet op de link. Zoek zelf de officiële site of app op (niet via het bericht).",
        "Bel de organisatie alleen via een nummer dat je al kent (factuur, bankapp, website).",
        "Blokkeer of rapporteer het nummer in de app.",
        "Is er al een code gedeeld of betaald? Neem direct contact op met bank of provider en wijzig wachtwoorden.",
      ]),
      tip("Echte pakketdiensten en banken vragen zelden via WhatsApp om te betalen of in te loggen."),
      warn("Forward verdachte berichten niet ‘ter controle’ naar vrienden met de link er nog in — zo verspreid je de scam."),
      outro("Phishing-e-mail herkennen; nep-helpdesk scams; CEO-fraude."),
    ].join("\n"),

  "tz-vo-ceo-fraude": () =>
    [
      p(
        `<strong>CEO-fraude</strong> en <strong>factuurfraude</strong> richten zich op bedrijven: een ‘directeur’ vraagt om snel over te maken, of een leverancier stuurt een nieuw rekeningnummer.`,
      ),
      h2("Typische signalen"),
      ul([
        "Dringend, geheim of ‘alleen via e-mail’ — geen belletje of tweede check toegestaan.",
        "Klein verschil in het afzenderadres (bijv. .com i.p.v. .nl, of een extra letter).",
        "Gewijzigde IBAN zonder ondertekende bevestiging via een bekend kanaal.",
        "Verzoek buiten normale processen (geen inkooporder, geen goedkeuringsflow).",
      ]),
      h2("Bescherming in de praktijk"),
      ol([
        "Hanteer een vaste regel: grote of gewijzigde betalingen altijd telefonisch bevestigen via een bekend nummer.",
        "Controleer IBAN-wijzigingen in het leveranciersportaal of met een contactpersoon die je al kent.",
        "Beperk wie bankoverschrijvingen mag goedkeuren; gebruik dual control waar mogelijk.",
        "Train medewerkers op social engineering en verdachte ‘CEO’-mails.",
      ]),
      tip("Zet een intern meldpunt: bij twijfel eerst vragen, nooit ‘snel even overmaken’."),
      warn("Is er al betaald? Neem direct contact op met je bank (fraude-afdeling) en doe aangifte. Snel handelen vergroot de kans op terugboeking."),
      outro("Phishing herkennen; wachtwoorden en 2FA; fraude voorkomen."),
    ].join("\n"),

  "tz-vo-quishing": () =>
    [
      p(
        `<strong>Quishing</strong> is phishing via QR-codes. De code lijkt legitiem (op een poster, factuur of e-mail), maar opent een valse login- of betaalpagina.`,
      ),
      h2("Risico’s"),
      ul([
        "Je scant snel zonder de URL te lezen — precies wat aanvallers willen.",
        "QR-codes op openbare plekken kunnen overstickerd zijn.",
        "Een code in een e-mail of pdf kan naar een nep-inlog leiden.",
      ]),
      h2("Veilig omgaan met QR-codes"),
      ol([
        "Controleer na het scannen de URL in de browser voordat je inlogt of betaalt.",
        "Log liever niet in via een QR van een onbekende bron; typ de officiële site zelf.",
        "Wees extra voorzichtig met QR-codes die om bankgegevens, crypto of Remote Support vragen.",
        "Op kantoor: print geen ‘betaal-QR’ van een onbekende mail zonder verificatie.",
      ]),
      tip("Veel cameras/apps tonen de link vóór openen — lees die altijd."),
      warn("Een slotje (HTTPS) op een nepdomain betekent niet dat de site betrouwbaar is — alleen dat de verbinding versleuteld is."),
      outro("HTTPS-slotje; phishing-e-mail; nepwebsites herkennen."),
    ].join("\n"),

  "tz-vo-tech-support-scam": () =>
    [
      p(
        `Bij een <strong>tech support-scam</strong> belt of mailt iemand die zich voordoet als Microsoft, Apple, je provider of TripleZero iT. Doel: toegang tot je computer of betaling voor ‘reparatie’.`,
      ),
      h2("Hoe herken je het"),
      ul([
        "Ongevraagd telefoontje over ‘virussen’ of ‘verdachte activiteit’.",
        "Verzoek om Remote Desktop, TeamViewer of AnyDesk te installeren.",
        "Pop-ups die niet weggaan en een belnummer tonen.",
        "Druk om te betalen met cadeaukaarten, crypto of overschrijving.",
      ]),
      h2("Wat je doet"),
      ol([
        "Hang op. Echte leveranciers bellen zelden ongevraagd over virussen op je pc.",
        "Geef geen toegang tot je scherm. Heb je dat al gedaan: verbreek de verbinding, wijzig wachtwoorden en scan op malware.",
        "Bel zelf terug via het nummer op de officiële website of je factuur — niet via het nummer in de pop-up.",
        "Meld fraude bij je bank als er betaald is, en bij de politie indien nodig.",
      ]),
      tip(`TripleZero iT vraagt in supporttickets nooit om je volledige wachtwoord of om ongevraagd remote tools te installeren buiten een afgesproken sessie.`),
      warn("Betaal nooit met cadeaukaarten voor ‘security support’ — dat is vrijwel altijd fraude."),
      outro("Malware herkennen; account herstellen; smishing."),
    ].join("\n"),

  "tz-vo-deepfake": () =>
    [
      p(
        `<strong>Deepfake-</strong> en <strong>voice-scams</strong> gebruiken AI om stem of beeld van een bekende na te bootsen: ‘papa, ik zit vast’ of een ‘directeur’ in een videogesprek die om een spoedbetaling vraagt.`,
      ),
      h2("Waarschuwingssignalen"),
      ul([
        "Onverwacht verzoek om geld, codes of gevoelige data — vaak met paniek.",
        "Stem klinkt bijna goed, maar gesprek is kort, eenzijdig of vermijdt persoonlijke vragen.",
        "Weigering om via een tweede kanaal te bevestigen (terugbellen op bekend nummer).",
        "Druk om ‘niemand te vertellen’ of ‘alleen via deze link’.",
      ]),
      h2("Bescherming"),
      ol([
        "Spreek een familiecode of controlevraag af die alleen jullie kennen.",
        "Belt ‘iemand’ om geld: hang op en bel zelf terug op het nummer in je contacten.",
        "Zakelijk: grote betalingen altijd via dual control en bekend telefoonnummer.",
        "Deel weinig openbare audio/video waarmee stemmen makkelijk te klonen zijn.",
      ]),
      tip("Twijfel = stoppen. Een echte naaste of collega begrijpt een korte verificatiestap."),
      warn("Stuur nooit 2FA-codes of Remote Access-links door, ook niet als de stem ‘bekend’ klinkt."),
      outro("CEO-fraude; social engineering; 2FA."),
    ].join("\n"),

  "tz-vo-password-manager": () =>
    [
      p(
        `Een <strong>wachtwoordmanager</strong> bewaart unieke, sterke wachtwoorden achter één hoofdwachtwoord (en bij voorkeur 2FA). Zo hoef je niets te hergebruiken.`,
      ),
      h2("Waar let je op bij de keuze"),
      ul([
        "End-to-end encryptie en een betrouwbare leverancier met een goed beveiligingsverhaal.",
        "Apps voor desktop en telefoon, plus veilige autofill in de browser.",
        "Mogelijkheid tot noodtoegang of export voor jezelf (secure backup).",
        "Ondersteuning voor 2FA / TOTP in de kluis waar mogelijk.",
      ]),
      h2("Veilig gebruik"),
      ol([
        "Kies een lang, uniek hoofdwachtwoord dat je nergens anders gebruikt.",
        "Schakel 2FA in op de wachtwoordmanager zelf.",
        "Vervang hergebruikte wachtwoorden stapsgewijs door unieke entries.",
        "Deel kluisitems alleen via de deelfunctie van de manager — niet via chat.",
        "Maak een beveiligde back-up/export volgens de documentatie van de tool.",
      ]),
      tip("Begin met je e-mail, bank, hostingpanel en cloud — die accounts openen de rest."),
      warn("Sla het hoofdwachtwoord niet op in dezelfde browser zonder 2FA, en niet in een plain-tekstbestand op je bureaublad."),
      outro("Sterke wachtwoorden; 2FA; wachtwoord veilig kopiëren."),
    ].join("\n"),

  "tz-vo-account-recovery": () =>
    [
      p(
        `Is een account gehackt of vermoed je misbruik? Handel snel: toegang herstellen, schade beperken en herhaling voorkomen.`,
      ),
      h2("Directe stappen"),
      ol([
        "Gebruik de officiële ‘account herstellen’ / ‘wachtwoord vergeten’-flow van de dienst.",
        "Wijzig het wachtwoord vanaf een schoon, vertrouwd apparaat.",
        "Schakel 2FA in of reset 2FA als de aanvaller die heeft overgenomen (via herstelcodes of support).",
        "Controleer doorgestuurde e-mailregels, app-wachtwoorden, API-tokens en ‘vertrouwde apparaten’.",
        "Log alle andere sessies uit.",
      ]),
      h2("Daarna"),
      ul([
        "Controleer of hetzelfde wachtwoord elders is gebruikt — wijzig die accounts ook.",
        "Scan je apparaat op malware als de inlog via jouw pc ging.",
        "Waarschuw contacten als er spam of oplichting vanaf jouw account is verstuurd.",
        "Bewaar bewijs (mails, logs) voor support of aangifte.",
      ]),
      tip(`Voor hosting- of e-mailaccounts bij TripleZero iT: open een ticket met domeinnaam, tijdstip en wat je ziet — wij helpen met reset en controle.`),
      warn("Betaal geen ‘herstelbedrijven’ die jou ongevraagd benaderen na een hackmelding."),
      outro("2FA; wachtwoordmanager; malware herkennen."),
    ].join("\n"),

  "tz-vo-sim-swap": () =>
    [
      p(
        `Bij <strong>SIM-swap</strong> (of SIM-port) fraude laten criminelen je telefoonnummer overzetten naar hun sim. Daarna onderscheppen ze sms-codes en resetten ze accounts.`,
      ),
      h2("Signalen"),
      ul([
        "Plotseling geen bereik terwijl anderen je wel kunnen sms’en/bellen.",
        "Meldingen van je provider over een nieuwe sim of nummerwijziging die jij niet hebt aangevraagd.",
        "Onverwachte wachtwoordresets via sms.",
      ]),
      h2("Voorkomen"),
      ol([
        "Vraag bij je provider om een extra sim- of poortpin / beveiliging tegen ongevraagde overzetting.",
        "Gebruik voor belangrijke accounts een authenticator-app in plaats van sms-2FA.",
        "Deel je telefoonnummer niet onnodig openbaar en wees voorzichtig met phishing die om ‘klantgegevens’ vraagt.",
        "Houd herstel-e-mailadressen en back-upcodes up-to-date.",
      ]),
      h2("Als het gebeurt"),
      ol([
        "Neem direct contact op met je provider (via een bekend nummer of winkel) om het nummer terug te zetten.",
        "Wijzig wachtwoorden van e-mail, bank en belangrijke diensten via wifi op een veilig apparaat.",
        "Meld fraude bij bank en eventueel politie.",
      ]),
      tip("Authenticator-apps werken ook zonder je sim — daarom zijn ze veiliger dan sms-codes."),
      warn("Geef nooit een ‘provider-medewerker’ die jou belt je sim-puk of volledige legitimatie via chat."),
      outro("2FA; account herstellen; smishing."),
    ].join("\n"),

  "tz-vo-ransomware": () =>
    [
      p(
        `<strong>Ransomware</strong> versleutelt bestanden en eist losgeld. Soms dreigen aanvallers ook met publicatie van gestolen data.`,
      ),
      h2("Herkennen"),
      ul([
        "Bestanden openen niet meer; extensies zijn veranderd.",
        "Losgeldbrief (txt/html) op het bureaublad of in mappen.",
        "Trage pc, verdachte processen, uitgeschakelde back-ups of shadow copies.",
      ]),
      h2("Wat te doen bij infectie"),
      ol([
        "Koppel het apparaat los van het netwerk (kabel/wifi uit) om verspreiding te beperken.",
        "Betaal niet blind — losgeld garandeert geen herstel en financiert criminaliteit.",
        "Schakel IT-hulp of TripleZero iT-support in; documenteer wat er gebeurde.",
        "Herstel vanuit een schone, offline of offsite back-up ná verwijdering van de malware.",
        "Wijzig wachtwoorden vanaf een schoon apparaat; controleer of e-mail/hosting ook geraakt is.",
      ]),
      h2("Voorkomen"),
      ul([
        "Automatische updates voor OS, browsers en plugins.",
        "3-2-1 back-ups: minstens één kopie offline of immutable.",
        "Geen onbekende bijlagen; beperk admin-rechten.",
        "2FA op e-mail en cloud — vaak de start van ransomware via phishing.",
      ]),
      tip("Test af en toe of je een bestand écht kunt terugzetten uit backup — een ongecontroleerde backup is geen backup."),
      warn("Nep-‘decryptors’ of ongevraagde helpdesk na ransomware zijn vaak een tweede scam."),
      outro("Back-ups als beveiliging; malware; phishing."),
    ].join("\n"),

  "tz-vo-safe-downloads": () =>
    [
      p(
        `Malware komt vaak binnen via een ‘handige’ download of een bijlage die eruitziet als pdf of factuur. Een paar vaste gewoontes voorkomen veel schade.`,
      ),
      h2("Veilige gewoontes"),
      ol([
        "Download software alleen van de officiële site of de app store — niet via pop-ups of ‘downloadmanagers’.",
        "Controleer het afzenderadres en of je de bijlage verwachtte voordat je opent.",
        "Wees alert op dubbele extensies (factuur.pdf.exe) en macro’s in Office-bestanden.",
        "Scan verdachte bestanden met actuele antivirus/antimalware.",
        "Open gevoelige bijlagen liever in de webversie of een sandbox als je twijfelt.",
      ]),
      h2("Na een verdachte openpoging"),
      ul([
        "Sluit het bestand; verbind tijdelijk geen netwerkschijven.",
        "Draai een volledige scan; wijzig wachtwoorden als er credentials gevraagd werden.",
        "Meld het intern of via een ticket bij TripleZero iT als het om zakelijke mail/hosting gaat.",
      ]),
      tip("Heb je een bestand ‘moeten’ ontvangen? Vraag de afzender via een ander kanaal of het echt van hen komt."),
      warn("Crack-/keygen-sites en ‘gratis Office’ zijn een klassieke malwarebron."),
      outro("Ransomware; browseruitbreidingen; phishing."),
    ].join("\n"),

  "tz-vo-browser-extensions": () =>
    [
      p(
        `Browseruitbreidingen (extensies) kunnen handig zijn, maar vragen vaak verregaande rechten: alle websites lezen, gegevens wijzigen of traffic zien.`,
      ),
      h2("Veilig kiezen"),
      ul([
        "Installeer alleen vanuit de officiële store van je browser.",
        "Kies extensies met veel reviews, recente updates en een duidelijke uitgever.",
        "Wees kritisch bij ‘gratis VPN’, coupon- of ‘cleaner’-extensies — die zijn vaak riskant.",
        "Lees welke rechten worden gevraagd: toegang tot álle sites is zelden nodig voor een simpele tool.",
      ]),
      h2("Onderhoud"),
      ol([
        "Verwijder extensies die je niet meer gebruikt.",
        "Controleer periodiek de lijst geïnstalleerde add-ons.",
        "Na een verdachte installatie: verwijderen, wachtwoorden wijzigen, sessies uitloggen.",
      ]),
      tip("Voor bankieren en admin-panels kun je een aparte browser of strikt profiel zonder extra extensies gebruiken."),
      warn("Een gehackte of verkochte extensie kan overnight kwaadaardig worden — updates en recensies blijven belangrijk."),
      outro("Veilig downloaden; account herstellen; software-updates."),
    ].join("\n"),

  "tz-vo-software-updates": () =>
    [
      p(
        `<strong>Software-updates</strong> dichten bekende beveiligingslekken. Uitstel is een van de meest voorkomende oorzaken van hacks op pc’s, telefoons en websites.`,
      ),
      h2("Wat je bijwerkt"),
      ul([
        "Besturingssysteem (Windows, macOS, iOS, Android).",
        "Browsers en veelgebruikte apps.",
        "Firmware van router en slimme apparaten.",
        "Website: CMS, plugins, thema’s en PHP — via hostingpanel of TripleZero iT-beheer.",
      ]),
      h2("Praktische aanpak"),
      ol([
        "Zet automatische updates aan waar dat veilig kan.",
        "Plan wekelijks een kort onderhoudsmoment voor handmatige checks.",
        "Test kritieke zakelijke systemen kort na een update (of gebruik staging).",
        "Houd een back-up vóór grote CMS- of serverupdates.",
      ]),
      tip(`Op hosting bij TripleZero iT helpen tools zoals Patchman en panel-updates om kwetsbare componenten sneller te spotten.`),
      warn("Negeer geen ‘kritieke beveiligingsupdate’ omdat ‘alles nog werkt’ — aanvallers scannen juist op oude versies."),
      outro("Ransomware; malware; Patchman."),
    ].join("\n"),

  "tz-vo-https-slotje": () =>
    [
      p(
        `Het <strong>slotje</strong> in de adresbalk betekent dat de verbinding met de website via <strong>HTTPS</strong> is versleuteld. Het zegt niet automatisch dat de website eerlijk of veilig is.`,
      ),
      h2("Wat HTTPS wél doet"),
      ul([
        "Versleutelt verkeer tussen jou en de server (lastiger afluisteren op wifi).",
        "Toont dat er een certificaat is gekoppeld aan die domeinnaam.",
        "Is de standaard voor inloggen, betalen en webmail.",
      ]),
      h2("Wat HTTPS níet garandeert"),
      ul([
        "Dat het domein van een betrouwbare organisatie is — nepshops hebben ook vaak HTTPS.",
        "Dat de inhoud veilig is (malware-downloads kunnen via HTTPS).",
        "Dat je op de site bent die je dacht — controleer de domeinnaam zorgvuldig.",
      ]),
      h2("Checklist bij inloggen of betalen"),
      ol([
        "Lees de volledige URL (geen lookalike-domeinen).",
        "Controleer of je de officiële site zelf hebt getypt of via een vertrouwde bladwijzer kwam.",
        "Bij twijfel: niet inloggen; zoek het bedrijf via een andere bron.",
      ]),
      tip(`Voor je eigen site bij TripleZero iT: activeer Let’s Encrypt of een SSL-certificaat en forceer HTTPS — zie ook de SSL-artikelen in de kennisbank.`),
      warn("Een rood waarschuwingsscherm over een ongeldig certificaat negeer je niet ‘even snel’ op een inlogpagina."),
      outro("Nepwebsites herkennen; openbare wifi; SSL-certificaten."),
    ].join("\n"),

  "tz-vo-backups-security": () =>
    [
      p(
        `Een goede <strong>back-up</strong> is een beveiligingsmaatregel: bij ransomware, hacks, foutieve deletes of hardwarefalen kun je terugkeren zonder losgeld of dataverlies.`,
      ),
      h2("Basisregels"),
      ul([
        "3-2-1: drie kopieën, twee mediatypen, één offsite/offline.",
        "Test herstel regelmatig — anders weet je niet of de backup werkt.",
        "Bewaar back-ups buiten het bereik van ransomware (niet alleen op dezelfde pc).",
        "Versleutel gevoelige back-ups en bescherm toegang met sterke accounts + 2FA.",
      ]),
      h2("Voor websites en e-mail"),
      ol([
        "Gebruik de backupfunctie in je hostingpanel of de backups die TripleZero iT levert.",
        "Maak vóór grote updates of migraties een extra handmatige snapshot.",
        "Bewaar ook DNS- en mailbox-overzichten — niet alleen bestanden.",
      ]),
      tip("Noteer wáár je back-ups staan en hoe je ze terugzet; bewaar die instructie buiten alleen je hoofd."),
      warn("Een synchronisatiemap (alleen OneDrive/Dropbox zonder versiegeschiedenis-strategie) is geen volwaardige disaster-backup."),
      outro("Ransomware; software-updates; support/backups bij TripleZero iT."),
    ].join("\n"),

  "tz-vo-online-shopping": () =>
    [
      p(
        `Veilig <strong>online winkelen</strong> draait om de webshop, de betaalmethode en wat je deelt — niet alleen om een slotje in de browser.`,
      ),
      h2("Controleer de shop"),
      ul([
        "Bekende winkels of duidelijke KvK-/contactgegevens en een fysiek adres.",
        "Realistische prijzen — ‘90% korting’ op A-merken is vaak nep.",
        "Reviews van onafhankelijke bronnen; wantrouw alleen-vijfsterrenberichten.",
        "URL en schrijfwijze van het domein (geen lookalikes).",
      ]),
      h2("Veilig betalen"),
      ol([
        "Gebruik bij voorkeur iDEAL, creditcard met buyer protection of een bekende betaaldienst — niet zomaar vooraf overschrijven naar een privé-IBAN.",
        "Deel nooit je volledige pincode of 2FA-codes met ‘support’ van de shop.",
        "Bewaar orderbevestiging en betaalbewijs.",
        "Controleer je bankafschriften op onbekende afschrijvingen.",
      ]),
      tip("Voor herhaalde aankopen: bewaar wachtwoorden in een manager en schakel 2FA in op je shop-accounts."),
      warn("Betaalverzoeken via WhatsApp ‘namens de bezorger’ zijn vrijwel altijd fraude."),
      outro("HTTPS-slotje; identiteitsdiefstal; smishing."),
    ].join("\n"),

  "tz-vo-identity-theft": () =>
    [
      p(
        `Bij <strong>identiteitsdiefstal</strong> misbruiken criminelen jouw gegevens om accounts te openen, bestellingen te plaatsen of fraude te plegen op jouw naam.`,
      ),
      h2("Signalen"),
      ul([
        "Rekeningen, aanmaningen of bestellingen die jij niet kent.",
        "Wijzigingen in DigiD, bank of e-mail die jij niet hebt gedaan.",
        "Krediet- of abonnementsaanvragen zonder jouw medeweten.",
        "Post of e-mail over accounts die jij niet hebt geopend.",
      ]),
      h2("Wat te doen"),
      ol([
        "Wijzig wachtwoorden van e-mail en belangrijke diensten; schakel 2FA in.",
        "Neem contact op met bank, DigiD-hulp en betrokken organisaties.",
        "Meld fraude bij de politie en bewaar bewijsstukken.",
        "Controleer of er doorstuurregels of nieuwe hersteladressen zijn toegevoegd.",
        "Overweeg een melding bij relevante frauderegisters waar van toepassing.",
      ]),
      tip("Deel BSN, paspoortkopieën en bankpassen nooit via onbeveiligde kanalen; watermerk kopieën die je wél moet delen."),
      warn("Reageer niet op ‘we hebben je ID nodig anders blokkeren we’ via een link in een vreemde mail — dat kan juist de diefstal zijn."),
      outro("Datalek; account herstellen; phishing."),
    ].join("\n"),

  "tz-vo-social-privacy": () =>
    [
      p(
        `Social media zijn handig, maar standaardinstellingen delen vaak meer dan je wilt: locatie, vriendenlijst, foto’s en contactgegevens.`,
      ),
      h2("Checklist privacy"),
      ol([
        "Zet profielen op ‘vrienden/alleen ik’ waar het kan; beperk wie je posts ziet.",
        "Schakel onnodige locatie- en gezichtsherkenning uit.",
        "Beperk wie je kan taggen of berichten sturen.",
        "Controleer verbonden apps en trek oude rechten in.",
        "Gebruik een sterk uniek wachtwoord + 2FA op elk platform.",
      ]),
      h2("Extra voorzichtig"),
      ul([
        "Deel geen foto’s van tickets, badges of documenten met scanbare codes.",
        "Wees terughoudend met ‘quizzes’ die om persoonlijke antwoorden vragen (moeder’s meisjesnaam, eerste school).",
        "Accepteer geen vriendschapsverzoeken van lookalike-profielen van bekenden.",
      ]),
      tip("Eens per kwartaal: scroll door privacy- en beveiligingsinstellingen — platforms wijzigen menu’s regelmatig."),
      warn("Publieke vakantieposts in real time vertellen inbrekers dat je niet thuis bent."),
      outro("Kinderen online beschermen; 2FA; identiteitsdiefstal."),
    ].join("\n"),

  "tz-vo-iot": () =>
    [
      p(
        `<strong>IoT</strong> (slimme lampen, camera’s, thermostaten, printers) hangt aan je thuisnetwerk. Zwakke standaardwachtwoorden maken ze een makkelijke ingang voor aanvallers.`,
      ),
      h2("Basisbeveiliging"),
      ol([
        "Wijzig direct het fabriekswachtwoord van elk apparaat en van je router.",
        "Zet apparaten op een apart gast- of IoT-wifi-netwerk als je router dat ondersteunt.",
        "Schakel automatische firmware-updates in; check handmatig of er nog patches zijn.",
        "Zet UPnP en onnodige externe toegang (poortforwards) uit tenzij je het écht nodig hebt.",
        "Koop merken die nog updates krijgen; oude ‘slimme’ gadgets zonder patches zijn risico’s.",
      ]),
      h2("Camera’s en microfoons"),
      ul([
        "Gebruik unieke accounts en 2FA op de cloud-app van de fabrikant.",
        "Deel geen live streams publiek; beperk wie meekijkt.",
        "Plaats geen camera’s waar privacy gevoelig is zonder duidelijke afspraken.",
      ]),
      tip("Een sterke routewachtwoord + WPA3/WPA2 en een aparte SSID voor gasten beschermen je pc’s beter tegen gehackte gadgets."),
      warn("Plug-and-play apparaten die ‘geen account nodig hebben’ maar wél open op internet staan, zijn vaak het gevaarlijkst."),
      outro("Router beveiligen; VPN; smartphone beveiligen."),
    ].join("\n"),

  "tz-vo-smartphone": () =>
    [
      p(
        `Je smartphone bevat mail, bankapps, 2FA en foto’s van documenten. Goede <strong>vergrendeling, app-keuze en toestemmingen</strong> horen bij veilig online.`,
      ),
      h2("Apparaat beveiligen"),
      ol([
        "Gebruik een sterke pincode/biometrie; schakel automatisch vergrendelen in.",
        "Houd iOS/Android en apps up-to-date.",
        "Installeer apps alleen uit de officiële store; controleer rechten (camera, microfoon, contacten).",
        "Schakel ‘Zoek mijn iPhone/Apparaat’ in voor wissen op afstand bij diefstal.",
        "Wees voorzichtig met openbare oplaadpunten (liever eigen adapter/powerbank).",
      ]),
      h2("Accounts en data"),
      ul([
        "2FA op Apple ID / Google-account.",
        "Geen gevoelige codes in gewone fotoalbums zonder bescherming.",
        "Beperk notificatie-voorbeelden op het vergrendelscherm (geen sms-codes tonen).",
      ]),
      tip("Maak regelmatig een versleutelde back-up; test of je een nieuw toestel kunt herstellen."),
      warn("Sideloaden van ‘mod’-apps of onbekende APK’s is een veelgebruikte malware-route op Android."),
      outro("Software-updates; 2FA; SIM-swap; IoT."),
    ].join("\n"),
};
