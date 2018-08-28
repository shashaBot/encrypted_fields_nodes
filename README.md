# Encrypted trickle down nodes
Implementing Trickle down value nodes as a CRUD application using MongoDB, Node.js and express.

# Installation
1. `git clone` this repo
2. run `npm install` in project root.
3. Create a .env file (see example: .env.example)
4. `node app`
5. Server starts on port given in env (8080, if not specified).

# API Endpoints

## Create Genesis node
`/api/create_genesis`

```
{
	"ownerName": "<name>",
	"ownerId": "<owner-id>",
	"val": <number>
}
```

## Create child node
`/api/create_child`

```
{
	"ownerName": "<name>",
	"ownerId": "<owner-id>",
	"val": <number>,
	"nodeId": "<parent-node-id>"
}
```

## Create multiple children
`/api/create_children`

```
{
	"ownerName": "<name>",
	"ownerId": "<owner-id>",
	"valArr": [<number>],
	"nodeId": "<parent-node-id>"
}
```
