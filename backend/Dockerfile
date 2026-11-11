# ==============================================================================
# Dockerfile para Render.com e Ambientes Cloud (Spring Boot + Java 21)
# ==============================================================================

# Estágio 1: Build da Aplicação
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache de dependências Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilação do código fonte sem executar testes unitários
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Imagem Final de Execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuário não-root seguro
RUN addgroup -S rankgit && adduser -S rankgit -G rankgit
USER rankgit:rankgit

COPY --from=build --chown=rankgit:rankgit /app/target/*.jar app.jar

# Configuração de memória otimizada para o tier gratuito do Render (512MB RAM)
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
