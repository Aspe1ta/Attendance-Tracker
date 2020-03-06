const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./../server/ServiceAccountKey.json");
const app = express();
const port = 3000;
//Loads the handlebars module
const handlebars = require("express-handlebars");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gbda-e161a.firebaseio.com"
});

const db = admin.firestore();

//Sets our app to use the handlebars engine
app.set("view engine", "hbs");
//Sets handlebars configurations (we will go through them later on)
app.engine(
  "hbs",
  handlebars({
    layoutsDir: __dirname + "/views/layouts"
  })
);
app.use(express.static("public"));


app.get("/", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("main", { layout: "index" });
});

app.get("/scottclasses.html", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("classes", { layout: "classesBody" });
});

app.get("/takeattendance.html", (req, res) => {
  let gbdaClass = db.collection("GBDA_404");

  

  let allStudents = gbdaClass
    .get()
    .then(snapshot => {
      let studentsData = [];

      snapshot.forEach(student => {
        //creates a array of objects containing all students data
        studentsData.push(student.data());
        masterData.push(student.data());
        // gbdaClass.doc(student.id).update({ attendanceRecord: [true, false] });
      });


        //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
      res.render("attendance", { layout: "attendanceBody", gbda404Data: studentsData });

      })
      .catch(err => {
      console.log("Error getting documents", err);
    });


});

app.get("/add-edit.html", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("add", { layout: "add" });
});

app.listen(port, () => console.log(`App listening to port ${port}`));
