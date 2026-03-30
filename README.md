# ServeDoor Fullstack

ServeDoor is a food-delivery fullstack project with:

- Backend: FastAPI + MongoDB
- Frontend: React (CRACO)

## Project Structure

- backend: API server, business logic, tests
- frontend: customer/admin UI

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB running locally or remotely

## Backend Setup

1. Go to backend folder

	cd backend

2. Create virtual environment and activate

	python -m venv .venv
	.venv\\Scripts\\activate

3. Install dependencies

	pip install -r requirements.txt

4. Create env file

	Copy .env.example to .env and fill secrets.

5. Run backend

	uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

Backend URLs:

- Health: http://localhost:8001/api/health
- API docs: http://localhost:8001/api/docs

## Frontend Setup

1. Go to frontend folder

	cd frontend

2. Install dependencies

	npm install

3. Create env file

	Copy .env.example to .env

4. Run frontend

	npm start

Frontend URL:

- http://localhost:3000

## Environment Files

- backend/.env.example
- frontend/.env.example

## Running Tests

Backend tests from project root:

pytest -q

If tests need a custom API host, export BACKEND_URL before running.

## Notes

- Keep real secrets only in local .env files.
- Do not commit .env files to version control.
