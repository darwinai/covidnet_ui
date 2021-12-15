FROM node:12 as builder

WORKDIR /app/

COPY . .

# Build the app for production
RUN yarn && yarn build


FROM node:12-alpine
# Pass a UID on build command line (see above) to set internal UID
ARG UID=1001
ENV UID=$UID  VERSION="0.1"

RUN adduser --uid $UID --disabled-password localuser  \
  && su - localuser -c "mkdir app"

WORKDIR /home/localuser/app/

COPY --from=builder --chown=localuser /app/build .

# Install server
RUN yarn global add serve --network-timeout 100000

# Start as user localuser
USER localuser

EXPOSE 3000

# Serve the production build
CMD serve --single -l 3000 .
