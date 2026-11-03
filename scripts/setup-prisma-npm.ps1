$ErrorActionPreference = "Stop"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

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

Write-Host "Passo 4: escolher como atualizar a base de dados local" -ForegroundColor Green
Write-Host "1. Aplicar migrações existentes (não cria uma migração nova)" -ForegroundColor White
Write-Host "2. Criar uma nova migração a partir das alterações do schema" -ForegroundColor White
Write-Host "3. Selecionar todas as migrações pendentes e aplicá-las" -ForegroundColor White
Write-Host "4. Apagar todos os dados e reaplicar todas as migrações" -ForegroundColor Red
Write-Host ""

$migrationOption = Read-Host "Escolha uma opção (1, 2, 3 ou 4)"

switch ($migrationOption) {
    "1" {
        Write-Host "`nAplicando apenas as migrações pendentes..." -ForegroundColor Green
        Write-Host "As migrações já aplicadas e os dados existentes serão preservados." -ForegroundColor Yellow
        Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "migrate", "deploy")
    }
    "2" {
        $migrationName = Read-Host "Introduza o nome da nova migração"

        if ([string]::IsNullOrWhiteSpace($migrationName)) {
            throw "O nome da migração não pode estar vazio."
        }

        Write-Host "`nCriando a nova migração '$migrationName'..." -ForegroundColor Green
        Invoke-ProjectCommand -FilePath "npx" -Arguments @(
            "prisma",
            "migrate",
            "dev",
            "--name",
            $migrationName
        )
    }
    "3" {
        Write-Host "`nSelecionando todas as migrações pendentes..." -ForegroundColor Green
        Write-Host "As migrações já aplicadas e os dados existentes serão preservados." -ForegroundColor Yellow
        Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "migrate", "deploy")
    }
    "4" {
        Write-Host "`nATENÇÃO: esta opção vai apagar todos os dados da base SQLite local." -ForegroundColor Red
        $resetConfirmation = Read-Host "Escreva RESET para confirmar"

        if ($resetConfirmation -cne "RESET") {
            throw "Reset cancelado. A confirmação introduzida não foi RESET."
        }

        Write-Host "`nA apagar os dados e a reaplicar todas as migrações..." -ForegroundColor Red
        Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "migrate", "reset", "--force")
    }
    default {
        throw "Opção inválida. Escolha 1, 2, 3 ou 4."
    }
}

Write-Host "`nGerando o Prisma Client..." -ForegroundColor Green
Invoke-ProjectCommand -FilePath "npx" -Arguments @("prisma", "generate")

Write-Host "`nExecutando o seed da base de dados..." -ForegroundColor Green
Invoke-ProjectCommand -FilePath "npm" -Arguments @("run", "seed")

Write-Host "`nPasso 5: iniciando o servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "Passo 6: acesse http://localhost:3000 no navegador." -ForegroundColor Yellow
Invoke-ProjectCommand -FilePath "npm" -Arguments @("run", "dev")
