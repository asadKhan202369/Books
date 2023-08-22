function search_cards(){

    gsap.to(".search_page .sform .line .l",{
        delay:-.5,
        width:"100%",
        duration:7,
        repeat:-1,
        repeatDelay: -.5,
        ease:Expo.easeInout
    })
    
}

document.querySelector("#nav .search")
.addEventListener("click",function(){
     gsap.to('.search_page',{
          display:"flex",
          opacity:1,
          ease:Expo.easeInout,
          duration:1,
          onComplete: () => {
            search_cards();
         }
     })
})

document.querySelector("#snav .close")
.addEventListener("click",function(){
     gsap.to('.search_page',{
          display:"none",
          opacity:0,
          ease:Expo.easeInout,
          duration:1,
     })
})





 
 
function searchVehice(){

      
  var cent =  document.querySelector("#cent");
  var src =  document.querySelector(".search_page .sform .search");
  var sform =  document.querySelector(".search_page .sform ");
  var inp =  document.querySelector(".search_page .sform input");
  var btn =  document.querySelector(".search_page .sform button");
  var line = document.querySelector(".search_page .sform .line .l")
  // var se = document.querySelector("#se");
  document.querySelector("#se").addEventListener("input",function(){
       
      if(this.value.trim().length === 0){
         cent.style.display = "none"
         src.style.backgroundColor = "transparent"
         line.style.backgroundColor = "#2f0eef622"
         btn.style.backgroundColor = "#f0eef6"
         sform.style.height = "16%" 
         btn.style.color = "black"
         inp.style.color = "#fff"
      }else{
          cent.style.display = "flex"
         src.style.backgroundColor = "#f0eef6"
         line.style.backgroundColor = "#222"
         btn.style.backgroundColor = "#222"
         sform.style.height = "13%"
         sform.style.borderTopRightRadius = "20px"
         sform.style.borderTopLeftRadius = "20px"
         btn.style.color = "white"
         inp.style.color = "#000"
      }
      // document.querySelector("#searchform").addEventListener("input",function(){
      if(this.value.trim().length %1 === 0 ){
        axios.get(`http://localhost:3000/search/${this.value}`).then(function(resp){
          if (resp.data.avail.length > 0) {
            console.log(document.querySelector("#se").value.length)
          console.log("hello");
          console.log(resp.data.avail)
          var clutter = "";
          resp.data.avail.forEach(function(elem){
            console.log(elem,"its elm");

            clutter += `
            <a href="/books/${elem.BookType}">
              <div id="user">
                <div class="ucir">
                    <img src="../images/uploads/bookimages/${elem.pic[0]}" alt="">
                </div> 
            <div class="u2">
                <h1>${elem.BookName+" " + elem.BookType}</h1>
                <h4> ${elem.Price}</h4>
            </div>
             </div> 
          </a>
            
      
          `
          })
          document.querySelector("#cent").innerHTML = clutter
  
        } else {
          console.log("no user");
          document.querySelector("#cent").innerHTML = "No Vehicles available of this Brand"
  
        }
        
      })
      .catch(function(err) {
        document.querySelector("#cent").innerHTML = "Search here"
        console.log(err);
  
  })
      }
    })
    console.log(document.querySelector("#se").value.length)
  }
  
  searchVehice();
