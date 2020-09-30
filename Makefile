app=app

init:
	docker network create bori-net
logs:
	docker  logs --tail 10 -f ${app}

login:
	docker exec -it ${app} `

stop:
	docker-compose down

connect-db:
	docker exec -it cassandra cqlsh
