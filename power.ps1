<#
.SYNOPSIS
  Réécrit automatiquement les chemins d'import dans vos fichiers .ts/.tsx
  pour utiliser les alias définis en tsconfig.json.

.DESCRIPTION
  Parcourt récursivement tous les fichiers .ts et .tsx sous src/,
  applique un jeu de règles regex pour remplacer les imports relatifs
  par les imports aliasés `@features/...` ou `@shared/...`.

.EXAMPLE
  # Depuis la racine du projet :
  .\update-imports.ps1
#>

# 1) Définir les mappings Find→Replace
$rules = @(
  @{ # pages → @features
    Find    = "(from\s+['""])(\.\.\/)+pages\/([^'"";]+)(['""])"
    Replace = '${1}@features/$3$4'
  },
  @{ # components → @shared/components
    Find    = "(from\s+['""])(\.\.\/)+components\/([^'"";]+)(['""])"
    Replace = '${1}@shared/components/$3$4'
  },
  @{ # hooks → @shared/hooks
    Find    = "(from\s+['""])(\.\.\/)+hooks\/([^'"";]+)(['""])"
    Replace = '${1}@shared/hooks/$3$4'
  },
  @{ # contexts → @shared/contexts
    Find    = "(from\s+['""])(\.\.\/)+contexts\/([^'"";]+)(['""])"
    Replace = '${1}@shared/contexts/$3$4'
  },
  @{ # utils → @shared/utils
    Find    = "(from\s+['""])(\.\.\/)+utils\/([^'"";]+)(['""])"
    Replace = '${1}@shared/utils/$3$4'
  },
  @{ # types → @shared/types
    Find    = "(from\s+['""])(\.\.\/)+types\/([^'"";]+)(['""])"
    Replace = '${1}@shared/types/$3$4'
  },
  @{ # services → @shared/config
    Find    = "(from\s+['""])(\.\.\/)+services\/([^'"";]+)(['""])"
    Replace = '${1}@shared/config/$3$4'
  },
  @{ # config → @shared/config
    Find    = "(from\s+['""])(\.\.\/)+config\/([^'"";]+)(['""])"
    Replace = '${1}@shared/config/$3$4'
  },
  @{ # data mocks → @shared/data
    Find    = "(from\s+['""])(\.\.\/)+(mockClients|mockUsers)\.ts(['""])"
    Replace = '${1}@shared/data/$2.ts$3'
  }
)

# 2) Collecter tous les fichiers .ts, .tsx sous src/
$files = Get-ChildItem -Path .\src -Include *.ts,*.tsx -Recurse

foreach ($file in $files) {
  $text = Get-Content $file.FullName -Raw

  $modified = $false
  foreach ($rule in $rules) {
    $newText = [regex]::Replace($text, $rule.Find, $rule.Replace)
    if ($newText -ne $text) {
      $text = $newText
      $modified = $true
    }
  }

  if ($modified) {
    # Sauvegarde du fichier modifié
    Set-Content -Path $file.FullName -Value $text
    Write-Host "Updated imports in: $($file.FullName)" -ForegroundColor Green
  }
}

Write-Host "`n🎉 Tous les imports ont été mis à jour !" -ForegroundColor Cyan
