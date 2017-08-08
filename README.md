# [skb](https://github.com/Dischain/node-static-serv)

[skb](https://github.com/Dischain/node-static-serv) is a simple and small REST API for knowlege base, built to provide a utility to store, manage and share user knowlege. 

## Key features:
1. Create your own folders for special knowleges you want to save.
2. Create any amount of subfolders recursively.
3. Merge another user folders with yours recursively.
4. Create articles with your own tags to simplify navigation across knowlege base.
5. Merge another user articles into yout own folders.

## TODO
1. Full text search in MongoDB.
2. Social accounts authentication.
3. Store sessions into Redis store.
4. Complete routes.
5. Add proper error handling.
6. Refactor :)
7. Test with 'siege'
8. Use 'pm2' to implement cluster mode and simple RR load balancing.
9. To play with MongoDB horizontal scaling :)

## Minimum Prerequisites
1. Node.js v4.2.6
2. MongoDB v3.4.2
3. Redis v3.2.8