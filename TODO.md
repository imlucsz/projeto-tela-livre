# TODO - Ajustes de Dashboard e Rotas

## Entregue
- [x] Remover “Acervo de Filmes/filmes” do `/dashboard`.
- [x] Criar rota `app/api/events/this-month/route.ts` (contagem real do mês).
- [x] Remover block do `middleware.ts` que podia afetar `/dashboard`.
- [x] Ajustar `app/api/impact-goals/next-session/route.ts` para não retornar 401 quando sessão não vier no Edge.
- [x] Blindar fetches no `components/dashboard/cinema-dashboard.tsx` para não quebrar payload se APIs falharem no deploy.

## Falta (agora)
- [x] Atualizar `components/dashboard/cinema-dashboard.tsx` para que “Próximos Eventos” use **somente** eventos do **mês atual**, respeitando a mesma regra de role do `/api/events?approved=true`.
  - [x] Buscar via `/api/events/this-month` usando `approved: true` e regra de role (ADMIN/NGO).
  - [ ] Renderizar lista e contagem coerentes.

- [ ] Garantir que a página renderize sem misturar fallback (`defaultSessions`) e sem depender de arrays hardcoded.
- [ ] Rodar `npm run build`/deploy


