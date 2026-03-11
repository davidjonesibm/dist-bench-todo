# Copilot Agent Setup

## Your Learning course for Copilot Access

Complete the [Your Learning course](https://yourlearning.ibm.com/activity/PLAN-03E93B1C0080?focuslmsId=URL-E3EC99F1FED4) for access to the IBMC-AzureAI-Assets github organization where the IBM Consulting Github Copilot subscription is managed

## Copilot VSCode extension

1. Install the [Github Copilot Chat extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) in VScode (or other IDE)
1. Sign in with your github account which has access to the github organization above 👆🏽

You should now have access to several models in the VSCode copilot chat

### Troubleshooting

1. If you are already signed in to your github account in vscode, you may need to sign out and back in to see the models
1. If your "usage" is showing at 100% you may need to wait a day or two for the usage calculator to reset
   1. You can confirm your access by logging into the [copilot UI](https://github.com/copilot), but you may still see your usage at 100%
1. You may need to update or reinstall the copilot chat extension to see the models

## Adding Agents

You can build agents from scratch... but why? This is essentially like using a node package but you can modify each agent to your liking

1. Navigate to the [awesome-copilot repo](https://github.com/github/awesome-copilot)
1. Install an agent or a few

   > My favorites are the [RUG orchestrator](https://github.com/github/awesome-copilot/blob/main/agents/rug-orchestrator.agent.md), [Vue engineer](https://github.com/github/awesome-copilot/blob/main/agents/vuejs-expert.agent.md), [API Architect](https://github.com/github/awesome-copilot/blob/main/agents/api-architect.agent.md), [General Software Engineer](https://github.com/github/awesome-copilot/blob/main/agents/software-engineer-agent-v1.agent.md), [Context 7 Expert](https://github.com/github/awesome-copilot/blob/main/agents/context7.agent.md), and [Custom Agent Foundry](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md)

   > You can install by copying the files to .github/agents dir in your workspace or clicking the install button for each agent on the [Agents README](https://github.com/github/awesome-copilot/blob/main/docs/README.agents.md), the latter is my preferred process because there's simple descriptions of each agent

Once added to your workspace, you should see them in the Copilot chat agent selector, where you can also choose `Agent, Ask, Edit, Plan`. The dropdown is between the runner dropdown and the model selector dropdown.

## Agent Foundry

> When editing agent files directly, I suggest disabling your formatter or adding `*.agent.md` to the ignore file

The [Custom Agent Foundry agent](https://github.com/github/awesome-copilot/blob/main/agents/custom-agent-foundry.agent.md) is an excellent specialized assistant for refining agent protocols.

With the Custom Agent Foundry selected in the chat, and another agent markdown file open or provided as context to the chat, you can ask questions about the agent file or for suggestions to improve. If an agent isn't performing as expected, the foundry agent can also help you diagnose why. For example, the RUG orchestrator, as written in the repo, may not utilize your other agents as subagents without some refinement of the RUG's .md protocol. You may also need to adjust each agent's tooling access, capabilities, and delegation parameters, all of which the foundry agent can help with.

### Tooling

> When editing agent files directly, I suggest disabling your formatter or adding `*.agent.md` to the ignore file

You may need to adjust the tool access for some of the agents as written in the [awesome-copilot repo](https://github.com/github/awesome-copilot). To edit tools, you can either directly edit the files or use the vscode palette.

To use the palette, select the agent you want to edit in _COPILOT CHAT_, then click the tools icon, to the right of the model selector dropdown. This will open the tools palette and allow you to define which tools are accessible by which agent profiles.

> There was recently a bug where _applying_ tool changes to the agent profile would remove the "tools" key from the frontmatter. If this happens, just edit the file directly, the tools should still be applied: `tools: ["tool/tool", "other tool"]`

## Orchestration

When orchestrating a workflow, there are a few key considerations.

### Orchestrator design

1. The orchestrator should not do any of the file editing itself, this keeps its context window lighter and focused ([RUG](https://github.com/github/awesome-copilot/blob/main/agents/rug-orchestrator.agent.md) is designed this way anyway)
1. The orchestrator will design a plan for completing the work and should identify when and which subagents should be deployed. You can define a pool of subagents to select from, use the [foundry agent](#agent-foundry) to create this pool. For example, if you want to build a Vue app with a dotnet backend, you can specify these specializations in the RUG's agent profile
   > The orchestrator needs `agents` specified in the frontmatter: `agents: ["Vue Expert", "dotnet Expert", "etc"]`, a roster of agents to choose from, and "Routing Rule" for selecting agents. The foundry agent will be very helpful when defining these.

### Tooling and Context Creep

1. The subagent profiles should be given extensive tool access, but the wider the access, the more likely you will see context creep and hallucination. It's best to keep the subagents focused. For example, the orchestrator could delegate research to the Context7 agent (using the Context7 MCP) and then that research can be provided to the Vue agent to actually build the files. If the Vue agent has to do research itself, its context window gets larger.

### Architecture and Design

1. As the depth of work increases, the level of specificity becomes more important. If you prompt the orchestrator to build an entire application, but are not specific as to the architecture, it may make decisions you did not intend. For example, asking the orchestrator to "build a todo app with a Vue frontend, a Fastify backend, and a Pocketbase db" will likely result in an app that technically works, however the frontend may leverage the pocketbase js client instead of the Fastify backend. Use either modular construction, (backend, then serverless, then frontend) or be extremely specific about how the solution should be reached.
1. Prompt the orchestrator to "ask questions, don't make unilateral decisions about x, y, or z." Some of the agent profiles instruct the agent to implement without asking, but I think this is a poor approach to development. We would never tell a developer to implement without asking clarifying questions so we shouldn't design agents to operate this way either

### Dist Bench Todo App

[This repo](https://github.com/davidjonesibm/dist-bench-todo) contains an app built with agentic orchestration as well as the refined agent profiles discussed above
