build:
	docker build -t tt-be .

run:
	docker run -p 3000:3000 tt-be

clean:
	docker rmi tt-be
