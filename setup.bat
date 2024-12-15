@echo off
echo Setting up Project Management System...

REM Setup Backend
echo Setting up Django Backend...
cd project_management
python -m venv venv
call venv\Scripts\activate
pip install django djangorestframework django-cors-headers django-filter python-dotenv djangorestframework-simplejwt
python manage.py migrate
python manage.py runserver &

REM Setup Frontend
echo Setting up React Frontend...
cd ../frontend
npm install
npm run dev