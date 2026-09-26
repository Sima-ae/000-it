/**
 * Dutch kennisbank bodies for Microsoft 365 topics (TripleZero iT).
 */
const BRAND = "TripleZero iT";

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
    `Heb je na het volgen van deze stappen nog vragen? Neem contact op met TripleZero iT support via het ticketssysteem. Vermeld je Microsoft 365-domein, de betrokken gebruiker en wat je al geprobeerd hebt.`,
    related
      ? `Gerelateerd: ${related}`
      : `Bekijk ook andere artikelen in Microsoft 365 over mail, Teams, OneDrive, beheer en beveiliging.`,
  );
}

type Ctx = { title: string; topic: string };

export const microsoftTopicBuilders: Record<string, (ctx: Ctx) => string> = {
  "tz-m365-alias-mailbox": () =>
    [
      p(
        `Een <strong>alias</strong> (proxy-adres) is een extra e-mailadres op dezelfde mailbox. Mail naar het alias komt in hetzelfde postvak terecht — handig voor info@, sales@ of een oude domeinnaam.`,
      ),
      h2("Voorwaarden"),
      ul([
        "Het domein moet geverifieerd zijn in Microsoft 365.",
        "Je hebt rechten als beheerder (Exchange of globale beheerder).",
        "Het alias mag niet al als primair adres of gedeeld postvak bestaan.",
      ]),
      h2("Stappen"),
      ol([
        "Open het Microsoft 365-beheercentrum → Gebruikers → Actieve gebruikers.",
        "Selecteer de gebruiker → tabblad Mail → E-mailaliassen beheren.",
        "Voeg het alias toe (bijv. info@jouwdomein.nl) en sla op.",
        "Wacht enkele minuten en stuur een testmail naar het alias.",
        "Controleer of Outlook/OWA het bericht toont in hetzelfde postvak.",
      ]),
      tip("Wil je verzenden als info@? Stel ‘Verzenden als’ in of gebruik een gedeeld postvak."),
      warn("Een alias is geen aparte mailbox: wachtwoord en opslag blijven bij de primaire gebruiker."),
      outro("Gedeelde postvakken; distributiegroep aanmaken."),
    ].join("\n"),

  "tz-m365-distributiegroep": () =>
    [
      p(
        `Een <strong>distributiegroep</strong> of <strong>Microsoft 365-groep</strong> stuurt één adres door naar meerdere leden. Kies een distributiegroep voor pure mail-lijsten; een M365-groep als je ook Teams/SharePoint wilt.`,
      ),
      h2("Welke kies je"),
      ul([
        "Distributiegroep — alleen e-mail doorsturen naar leden.",
        "Microsoft 365-groep — mail + gedeelde bestanden, planner, optioneel Team.",
        "Beveiligingsgroep — rechten op resources, niet bedoeld als mail-lijst.",
      ]),
      h2("Stappen (distributiegroep)"),
      ol([
        "Ga naar Exchange-beheercentrum → Ontvangers → Groepen.",
        "Kies Distributielijst toevoegen en geef een naam en e-mailadres.",
        "Voeg leden toe en stel eigenaren in.",
        "Bepaal of externe afzenders mogen mailen (vaak uit voor spam).",
        "Test met een mail naar het groepsadres.",
      ]),
      tip("Beperk wie naar de groep mag mailen als het adres openbaar is."),
      outro("Alias toevoegen; gedeelde postvakken."),
    ].join("\n"),

  "tz-m365-agenda-delen": () =>
    [
      p(
        `In Outlook met Microsoft 365 deel je je agenda met collega’s of externen, met rechten van ‘alleen beschikbaar’ tot ‘bewerken’.`,
      ),
      h2("Delen vanuit Outlook"),
      ol([
        "Open Outlook → Agenda → klik met rechts op je agenda → Delen.",
        "Voer het e-mailadres van de ontvanger in.",
        "Kies het rechtenniveau (beschikbaarheid, details, bewerken).",
        "Verstuur de uitnodiging; de ontvanger accepteert in Outlook of OWA.",
      ]),
      h2("Rechtenniveaus"),
      ul([
        "Beschikbaarheid — alleen vrij/bezet.",
        "Beperkte details — onderwerp en locatie zichtbaar.",
        "Volledige details — alles lezen.",
        "Bewerken — afspraken maken of wijzigen.",
      ]),
      tip("Voor receptie of management: deel met ‘bewerken’ via een gedeelde mailbox of gedelegeerde toegang."),
      warn("Externe deel-links kunnen gevoelige afspraakdetails tonen — kies bewust."),
      outro("Out of Office; Outlook-profielproblemen."),
    ].join("\n"),

  "tz-m365-out-of-office": () =>
    [
      p(
        `Een <strong>automatisch antwoord</strong> (Out of Office) in Exchange Online laat afzenders weten dat je afwezig bent. Je kunt interne en externe teksten apart instellen.`,
      ),
      h2("Instellen in Outlook of OWA"),
      ol([
        "Open Outlook op het web of de desktop-app.",
        "Ga naar Instellingen → Mail → Automatische antwoorden.",
        "Schakel in en vul start- en eindtijd in (of laat open).",
        "Schrijf een korte interne en optioneel externe tekst.",
        "Sla op en test met een mail vanaf een ander account.",
      ]),
      h2("Tips voor de tekst"),
      ul([
        "Vermeld terugkeerdatum en wie te bereiken is bij spoed.",
        "Geen gevoelige klant- of projectdetails in externe antwoorden.",
        "Zet het antwoord uit zodra je terug bent.",
      ]),
      tip("Voor gedeelde postvakken stel je het antwoord in namens dat postvak of via Exchange-regels."),
      outro("E-mail doorsturen; alias toevoegen."),
    ].join("\n"),

  "tz-m365-mail-doorsturen": () =>
    [
      p(
        `Doorsturen in Exchange Online kan via een <strong>inboxregel</strong> of via <strong>doorsturen op mailboxniveau</strong>. Kies bewust: permanente doorsturen naar extern kan securitybeleid raken.`,
      ),
      h2("Inboxregel (gebruiker)"),
      ol([
        "Open Outlook op het web → Instellingen → Mail → Regels.",
        "Maak een regel: alle berichten → doorsturen / omleiden naar adres.",
        "Sla op en test met een externe mail.",
      ]),
      h2("Beheerder: doorsturen op mailbox"),
      ol([
        "Microsoft 365-beheercentrum → Gebruikers → selecteer gebruiker → Mail.",
        "E-mail doorsturen instellen naar het doeladres.",
        "Kies of een kopie in het oorspronkelijke postvak blijft.",
        "Controleer of externe doorsturen is toegestaan in het organisatiebeleid.",
      ]),
      warn("Ongecontroleerde externe doorsturen is een veelgebruikte aanvalsvector. Beperk dit tot bekende adressen."),
      tip("Voor info@ → team: overweeg een gedeeld postvak of distributiegroep i.p.v. doorsturen."),
      outro("Gedeelde postvakken; phishing herkennen."),
    ].join("\n"),

  "tz-m365-autodiscover-outlook": () =>
    [
      p(
        `Als Outlook geen verbinding maakt of steeds naar wachtwoord vraagt, zit het probleem vaak in <strong>Autodiscover</strong>, een corrupt profiel of verouderde DNS.`,
      ),
      h2("Snelle checks"),
      ol([
        "Test eerst in Outlook op het web (OWA): werkt mail daar wel, dan is Exchange Online oké.",
        "Controleer of je inlogt met het volledige e-mailadres (UPN).",
        "Controleer DNS: autodiscover CNAME naar autodiscover.outlook.com.",
        "Verwijder oude IMAP/POP-profielen; M365 gebruikt Exchange (Modern Auth).",
      ]),
      h2("Outlook-profiel herstellen"),
      ol([
        "Sluit Outlook.",
        "Open Configuratiescherm → Mail → Profielen tonen.",
        "Maak een nieuw profiel aan en voeg het account opnieuw toe.",
        "Stel het nieuwe profiel in als standaard en start Outlook.",
      ]),
      tip("Op Mac: verwijder het account in Outlook-voorkeuren en voeg het opnieuw toe via Microsoft 365."),
      warn("Wijzig geen MX tijdens troubleshooting tenzij DNS echt fout staat — dat onderbreekt alle mail."),
      outro("Microsoft 365 mail in Outlook; DNS-records controleren."),
    ].join("\n"),

  "tz-m365-teams-installeren": () =>
    [
      p(
        `Microsoft Teams werkt in de browser, als desktop-app en op telefoon. Voor dagelijks gebruik is de app stabieler (meldingen, vergaderingen, bestanden).`,
      ),
      h2("Desktop"),
      ol([
        "Ga naar teams.microsoft.com of de Microsoft 365-portal.",
        "Download Teams voor Windows of Mac en installeer.",
        "Log in met je werkaccount (hetzelfde als Outlook/M365).",
        "Sta meldingen toe in het OS als je calls niet wilt missen.",
      ]),
      h2("Telefoon"),
      ol([
        "Installeer Microsoft Teams uit de App Store of Google Play.",
        "Log in met je M365-account (niet je privé Microsoft-account tenzij dat bedoeld is).",
        "Schakel pushmeldingen in voor chats en vergaderingen.",
      ]),
      tip("Werkt de login niet? Controleer of je licentie Teams bevat (bijv. Business Basic/Standard)."),
      outro("Vergadering plannen; Teams-meldingen beheren."),
    ].join("\n"),

  "tz-m365-teams-vergadering": () =>
    [
      p(
        `Vergaderingen in Teams plan je vanuit Teams of Outlook. Deelnemers krijgen een link; externe gasten kunnen meestal meedoen zonder vaste licentie.`,
      ),
      h2("Plan vanuit Teams"),
      ol([
        "Open Agenda in Teams → Nieuwe vergadering.",
        "Vul titel, tijd, deelnemers en optioneel een kanaal in.",
        "Voeg een agenda toe en verstuur.",
        "Deel de deelnamekoppeling als iemand buiten je organisatie komt.",
      ]),
      h2("Tijdens de vergadering"),
      ul([
        "Dempen, camera, chat en scherm delen via de werkbalk.",
        "Lobby: laat externe deelnemers toe of blokkeer onbekenden.",
        "Opname alleen als beleid dat toestaat en deelnemers geïnformeerd zijn.",
      ]),
      tip("Plan terugkerende stand-ups als reeks in Outlook/Teams zodat de link vast blijft."),
      outro("Gastgebruikers; Teams installeren."),
    ].join("\n"),

  "tz-m365-teams-gasten": () =>
    [
      p(
        `Gasttoegang laat externe personen meedoen in Teams (chat, kanalen, bestanden) met hun eigen werk- of Microsoft-account — zonder volledige licentie in jouw tenant.`,
      ),
      h2("Voorwaarden"),
      ul([
        "Gasttoegang moet in Azure AD / Entra ID zijn toegestaan.",
        "Team-eigenaar mag gasten toevoegen (vaak standaard aan).",
        "Gasten hebben beperkte rechten t.o.v. leden.",
      ]),
      h2("Gast uitnodigen"),
      ol([
        "Open het Team → … → Lid toevoegen.",
        "Voer het e-mailadres van de gast in en bevestig als gast.",
        "De gast accepteert de uitnodiging per e-mail.",
        "Plaats de gast in de juiste kanalen (privékanalen apart regelen).",
      ]),
      warn("Deel geen gevoelige kanalen met gasten zonder noodzaak. Review gasten periodiek."),
      tip("Voor eenmalige meetings is een vergaderlink vaak genoeg — geen vast teamlidmaatschap nodig."),
      outro("Bestanden delen via kanalen; beveiliging en privacy."),
    ].join("\n"),

  "tz-m365-teams-bestanden": () =>
    [
      p(
        `Bestanden in een Teams-kanaal landen in de gekoppelde <strong>SharePoint</strong>-bibliotheek. Zo werk je samen met versies, rechten en sync via OneDrive.`,
      ),
      h2("Uploaden en delen"),
      ol([
        "Open het kanaal → tabblad Bestanden.",
        "Upload of sleep documenten; of maak Word/Excel/PowerPoint online aan.",
        "Gebruik ‘Delen’ voor een link met de juiste rechten (weergave/bewerken).",
        "Open ‘In SharePoint openen’ voor geavanceerde bibliotheekopties.",
      ]),
      h2("Goede gewoontes"),
      ul([
        "Werk in één kanaalmap per project — niet alles in chat-bijlagen.",
        "Gebruik versiegeschiedenis i.p.v. ‘definitief_v3_final.docx’.",
        "Sync de bibliotheek naar Verkenner/Finder via OneDrive indien nodig.",
      ]),
      tip("Chat-bestanden zijn lastiger te vinden; kanaalbestanden zijn doorzoekbaar en beheerbaar."),
      outro("OneDrive vs SharePoint; externe delen via OneDrive."),
    ].join("\n"),

  "tz-m365-teams-meldingen": () =>
    [
      p(
        `Te veel Teams-meldingen leidt tot negeren; te weinig tot gemiste calls. Stem status, kanalen en stille uren af op je werkritme.`,
      ),
      h2("Status en beschikbaarheid"),
      ol([
        "Klik op je profielfoto → stel Beschikbaar, Bezet, Niet storen of Afwezig in.",
        "Koppel agenda-status zodat meetings automatisch ‘Bezet’ tonen.",
        "Gebruik ‘Niet storen’ alleen kort — calls worden dan ook gedempt.",
      ]),
      h2("Meldingen per kanaal"),
      ul([
        "Kanaal → … → Kanaalmeldingen: alles, vermeldingen alleen, of uit.",
        "Dempen van drukke kanalen die je niet actief volgt.",
        "Op mobiel: beperk push tot chats/calls als je overspoeld wordt.",
      ]),
      tip("Voor support of receptie: houd calls en @vermeldingen altijd aan."),
      outro("Vergadering plannen; Teams installeren."),
    ].join("\n"),

  "tz-m365-onedrive-vs-sharepoint": () =>
    [
      p(
        `<strong>OneDrive</strong> is je persoonlijke cloudbestanden; <strong>SharePoint</strong> (en Teams-bestanden) is team- of organisatieruimte. Beide horen bij Microsoft 365 en delen dezelfde opslagpool per licentie.`,
      ),
      h2("Wanneer OneDrive"),
      ul([
        "Concepten en bestanden die vooral van jou zijn.",
        "Delen met één of enkele personen tijdelijk.",
        "Sync van ‘Mijn bestanden’ naar je pc.",
      ]),
      h2("Wanneer SharePoint / Teams"),
      ul([
        "Project- of afdelingsdocumenten met vaste eigenaren.",
        "Rechten per site of bibliotheek, niet per persoonlijk account.",
        "Samenwerken in kanalen met vaste structuur.",
      ]),
      tip("Verlaat een medewerker het bedrijf: OneDrive moet je overdragen; SharePoint blijft bij de site."),
      outro("SharePoint-teamsite; gebruiker offboarden."),
    ].join("\n"),

  "tz-m365-onedrive-extern-delen": () =>
    [
      p(
        `OneDrive laat je bestanden delen met mensen buiten je organisatie via een link. Kies rechten en vervaldatum bewust — vooral bij klant- of financiële documenten.`,
      ),
      h2("Veilig delen"),
      ol([
        "Selecteer het bestand of de map in OneDrive → Delen.",
        "Kies ‘Specifieke personen’ i.p.v. ‘Iedereen met de link’ waar mogelijk.",
        "Stel weergave of bewerken in; blokkeer download indien nodig.",
        "Voeg een vervaldatum en wachtwoord toe als beleid dat toestaat.",
        "Controleer later onder ‘Beheer toegang’ wie nog toegang heeft.",
      ]),
      warn("‘Iedereen met de link’ kan doorsturen. Gebruik dat alleen voor niet-gevoelige bestanden."),
      tip("Organisatiebeleid kan externe delen beperken — vraag je beheerder of TripleZero iT als een optie grijs is."),
      outro("OneDrive sync-problemen; phishing herkennen."),
    ].join("\n"),

  "tz-m365-onedrive-sync": () =>
    [
      p(
        `OneDrive-syncproblemen tonen zich als rode kruisjes, ‘verwerking’ die blijft hangen of bestanden die alleen online staan terwijl je offline wilt werken.`,
      ),
      h2("Stappen om te herstellen"),
      ol([
        "Klik op het OneDrive-wolkpictogram → bekijk foutmeldingen.",
        "Pauzeer sync 2 uur, herstart daarna sync.",
        "Controleer of je bent aangemeld met het juiste werkaccount.",
        "Sluit bestanden die openstaan in Office (vergrendelingen).",
        "Herstart OneDrive of je pc; als laatste: ontkoppel en koppel de map opnieuw.",
      ]),
      h2("Veelvoorkomende oorzaken"),
      ul([
        "Pad te lang of ongeldige tekens in bestandsnamen.",
        "Onvoldoende schijfruimte lokaal.",
        "Conflicterende ‘altijd beschikbaar houden’ op trage schijven.",
      ]),
      tip("Gebruik ‘Bestanden op aanvraag’ zodat niet alles lokaal hoeft."),
      outro("OneDrive opslag vol; bestanden herstellen."),
    ].join("\n"),

  "tz-m365-onedrive-herstellen": () =>
    [
      p(
        `OneDrive en SharePoint bewaren <strong>versiegeschiedenis</strong> en een <strong>prullenbak</strong>. Zo herstel je per ongeluk overschreven of verwijderde bestanden zonder backup-ticket.`,
      ),
      h2("Versiegeschiedenis"),
      ol([
        "Ga naar OneDrive op het web → bestand → … → Versiegeschiedenis.",
        "Kies een eerdere versie → Herstellen of Downloaden.",
        "Controleer of collega’s de juiste versie zien na sync.",
      ]),
      h2("Prullenbak"),
      ol([
        "Open Prullenbak in OneDrive of de SharePoint-site.",
        "Herstel het item binnen de bewaartermijn (vaak 93 dagen).",
        "Tweede-fase prullenbak: sitebeheerder kan verder terughalen.",
      ]),
      tip("Bij massale ransomware-achtige wijzigingen: OneDrive ‘Bestanden herstellen’ naar een tijdstip."),
      outro("Sync-problemen; SharePoint-rechten."),
    ].join("\n"),

  "tz-m365-onedrive-opslag-vol": () =>
    [
      p(
        `Als OneDrive vol is, stoppen uploads en sync. Opslag is gekoppeld aan je Microsoft 365-licentie en deelt vaak pool met SharePoint/Teams.`,
      ),
      h2("Wat je kunt doen"),
      ol([
        "Open OneDrive → Opslag → bekijk grote bestanden en oude ISO’s/video’s.",
        "Verplaats archief naar een SharePoint-projectbibliotheek of externe archive.",
        "Leeg de prullenbak (telt mee tot definitief verwijderd).",
        "Controleer of ‘Persoonlijke kluis’ of bekende mappen onnodig syncen.",
        "Vraag bij TripleZero iT of een licentie-upgrade extra opslag geeft.",
      ]),
      tip("Teams-bestanden tellen mee in de tenantopslag — ruim ook daar op."),
      warn("Alleen ‘lokaal verwijderen’ lost clouduimte niet op; verwijder of verplaats in OneDrive online."),
      outro("OneDrive vs SharePoint; licentie toewijzen."),
    ].join("\n"),

  "tz-m365-sharepoint-teamsite": () =>
    [
      p(
        `Een <strong>SharePoint-teamsite</strong> is de document- en samenwerkingsplek voor een afdeling of project. Vaak ontstaat die automatisch bij een Microsoft Team.`,
      ),
      h2("Site aanmaken"),
      ol([
        "Ga naar sharepoint.com → Site maken → Teamsite.",
        "Geef naam, beschrijving en privacy (privé/openbaar binnen org).",
        "Voeg eigenaren en leden toe.",
        "Maak bibliotheken en mappen aan die bij je processen passen.",
      ]),
      h2("Rechten"),
      ul([
        "Eigenaren — volledige controle.",
        "Leden — bewerken.",
        "Bezoekers — alleen lezen.",
        "Vermijd unieke rechten op tientallen mappen tenzij echt nodig.",
      ]),
      tip("Koppel de site aan Teams als chat en vergaderen bij hetzelfde project horen."),
      outro("Bestanden via Teams-kanalen; externe delen."),
    ].join("\n"),

  "tz-m365-abonnement-keuze": () =>
    [
      p(
        `Microsoft 365 Business-abonnementen verschillen in web-apps versus desktop-Office, Teams-telefonie-opties en beveiliging. TripleZero iT helpt je kiezen op basis van teamgrootte en werkwijze.`,
      ),
      h2("Richtlijnen"),
      ul([
        "Business Basic — web/mobiele apps, Teams, Exchange, OneDrive; geen volledige desktop-Office.",
        "Business Standard — Basic + desktop Word/Excel/PowerPoint/Outlook.",
        "Business Premium — Standard + sterkere beveiliging en apparaatbeheer.",
      ]),
      h2("Keuzevragen"),
      ol([
        "Moeten medewerkers Office lokaal installeren?",
        "Is e-mail + Teams genoeg, of ook geavanceerde compliance?",
        "Werken jullie met gasttoegang en gevoelige klantdata?",
        "Hoeveel gebruikers nu en over 12 maanden?",
      ]),
      tip("Begin niet met Premium ‘voor de zekerheid’ als Basic/Standard al past — upgraden kan later."),
      outro("Licentie toewijzen; Microsoft 365 Apps installeren."),
    ].join("\n"),

  "tz-m365-licentie-toewijzen": () =>
    [
      p(
        `Zonder toegewezen licentie heeft een gebruiker geen Exchange-, Teams- of OneDrive-rechten. Toewijzen en intrekken doe je in het Microsoft 365-beheercentrum (of via TripleZero iT als wij beheer doen).`,
      ),
      h2("Licentie toewijzen"),
      ol([
        "Beheercentrum → Facturering → Licenties (of Gebruikers → gebruiker → Licenties).",
        "Selecteer het product en vink de gebruiker aan.",
        "Wacht tot provisioning klaar is (vaak minuten).",
        "Laat de gebruiker uit- en inloggen of Outlook/Teams herstarten.",
      ]),
      h2("Licentie intrekken"),
      ol([
        "Haal de licentie weg nadat mailbox/OneDrive is overgedragen of geback-upt.",
        "Besef: zonder Exchange-licentie verdwijnt toegang tot de mailbox na grace-periodes.",
        "Vrijgekomen seats kun je opnieuw toewijzen.",
      ]),
      warn("Intrekken vóór offboarding = dataverlies-risico. Volg eerst het offboard-artikel."),
      outro("Gebruiker offboarden; abonnement kiezen."),
    ].join("\n"),

  "tz-m365-rollen-admin": () =>
    [
      p(
        `Niet iedereen hoeft <strong>Global Administrator</strong> te zijn. Te veel globale admins vergroten het risico bij phishing of gestolen wachtwoorden.`,
      ),
      h2("Rollen in het kort"),
      ul([
        "Gebruiker — eigen mail, OneDrive, Teams.",
        "Exchange-beheerder — mailboxen en mailstromen.",
        "Gebruikersbeheerder — accounts aanmaken zonder volledige tenantcontrole.",
        "Global admin — alles; beperk tot 1–3 vertrouwde personen.",
      ]),
      h2("Goede praktijk"),
      ol([
        "Gebruik een apart admin-account voor beheerwerk (niet je dagelijkse mailbox).",
        "Schakel MFA verplicht in voor alle admin-rollen.",
        "Review halfjaarlijks wie nog admin is.",
      ]),
      tip("Voor dagelijks werk: standaard account. Alleen elevaten wanneer nodig."),
      outro("MFA inschakelen; verdachte inlogpogingen."),
    ].join("\n"),

  "tz-m365-dns-controleren": () =>
    [
      p(
        `Microsoft 365 mail en Autodiscover hangen van juiste <strong>DNS-records</strong> af: MX, SPF (TXT), Autodiscover (CNAME) en vaak DKIM. Die zet je in DNS-beheer bij TripleZero iT.`,
      ),
      h2("Checklist"),
      ol([
        "Open Microsoft 365-beheercentrum → Instellingen → Domeinen → jouw domein.",
        "Vergelijk de gevraagde records met wat in DNS staat.",
        "MX moet naar de Microsoft-mailhost wijzen (geen oude hosting-MX ernaast).",
        "SPF mag Microsoft opnemen (include:spf.protection.outlook.com) zonder conflicterende v=spf1-records.",
        "Autodiscover CNAME → autodiscover.outlook.com.",
        "Schakel DKIM in en publiceer de CNAME’s die Microsoft toont.",
      ]),
      tip("Na DNS-wijzigingen: wacht de TTL af en test vanaf mobiele hotspot."),
      warn("Twee MX-prioriteiten naar verschillende systemen tegelijk veroorzaken willekeurige aflevering."),
      outro("Domeinnaam koppelen; Autodiscover/Outlook-problemen."),
    ].join("\n"),

  "tz-m365-offboarding": () =>
    [
      p(
        `Als een medewerker vertrekt, wil je mailbox en OneDrive behouden of overdragen — niet meteen de licentie weghalen.`,
      ),
      h2("Checklist offboarding"),
      ol([
        "Zet het wachtwoord om en blokkeer aanmelden (of reset + MFA afdwingen).",
        "Converteer de mailbox naar gedeeld postvak óf geef ‘Volledige toegang’ aan een opvolger.",
        "Stel doorsturen of gedeelde toegang in voor lopende klantmail.",
        "OneDrive: ‘Toegang tot bestanden geven’ aan een manager; download of verplaats projectdata naar SharePoint.",
        "Verwijder uit Teams/groepen; trek daarna pas de licentie in.",
        "Documenteer wat je hebt overgedragen.",
      ]),
      tip("Gedeeld postvak na conversie kost vaak geen aparte Exchange-licentie (binnen limieten)."),
      warn("Direct verwijderen van de gebruiker zonder OneDrive-overdracht maakt herstel lastig."),
      outro("Licentie intrekken; gedeelde postvakken."),
    ].join("\n"),

  "tz-m365-imap-migratie": () =>
    [
      p(
        `Migreren van IMAP (klassieke hosting-mailboxen) naar <strong>Exchange Online</strong> verplaatst berichten naar Microsoft 365. DNS (MX) zet je pas om als de data en tests kloppen.`,
      ),
      h2("Voorbereiding"),
      ul([
        "Lijst van mailboxen, wachtwoorden of app-wachtwoorden, en quota.",
        "Microsoft 365-gebruikers met licentie al aangemaakt.",
        "Domein geverifieerd; nog niet per se MX omgezet.",
      ]),
      h2("Aanpak"),
      ol([
        "Start een IMAP-migratiebatch in het Exchange-beheercentrum (of laat TripleZero iT migreren).",
        "Koppel bronserver (IMAP) aan doelmailboxen.",
        "Laat de sync lopen; controleer aantallen en steekproeven.",
        "Plan cutover: zet MX/SPF/DKIM naar Microsoft 365.",
        "Herconfigureer Outlook naar Exchange (Modern Auth), niet IMAP.",
      ]),
      tip("Agenda/contacten komen niet altijd mee via IMAP — exporteer die apart indien nodig."),
      outro("Migreren naar Microsoft 365; DNS controleren."),
    ].join("\n"),

  "tz-m365-apps-installeren": () =>
    [
      p(
        `Met een geschikte licentie (bijv. Business Standard) installeer je <strong>Microsoft 365 Apps</strong> — Word, Excel, PowerPoint, Outlook — op Windows en Mac.`,
      ),
      h2("Installeren"),
      ol([
        "Ga naar office.com of portal.office.com en log in.",
        "Kies Apps installeren → Microsoft 365-apps.",
        "Download de installer en voltooi de setup.",
        "Open een app en meld je aan met hetzelfde werkaccount.",
      ]),
      h2("Problemen"),
      ul([
        "Geen installatieknop — licentie bevat mogelijk alleen web-apps (Basic).",
        "Activeringsfout — ander Microsoft-account in gebruik; schrijf uit en opnieuw in.",
        "Oude Office MSI naast klik-en-klaar — verwijder conflicterende versies.",
      ]),
      tip("Beperk installaties tot het aantal apparaten dat je beleid toestaat."),
      outro("Abonnement kiezen; licentie toewijzen."),
    ].join("\n"),

  "tz-m365-mfa-inschakelen": () =>
    [
      p(
        `<strong>Multifactorauthenticatie (MFA)</strong> vraagt naast je wachtwoord een tweede bevestiging (app, sms of sleutel). Voor Microsoft 365 is dit de belangrijkste beveiligingsstap tegen overgenomen accounts.`,
      ),
      h2("Beheerder: MFA afdwingen"),
      ol([
        "Open Entra-beheercentrum of M365-beheercentrum → Beveiliging / Identiteit.",
        "Schakel security defaults in of maak een Conditional Access-beleid voor MFA.",
        "Informeer gebruikers vóór de deadline dat ze de Authenticator-app nodig hebben.",
      ]),
      h2("Gebruiker: eerste keer"),
      ol([
        "Log in op office.com; volg de MFA-registratie.",
        "Installeer Microsoft Authenticator en scan de QR-code.",
        "Bewaar backupcodes of een tweede methode.",
      ]),
      tip("Verplicht MFA minstens voor alle admins — bij voorkeur voor iedereen."),
      outro("Authenticator koppelen; verdachte inlogpogingen."),
    ].join("\n"),

  "tz-m365-authenticator": () =>
    [
      p(
        `De <strong>Microsoft Authenticator</strong>-app keurt aanmeldingen goed met een melding of een eenmalige code. Dat is veiliger dan alleen sms.`,
      ),
      h2("Koppelen"),
      ol([
        "Installeer Microsoft Authenticator op je telefoon.",
        "Ga tijdens MFA-setup op de pc naar ‘Authenticator-app’.",
        "Scan de QR-code; bevestig de testmelding.",
        "Stel de app in als standaardmethode.",
      ]),
      h2("Nieuwe telefoon"),
      ul([
        "Zet tijdelijk een tweede methode aan (sms of andere app).",
        "Of vraag een beheerder om MFA-registratie te resetten.",
        "Koppel daarna Authenticator opnieuw.",
      ]),
      warn("Deel geen goedkeuringsmeldingen als jij zelf niet net probeerde in te loggen — dat kan een aanval zijn."),
      outro("MFA inschakelen; wachtwoord resetten."),
    ].join("\n"),

  "tz-m365-wachtwoord-reset": () =>
    [
      p(
        `Wachtwoorden reset je zelf via self-service (als SSPR aan staat) of via een beheerder / TripleZero iT support. Combineer altijd met MFA.`,
      ),
      h2("Self-service"),
      ol([
        "Ga naar passwordreset.microsoftonline.com of ‘Wachtwoord vergeten’ op de loginpagina.",
        "Identificeer je met MFA-methoden die je eerder registreerde.",
        "Kies een sterk nieuw wachtwoord en werk Outlook/Teams/telefoon bij.",
      ]),
      h2("Via beheerder"),
      ol([
        "Beheercentrum → Gebruikers → gebruiker → Wachtwoord resetten.",
        "Deel het tijdelijke wachtwoord via een veilig kanaal.",
        "Laat de gebruiker bij eerste login wijzigen en MFA controleren.",
      ]),
      tip("Hergebruik geen persoonlijke wachtwoorden voor werkaccounts."),
      outro("Authenticator; verdachte inlogpogingen."),
    ].join("\n"),

  "tz-m365-verdachte-login": () =>
    [
      p(
        `Microsoft kan riskante aanmeldingen blokkeren of markeren (onbekend land, onmogelijk reisgedrag, password spray). Handel snel om overname te voorkomen.`,
      ),
      h2("Wat te doen"),
      ol([
        "Reset het wachtwoord en controleer MFA-methoden (verwijder onbekende telefoons).",
        "Beheercentrum → Gebruiker → Aanmeldingen: bekijk IP, locatie en app.",
        "Trek actieve sessies in (aanmeldingen intrekken / ‘afmelden overal’). ",
        "Controleer doorsturen-regels in Outlook en nieuwe inboxregels.",
        "Informeer TripleZero iT als je mail-aflevering of DNS vermoedt te zijn gewijzigd.",
      ]),
      warn("Vink geen MFA-goedkeuring aan die je niet zelf startte."),
      tip("Na een incident: review admin-rollen en externe doorsturen-beleid."),
      outro("Phishing herkennen; MFA inschakelen."),
    ].join("\n"),

  "tz-m365-phishing": () =>
    [
      p(
        `Phishingmails imiteren Microsoft, banken of collega’s om wachtwoorden of MFA-goedkeuringen te stelen. In Outlook en Microsoft 365 herken je ze aan urgentie, rare afzenders en verdachte links.`,
      ),
      h2("Herkenningssignalen"),
      ul([
        "Afzender lijkt op Microsoft maar het adres klopt niet.",
        "Link gaat naar een ander domein dan microsoft.com / office.com.",
        "Dreigement: ‘account wordt verwijderd binnen 24 uur’.",
        "Onverwachte bijlagen (.html, .iso, macro’s).",
      ]),
      h2("Wat je doet"),
      ol([
        "Open geen link; ga zelf naar office.com via favorieten.",
        "Meld de mail als phishing in Outlook (lint / …).",
        "Bij twijfel na klik: wachtwoord resetten en MFA-check.",
        "Meld intern bij je beheerder of TripleZero iT support.",
      ]),
      tip("Beheerders: train gebruikers en beperk externe doorsturen + legacy-auth."),
      outro("Verdachte inlogpogingen; MFA."),
    ].join("\n"),

  "tz-m365-servicestatus": () =>
    [
      p(
        `Werkt Outlook, Teams of OneDrive bij iedereen niet? Check eerst of Microsoft een <strong>storing</strong> meldt voordat je lokaal gaat troubleshooten.`,
      ),
      h2("Status controleren"),
      ol([
        "Open het Microsoft 365-beheercentrum → Status → Servicestatus.",
        "Of raadpleeg de openbare Microsoft 365-statuspagina.",
        "Bekijk of Exchange, Teams of OneDrive een incident of advisory heeft.",
        "Informeer gebruikers kort als het een bekende storing is.",
      ]),
      h2("Als status groen is"),
      ul([
        "Test OWA en een ander netwerk (mobiele hotspot).",
        "Controleer DNS, licenties en recente wijzigingen.",
        "Zie ook ‘Storing oplossen in Microsoft’ voor lokale checks.",
      ]),
      tip("Screenshot van het incident in het beheercentrum helpt bij tickets naar TripleZero iT."),
      outro("Storing oplossen in Microsoft; Autodiscover/Outlook."),
    ].join("\n"),
};
