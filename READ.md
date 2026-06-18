# 🚀 ENEM Adaptive Learning Platform - Monorepo

Este repositório contém a solução completa para a Plataforma de Aprendizagem Adaptativa focada no ENEM, desenvolvida como projeto de TCC e aplicação real. O projeto utiliza uma arquitetura de Monorepo para gerenciar de forma eficiente o ecossistema de Frontend e Backend.

## 🏗️ Estrutura do Projeto

O monorepo é dividido utilizando NPM Workspaces dentro da pasta `apps/`:

- **`apps/web`**: Frontend desenvolvido em **Next.js (App Router)** com Tailwind CSS e Shadcn UI.
- **`apps/api`**: Backend desenvolvido em **NestJS** seguindo os princípios de **Arquitetura Hexagonal**.

## 🛠️ Stack Tecnológica Global

- **Linguagem Principal:** TypeScript (compartilhado entre os ambientes)
- **Banco de Dados:** PostgreSQL (via Supabase)
- **Engine de IA:** Gemini 1.5 Flash API
- **Cache/Mensageria:** Redis (Upstash)
- **Hospedagem:** Vercel

## ⚙️ Como Executar o Projeto Localmente

1. Na raiz do projeto, instale todas as dependências de uma vez:
   ```bash
   npm install