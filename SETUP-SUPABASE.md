# Supabase + correção por IA

O site funciona sem backend. O Supabase é opcional e ativa banco de perguntas, registro de tentativas e correção por IA nas respostas longas.

## 1. Criar o banco

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `supabase/schema.sql`.

## 2. Conectar o site

Abra `src/config.ts` e informe:

- `supabaseUrl`: URL pública do projeto.
- `supabasePublishableKey`: chave pública/publishable do projeto.

Depois rode `npm run build` e envie os arquivos atualizados ao GitHub.

> Não coloque `service_role`, secret key ou chave da OpenAI no site.

## 3. Publicar a função de IA

A função está em `supabase/functions/evaluate-answer/index.ts`.

No Supabase, crie/deploy a Edge Function `evaluate-answer` e configure os secrets:

- `OPENAI_API_KEY` — sua chave da API da OpenAI.
- `OPENAI_MODEL` — opcional. O arquivo usa `gpt-5.6-luna` como padrão.

A função chama a API no servidor, então a chave da OpenAI não fica exposta no GitHub Pages.

## 4. GitHub Pages

O front-end continua sendo totalmente estático. Publique a raiz do repositório no GitHub Pages. O `index.html` já referencia caminhos relativos.
