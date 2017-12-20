//global variables
var id = 0;
var unique_id; // holds unique id for each portfolio
var key = "9XXW62FAHTQ2DG2P";   //API key
var close_price;    //holds close price for a stock grabbed from API
var sum;  //holds sum


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
                
                //after portfolio created make the name input empty.
                $("#type_p_id").val(""); 
                
                unique_id =""; // make unique portfolio id empty
                
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
 
    
// Show the form to add stock in the portfolio    
    $(document).on("click", "#btn_addstock" , function() {
        
        unique_id = $(this).parent().parent().find("#p_head").find("#uniqueid_container").val();
        
        var count = $('#'+unique_id+' '+'#json-response'+' '+'tr').length;
        if(count <= 51)
            div_show();
        else
            alert("Only 50 Stock allowed !!");
    });
 
    
    
//user submit to add stock into portfolio table, show sum of total value and store in localstorage    
    $(document).on("click", "#submit" , function() {
        
        var sn = $(this).parent().find("#stock_name").val();
        var sq = $(this).parent().find("#stock_quantity").val();
        var p_id = $("#"+unique_id+" "+"#p_id").val();

        
        if(check_empty()){
            
            unit_value(sn.trim());  // find and set Unit price of a stock
            
            if(close_price != "error"){
                insert_row(sn, close_price, sq);    //insert into table.
                
                calculateTotal(3);  //Sum of stock value and display
                
                // store in localstorage
                store_in_localstorage(p_id);
            }

        }
                
    });
    
// Function that delete selected stock in portfolio.    
    $(document).on("click", "#btn_remove" , function() {
         
        unique_id = $(this).parent().parent().find("#p_head").find("#uniqueid_container").val();
        
        $("#"+unique_id+" "+"#json-response").find('tbody').find('input[name="btn_radio"]').each(function(){
            	if($(this).is(":checked")){
                    $(this).parents("tr").remove();
                }
            });
        
        calculateTotal(3); //sum the portfolio value again
        
    });
    
    
});


// Function to calculate total stock value in a portfolio
function calculateTotal(index)
{
    sum = 0;
    //console.log(unique_id);
    
    $("#"+unique_id+" "+"#p_table").find('table tr').each(function()
    {
        var value = parseFloat($('td', this).eq(index).text());
        if (!isNaN(value))
        {
            sum += value;
        }
    });
    
    //console.log(sum);
    //console.log(unique_id);
    $("#"+unique_id+" "+"#p_table").find('p strong').text("Total Stock Value: "+ sum.toFixed(2));
    
    //sum =0;
}



// insert row into table as user provide stock information.
function insert_row(name, value, qty){
    var aray = merge_stock(name, value, qty);
    console.log(aray.length);
    if(Boolean(aray[3]))
    {
        make_row(aray[0], aray[1], aray[2]);
        alert("Stock Exist. Information updated !!");
    }
    else{
        make_row(name, value, qty);
        
        }
       
}

function make_row(name, value, qty){
    
    var table = $("#"+unique_id+" "+"#json-response");

    var row = "<tr><td>"+ name +"</td><td>" + value + "</td><td>" + qty + "</td><td>" + (value*qty).toFixed(2) + "</td><td><input type='radio' name='btn_radio'></td></tr>";
    
    $(table).find('tbody').append(row);
    
}

function merge_stock(name, value, qtt){
    
    var rows = $("#"+unique_id+" "+"#p_table").find('table tbody tr');
    var unitvalue= parseFloat(value);
    var qty=parseInt(qtt);
    var flag=0;
    
    rows.each(function()
    {
        
        if(name == $('td', this).eq(0).text().trim())
        {
            unitvalue += parseFloat($('td', this).eq(1).text().trim());
            unitvalue = unitvalue/2;
            qty +=  parseInt($('td', this).eq(2).text().trim());
            //total = parseFloat(unitvalue*qty);
            
            $(this).remove();
            flag =1;
          
        }  
        
    });
    
    var array = [name, unitvalue, qty, flag];
    return array;
}

//store portfolio information in localstorage
function store_in_localstorage(id){
    
    //var length = $("#"+unique_id+" "+"#p_table").find('table tbody tr').length;
    //console.log(length);
    
    var array = [];
    
    $("#"+unique_id+" "+"#p_table").find('table tbody tr').each(function()
    {
        
        var stock_name = $('td', this).eq(0).text().trim();
        var unitvalue = $('td', this).eq(1).text().trim();
        var qty = $('td', this).eq(2).text().trim();
        var total = parseFloat($('td', this).eq(3).text());
        
        
            var obj1 = new Object();
            obj1["unit_price"] = unitvalue;
            obj1["quantity"] = qty;
            obj1["total"] = total;
        
            var obj2 = new Object();
            obj2[stock_name] = obj1;


            array.push(obj2);

            

    });

    
    var myjson = JSON.stringify(array);
            //console.log(myjson);
        
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem(id, myjson);
        }
    else
        alert("Brwser doesn't support web storage !!");

        console.log(localStorage.getItem(id));
//    array.forEach( function (arrayItem)
//{
//    var x = arrayItem.hasOwnProperty("NOK");
//        console.log(x);
//});
    

}


//Function to find latest stock price
function unit_value(s_name){
     
    //close_price ="";
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
                close_price = "error";
                
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
    
    $( "<div class='p_head' id='p_head'> <!-- Currency and portfolio header container div --><label class='label'>ID: <input type='text' id='p_id' readonly></label><input id='uniqueid_container' type='hidden'><input type='button' id='btn_euro' value=&#8364Euro><input type='button' id='btn_dollar' value='$ Dollar'><img class='image' id='image' src='trash.png' alt='Trash Box' height='20' width='25'></div><div class='p_table' id='p_table'> <!--  table container div --><table id='json-response'><thead><tr>                            <th>Name</th><th>Unit Value</th><th>Quantity</th><th>Total Value</th><th>Select</th></tr></thead><tbody></tbody>    </table><p><strong>Total Stock Value: </strong></p></div><div class='p_buttons' id='p_buttons'> <!--  stock add, delete and graph button container div --><input type='button' id='btn_addstock' value='Add Stock'><input type='button' id='btn_graph' value='Show Graph'><input type='button' id='btn_remove' value='Remove Selected'></div>").appendTo("#"+unique_id);
    
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
    $(".port_name").children().prop('disabled',true);
    $(".p_buttons").children().prop('disabled',true);
    
}


//Function to Hide Popup
function div_hide(){
    
    document.getElementById('popup_container').style.display = "none";
    $(".port_name").children().prop('disabled',false);
    $(".p_buttons").children().prop('disabled',false);
    //unique_id = "";
}

