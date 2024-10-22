# Survey Analysis RAG

**Survey Analysis RAG** is a full-stack web application designed to analyze survey data using advanced Natural Language Processing (NLP) techniques. It leverages **FastAPI** for the backend, **Next.js** for the frontend, and is containerized using **Docker** for seamless deployment. The application is deployed on **Render.com** (backend) and **Vercel** (frontend), ensuring scalability and reliability.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Installation](#-installation)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Environment Variables](#2-environment-variables)
    - [3. Docker Setup](#3-docker-setup)
    - [4. Building and Running with Docker Compose](#4-building-and-running-with-docker-compose)
5. [Running the Application Locally](#-running-the-application-locally)
    - [1. Backend Setup](#1-backend-setup)
    - [2. Frontend Setup](#2-frontend-setup)
6. [Deployment](#-deployment)
    - [1. Backend Deployment on Render.com](#1-backend-deployment-on-rendercom)
    - [2. Frontend Deployment on Vercel](#2-frontend-deployment-on-vercel)
7. [Troubleshooting](#-troubleshooting)
8. [Contributing](#-contributing)
9. [License](#-license)
10. [Contact](#-contact)

---

## 🎯 Features

- **Survey Data Analysis:** Process and analyze survey responses using NLP models.
- **User-Friendly Interface:** Intuitive frontend built with Next.js for seamless interaction.
- **Scalable Deployment:** Containerized using Docker for easy scalability and maintenance.
- **Secure and Efficient:** Utilizes environment variables for sensitive data management and adheres to best security practices.
- **Comprehensive Documentation:** Step-by-step setup and deployment instructions for developers.

---

## 🛠 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/)
- **Containerization:** [Docker](https://www.docker.com/)
- **Deployment:** [Render.com](https://render.com/) (Backend), [Vercel](https://vercel.com/) (Frontend)
- **Programming Languages:** Python 3.11, JavaScript (ES6+)
- **Other Tools:** Git, GitHub

---

## 🔧 Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

- **Git:** Version control system.
    - [Download Git](https://git-scm.com/downloads)
- **Docker:** Containerization platform.
    - [Download Docker](https://www.docker.com/products/docker-desktop)
- **Node.js and npm:** JavaScript runtime and package manager.
    - [Download Node.js](https://nodejs.org/) (Includes npm)
- **Python 3.11:** Programming language for backend.
    - [Download Python](https://www.python.org/downloads/)
- **Optional:** [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

---

## 📥 Installation

### 1. Clone the Repository

Start by cloning the main project repository to your local machine:

```bash
git clone https://github.com/shikhardang/survey-analysis-rag.git
cd survey-analysis-rag
```

### 2. Environment Variables

#### Backend (`backend/.env`)

Create a `.env` file inside the `backend` directory to store environment variables:

```bash
cd backend
touch .env
```

Open `backend/.env` in your preferred text editor and add the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
# Add other necessary environment variables
```

*Ensure that `.env` is added to `.gitignore` to prevent sensitive information from being committed.*

#### Frontend (`frontend/.env.local`)

Create a `.env.local` file inside the `frontend` directory:

```bash
cd ../frontend
touch .env.local
```

Add the following variables:

```env
NEXT_PUBLIC_BACKEND_URL=https://survey-analysis-rag.onrender.com
# Add other necessary environment variables
```

*Ensure that `.env.local` is added to `.gitignore`.*

### 3. Docker Setup

Ensure Docker is installed and running on your machine. You can verify by running:

```bash
docker --version
docker-compose --version
```

### 4. Building and Running with Docker Compose

From the root directory of the project (`survey-analysis-rag`), execute the following commands:

```bash
docker-compose build
docker-compose up -d
```

- **`docker-compose build`**: Builds the Docker images for both backend and frontend.
- **`docker-compose up -d`**: Runs the containers in detached mode.

*To stop the containers, run:*

```bash
docker-compose down
```

---

## 🚀 Running the Application Locally

If you prefer running the backend and frontend without Docker, follow these steps.

### 1. Backend Setup

#### a. Navigate to Backend Directory

```bash
cd backend
```

#### b. Create and Activate Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### c. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### d. Run the FastAPI Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Access API Documentation:** [https://survey-analysis-rag.onrender.com/docs](https://survey-analysis-rag.onrender.com/docs)

### 2. Frontend Setup

#### a. Navigate to Frontend Directory

```bash
cd ../frontend
```

#### b. Install Dependencies

```bash
npm install
```

#### c. Run the Next.js Development Server

```bash
npm run dev
```

- **Access Frontend:** [http://localhost:3000](http://localhost:3000)

---

## 📦 Deployment

### 1. Backend Deployment on Render.com

#### a. Create a New Web Service on Render

1. **Log in to Render.com** and navigate to your dashboard.
2. **Create a New Web Service:**
    - **Name:** `fastapi-backend`
    - **Environment:** Python 3
    - **Build Command:** `pip install -r requirements.txt`
    - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
3. **Connect Your GitHub Repository:**
    - Select the `survey-analysis-rag` repository.
    - Set the root directory to `/backend`.
4. **Set Environment Variables:**
    - Add `OPENAI_API_KEY` and any other necessary variables.
5. **Deploy:**
    - Click **"Create Web Service"** to initiate deployment.

#### b. Configure Backend URL

Once deployed, Render.com provides a stable URL (e.g., `https://survey-analysis-rag.onrender.com`). Update the frontend's `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local` with this URL.

### 2. Frontend Deployment on Vercel

#### a. Create a New Project on Vercel

1. **Log in to Vercel** and navigate to your dashboard.
2. **Import Project:**
    - Select the `survey-analysis-rag` repository from GitHub.
    - Set the root directory to `/frontend`.
3. **Configure Environment Variables:**
    - Add `NEXT_PUBLIC_BACKEND_URL` with the Render.com backend URL.
4. **Deploy:**
    - Click **"Deploy"** to start the deployment process.

#### b. Verify Deployment

- **Access Frontend:** Once deployed, Vercel provides a URL (e.g., `https://your-frontend.vercel.app`). Visit this URL to interact with the application.

---

## 🛠️ Troubleshooting

### 1. Favicon Not Loading

- **Ensure Favicon is in `public/` Directory:**
    - Place `favicon.ico` inside `frontend/public/`.
- **Reference Correctly in `_app.js` or `_document.js`:**
    ```javascript
    // frontend/pages/_app.js
    import Head from 'next/head';

    function MyApp({ Component, pageProps }) {
      return (
        <>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <title>Survey Analysis RAG</title>
          </Head>
          <Component {...pageProps} />
        </>
      );
    }

    export default MyApp;
    ```
- **Clear Browser Cache and Perform Hard Refresh:**
    - **Windows/Linux:** `Ctrl + F5`
    - **macOS:** `Cmd + Shift + R`

### 2. Backend Module Errors

- **Missing Dependencies:**
    - Ensure all Python packages are listed in `backend/requirements.txt`.
    - Rebuild Docker images after updating dependencies:
        ```bash
        docker-compose build backend
        docker-compose up -d
        ```
- **Specific Error:**
    ```plaintext
    ImportError: cannot import name 'cached_download' from 'huggingface_hub'
    ```
    - **Solution:** Pin compatible versions in `requirements.txt`.
        ```plaintext
        huggingface_hub==0.13.3
        ```
    - **Rebuild Docker Containers:**
        ```bash
        docker-compose build backend
        docker-compose up -d
        ```

### 3. Git Remote Issues

- **Adding a New Remote:**
    ```bash
    git remote add [remote-name] [remote-url]
    ```
    - **Example:**
        ```bash
        git remote add github https://github.com/shikhardang/survey-analysis-rag.git
        ```
- **Verify Remotes:**
    ```bash
    git remote -v
    ```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute to the project:

1. **Fork the Repository**

2. **Create a Feature Branch**

    ```bash
    git checkout -b feature/YourFeatureName
    ```

3. **Commit Your Changes**

    ```bash
    git commit -m "Add your detailed message"
    ```

4. **Push to Your Fork**

    ```bash
    git push origin feature/YourFeatureName
    ```

5. **Create a Pull Request**

    - Navigate to the original repository on GitHub.
    - Click **"Compare & pull request"**.
    - Provide a clear description of your changes and submit.

---

## 📫 Contact

For any questions or feedback, feel free to reach out:

- **Email:** me.shikhardang@gmail.com
- **LinkedIn:** Shikhar Dang(https://www.linkedin.com/in/shikhardang/)
