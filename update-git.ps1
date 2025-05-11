<#
.SYNOPSIS
  Met à jour automatiquement le dépôt Git local en faisant git pull origin main, add, commit et push.

.PARAMETER Message
  Message de commit. Si non fourni, un message par défaut avec la date/heure sera utilisé.
#>

param(
    [string]$Message = ""
)

function Write-Log {
    param($Text, [string]$Level = "INFO")
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$time] [$Level] $Text"
}

if (-not (Test-Path ".git")) {
    Write-Error "Ce dossier n'est pas un dépôt Git (pas de dossier .git)."
    exit 1
}

# 1) Pull explicite sur origin/main
Write-Log "Récupération des derniers commits (git pull origin main)..."
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de git pull origin main."
    exit 1
}

# 2) Add
Write-Log "Ajout des fichiers modifiés (git add .)..."
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de git add."
    exit 1
}

# 3) Commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "chore:update $(Get-Date -Format 'yyyy-MM-dd_HH:mm:ss')"
}
Write-Log "Commit avec le message : $Message"
git commit -m "$Message" --allow-empty
if ($LASTEXITCODE -ne 0) {
    Write-Log "Rien à commit, on passe." "WARN"
}

# 4) Push
Write-Log "Push vers origin main (git push origin main)..."
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de git push."
    exit 1
}

Write-Log "Mise à jour Git terminée." "SUCCESS"
