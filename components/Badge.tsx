// components/Badge.tsx

export type BadgeVariant =
  | 'Abandon'
  | 'Déclaration de soupçon'
  | 'Blocage'
  | 'En cours d\'analyse'
  | 'default';

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant: BadgeVariant
}) {
  let bgClass: string;
  switch (variant) {
    case 'Abandon':
      bgClass = 'bg-green-600';
      break;
    case 'Déclaration de soupçon':
      bgClass = 'bg-orange-600';
      break;
    case 'Blocage':
      bgClass = 'bg-red-600';
      break;
    case "En cours d'analyse":
      bgClass = 'bg-yellow-700'; // ou la couleur de votre choix
      break;
    default:
      bgClass = 'bg-zinc-800';
  }
  return (
    <span className={`${bgClass} text-white px-3 py-1 rounded text-xs font-semibold`}>
      {children}
    </span>
  )
}
