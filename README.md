# Barbearia PH - Frontend

Sistema de agendamento para barbearia desenvolvido em Angular.

## 🚀 Tecnologias

- **Angular 18**
- **TypeScript**
- **SCSS**
- **SweetAlert2**
- **Bootstrap**

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Angular CLI

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd BarbeariaPH-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
ng serve
```

4. Acesse: `http://localhost:4200`

## ⚙️ Configuração

Certifique-se de que o backend esteja rodando em `http://localhost:8080` antes de iniciar o frontend.

## 🎯 Funcionalidades

### 👤 Autenticação
- Login de clientes
- Cadastro de novos clientes
- Logout

### 📅 Agendamentos
- Criar novos agendamentos
- Visualizar agendamentos pendentes
- Editar agendamentos (serviço, data, horário)
- Excluir agendamentos
- Histórico de agendamentos

### 👨‍💼 Perfil do Cliente
- Visualizar dados pessoais
- Editar informações (nome, sobrenome, celular)

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes da aplicação
│   │   ├── agendamento/     # Formulário de agendamento
│   │   ├── agendamento-list/# Lista e gerenciamento de agendamentos
│   │   ├── login/           # Tela de login
│   │   ├── cadastro/        # Tela de cadastro
│   │   └── footer/          # Rodapé
│   ├── models/              # Interfaces TypeScript
│   │   ├── agendamento/     # Modelo de agendamento
│   │   ├── cliente/         # Modelo de cliente
│   │   └── servico/         # Modelo de serviço
│   ├── services/            # Serviços HTTP
│   │   ├── agendamento/     # Serviço de agendamentos
│   │   ├── cliente/         # Serviço de clientes
│   │   ├── auth.service.ts  # Serviço de autenticação
│   │   └── profissionalservico/ # Serviço de profissional-serviços
│   └── guards/              # Guards de rota
```

## 🕒 Horários de Funcionamento

- **Segunda a Sábado**: 08:00 às 20:30
- **Domingo**: Fechado
- **Intervalos**: 30 minutos

## 💰 Serviços Disponíveis

| Serviço | Preço |
|---------|-------|
| Cabelo e barba | R$ 60,00 |
| Degrade e sobrancelha | R$ 45,00 |
| Social e sobrancelha | R$ 40,00 |
| Cabelo Social | R$ 35,00 |
| Cabelo | R$ 40,00 |
| Acabamento no Cabelo | R$ 20,00 |
| Barba | R$ 35,00 |
| Sobrancelha | R$ 10,00 |

## 🔗 Integração com Backend

O frontend consome a API REST do backend através dos seguintes endpoints:

- `GET /api/agendamentos` - Lista agendamentos
- `POST /api/agendamentos` - Cria agendamento
- `PUT /api/agendamentos/{id}` - Atualiza agendamento
- `DELETE /api/agendamentos/{id}` - Exclui agendamento
- `GET /api/profissionais/servicos` - Lista serviços disponíveis
- `POST /api/clientes` - Cadastra cliente
- `PUT /api/clientes/{id}` - Atualiza cliente

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🛠️ Build para Produção

```bash
ng build --prod
```

Os arquivos serão gerados na pasta `dist/`.

## 👨‍💻 Desenvolvedor

Sistema desenvolvido para a Barbearia PH.