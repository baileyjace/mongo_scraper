// dependencies & middlewares
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var moment = require("moment");

// scrapers
var cheerio = require("cheerio");
var request = require("request");

// models
var db = require("./models");

// express
var PORT = process.env.PORT || 3000;

var app = express();

// configs
// morgan 
app.use(logger("dev"));
// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
// express.static
app.use(express.static("public"));

///////////////////////////////////////////

// routes
app.get("/", function(req, res) {
    res.send(index.html)
});

// GET scrape
app.get("/scrape", function(req, res) {

    request("https://www.nytimes.com/", function(err, response, html) {
        var $ = cheerio.load(html);

        $("h2.story-heading").each(function(element) {
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");
            

            var result = {
                title: title,
                link: link,
                isSaved: false
            }

            console.log(result);

            Article.findOne({title: title}).then(function(data) {

                if (data === null) {
                    db.Article.create(result).then(function(dbArticle) {
                        res.json(dbArticle);
                    });
                }
            }).catch(function(err) {
                res.json(err);
            });
        });
    });
});

// GET articles
app.get("/articles", function(req, res) {
    
    db.Article
      .find({})
      .sort({ articleCreated: -1 })
      .then(function(dbArticle) {
          RES.JSON(dbArticle);
      })
      .catch(function(err) {
          res.json(err);
      });
});

// 
app.post("/articles/:id", function(req, res) {
    
    db.Note
      .create(req.body)
      .then(function(dbNote) {
          return db.Article.findOneAndUpdate({ _id: req.params.id}, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          res.json(err);
      });
});

//
app.put("/saved/:id", function(req, res) {

    db.Article
      .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          res.json(err);
      });
});

//
app.get("/saved", function(req, res) {

    db.Article
      .find({ isSaved: true })
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          res.json(err);
      });
});

//
app.put("/delete/:id", function(req, res) {

    db.Article
      .findByIdAndUpdate({ _id: req.params.id}, { $set: { isSaved: false }})
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          res.json(err);
      });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});

app.listen(PORT, function() {
    console.log("app running on port " + PORT + "!");
});