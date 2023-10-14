# if window use where python3 else use which python3
PYTHON = $(shell which python3)
PYTHONPATH = back
ROOT = $(shell pwd) 
ENV_PATH = venv/bin/activate
REQ_PATH = $(ROOT)/requirement/requirement.txt



init-back: 
	$(PYTHON) -m venv venv
	pip install pip-tools
	pip install -r $(REQ_PATH)

sync-back:
	pip-compile --output-file=requirement/requirement.txt requirement/requirement.in
	pip-sync requirement/requirement.txt

run-back:
	python3 $(PYTHONPATH)/main.py
	

