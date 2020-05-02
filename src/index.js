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
    const token = core.getInput("repoToken");
    const {owner, repo} = github.context.repo;
    const actor = github.context.actor;
    const workflow = github.context.workflow;	
    const { jobId } = github.context.jobs; 
    started = `<http://github.com/${actor}|${actor}>` + ' has *started* the "' + `${workflow}`  + '"' + ' workflow ';
    succeeded = 'The workflow "' + `${workflow}` + '"' + ' was completed *successfully* by ' + `<http://github.com/${actor}|${actor}>`;
    cancelled = ':warning: The workflow "' + `${workflow}` + '"' + ' was *canceled* by ' + `<http://github.com/${actor}|${actor}>`;
    failure = '<!here> The workflow "' + `${workflow}` + '"' + ' *failed*';
    
    if (status.toLowerCase() === 'success') {
        return succeeded;
    }
    if (status.toLowerCase() === 'cancelled') {
        return cancelled;
    }
    
    if (status.toLowerCase() === 'failure') {
        return failure;
    }
    
    if (status.toLowerCase() === 'started') {
        return started;
    }

    return 'status no valido';
}

function generateSlackMessage(text) {
    const { sha } = github.context;
    const { owner, repo } = github.context.repo;
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
                footer: `<https://craftech.io|Powered By Craftech>`,
                footer_icon: `https://craftech.io/mail-signature/craftech-logo.png`,
                ts: Math.floor(Date.now() / 1000),
                "fields": [
                    {
                        "title": "Repository",
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