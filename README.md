## bryanyuan2-api

#### Description: another node.js backend serves `bryanyuan2.github.io` and `bryanyuan2-bookmarks.github.io`


- Online Service
   - [bryanyuan2.github.io](http://brynayuan2.github.io) - bryanyuan2's Portfolio
   - [bryanyuan2-bookmarks.github.io](http://bryanyuan2-bookmarks.github.io) - bryanyuan2's Online bookmarks service

- Installation
   - [Initial Server Setup with Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04)
   - [How To Install Node.js on an Ubuntu 14.04 server](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server)
   - [Let's encrypt on Express](https://lucaschmid.net/anotherblog/letsencrypt-express)
   - [Install MongoDB](http://askubuntu.com/a/621297)

- Import data to MongoDB
   - please execute the following cmd 2 times
   - `mongoimport --db "bryanyuan2" --collection "bryanyuan2" --type json --file "data/mondgodb.json" --jsonArray`

- Steps
   - `npm install`
   - `sudo -E npm run prod` (sudo to get the let's encrypt cert, -E to get process.env)

- Reference 
   - repo: [bryanyuan2.github.io](https://github.com/bryanyuan2/bryanyuan2.github.com)
   - repo: [bryanyuan2-bookmarks.github.io](https://github.com/bryanyuan2-bookmarks/bryanyuan2-bookmarks.github.com)


- env variable
```
export INSTAPAPER_CONSUMER_KEY
export INSTAPAPER_CONSUMER_SECRET
export INSTAPAPER_USER_ID
export INSTAPAPER_USER_PASSWORD
export MONGODB_HOST
export MONGODB_PORT
export MONGODB_DB
export MONGODB_COLLECTION_SEARCH
export MONGODB_COLLECTION_BOOKMARKS
export MONGODB_COLLECTION_BRYANYUAN2
export ELASTICSEARCH_INDEX_BRYANYUAN2
export ELASTICSEARCH_TYPE_MEDIA
```
