import { faker } from '@faker-js/faker'

const now = new Date()

// Détail de scoring AML
export type ScoringDetail = { label: string; value: number }

// Détail comportemental opérationnel (liste générique)
export type BehaviorDetail = { label: string; value: number }

// Indicateurs d'alerte pour AML/Fraud
export type AlertingIndicator = {
  axis: string
  criterion: string
  value: number
}

// Type pour une entrée d'audit (audit trail)
export type AuditEntry = {
  date: string      // horodatage ISO
  action: string    // description de l'action
}

// Enum des types de clients
export enum ClientType {
  Retail = 'Retail',
  Corporate = 'Corporate',
  VIP = 'VIP',
  Unknown = 'Unknown',
}

// Interface principale Client
export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  profession: string
  birthDate: Date
  registrationDate: Date
  lastLogin: Date
  sourceFonds: 'Salaire' | 'Vente' | 'Héritage' | 'Other'
  moyenPaiement: 'Carte' | 'Virement' | 'Cash' | 'Other'
  kycValidated: boolean
  pep: boolean
  alerts: string[]
  auditTrail: AuditEntry[]
  scoringAml: ScoringDetail[]
  scoringFraud: ScoringDetail[]
  scoringDetails: ScoringDetail[]      // ← unique et correctement typé
  scoringGlobal: number
  riskScore: number
  behavioralScore: number
  scoreHistory: { date: Date; score: number }[]
  indicateursComportementaux: {
    jeuxARisque: number
    vitesseJeu: number
    dernierChangementIP: number
    deviceInhabituel: number
    tiersPayant: number
  }
  alertingIndicators: AlertingIndicator[]
}

// Alias pour import éventuel de ClientMock
export type ClientMock = Client

// Critères d'alerting
const alertCriteria: { axis: string; criterion: string }[] = [
  { axis: 'CB', criterion: 'Multiples CB sur compte joueur' },
  /* … */
  { axis: 'Connexion', criterion: 'Connexion régulière depuis une IP étrangère' },
]

// Génération d’un faux client
export function generateMockClient(): Client {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const country = faker.location.country()
  const profession = faker.person.jobType()

  const maxBirth = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
  const minBirth = new Date(now.getFullYear() - 75, now.getMonth(), now.getDate())
  const birthDate = faker.date.between({ from: minBirth, to: maxBirth })

  const registrationDate = faker.date.past({ years: 5 })
  const lastLogin = faker.date.recent({ days: 30 })
  const kycValidated = faker.datatype.boolean()
  const pep = faker.datatype.boolean()
  const alerts = faker.helpers.arrayElements(
    ['HighRiskCountry', 'MultipleAccounts', 'LargeTransactions', 'SuspiciousLogin'],
    faker.number.int({ min: 0, max: 4 })
  )

  const auditTrail: AuditEntry[] = Array.from(
    { length: faker.number.int({ min: 1, max: 10 }) },
    () => ({
      date: faker.date.between({ from: registrationDate, to: now }).toISOString(),
      action: faker.hacker.phrase(),
    })
  )

  const scoringAml: ScoringDetail[] = ['Identité', 'Adresse', 'SourceFonds'].map(label => ({
    label,
    value: faker.number.int({ min: 0, max: 100 }),
  }))

  const scoringFraud: ScoringDetail[] = ['HistoriquePaiements', 'ComportementJeu'].map(label => ({
    label,
    value: faker.number.int({ min: 0, max: 100 }),
  }))

  // Fusion AML + Fraud
  const scoringDetails: ScoringDetail[] = [
    ...scoringAml,
    ...scoringFraud
  ]

  const scoringGlobal = faker.number.int({ min: 0, max: 100 })
  const riskScore = faker.number.int({ min: 0, max: 100 })
  const behavioralScore = faker.number.int({ min: 0, max: 100 })

  const scoreHistory = Array.from({ length: 10 }, (_, i) => ({
    date: new Date(now.getTime() - i * 86400000),
    score: faker.number.int({ min: 0, max: 100 }),
  }))

  const indicateursComportementaux = {
    jeuxARisque: faker.number.int({ min: 0, max: 100 }),
    vitesseJeu: faker.number.int({ min: 0, max: 100 }),
    dernierChangementIP: faker.number.int({ min: 0, max: 100 }),
    deviceInhabituel: faker.number.int({ min: 0, max: 100 }),
    tiersPayant: faker.number.int({ min: 0, max: 100 }),
  }

  const alertingIndicators: AlertingIndicator[] = alertCriteria.map(({ axis, criterion }) => ({
    axis,
    criterion,
    value: faker.number.int({ min: 0, max: 100 }),
  }))

  return {
    id: faker.string.numeric(6),
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    country,
    profession,
    birthDate,
    registrationDate,
    lastLogin,
    sourceFonds: faker.helpers.arrayElement(['Salaire', 'Vente', 'Héritage', 'Other']),
    moyenPaiement: faker.helpers.arrayElement(['Carte', 'Virement', 'Cash', 'Other']),
    kycValidated,
    pep,
    alerts,
    auditTrail,
    scoringAml,
    scoringFraud,
    scoringDetails,            // ← présent ici
    scoringGlobal,
    riskScore,
    behavioralScore,
    scoreHistory,
    indicateursComportementaux,
    alertingIndicators,
  }
}

// Génération d’une liste de clients
export function generateMockClients(count = 10000): Client[] {
  return Array.from({ length: count }, () => generateMockClient())
}
