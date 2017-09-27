# Serverless Session Service for Animal Exchange

This service contains a single lambda that is provisioned with a FaunaDB admin
secret. When the Lambda is triggered, it creates a new empty database in FaunaDB
Serverless Cloud. Then it defines the schema for Animal Exchange inside that
database. Finally, it returns a server secret for that new database.

Currently the app and schema are not designed to teach security model best
practices, so anyone with the database secret could vandalize the data. The
database secret is available to the browser and made part of the URL, so anyone
who knows about a demo session database can run any query.

However, in the absence of vandalism, this setup allows the browser to illustrate
queries that would usually be run in a more secure context, making for a better
demo. This session service also illustrates a useful patter in FaunaDB: using a
serverless function with privileged access to the database to dole out
keys with lower levels of access.

This repo ships with the app pointed at a copy of this service managed by Fauna.
That means you can hack on the app all you want without even needing a FaunaDB
account. But as soon as you want to modify the schema, you'll want to run your
own copy of the service, since the schema is encoded in `handler.js`.

## Setting up your own copy of the service

Assuming you are configured with the proper AWS environment variables, deploying
should be as simple as:

```sh
cd session-service/
npm install
npm install -g serverless
```

Now that everything is installed, you need your own Admin Secret for FaunaDB, so
[sign-up for FaunaDB Serverless Cloud for free](https://fauna.com/sign-up). With
only your email address, you'll be in your own Dashboard in seconds.

### Getting an Admin Secret

This database will hold databases which correspond to sessions in our distributed ledger game.

1\. If you don't have a FaunaDB account, [start a free trial](https://fauna.com/sign-up).
2\. Create a database in the [FaunaDB Dashboard](https://dashboard.fauna.com/db):

  1. Click **Create a Database**.
  2. Enter the name *ledger-demo* in the text box.
  3. Click **Create Database** again.

3\. Get a key:

  1. Click **/** in the upper left side of the screen to navigate to the parent database of *ledger-demo*.
  2. Click **Manage Keys** and **Create a Key**.

![image](https://user-images.githubusercontent.com/1302193/27404525-655289b0-569c-11e7-80c9-909979cebc3e.png)

  3. Name your key, assign it a *admin* role, and choose the *ledger-demo* database.
  4. Click **Create Key**.
  5. Your key's secret will be displayed. Copy it to your `session-service/serverless.yml` file, as the value of `FAUNADB_ADMIN_SECRET`.

### Deploying the Service

Now that you've configred `serverless.yml` deploying the service is a matter of running:

```sh
serverless deploy
```

At the end of that process you'll have a URL printed to the console. Configure the app to use it by changing `config.SESSION_ENDPOINT` to the new URL in this repository's root `package.json` file.

If you were running the development server, stop it and restart it to pick up the new config. Otherwise just launch it from the repo root with:

```sh
npm start
```

When the app comes up, it will be pointed to a database inside your Dashboard root. Go ahead and browse to it in the Dashboard and you'll see the schema and objects that were populated by the serverless service.
