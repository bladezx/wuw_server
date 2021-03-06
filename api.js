// wuw server
"use strict";

// import packages
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require("morgan");

// create the express app & configure port
var app = express();
var port = process.env.PORT || 8088;

// api version & url
var apiVersion = 0;
var apiBaseUrl = "/api/v" + apiVersion;


// use morgan to log
app.use(morgan("dev"));

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// connect to mongodb
var lectureCon = mongoose.createConnection("mongodb://localhost:27017/lectures");
var deadlineCon = mongoose.createConnection("mongodb://localhost:27017/deadlines");

// create mongodb schemas (database structure)
var LectureSchema = new mongoose.Schema({
    date: Date,
    fullLectureName: String,
    shortLectureName: String,
    room: String,
    startTime: Date,
    endTime: Date,
    group: String
});
var DeadlineSchema = new mongoose.Schema({
    deadline: Date,
    createDate: { type: Date, default: Date.now },
    shortLectureName: String,
    group: String
});

// create models from our schemas
var Lecture = lectureCon.model("Lecture", LectureSchema);
var Deadline = deadlineCon.model("Deadline", DeadlineSchema);


// routes
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log("Something is happening...");
    next();
});

// test route to make sure everything is working (GET /$apiBaseUrl)
router.get("/", function(req, res) {
    res.json({ message: "welcome to the wuw api v" + apiVersion });
});


// on routes that end in /lectures
router.route("/lectures")

    // get all lectures (GET /$apiBaseUrl/lectures)
    .get(function(req, res) {
        Lecture.find(function(err, lectures) {
            if (err) { res.send(err); }
            res.json(lectures);
        });
    });

// on routes that end in /lectures/:lecture_id
router.route("/lectures/:lecture_id")

    // get lecture with that id (GET /$apiBaseUrl/lectures/:lecture_id)
    .get(function(req, res) {
        Lecture.findById(req.params.bear_id, function(err, lecture) {
            if (err) { res.send(err); }
            res.json(lecture);
        });
    });


// on routes that end in /deadlines
router.route("/deadlines")

    // get all deadlines (GET /$apiBaseUrl/deadlines)
    .get(function(req, res) {
        Deadline.find(function(err, deadlines) {
            if (err) { res.send(err); }
            res.json(deadlines);
        });
    })

    // create a deadline (POST /$apiBaseUrl/deadlines)
    .post(function(req, res) {
        // create instance of Deadline model
        var deadline = new Deadline();
        // set attributes
        deadline.deadline = req.body.deadline;
        deadline.shortLectureName = req.body.shortLectureName;
        deadline.group = req.body.group;
        // save deadline in mongodb
        deadline.save(function(err) {
            if (err) { res.send(err); }
            res.json({ message: "Deadline created!" });
        });
    });

// on routes that end in /deadlines/:deadline_id
router.route("/deadlines/:deadline_id")

    // get deadline with that id (GET /$apiBaseUrl/deadlines/:deadline_id)
    .get(function(req, res) {
        Deadline.findById(req.params.deadline_id, function(err, deadline) {
            if (err) { res.send(err); }
            res.json(deadline);
        });
    })

    // update deadline with this id
    .put(function(req, res) {
        Deadline.findById(req.params.deadline_id, function(err, deadline) {
            if (err) { res.send(err); }

            // set new attributes
            deadline.deadline = req.body.deadline;
            deadline.shortLectureName = req.body.shortLectureName;
            deadline.group = req.body.group;

            deadline.save(function(err) {
                if (err) { res.send(err); }
                res.json({ message: "Deadline updated!" });
            });

        });
    })

    // delete the deadline with this id
    .delete(function(req, res) {
        Deadline.remove({
            _id: req.params.deadline_id
        }, function(err) {
            if (err) { res.send(err); }
            res.json({ message: "Deadline successfully deleted" });
        });
    });


// register the router & the base url
app.use(apiBaseUrl, router);

// start the server
app.listen(port);
console.log("magic happens at http://localhost:" + port + apiBaseUrl);