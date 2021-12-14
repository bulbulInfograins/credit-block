
$(document).ready(function () {




function detectQueryString() {
    var currentQueryString = window.location.search;

    if (currentQueryString) {
        var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('=');
        return sURLVariables[1];
    } else {
      return false;
    }


}



(function setRole(){
    role = detectQueryString();   
    $(".role_is").html(role);

    $(".login-btn").bind("click", function () {
         var email =  document.getElementById('exampleInputEmail1').value;
         var password = document.getElementById('exampleInputPassword1').value;

           if (email==="") {
              alert("Enter Email Address");
           }
           else if(password===""){
              alert("Enter Your Password");

           }
           else{
            var url = "chat.html?q=" + role;
            window.location.href = url;
           }
        });
     $("#role_is").html(role);
})();






});



$( "#chat-message" ).submit(function( event ) {
  
  event.preventDefault();
    
    var dt = new Date();
    var datetime = dt.getHours() + ":" + dt.getMinutes();
    // alert(datetime);
    var str = $(".chat-input").val();

    var $chatbox = $(".chat-list");

    $chatbox.animate({ scrollTop: ($('html').height())-($(window).height())}, 400);

    $chatbox.append(`

            <li class="sender">
                <div class="msg-bubble">
                  <p>${str}</p>
                  <div class="bubble-time text-right">${datetime}</div>
               </div>

            </li>
        `);

     $(".chat-input").val("");
});


$(".users-list li").click(function(){

    $(this).addClass("active").siblings().removeClass("active");
    let current_name =$(this).find('h6').text()
    
    if(current_name == "Gowtham"){
        $(".chat-list li").show();
    }   
    else{
        $(".chat-list li").hide();
    }

  
});

$('.search-icon').click(function () {
    $('.search').toggleClass('expanded');
});
