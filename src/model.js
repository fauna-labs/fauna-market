import faunadb, {query as q} from 'faunadb';


export default class Model {
  constructor () {
    this.message = "";
    this.onChanges = [];
    this.items = [];
    this.players = [];
    this.purchases = [];
    this.client = null;
  }
  subscribe(onChange) {
    this.onChanges.push(onChange);
  }
  inform() {
    console.log("inform", this);
    this.onChanges.forEach((cb) => cb());
  }
  refresh(message) {
    Promise.all([
      this.queryItemsForSale().then(({data: items}) => this.items = items),
      this.listPlayers().then(({data: players}) => {
        this.players = players;
        return this.queryPlayerItems(this.players)
          .then((ownedItems) => this.ownedItems = ownedItems);
      }),
      this.listPurchases().then(({data : purchases}) => this.purchases = purchases.reverse())
    ]).then(() => {
      this.message = message || "";
      this.inform();
    });
  }
  setSellingState(item, player) {
    console.log("setSellingState", this.items.indexOf(item, this.items), item, this.items)
    this.items.splice(this.items.indexOf(item, this.items), 1);
  }
  sell(item, player) {
    // todo set preliminary "waiting" state of success and be ready to remove it on error.
    this.setSellingState(item, player);
    this.inform();
    return this.sellItemToPlayer(item, player).then((r) => {
      this.refresh(r);
      return r;
    });
  }
  makeForSale(item, stringPrice, isForSale) {
    const price = parseInt(stringPrice, 10)
    if (isNaN(price) || price < 0)  {
      this.refresh("Invalid price: "+stringPrice);
      return Promise.reject("Invalid price: "+stringPrice);
    }
    return this.runMakeForSaleQuery(item, price, isForSale).then((r) => {
      this.refresh();
      return r;
    });
  }
  setupSession() {
    var secret = window.location.hash;
    if (secret) {
      const client = new faunadb.Client({
        secret: secret.substr(1)
      });
      console.log("testClient", secret)
      return client.query(true).then(() => {
        this.client = client;
        return true;
      }).catch((error) => {
        console.log("setupSession error",error)
        window.location.hash = "";
        return this.setupSession();
      });
    } else {
      console.log("geting session from", process.env.REACT_APP_SESSION_ENDPOINT)
      return fetch(process.env.REACT_APP_SESSION_ENDPOINT, { method: 'post' }).then((r) => r.json()).then((data) => {
        window.location.hash = data.sessionId;
        return this.setupSession();
      });
    }
  }
  // "private" functions
  listPurchases() {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("purchases")), {before : null}),
        (row) => q.Let({row:q.Get(row)},
          q.Let({
            buyer : q.Get(q.Select(["data","buyer"], q.Var("row"))),
            seller : q.Get(q.Select(["data","seller"], q.Var("row"))),
            item : q.Get(q.Select(["data","item"], q.Var("row")))
          },
          {
            buyer : q.Select(["data","name"], q.Var("buyer")),
            seller : q.Select(["data","name"], q.Var("seller")),
            price : q.Select(["data","price"], q.Var("item")),
            label : q.Select(["data","label"], q.Var("item")),
            key : q.Select(["ref"], q.Var("row"))
          }
        ))
      )
    );
  }

  listPlayers() {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("players"))),
        (row) => q.Get(row)
      )
    );
  }

  runMakeForSaleQuery(item, newPrice, isForSale) {
    return this.client.query(q.Update(item.ref, {
      data : {
        price : newPrice,
        for_sale : isForSale
      }
    }))
  }



  sellItemToPlayer(item, player) {
    return this.client.query(
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
          q.If(q.Equals(q.Select("ref", q.Var("buyer")), q.Select("ref", q.Var("seller"))),
            q.Do(
              q.Update(q.Select("ref", q.Var("item")), {
                data : {
                  for_sale : false
                }
              }),
              "item removed from sale"
            ),
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
          )
         )))
    );
  }

  queryPlayerItems(players) {
    const refs = players.map((p) => p.ref);
    console.log("queryPlayerItems", refs);

    // return client.query(
    //   q.Paginate(q.Match(q.Index("items_by_owner"), players[0].ref))
    // )

    return this.client.query(
      q.Map(refs, (ref) => q.Select("data", q.Map(
        q.Paginate(q.Match(q.Index("items_by_owner"), ref)),
        (row) => q.Get(row)
      )))
    );
  }

  queryItemsForSale() {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("items_for_sale"), true)),
        (row) => q.Get(row)
      )
    );
  }

}
