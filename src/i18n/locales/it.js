const it = {
    appHeader: {
      title: "Controllo Accesso Risorse Cloud",
      profile: "Profilo",
      administration: "Amministrazione",
      logout: "Logout"
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
      logout: "Logout"
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
      userManagement: "Gestione Utenti"
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
      color: "Colore",
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
      title: "Utenti Registrati",
      addUser: "Aggiungi Utente",
      searchUsers: "Cerca utenti...",
      role: "Ruolo",
      allRoles: "Tutti i ruoli",
      administrator: "Amministratore",
      user: "Utente",
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
    resourceHierarchy: { 
      title: "Gerarchia delle Risorse", 
      parentResource: "Risorsa Principale", 
      subResources: "Risorse Secondarie" 
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
      affectedSubResources: "Risorse secondarie che saranno interessate:" 
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
      resource: "Risorsa",
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
      parentResource: "Parte della risorsa principale:" 
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
      future: "Futura",
      completed: "Completata",
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
      userIdCopied: "User ID copiato"

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
    moreErrorsNotDisplayed: "Ci sono altri {{count}} errori non visualizzati"
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
    isRequired: "è obbligatorio"
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
  themeToggler: {
    darkMode: "Modalità scura",
    lightMode: "Modalità chiara",
    systemPreference: "Usa preferenza di sistema"
  }
};

export default it;