-- Textos gerais do site
INSERT INTO public.site_settings (key, value) VALUES ('geral', jsonb_build_object(
  'siteName','THUG LIFE RJ',
  'discordUrl','https://discord.gg/thugliferj',
  'connectUrl','fivem://connect/fivem.equipetl.com',
  'heroBadge','Mais de 10 anos no Ar · TL Reina',
  'heroKicker','A cidade que não dorme',
  'heroTitle','A Thug Life RJ',
  'heroSubtitle','',
  'heroDescription','Uma cidade viva do morro à orla: facções, corporações, negócios legais e ilegais, e uma comunidade que não para de crescer.',
  'newsTitle','Notícias da cidade',
  'newsSubtitle','Atualizações, eventos e bastidores do maior servidor com temática do Rio de Janeiro.',
  'playTitle','Jogue com a gente',
  'playSubtitle','Requisitos para liberar seu personagem e entrar na cidade.',
  'faqTitle','Dúvidas frequentes',
  'rulesTitle','Regras e Termos',
  'rulesIntro','Documento oficial da Thug Life RJ. Leia com atenção antes de conectar na cidade.',
  'rulesImportant','Ao entrar na Thug Life RJ você declara estar de acordo com os termos deste documento. O acesso ao servidor implica aceitação automática das normas descritas aqui, criadas para garantir uma convivência justa, segura e coerente com a proposta de roleplay.'
)) ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_stats (value, label, sub, sort_order) VALUES
  ('10+','Anos','no ar',1),
  ('+100K','Jogadores','registrados',2),
  ('+60K','Membros','no Discord',3),
  ('+500','Players','simultâneos',4);

INSERT INTO public.requirements (num, title, description, sort_order) VALUES
  ('01','Ter 16 anos ou mais','Contas verificadas no Discord com idade mínima declarada.',1),
  ('02','GTA V Original + FiveM','Cópia legítima na Steam, Epic ou Rockstar Launcher + FiveM instalado.',2),
  ('03','Microfone funcionando','Todo o roleplay acontece por voz. Áudio limpo é obrigatório.',3),
  ('04','Ler as regras','Whitelist só é liberada após a prova de regras dentro do Discord.',4);

INSERT INTO public.news (tag, title, body, published, sort_order) VALUES
  ('Servidor','Novo sistema de rachas noturnos na Zona Sul','Circuitos fechados, apostas entre crews e recompensa por reputação. As pistas abrem toda sexta, 22h, com fiscalização policial dinâmica.',true,1),
  ('Atualização','Aeromóvel policial e novo protocolo de operações','As forças de segurança ganharam suporte aéreo, perseguição por rota e comunicação integrada entre batalhões dentro da cidade.',true,2),
  ('Evento','Verão TLRJ: temporada de eventos na orla','Quiosques jogáveis, campeonatos de futevôlei, shows ao vivo e empregos temporários exclusivos durante toda a temporada.',true,3);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Como entro no servidor?','Entre no nosso Discord, abra o canal de whitelist, faça a prova de regras e aguarde a liberação do personagem. O processo costuma levar poucas horas.',1),
  ('O servidor é pago?','Não. O acesso é gratuito. A loja existe apenas para itens cosméticos e apoio ao servidor, sem vantagens que quebrem o roleplay.',2),
  ('Preciso de um PC forte?','Se o seu PC roda GTA V, ele roda o Thug Life RJ. Recomendamos 16GB de RAM e SSD para carregamento mais rápido dos mapas customizados.',3),
  ('Posso jogar como policial ou médico?','Sim. As corporações abrem vagas periodicamente e o recrutamento é anunciado no Discord, com treinamento interno dentro da cidade.',4);

INSERT INTO public.rule_categories (name, slug, icon, subtitle, description, content_html, published, sort_order) VALUES
  ('Termos de Compras','termos-de-compras','🛒','Regras da loja e reembolsos','Condições para compras de itens cosméticos e apoio ao servidor.','',true,1),
  ('Regras Gerais','regras-gerais','📜','Conduta e roleplay','Normas gerais válidas para todos os jogadores da cidade.','',true,2),
  ('Código Penal','codigo-penal','⚖️','Crimes e penas','Tabela de crimes, multas e tempo de prisão.','',true,3),
  ('Áreas Safes','areas-safes','🛡️','Locais protegidos','Onde nenhuma ação hostil é permitida.','',true,4),
  ('Regras Policiais','regras-policiais','👮','Protocolos das forças de segurança','Abordagem, negociação e uso de armamento.','',true,5),
  ('Regras do Ilegal','regras-do-ilegal','💀','Facções e organizações','Ações ilegais, reféns e limites por ação.','',true,6),
  ('Regras do Hospital','regras-do-hospital','🏥','Atendimento médico e morte','Como funciona o resgate e a perda de memória.','',true,7),
  ('Regras de Denúncias','regras-de-denuncias','📢','Como abrir uma denúncia','Provas necessárias e prazos de análise.','',true,8),
  ('Regras de Telagem','regras-de-telagem','🖥️','Verificação de segurança','Como se preparar para uma telagem.','',true,9),
  ('Regras de Ações','regras-de-acoes','🎯','Portes e limites','Quantidade de integrantes e armamento por ação.','',true,10);

-- Seções e itens: Termos e Condições de Uso
WITH s AS (
  INSERT INTO public.rule_sections (block, title, icon, sort_order) VALUES
    ('termos','1. Acesso à Cidade','🏙️',1),
    ('termos','2. Regras de Participação','🤝',2),
    ('termos','3. Discord Oficial','💬',3),
    ('termos','4. Itens e Economia','💰',4),
    ('termos','5. Wipe e Temporadas','♻️',5),
    ('termos','6. Atualizações e Revisões','📝',6)
  RETURNING id, title
)
INSERT INTO public.rules (section_id, code, text, sort_order)
SELECT s.id, v.code, v.text, v.ord FROM s JOIN (VALUES
  ('1. Acesso à Cidade','1.1','A Thug Life RJ é um projeto de entretenimento virtual hospedado em servidores contratados pela administração.',1),
  ('1. Acesso à Cidade','1.2','O acesso acontece exclusivamente pela plataforma FiveM. Ao conectar, o jogador também aceita os termos da Cfx.re; instabilidades da plataforma fogem ao nosso controle.',2),
  ('1. Acesso à Cidade','1.3','Seguimos a classificação indicativa do GTA V (18 anos). Se um menor conectar na cidade, a supervisão é responsabilidade integral dos pais ou responsáveis legais.',3),
  ('1. Acesso à Cidade','1.4','A liberação do personagem depende da whitelist concluída no Discord oficial.',4),
  ('2. Regras de Participação','2.1','O jogador se compromete a respeitar as regras gerais e específicas de roleplay do servidor.',1),
  ('2. Regras de Participação','2.2','Conhecer as regras não substitui bom senso e postura respeitosa com os demais jogadores e com a equipe.',2),
  ('2. Regras de Participação','2.3','As regras são atualizadas periodicamente. O desconhecimento não é aceito como justificativa.',3),
  ('2. Regras de Participação','2.4','Ao conectar, o jogador aceita os sistemas de monitoramento, gravação e análise usados na segurança da cidade.',4),
  ('2. Regras de Participação','2.5','Em caso de dúvida, procure a equipe antes de tomar qualquer atitude que possa quebrar uma norma.',5),
  ('2. Regras de Participação','2.6','Ocorrências graves ou durante eventos oficiais são avaliadas com critério redobrado.',6),
  ('3. Discord Oficial','3.1','A permanência na cidade está vinculada à presença no Discord oficial da Thug Life RJ. Sair ou ser removido do Discord pode implicar perda de acesso e novo processo de entrada.',1),
  ('3. Discord Oficial','3.2','Nome no Discord e nome do personagem devem permitir a identificação do jogador pela equipe.',2),
  ('4. Itens e Economia','4.1','Todos os itens e recursos existem apenas dentro da cidade e pertencem à estrutura virtual do projeto.',1),
  ('4. Itens e Economia','4.2','É proibido vender, comprar ou trocar itens do jogo por dinheiro real ou em plataformas externas. Penalidade: banimento permanente.',2),
  ('4. Itens e Economia','4.3','Negociações entre jogadores devem respeitar o contexto de roleplay; a equipe pode intervir em casos de favorecimento ou abuso.',3),
  ('4. Itens e Economia','4.4','Duplicação, alteração ou manipulação ilícita de itens é infração grave com punição imediata.',4),
  ('4. Itens e Economia','4.5','A administração pode inspecionar inventários, logs e transações a qualquer momento.',5),
  ('4. Itens e Economia','4.6','É proibido usar bots, macros, scripts ou qualquer automação para obter vantagem.',6),
  ('5. Wipe e Temporadas','5.1','O servidor opera em temporadas. A cada nova season pode haver wipe, com redefinição de bens e recursos para equilibrar a economia.',1),
  ('5. Wipe e Temporadas','5.2','O wipe não apaga histórico de comportamento nem anula punições anteriores.',2),
  ('6. Atualizações e Revisões','6.1','Este documento pode ser atualizado a qualquer momento, com ou sem aviso prévio. Confira antes de conectar.',1)
) AS v(sec, code, text, ord) ON v.sec = s.title;

-- Seções e itens: Regras Gerais do Roleplay
WITH s AS (
  INSERT INTO public.rule_sections (block, title, icon, sort_order) VALUES
    ('gerais','Conduta e Roleplay','🎭',1),
    ('gerais','Regras Policiais','👮',2),
    ('gerais','Regras do Ilegal','💀',3),
    ('gerais','Hospital e Áreas Safe','🏥',4)
  RETURNING id, title
)
INSERT INTO public.rules (section_id, code, text, sort_order)
SELECT s.id, v.code, v.text, v.ord FROM s JOIN (VALUES
  ('Conduta e Roleplay','G1','Powergaming: forçar situações irreais ou impor ações ao personagem alheio é proibido.',1),
  ('Conduta e Roleplay','G2','Metagaming: usar informação de fora do jogo (Discord, live, chamada) dentro do RP é proibido.',2),
  ('Conduta e Roleplay','G3','Vida Douta (VDM) e atropelamento sem contexto resultam em punição.',3),
  ('Conduta e Roleplay','G4','Combat Logging: deslogar durante uma ação, perseguição ou abordagem é infração grave.',4),
  ('Conduta e Roleplay','G5','Valorize a vida do seu personagem. Sob ameaça armada real, obedeça.',5),
  ('Conduta e Roleplay','G6','Revenge Kill: voltar ao local de uma ação para se vingar é proibido.',6),
  ('Conduta e Roleplay','G7','Ofensas reais, racismo, homofobia e qualquer tipo de discriminação levam a banimento permanente, dentro ou fora do RP.',7),
  ('Conduta e Roleplay','G8','Qualquer software externo, cheat, mod menu ou exploit resulta em banimento permanente do CFX.',8),
  ('Regras Policiais','P1','Policiais devem seguir o protocolo de abordagem e negociação, nunca chegando atirando sem contexto.',1),
  ('Regras Policiais','P2','Uso de armamento pesado só é liberado conforme o porte da ação em andamento.',2),
  ('Regras Policiais','P3','Corrupção policial só é permitida com autorização e contexto aprovado pela corporação.',3),
  ('Regras Policiais','P4','É proibido usar recursos da corporação (viaturas, armas, sistemas) para fins pessoais.',4),
  ('Regras do Ilegal','I1','Toda ação precisa de contexto e roleplay antes do confronto armado.',1),
  ('Regras do Ilegal','I2','Reféns só podem ser feitos nas ações que permitem; sempre com negociação.',2),
  ('Regras do Ilegal','I3','É proibido roubar jogadores em áreas safe ou recém-chegados na cidade.',3),
  ('Regras do Ilegal','I4','Limites de integrantes por ação devem ser respeitados conforme a tabela de ações.',4),
  ('Hospital e Áreas Safe','H1','Hospitais, delegacias, spawns e prefeitura são áreas safe: proibido qualquer ação hostil.',1),
  ('Hospital e Áreas Safe','H2','Após ser resgatado, o personagem não lembra dos detalhes do que causou sua morte.',2),
  ('Hospital e Áreas Safe','H3','É proibido perseguir ou finalizar jogadores em atendimento médico.',3)
) AS v(sec, code, text, ord) ON v.sec = s.title;

INSERT INTO public.actions (porte, nome, bandidos, policia, regras, sort_order) VALUES
  ('Pequeno Porte','Lojinhas',3,4,ARRAY['Apenas pistola','Negociação obrigatória','Sem reféns','1 bandido pode ficar do lado de fora'],1),
  ('Pequeno Porte','Ammunation',2,3,ARRAY['Apenas pistola','Negociação obrigatória','Sem reféns','Proibido bandido fora do estabelecimento'],2),
  ('Médio Porte','Central de Dados',4,6,ARRAY['Fuzil liberado','Negociação obrigatória','1 refém permitido'],3),
  ('Médio Porte','Joalheria',4,6,ARRAY['Fuzil liberado','Negociação obrigatória','Rota de fuga definida no RP'],4),
  ('Grande Porte','Banco Central',6,10,ARRAY['Armamento pesado liberado','Negociação obrigatória','Até 2 reféns','Ação única por dia'],5),
  ('Grande Porte','Carro Forte',5,8,ARRAY['Fuzil liberado','Sem reféns','Perseguição encerra a ação'],6);