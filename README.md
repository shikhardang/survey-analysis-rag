# Survey Analysis RAG Application

This project is a **Survey Analysis Retrieval-Augmented Generation (RAG) Application** that allows users to interact with an AI assistant to analyze and compare survey results related to sustainability and Christmas. The application leverages OpenAI's GPT models and provides features such as advanced query understanding, data visualization, responsive design, performance optimization, and sentiment analysis.

---

## Table of Content

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Starting the Backend Server](#starting-the-backend-server)
  - [Starting the Frontend Server](#starting-the-frontend-server)
- [Testing](#testing)
  - [Backend Testing](#backend-testing)
- [Deployment](#deployment)
  - [Deploying the Frontend to Vercel](#deploying-the-frontend-to-vercel)
  - [Deploying the Backend to Render](#deploying-the-backend-to-render)
- [Additional Information](#additional-information)
- [License](#license)

---

## Features

- **Advanced Query Understanding**: Utilizes OpenAI's GPT models to interpret complex user queries.
- **Data Visualization**: Displays insights and comparisons through interactive charts using Recharts.
- **Responsive Design**: Ensures a seamless experience across various screen sizes using Tailwind CSS.
- **Performance Optimization**: Caches embeddings and indices for faster responses.
- **Sentiment Analysis**: Analyzes user queries to provide sentiment feedback.
- **Testing**: Implements robust testing using Jest and React Testing Library for the frontend, and pytest for the backend.
- **User Experience Enhancements**: Includes features like autocomplete suggestions and collapsible sections for data display.

---

## Prerequisites

- **Node.js** (version 14 or later)
- **npm** (version 6 or later)
- **Python** (version 3.8 or later)
- **pip** (Python package installer)
- **OpenAI API Key**: You need an API key from OpenAI to access GPT models.
- **Git** (for cloning the repository)

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/shikhardang/survey-analysis-rag.git
cd survey-analysis-rag