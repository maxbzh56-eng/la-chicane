alter table leagues enable row level security;
alter table league_members enable row level security;
alter table races enable row level security;
alter table predictions enable row level security;

create or replace function is_member(lid uuid) returns boolean language sql stable as $$
  select exists(select 1 from league_members lm where lm.league_id = lid and lm.user_id = auth.uid());
$$;

create policy leagues_select on leagues
for select using (exists(select 1 from league_members lm where lm.league_id = id and lm.user_id = auth.uid()));
create policy leagues_insert on leagues
for insert with check (owner_id = auth.uid());

create policy lm_select on league_members for select using (user_id = auth.uid() or exists(select 1 from leagues l where l.id = league_id and l.owner_id = auth.uid()));
create policy lm_insert on league_members for insert with check (auth.uid() = user_id);

create policy races_select on races for select using (is_member(league_id));
create policy races_insert on races for insert with check (exists(select 1 from leagues l where l.id = league_id and l.owner_id = auth.uid()));

create policy pred_select on predictions for select using (is_member((select league_id from races r where r.id = race_id)));
create policy pred_upsert on predictions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
