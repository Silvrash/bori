app=cassandras

init:
	docker network create bori-net
	make start
	make migrate
logs:
	docker  logs --tail 10 -f ${app}

login:
	docker exec -it ${app} `

start:
	docker-compose up -d

stop:
	docker-compose down

connect-db:
	docker exec -it cassandra cqlsh

migrate:
	docker exec -it cassandra /bin/sh -c "cqlsh -f db_scripts/db.cql"