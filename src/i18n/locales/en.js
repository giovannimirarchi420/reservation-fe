const en = {
    appHeader: {
      title: "Cloud Resource Access Control",
      profile: "Profile",
      administration: "Administration",
      logout: "Logout"
    },
    footer: {
      title: "Cloud Resource Access Control",
      developedBy: "Developed by",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      systemInfo: "System Information"
    },
    sidebar: {
      dashboard: "Dashboard",
      calendar: "Calendar",
      myBookings: "My Bookings",
      myProfile: "My Profile",
      notifications: "Notifications",
      administration: "Administration",
      logout: "Logout"
    },
    login: {
      title: "System Login",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      login: "Login",
      forgotPassword: "Forgot password?"
    },
    adminPanel: {
      resourceManagement: "Resource Management",
      resourceTypes: "Resource Types",
      userManagement: "User Management"
    },
    resourceManagement: {
      title: "Available Resources",
      addResource: "Add Resource",
      searchResources: "Search resources...",
      type: "Type",
      allTypes: "All types",
      status: "Status",
      allStatuses: "All statuses",
      active: "Active",
      maintenance: "Maintenance",
      unavailable: "Unavailable",
      addNewType: "Add new type",
      noResourcesFound: "No resources found.",
      resourceUpdatedSuccess: "Resource updated successfully",
      resourceCreatedSuccess: "Resource created successfully",
      resourceDeletedSuccess: "Resource deleted successfully",
      unableToUpdateResource: "Unable to update resource",
      unableToCreateResource: "Unable to create resource",
      unableToDeleteResource: "Unable to delete resource"
    },
    resourceType: {
      title: "Resource Types",
      addType: "Add Type",
      searchResourceTypes: "Search resource types...",
      noResourceTypesFound: "No resource types found.",
      id: "ID:",
      color: "Color:",
      edit: "Edit",
      delete: "Delete",
      editResourceType: "Edit Resource Type",
      newResourceType: "New Resource Type",
      typeName: "Type Name",
      description: "Description",
      color: "Color",
      random: "Random",
      cancel: "Cancel",
      confirm: "Confirm",
      update: "Update",
      nameRequired: "Name is required",
      invalidColorCode: "Color must be a valid hexadecimal code (e.g. #1976d2)",
      confirmDeleteResourceType: "Are you sure you want to delete the resource type",
      actionCannotBeUndone: "This action cannot be undone.",
      resourceTypeUpdatedSuccess: "Resource type updated successfully",
      resourceTypeCreatedSuccess: "Resource type created successfully",
      resourceTypeDeletedSuccess: "Resource type deleted successfully",
      unableToUpdateResourceType: "Unable to update resource type",
      unableToCreateResourceType: "Unable to create resource type",
      unableToDeleteResourceType: "Unable to delete resource type",
      selected: "selected"
    },
    userManagement: {
      title: "Registered Users",
      addUser: "Add User",
      searchUsers: "Search users...",
      role: "Role",
      allRoles: "All roles",
      administrator: "Administrator",
      user: "User",
      noUsersFound: "No users found.",
      editUser: "Edit User",
      delete: "Delete User",
      newUser: "New User",
      username: "Username",
      email: "Email",
      firstName: "First Name",
      lastName: "Last Name",
      password: "Password",
      keepCurrentPassword: "Password (leave empty to keep current)",
      generatePassword: "Generate password",
      copyPassword: "Copy password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      avatarInitials: "Avatar Initials (optional)",
      autoGenerateInitials: "Leave empty to automatically generate from first name and last name initials",
      userUpdatedSuccess: "User updated successfully",
      userCreatedSuccess: "User created successfully",
      userDeletedSuccess: "User deleted successfully",
      unableToUpdateUser: "Unable to update user",
      unableToCreateUser: "Unable to create user",
      unableToDeleteUser: "Unable to delete user",
      passwordCopied: "Password copied to clipboard",
      confirmDeleteUser: "Are you sure you want to delete the user",
      actionCannotBeUndone: "Warning: All bookings associated with this user will also be deleted. This action cannot be undone.",
      invalidEmail: "Invalid email format",
      passwordRequiredForNewUsers: "Password is required for new users",
      unableToCopyPassword: "Unable to copy password to clipboard"
    },
    resourceForm: {
      editResource: "Edit Resource",
      newResource: "New Resource",
      resourceName: "Resource Name",
      resourceType: "Resource Type",
      selectType: "Select type",
      specifications: "Specifications",
      location: "Location",
      status: "Status",
      active: "Active",
      maintenance: "Maintenance",
      unavailable: "Unavailable",
      cancel: "Cancel",
      confirm: "Confirm",
      update: "Update",
      delete: "Delete",
      nameRequired: "Name is required",
      typeRequired: "Type is required",
      specificationsRequired: "Specifications are required",
      locationRequired: "Location is required"
    },
    resourceCard: {
      specifications: "Specifications:",
      location: "Location:",
      active: "Active",
      maintenance: "Maintenance",
      unavailable: "Unavailable",
      unknown: "Unknown",
      id: "ID:",
      edit: "Edit",
      delete: "Delete"
    },
    bookingCalendar: {
      newBooking: "New Booking",
      resource: "Resource",
      allResources: "All resources",
      loadingCalendar: "Loading calendar...",
      today: "Today",
      dayView: "Day view",
      weekView: "Week view",
      monthView: "Month view",
      previous: "Previous",
      next: "Next",
      day: "Day",
      week: "Week",
      month: "Month",
      date: "Date",
      time: "Time",
      event: "Event",
      noBookingsInPeriod: "No bookings during this period",
      bookingUpdatedSuccess: "Booking updated successfully",
      bookingCreatedSuccess: "Booking created successfully",
      bookingDeletedSuccess: "Booking deleted successfully",
      unableToUpdateBooking: "Unable to update booking",
      unableToCreateBooking: "Unable to create booking",
      unableToDeleteBooking: "Unable to delete booking"
    },
    bookingForm: {
      bookingDetails: "Booking Details",
      editBooking: "Edit Booking",
      newBooking: "New Booking",
      title: "Title",
      resource: "Resource",
      selectResource: "Select resource",
      noActiveResources: "There are no active resources available for booking",
      bookingUser: "Booking User",
      adminBookingNote: "As an administrator, you can make bookings for other users or in your own name.",
      bookInMyName: "Book in my name",
      bookForAnotherUser: "Book for another user",
      selectUser: "Select user",
      startDateTime: "Start Date/Time",
      endDateTime: "End Date/Time",
      checkAvailability: "Check availability",
      checking: "Checking...",
      resourceAvailable: "The resource is available for the selected period",
      resourceUnavailable: "The resource is not available for the selected period",
      checkConflictsError: "Error checking for conflicts, please try again later",
      description: "Description",
      cancel: "Cancel",
      confirm: "Confirm",
      update: "Update",
      delete: "Delete",
      close: "Close",
      confirmConflictContinue: "There may be conflicts with other bookings. Do you want to continue?",
      unableToCheckAvailability: "Unable to check resource availability",
      resource: "Resource",
      unknownResource: "Unknown resource",
      period: "Period",
      bookedBy: "Booked by",
      unknownUser: "Unknown user",
      you: "You",
      viewingOtherBooking: "You are viewing a booking created by another user. It cannot be modified.",
      titleRequired: "Title is required",
      resourceRequired: "Resource is required",
      startDateRequired: "Start date is required",
      endDateRequired: "End date is required",
      endDateAfterStart: "End date must be after start date",
      userRequired: "User is required",
      correctErrorFields: "Please correct the fields with errors:"
    },
    myBookings: {
      title: "My Bookings",
      total: "Total",
      future: "Future",
      thisMonth: "This month",
      completed: "Completed",
      futureBookings: "Future Bookings",
      pastBookings: "Past Bookings",
      noFutureBookings: "You have no future bookings",
      noPastBookings: "You have no past bookings",
      upcomingBookingsWillAppear: "Your upcoming bookings will appear here",
      bookingHistoryWillAppear: "Your booking history will appear here",
      duration: "Duration:",
      hours: "hours",
      resource: "Resource:",
      future: "Future",
      completed: "Completed",
      viewInCalendar: "View in calendar"
    },
    dashboard: {
      title: "Resource Dashboard",
      totalBookings: "Total Bookings",
      activeResources: "Active Resources",
      futureBookings: "Future Bookings",
      utilizationRate: "Utilization Rate",
      bookingTrends: "Booking Trends",
      resourceStatus: "Resource Status",
      bookingsPerResource: "Bookings per Resource",
      upcomingBookings: "Upcoming Bookings",
      noDataAvailable: "No data available",
      resourceUtilization: "Resource Utilization"
    },
    utilization: {
      resourceName: "Resource Name",
      type: "Type",
      status: "Status",
      bookings: "Bookings",
      monthlyUtilizationRate: "Monthly Utilization Rate",
      active: "Active",
      maintenance: "Maintenance",
      unavailable: "Unavailable",
      unknown: "Unknown",
      na: "N/A",
      noData: "No data available"
    },
    trendChart: {
      booking: "bookings",
      numberOfBookings: "Number of bookings",
      month: "Month"
    },
    statusChart: {
      active: "Active",
      inMaintenance: "In maintenance",
      notAvailable: "Not available"
    },
    upcomingReservations: {
      noUpcomingBookings: "No upcoming bookings",
      date: "Date",
      user: "User",
      na: "N/A"
    },
    profile: {
      title: "My Profile",
      editProfile: "Edit Profile",
      cancel: "Cancel",
      userNotAuthenticated: "User not authenticated",
      role: "Role",
      administrator: "Administrator",
      user: "User",
      userId: "User ID",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      username: "Username",
      newPassword: "New Password (leave empty to keep current)",
      saveChanges: "Save Changes",
      saving: "Saving...",
      profileUpdatedSuccess: "Profile updated successfully",
      unableToUpdateProfile: "Unable to update profile",
      avatarInitials: "Avatar Initials",
      maxTwoCharacters: "Maximum 2 characters"
    },
    notificationsPage: {
      title: "Notification Center",
      all: "All",
      unread: "Unread",
      allTypes: "All types",
      type: "Type:",
      markAllAsRead: "Mark all as read",
      information: "Information",
      success: "Success",
      warnings: "Warnings",
      errors: "Errors",
      loadingNotifications: "Loading notifications...",
      noNotificationsToDisplay: "No notifications to display",
      errorLoadingNotifications: "Error loading notifications:",
      tryAgain: "Try again",
      unknownDate: "Unknown date",
      invalidDate: "Invalid date",
      noNotifications: "No notifications",
      markAsRead: "Mark as read",
      viewAllNotifications: "View all notifications"
    },
    notificationMenu: {
      notifications: "Notifications",
      markAllAsRead: "Mark all as read",
      loadingNotifications: "Loading notifications...",
      errorLoadingNotifications: "Error loading notifications",
      tryAgain: "Try again",
      noNotifications: "No notifications",
      viewAllNotifications: "View all notifications",
      dayAgo: "day ago",
      daysAgo: "days ago",
      hourAgo: "hour ago",
      hoursAgo: "hours ago",
      minuteAgo: "minute ago",
      minutesAgo: "minutes ago",
      justNow: "just now",
      unknownDate: "Unknown date",
      invalidDate: "Invalid date"
    },
    errors: {
      errorOccurred: "An error has occurred",
      operationError: "An error occurred during the operation",
      serverCommunicationError: "Error communicating with the server",
      sessionExpired: "Session expired, please log in again",
      unableToLoadCalendarData: "Unable to load calendar data",
      unableToLoadUserList: "Unable to load user list",
      unableToLoadResources: "Unable to load resources",
      unableToLoadResourceTypes: "Unable to load resource types",
      unableToLoadYourBookings: "Unable to load your bookings",
      unableToLoadBookingData: "Unable to load booking data",
      unableToLoadResourceData: "Unable to load resource data",
      unableToLoadNotifications: "Unable to load notifications",
      unableToSendNotification: "Unable to send notification",
      unableToMarkNotificationAsRead: "Unable to mark notification as read",
      unableToMarkAllNotificationsAsRead: "Unable to mark all notifications as read",
      unableToDeleteNotification: "Unable to delete notification",
      moreErrorsNotDisplayed: "There are {{count}} more errors not displayed"
    },
    common: {
      unableToCompleteOperation: "Unable to complete the operation",
      operationCompletedSuccessfully: "Operation completed successfully",
      loading: "Loading...",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      noDataAvailable: "No data available",
      yes: "Yes",
      no: "No",
      error: "Error",
      success: "Success",
      warning: "Warning",
      information: "Information",
      tryAgain: "Try again",
      more: "More..",
      update: "Update",
      isRequired: "is required"
    },
    languageSelector: {
      language: "Language",
      english: "English",
      italian: "Italian"
    }
  };
  
  export default en;