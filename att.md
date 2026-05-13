Essa estratégia de fatiar o problema e alimentar o GitHub Copilot em partes (o famoso "prompt chaining") é coisa de desenvolvedor sênior. O Copilot é brilhante, mas se você jogar o escopo inteiro nele, ele alucina e perde o contexto da arquitetura. Sendo um projeto de Engenharia de Software de primeiro semestre, manter esse nível de organização estrutural é o que vai garantir uma nota máxima e um portfólio impecável.  

Como seu "Tech Lead" virtual, dividi o desenvolvimento das telas de Admin/ONG em 6 Tarefas Isoladas. O segredo aqui é construir de trás para frente: primeiro o banco (Model), depois a ponte (API) e por último a pintura (Frontend).

Você pode copiar os blocos de "Prompt para o Copilot" e colar direto na sua IDE.
Tarefa 1: O Alicerce (Models do MongoDB)

Antes de qualquer tela funcionar, o banco de dados precisa saber o formato exato da informação.

Orientações: Garanta que a conexão com o MongoDB (lib/mongodb.ts) já esteja funcionando. Vamos criar o modelo de Eventos/Filmes com base na sua documentação.

    Prompt para o Copilot:
    "Atue como um especialista em Node.js e MongoDB. Crie o arquivo lib/models/Event.ts usando Mongoose. O schema deve representar um filme/sessão e conter: title (String, obrigatório, max 100), description (String, max 1000), date (Date), location (String), address (String), image (String para URL), category (Enum: 'cinema', 'oficinas', 'projetos'), createdBy (ObjectId referenciando o modelo User), approved (Boolean, default: false), featured (Boolean, default: false), e um objeto aninhado 'impact' contendo people, communities e sessions (todos Number com default 0). Inclua timestamps. Exporte o modelo garantindo que ele não seja sobrescrito se já existir em mongoose.models."

Tarefa 2: Rota de Métricas (Backend do Dashboard Principal)

Para tirar os números fakes do Painel de Controle (Pessoas Impactadas, Sessões), precisamos de uma rota que faça cálculos rápidos no banco sem travar a aplicação.

Orientações: Usaremos o MongoDB Aggregation Pipeline, que processa a matemática direto no banco de dados, sendo muito mais rápido do que puxar todos os dados e somar no JavaScript.

    Prompt para o Copilot:
    "Atue como um especialista em Next.js App Router (v14+). Crie uma rota API GET em app/api/metrics/route.ts. A rota deve conectar ao banco de dados e usar o MongoDB Aggregation Pipeline no modelo Event. Quero que você filtre apenas eventos aprovados (approved: true) e agrupe os dados para retornar a soma total de impact.people e o total de documentos (representando as sessões realizadas). Trate os erros com try/catch e retorne um NextResponse.json com os dados."

Tarefa 3: Conectando o Dashboard (Frontend)

Agora vamos dar vida àquela tela linda que você desenhou.

Orientações: Como o Next.js lida bem com Server Components, você pode fazer o fetch direto no componente do Dashboard sem precisar de useEffect, aproveitando a velocidade do servidor.

    Prompt para o Copilot:
    "Analise meu componente CinemaDashboard (ou a página principal do dashboard). Ele atualmente possui dados estáticos. Refatore este arquivo para ser um Server Component do Next.js (remova 'use client' se existir). Crie uma função assíncrona getMetrics() que faz um fetch na rota /api/metrics (garanta que tenha cache revalidation se necessário) e substitua os números estáticos dos cards 'Pessoas Impactadas' e 'Sessões Realizadas' pelos dados reais vindos da API. Adicione um fallback visual simples para caso a API falhe."

Tarefa 4: API CRUD do Acervo (O Core do Sistema)

Aqui entra a inteligência de permissões (Admin vs ONG). O backend não pode confiar no frontend; ele precisa checar quem está fazendo a requisição.

Orientações: A rota GET vai listar os filmes. Se for ONG, lista só os dela. Se for Admin, lista todos.

    Prompt para o Copilot:
    "Atue como especialista em segurança de APIs no Next.js. Crie o arquivo app/api/events/route.ts com os métodos GET e POST.

        No GET: Use o getServerSession do NextAuth. Se o session.user.role for 'NGO', busque no banco apenas os eventos onde createdBy é igual ao ID do usuário logado. Se for 'ADMIN', busque todos os eventos.

        No POST: Valide o payload da requisição. Injete o ID do usuário logado no campo createdBy. Se o usuário for 'ADMIN', defina approved: true automaticamente; se for 'NGO', defina approved: false. Retorne o evento criado."

Tarefa 5: Tela de Acervo de Filmes (Frontend)

Vamos usar as ferramentas de ponta que você escolheu: Radix UI para acessibilidade e react-hook-form + Zod para blindar o formulário.

Orientações: No início, não implemente funcionalidades administrativas complexas. Faça um cadastro simples em um modal.  

    Prompt para o Copilot:
    "Atue como um especialista em UI/UX e React. Vou criar a funcionalidade de 'Adicionar Filme' na tela de acervo. Crie um componente de formulário usando react-hook-form e zod para validação. O schema Zod deve validar: título (mínimo 3 caracteres), descrição, data (obrigatória) e URL da imagem. Coloque esse formulário dentro de um componente Dialog do Radix UI (ou shadcn/ui). Ao submeter, o formulário deve fazer um POST para /api/events, exibir uma notificação toast de sucesso (usando a biblioteca Sonner) e fechar o modal. Lide com o estado de 'loading' no botão de submit."

Tarefa 6: Tela de Mensagens (O Simples e Funcional)

Para não desviar do foco, o sistema de mensagens deve ser uma caixa de entrada simples (estilo ticket), lendo os contatos que o público enviar pela home.

Orientações: Precisamos de um novo Model para isso (Message.ts) com os campos: nome, email, assunto, corpo da mensagem e status (lida/não lida).

    Prompt para o Copilot:
    "Preciso criar uma tela de Caixa de Entrada para o Admin. Primeiro, crie rapidamente um modelo Mongoose chamado Message (name, email, subject, content, isRead default false). Depois, crie uma tabela frontend estilizada com Tailwind CSS que faça um GET em /api/messages e liste essas mensagens. A tabela deve ter uma coluna indicando o status (com uma Badge visual: Lida/Não lida) e um botão de ação para abrir a mensagem em um Sheet/Drawer do Radix UI para leitura completa."