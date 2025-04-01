const it = {
    appHeader: {
      title: "Controllo Accesso Risorse Cloud",
      profile: "Profilo",
      administration: "Amministrazione",
      logout: "Logout",
      federationManagement: "Gestione Federazioni"
    },
    footer: {
      title: "Controllo Accesso Risorse Cloud",
      developedBy: "Sviluppato da",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Termini di Servizio",
      systemInfo: "Informazioni sul sistema"
    },
    sidebar: {
      dashboard: "Dashboard",
      calendar: "Calendario",
      myBookings: "Le mie prenotazioni",
      myProfile: "Il Mio Profilo",
      notifications: "Notifiche",
      administration: "Amministrazione",
      resources: "Risorse",
      logout: "Logout",
      federations: "Federazioni"
    },
    login: {
      title: "Accesso al sistema",
      email: "Email",
      password: "Password",
      rememberMe: "Ricordami",
      login: "Accedi",
      forgotPassword: "Password dimenticata?"
    },
    adminPanel: {
      resourceManagement: "Gestione Risorse",
      resourceTypes: "Tipi di Risorse",
      userManagement: "Gestione Utenti",
      auditLogs: "Log di Audit",
      webhooks: "Webhooks"
    },
    resourceManagement: {
      title: "Risorse Disponibili",
      addResource: "Aggiungi Risorsa",
      searchResources: "Cerca risorse...",
      type: "Tipo",
      allTypes: "Tutti i tipi",
      status: "Stato",
      allStatuses: "Tutti gli stati",
      active: "Attivo",
      maintenance: "Manutenzione",
      unavailable: "Non disponibile",
      addNewType: "Aggiungi nuovo tipo",
      noResourcesFound: "Nessuna risorsa trovata.",
      resourceUpdatedSuccess: "Risorsa aggiornata con successo",
      resourceCreatedSuccess: "Risorsa creata con successo",
      resourceDeletedSuccess: "Risorsa eliminata con successo",
      unableToUpdateResource: "Impossibile aggiornare la risorsa",
      unableToCreateResource: "Impossibile creare la risorsa",
      unableToDeleteResource: "Impossibile eliminare la risorsa",
      gridView: "Vista a Griglia", 
      hierarchyView: "Vista Gerarchica" 
    },
    resourceType: {
      title: "Tipi di Risorse",
      addType: "Aggiungi Tipo",
      searchResourceTypes: "Cerca tipi di risorsa...",
      noResourceTypesFound: "Nessun tipo di risorsa trovato.",
      id: "ID:",
      color: "Colore:",
      edit: "Modifica",
      delete: "Elimina",
      editResourceType: "Modifica Tipo Risorsa",
      newResourceType: "Nuovo Tipo Risorsa",
      typeName: "Nome Tipo",
      description: "Descrizione",
      random: "Casuale",
      cancel: "Annulla",
      confirm: "Conferma",
      update: "Aggiorna",
      nameRequired: "Il nome è obbligatorio",
      invalidColorCode: "Il colore deve essere un codice esadecimale valido (es. #1976d2)",
      confirmDeleteResourceType: "Sei sicuro di voler eliminare il tipo di risorsa",
      actionCannotBeUndone: "Questa azione non può essere annullata.",
      resourceTypeUpdatedSuccess: "Tipo di risorsa aggiornato con successo",
      resourceTypeCreatedSuccess: "Tipo di risorsa creato con successo",
      resourceTypeDeletedSuccess: "Tipo di risorsa eliminato con successo",
      unableToUpdateResourceType: "Impossibile aggiornare il tipo di risorsa",
      unableToCreateResourceType: "Impossibile creare il tipo di risorsa",
      unableToDeleteResourceType: "Impossibile eliminare il tipo di risorsa",
      selected: "selezionato"
    },
    userManagement: {
      globalAdministrator: "Amministratore Globale",
      federationAdministrator: "Amministratore Federazione",
      user: "Utente",
      title: "Utenti Registrati",
      addUser: "Aggiungi Utente",
      searchUsers: "Cerca utenti...",
      role: "Ruolo",
      allRoles: "Tutti i ruoli",
      administrator: "Amministratore",
      noUsersFound: "Nessun utente trovato.",
      editUser: "Modifica Utente",
      delete: "Elimina Utente",
      newUser: "Nuovo Utente",
      username: "Nome Utente",
      email: "Email",
      firstName: "Nome",
      lastName: "Cognome",
      password: "Password",
      keepCurrentPassword: "Password (lascia vuoto per non modificare)",
      generatePassword: "Genera password",
      copyPassword: "Copia password",
      showPassword: "Mostra password",
      hidePassword: "Nascondi password",
      avatarInitials: "Iniziali Avatar (opzionale)",
      autoGenerateInitials: "Lascia vuoto per generare automaticamente dalle iniziali del nome e cognome",
      userUpdatedSuccess: "Utente aggiornato con successo",
      userCreatedSuccess: "Utente creato con successo",
      userDeletedSuccess: "Utente eliminato con successo",
      unableToUpdateUser: "Impossibile aggiornare l'utente",
      unableToCreateUser: "Impossibile creare l'utente",
      unableToDeleteUser: "Impossibile eliminare l'utente",
      passwordCopied: "Password copiata negli appunti",
      confirmDeleteUser: "Sei sicuro di voler eliminare l'utente",
      actionCannotBeUndone: "Attenzione: Tutte le prenotazioni associate a questo utente saranno eliminate. Questa azione non può essere annullata.",
      invalidEmail: "Formato email non valido",
      passwordRequiredForNewUsers: "La password è obbligatoria per i nuovi utenti",
      unableToCopyPassword: "Impossibile copiare la password negli appunti"
    },
    resourceForm: {
      editResource: "Modifica Risorsa",
      newResource: "Nuova Risorsa",
      resourceName: "Nome Risorsa",
      resourceType: "Tipo Risorsa",
      selectType: "Seleziona tipo",
      specifications: "Specifiche",
      location: "Ubicazione",
      status: "Stato",
      active: "Attivo",
      maintenance: "Manutenzione",
      unavailable: "Non disponibile",
      cancel: "Annulla",
      confirm: "Conferma",
      update: "Aggiorna",
      delete: "Elimina",
      nameRequired: "Il nome è obbligatorio",
      typeRequired: "Il tipo è obbligatorio",
      specificationsRequired: "Le specifiche sono obbligatorie",
      locationRequired: "L'ubicazione è obbligatoria",
      parentResource: "Risorsa Principale", 
      noParent: "Nessuna Risorsa Principale (Livello Superiore)", 
      parentResourceHelp: "Seleziona una risorsa principale per creare una relazione gerarchica", 
      childResourceWarning: "Questa risorsa fa parte di una gerarchia. La prenotazione potrebbe essere influenzata dalla disponibilità della sua risorsa principale.", 
      parentResourceWarning: "La prenotazione di questa risorsa renderà indisponibili tutte le sue risorse secondarie durante lo stesso periodo.", 
      affectedSubResources: "Risorse secondarie che saranno interessate:" ,
      federation: "Federazione",
      selectFederation: "Seleziona una federazione",
      federationRequired: "La federazione è obbligatoria"
    },
    resourceCard: {
      specifications: "Specifiche:",
      location: "Ubicazione:",
      active: "Attivo",
      maintenance: "Manutenzione",
      unavailable: "Non disponibile",
      unknown: "Sconosciuto",
      id: "ID:",
      edit: "Modifica",
      delete: "Elimina"
    },
    bookingCalendar: {
      newBooking: "Nuova Prenotazione",
      resource: "Risorsa",
      allResources: "Tutte le risorse",
      loadingCalendar: "Caricamento calendario...",
      today: "Oggi",
      dayView: "Vista giornaliera",
      weekView: "Vista settimanale",
      monthView: "Vista mensile",
      previous: "Precedente",
      next: "Successivo",
      day: "Giorno",
      week: "Settimana",
      month: "Mese",
      date: "Data",
      time: "Ora",
      event: "Evento",
      noBookingsInPeriod: "Nessuna prenotazione in questo periodo",
      bookingUpdatedSuccess: "Prenotazione aggiornata con successo",
      bookingCreatedSuccess: "Prenotazione creata con successo",
      bookingDeletedSuccess: "Prenotazione eliminata con successo",
      unableToUpdateBooking: "Impossibile aggiornare la prenotazione",
      unableToCreateBooking: "Impossibile creare la prenotazione",
      unableToDeleteBooking: "Impossibile eliminare la prenotazione"
    },
    bookingForm: {
      bookingDetails: "Dettagli Prenotazione",
      editBooking: "Modifica Prenotazione",
      newBooking: "Nuova Prenotazione",
      title: "Titolo",
      resource: "Risorsa",
      selectResource: "Seleziona risorsa",
      noActiveResources: "Non ci sono risorse attive disponibili per la prenotazione",
      bookingUser: "Utente della prenotazione",
      adminBookingNote: "In qualità di amministratore, puoi effettuare prenotazioni per altri utenti o a tuo nome.",
      bookInMyName: "Prenota a mio nome",
      bookForAnotherUser: "Prenota per un altro utente",
      selectUser: "Seleziona utente",
      startDateTime: "Data/Ora Inizio",
      endDateTime: "Data/Ora Fine",
      checkAvailability: "Verifica disponibilità",
      checking: "Verifica in corso...",
      resourceAvailable: "La risorsa è disponibile nel periodo selezionato",
      resourceUnavailable: "La risorsa non è disponibile nel periodo selezionato",
      checkConflictsError: "Errore nella verifica dei conflitti, riprova più tardi",
      description: "Descrizione",
      cancel: "Annulla",
      confirm: "Conferma",
      update: "Aggiorna",
      delete: "Elimina",
      close: "Chiudi",
      confirmConflictContinue: "Ci potrebbero essere conflitti con altre prenotazioni. Vuoi continuare?",
      unableToCheckAvailability: "Impossibile verificare la disponibilità della risorsa",
      unknownResource: "Risorsa sconosciuta",
      period: "Periodo",
      bookedBy: "Prenotato da",
      unknownUser: "Utente sconosciuto",
      you: "Tu",
      viewingOtherBooking: "Stai visualizzando una prenotazione creata da un altro utente. Non è possibile modificarla.",
      titleRequired: "Il titolo è obbligatorio",
      resourceRequired: "La risorsa è obbligatoria",
      startDateRequired: "La data di inizio è obbligatoria",
      endDateRequired: "La data di fine è obbligatoria",
      endDateAfterStart: "La data di fine deve essere successiva alla data di inizio",
      userRequired: "L'utente è obbligatorio",
      correctErrorFields: "Per favore correggi i campi con errori:",
      affectedSubResources: "Le seguenti risorse secondarie saranno anch'esse bloccate:", 
      parentResource: "Parte della risorsa principale:" ,
      parentResourceExplanation: "Relazione Risorsa Gerarchica",
      childResourceExplanation: "Questa risorsa fa parte di una gerarchia",
      parentResourceDetail: "Quando prenoti questa risorsa principale, tutte le sue sotto-risorse saranno automaticamente bloccate durante lo stesso periodo.",
      childResourceDetail: "Questa risorsa appartiene a una risorsa principale. La sua disponibilità potrebbe essere influenzata se la risorsa principale viene prenotata.",
      dependentResources: "Sotto-risorse che saranno interessate",
      hierarchyStructure: "Struttura gerarchica",
      parentResourceLabel: "Risorsa Principale",
      siblingResourcesLabel: "Altre risorse nello stesso gruppo",
      parent: "PRINCIPALE",
      child: "SECONDARIA"
    },
    myBookings: {
      title: "Le mie prenotazioni",
      total: "Totali",
      future: "Future",
      thisMonth: "Questo mese",
      completed: "Completate",
      futureBookings: "Prenotazioni Future",
      pastBookings: "Prenotazioni Passate",
      noFutureBookings: "Non hai prenotazioni future",
      noPastBookings: "Non hai prenotazioni passate",
      upcomingBookingsWillAppear: "Le tue prossime prenotazioni appariranno qui",
      bookingHistoryWillAppear: "La cronologia delle tue prenotazioni apparirà qui",
      duration: "Durata:",
      hours: "ore",
      resource: "Risorsa:",
      viewInCalendar: "Vedi nel calendario"
    },
    dashboard: {
      title: "Dashboard Risorse",
      totalBookings: "Prenotazioni Totali",
      activeResources: "Risorse Attive",
      futureBookings: "Prenotazioni Future",
      utilizationRate: "Tasso di Utilizzo",
      bookingTrends: "Trend Prenotazioni",
      resourceStatus: "Stato Risorse",
      bookingsPerResource: "Prenotazioni per Risorsa",
      upcomingBookings: "Prossime Prenotazioni",
      noDataAvailable: "Nessun dato disponibile",
      resourceUtilization: "Utilizzo Risorse"
    },
    utilization: {
      resourceName: "Nome Risorsa",
      type: "Tipo",
      status: "Stato",
      bookings: "Prenotazioni",
      monthlyUtilizationRate: "Tasso di Utilizzo Mensile",
      active: "Attivo",
      maintenance: "Manutenzione",
      unavailable: "Non disponibile",
      unknown: "Sconosciuto",
      noData: "Nessun dato disponibile",
      na: "N/D"
    },
    trendChart: {
      booking: "prenotazioni",
      numberOfBookings: "Numero di prenotazioni",
      month: "Mese"
    },
    statusChart: {
      active: "Attive",
      inMaintenance: "In manutenzione",
      notAvailable: "Non disponibili"
    },
    upcomingReservations: {
      noUpcomingBookings: "Nessuna prenotazione imminente",
      date: "Data",
      user: "Utente",
      na: "N/D"
    },
    profile: {
      title: "Il Mio Profilo",
      editProfile: "Modifica Profilo",
      cancel: "Annulla",
      userNotAuthenticated: "Utente non autenticato",
      role: "Ruolo",
      administrator: "Amministratore",
      user: "Utente",
      userId: "ID Utente",
      firstName: "Nome",
      lastName: "Cognome",
      email: "Email",
      username: "Nome Utente",
      newPassword: "Nuova Password (lascia vuoto per mantenere attuale)",
      saveChanges: "Salva Modifiche",
      saving: "Salvataggio...",
      profileUpdatedSuccess: "Profilo aggiornato con successo",
      unableToUpdateProfile: "Impossibile aggiornare il profilo",
      avatarInitials: "Iniziali Avatar",
      maxTwoCharacters: "Massimo 2 caratteri",
      userIdCopied: "User ID copiato",
      copyUserId: "Copia ID",
      sshKeyManagement: "Gestione Chiave SSH",
      sshPublicKey: "Chiave SSH Pubblica",
      sshKeyDescription: "Aggiungi la tua chiave SSH pubblica per accedere alle risorse in remoto. Questa chiave verrà utilizzata per autenticarti quando ti connetti alle risorse via SSH.",
      sshKeyPlaceholder: "Incolla qui la tua chiave SSH pubblica (ssh-rsa AAAAB3Nza...)",
      supportedSshKeyFormats: "Formati supportati",
      deleteSshKey: "Elimina Chiave SSH",
      confirmDeleteSshKey: "Sei sicuro di voler eliminare la tua chiave SSH?",
      sshKeyDeleted: "Chiave SSH eliminata con successo",
      unableToDeleteSshKey: "Impossibile eliminare la chiave SSH",
      unableToLoadSshKey: "Impossibile caricare la chiave SSH",
      sshKeyUsage: "Esempio di connessione",
      editToChangeSshKey: "Clicca su Modifica per cambiare o rimuovere la tua chiave SSH"
    },
    notificationsPage: {
      title: "Centro Notifiche",
      all: "Tutte",
      unread: "Non lette",
      allTypes: "Tutti i tipi",
      type: "Tipo:",
      markAllAsRead: "Segna tutte come lette",
      information: "Informazioni",
      success: "Successo",
      warnings: "Avvisi",
      errors: "Errori",
      loadingNotifications: "Caricamento notifiche...",
      noNotificationsToDisplay: "Nessuna notifica da visualizzare",
      errorLoadingNotifications: "Errore nel caricamento delle notifiche:",
      tryAgain: "Riprova",
      unknownDate: "Data sconosciuta",
      invalidDate: "Data non valida",
      noNotifications: "Nessuna notifica",
      markAsRead: "Segna come letta",
      viewAllNotifications: "Vedi tutte le notifiche"
    },
    notificationMenu: {
      notifications: "Notifiche",
      markAllAsRead: "Segna tutte come lette",
      loadingNotifications: "Caricamento notifiche...",
      errorLoadingNotifications: "Errore nel caricamento delle notifiche",
      tryAgain: "Riprova",
      noNotifications: "Nessuna notifica",
      viewAllNotifications: "Vedi tutte le notifiche",
      dayAgo: "giorno fa",
      daysAgo: "giorni fa",
      hourAgo: "ora fa",
      hoursAgo: "ore fa",
      minuteAgo: "minuto fa",
      minutesAgo: "minuti fa",
      justNow: "appena ora",
      unknownDate: "Data sconosciuta",
      invalidDate: "Data non valida"
  },
  errors: {
    errorOccurred: "Si è verificato un errore",
    operationError: "Si è verificato un errore durante l'operazione",
    serverCommunicationError: "Errore durante la comunicazione con il server",
    sessionExpired: "Sessione scaduta, effettua nuovamente il login",
    unableToLoadCalendarData: "Impossibile caricare i dati del calendario",
    unableToLoadUserList: "Impossibile caricare la lista degli utenti",
    unableToLoadResources: "Impossibile caricare le risorse",
    unableToLoadResourceTypes: "Impossibile caricare i tipi di risorse",
    unableToLoadYourBookings: "Impossibile caricare le tue prenotazioni",
    unableToLoadBookingData: "Impossibile caricare i dati delle prenotazioni",
    unableToLoadResourceData: "Impossibile caricare i dati delle risorse",
    unableToLoadNotifications: "Impossibile caricare le notifiche",
    unableToSendNotification: "Impossibile inviare la notifica",
    unableToMarkNotificationAsRead: "Impossibile segnare la notifica come letta",
    unableToMarkAllNotificationsAsRead: "Impossibile segnare tutte le notifiche come lette",
    unableToDeleteNotification: "Impossibile eliminare la notifica",
    moreErrorsNotDisplayed: "Ci sono altri {{count}} errori non visualizzati",
    federation: "Federazione",
    selectFederation: "Seleziona una federazione",
    federationRequired: "La federazione è obbligatoria"
  },
  common: {
    unableToCompleteOperation: "Impossibile completare l'operazione",
    operationCompletedSuccessfully: "Operazione completata con successo",
    loading: "Caricamento...",
    cancel: "Annulla",
    confirm: "Conferma",
    delete: "Elimina",
    edit: "Modifica",
    close: "Chiudi",
    noDataAvailable: "Nessun dato disponibile",
    yes: "Si",
    no: "No",
    error: "Errore",
    success: "Successo",
    warning: "Avviso",
    information: "Informazione",
    tryAgain: "Riprova",
    more: "Altre..",
    update: "Aggiorna",
    isRequired: "è obbligatorio",
    save: "Salva",
    saving: "Salvataggio..",
    create: "Crea"
  },
  languageSelector: {
    language: "Lingua",
    english: "Inglese",
    italian: "Italiano"
  },
  themeToggler: {
    darkMode: "Modalità scura",
    lightMode: "Modalità chiara",
    systemPreference: "Usa preferenza di sistema"
  },
  resourceExplorer: {
    title: "Esplora Risorse",
    searchResources: "Cerca risorse...",
    type: "Tipo",
    allTypes: "Tutti i tipi",
    allResources: "Tutte le risorse",
    activeResources: "Risorse attive",
    maintenanceResources: "Risorse in manutenzione",
    unavailableResources: "Risorse non disponibili",
    noResourcesFound: "Nessuna risorsa trovata con i filtri selezionati.",
    noResourcesForGraph: "Non ci sono risorse da visualizzare nel grafo.",
    listView: "Vista elenco",
    graphView: "Vista grafo",
    howToUse: "Come usare",
    viewDetails: "Visualizza dettagli",
    clickToViewDetails: "Clicca per visualizzare i dettagli",
    active: "Attivo",
    maintenance: "Manutenzione",
    unavailable: "Non disponibile",
    unknown: "Sconosciuto",
    unknownType: "Tipo sconosciuto",
    hasParent: "Ha una risorsa principale",
    hasChildren: "Ha risorse secondarie",
    graphInstructions: "Usa la rotellina del mouse per zoom in/out, trascina con il pulsante destro o centrale per muoverti, clicca su un nodo per visualizzare i dettagli.",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset vista",
    reset: "Reset",
    resourceExploration: "Esplorazione Risorse",
    explore: "Esplora",
    details: "Dettagli",
    bookings: "Prenotazioni",
    hierarchy: "Gerarchia",
    specifications: "Specifiche",
    location: "Ubicazione",
    status: "Stato",
    resourceInformation: "Informazioni sulla risorsa",
    resourceDescription: "Questa risorsa può essere prenotata attraverso il calendario. Controlla la disponibilità e le informazioni di prenotazione per maggiori dettagli.",
    viewInCalendar: "Visualizza nel calendario",
    upcomingBookings: "Prossime prenotazioni",
    loadingBookings: "Caricamento prenotazioni...",
    noUpcomingBookings: "Non ci sono prenotazioni future per questa risorsa.",
    bookThisResource: "Prenota questa risorsa",
    resourceHierarchy: "Gerarchia della risorsa",
    parentResource: "Risorsa principale",
    childResources: "Risorse secondarie",
    loadingChildResources: "Caricamento risorse secondarie...",
    noHierarchyRelationships: "Questa risorsa non ha relazioni gerarchiche con altre risorse.",
    hierarchyView: "Vista gerarchica",
    expandAll: "Espandi tutto",
    collapseAll: "Comprimi tutto",
    recentBookings: "Prenotazioni recenti",
    completed: "Completata",
    andMorePastBookings: "e altre {count} prenotazioni passate",
    unableToLoadBookings: "Impossibile caricare le prenotazioni",
    errorLoadingBookings: "Errore durante il caricamento delle prenotazioni",
    unknownUser: "Utente sconosciuto",
  },
  resourceHierarchy: {
    title: "Gerarchia delle Risorse",
    parentResource: "Risorsa Principale",
    subResources: "Risorse Secondarie",
    dragDropInstructions: "Trascina e rilascia le risorse per organizzare la gerarchia. Trascina una risorsa su un'altra per creare una relazione padre-figlio.",
    dropToRemoveParent: "Rilascia qui per rimuovere la relazione padre",
    resourceNotFound: "Risorsa non trovata",
    circularReferenceError: "Impossibile creare una relazione circolare. Un padre non può essere figlio di un suo discendente.",
    alreadyParent: "Questa risorsa è già il padre della risorsa trascinata",
    parentUpdated: "La risorsa {name} è stata spostata sotto {parent}",
    parentRemoved: "Relazione padre rimossa dalla risorsa {name}",
    unableToUpdateParent: "Impossibile aggiornare la relazione padre",
    unableToRemoveParent: "Impossibile rimuovere la relazione padre",
    hierarchyUpdated: "Gerarchia delle risorse aggiornata con successo"
  },
  federations: {
    title: "Federazioni",
    management: "Gestione Federazioni",
    addFederation: "Aggiungi Federazione",
    editFederation: "Modifica Federazione",
    newFederation: "Nuova Federazione",
    name: "Nome Federazione",
    description: "Descrizione",
    searchFederations: "Cerca federazioni...",
    noFederationsFound: "Nessuna federazione trovata.",
    federationUpdatedSuccess: "Federazione '{{name}}' aggiornata con successo",
    federationCreatedSuccess: "Federazione '{{name}}' creata con successo",
    federationDeletedSuccess: "Federazione '{{name}}' eliminata con successo",
    unableToUpdateFederation: "Impossibile aggiornare la federazione '{{name}}'",
    unableToCreateFederation: "Impossibile creare la federazione '{{name}}'",
    unableToDeleteFederation: "Impossibile eliminare la federazione '{{name}}'",
    confirmDeleteFederation: "Sei sicuro di voler eliminare la federazione '{{name}}'? Tutte le risorse e i tipi di risorse associati saranno eliminati.",
    members: "{count} membri",
    admins: "Amministratori",
    unableToLoadFederations: "Impossibile caricare le federazioni",
    unableToLoadMembers: "Impossibile caricare i membri della federazione",
    unableToLoadAdmins: "Impossibile caricare gli amministratori della federazione",
    addUser: "Aggiungi Utente",
    addAdmin: "Aggiungi Amministratore",
    selectUser: "Seleziona Utente",
    searchUsers: "Cerca utenti...",
    noUsersFound: "Nessun utente trovato.",
    noUsersMatchingSearch: "Nessun utente corrisponde alla ricerca.",
    noMembersInFederation: "Nessun membro in questa federazione.",
    noAdminsInFederation: "Nessun amministratore in questa federazione.",
    noAdminsMatchingSearch: "Nessun amministratore corrisponde alla ricerca.",
    unableToAddUser: "Impossibile aggiungere l'utente '{{name}}' alla federazione",
    unableToRemoveUser: "Impossibile rimuovere l'utente '{{name}}' dalla federazione",
    unableToAddAdmin: "Impossibile aggiungere l'utente '{{name}}' come amministratore della federazione",
    unableToRemoveAdmin: "Impossibile rimuovere l'amministratore '{{name}}'",
    confirmRemoveUser: "Sei sicuro di voler rimuovere l'utente '{{name}}' dalla federazione '{federation}'?",
    confirmRemoveAdmin: "Sei sicuro di voler rimuovere '{{name}}' come amministratore della federazione '{federation}'?",
    removeFromFederation: "Rimuovi dalla federazione",
    removeAdminRole: "Rimuovi ruolo di amministratore",
    unableToLoadUsers: "Impossibile caricare gli utenti"
  },
  federationSelector: {
    selectFederation: "Seleziona Federazione",
    allFederations: "Tutte le Federazioni"
  },
  auditLogs: {
    title: "Log di Audit",
    totalLogs: "Log Totali",
    adminLogs: "Log Amministrativi",
    userLogs: "Log Utente",
    errorLogs: "Log di Errore",
    search: "Cerca nei log...",
    showFilters: "Mostra Filtri",
    hideFilters: "Nascondi Filtri",
    refresh: "Aggiorna",
    resetFilters: "Reimposta Filtri",
    noLogsFound: "Nessun log trovato",
    id: "ID",
    timestamp: "Data e Ora",
    username: "Nome Utente",
    federation: "Federazione",
    type: "Tipo",
    entityType: "Tipo Entità",
    entityId: "ID Entità",
    action: "Azione",
    severity: "Severità",
    details: "Dettagli",
    shortDetails: "Riepilogo",
    actions: "Azioni",
    viewDetails: "Visualizza Dettagli",
    logDetails: "Dettagli Log",
    close: "Chiudi",
    notApplicable: "N/D",
    allTypes: "Tutti i Tipi",
    allActions: "Tutte le Azioni",
    allSeverities: "Tutte le Severità",
    allEntityTypes: "Tutti i Tipi di Entità",
    filterByUsername: "Filtra per nome utente",
    filterByEntityId: "Filtra per ID entità",
    startDate: "Data Inizio",
    endDate: "Data Fine",
    dateRange: "Intervallo Date",
    errorLoadingLogs: "Errore durante il caricamento dei log",
    errorLoadingLogDetails: "Errore durante il caricamento dei dettagli del log"
  },
  webhooks: {
    title: "Gestione Webhook",
    configurations: "Configurazioni",
    logs: "Log",
    addWebhook: "Aggiungi Webhook",
    editWebhook: "Modifica Webhook",
    newWebhook: "Nuovo Webhook",
    name: "Nome",
    url: "URL",
    urlHelp: "L'URL dove verrà inviato il webhook",
    eventType: "Tipo Evento",
    federation: "Federazione",
    selectFederation: "Seleziona Federazione",
    secret: "Chiave Segreta",
    secretHelp: "Utilizzata per firmare il payload del webhook per sicurezza",
    maxRetries: "Tentativi Massimi",
    maxRetriesHelp: "Numero massimo di tentativi di ripetizione in caso di fallimento",
    retryDelaySeconds: "Ritardo tra Tentativi (secondi)",
    retryDelayHelp: "Ritardo tra i tentativi di ripetizione con backoff esponenziale",
    enabled: "Abilitato",
    disabled: "Disabilitato",
    generateSecret: "Genera Chiave",
    showSecret: "Mostra Chiave",
    hideSecret: "Nascondi Chiave",
    webhookInfo: "I webhook permettono a sistemi esterni di ricevere notifiche quando si verificano eventi nella piattaforma. Il payload viene inviato come richiesta POST con corpo JSON.",
    nameRequired: "Il nome è obbligatorio",
    urlRequired: "L'URL è obbligatorio",
    invalidUrl: "Formato URL non valido",
    eventTypeRequired: "Il tipo di evento è obbligatorio",
    federationRequired: "La federazione è obbligatoria",
    updateFailed: "Impossibile aggiornare il webhook",
    creationFailed: "Impossibile creare il webhook",
    updating: "Aggiornamento in corso...",
    creating: "Creazione in corso...",
    allEvents: "Tutti gli Eventi",
    eventCreated: "Prenotazione Creata",
    eventUpdated: "Prenotazione Aggiornata",
    eventDeleted: "Prenotazione Eliminata",
    resourceCreated: "Risorsa Creata",
    resourceUpdated: "Risorsa Aggiornata",
    resourceDeleted: "Risorsa Eliminata",
    federationName: "Federazione",
    signatureEnabled: "Firma Abilitata",
    noSignature: "Nessuna Firma",
    testWebhook: "Testa Webhook",
    deleteWebhook: "Elimina Webhook",
    confirmDeleteTitle: "Conferma Eliminazione",
    confirmDeleteMessage: "Sei sicuro di voler eliminare il webhook '{{name}}'? Questa azione non può essere annullata.",
    deleting: "Eliminazione in corso...",
    testWebhookSuccess: "Test webhook '{{name}}' inviato con successo",
    testWebhookError: "Impossibile testare il webhook '{{name}}'",
    webhookUpdatedSuccess: "Webhook '{{name}}' aggiornato con successo",
    webhookCreatedSuccess: "Webhook '{{name}}' creato con successo",
    webhookDeletedSuccess: "Webhook '{{name}}' eliminato con successo",
    unableToLoadWebhooks: "Impossibile caricare i webhook",
    unableToDeleteWebhook: "Impossibile eliminare il webhook '{{name}}'",
    unableToLoadLogs: "Impossibile caricare i log dei webhook",
    noWebhooksFound: "Nessun webhook trovato",
    basicInformation: "Informazioni di base",
    resourceSelection: "Selezione risorsa",
    selectResourceScope: "Seleziona l'ambito delle risorse",
    allResources: "Tutte le risorse",
    specificResource: "Risorsa specifica",
    resourcesByType: "Risorse per tipo",
    advancedConfiguration: "Configurazione avanzata",
    secretGeneratedByServer: "La chiave segreta verrà generata automaticamente dal server",
    selectResource: "Seleziona risorsa",
    selectResourceType: "Seleziona tipo di risorsa",
    pleaseSelectResource: "Seleziona una risorsa",
    pleaseSelectResourceType: "Seleziona un tipo di risorsa",
    includeSubResources: "Includi risorse figlie",
    clientSecretTitle: "Client Secret",
    clientSecretWarning: "Questo secret verrà mostrato solo una volta e non sarà più accessibile dopo la chiusura di questa finestra",
    clientSecretDescription: "Conserva questo secret in un luogo sicuro. Ti servirà per verificare l'autenticità delle richieste webhook.",
    clientSecretUsage: "Utilizza questo secret per verificare la firma HMAC-SHA256 presente nell'header 'X-Webhook-Signature' di ogni richiesta webhook.",
    copied: "Copiato!",
    copy: "Copia",
    // Webhook logs
    filterByWebhook: "Filtra per Webhook",
    allWebhooks: "Tutti i Webhook",
    status: "Stato",
    allStatuses: "Tutti gli Stati",
    success: "Successo",
    failed: "Fallito",
    refresh: "Aggiorna",
    date: "Data",
    webhook: "Webhook",
    httpStatus: "Stato HTTP",
    actions: "Azioni",
    noLogsFound: "Nessun log trovato",
    viewDetails: "Visualizza Dettagli",
    logDetails: "Dettagli Log",
    payload: "Payload",
    response: "Risposta",
    retryCount: "Contatore Tentativi",
    nextRetryAt: "Prossimo Tentativo"
  }
};

export default it;