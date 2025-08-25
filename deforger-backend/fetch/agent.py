import requests
import json
from uagents_core.contrib.protocols.chat import (
    chat_protocol_spec,
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    StartSessionContent,
)
from uagents import Agent, Context, Protocol
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv('./.env')

# ASI1 API settings
ASI1_API_KEY = os.getenv('ASI1_API_KEY')
ASI1_BASE_URL = os.getenv('ASI1_BASE_URL')
ASI1_HEADERS = {
    "Authorization": f"Bearer {ASI1_API_KEY}",
    "Content-Type": "application/json"
}

CANISTER_ID = "uxrrr-q7777-77774-qaaaq-cai"
BASE_URL = "http://127.0.0.1:4943"

HEADERS = {
    "Host": f"{CANISTER_ID}.raw.localhost", # added .raw to bypass local certification errors
    "Content-Type": "application/json"
}

# Function definitions for ASI1 function calling
tools = [
    {
        "type": "function",
        "function": {
            "name": "register",
            "description": "Registers a new user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "The username."},
                    "password": {"type": "string", "description": "The password."},
                    "name": {"type": "string", "description": "The full name."},
                    "role": {"type": "string", "description": "The professional role."},
                    "skills": {"type": "array", "items": {"type": "string"}, "description": "List of skills."},
                    "portfolioUrl": {"type": "string", "description": "Portfolio URL."}
                },
                "required": ["username", "password", "name", "role", "skills", "portfolioUrl"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "login",
            "description": "Logs in a user and returns a session token.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "description": "The username."},
                    "password": {"type": "string", "description": "The password."}
                },
                "required": ["username", "password"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "change_password",
            "description": "Changes the password for the authenticated user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "newPassword": {"type": "string", "description": "New password."}
                },
                "required": ["token", "newPassword"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_user_profile",
            "description": "Updates the user profile.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "name": {"type": "string", "description": "The full name."},
                    "role": {"type": "string", "description": "The professional role."},
                    "skills": {"type": "array", "items": {"type": "string"}, "description": "List of skills."},
                    "portfolioUrl": {"type": "string", "description": "Portfolio URL."}
                },
                "required": ["token", "name", "role", "skills", "portfolioUrl"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_project",
            "description": "Creates a new project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "name": {"type": "string", "description": "Project name."},
                    "vision": {"type": "string", "description": "Project vision."},
                    "openRoles": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "roleName": {"type": "string"},
                                "requiredSkills": {"type": "array", "items": {"type": "string"}}
                            },
                            "required": ["roleName", "requiredSkills"],
                            "additionalProperties": False
                        },
                        "description": "List of open roles."
                    },
                    "projectType": {"type": "string", "enum": ["startup", "freelance"], "description": "Project type: startup or freelance."}
                },
                "required": ["token", "name", "vision", "openRoles", "projectType"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "record_agent_match",
            "description": "Records an agent-driven match.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "userId": {"type": "string", "description": "User ID."},
                    "roleFilled": {"type": "string", "description": "Role filled."}
                },
                "required": ["token", "projectId", "userId", "roleFilled"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "apply_to_project",
            "description": "Applies to a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "message": {"type": "string", "description": "Application message."}
                },
                "required": ["token", "projectId", "message"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "review_application",
            "description": "Reviews an application.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "applicationId": {"type": "number", "description": "Application ID."},
                    "accept": {"type": "string", "enum": ["true", "false"], "description": "Accept or reject ('true' or 'false')."}
                },
                "required": ["token", "applicationId", "accept"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_message",
            "description": "Sends a message in a project chat.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "content": {"type": "string", "description": "Message content."}
                },
                "required": ["token", "projectId", "content"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "tokenize_project",
            "description": "Tokenizes a project for share sales.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "totalShares": {"type": "number", "description": "Total shares."},
                    "pricePerShare": {"type": "number", "description": "Price per share."}
                },
                "required": ["token", "projectId", "totalShares", "pricePerShare"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "buy_shares",
            "description": "Buys shares in a tokenized project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "numShares": {"type": "number", "description": "Number of shares to buy."}
                },
                "required": ["token", "projectId", "numShares"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "withdraw_project_funds",
            "description": "Withdraws funds from a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."}
                },
                "required": ["token", "projectId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_review",
            "description": "Adds a review to a project by a team member.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "content": {"type": "string", "description": "Review content."},
                    "rating": {"type": "number", "description": "Rating (1-5)."}
                },
                "required": ["token", "projectId", "content", "rating"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_contract",
            "description": "Creates a contract (simulated NFT) between a user and a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."},
                    "projectId": {"type": "number", "description": "Project ID."},
                    "userId": {"type": "string", "description": "User ID."},
                    "terms": {"type": "string", "description": "Contract terms."}
                },
                "required": ["token", "projectId", "userId", "terms"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_projects",
            "description": "Retrieves all projects.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project",
            "description": "Retrieves a specific project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "number", "description": "Project ID."}
                },
                "required": ["id"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": "Retrieves a user profile.",
            "parameters": {
                "type": "object",
                "properties": {
                    "userId": {"type": "string", "description": "User ID."}
                },
                "required": ["userId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_messages",
            "description": "Retrieves messages for a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "projectId": {"type": "number", "description": "Project ID."}
                },
                "required": ["projectId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_reviews",
            "description": "Retrieves reviews for a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "projectId": {"type": "number", "description": "Project ID."}
                },
                "required": ["projectId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_agent_matches",
            "description": "Retrieves all agent matches.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_share_balance",
            "description": "Retrieves share balance for a user in a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "projectId": {"type": "number", "description": "Project ID."},
                    "userId": {"type": "string", "description": "User ID."}
                },
                "required": ["projectId", "userId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_matching_projects",
            "description": "Retrieves projects that match the authenticated user's skills.",
            "parameters": {
                "type": "object",
                "properties": {
                    "token": {"type": "string", "description": "Session token."}
                },
                "required": ["token"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_contract",
            "description": "Retrieves a specific contract.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contractId": {"type": "number", "description": "Contract ID."}
                },
                "required": ["contractId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_trust_score",
            "description": "Retrieves a user's trust score.",
            "parameters": {
                "type": "object",
                "properties": {
                    "userId": {"type": "string", "description": "User ID."}
                },
                "required": ["userId"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
]

async def call_icp_endpoint(func_name: str, args: dict):
    # Convert func_name to path: replace _ with -, add /
    path = "/" + func_name.replace("_", "-")
    url = f"{BASE_URL}{path}?canisterId={CANISTER_ID}"
    
    if func_name.startswith("get_"):
        # For GET queries
        params = {k: str(v) if isinstance(v, (int, float)) else v for k, v in args.items()}
        response = requests.get(url, headers=HEADERS, params=params)
    else:
        # For POST updates
        response = requests.post(url, headers=HEADERS, json=args)
    
    response.raise_for_status()
    return response.json()

async def process_query(query: str, ctx: Context) -> str:
    try:
        # Step 1: Initial call to ASI1 with user query and tools
        initial_message = {
            "role": "user",
            "content": query
        }
        payload = {
            "model": "asi1-mini",
            "messages": [initial_message],
            "tools": tools,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        response = requests.post(
            f"{ASI1_BASE_URL}/chat/completions",
            headers=ASI1_HEADERS,
            json=payload
        )
        response.raise_for_status()
        response_json = response.json()

        # Step 2: Parse tool calls from response
        tool_calls = response_json["choices"][0]["message"].get("tool_calls", [])
        messages_history = [initial_message, response_json["choices"][0]["message"]]

        if not tool_calls:
            return "I couldn't determine what DeForger operation you're requesting. Please try rephrasing your question."

        # Step 3: Execute tools and format results
        for tool_call in tool_calls:
            func_name = tool_call["function"]["name"]
            arguments = json.loads(tool_call["function"]["arguments"])
            tool_call_id = tool_call["id"]

            ctx.logger.info(f"Executing {func_name} with arguments: {arguments}")

            try:
                result = await call_icp_endpoint(func_name, arguments)
                content_to_send = json.dumps(result)
            except Exception as e:
                error_content = {
                    "error": f"Tool execution failed: {str(e)}",
                    "status": "failed"
                }
                content_to_send = json.dumps(error_content)

            tool_result_message = {
                "role": "tool",
                "tool_call_id": tool_call_id,
                "content": content_to_send
            }
            messages_history.append(tool_result_message)

        # Step 4: Send results back to ASI1 for final answer
        final_payload = {
            "model": "asi1-mini",
            "messages": messages_history,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        final_response = requests.post(
            f"{ASI1_BASE_URL}/chat/completions",
            headers=ASI1_HEADERS,
            json=final_payload
        )
        final_response.raise_for_status()
        final_response_json = final_response.json()

        # Step 5: Return the model's final answer
        return final_response_json["choices"][0]["message"]["content"]

    except Exception as e:
        ctx.logger.error(f"Error processing query: {str(e)}")
        return f"An error occurred while processing your request: {str(e)}"

agent = Agent(
    name='deforger-agent',
    port=8001,
    mailbox=True
)
chat_proto = Protocol(spec=chat_protocol_spec)

@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    try:
        ack = ChatAcknowledgement(
            timestamp=datetime.now(timezone.utc),
            acknowledged_msg_id=msg.msg_id
        )
        await ctx.send(sender, ack)

        for item in msg.content:
            if isinstance(item, StartSessionContent):
                ctx.logger.info(f"Got a start session message from {sender}")
                continue
            elif isinstance(item, TextContent):
                ctx.logger.info(f"Got a message from {sender}: {item.text}")
                response_text = await process_query(item.text, ctx)
                ctx.logger.info(f"Response text: {response_text}")
                response = ChatMessage(
                    timestamp=datetime.now(timezone.utc),
                    msg_id=uuid4(),
                    content=[TextContent(type="text", text=response_text)]
                )
                await ctx.send(sender, response)
            else:
                ctx.logger.info(f"Got unexpected content from {sender}")
    except Exception as e:
        ctx.logger.error(f"Error handling chat message: {str(e)}")
        error_response = ChatMessage(
            timestamp=datetime.now(timezone.utc),
            msg_id=uuid4(),
            content=[TextContent(type="text", text=f"An error occurred: {str(e)}")]
        )
        await ctx.send(sender, error_response)

@chat_proto.on_message(model=ChatAcknowledgement)
async def handle_chat_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")
    if msg.metadata:
        ctx.logger.info(f"Metadata: {msg.metadata}")

agent.include(chat_proto)

if __name__ == "__main__":
    agent.run()


"""
Queries for /register
Register me with username alice, password secret, name Alice Smith, role Developer, skills python rust, portfolio https://alice.com.

Create a new account: username bob, password pass123, name Bob Johnson, role Designer, skills ui ux, portfolio https://bob.design.

Sign up as charlie with password secure, name Charlie Brown, role Manager, skills leadership project-management, portfolio https://charlie.io.

Queries for /login
Log me in with username alice and password secret.

Sign in as bob, password pass123.

Authenticate user charlie with password secure.

Queries for /change-password
Change my password to newsecret using token xyz.

Update password for current session token abc to supersecure.

Set new password strongpass with token def.

Queries for /update-user-profile
Update my profile: name Alice Updated, role Senior Developer, skills python rust go, portfolio https://alice.updated.com, token xyz.

Change profile details with token abc: name Bob Revised, role Lead Designer, skills ui ux photoshop, portfolio https://bob.revised.design.

Modify user info - token def, name Charlie Enhanced, role Project Lead, skills leadership project-management communication, portfolio https://charlie.enhanced.io.

Queries for /create-project
Create a project named Awesome App, vision Build a revolutionary app, open roles developer "python rust", designer "ui ux", type startup, with token xyz.

Start new project: title Game Changer, description Change the gaming world, roles needed engineer "c++ unity", artist "3d modeling", projectType freelance, token abc.

Initiate project Eco Friendly, vision Sustainable tech, openRoles manager "leadership", scientist "environmental science", type startup, using token def.

Queries for /record-agent-match
Record match for project 1, user user-1, role developer, token xyz.

Add agent match: projectId 2, userId user-2, roleFilled designer, with token abc.

Log agent connection for project 3, matched user user-3, filling role manager, token def.

Queries for /apply-to-project
Apply to project 1 with message I have the skills, token xyz.

Submit application for projectId 2, cover letter Excited to join, using token abc.

Send application to project 3: message Lets collaborate, token def.

Queries for /review-application
Review application 1, accept true, token xyz.

Accept applicationId 2 with token abc.

Reject app 3, accept false, using token def.

Queries for /send-message
Send message to project 1: Hello team!, token xyz.

Post chat in projectId 2, content Lets discuss ideas, with token abc.

Message project 3: Update on progress, token def.

Queries for /tokenize-project
Tokenize project 1 with totalShares 1000, pricePerShare 10, token xyz.

Enable tokenization for projectId 2, 500 shares at 5 each, token abc.

Set up shares for project 3: total 2000, price 2, using token def.

Queries for /buy-shares
Buy 10 shares in project 1, token xyz.

Purchase numShares 5 for projectId 2 with token abc.

Acquire 20 shares of project 3, token def.

Queries for /withdraw-project-funds
Withdraw funds from project 1, token xyz.

Pull projectId 2 earnings with token abc.

Extract funds for project 3 using token def.

Queries for /add-review
Add review to project 1: Great experience, rating 5, token xyz.

Submit project review for id 2, content Good collaboration, rating 4, with token abc.

Review project 3: Could be better, rating 3, token def.

Queries for /create-contract
Create contract for project 1, user user-1, terms Standard agreement, token xyz.

Draft NFT contract: projectId 2, userId user-2, terms Freelance terms, with token abc.

Initiate contract for project 3 and user-3: terms Startup equity, token def.

Queries for /get-all-projects
What are all the projects?

List every project available.

Show me all projects.

Queries for /get-project
Whats the details of project 1?

Get information on projectId 2.

Show project with id 3.

Queries for /get-user-profile
Get profile for user user-1.

Whats the info on userId user-2?

Retrieve user profile user-3.

Queries for /get-project-messages
What are the messages in project 1?

List chat for projectId 2.

Show messages from project 3.

Queries for /get-project-reviews
What are the reviews for project 1?

List reviews for projectId 2.

Show project 3 reviews.

Queries for /get-all-agent-matches
What are all agent matches?

List every agent match.

Show all matches.

Queries for /get-project-share-balance
Whats the share balance for user user-1 in project 1?

Get shares of userId user-2 in projectId 2.

How many shares does user-3 have in project 3?

Queries for /get-matching-projects
Show me projects that match my skills with token xyz.

What projects can I join based on my skills, token abc.

Recommended projects for me, using token def.

Queries for /get-contract
Get details of contract 1.

Retrieve contractId 2 information.

Show contract with id 3.

Queries for /get-user-trust-score
What is the trust score for user user-1?

Get trust credit of userId user-2.

Show trust score for user-3.
"""