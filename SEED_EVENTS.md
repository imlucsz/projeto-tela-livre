# 🎬 Script de Seed - Eventos do Carrossel

Este script popula automaticamente o banco de dados com os 10 filmes que estavam originalmente no carrossel da home page.

## 📋 Eventos que Serão Cadastrados

1. **Ainda Estou Aqui** - Drama brasileiro premiado
2. **Alice no País das Maravilhas** - Clássico infantil
3. **Até o Último Homem** - Drama de guerra
4. **Bagagem de Risco** - Thriller emocional
5. **Formula 1** - Documentário
6. **Interestelar** - Ficção científica épica
7. **Marty Supreme** - Drama sobre tênis
8. **Os Pecadores** - Drama religioso
9. **Tropa de Elite** - Thriller policial
10. **Velozes e Furiosos 6** - Ação

## 🚀 Como Usar

### Opção 1: Script JavaScript (Recomendado - Mais Rápido)

```bash
# Executar uma única vez
node scripts/seed-carousel-events.js

# Ou usando npm
npm run seed
```

### Opção 2: Script TypeScript

```bash
# Requireda instalação de ts-node
npm run seed:ts
```

## ✅ O que Faz o Script

- ✅ Conecta ao MongoDB usando `MONGODB_URI` do `.env.local`
- ✅ Insere os 10 filmes do carrossel
- ✅ Define todos como **aprovados** (`approved: true`)
- ✅ Todos aparecerão imediatamente no carrossel da home
- ✅ Ignora erros de duplicação (se rodar várias vezes, não duplica)
- ✅ Lista todos os eventos cadastrados ao final

## 📊 Saída Esperada

```
🌱 Iniciando seed de eventos do carrossel...
✅ Conectado ao MongoDB
📊 Eventos existentes: 0
✨ 10 eventos foram criados com sucesso!
📍 Todos os eventos estão com approved=true e aparecerão no carrossel

📽️  Eventos no banco de dados:
  • Ainda Estou Aqui (28/06/2026) - ✅ Aprovado
  • Alice no País das Maravilhas (05/07/2026) - ✅ Aprovado
  • ... (restante dos eventos)

🎬 Seed completado com sucesso!
```

## 🔍 Verificar Eventos Cadastrados

Depois de rodar o script, você pode:

1. **Na Home Page**: Os eventos aparecerão no carrossel
2. **No Dashboard**: Vá em `/dashboard/events` (como Admin) para gerenciar
3. **No Terminal**: Execute o script novamente para listar todos os eventos

## 🛠️ Troubleshooting

### Erro: "MONGODB_URI não está definido"
Certifique-se de que você tem um arquivo `.env.local` com:
```
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@seu-cluster.mongodb.net/sua-database
```

### Erro: "conexão recusada"
Verifique se o MongoDB está rodando e acessível com as credenciais do `.env.local`

### Quer limpar todos os eventos?
Descomente esta linha no script antes de rodar:
```javascript
// await Event.deleteMany({});
```

## 📝 Editar Eventos

Se quiser adicionar ou modificar os eventos depois:

1. Vá em **Dashboard > Eventos** (como Admin ou ONG)
2. Clique em **Novo Evento** ou edite um existente
3. As mudanças aparecem no carrossel automaticamente (para admins é imediato)

## 🔄 Sincronização com Carrossel

O carrossel sincroniza a cada **30 segundos**, então:
- ✅ Executou o seed → Espere 30s → Filmes aparecem no carrossel
- ✅ Criou novo evento no dashboard → Espere 30s → Aparece no carrossel
- ✅ Deletou um evento → Espere 30s → Desaparece do carrossel
