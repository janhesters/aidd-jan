export default {
  layout: {
    backgroundPathsTitle: "Hintergrund-Dekoration",
    home: "Startseite",
    quote: "Der beste Weg, die Zukunft vorherzusagen, ist, sie zu gestalten.",
    quoteAuthor: "Peter Drucker",
  },
  login: {
    emailLabel: "E-Mail",
    emailPlaceholder: "name@beispiel.de",
    errors: { invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein" },
    googleButton: "Weiter mit Google",
    meta: { title: "Anmelden" },
    separator: "Oder",
    signupCta: "Noch kein Konto? <signup>Registrieren</signup>",
    submitButton: "Mit E-Mail anmelden",
    submitButtonSubmitting: "Anmeldung läuft...",
    subtitle: "Gib deine E-Mail-Adresse ein, um dich anzumelden",
    title: "Willkommen zurück",
  },
  register: {
    emailLabel: "E-Mail",
    emailPlaceholder: "name@beispiel.de",
    errors: { invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein" },
    googleButton: "Weiter mit Google",
    legal:
      "Mit der Fortsetzung stimmst du unseren <tos>Nutzungsbedingungen</tos> und der <pp>Datenschutzerklärung</pp> zu.",
    loginCta: "Bereits ein Konto? <login>Anmelden</login>",
    meta: { title: "Konto erstellen" },
    separator: "Oder",
    submitButton: "Konto erstellen",
    submitButtonSubmitting: "Konto wird erstellt...",
    subtitle: "Gib deine E-Mail-Adresse ein, um loszulegen",
    title: "Konto erstellen",
  },
  verify: {
    alertDescription:
      "Code nicht erhalten? Überprüfe deinen Spam-Ordner oder fordere einen neuen an.",
    countdownMessage:
      "Du kannst in <1>{{count}}</1> Sekunden einen neuen Code anfordern",
    countdownMessage_one:
      "Du kannst in <1>{{count}}</1> Sekunde einen neuen Code anfordern",
    description:
      "Gib den 6-stelligen Code ein, der an deine E-Mail gesendet wurde",
    errors: {
      invalid: "Ungültiger Bestätigungscode",
      tooManyAttempts: "Zu viele Versuche. Bitte fordere einen neuen Code an.",
      wrongLength: "Der Code muss 6 Ziffern lang sein",
    },
    fieldLabel: "Bestätigungscode",
    meta: { title: "E-Mail bestätigen" },
    newOtpSent: "Code gesendet",
    newOtpSentDescription:
      "Ein neuer Bestätigungscode wurde an deine E-Mail gesendet",
    otpExpired: "Code abgelaufen",
    otpExpiredDescription:
      "Dein Bestätigungscode ist abgelaufen. Bitte fordere einen neuen an.",
    resendButton: "Code erneut senden",
    resendButtonSubmitting: "Wird gesendet...",
    subtitle: "Wir haben dir einen Bestätigungscode gesendet",
    title: "E-Mail überprüfen",
    verifyButton: "Bestätigen",
  },
} satisfies typeof import("~/locales/en/auth").default;
