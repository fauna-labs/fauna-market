// This script connects to FaunaDB and initializes the schema and data set.
// Run it with `npm run setup-faunadb` to pull in the proper environment.
// Note you'll need to set you FAUNADB_SERVER_SECRET in package.json first.

import faunadb, {query as q} from 'faunadb';

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

client.query(
  q.Do(
    q.CreateClass({name: "players"}),
    q.CreateClass({name: "purchases"}),
    q.CreateClass({name: "items"})
  )
).then(()=>{
  return client.query(
    q.Do(
      q.CreateIndex( {
        name: "players",
        source: q.Class("players")
      }),
      q.CreateIndex( {
        name: "items_for_sale",
        source: q.Class("items"),
        terms: [{
          field: ["data", "for_sale"]
        }],
        values: [{
          field: ["data", "price"]
        }]
      }),
      q.CreateIndex( {
        name: "purchases",
        source: q.Class("purchases")
      }),
      q.CreateIndex( {
        name: "items_by_owner",
        source: q.Class("items"),
        unique: true,
        terms: [{
          field: ["data", "owner"]
        }]
      })
    )
).then(()=>{
  const emojis = ["🐄","🐆","🐿","🐇","🐈","🐋","🐍","🐎","🐒","🐘",
                  "🐙","🐛","🐝","🐞","🐣","🐬","🐯","🐸","🐹","🐩"];
  return client.query(q.Do(
    // create items to sell
    q.Foreach(emojis, (emoji) => q.Create(q.Class("items"), {
      data : {
        label : emoji,
        for_sale : true,
        price : Math.ceil(Math.random()*40)
      }})),
    // create players
    q.Foreach(["Alice", "Bob", "Carol"], (name) => q.Create(q.Class("players"), {
      data : {
        name : name,
        credits : Math.ceil(Math.random()*500)
      }
    }))
  ))
}).catch((e) => console.log(e));
