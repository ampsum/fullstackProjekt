const express = require('express');
const db = require('sqlite');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const app = express();



app.use(function(request, result, next) {
  result.header('Access-Control-Allow-Origin', '*');
  result.header('Access-Control-Allow-Headers', 'Content-Type');
  result.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  result.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*')
  next()
})

app.use(bodyParser.json());

//Deklarerar en databas variabel samt öpnnar databasen (Alex)
var database;
db.open('./db.db').then(database_ => {
  database = database_
})

// hämtar samtliga users från databasen (Alex)
app.get('/users', (request,response) => {
    database.all('SELECT * FROM users').then(users => {
      response.send(users);
    })
})

// lägger till users (Alex)
app.post('/users', (request, response) => {
  let newUser = request.body
  let newID = uuidv4();
  database.run('INSERT INTO users VALUES(?,?,?,?,?)', [newUser.name, newUser.password, newID, newUser.type, newUser.email]).then(books => {
    response.status(201).send(books);
  })
})

// logga in (Alex) Ta ej bort!!!!
// app.post('/login', (request, response) => {
//   let newID = uuidv4();
//   let regUser = request.body
//    database.all('SELECT * FROM users WHERE name=? AND password=?', [regUser.name, regUser.password]).then(row => {
//      if(row[0]) {
//       database.all('INSERT INTO tokens VALUES(?,?)', [regUser.name, newID]).then(user => {
//         response.set('Cookie', newID)
//         response.status(201).send(user)
//       })

//      } else {
//       response.status(404).send('')
//       console.log('Fel användernamn eller lösenord, försök igen!');
//      }
//    })
//   })

app.post('/login', (request, response) => {
  let regUser = request.body
   database.all('SELECT * FROM users WHERE name=? AND password=?', [regUser.name, regUser.password]).then(row => {
     if(row[0]) {
      database.all('INSERT INTO tokens VALUES(?,?,?)', [regUser.name, regUser.ID, row[0].type]).then(user => {
        response.set('Cookie', regUser.ID)
        response.status(201).send(user)
      })
     } else {
      response.status(404).send('')
      console.log('Fel användernamn eller lösenord, försök igen!');
     }
   })
  })

 // Hämtar inloggade (Alex)
app.get('/login', (request, response) => {
    database.all('SELECT * FROM tokens').then(inloggade => {
     response.status(201).send(inloggade);
  })
})

// Loggar ut (Alex)
app.post('/logout', (request, response) => {
   let token = request.body.Cookie
   database.run('DELETE FROM tokens WHERE token =?', [token]).then(() => {
     response.send('Utloggad');
   })
})


// hämtar samtliga böcker från databasen (Alex)
app.get('/books', (request, response) => {
  database.all('SELECT * FROM books').then(books => {
      response.send(books);
    })
  })


      //hämtar kategorier och språk (Sara)
      app.get('/books/catsandlangs', (request, response) => {
        database.all('select distinct category from books order by category').then(books => {
          let categories = books.map(row => row.category)
            database.all('select distinct language from books order by language').then(books => {
              let languages = books.map(row => row.language)
              let all = [categories, languages]
              response.send(all)
            })
        })
      })

// hämtar böcker utifrån sökord (Sara)
// om söker på två ord,
// split så det blir två strängar s.split('') -tar bort mellanslag och ger array
// where name like ... and name like ...
      app.get('/books/:word', (request, response) => {
        if (request.query.cat && request.query.lang){
            database.all('select * from books where title like ? OR author like ? AND category = ? AND language = ? order by year desc', ['%' + request.params.word + '%', '%' + request.params.word + '%', request.query.cat, request.query.lang]).then (books => {
              response.status(201)
              response.send (books)
            })
        }
        else if (request.query.cat){
          database.all('select * from books where title like ? OR author like ? AND category = ? order by year desc', ['%' + request.params.word + '%', '%' + request.params.word + '%', request.query.cat]).then (books => {
            response.status(201)
            response.send (books)
          })
        }
        else if (request.query.lang){
          database.all('select * from books where title like ? OR author like ? AND language = ? order by year desc', ['%' + request.params.word + '%', '%' + request.params.word + '%', request.query.lang]).then (books => {
            response.status(201)
            response.send (books)
          })
        }
        else {
          database.all('select * from books where title like ? OR author like ? order by year desc',
          ['%' + request.params.word + '%', '%' + request.params.word + '%']
          ).then(books => {
            response.status(201)
            response.send(books)
          })
        }
      })

      // hämtar lånade böcker (loans) från databasen (Maija)
      app.get('/loans', (request, response) => {
        database.all('SELECT * FROM loans').then(books => {
          response.send(books);
        })
      })

      //Lägger till bok (Annika)
      app.post('/books', (request, response) => {
        let title = request.body.title
        let author = request.body.author
        let category = request.body.category
        let year = request.body.year
        let language = request.body.language
        let id = uuidv4()
        let image = request.body.image
        let amount = request.body.amount
        database.run('INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, category, year, language, amount, image, id]).then(books => {
        response.send(books)
        })
      })


// hämtar lånade böcker (loans) från databasen (Maija)
app.get('/loans', (request, response) => {
  database.all('SELECT * FROM loans').then(books => {
    response.send(books);
  })
})


app.listen(3000, function() {
  console.log('The server is running!')
});

