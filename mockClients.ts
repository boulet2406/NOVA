import { faker } from '@faker-js/faker'

const now = new Date()

// Détail de scoring AML
export type ScoringDetail = { label: string; value: number }

// Détail comportemental opérationnel (liste générique)
export type BehaviorDetail = { label: string; value: number }

// Indicateurs comportementaux spécifiques pour l'affichage direct
export type BehaviorIndicators = {
  jeuxARisque: number
  vitesseJeu: number
  dernierChangementIP: number
  deviceInhabituel: number
  tiersPayant: number
}

// Entrée d'historique de score
export type ScoreHistoryEntry = { date: string; score: number }

// Alerte avec statut
export type Alert = { date: string; message: string; status: string }

// **Nouvel** type pour l'audit trail
export type AuditEntry = {
  date: string
  time: string
  user: string
  action: string
  details?: string  
}

export interface ClientMock {
  id: string
  firstName: string
  lastName: string
  birthDate: string

  // Scoring AML
  riskScore: number
  scoringDetails: ScoringDetail[]

  // Comportement opérationnel
  behavioralScore: number
  behavioralDetails: BehaviorDetail[]
  scoreHistory: ScoreHistoryEntry[]

  // Champs additionnels
  country: string
  profession: string
  sourceFonds: string
  moyenPaiement: string
  lastIP: string
  kycValidated: boolean
  pep: boolean
  indicateursComportementaux: BehaviorIndicators
  alerts: Alert[]

  // **Nouvel** audit trail
  auditTrail: AuditEntry[]
}

export function generateMockClients(count = 1500): ClientMock[] {
  return Array.from({ length: count }, () => {
    // — Identité & méta —
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const birthDate = faker.date
      .birthdate({ mode: 'age', min: 18, max: 90 })
      .toISOString()
      .slice(0, 10)
    const id = faker.string.alphanumeric({ length: 6, casing: 'upper' })

    // — Scoring client (AML) —
    const scoringDetails: ScoringDetail[] = [
      { label: 'Multi-comptes',           value: faker.number.int({ min: 0, max: 20 }) },
      /* … autres détails … */
      { label: 'Réputation',              value: faker.number.int({ min: 0, max: 20 }) },
    ]
    const riskScore = Math.max(
      0,
      Math.min(100, scoringDetails.reduce((sum, c) => sum + c.value, 0))
    )

    // — Indicateurs comportementaux (Operational) —
    const behavioralDetails: BehaviorDetail[] = [
      { label: 'Multiples CB sur compte joueur', value: faker.number.int({ min: 0, max: 5 }) },
      /* … autres détails … */
      { label: 'Connexions régulières depuis IP à l’étranger', value: faker.number.int({ min: 0, max: 10 }) },
    ]
    const rawBehav = behavioralDetails.reduce((sum, c) => sum + c.value, 0)
    const behavioralScore = Math.max(
      0,
      Math.min(100, Math.round(rawBehav / behavioralDetails.length))
    )

    // — Historique opérationnel —
    const scoreHistory: ScoreHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
      date : new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10),
      score: faker.number.int({ min: 60, max: 100 })
    }))

    // — Champs additionnels —
    const country = faker.location.country()
    const profession = faker.person.jobTitle()
    const sourceFonds = faker.helpers.arrayElement(['Salaire', 'Épargne', 'Héritage', 'Vente bien'])
    const moyenPaiement = faker.helpers.arrayElement(['Carte bancaire', 'Virement bancaire', 'PayPal', 'Paysafecard'])
    const lastIP = faker.internet.ip()
    const kycValidated = faker.datatype.boolean()
    const pep = faker.datatype.boolean()
    const indicateursComportementaux: BehaviorIndicators = {
      jeuxARisque: faker.number.int({ min: 0, max: 5 }),
      vitesseJeu: faker.number.int({ min: 0, max: 200 }),
      dernierChangementIP: faker.number.int({ min: 0, max: 30 }),
      deviceInhabituel: faker.number.int({ min: 0, max: 5 }),
      tiersPayant: faker.number.int({ min: 0, max: 3 }),
    }
    const alerts: Alert[] = Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      date: faker.date.recent({ days: 30 }).toISOString().slice(0, 10),
      message: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['open', 'closed']),
    }))

    // — **Audit trail** —
    const auditTrail: AuditEntry[] = Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => {
        const d = faker.date.recent({ days: 10 })
        return {
          date: d.toISOString().slice(0, 10),
          time: d.toTimeString().slice(0, 5),
          user: faker.string.alphanumeric({ length: 4, casing: 'upper' }),
          action: faker.helpers.arrayElement([
            'Création du dossier',
            'Validation KYC',
            'Changement de statut',
            'Ajout de commentaire',
            'Export PDF'
          ])
        }
      }
    )

    return {
      id,
      firstName,
      lastName,
      birthDate,
      riskScore,
      scoringDetails,
      behavioralScore,
      behavioralDetails,
      scoreHistory,
      country,
      profession,
      sourceFonds,
      moyenPaiement,
      lastIP,
      kycValidated,
      pep,
      indicateursComportementaux,
      alerts,
      auditTrail,  // <-- ajouté ici
    }
  })
}
