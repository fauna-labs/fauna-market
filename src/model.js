import faunadb, {query as q} from 'faunadb';


export default class Model {
  constructor () {
    // set the default data for an empty page
    this.message = "";
    this.onChanges = [];
    this.items = [];
    this.players = [];
    this.purchases = [];
    this.client = null;
  }
  // The application subscribes here and the model calls it's render callback
  // when the underlying data changes.
  subscribe(onChange) {
    this.onChanges.push(onChange);
  }
  // This function is called when the model has changed data and should
  // tell the application to repaint.
  inform() {
    console.log("inform", this);
    this.onChanges.forEach((cb) => cb());
  }
  // The core transactional logic. See docs.fauna.com for a detailed walkthrough
  transactItem(item, player) {
    return this.client.query(
      q.Let({
        // Load the current player and item based on their refs.
        buyer : q.Get(player.ref),
        item : q.Get(item.ref)
      }, q.Let({
        // Load the seller account and set the transaction price.
        isForSale : q.Select(["data", "for_sale"], q.Var("item")),
        itemPrice : q.Select(["data", "price"], q.Var("item")),
        buyerBalance : q.Select(["data", "credits"], q.Var("buyer")),
        seller : q.Get(q.Select(["data", "owner"], q.Var("item")))
      },
        // Check that the item is for sale.
        q.If(q.Not(q.Var("isForSale")),
          "purchase failed: item not for sale",
          q.If(q.Equals(q.Select("ref", q.Var("buyer")), q.Select("ref", q.Var("seller"))),
            // Attempting to buy an item you are selling, removes it from sale
            q.Do(
              q.Update(q.Select("ref", q.Var("item")), {
                data : {
                  for_sale : false
                }
              }),
              "item removed from sale"
            ),
            // Check the credit balance of the purchasing player to ensure
            // they have available funds.
            q.If(q.LT(q.Var("buyerBalance"), q.Var("itemPrice")),
              "purchase failed: insufficient funds",
              // All clear! Preconditions passed.
              q.Do(
                // Write a purchase record.
                q.Create(q.Class("purchases"), {
                  data : {
                    item : q.Select("ref", q.Var("item")),
                    price : q.Var("itemPrice"),
                    buyer : q.Select("ref", q.Var("buyer")),
                    seller : q.Select("ref", q.Var("seller"))
                  }
                }),
                // Update the balances of the selling player and the purchasing player.
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
                // Update the item with the new owner.
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

  // Lifecycle hook that allows
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
    return this.transactItem(item, player).then((r) => {
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
            price : q.Select(["data","price"], q.Var("row")),
            item : q.Get(q.Select(["data","item"], q.Var("row")))
          },
          {
            buyer : q.Select(["data","name"], q.Var("buyer")),
            seller : q.Select(["data","name"], q.Var("seller")),
            price : q.Var("price"),
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

  queryPlayerItems(players) {
    const refs = players.map((p) => p.ref);
    console.log("queryPlayerItems", refs);
    return this.client.query(
      q.Map(refs, (ref) => q.Select("data", q.Map(
        q.Paginate(q.Match(q.Index("items_by_owner"), ref)),
        (row) =>  q.Get(row)
      )))
    );
  }

  queryItemsForSale() {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Index("items_for_sale"), true)),
        (row) =>
        q.Let({doc : q.Get(row)}, {
          ref : q.Select(["ref"], q.Var("doc")),
          data : {
            label : q.Select(["data","label"], q.Var("doc")),
            price : q.Select(["data","price"], q.Var("doc")),
            owner : q.Select(["data","owner"], q.Var("doc")),
            owner_name :
              q.Select(["data","name"],
              q.Get(q.Select(["data","owner"], q.Var("doc"))))
          }
        })
      )
    );
  }

}
