FROM node:18-alpine
ENV LANG=C.UTF-8
WORKDIR /service
COPY . .

RUN npm ci --omit=dev
RUN npm i --save @nestjs/cli@9.0.0
RUN npm run build

RUN mkdir logs
RUN chown node: logs
RUN chmod u+rw logs
USER node
 
CMD npm run migration:run && npm run start:prod