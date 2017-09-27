# Animal Exchange

A distributed pet store example for FaunaDB.

## About the demo

In this demo, selling an item involves updating a handful of database records.
If any one of these updates were to fail, it could leave the database in an
inconsistent state. When you are buying and selling, you have to be able to
trust your database.

The transaction includes these operations:

* Check the credit balance of the purchasing player to ensure they have available funds.
* Check that the item is for sale.
* Update the balances of the selling player and the purchasing player.
* Update the item with the new owner.
* Write a purchase record.

If any one of these operations fails, for instance because the player is
making multiple trades at the same time and exceeds their balance, the
entire transaction must fail. This also holds true in cases of hardware or
network failure. So you know that any data you read or write to FaunaDB
is consistent, taking the guesswork out of writing correct applications.

## Running your own copy

Just clone this repo, install the dependencies, and launch the server.

```sh
git clone https://github.com/fauna/animal-exchange
cd animal-exchange
npm install
npm start
```

This will launch a server at `http://localhost:3000/` with the app running. If
you change any files, it will recompile the application and reload your browser.

### Session service (optional)

The app requires a FaunaDB backend database to run. The database for each session
is provisioned by a serverless script run in AWS Lambda. The repo ships pointed at
a copy of this service maintained by Fauna.

It's cool with us if you use our serverless endpoint and run your own code on top of the schema. However, if you want to make schema changes, you'll probably want to work on your own database root, so you'll need to set up the session service by following the readme in `session-service/`.

### React App

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find the most recent version of the Create React App guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
