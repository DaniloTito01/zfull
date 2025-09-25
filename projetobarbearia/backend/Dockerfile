# Use Node.js 18 alpine como base
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm prune --omit=dev

# Expor porta
EXPOSE 3001

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nextjs:nodejs /app

# Mudar para usuário não-root
USER nextjs

# Comando para iniciar a aplicação
CMD ["npm", "start"]