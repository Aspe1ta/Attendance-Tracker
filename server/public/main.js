     const studentCards = document.getElementsByClassName("student-card");

     for(student of studentCards){
        student.addEventListener("click",function(e){
            console.log(e.target);
        });
     }

   