const { engine } = require('express-handlebars');
const express = require('express')
const app = express()
const port = 3000
const checker = require('./services/ssl-checker');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('home', {layout: false});
})

app.get('/check', async (req, res) => {
  try {
    const result =  await checker(req.query.checker, req.query.host, req.query.ip);
    return res.send(result);
  } catch (e) {
    res.send(e);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
