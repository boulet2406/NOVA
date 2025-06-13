import { generateMockClients } from "../lib/mockClients";

interface ClientPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  riskScore: number;
  behavioralScore: number;
  country?: string;
  profession?: string;
  fundsSource?: string;
  paymentMethod?: string;
  lastIP?: string;
  kycValidated?: boolean;
  pep?: boolean;
  scoringDetails?: { label: string; value: number }[];
  behavioralDetails?: { label: string; value: number }[];
  scoreHistory?: { scoreDate: string; score: number }[];
  behaviorIndicators?: {
    riskyGames?: number;
    gameSpeed?: number;
    lastIPChange?: number;
    unusualDevice?: number;
    thirdPartyPayer?: number;
  };
  alerts?: { alertDate: string; message: string; status: "open" | "closed" }[];
}

async function createClient(client: ClientPayload) {
  const response = await fetch("http://localhost:3000/api/client", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log(`Client créé : ${client.firstName} ${client.lastName}`);
}

const BATCH_SIZE = 50;

async function main() {
  const allClients = generateMockClients(2967);

  for (let i = 0; i < allClients.length; i += BATCH_SIZE) {
    const batch = allClients.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (client) => {
        const clientPayload: ClientPayload = {
          firstName: client.firstName,
          lastName: client.lastName,
          birthDate: client.birthDate,
          riskScore: client.riskScore,
          behavioralScore: client.behavioralScore,
          country: client.country,
          profession: client.profession,
          fundsSource: client.sourceFonds,
          paymentMethod: client.moyenPaiement,
          lastIP: client.lastIP,
          kycValidated: client.kycValidated,
          pep: client.pep,
          scoringDetails: client.scoringDetails,
          behavioralDetails: client.behavioralDetails,
          scoreHistory: client.scoreHistory,
          behaviorIndicators: {
            riskyGames: client.indicateursComportementaux.jeuxARisque,
            gameSpeed: client.indicateursComportementaux.vitesseJeu,
            lastIPChange: client.indicateursComportementaux.dernierChangementIP,
            unusualDevice: client.indicateursComportementaux.deviceInhabituel,
            thirdPartyPayer: client.indicateursComportementaux.tiersPayant,
          },
          alerts: client.alerts,
        };

        try {
          await createClient(clientPayload);
        } catch (error) {
          console.error(
            `Erreur pour ${client.firstName} ${client.lastName} :`,
            error
          );
        }
      })
    );

    console.log(`✅ Batch ${i / BATCH_SIZE + 1} terminé`);
  }

  console.log("🎉 Import terminé !");
}

main();
