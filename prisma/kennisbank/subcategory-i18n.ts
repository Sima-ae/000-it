/** Seed locales for popular kennisbank subcategories (parent categories stay top-level). */
type LocaleCopy = Record<string, { name: string; description: string }>;

function loc(
  en: [string, string],
  de: [string, string],
  fr: [string, string],
  es: [string, string],
  pt: [string, string],
  it: [string, string],
): LocaleCopy {
  const pack = { en, de, fr, es, pt, it };
  return Object.fromEntries(
    Object.entries(pack).map(([locale, [name, description]]) => [locale, { name, description }]),
  );
}

export const SUBCATEGORY_I18N: Record<string, LocaleCopy> = {
  "dns-records": loc(
    ["DNS records", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, nameservers and DNSSEC at TripleZero iT."],
    ["DNS-Einträge", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, Nameserver und DNSSEC bei TripleZero iT."],
    ["Enregistrements DNS", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, serveurs de noms et DNSSEC chez TripleZero iT."],
    ["Registros DNS", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, nameservers y DNSSEC en TripleZero iT."],
    ["Registos DNS", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, nameservers e DNSSEC na TripleZero iT."],
    ["Record DNS", "A, AAAA, CNAME, MX, SPF, DKIM, DMARC, nameserver e DNSSEC su TripleZero iT."],
  ),
  "domein-verhuizen": loc(
    ["Transfer a domain", "Moving domains, auth codes, quarantine, locks and ownership transfer."],
    ["Domain umziehen", "Umzug, Auth-Code, Quarantäne, Sperren und Übertragung von Domains."],
    ["Transférer un domaine", "Transfert, code d'autorisation, quarantaine, verrouillage et cession de domaine."],
    ["Transferir un dominio", "Traslado, código de autorización, cuarentena, bloqueo y cesión de dominios."],
    ["Transferir um domínio", "Mudança, código de autorização, quarentena, bloqueio e transferência de domínio."],
    ["Trasferire un dominio", "Trasferimento, auth code, quarantena, lock e cessione del dominio."],
  ),
  "domein-registratie": loc(
    ["Domain registration", "Registering, WHOIS, holder details, extensions and SIDN rules for your domain."],
    ["Domainregistrierung", "Registrieren, WHOIS, Inhaberdaten, Endungen und SIDN-Regeln für Ihre Domain."],
    ["Enregistrement de domaine", "Enregistrement, WHOIS, titulaire, extensions et règles SIDN pour votre domaine."],
    ["Registro de dominio", "Registrar, WHOIS, titular, extensiones y normas SIDN para tu dominio."],
    ["Registo de domínio", "Registar, WHOIS, titular, extensões e regras SIDN para o seu domínio."],
    ["Registrazione dominio", "Registrazione, WHOIS, intestatario, estensioni e regole SIDN per il tuo dominio."],
  ),
  webmail: loc(
    ["Webmail", "Sign-in, Roundcube, Webmail Pro, folders, signatures and webmail issues."],
    ["Webmail", "Anmelden, Roundcube, Webmail Pro, Ordner, Signaturen und Webmail-Probleme."],
    ["Webmail", "Connexion, Roundcube, Webmail Pro, dossiers, signatures et problèmes de webmail."],
    ["Webmail", "Acceso, Roundcube, Webmail Pro, carpetas, firmas y problemas de webmail."],
    ["Webmail", "Início de sessão, Roundcube, Webmail Pro, pastas, assinaturas e problemas de webmail."],
    ["Webmail", "Accesso, Roundcube, Webmail Pro, cartelle, firme e problemi di webmail."],
  ),
  "e-mail-instellen": loc(
    ["Set up email", "Connect a mailbox in Outlook, Apple Mail, Gmail, Thunderbird, iPhone and Android."],
    ["E-Mail einrichten", "Postfach in Outlook, Apple Mail, Gmail, Thunderbird, iPhone und Android koppeln."],
    ["Configurer l'e-mail", "Relier une boîte mail dans Outlook, Apple Mail, Gmail, Thunderbird, iPhone et Android."],
    ["Configurar el correo", "Vincular un buzón en Outlook, Apple Mail, Gmail, Thunderbird, iPhone y Android."],
    ["Configurar e-mail", "Ligar uma caixa de correio no Outlook, Apple Mail, Gmail, Thunderbird, iPhone e Android."],
    ["Configurare e-mail", "Collegare una casella in Outlook, Apple Mail, Gmail, Thunderbird, iPhone e Android."],
  ),
  "spam-en-veiligheid": loc(
    ["Spam and email security", "Spam filters, spoofing, phishing mail and delivery into the junk folder."],
    ["Spam und E-Mail-Sicherheit", "Spamfilter, Spoofing, Phishing-Mails und Zustellung im Spam-Ordner."],
    ["Spam et sécurité e-mail", "Filtres anti-spam, usurpation, phishing et remise dans le dossier indésirable."],
    ["Spam y seguridad del correo", "Filtros antispam, spoofing, phishing y entrega en la carpeta de correo no deseado."],
    ["Spam e segurança de e-mail", "Filtros de spam, spoofing, phishing e entrega na pasta de lixo."],
    ["Spam e sicurezza e-mail", "Filtri antispam, spoofing, phishing e consegna nella cartella spam."],
  ),
  "mailbox-beheer": loc(
    ["Manage mailboxes", "Create accounts, quotas, passwords, forwarding, catch-all and auto-replies."],
    ["Postfächer verwalten", "Anlegen, Kontingente, Passwort, Weiterleitung, Catch-all und Abwesenheitsnotiz."],
    ["Gérer les boîtes mail", "Création, quotas, mot de passe, transfert, catch-all et réponse automatique."],
    ["Gestionar buzones", "Crear, cuotas, contraseña, reenvío, catch-all y respuesta automática."],
    ["Gerir caixas de correio", "Criar, quotas, palavra-passe, reencaminhamento, catch-all e resposta automática."],
    ["Gestire le caselle", "Creazione, quote, password, inoltro, catch-all e risposta automatica."],
  ),
  "ftp-en-bestanden": loc(
    ["FTP and files", "FileZilla, FTP accounts, permissions (CHMOD) and uploading or deleting files."],
    ["FTP und Dateien", "FileZilla, FTP-Konten, Rechte (CHMOD) und Dateien hochladen oder löschen."],
    ["FTP et fichiers", "FileZilla, comptes FTP, droits (CHMOD) et envoi ou suppression de fichiers."],
    ["FTP y archivos", "FileZilla, cuentas FTP, permisos (CHMOD) y subir o eliminar archivos."],
    ["FTP e ficheiros", "FileZilla, contas FTP, permissões (CHMOD) e carregar ou eliminar ficheiros."],
    ["FTP e file", "FileZilla, account FTP, permessi (CHMOD) e caricamento o eliminazione di file."],
  ),
  "php-en-scripts": loc(
    ["PHP and scripts", "PHP version, cron jobs, phpinfo and Installatron on your hosting plan."],
    ["PHP und Skripte", "PHP-Version, Cronjobs, phpinfo und Installatron auf Ihrem Hosting-Paket."],
    ["PHP et scripts", "Version PHP, cron, phpinfo et Installatron sur votre forfait d'hébergement."],
    ["PHP y scripts", "Versión de PHP, cron, phpinfo e Installatron en tu plan de hosting."],
    ["PHP e scripts", "Versão PHP, cron, phpinfo e Installatron no seu plano de alojamento."],
    ["PHP e script", "Versione PHP, cron, phpinfo e Installatron sul tuo pacchetto hosting."],
  ),
  "opslag-en-verkeer": loc(
    ["Storage and traffic", "Disk space, inodes, bandwidth and what to do when the plan is full."],
    ["Speicher und Traffic", "Speicherplatz, Inodes, Bandbreite und was tun, wenn das Paket voll ist."],
    ["Stockage et trafic", "Espace disque, inodes, bande passante et que faire si le forfait est plein."],
    ["Almacenamiento y tráfico", "Disco, inodes, ancho de banda y qué hacer si el plan se llena."],
    ["Armazenamento e tráfego", "Disco, inodes, largura de banda e o que fazer se o plano ficar cheio."],
    ["Spazio e traffico", "Disco, inode, banda e cosa fare se il pacchetto è pieno."],
  ),
  "wordpress-beveiliging": loc(
    ["WordPress security", "Wordfence, preventing hacks, disabling XML-RPC and recovering a compromised site."],
    ["WordPress-Sicherheit", "Wordfence, Hacks verhindern, XML-RPC deaktivieren und eine gehackte Site wiederherstellen."],
    ["Sécurité WordPress", "Wordfence, prévenir les piratages, désactiver XML-RPC et rétablir un site compromis."],
    ["Seguridad de WordPress", "Wordfence, evitar hacks, desactivar XML-RPC y recuperar un sitio comprometido."],
    ["Segurança WordPress", "Wordfence, prevenir hacks, desativar XML-RPC e recuperar um site comprometido."],
    ["Sicurezza WordPress", "Wordfence, prevenire gli hack, disattivare XML-RPC e ripristinare un sito compromesso."],
  ),
  "wordpress-installatie": loc(
    ["Install WordPress", "Set up WordPress via Installatron, Toolkit or a quick start, and add or remove a site."],
    ["WordPress installieren", "WordPress über Installatron, Toolkit oder Schnellstart einrichten und Sites hinzufügen oder entfernen."],
    ["Installer WordPress", "Installer WordPress via Installatron, Toolkit ou un démarrage rapide, et ajouter ou retirer un site."],
    ["Instalar WordPress", "Instalar WordPress con Installatron, Toolkit o un inicio rápido, y añadir o quitar un sitio."],
    ["Instalar WordPress", "Instalar WordPress via Installatron, Toolkit ou arranque rápido, e adicionar ou remover um site."],
    ["Installare WordPress", "Installare WordPress con Installatron, Toolkit o avvio rapido, e aggiungere o rimuovere un sito."],
  ),
  "wordpress-onderhoud": loc(
    ["Maintain WordPress", "Updates, permalinks, widgets, extra users and backups in the dashboard."],
    ["WordPress warten", "Updates, Permalinks, Widgets, zusätzliche Benutzer und Backups im Dashboard."],
    ["Maintenir WordPress", "Mises à jour, permaliens, widgets, utilisateurs supplémentaires et sauvegardes dans le tableau de bord."],
    ["Mantener WordPress", "Actualizaciones, enlaces permanentes, widgets, usuarios extra y copias en el panel."],
    ["Manter WordPress", "Atualizações, permalinks, widgets, utilizadores extra e backups no painel."],
    ["Manutenere WordPress", "Aggiornamenti, permalink, widget, utenti extra e backup nella dashboard."],
  ),
  "windows-vps": loc(
    ["Windows VPS", "IIS, RDP, application pools, bindings, MSSQL and sites on a Windows server."],
    ["Windows-VPS", "IIS, RDP, Anwendungspools, Bindings, MSSQL und Sites auf einem Windows-Server."],
    ["VPS Windows", "IIS, RDP, pools d'applications, liaisons, MSSQL et sites sur un serveur Windows."],
    ["VPS Windows", "IIS, RDP, grupos de aplicaciones, bindings, MSSQL y sitios en un servidor Windows."],
    ["VPS Windows", "IIS, RDP, application pools, bindings, MSSQL e sites num servidor Windows."],
    ["VPS Windows", "IIS, RDP, application pool, binding, MSSQL e siti su un server Windows."],
  ),
  "linux-vps": loc(
    ["Linux VPS", "SSH, Fail2Ban, console, CentOS/CloudLinux and kernel updates on your Linux VPS."],
    ["Linux-VPS", "SSH, Fail2Ban, Konsole, CentOS/CloudLinux und Kernel-Updates auf Ihrem Linux-VPS."],
    ["VPS Linux", "SSH, Fail2Ban, console, CentOS/CloudLinux et mises à jour du noyau sur votre VPS Linux."],
    ["VPS Linux", "SSH, Fail2Ban, consola, CentOS/CloudLinux y actualizaciones del kernel en tu VPS Linux."],
    ["VPS Linux", "SSH, Fail2Ban, consola, CentOS/CloudLinux e atualizações do kernel no seu VPS Linux."],
    ["VPS Linux", "SSH, Fail2Ban, console, CentOS/CloudLinux e aggiornamenti del kernel sul tuo VPS Linux."],
  ),
  "vps-beheer": loc(
    ["Manage a VPS", "Start and stop, snapshots, IP addresses, managed versus unmanaged."],
    ["VPS verwalten", "Starten und stoppen, Snapshots, IP-Adressen, managed versus unmanaged."],
    ["Gérer un VPS", "Démarrer et arrêter, snapshots, adresses IP, managé versus non managé."],
    ["Gestionar un VPS", "Arrancar y parar, instantáneas, direcciones IP, gestionado frente a no gestionado."],
    ["Gerir um VPS", "Iniciar e parar, snapshots, endereços IP, gerido versus não gerido."],
    ["Gestire un VPS", "Avviare e fermare, snapshot, indirizzi IP, managed versus unmanaged."],
  ),
  "facturen-en-betalen": loc(
    ["Invoices and payments", "View invoices, direct debit, outstanding items and payment methods in the customer panel."],
    ["Rechnungen und Zahlung", "Rechnungen, Lastschrift, offene Posten und Zahlungsarten im Kundenpanel."],
    ["Factures et paiements", "Consulter les factures, prélèvement, impayés et moyens de paiement dans le panneau client."],
    ["Facturas y pagos", "Ver facturas, domiciliación, impagos y métodos de pago en el panel de cliente."],
    ["Faturas e pagamentos", "Ver faturas, débito direto, valores em aberto e métodos de pagamento no painel."],
    ["Fatture e pagamenti", "Fatture, addebito, partite aperte e metodi di pagamento nel pannello cliente."],
  ),
  "tickets-en-berichten": loc(
    ["Tickets and messages", "Support tickets, CRM messages and the status of your requests."],
    ["Tickets und Nachrichten", "Support-Tickets, CRM-Nachrichten und der Status Ihrer Anfragen."],
    ["Tickets et messages", "Tickets de support, messages CRM et statut de vos demandes."],
    ["Tickets y mensajes", "Tickets de soporte, mensajes CRM y el estado de tus solicitudes."],
    ["Tickets e mensagens", "Tickets de suporte, mensagens CRM e o estado dos seus pedidos."],
    ["Ticket e messaggi", "Ticket di supporto, messaggi CRM e lo stato delle tue richieste."],
  ),
  "account-en-inloggen": loc(
    ["Account and sign-in", "Sign-in, 2FA, password and extra users on your customer panel."],
    ["Konto und Anmeldung", "Anmeldung, 2FA, Passwort und zusätzliche Benutzer im Kundenpanel."],
    ["Compte et connexion", "Connexion, 2FA, mot de passe et utilisateurs supplémentaires dans le panneau client."],
    ["Cuenta e inicio de sesión", "Acceso, 2FA, contraseña y usuarios extra en el panel de cliente."],
    ["Conta e início de sessão", "Início de sessão, 2FA, palavra-passe e utilizadores extra no painel."],
    ["Account e accesso", "Accesso, 2FA, password e utenti extra nel pannello cliente."],
  ),
  "tickets-en-chat": loc(
    ["Tickets, chat and call-back", "Live chat, tickets and scheduled calls with TripleZero iT support."],
    ["Tickets, Chat und Rückruf", "Live-Chat, Tickets und Rückruftermine beim TripleZero iT Support."],
    ["Tickets, chat et rappel", "Chat en direct, tickets et rendez-vous téléphoniques chez TripleZero iT."],
    ["Tickets, chat y llamada", "Chat en vivo, tickets y citas telefónicas con el soporte de TripleZero iT."],
    ["Tickets, chat e chamada", "Chat ao vivo, tickets e marcações telefónicas no suporte TripleZero iT."],
    ["Ticket, chat e richiamata", "Live chat, ticket e appuntamenti telefonici con il supporto TripleZero iT."],
  ),
  "betalen-en-btw": loc(
    ["Payments and VAT", "Checkout, VAT, direct debit, discounts and what happens after a payment."],
    ["Zahlung und MwSt.", "Checkout, MwSt., Lastschrift, Rabatt und was nach einer Zahlung passiert."],
    ["Paiement et TVA", "Paiement, TVA, prélèvement, remise et ce qui se passe après un règlement."],
    ["Pago e IVA", "Checkout, IVA, domiciliación, descuento y qué ocurre tras un pago."],
    ["Pagamento e IVA", "Checkout, IVA, débito direto, desconto e o que acontece após um pagamento."],
    ["Pagamento e IVA", "Checkout, IVA, addebito, sconto e cosa succede dopo un pagamento."],
  ),
  hostingpakketten: loc(
    ["Hosting plans", "Shared, WordPress hosting and VPS: Basic, Plus, Pro/Business, upgrades and downgrades."],
    ["Hosting-Pakete", "Shared, WordPress-Hosting und VPS: Basic, Plus, Pro/Business, Upgrade und Downgrade."],
    ["Forfaits d'hébergement", "Mutualisé, WordPress et VPS : Basic, Plus, Pro/Business, upgrade et downgrade."],
    ["Planes de hosting", "Shared, WordPress hosting y VPS: Basic, Plus, Pro/Business, upgrade y downgrade."],
    ["Planos de alojamento", "Shared, WordPress hosting e VPS: Basic, Plus, Pro/Business, upgrade e downgrade."],
    ["Pacchetti hosting", "Shared, WordPress hosting e VPS: Basic, Plus, Pro/Business, upgrade e downgrade."],
  ),
  "business-pakketten": loc(
    ["Business plans", "Business, Extra Growth, Enterprise and what is included in each plan."],
    ["Business-Pakete", "Business, Extra Growth, Enterprise und was in welchem Paket enthalten ist."],
    ["Forfaits Business", "Business, Extra Growth, Enterprise et le contenu de chaque forfait."],
    ["Planes Business", "Business, Extra Growth, Enterprise y qué incluye cada plan."],
    ["Planos Business", "Business, Extra Growth, Enterprise e o que está incluído em cada plano."],
    ["Pacchetti Business", "Business, Extra Growth, Enterprise e cosa è incluso in ogni pacchetto."],
  ),
  "firewall-en-hacks": loc(
    ["Firewall and hacks", "Firewalls, brute force, DDoS, hotlink protection and what to do after a hack."],
    ["Firewall und Hacks", "Firewalls, Brute-Force, DDoS, Hotlink-Schutz und was nach einem Hack zu tun ist."],
    ["Pare-feu et piratages", "Pare-feu, brute force, DDoS, protection hotlink et que faire après un piratage."],
    ["Firewall y hacks", "Firewalls, fuerza bruta, DDoS, protección hotlink y qué hacer tras un hack."],
    ["Firewall e hacks", "Firewalls, força bruta, DDoS, proteção hotlink e o que fazer após um hack."],
    ["Firewall e hack", "Firewall, brute force, DDoS, protezione hotlink e cosa fare dopo un hack."],
  ),
  "directadmin-e-mail": loc(
    ["Email in DirectAdmin", "Mailboxes, spam filter, quotas and webmail from DirectAdmin."],
    ["E-Mail in DirectAdmin", "Postfächer, Spamfilter, Kontingente und Webmail in DirectAdmin."],
    ["E-mail dans DirectAdmin", "Boîtes mail, filtre anti-spam, quotas et webmail dans DirectAdmin."],
    ["Correo en DirectAdmin", "Buzones, filtro antispam, cuotas y webmail en DirectAdmin."],
    ["E-mail no DirectAdmin", "Caixas de correio, filtro de spam, quotas e webmail no DirectAdmin."],
    ["E-mail in DirectAdmin", "Caselle, filtro spam, quote e webmail in DirectAdmin."],
  ),
  "directadmin-wordpress": loc(
    ["WordPress in DirectAdmin", "Installatron, WordPress updates, backups and multisite in DirectAdmin."],
    ["WordPress in DirectAdmin", "Installatron, WordPress-Updates, Backups und Multisite in DirectAdmin."],
    ["WordPress dans DirectAdmin", "Installatron, mises à jour WordPress, sauvegardes et multisite dans DirectAdmin."],
    ["WordPress en DirectAdmin", "Installatron, actualizaciones de WordPress, copias y multisite en DirectAdmin."],
    ["WordPress no DirectAdmin", "Installatron, atualizações WordPress, backups e multisite no DirectAdmin."],
    ["WordPress in DirectAdmin", "Installatron, aggiornamenti WordPress, backup e multisite in DirectAdmin."],
  ),
  "microsoft-mail": loc(
    ["Microsoft mail", "Exchange Online, Outlook, OWA and connecting Microsoft 365 mailboxes."],
    ["Microsoft-Mail", "Exchange Online, Outlook, OWA und Microsoft 365-Postfächer koppeln."],
    ["Messagerie Microsoft", "Exchange Online, Outlook, OWA et relier des boîtes Microsoft 365."],
    ["Correo Microsoft", "Exchange Online, Outlook, OWA y vincular buzones de Microsoft 365."],
    ["Correio Microsoft", "Exchange Online, Outlook, OWA e ligar caixas Microsoft 365."],
    ["Posta Microsoft", "Exchange Online, Outlook, OWA e collegare caselle Microsoft 365."],
  ),
  "ai-agents-types": loc(
    ["Agent types", "SEO, content, social, ads, analytics, chatbot and research agents at TripleZero iT."],
    ["Agenttypen", "SEO-, Content-, Social-, Ads-, Analytics-, Chatbot- und Research-Agents bei TripleZero iT."],
    ["Types d'agents", "Agents SEO, contenu, social, ads, analytics, chatbot et research chez TripleZero iT."],
    ["Tipos de agentes", "Agentes SEO, contenido, social, ads, analytics, chatbot e investigación en TripleZero iT."],
    ["Tipos de agentes", "Agentes SEO, conteúdo, social, ads, analytics, chatbot e research na TripleZero iT."],
    ["Tipi di agent", "Agent SEO, content, social, ads, analytics, chatbot e research su TripleZero iT."],
  ),
  "ai-agents-beheer": loc(
    ["Management and status", "Statuses, tasks, project linking and running multiple agents safely."],
    ["Verwaltung und Status", "Status, Aufgaben, Projektkopplung und sicherer Betrieb mehrerer Agents."],
    ["Gestion et statut", "Statuts, tâches, liaison projet et gestion sûre de plusieurs agents."],
    ["Gestión y estado", "Estados, tareas, vínculo a proyectos y uso seguro de varios agentes."],
    ["Gestão e estado", "Estados, tarefas, ligação a projetos e uso seguro de vários agentes."],
    ["Gestione e stato", "Stati, task, collegamento ai progetti e uso sicuro di più agent."],
  ),
  "ai-agents-pakketten": loc(
    ["Plans and access", "Quotas, upgrades, provisioning and who may start or pause agents."],
    ["Pakete und Zugang", "Kontingente, Upgrades, Provisioning und wer Agents starten oder pausieren darf."],
    ["Forfaits et accès", "Quotas, upgrades, provisioning et qui peut démarrer ou mettre en pause les agents."],
    ["Planes y acceso", "Cuotas, upgrades, aprovisionamiento y quién puede iniciar o pausar agentes."],
    ["Planos e acesso", "Quotas, upgrades, provisionamento e quem pode iniciar ou pausar agentes."],
    ["Pacchetti e accesso", "Quote, upgrade, provisioning e chi può avviare o mettere in pausa gli agent."],
  ),
  "ai-agents-workflows": loc(
    ["Workflows and results", "Combine agents with AI scan, SEO, marketing and measurable outcomes."],
    ["Workflows und Ergebnisse", "Agents mit AI-Scan, SEO, Marketing und messbaren Ergebnissen kombinieren."],
    ["Workflows et résultats", "Combiner agents, AI-scan, SEO, marketing et résultats mesurables."],
    ["Flujos y resultados", "Combinar agentes con AI-scan, SEO, marketing y resultados medibles."],
    ["Fluxos e resultados", "Combinar agentes com AI-scan, SEO, marketing e resultados mensuráveis."],
    ["Workflow e risultati", "Combinare agent con AI-scan, SEO, marketing e risultati misurabili."],
  ),
  "ai-agents-problemen": loc(
    ["Troubleshooting", "ERROR status, agents that will not start, conflicts and support details."],
    ["Probleme beheben", "ERROR-Status, Agents die nicht starten, Konflikte und Support-Angaben."],
    ["Dépannage", "Statut ERROR, agents qui ne démarrent pas, conflits et infos support."],
    ["Solución de problemas", "Estado ERROR, agentes que no arrancan, conflictos y datos para soporte."],
    ["Resolução de problemas", "Estado ERROR, agentes que não iniciam, conflitos e dados para suporte."],
    ["Risoluzione problemi", "Stato ERROR, agent che non partono, conflitti e dati per il supporto."],
  ),
  "aeo-antwoordengines": loc(
    [
      "AEO (answer engines)",
      "Answer Engine Optimization: citations, FAQs, entities and answer-ready content at TripleZero iT.",
    ],
    [
      "AEO (Antwortmaschinen)",
      "Answer Engine Optimization: Zitate, FAQs, Entities und antwortklare Inhalte bei TripleZero iT.",
    ],
    [
      "AEO (moteurs de réponses)",
      "Answer Engine Optimization : citations, FAQ, entités et contenu prêt pour les réponses chez TripleZero iT.",
    ],
    [
      "AEO (motores de respuesta)",
      "Answer Engine Optimization: citas, FAQ, entidades y contenido listo para respuestas en TripleZero iT.",
    ],
    [
      "AEO (motores de resposta)",
      "Answer Engine Optimization: citações, FAQ, entidades e conteúdo pronto para respostas na TripleZero iT.",
    ],
    [
      "AEO (motori di risposta)",
      "Answer Engine Optimization: citazioni, FAQ, entità e contenuti pronti per le risposte su TripleZero iT.",
    ],
  ),
  "geo-lokaal": loc(
    [
      "GEO (local)",
      "Local visibility: Google Business Profile, NAP, Maps, location pages and service areas.",
    ],
    [
      "GEO (lokal)",
      "Lokale Sichtbarkeit: Google Business Profile, NAP, Maps, Standortseiten und Service Areas.",
    ],
    [
      "GEO (local)",
      "Visibilité locale : Google Business Profile, NAP, Maps, pages locales et zones de service.",
    ],
    [
      "GEO (local)",
      "Visibilidad local: Google Business Profile, NAP, Maps, páginas de ubicación y áreas de servicio.",
    ],
    [
      "GEO (local)",
      "Visibilidade local: Google Business Profile, NAP, Maps, páginas de localização e áreas de serviço.",
    ],
    [
      "GEO (locale)",
      "Visibilità locale: Google Business Profile, NAP, Maps, pagine località e aree di servizio.",
    ],
  ),
  "seo-klassiek": loc(
    [
      "SEO (classic)",
      "Technical SEO, on-page, indexation, Core Web Vitals, WordPress and ecommerce SEO.",
    ],
    [
      "SEO (klassisch)",
      "Technisches SEO, On-Page, Indexierung, Core Web Vitals, WordPress und Shop-SEO.",
    ],
    [
      "SEO (classique)",
      "SEO technique, on-page, indexation, Core Web Vitals, WordPress et SEO e-commerce.",
    ],
    [
      "SEO (clásico)",
      "SEO técnico, on-page, indexación, Core Web Vitals, WordPress y SEO de tienda.",
    ],
    [
      "SEO (clássico)",
      "SEO técnico, on-page, indexação, Core Web Vitals, WordPress e SEO de loja.",
    ],
    [
      "SEO (classico)",
      "SEO tecnico, on-page, indicizzazione, Core Web Vitals, WordPress e SEO e-commerce.",
    ],
  ),
  "aeo-geo-seo-trajecten": loc(
    [
      "Programs and plans",
      "Basic, plus and pro; ordering; AI scan versus full program; AEO, GEO and SEO services.",
    ],
    [
      "Programme und Pakete",
      "Basic, Plus und Pro; Bestellung; AI-Scan versus volles Programm; AEO-, GEO- und SEO-Dienste.",
    ],
    [
      "Parcours et forfaits",
      "Basic, plus et pro ; commande ; AI-scan versus parcours complet ; services AEO, GEO et SEO.",
    ],
    [
      "Trayectos y planes",
      "Basic, plus y pro; pedido; AI-scan frente a trayecto completo; servicios AEO, GEO y SEO.",
    ],
    [
      "Percursos e planos",
      "Basic, plus e pro; encomenda; AI-scan versus percurso completo; serviços AEO, GEO e SEO.",
    ],
    [
      "Percorsi e pacchetti",
      "Basic, plus e pro; ordine; AI-scan versus percorso completo; servizi AEO, GEO e SEO.",
    ],
  ),
  "aeo-geo-seo-resultaten": loc(
    [
      "Content, measurement and issues",
      "Content calendar, KPIs, audits, regressions and common AEO/GEO/SEO problems.",
    ],
    [
      "Content, Messung und Fehler",
      "Content-Kalender, KPIs, Audits, Regressionen und häufige AEO/GEO/SEO-Probleme.",
    ],
    [
      "Contenu, mesure et erreurs",
      "Calendrier éditorial, KPI, audits, régressions et problèmes courants AEO/GEO/SEO.",
    ],
    [
      "Contenido, medición y errores",
      "Calendario de contenido, KPI, auditorías, regresiones y problemas frecuentes de AEO/GEO/SEO.",
    ],
    [
      "Conteúdo, medição e erros",
      "Calendário de conteúdo, KPI, auditorias, regressões e problemas comuns de AEO/GEO/SEO.",
    ],
    [
      "Contenuti, misurazione ed errori",
      "Calendario contenuti, KPI, audit, regressioni e problemi comuni di AEO/GEO/SEO.",
    ],
  ),
  "ai-scan-starten": loc(
    ["Getting started", "What the AI scan is, how to start, URL choice, free use and how often to scan."],
    ["Start und Grundlagen", "Was der AI-Scan ist, Start, URL-Wahl, kostenlose Nutzung und Scan-Häufigkeit."],
    ["Démarrage", "Ce qu'est l'AI-scan, comment démarrer, choix d'URL, usage gratuit et fréquence."],
    ["Primeros pasos", "Qué es el AI-scan, cómo empezar, URL, uso gratuito y frecuencia."],
    ["Começar", "O que é o AI-scan, como começar, URL, uso gratuito e frequência."],
    ["Per iniziare", "Cos'è l'AI-scan, come partire, URL, uso gratuito e frequenza."],
  ),
  "ai-scan-scores": loc(
    ["Understanding scores", "Reading the scorecard: AEO, GEO, SEO, Performance, AI Readiness and priorities."],
    ["Scores verstehen", "Scorekarte lesen: AEO, GEO, SEO, Performance, AI Readiness und Prioritäten."],
    ["Comprendre les scores", "Lire la grille: AEO, GEO, SEO, Performance, AI Readiness et priorités."],
    ["Entender las puntuaciones", "Leer la tarjeta: AEO, GEO, SEO, Performance, AI Readiness y prioridades."],
    ["Compreender as pontuações", "Ler o quadro: AEO, GEO, SEO, Performance, AI Readiness e prioridades."],
    ["Capire i punteggi", "Leggere la scorecard: AEO, GEO, SEO, Performance, AI Readiness e priorità."],
  ),
  "ai-scan-verbeteren": loc(
    ["Improving scores", "Fixing low scores, quick wins and measuring after changes."],
    ["Scores verbessern", "Niedrige Scores angehen, Quick Wins und Messen nach Änderungen."],
    ["Améliorer les scores", "Corriger les scores bas, gains rapides et mesure après changements."],
    ["Mejorar puntuaciones", "Abordar scores bajos, mejoras rápidas y medir tras cambios."],
    ["Melhorar pontuações", "Corrigir scores baixos, ganhos rápidos e medir após alterações."],
    ["Migliorare i punteggi", "Correggere score bassi, quick win e misurare dopo le modifiche."],
  ),
  "ai-scan-dashboard": loc(
    ["Dashboard and history", "Past scans, SEO analysis, contacting about results and scan issues."],
    ["Dashboard und Verlauf", "Frühere Scans, SEO-Analyse, Kontakt zu Ergebnissen und Scan-Probleme."],
    ["Tableau de bord et historique", "Scans passés, analyse SEO, contact sur les résultats et problèmes."],
    ["Panel e historial", "Escaneos previos, análisis SEO, contacto por resultados y fallos."],
    ["Painel e histórico", "Scans anteriores, análise SEO, contacto sobre resultados e falhas."],
    ["Dashboard e cronologia", "Scan precedenti, analisi SEO, contatto sui risultati e problemi."],
  ),
  "ai-scan-oplossingen": loc(
    ["Solutions and programs", "Packages, AEO/GEO/SEO services, agents, redesign and agency use."],
    ["Lösungen und Programme", "Pakete, AEO/GEO/SEO-Dienste, Agents, Redesign und Agenturnutzung."],
    ["Solutions et parcours", "Forfaits, services AEO/GEO/SEO, agents, redesign et usage agence."],
    ["Soluciones y programas", "Paquetes, servicios AEO/GEO/SEO, agentes, redesign y uso de agencias."],
    ["Soluções e programas", "Pacotes, serviços AEO/GEO/SEO, agentes, redesign e uso por agências."],
    ["Soluzioni e percorsi", "Pacchetti, servizi AEO/GEO/SEO, agent, redesign e uso per agenzie."],
  ),
  "bloggen-starten": loc(
    [
      "Getting started and platforms",
      "WordPress.org, WordPress.com, Blogger, own domain, migration and hosting choice.",
    ],
    [
      "Start und Plattformen",
      "WordPress.org, WordPress.com, Blogger, eigene Domain, Migration und Hostingwahl.",
    ],
    [
      "Démarrage et plateformes",
      "WordPress.org, WordPress.com, Blogger, domaine propre, migration et choix d'hébergement.",
    ],
    [
      "Inicio y plataformas",
      "WordPress.org, WordPress.com, Blogger, dominio propio, migración y elección de hosting.",
    ],
    [
      "Começar e plataformas",
      "WordPress.org, WordPress.com, Blogger, domínio próprio, migração e escolha de hosting.",
    ],
    [
      "Avvio e piattaforme",
      "WordPress.org, WordPress.com, Blogger, dominio proprio, migrazione e scelta hosting.",
    ],
  ),
  "bloggen-schrijven": loc(
    [
      "Writing and publishing",
      "Writing posts, editor, planning, post SEO, categories and tags.",
    ],
    [
      "Schreiben und Veröffentlichen",
      "Beiträge schreiben, Editor, Planung, Post-SEO, Kategorien und Tags.",
    ],
    [
      "Rédaction et publication",
      "Rédiger des posts, éditeur, planning, SEO des articles, catégories et tags.",
    ],
    [
      "Escritura y publicación",
      "Escribir posts, editor, planificación, SEO de artículos, categorías y etiquetas.",
    ],
    [
      "Escrita e publicação",
      "Escrever posts, editor, planeamento, SEO de artigos, categorias e tags.",
    ],
    [
      "Scrittura e pubblicazione",
      "Scrivere post, editor, pianificazione, SEO degli articoli, categorie e tag.",
    ],
  ),
  "bloggen-vormgeving": loc(
    [
      "Design and media",
      "Themes, images, featured media, layout and readability.",
    ],
    [
      "Gestaltung und Medien",
      "Themes, Bilder, Beitragsbild, Layout und Lesbarkeit.",
    ],
    [
      "Design et médias",
      "Thèmes, images, image mise en avant, mise en page et lisibilité.",
    ],
    [
      "Diseño y medios",
      "Temas, imágenes, imagen destacada, diseño y legibilidad.",
    ],
    [
      "Design e média",
      "Temas, imagens, imagem de destaque, layout e legibilidade.",
    ],
    [
      "Design e media",
      "Temi, immagini, immagine in evidenza, layout e leggibilità.",
    ],
  ),
  "bloggen-groei": loc(
    [
      "Growth and reach",
      "Comments, newsletter, social, monetization, forms and measurement.",
    ],
    [
      "Wachstum und Reichweite",
      "Kommentare, Newsletter, Social, Monetarisierung, Formulare und Messung.",
    ],
    [
      "Croissance et portée",
      "Commentaires, newsletter, social, monétisation, formulaires et mesure.",
    ],
    [
      "Crecimiento y alcance",
      "Comentarios, boletín, social, monetización, formularios y medición.",
    ],
    [
      "Crescimento e alcance",
      "Comentários, newsletter, social, monetização, formulários e medição.",
    ],
    [
      "Crescita e portata",
      "Commenti, newsletter, social, monetizzazione, form e misurazione.",
    ],
  ),
  "bloggen-beheer": loc(
    [
      "Operations and issues",
      "Updates, spam, backups, performance, errors and monthly maintenance.",
    ],
    [
      "Betrieb und Probleme",
      "Updates, Spam, Backups, Performance, Fehler und monatliche Wartung.",
    ],
    [
      "Exploitation et problèmes",
      "Mises à jour, spam, sauvegardes, performance, erreurs et entretien mensuel.",
    ],
    [
      "Operación y problemas",
      "Actualizaciones, spam, copias, rendimiento, errores y mantenimiento mensual.",
    ],
    [
      "Operação e problemas",
      "Atualizações, spam, backups, desempenho, erros e manutenção mensal.",
    ],
    [
      "Gestione e problemi",
      "Aggiornamenti, spam, backup, performance, errori e manutenzione mensile.",
    ],
  ),
  "cyberpanel-starten": loc(
    [
      "Getting started and access",
      "Login, 2FA, users/ACL, panel URL/port 8090 and limits.",
    ],
    [
      "Start und Zugang",
      "Login, 2FA, Benutzer/ACL, Panel-URL/Port 8090 und Limits.",
    ],
    [
      "Démarrage et accès",
      "Connexion, 2FA, utilisateurs/ACL, URL du panel/port 8090 et limites.",
    ],
    [
      "Inicio y acceso",
      "Inicio de sesión, 2FA, usuarios/ACL, URL del panel/puerto 8090 y límites.",
    ],
    [
      "Começar e acesso",
      "Login, 2FA, utilizadores/ACL, URL do painel/porta 8090 e limites.",
    ],
    [
      "Avvio e accesso",
      "Accesso, 2FA, utenti/ACL, URL del panel/porta 8090 e limiti.",
    ],
  ),
  "cyberpanel-websites": loc(
    [
      "Websites and domains",
      "Sites, aliases, redirects, subdomains, migration and document roots.",
    ],
    [
      "Websites und Domains",
      "Sites, Aliase, Redirects, Subdomains, Migration und Document Roots.",
    ],
    [
      "Sites et domaines",
      "Sites, alias, redirections, sous-domaines, migration et document roots.",
    ],
    [
      "Sitios y dominios",
      "Sitios, alias, redirecciones, subdominios, migración y document roots.",
    ],
    [
      "Sites e domínios",
      "Sites, aliases, redirects, subdomínios, migração e document roots.",
    ],
    [
      "Siti e domini",
      "Siti, alias, redirect, sottodomini, migrazione e document root.",
    ],
  ),
  "cyberpanel-email-dns": loc(
    [
      "Email and DNS",
      "Mailboxes, SPF/DKIM, webmail, mail queue, zones and MX records.",
    ],
    [
      "E-Mail und DNS",
      "Postfächer, SPF/DKIM, Webmail, Mailqueue, Zonen und MX-Records.",
    ],
    [
      "E-mail et DNS",
      "Boîtes mail, SPF/DKIM, webmail, file d'attente, zones et enregistrements MX.",
    ],
    [
      "Correo y DNS",
      "Buzones, SPF/DKIM, webmail, cola de correo, zonas y registros MX.",
    ],
    [
      "E-mail e DNS",
      "Caixas de correio, SPF/DKIM, webmail, fila de mail, zonas e registos MX.",
    ],
    [
      "Email e DNS",
      "Caselle, SPF/DKIM, webmail, coda mail, zone e record MX.",
    ],
  ),
  "cyberpanel-ssl-beveiliging": loc(
    [
      "SSL and security",
      "Let's Encrypt, custom SSL, firewall, ModSecurity and brute-force.",
    ],
    [
      "SSL und Sicherheit",
      "Let's Encrypt, Custom-SSL, Firewall, ModSecurity und Brute-Force.",
    ],
    [
      "SSL et sécurité",
      "Let's Encrypt, SSL personnalisé, pare-feu, ModSecurity et brute-force.",
    ],
    [
      "SSL y seguridad",
      "Let's Encrypt, SSL personalizado, firewall, ModSecurity y fuerza bruta.",
    ],
    [
      "SSL e segurança",
      "Let's Encrypt, SSL personalizado, firewall, ModSecurity e força bruta.",
    ],
    [
      "SSL e sicurezza",
      "Let's Encrypt, SSL personalizzato, firewall, ModSecurity e brute-force.",
    ],
  ),
  "cyberpanel-bestanden-databases": loc(
    [
      "Files, FTP and databases",
      "File Manager, permissions, MySQL/phpMyAdmin and WordPress via CyberPanel.",
    ],
    [
      "Dateien, FTP und Datenbanken",
      "File Manager, Rechte, MySQL/phpMyAdmin und WordPress über CyberPanel.",
    ],
    [
      "Fichiers, FTP et bases de données",
      "File Manager, droits, MySQL/phpMyAdmin et WordPress via CyberPanel.",
    ],
    [
      "Archivos, FTP y bases de datos",
      "File Manager, permisos, MySQL/phpMyAdmin y WordPress vía CyberPanel.",
    ],
    [
      "Ficheiros, FTP e bases de dados",
      "File Manager, permissões, MySQL/phpMyAdmin e WordPress via CyberPanel.",
    ],
    [
      "File, FTP e database",
      "File Manager, permessi, MySQL/phpMyAdmin e WordPress tramite CyberPanel.",
    ],
  ),
  "cyberpanel-php-ols": loc(
    [
      "PHP, OpenLiteSpeed, backups and issues",
      "PHP, OLS, cache, cron, backups and common errors.",
    ],
    [
      "PHP, OpenLiteSpeed, Backups und Probleme",
      "PHP, OLS, Cache, Cron, Backups und häufige Fehler.",
    ],
    [
      "PHP, OpenLiteSpeed, sauvegardes et problèmes",
      "PHP, OLS, cache, cron, sauvegardes et erreurs courantes.",
    ],
    [
      "PHP, OpenLiteSpeed, copias y problemas",
      "PHP, OLS, caché, cron, copias y errores frecuentes.",
    ],
    [
      "PHP, OpenLiteSpeed, backups e problemas",
      "PHP, OLS, cache, cron, backups e erros comuns.",
    ],
    [
      "PHP, OpenLiteSpeed, backup e problemi",
      "PHP, OLS, cache, cron, backup e errori comuni.",
    ],
  ),
};
