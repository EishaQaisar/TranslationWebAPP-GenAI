🏥 Healthcare Translation Web App

A real-time multilingual healthcare translation tool that uses Generative AI, speech recognition, and text-to-speech to bridge communication gaps between healthcare providers and patients.

Built with React (frontend), FastAPI (backend), and Hugging Face NLP models, deployed on Vercel and Railway.

🚀 Features

🎙 Voice-to-Text with Generative AI – Converts spoken medical terms into accurate transcripts.

🌐 Real-Time Translation – AI-powered translations using Helsinki-NLP models.

🔊 Audio Playback – Listen to translations with natural-sounding text-to-speech.

📱 Mobile-First UI – Responsive design for both desktop and mobile use.

🛡 Privacy-Friendly – No storage of patient speech or translation data.





🔧 Technologies Used

Frontend: React, Web Speech API, SpeechSynthesis API

Backend: FastAPI, Python, Hugging Face Inference API (Helsinki-NLP models)

Deployment: Vercel (frontend), Railway (backend)



📦 Installation & Setup

1️⃣ Clone the repository
git clone https://github.com/yourusername/healthcare-translation-app.git
cd healthcare-translation-app

2️⃣ Setup the Backend (FastAPI)
cd backend
pip install -r requirements.txt


Create a .env file in backend/ with:

HF_API_TOKEN=your_huggingface_api_token


Run backend:

uvicorn main:app --reload

3️⃣ Setup the Frontend (React)
cd frontend
npm install


Create a .env file in frontend/ with:

REACT_APP_BACKEND_URL=http://localhost:8000


Run frontend:

npm start
