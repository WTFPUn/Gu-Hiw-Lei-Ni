# Gu-Hiw-Lei-Ni

Application for finding people to share meals with in real-time.

## Requirement

- `python>=3.11`
- `nodejs>=18`
- `mongodb` server
- windows user can substitute makefile by runing the command in makefiles directly or installing `mingw` or other alternatives.

## Development

1. use `make init` to install frontend and backend dependencies
2. run `make run-back` and `make run-front` for backend and frontend development server

## Testing

Testing is done using E2E component of Cypress.

To access testing first start the project using the Development section, then run `make test-e2e`

## Deployment

To deploy use the deploy script `./dev_deploy.sh`
Before executing make sure the execution permission is set properly `chmod +x ./dev_deploy.sh`

```sh
./dev_deploy.sh --checkout=${GIT_HASH} --buildop=${BUILDOPTION}

'
#######

--checkout=${GIT_HASH}

# checkout to GIT_HASH before building docker image

#######

--buildop=${BUILDOPTION}

# set build option for deployment

## BUILDOPTION
# 1. nobuild - skip building new docker image

########
'

```

`docker-compose.yml` is configured to expose port 8001 and 3001 for backend and frontend hosting.

## Environment Variable

see env.example for how to configure the environment
