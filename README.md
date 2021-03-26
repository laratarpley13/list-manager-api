# List Manager

Link to live app: [https://list-manager.vercel.app](http://list-manager.vercel.app)

![Alt text](https://github.com/laratarpley13/list-manager-api/blob/master/screenshots/dashboard-view.png)
![Alt text](https://github.com/laratarpley13/list-manager-api/blob/master/screenshots/list-view.png)

## How it works

Get a preview of all your lists in dashboard view, add/delete/edit items within individual lists, keep track of your completed items by crossing them off as you go, and share a link to a list with a friend, partner, family member to help you complete your tasks and goals.

### Technologies Used

Client: React, ReactRouter, HTML, CSS

API: Node.js, Express, PostgreSQL

### API Used

Link to API repo: [https://github.com/laratarpley13/list-manager-api.git](https://github.com/laratarpley13/list-manager-api.git)

/lists route includes POST, GET, PATCH, and DELETE operations which are protected by authorization (except one GET route so user can share lists with others who may not have an account)

/items route includes POST, GET, PATCH, and DELETE operations which are protected by authorization (except for one GET route and PATCH route so user can share lists with others who may not have an account and allows the sender to see when someone crosses off an item on the shared list)

/users route includes POST operation to create a new user account and GET (requires authorization) to retrieve user info

/auth/signin includes POST operation to sign a user into their account

### Features to include in future versions

Create "tags" to help categorize each list (i.e. shopping-list, to-do list, wish-list, etc.)

Option to copy a list (i.e. user wants to copy a new shopping list from an older one)

Option to print a "printer-friendly" version of list for people who like physical copies

Option to add level of importance "tags" to items on a list
