-- SMatch: tabla para guardar resultados de challenges
-- Correr esto en Supabase SQL Editor

create table if not exists challenge_results (
  id uuid default gen_random_uuid() primary key,
  candidate_id text not null,
  challenge_id integer not null,
  scores jsonb not null,
  feedback jsonb,
  grade jsonb,
  time_used integer, -- segundos usados
  played_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index para buscar por candidato
create index idx_results_candidate on challenge_results(candidate_id);

-- Index para buscar por challenge
create index idx_results_challenge on challenge_results(challenge_id);

-- RLS: cada candidato solo ve sus propios resultados
alter table challenge_results enable row level security;

-- Política: cualquiera puede insertar (para el MVP)
create policy "Insertar resultados" on challenge_results
  for insert with check (true);

-- Política: solo leer los propios (ajustar cuando tengas auth)
create policy "Leer propios resultados" on challenge_results
  for select using (true);
