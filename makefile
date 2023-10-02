install-back-dependencies:
	cd back && yarn install

install-front-dependencies:
	python3 -m venv .venv
	. .venv/bin/activate && cd front && pip install -r requirements.txt

init:
	make install-back-dependencies
	make install-front-dependencies

dev-front:
	cd back
	yarn dev

dev-back:
	cd front
	python3 main.py

