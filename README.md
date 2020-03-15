# CDC QnA Maker CLI
[![npm version](https://badge.fury.io/js/ludown.svg)](https://badge.fury.io/js/ludown)

QnA Maker enables you to go from FAQ to bot in minutes. With QnA Maker you can build, train and publish a simple question and answer bot based on FAQ URLs, structured documents or editorial content in minutes.
This CLI will help you create, update and publish a COVID-19 FAQ built from the CDC web content.
Once you have your knowledgebase ready, you can connect it to your [Healthcare Bot](https://docs.microsoft.com/en-us/HealthBot/) instance instantly using the [Language models](https://docs.microsoft.com/en-us/HealthBot/language_models).
  

## Prerequisite

- [Node.js](https://nodejs.org/) version 10.0 or higher
- [Azure QnA Cognitive Service](https://azure.microsoft.com/en-us/services/cognitive-services/qna-maker/)


## Prerequisites
1) Node V10.17 or later - https://nodejs.org/en/download/
2) Azure QnA Cognitive Service - https://azure.microsoft.com/en-us/services/cognitive-services/qna-maker/
> From your cognitive service resource, get the subscription key

## Installation
To install:
```bash
npm i -g cdc-qna
```

## Use as a library
```bash
npm install cdc-qna --save
```
In your node project:
```js
import {Client} from "cdc-qna";
const client = new Client();
client.subscriptionKey = "******************************";
client.blobURI = "******************************"; // best to use "https://hastoragedevops.blob.core.windows.net/public/cdc_covid19_qna.html"
const knowledgeBases = client.getKnowledgeBases().then((knowledgebases) => {
   // here you will have your knowledgebases array
});
// To create a new knowledge base
client.kbName = "******************************";
client.create().then(() => { /* success code */ }).catch((err) => { /* failure code */ });

// To update existing knowledge base
client.kbid = "******************************";
client.update().then(() => { /* success code */ }).catch((err) => { /* failure code */ });
```

# Nightly Update
The CDC QnA HTML resource is being updated constantly.
Once you created your knowledgebase, it won't be updated with the latest information unless you manually update it.
Use this CLI to run the update flow and you will get the latest updates injected directly into your knowledgebase. 


## Demo for creation of a new knowledge base
```bash
################################################################
# Welcome to the COVID-19 Q&A Maker knowledge base manager CLI #
################################################################
Subscription Key: *********************************
(1) Create a new knowledge base
(2) Update an existing knowledge base
> 1
Knownledge Base name [Healthcare Bot CDC COVID-19 QnA]: 
Creating new knowledge base stated
Running...
Running...
Running...
Running...
Running...
Reading existing alterations for knowledge base started
QnA KB- required alterations already exists for this knowledge base
Publishing knowledge base started
Reading knowledge base details
Reading endpoint Keys
┌─────────┬─────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │          Name           │                                         Value                                          │
├─────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│    0    │   'Knowledge Base ID'   │                         '*********-****-****-****-************'                        │
│    1    │  'Knowledge Base Name'  │                           'Healthcare Bot CDC COVID-19 QnA'                            │
│    2    │     'QnA Endpoint'      │          'https://************************************************/qnamaker'           │
│    3    │     'Endpoint Key'      │                         '*************-****-****-************'                         │
│    4    │ 'Knowledge Base Editor' │ 'https://www.qnamaker.ai/Edit/KnowledgeBase?kbId=************************************' │
└─────────┴─────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘
Process completed, Thanks you

```

## Demo for updating an existing knowledge base
```bash
################################################################
# Welcome to the COVID-19 Q&A Maker knowledge base manager CLI #
################################################################
Subscription Key: *********************************
(1) Create a new knowledge base
(2) Update an existing knowledge base
> 2
Fetching knowledgebase list
(1) [*********-****-****-****-************] Some QnA Model
(2) [*********-****-****-****-************] Healthcare Bot CDC COVID-19 QnA
> 2
Updating knowledge base started
Running...
Running...
Running...
Running...
Running...
Running...
Reading knowledge base details
Reading endpoint Keys
┌─────────┬─────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │          Name           │                                         Value                                          │
├─────────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│    0    │   'Knowledge Base ID'   │                         '*********-****-****-****-************'                        │
│    1    │  'Knowledge Base Name'  │                           'Healthcare Bot CDC COVID-19 QnA'                            │
│    2    │     'QnA Endpoint'      │           'https://************************************************/qnamaker'          │
│    3    │     'Endpoint Key'      │                         '*************-****-****-************'                         │
│    4    │ 'Knowledge Base Editor' │ 'https://www.qnamaker.ai/Edit/KnowledgeBase?kbId=************************************' │
└─────────┴─────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘
Process completed, Thanks you
```


## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
