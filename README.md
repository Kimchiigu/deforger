![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3) ![tag:internetcomputer](https://img.shields.io/badge/internetcomputer-9370DB) ![tag:chatprotocol](https://img.shields.io/badge/chatprotocol-3D8BD3)

# DeForger

<p align="center">
<img src="./deforger-frontend/public/deforger-logo.png" alt="DeForger Logo" width="400"/>
</p>

DeForger is a decentralized platform leveraging Fetch.ai autonomous agents and the Internet Computer (ICP) for seamless talent discovery, team collaboration, and project investment through tokenized Real World Assets (RWAs).

-----

## 🚀 Introduction

Our vision is to create a trustless, autonomous platform where entrepreneurs and skilled professionals can form teams, collaborate on innovative projects, and invest in opportunities seamlessly.

DeForger integrates **Fetch.ai's AI agents** for proactive, 24/7 talent matchmaking with **ICP's decentralized backend** for transparent, secure, and immutable records of profiles, agreements, communications, tokenized shares, and user accounts.

-----

## 🏛️ Architecture

The project is built with a modern, decentralized tech stack:

  * **Frontend**: A responsive and interactive user interface built with **Next.js**, **TypeScript**, and styled with **TailwindCSS**.
  * **Backend**: A secure and robust canister running on the **Internet Computer (ICP)**, written in **Motoko**.
  * **AI Agent**: An autonomous agent powered by **Fetch.ai's uAgents framework** and **Python**, integrated with the **ASI:ONE** language model for natural language understanding and function calling.

-----

## Project Structure

Here is an overview of the project's monorepo structure:

```
DeForger/
├── deforger-backend/
│   ├── fetch/                # Fetch.ai Agent implementation
│   │   └── agent.py          # Main agent logic for interacting with ICP
│   └── ic/                   # Internet Computer (ICP) Canister
│       └── src/
│           └── backend/
│               ├── main.mo   # Core canister logic and public methods
│               └── Types.mo  # Data models and type definitions
│
├── deforger-frontend/
│   ├── app/                  # Next.js 15+ App Router pages
│   │   └── page.tsx          # Main application entry point
│   ├── components/           # Reusable React components
│   │   ├── ui/
│   │   │   ├── project-card.tsx
│   │   │   └── ai-copilot-sidebar.tsx
│   │   └── ...
│   ├── public/               # Static assets
│   │   └── deforger-logo.png # Project logo
│   └── ...
│
└── README.md                 # This file
```

-----

## 🔧 Local Development Setup

To get DeForger running on your local machine, follow these steps:

1.  **Deploy the Backend Canister (ICP):**

      * Navigate to the backend directory: `cd deforger-backend/ic`
      * Build and deploy the Motoko canister: `dfx deploy`

2.  **Run the AI Agent (Fetch.ai):**

      * Navigate to the agent directory: `cd deforger-backend/fetch`
      * Activate your preferred Python virtual environment.
      * Run the agent script: `python agent.py`

3.  **Launch the Frontend Application:**

      * Navigate to the frontend directory: `cd deforger-frontend`
      * Start the development server: `npm run dev`

-----

## 🤖 DeForger AI Agent

The core of our intelligent automation is the DeForger AI Agent. You can interact with it to perform actions on the platform using natural language.

  * **Agent Name:** `DeForger AI Agent`
  * **Agent Address:** `test-agent://agent1q2fz6srx3z6crus7a8tymcp40jph0237xv8m45f7wqt8tksfkte85m86dm2`

### 🛠️ Agent Capabilities & Example Queries

The agent can perform a wide range of actions by calling functions on the ICP backend canister.

#### Key Capabilities:

  * **User Management**: Register, log in, change password, and update user profiles.
  * **Project Management**: Create new projects, list all projects, and view specific project details.
  * **Collaboration**: Apply to projects, review applications, and send messages within a project's chat.
  * **Talent Matchmaking**: Find projects that match a user's skills and record agent-driven matches.
  * **RWA Tokenization**: Tokenize a project, buy shares, and manage share balances.

<details open>
<summary><strong>Click to see example user queries for the agent</strong></summary>

```
# User Registration
Register me with username alice, password secret, name Alice Smith, role Developer, skills python rust, portfolio https://alice.com.

# User Login
Log me in with username alice and password secret.

# Project Creation
Create a project named Awesome App, vision Build a revolutionary app, open roles developer "python rust", designer "ui ux", with token [your_session_token].

# Apply to a Project
Apply to project 1 with message I have the skills, token [your_session_token].

# Buy Project Shares
Buy 10 shares in project 1, token [your_session_token].

# Find Matching Projects
Show me projects that match my skills with token [your_session_token].

# Get Project Details
What are the messages in project 1?
```

</details>

-----

## ✨ Features

### 🌐 Internet Computer (ICP) Features Used

  * **Canister Development in Motoko**: The backend is implemented as an ICP canister (`Types.mo`, `main.mo`), providing a decentralized and immutable data layer.
  * **Persistent Storage with HashMaps**: Utilizes `HashMap` from `mo:base` to store user profiles, projects, applications, messages, and share balances on-chain.
  * **Custom Account System**: Implements user authentication with username/password hashing using `SHA-256` (`Sha256.fromBlob`) and session token management with expiration.
  * **HTTP Interface**: Supports `http_request` and `http_request_update` for frontend interaction, handling GET queries and POST updates with JSON responses.
  * **Data Serialization**: Uses `mo:serde/JSON` for serializing query responses to JSON, ensuring compatibility with the frontend and external services.
  * **Time-Based Logic**: Leverages `mo:base/Time` for session expiration and timestamping messages and agent matches.
  * **Type Definitions**: Defines structured data types (`UserProfile`, `Project`, `Application`, etc.) in `Types.mo` for robust on-chain data management.
  * **Query and Update Methods**: Provides public `query` methods (e.g., `getUserProfile`) for read-only access and shared `update` methods (e.g., `register`, `createProject`) for state-changing operations, secured by token validation.
  * **Share Balance Management**: Manages tokenized project shares using `HashMap` to simulate RWA tokenization.

### 🤖 Fetch.ai Features Used

  * **uAgents Framework**: Utilizes Fetch.ai's `uagents` library to implement the autonomous `deforger-agent` for handling interactions and function calls (`agent.py`).
  * **Chat Protocol**: Leverages the `chat_protocol_spec` for handling `ChatMessage` and `ChatAcknowledgement`, enabling robust agent communication. This is an advanced feature that ensures reliable messaging.
  * **Asynchronous Message Handling**: Uses async handlers (`@chat_proto.on_message`) for processing user queries, ensuring non-blocking communication.
  * **Tool Integration**: Defines a comprehensive set of function-calling tools (e.g., `register`, `create_project`, `buy_shares`) structured as JSON schemas for compatibility with the ASI:ONE API.
  * **ASI:ONE API Integration**: Interfaces with the ASI:ONE AI service for processing user queries, parsing tool calls, and generating final responses.
  * **Dynamic Query Processing**: Processes user queries by calling ASI:ONE, executing corresponding ICP canister functions via HTTP, and returning a formatted, natural language response.

-----

## 🧗 Challenges Faced

The primary challenges were technical and centered around the integration of niche and emerging technologies. Specifically, we faced difficulties integrating **Motoko (ICP) with Fetch.ai** due to a lack of comprehensive examples and documentation. We also encountered issues with outdated libraries that required workarounds.

-----

## 🔮 Future Plans

If we continue development post-hackathon, our focus will be on:

  * Refining the User Interface (UI) for a more intuitive experience.
  * Adding features for project owner to review applications with steps including phases (application submission, interview, final decision).
  * Enhancing the AI agent's capabilities to provide more context-aware recommendations.
  * Implementing a decentralized file storage system for project files
  * Visualize more detailed information about the investment and progress of the project.
  * Implementing a full ICRC-1 token standard for RWAs.

-----

## 📈 Technical Difficulty

This project was **quite challenging** to build due to the direct integration of multiple new and specialized technologies. An advanced feature we successfully implemented was the **uAgents Chat Protocol** in our Fetch.ai agent, which allows for more complex and stateful conversations.