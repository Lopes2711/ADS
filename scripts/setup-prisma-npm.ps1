$ErrorActionPreference = "Stop"

Set-Location -Path (Join-Path $PSScriptRoot "..")

function Invoke-ProjectCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host "`n> $FilePath $($Arguments -join ' ')" -ForegroundColor Cyan
    & $FilePath @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "O comando '$FilePath $($Arguments -join ' ')' falhou com o código $LASTEXITCODE."
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js não foi encontrado no PATH. Instale o Node.js 20 ou superior."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm não foi encontrado no PATH. Instale o npm ou o Node.js com npm."
}

Write-Host "Passo 4: inicializando o banco de dados e aplicando as migrações..." -ForegroundColor Green
Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "migrate", "dev")

Write-Host "`nGerando o Prisma Client..." -ForegroundColor Green
Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "generate")

Write-Host "`nExecutando o seed da base de dados..." -ForegroundColor Green
Invoke-ProjectCommand -FilePath "npm" -Arguments @("run", "seed")

Write-Host "`nPasso 5: iniciando o servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "Passo 6: acesse http://localhost:3000 no navegador." -ForegroundColor Yellow
Invoke-ProjectCommand -FilePath "npm" -Arguments @("run", "dev")
