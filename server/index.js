const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./../server/ServiceAccountKey.json");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
let urlencodedParser = bodyParser.urlencoded({ extended: true });

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

let currentClass = "GBDA_404";

let Class = db.collection(currentClass);

let currentDay = 1;

app.get("/", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("main", { layout: "index" });
});

app.get("/scottclasses.html", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  res.render("classes", { layout: "classesBody" });
});

app.get("/takeattendance.html", (req, res) => {
  currentClass = "GBDA_404";

  let gbda404 = db.collection(currentClass);

  let allStudents = gbda404
    .get()
    .then(snapshot => {
      let studentsData = [];

      snapshot.forEach(student => {
        //creates a array of objects containing all students data
        studentsData.push(student.data());
        // console.log(studentsData);
        // gbdaClass.doc(student.id).update({ attendanceRecord: [true, false] });
      });

      //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
      res.render("attendance", {
        layout: "attendanceBody",
        gbda404Data: studentsData,
        classNum: "GBDA 404",
        currentClass: currentClass
      });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});

app.get("/takeattendance302.html", (req, res) => {
  currentClass = "GBDA_302";

  let gbda302 = db.collection(currentClass);

  let allStudents = gbda302
    .get()
    .then(snapshot => {
      let studentsData = [];

      snapshot.forEach(student => {
        //creates a array of objects containing all students data
        studentsData.push(student.data());

        // gbdaClass.doc(student.id).update({ attendanceRecord: [true, false] });
      });

      //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
      res.render("attendance", {
        layout: "attendanceBody",
        gbda404Data: studentsData,
        classNum: "GBDA 302",
        currentClass: currentClass
      });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});

app.post("/recordAttendance", urlencodedParser, function(req, res) {
  ///////////////////////////////////////////////////////////////

  console.log(Object.values(req.body));
  console.log("pls work");

  for (let i = 1; i < Object.values(req.body).length; i++) {
    let currentAtt = [];

    let attRef = db.collection(currentClass).doc(Object.values(req.body)[i]);

    let getAtt = attRef
      .get()
      .then(doc => {
        if (!doc.exists) {
          console.log("No such document!");
        } else {
          currentAtt = doc.data().attendanceRecord;
        }

        let newAtt = currentAtt;

        let tempArr = newAtt;

        tempArr[parseInt(Object.values(req.body)[0]) - 1] = true;


        
        currentDay = parseInt(Object.values(req.body)[0]);
        console.log("test135", currentDay)
        // newAtt = tempArr;

        // newAtt[(parseInt(Object.values(req.body)[0]) - 1)] = true;

        attRef.update({ attendanceRecord: tempArr });
      })
      .catch(err => {
        console.log("Error getting document", err);
      });
  }
});
/////////////////////////////////////////////////////////////////

app.get("/add-edit.html", (req, res) => {
  let add = db.collection(currentClass);
  let allStudents = add
    .get()
    .then(snapshot => {
      let studentsData = [];

      snapshot.forEach(student => {
        //creates a array of objects containing all students data
        studentsData.push(student.data());

        // gbdaClass.doc(student.id).update({ attendanceRecord: [true, false] });
      });

      //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
      res.render("add", { layout: "add", gbda404Data: studentsData, classname: currentClass });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});

app.post("/addStudent", urlencodedParser, function(req, res) {
  console.log(req.body);

  let data = req.body;

  data.attendanceRecord = [false, false, false, false, false, false, false, false, false, false];

  // console.log(data)

  let setDoc = db
    .collection(currentClass)
    .doc(data.name)
    .set(data);
});

app.post("/removeStudent/:id", urlencodedParser, function(req, res) {
  // console.log("Got it ", req.params.id);

  let deleteDoc = db
    .collection(currentClass)
    .doc(req.params.id)
    .delete();
});

app.get("/viewAttendance.html", (req, res) => {
  console.log(currentDay);

  let add = db.collection(currentClass);

  let allStudents = add
    .get()
    .then(snapshot => {
      let studentsData = [];

      snapshot.forEach(student => {
        //creates a array of objects containing all students data
        studentsData.push(student.data());

        // gbdaClass.doc(student.id).update({ attendanceRecord: [true, false] });
      });

      let present = [];
      let absent = [];

      // console.log("This is stu data: ", studentsData );

      for (let i = 0; i < studentsData.length; i++)
        if (studentsData[i].attendanceRecord[currentDay] == true) {
          present.push(studentsData[i]);
        } else {
          absent.push(studentsData[i]);
        }

      // if(dummydata.attendanceRecord["insertdayhewre"] == true){
      //   present.push();
      // } else{
      //   students
      // }

      //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
      res.render("viewAttendance", {
        layout: "viewAttendanceBody",
        gbda404Data: studentsData,
        classname: currentClass,
        present: present,
        absent: absent
      });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
});

app.post("/selectClass", urlencodedParser, function(req, res) {
  console.log(Object.values(req.body));
  currentDay = parseInt(req.body);
});

app.listen(port, () => console.log(`App listening to port ${port}`));
