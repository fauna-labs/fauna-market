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
}

function listPlayers() {
  return client.query(
    q.Map(
      q.Paginate(q.Match(q.Index("players"))),
      (row) => q.Select("data", q.Get(row))
    )
  );
}

function queryPlayerItems(players) {
  return client.query(
    q.Map(players, (player) => q.Select("data", q.Map(
      q.Paginate(q.Match(q.Index("items_by_owner")), player.ref),
      (row) => q.Select("data", q.Get(row))
    )))
  );
}

function queryItemsForSale() {
  return client.query(
    q.Map(
      q.Paginate(q.Match(q.Index("items_for_sale"), true)),
      (row) => q.Select("data", q.Get(row))
    )
  );
}
