#FROM AMD64/jdk/openjdl:21-jdk-slim
#
#WORKDIR /app
#
#COPY target/Discord_Chat-1.0.jar app.jar
#
#EXPOSE 8080
#
#ENTRYPOINT [ "java","-jar","app.jar" ]

#FROM eclipse-temurin:21-jdk-jammy
#
#WORKDIR /app
#
#COPY target/*.jar app.jar
#
#EXPOSE 8080
#
#ENTRYPOINT ["java","-jar","app.jar"]


FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
