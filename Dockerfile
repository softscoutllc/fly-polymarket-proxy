FROM denoland/deno:2.1.4

WORKDIR /app
COPY server.ts .

EXPOSE 8080

CMD ["deno", "run", "--allow-net", "--allow-env", "server.ts"]
