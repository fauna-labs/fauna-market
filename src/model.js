import faunadb, {query as q} from 'faunadb';

const client = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNADB_SECRET
});

export default class Model {
  constructor () {
    this.onChanges = [];
    this.items = [];
    this.players = [];
  }
  subscribe(onChange) {
    this.onChanges.push(onChange);
  }
  inform() {
    console.log("inform", this);
    this.onChanges.forEach((cb) => cb());
  }
  refresh() {
    Promise.all([
      queryItemsForSale().then(({data: items}) => this.items = items),
      listPlayers().then(({data: players}) => {
        this.players = players;
        return queryPlayerItems(this.players)
          .then((ownedItems) => this.ownedItems = ownedItems);
      })
    ]).then(() => this.inform());
  }
  sell(item, player) {
    return sellItemToPlayer(item, player).then(() => this.refresh());
  }
}

function listPlayers() {
  return client.query(
    q.Map(
      q.Paginate(q.Match(q.Index("players"))),
      (row) => q.Get(row)
    )
  );
}

function sellItemToPlayer(item, player) {
  return client.query(
    q.Let({
      buyer : q.Get(player.ref),
      item : q.Get(item.ref)
    }, q.Let({
      isForSale : q.Select(["data", "for_sale"], q.Var("item")),
      itemPrice : q.Select(["data", "price"], q.Var("item")),
      buyerBalance : q.Select(["data", "credits"], q.Var("buyer")),
      seller : q.Get(q.Select(["data", "owner"], q.Var("item")))
    }, q.If(q.Not(q.Var("isForSale")),
        "purchase failed: item not for sale",
        // check balance
        q.If(q.LT(q.Var("buyerBalance"), q.Var("itemPrice")),
          "purchase failed: insufficient funds",

          // all clear! record the purchase, update the buyer, seller and item.
          q.Do(
            q.Create(q.Class("purchases"), {
              data : {
                item : q.Select("ref", q.Var("item")),
                price : q.Var("itemPrice"),
                buyer : q.Select("ref", q.Var("buyer")),
                seller : q.Select("ref", q.Var("seller"))
              }
            }),
            q.Update(q.Select("ref", q.Var("buyer")), {
              data : {
                credits : q.Subtract(q.Var("buyerBalance"), q.Var("itemPrice"))
              }
            }),
            q.Update(q.Select("ref", q.Var("seller")), {
              data : {
                credits : q.Add(q.Select(["data", "credits"], q.Var("seller")), q.Var("itemPrice"))
              }
            }),
            q.Update(q.Select("ref", q.Var("item")), {
              data : {
                owner : q.Select("ref", q.Var("buyer")),
                for_sale : false
              }
            }),
            "purchase success"
          )
        )
       )))
  );
}

function queryPlayerItems(players) {
  const refs = players.map((p) => p.ref);
  console.log("queryPlayerItems", refs);

  // return client.query(
  //   q.Paginate(q.Match(q.Index("items_by_owner"), players[0].ref))
  // )

  return client.query(
    q.Map(refs, (ref) => q.Select("data", q.Map(
      q.Paginate(q.Match(q.Index("items_by_owner"), ref)),
      (row) => q.Get(row)
    )))
  );
}

function queryItemsForSale() {
  return client.query(
    q.Map(
      q.Paginate(q.Match(q.Index("items_for_sale"), true)),
      (row) => q.Get(row)
    )
  );
}
