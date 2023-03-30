### Cargos

1. resident (usuário civil)
2. manager (usuário gestor da cidade)
3. owner (usuário gestor master da cidade)
4. admin (usuário gestor da plataforma)

### Criação do usuário

1. id
2. Nome e sobrenome (name e surname)
3. email (email)
4. senha (password)
5. cidade (city -> id)
6. cargo (role, por default será resident)

### Login

1. email
2. senha

### Cidade

1. id
2. name
3. latitude
4. longitude

### Atribuir cargos (somente owner e admin)

1. email
2. cargo desejado
   1. revogar -> voltar para resident
   2. manager
   3. owner
   4. admin -> se o usuário for admin

### Problema

1. id
2. id da cidade
3. latitude
4. longitude
5. categoria
6. descrição do problema
7. data
8. relator - id do usuário que enviou a request
9. fiscal (opcional, não é colocado junto da criação) - usuário que se auto-atribui
10. gestor responsável (opcional, não é colocado junto da criação) - usuário que se auto-atribui
11. comentários
