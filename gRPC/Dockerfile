# Etapa de build
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

COPY build.gradle settings.gradle ./
COPY src ./src

# Descarga dependencias y construye el shadow jar
RUN gradle shadowJar -x test

# Etapa final
FROM openjdk:17

WORKDIR /usr/app

# Copia el shadow JAR generado
COPY --from=build /app/build/libs/questhub-app-1.0.jar ./questhub-app-1.0.jar

EXPOSE 50051

CMD ["java", "-jar", "questhub-app-1.0.jar"]
