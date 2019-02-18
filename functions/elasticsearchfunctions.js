var elasticsearch = require('elasticsearch');
const bodyParser = require("body-parser");
const logger = require("morgan");

var elasticClient = new elasticsearch.Client({  
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "randomindex";

exports.elasticsearchfunc= {};
/**
* Delete an existing index
*/
function deleteIndex() {  
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.elasticsearchfunc.deleteIndex = deleteIndex;

/**
* create the index
*/
function initIndex() {  
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.elasticsearchfunc.initIndex = initIndex;

/**
* check if the index exists
*/
function indexExists() {  
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.elasticsearchfunc.indexExists = indexExists; 

function initMapping() {  
    return elasticClient.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.elasticsearchfunc.initMapping = initMapping;

function addDocument(document) {  
    return elasticClient.index({
        index: indexName,
        type: "document",
        body: {
            title: document.title,
            content: document.content,
            suggest: {
                input: document.title.split(" "),
                output: document.title,
                payload: document.metadata || {}
            }
        }
    });
}
exports.elasticsearchfunc.addDocument = addDocument;

function getSuggestions(input) {  
    return elasticClient.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "suggest",
                    fuzzy: true
                }
            }
        }
    })
}
exports.elasticsearchfunc.getSuggestions = getSuggestions;