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
      { label: 'VPN / Proxy',             value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Device incohérent',       value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'IBAN douteux',            value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Pays à risque',           value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Lien avec joueur risqué', value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Justif incohérent',       value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Retraits suspects',       value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Tracfin passé',           value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Réputation',              value: faker.number.int({ min: 0, max: 20 }) },
    ]
    const riskScore = Math.max(
      0,
      Math.min(100, scoringDetails.reduce((sum, c) => sum + c.value, 0))
    )

    // — Indicateurs comportementaux (Operational) —
    const behavioralDetails: BehaviorDetail[] = [
      { label: 'Multiples CB sur compte joueur',            value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Cumul de versements CB',                    value: faker.number.int({ min: 0, max: 20000 }) },
      { label: 'Dépôts CB hors pays à risque modéré',        value: faker.number.int({ min: 0, max: 5000 }) },
      { label: 'Dépôts CB pays à risque élevé',             value: faker.number.int({ min: 0, max: 3000 }) },
      { label: 'Carte CB utilisée sur multi-comptes',       value: faker.number.int({ min: 0, max: 3 }) },
      { label: 'IBAN multi-comptes',                        value: faker.number.int({ min: 0, max: 3 }) },
      { label: 'Transactions IBAN vers pays modérés',        value: faker.number.int({ min: 0, max: 10 }) },
      { label: 'Transactions IBAN vers pays élevés (GAFI)',  value: faker.number.int({ min: 0, max: 10 }) },
      { label: 'IBAN sur types de banques non-autorisées',   value: faker.number.int({ min: 0, max: 3 }) },
      { label: 'Nombre de comptes PayPal',                  value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Volume PayPal sur 6 mois glissants',        value: faker.number.int({ min: 0, max: 20000 }) },
      { label: 'Multi-titulaire ou multi-comptes PayPal',   value: faker.number.int({ min: 0, max: 3 }) },
      { label: 'Cumul montant Paysafecard sur 6 mois',      value: faker.number.int({ min: 0, max: 2000 }) },
      { label: 'Nombre de comptes Paysafecard',             value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Dépôts sur solde positif',                  value: faker.number.int({ min: 0, max: 1000 }) },
      { label: 'Cumul des versements rejetés',              value: faker.number.int({ min: 0, max: 10000 }) },
      { label: 'Nombre de demandes de retrait',             value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Retraits avec clôture de compte',           value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Demandes de retrait rejetées',              value: faker.number.int({ min: 0, max: 20 }) },
      { label: 'Retraits exceptionnels (>4/an)',           value: faker.number.int({ min: 0, max: 10 }) },
      { label: 'Montant du solde non-retirable',            value: faker.number.int({ min: 0, max: 1000 }) },
      { label: 'Cumul des répudiations',                    value: faker.number.int({ min: 0, max: 500 }) },
      { label: 'Nombre de répudiations',                    value: faker.number.int({ min: 0, max: 10 }) },
      { label: 'Dépassement seuil ODF (>=3/12 mois)',       value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Taux de réussite hasard (TRH)',             value: faker.number.int({ min: 0, max: 200 }) },
      { label: 'Taux de retour joueur hasard (TRJ)',        value: faker.number.int({ min: 0, max: 200 }) },
      { label: 'Changement coord. identitaires (>3 champs)',value: faker.number.int({ min: 0, max: 5 }) },
      { label: 'Connexions régulières depuis IP à l’étranger', value: faker.number.int({ min: 0, max: 10 }) },
    ]
    const rawBehav = behavioralDetails.reduce((sum, c) => sum + c.value, 0)
    const behavioralScore = Math.max(
      0,
      Math.min(100, Math.round(rawBehav / behavioralDetails.length))
    )

    // — Historique opérationnel —
    const scoreHistory: ScoreHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
      date : new Date(now.getTime() - i * 86400000)
               .toISOString()
               .slice(0, 10),
      score: faker.number.int({ min: 60, max: 100 })
    }))

    // — NOUVEAUX CHAMPS ATTENDUS PAR LA PAGE —
    const country = faker.location.country()
    const profession = faker.person.jobTitle()
    const sourceFonds = faker.helpers.arrayElement([
      'Salaire', 'Épargne', 'Héritage', 'Vente bien'
    ])
    const moyenPaiement = faker.helpers.arrayElement([
      'Carte bancaire', 'Virement bancaire', 'PayPal', 'Paysafecard'
    ])
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
    const alerts: Alert[] = Array.from({
      length: faker.number.int({ min: 0, max: 3 })
    }, () => ({
      date: faker.date
              .recent({ days: 30 })
              .toISOString()
              .slice(0, 10),
      message: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(['open', 'closed']),
    }))

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
    }
  })
}