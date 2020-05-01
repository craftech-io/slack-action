const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

const start_color = '#C8F1F3';
const sucess_color = '#00C0C7';
const cancelled_color = '#FFA900';
const failure_color = '#FF614E';


function post(slackMessage) {
    const slack_webhook_url = core.getInput("slack_webhook_url");
    fetch(slack_webhook_url, {
        method: 'POST',
        body: JSON.stringify(slackMessage),
        headers: { 'Content-Type': 'application/json' },
    }).catch(console.error);
}

function getColor(status) {
    
    if (status.toLowerCase() === 'success') {
        return sucess_color;
    }
    if (status.toLowerCase() === 'cancelled') {
        return cancelled_color;
    }
    
    if (status.toLowerCase() === 'failure') {
        return failure_color;
    }

    return start_color;
}

function getText(status) {
    
    if (status.toLowerCase() === 'success') {
        return '*Status deploy:* Succeeded';
    }
    if (status.toLowerCase() === 'cancelled') {
        return '*Status deploy:* Cancelled';
    }
    
    if (status.toLowerCase() === 'failure') {
        return '<!here> *Status deploy:* Failed';
    }

    return '*Starting* deploy';
}


function generateSlackMessage(text) {
    const { sha } = github.context;
    const { owner, repo } = github.context.repo;
    const user = github.context.actor;
    const status = core.getInput("status");
    const channel = core.getInput("slack_channel");
    const username = core.getInput("slack_username");
    const workflow = github.context.workflow;	

    return {
        channel,
        username,
        text: getText(status),
        attachments: [
            {
                fallback: text,
                color: getColor(status),
                author_name: `${user}`,
                author_link: `http://github.com/${user}`,
                author_icon: `http://github.com/${user}.png?size=32`,
                footer: `<https://craftech.io|Powered By Craftech>`,
                footer_icon: `https://craftech.io/mail-signature/craftech-logo.png`,
                ts: Math.floor(Date.now() / 1000),
                "fields": [
                    {
                        "title": "Repositorio",
                        "value": `<https://github.com/${owner}/${repo}|${owner}/${repo}>`,
                        "short": true
                    },      
                    {
                        "title": "Ref",
                        "value": github.context.ref,
                        "short": true

                    },                   
                ],
                "actions": [ 
                    {
                       "type": "button",
                       "text": "Commit", 
                       "url": `https://github.com/${owner}/${repo}/commit/${sha}` 
                    },
                    {
                       "type": "button",
                       "text": "Action Tab",
                       "style": "primary",
                       "url": `https://github.com/${owner}/${repo}/commit/${sha}/checks` 
                    }                
                ]               
            }
        ]
    };
}

try {
    post(generateSlackMessage(' '));
} catch (error) {
    core.setFailed(error.message);
}
