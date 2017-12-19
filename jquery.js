//global variables
var id = 0;
var unique_id;
var key = "9XXW62FAHTQ2DG2P";
var close_price;                  


// create a new portfolio in the container div
$(document).ready(function(){
    
    $("#btn_addP").click(function() {
       
        
        if($("#type_p_id").val() ){
          
            if($('.container').children().length <= 9){
                
                console.log();

                // creates a container div for portfolio
                create_div();
                //add portfolio to the container
                add_portfolio();
                //use user given name for portfolio
                portfolio_name();
                $("#type_p_id").val(""); //make the name input empty.
                
                unique_id ="";
                
            }
            else
                alert("Maximum 10 Portfolio allowed !!");

          }
        else
            alert("Please type a name first !!");
    });
    
});



// show and hide div for portfolio name input.
$(document).ready(function(){
        
                            
        $("#btn_slide").click(function() {
            
            $("#port_name").slideToggle();
        });
    
});


// delete the portfolio when user clicks delete
$(document).ready(function(){
    
    $(document).on("click", "#image" , function() {
        
    //var id = $(this).parent().find("#uniqueid_container").val(); 
         $(this).parent().parent().remove();
        
    });
        

    $(document).on("click", "#btn_addstock" , function() {
        
        unique_id = $(this).parent().parent().find("#p_head").find("#uniqueid_container").val();
        
        var count = $('#'+unique_id+' '+'#json-response'+' '+'tr').length;
        if(count <= 51)
            div_show();
        else
            alert("Only 50 Stock allowed !!");
    });
    
    
    $(document).on("click", "#submit" , function() {
        
        var sn = $(this).parent().find("#stock_name").val();
        var sq = $(this).parent().find("#stock_quantity").val();
        
        if(check_empty()){
            
            unit_value(sn.trim());  // find and set Unit price of a stock
            if(close_price != "error")
                insert_row(sn, close_price, sq);    //insert into row.
            

        }
                
    });
    
    
    $(document).on("click", "#btn_remove" , function() {
        
        var id = $(this).parent().parent().find("#p_head").find("#uniqueid_container").val()
        
        $("#"+id+" "+"#json-response").find('tbody').find('input[name="btn_radio"]').each(function(){
            	if($(this).is(":checked")){
                    $(this).parents("tr").remove();
                }
            });
    });
    
    
});


// insert row into table as user provide stock information.
function insert_row(name, value, qty){
    
    var table = $("#"+unique_id+" "+"#json-response");

    var row = "<tr><td>"+ name +"</td><td>" + value + "</td><td>" + qty + "</td><td>" + (value*qty).toFixed(2) + "</td><td><input type='radio' name='btn_radio'></td></tr>";
    
    $(table).find('tbody').append(row);
    
}




//Function to find latest stock price
function unit_value(s_name){
     
    $.ajax({
            async: false,
            url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+s_name+"&apikey="+key,
            success: function(json) {
                
                if(!json.hasOwnProperty("Error Message")){
                    
                    close_price = json["Time Series (Daily)"];
                    close_price = json["Time Series (Daily)"][Object.keys(close_price)[0]]["4. close"];
                }
                
                else{
                    alert("Invalid Stock Name !!");
                    close_price = "error";
                }
            },
                //if query fails
            error: function(xhr, textStatus, errorThrown){
                alert('Something is wrong, Server is not responding !');
                
            }
        });
    }
    
//$.get( "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+s_name+"&apikey="+key, function(data, status){
//    
//    close_price = data["Time Series (Daily)"];
//    close_price = data["Time Series (Daily)"][Object.keys(close_price)[0]]["4. close"];
//    console.log(close_price);
//    //return close_price;
//    
//}).fail(function(){
//            alert ("ops !! Server is not responding."); });
//        

// display user given portfolio name in portfolio
function portfolio_name(){
    
    $("#"+unique_id+" "+"#p_id").val($("#type_p_id").val());
    
    $("#"+unique_id+" "+"#uniqueid_container").val(unique_id);
}

// return a unique portfolio id
function unique_portfolio_id(){
    
    ++id;
    return "p"+id;
}

//creates a container div for portfolio to be added
function create_div(){
     
    unique_id = unique_portfolio_id();
    var div = document.createElement("div");
    
    div.setAttribute("class","portfolio");
    div.setAttribute("id", unique_id);
    //div.innerHTML = "Hello";

    $(div).appendTo(".container");
}



// add a new portfolio
function add_portfolio(){
    
    $( "<div class='p_head' id='p_head'> <!-- Currency and portfolio header container div --><label class='label'>ID: <input type='text' id='p_id' readonly></label><input id='uniqueid_container' type='hidden'><input type='button' id='btn_euro' value=&#8364Euro><input type='button' id='btn_dollar' value='$ Dollar'><img class='image' id='image' src='trash.png' alt='Trash Box' height='20' width='25'></div><div class='p_table' id='p_table'> <!--  table container div --><table id='json-response'><thead><tr>                            <th>Name</th><th>Unit Value</th><th>Quantity</th><th>Total Value</th><th>Select</th></tr></thead><tbody></tbody>    </table><br><p>Total Stock Value: </p></div><div class='p_buttons' id='p_buttons'> <!--  stock add, delete and graph button container div --><input type='button' id='btn_addstock' value='Add Stock'><input type='button' id='btn_graph' value='Show Graph'><input type='button' id='btn_remove' value='Remove Selected'></div>").appendTo("#"+unique_id);
    
    var table = $("#"+unique_id+" "+"#json-response");
    $(table).scrollTableBody;
    
}


// Validating Empty Field
function check_empty() {
    
    if (document.getElementById('stock_name').value == "" || document.getElementById('stock_quantity').value == "") {
        alert("Please fill all !");
        return false;
    } else {

    alert("Form Submitted Successfully...");

        document.getElementById("form").reset();
        return true;

    }
}

//Function To Display Popup
function div_show() {
       
    document.getElementById('popup_container').style.display = "block";
}


//Function to Hide Popup
function div_hide(){
document.getElementById('popup_container').style.display = "none";
    unique_id = "";
}

