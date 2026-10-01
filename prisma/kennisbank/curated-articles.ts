/**
 * Hand-curated NL+EN knowledge-base articles (overrides for the generator).
 * Keys are catalog slugs.
 *
 * Hard rule: research third-party kennisbanken for facts/menu paths only.
 * Never paste or lightly rephrase their wording — always write original copy.
 */
import type { KennisbankArticleFile } from "./article-schema";
import { h2, ol, p, supportOutro, tip, ul, warn, joinBlocks } from "./html-helpers";

function article(
  slug: string,
  topic: string,
  nl: KennisbankArticleFile["nl"],
  en: KennisbankArticleFile["en"],
): KennisbankArticleFile {
  return { slug, topic, nl, en };
}

export const CURATED_ARTICLES: Record<string, KennisbankArticleFile> = {
  "wat-is-installatron": article(
    "wat-is-installatron",
    "installatron",
    {
      title: "Wat is Installatron?",
      excerpt:
        "Uitleg over Installatron bij TripleZero iT: one-click apps in DirectAdmin, waar je de installer opent en wat je ermee beheert.",
      seoTitle: "Wat is Installatron? | TripleZero iT",
      seoDescription:
        "Installatron in DirectAdmin bij TripleZero iT: wat het is, waar je het vindt en hoe je apps zoals WordPress ermee beheert.",
      bodyHtml: joinBlocks(
        p(
          `Installatron is de applicatie-installer in DirectAdmin. In plaats van handmatig bestanden te uploaden, een database aan te maken en een installatie-wizard te doorlopen, kies je een app en laat Installatron de technische stappen voor je uitvoeren.`,
          `Klanten gebruiken het vooral voor CMS’en en webshops (zoals WordPress), maar ook voor andere ondersteunde scripts. Na de installatie blijft de site zichtbaar onder <strong>My Applications</strong>, zodat je later kunt bijwerken, backuppen of verwijderen.`,
        ),
        h2("Beschikbaarheid bij TripleZero iT"),
        p(
          `Op shared hosting en resellerpakketten met DirectAdmin is Installatron standaard beschikbaar. Zonder DirectAdmin (bijvoorbeeld alleen VPS zonder dit panel) geldt dit artikel niet 1-op-1.`,
        ),
        h2("Openen in DirectAdmin"),
        ol([
          "Log in op DirectAdmin met de gegevens uit je welkomstmail of het klantenpanel.",
          "Zoek in het menu naar <strong>Installatron Applications Installer</strong> (vaak onder <strong>Web Applications</strong>).",
          "Zie je die tegel niet? Open <strong>Advanced Features</strong> en start Installatron daar.",
          "Kies een applicatie om te installeren, of ga naar <strong>My Applications</strong> voor bestaande sites.",
        ]),
        h2("Wat je ermee regelt"),
        ul([
          "Nieuwe installatie op een domein, subdomein of submap (map moet leeg of bewust bedoeld zijn).",
          "Overzicht van je apps, inclusief versie en pad.",
          "Updates aanbieden voor de applicatie (en waar ondersteund: plugins/thema’s).",
          "Backups maken vóór wijzigingen en die later terugzetten.",
          "Een bestaande (handmatige) installatie opnieuw onder Installatron brengen via import / add existing.",
        ]),
        tip(
          "Bewaar meteen de admin-URL en inloggegevens in een password manager; Installatron toont die vaak maar even bij afronding.",
          "nl",
        ),
        warn(
          "Installeer niet in een map die al een live site bevat zonder backup en zonder die map eerst op te schonen. Je overschrijft anders bestanden of databases.",
          "nl",
        ),
        h2("Grenzen van Installatron"),
        ul([
          "Het vervangt geen server- of JetBackup-backups voor disaster recovery.",
          "Het bouwt geen pagina’s voor je: content en thema’s regel je in de app zelf (bij WordPress: /wp-admin).",
          "DNS, SSL en mailboxen horen bij DirectAdmin of het klantenpanel, niet bij Installatron.",
        ]),
        supportOutro(
          "nl",
          "WordPress installeren, Installatron-backup, applicatie updaten",
        ),
      ),
    },
    {
      title: "What is Installatron?",
      excerpt:
        "What Installatron is on TripleZero iT hosting: the DirectAdmin app installer, where to open it, and what you manage with it.",
      seoTitle: "What is Installatron? | TripleZero iT",
      seoDescription:
        "Installatron in DirectAdmin at TripleZero iT: what it is, where to find it, and how you manage apps such as WordPress.",
      bodyHtml: joinBlocks(
        p(
          `Installatron is the application installer built into DirectAdmin. Instead of uploading files by hand, creating a database and walking through a manual setup wizard, you pick an app and Installatron runs the technical steps for you.`,
          `Most customers use it for CMS and shop platforms (especially WordPress), and for other supported scripts. After install, the site stays listed under <strong>My Applications</strong> so you can update, back up or remove it later.`,
        ),
        h2("Availability at TripleZero iT"),
        p(
          `Installatron is included on shared hosting and reseller plans that use DirectAdmin. If you only have a VPS without this panel, this guide does not apply one-to-one.`,
        ),
        h2("Open it in DirectAdmin"),
        ol([
          "Sign in to DirectAdmin with the details from your welcome email or the client panel.",
          "In the menu, open <strong>Installatron Applications Installer</strong> (often under <strong>Web Applications</strong>).",
          "If that tile is missing, open <strong>Advanced Features</strong> and launch Installatron from there.",
          "Pick an application to install, or open <strong>My Applications</strong> for sites you already manage.",
        ]),
        h2("What you can manage"),
        ul([
          "A new install on a domain, subdomain or subdirectory (the folder should be empty or intentionally chosen).",
          "An overview of your apps, including version and path.",
          "Updates for the application (and, where supported, plugins/themes).",
          "Backups before changes, and restores afterwards.",
          "Re-attaching a manual install with import / add existing.",
        ]),
        tip(
          "Save the admin URL and credentials in a password manager right away; Installatron often shows them only briefly at the end.",
          "en",
        ),
        warn(
          "Do not install into a folder that already holds a live site without a backup and a clean-up first. You can overwrite files or databases.",
          "en",
        ),
        h2("What Installatron does not cover"),
        ul([
          "It is not a full replacement for server or JetBackup backups in a disaster.",
          "It is not a page builder: content and themes live inside the app (for WordPress: /wp-admin).",
          "DNS, SSL and mailboxes belong in DirectAdmin or the client panel, not in Installatron.",
        ]),
        supportOutro(
          "en",
          "Install WordPress, Installatron backup, update an application",
        ),
      ),
    },
  ),

  "wordpress-updaten-installatron": article(
    "wordpress-updaten-installatron",
    "installatron-update",
    {
      title: "WordPress updaten in Installatron",
      excerpt:
        "Werk WordPress (core, plugins of thema’s) bij via Installatron My Applications, met een backup vóór de update.",
      bodyHtml: joinBlocks(
        p(
          `Via Installatron kun je updates voor WordPress centraal uitvoeren: core, plugins en thema’s, afhankelijk van wat er beschikbaar is.`,
          `Werk altijd eerst een backup bij en test daarna de site en /wp-admin.`,
        ),
        h2("Voorbereiding"),
        ul([
          "DirectAdmin-login en toegang tot Installatron.",
          "De juiste site geselecteerd onder My Applications.",
          "Korte onderhoudsperiode als je een webshop of kritieke site hebt.",
        ]),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin en open Installatron Applications Installer.",
          "Ga naar <strong>My Applications</strong> en selecteer de WordPress-installatie.",
          "Klik op <strong>Update</strong> (of bekijk beschikbare updates).",
          "Maak een pre-update backup als Installatron die aanbiedt.",
          "Voer de update uit en wacht tot Installatron klaar is.",
          "Open de website en /wp-admin. Controleer formulieren, login en (indien van toepassing) checkout.",
        ]),
        h2("Controleren"),
        ul([
          "Versienummers in My Applications of wp-admin kloppen.",
          "Geen critical error op de voorkant of in wp-admin.",
          "Cache/CDN geleegd als je oude content blijft zien.",
        ]),
        tip(
          "Update plugins op kritieke shops liever in batches, niet alles tegelijk.",
          "nl",
        ),
        warn(
          "Combineer geen grote PHP-upgrade en een major WordPress-update in één keer zonder staging of backup.",
          "nl",
        ),
        supportOutro("nl", "Installatron-backup, PHP-versie wijzigen"),
      ),
    },
    {
      title: "Update WordPress in Installatron",
      excerpt:
        "Update WordPress core, plugins or themes from Installatron My Applications, with a backup before you start.",
      bodyHtml: joinBlocks(
        p(
          `Installatron can run WordPress updates centrally: core, plugins and themes, depending on what is available.`,
          `Always create a backup first, then test the site and /wp-admin.`,
        ),
        h2("Preparation"),
        ul([
          "DirectAdmin login and Installatron access.",
          "The correct site selected under My Applications.",
          "A short maintenance window for shops or critical sites.",
        ]),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin and open Installatron Applications Installer.",
          "Open <strong>My Applications</strong> and select the WordPress install.",
          "Click <strong>Update</strong> (or review available updates).",
          "Create a pre-update backup if Installatron offers one.",
          "Run the update and wait until Installatron finishes.",
          "Open the website and /wp-admin. Check forms, login and checkout if relevant.",
        ]),
        h2("Verify"),
        ul([
          "Version numbers in My Applications or wp-admin are correct.",
          "No critical error on the front end or in wp-admin.",
          "Cache/CDN cleared if you still see old content.",
        ]),
        tip(
          "On critical shops, update plugins in batches instead of everything at once.",
          "en",
        ),
        warn(
          "Do not combine a major PHP upgrade and a major WordPress update without staging or a backup.",
          "en",
        ),
        supportOutro("en", "Installatron backup, change PHP version"),
      ),
    },
  ),

  "wordpress-backup-maken-of-verwijderen-in-installatron": article(
    "wordpress-backup-maken-of-verwijderen-in-installatron",
    "installatron-backup",
    {
      title: "WordPress backup maken of verwijderen in Installatron",
      excerpt:
        "Maak of verwijder Installatron-backups van je WordPress-site om updates veilig te doen en schijfruimte vrij te houden.",
      bodyHtml: joinBlocks(
        p(
          `Installatron-backups zijn handig vóór updates of grote wijzigingen. Ze staan bij je applicatie onder My Applications. Ruim oude backups op als je schijfquota vol raakt.`,
        ),
        h2("Voorbereiding"),
        ul(["DirectAdmin-login", "WordPress-site zichtbaar in My Applications"]),
        h2("Backup maken"),
        ol([
          "Open Installatron → My Applications.",
          "Selecteer de WordPress-installatie.",
          "Kies <strong>Backup</strong> en start de backup.",
          "Wacht tot de backup in de lijst staat en noteer datum/tijd.",
        ]),
        h2("Backup verwijderen"),
        ol([
          "Open dezelfde applicatie in My Applications.",
          "Open de backuplijst.",
          "Verwijder backups die je niet meer nodig hebt.",
          "Controleer daarna het schijfgebruik in DirectAdmin.",
        ]),
        tip(
          "Combineer Installatron-backups met server- of JetBackup-backups voor disaster recovery.",
          "nl",
        ),
        warn(
          "Alleen een Installatron-backup is geen volledige offsite-strategie.",
          "nl",
        ),
        supportOutro("nl", "WordPress updaten in Installatron, schijfgebruik"),
      ),
    },
    {
      title: "Create or delete a WordPress backup in Installatron",
      excerpt:
        "Create or remove Installatron backups of your WordPress site before updates and to free disk space.",
      bodyHtml: joinBlocks(
        p(
          `Installatron backups are useful before updates or major changes. They live with your app under My Applications. Delete old backups when disk quota gets tight.`,
        ),
        h2("Preparation"),
        ul([
          "DirectAdmin login",
          "WordPress site visible in My Applications",
        ]),
        h2("Create a backup"),
        ol([
          "Open Installatron → My Applications.",
          "Select the WordPress install.",
          "Choose <strong>Backup</strong> and start it.",
          "Wait until the backup appears in the list and note the date/time.",
        ]),
        h2("Delete a backup"),
        ol([
          "Open the same application in My Applications.",
          "Open the backup list.",
          "Delete backups you no longer need.",
          "Then check disk usage in DirectAdmin.",
        ]),
        tip(
          "Combine Installatron backups with server or JetBackup backups for disaster recovery.",
          "en",
        ),
        warn(
          "An Installatron backup alone is not a full offsite strategy.",
          "en",
        ),
        supportOutro("en", "Update WordPress in Installatron, disk usage"),
      ),
    },
  ),

  "wordpress-website-verwijderen-in-installatron": article(
    "wordpress-website-verwijderen-in-installatron",
    "installatron-delete",
    {
      title: "WordPress website verwijderen in Installatron",
      excerpt:
        "Verwijder een WordPress-installatie netjes via Installatron: backup, Uninstall, bestanden/database en nazorg.",
      bodyHtml: joinBlocks(
        p(
          `Verwijder WordPress via Installatron in plaats van alleen mappen te wissen. Zo blijven databases, cronjobs en Installatron-registraties niet achter op de server.`,
          `Deze guide dekt alleen bewuste verwijdering van één applicatie. Domein, e-mail en DNS blijven bestaan tenzij je die apart opzegt.`,
        ),
        h2("Wanneer Installatron Uninstall gebruiken"),
        ul([
          "De site is definitief overbodig of vervangen door een nieuwe installatie op een ander pad.",
          "Je wilt database én bestanden consequent opruimen.",
          "Je wilt geen ‘spoken’ in My Applications die nog updates of backups triggeren.",
        ]),
        h2("Voorbereiding"),
        ul([
          "Bevestig domein + pad (public_html versus submap) — verkeerde keuze is meestal definitief.",
          "Maak een Installatron-backup of exporteer files + database als je iets wilt bewaren.",
          "Noteer of plugins/thema’s of media later nog nodig zijn.",
        ]),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin → Installatron Applications Installer → <strong>My Applications</strong>.",
          "Selecteer exact de WordPress-installatie die weg moet.",
          "Kies <strong>Uninstall</strong> / <strong>Delete</strong>.",
          "Geef aan of bestanden en database mee verwijderd moeten worden (meestal ja bij volledige cleanup).",
          "Bevestig de actie en wacht tot Installatron klaar is.",
          "Controleer File Manager (webroot leeg of alleen restanten) en MySQL Management (database weg indien gekozen).",
          "Verwijder eventuele overgebleven submappen, oude wp-config-kopieën en lege databases handmatig.",
        ]),
        h2("Controleren"),
        ul([
          "De site verschijnt niet meer onder My Applications.",
          "De publieke URL toont geen oude WordPress-installatie (of een bewuste placeholder).",
          "Geen wees-databases met oude tabelprefixen.",
        ]),
        h2("Veelgemaakte fouten"),
        ul([
          "Alleen <code>wp-content</code> wissen terwijl de database blijft staan.",
          "Verkeerde applicatie in een lijst met meerdere WordPress-sites.",
          "DNS al omgezet terwijl je dacht ‘nog even te kunnen terugzetten’ zonder backup.",
        ]),
        tip(
          "Wil je later terug? Maak eerst een Installatron-backup of exporteer de database en download die offsite.",
          "nl",
        ),
        warn(
          "Verkeerde applicatie deïnstalleren is zonder backup meestal definitief — dubbelcheck pad en sitetitel.",
          "nl",
        ),
        supportOutro("nl", "Installatron-backup, MySQL beheren, WordPress installeren"),
      ),
    },
    {
      title: "Delete a WordPress site in Installatron",
      excerpt:
        "Remove a WordPress install cleanly through Installatron: backup, uninstall, files/database and cleanup.",
      bodyHtml: joinBlocks(
        p(
          `Uninstall WordPress through Installatron instead of only deleting folders. That way databases, cron jobs and Installatron records do not linger on the server.`,
          `This guide covers deliberate removal of one application. Domain, email and DNS remain unless you cancel those separately.`,
        ),
        h2("When to use Installatron Uninstall"),
        ul([
          "The site is permanently unused or replaced by a new install on another path.",
          "You want files and database cleaned up consistently.",
          "You do not want ghosts in My Applications still triggering updates or backups.",
        ]),
        h2("Preparation"),
        ul([
          "Confirm domain + path (public_html vs subdirectory) — the wrong choice is usually permanent.",
          "Create an Installatron backup or export files + database if you need to keep anything.",
          "Note whether plugins/themes or media will be needed later.",
        ]),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin → Installatron Applications Installer → <strong>My Applications</strong>.",
          "Select exactly the WordPress install to remove.",
          "Choose <strong>Uninstall</strong> / <strong>Delete</strong>.",
          "Choose whether files and the database should be removed (usually yes for a full cleanup).",
          "Confirm and wait until Installatron finishes.",
          "Check File Manager (web root empty or only leftovers) and MySQL Management (database gone if selected).",
          "Remove leftover subfolders, old wp-config copies and empty databases manually if needed.",
        ]),
        h2("Verify"),
        ul([
          "The site no longer appears under My Applications.",
          "The public URL no longer serves the old WordPress install (or shows an intentional placeholder).",
          "No orphan databases with old table prefixes remain.",
        ]),
        h2("Common mistakes"),
        ul([
          "Deleting only <code>wp-content</code> while leaving the database behind.",
          "Picking the wrong application in a list of multiple WordPress sites.",
          "Already flipping DNS while assuming you can still roll back without a backup.",
        ]),
        tip(
          "Want a way back? Create an Installatron backup or export the database and download it offsite first.",
          "en",
        ),
        warn(
          "Uninstalling the wrong application is usually permanent without a backup — double-check path and site title.",
          "en",
        ),
        supportOutro("en", "Installatron backup, manage MySQL, Install WordPress"),
      ),
    },
  ),

  "website-weg-uit-installatron-voeg-je-site-toe": article(
    "website-weg-uit-installatron-voeg-je-site-toe",
    "installatron-import",
    {
      title: "Website weg uit Installatron? Voeg je site toe!",
      excerpt:
        "Koppel een bestaande WordPress-site opnieuw aan Installatron via Import / Add existing als die uit My Applications verdwenen is.",
      bodyHtml: joinBlocks(
        p(
          `Soms staat een site niet (meer) onder My Applications, terwijl de bestanden en database nog wel op de server staan. Met Import / Add existing koppel je die installatie weer aan Installatron.`,
        ),
        h2("Voorbereiding"),
        ul([
          "Pad naar de site (bijvoorbeeld public_html of een submap).",
          "Databasegegevens als Installatron die vraagt (naam, user, host).",
        ]),
        h2("Stappen"),
        ol([
          "Open Installatron Applications Installer.",
          "Kies <strong>Import</strong> of <strong>Add existing</strong>.",
          "Selecteer het juiste domein en pad.",
          "Vul databasegegevens in indien gevraagd.",
          "Rond de import af.",
          "Controleer of de site in My Applications staat en of Backup/Update beschikbaar zijn.",
        ]),
        tip(
          "Werkt import niet, herinstalleer dan niet blind. Controleer eerst bestanden en de database.",
          "nl",
        ),
        warn(
          "Dubbele WordPress-installaties in submappen zorgen voor verwarring. Houd één actieve site per pad.",
          "nl",
        ),
        supportOutro("nl", "Wat is Installatron, WordPress installeren"),
      ),
    },
    {
      title: "Site missing from Installatron? Add it again",
      excerpt:
        "Re-attach an existing WordPress site to Installatron with Import / Add existing when it disappeared from My Applications.",
      bodyHtml: joinBlocks(
        p(
          `Sometimes a site no longer appears under My Applications even though the files and database are still on the server. Use Import / Add existing to attach that install to Installatron again.`,
        ),
        h2("Preparation"),
        ul([
          "Path to the site (for example public_html or a subdirectory).",
          "Database credentials if Installatron asks for them (name, user, host).",
        ]),
        h2("Steps"),
        ol([
          "Open Installatron Applications Installer.",
          "Choose <strong>Import</strong> or <strong>Add existing</strong>.",
          "Select the correct domain and path.",
          "Enter database details if prompted.",
          "Finish the import.",
          "Confirm the site appears in My Applications and that Backup/Update are available.",
        ]),
        tip(
          "If import fails, do not reinstall blindly. Check files and the database first.",
          "en",
        ),
        warn(
          "Duplicate WordPress installs in subdirectories cause confusion. Keep one active site per path.",
          "en",
        ),
        supportOutro("en", "What is Installatron, Install WordPress"),
      ),
    },
  ),

  "installatron-applicatie-updaten": article(
    "installatron-applicatie-updaten",
    "tz-th-php-installatron-applicatie-updaten-ae03e",
    {
      title: "Installatron: applicatie updaten",
      excerpt:
        "Werk een via Installatron beheerde applicatie bij: backup, update, cache legen en preferente checks.",
      bodyHtml: joinBlocks(
        p(
          `Applicaties die je via Installatron beheert, kun je vanuit My Applications updaten. Dat is veiliger dan handmatig zip-files over productiemappen te zetten, mits je eerst een backup hebt.`,
          `Plan updates buiten piekuren als de site orders, leads of logins verwerkt. Combineer geen major core-update met een stapel plugin-updates in één run op productie.`,
        ),
        h2("Voorbereiding"),
        ul([
          "Installatron- of panel-backup (files + database) beschikbaar.",
          "Weet welke applicatie, welk domein en welk pad je bijwerkt.",
          "Korte checklist van kritieke flows (homepage, login, formulier/checkout).",
        ]),
        h2("Stappen"),
        ol([
          "Open DirectAdmin → Installatron → <strong>My Applications</strong>.",
          "Selecteer de juiste applicatie (controleer pad en URL).",
          "Maak eerst een backup vanuit Installatron.",
          "Bekijk beschikbare updates; start met de kleinste veilige set.",
          "Voer de update(s) uit en wacht tot de status succes toont.",
          "Leeg page-/object-/CDN-cache indien actief.",
          "Test voorkant en admin-paneel; bij WordPress ook wp-admin en een schrijfactie.",
        ]),
        h2("Controleren"),
        ul([
          "Versienummer in My Applications komt overeen met wat je verwacht.",
          "Geen critical error of witte pagina.",
          "Kritieke flows uit je checklist werken.",
        ]),
        h2("Als de update mislukt"),
        ol([
          "Herstel de zojuist gemaakte Installatron-backup.",
          "Isoleer: update één component tegelijk tot de boosdoener duidelijk is.",
          "Check PHP-versie-compatibiliteit in DirectAdmin als fatals blijven.",
        ]),
        tip(
          "Update één component tegelijk op productie als je rollback wilt beperken.",
          "nl",
        ),
        warn(
          "Geen update zonder restorepad — en test niet alleen de homepage.",
          "nl",
        ),
        supportOutro("nl", "Installatron-backup, WordPress updaten, PHP-versie"),
      ),
    },
    {
      title: "Installatron: update an application",
      excerpt:
        "Update an Installatron-managed application: backup, update, clear caches and run preference checks.",
      bodyHtml: joinBlocks(
        p(
          `Apps managed in Installatron can be updated from My Applications. That is safer than dropping zip files over production folders — provided you take a backup first.`,
          `Schedule updates outside peak hours if the site handles orders, leads or logins. Do not combine a major core update with a pile of plugin updates in one production run.`,
        ),
        h2("Preparation"),
        ul([
          "Installatron or panel backup (files + database) available.",
          "Know which application, domain and path you are updating.",
          "A short checklist of critical flows (homepage, login, form/checkout).",
        ]),
        h2("Steps"),
        ol([
          "Open DirectAdmin → Installatron → <strong>My Applications</strong>.",
          "Select the correct application (verify path and URL).",
          "Create an Installatron backup first.",
          "Review available updates; start with the smallest safe set.",
          "Run the update(s) and wait for a success status.",
          "Clear page/object/CDN cache if enabled.",
          "Test the front end and admin panel; for WordPress also wp-admin and a write action.",
        ]),
        h2("Verify"),
        ul([
          "Version in My Applications matches what you expect.",
          "No critical error or white screen.",
          "Critical flows from your checklist still work.",
        ]),
        h2("If the update fails"),
        ol([
          "Restore the Installatron backup you just created.",
          "Isolate: update one component at a time until the culprit is clear.",
          "Check PHP version compatibility in DirectAdmin if fatals persist.",
        ]),
        tip(
          "On production, update one component at a time if you want an easier rollback.",
          "en",
        ),
        warn(
          "Do not update without a restore path — and do not test the homepage only.",
          "en",
        ),
        supportOutro("en", "Installatron backup, Update WordPress, PHP version"),
      ),
    },
  ),
};
