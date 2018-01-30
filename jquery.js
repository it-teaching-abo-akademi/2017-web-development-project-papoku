//global variables
var id = 0;
var unique_id; // holds unique id for each portfolio
var key = "9XXW62FAHTQ2DG2P";   //API key
var close_price;    //holds close price for a stock grabbed from API
var sum;  //holds sum
var date = [];
var cp = [];
var status = 0;
var myChart;




// create a new portfolio in the container div
$(document).ready(function(){
    
    $("#btn_addP").click(function() {
        
        if($("#type_p_id").val() ){
          
            if($('.container').children().length <= 9){
                
                //console.log();

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
    
    
// Convert prices to Euro when user clicks euro button    
    $(document).on("click", "#btn_euro" , function() {
        
        unique_id = $(this).parent().find("#uniqueid_container").val();
        var row = $(this).parent().parent().find("#json-response");
        $('th', row.find("thead")).eq(1).text('Unit value \u20ac');
        $('th', row.find("thead")).eq(3).text('Total value \u20ac');
        
    //function to convert from  dollar to euro
        currency_conversion(this, "USD", "EUR", row);
        
        calculateTotal(3);
        $(this).attr("disabled", "disabled");
        $(this).parent().find("#btn_dollar").removeAttr("disabled");
    });
    
    
// Convert prices to dollar($) when user clicks dollar button     
    $(document).on("click", "#btn_dollar" , function() {
        
        var row = $(this).parent().parent().find("#json-response");
        $('th', row).eq(1).text('Unit value $');
        $('th', row).eq(3).text('Total value $');
    
    //function to convert from euro to dollar
        currency_conversion(this, "EUR", "USD", row);
        
        calculateTotal(3);
        $(this).parent().find("#btn_euro").removeAttr("disabled");
        $(this).attr("disabled", "disabled");
        //exchange_rate_request_from_API("EUR","USD");
        
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


    
    
// Show the historical comparison of stock.    
    $(document).on("click", "#btn_graph" , function() {
        
        var parent = $(this).parent().parent().find("#p_head");
        
        unique_id = parent.find("#uniqueid_container").val();
        var portfolio_id = parent.find("#p_id").val();
        
        console.log(portfolio_id);
        
        graph_data_request(portfolio_id);
        
        
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
    
// Function that delete selected stock from portfolio.    
    $(document).on("click", "#btn_remove" , function() {
         
        unique_id = $(this).parent().parent().find("#p_head").find("#uniqueid_container").val();
        
        var rows = $("#"+unique_id+" "+"#json-response").find('tbody tr');
    
        if(rows.length>0)
        {
            rows.find('input[name="btn_radio"]').each(function(){
                    if($(this).is(":checked")){
                        $(this).parents("tr").remove();
                    }
                });

            calculateTotal(3); //sum the portfolio value again
        }
        
    });
    
    
    $(document).on('change', '#stock_list ul li :checkbox', function(){
    
        
        var id = $("#"+unique_id+" "+"#p_id").val();
        
        var start_date = $("#graph_range #graph_date_start").val();
        
        var end_date = $("#graph_range #graph_date_end").val();
        
        
        var value = check_valid_dates(start_date, end_date);
        console.log("value: "+value);
        if(value == 0 )
        {
            
            //alert("Please provide valid dates and fill or clear both!!");
            start_date = "undefined";
            end_date = "undefined";
            update_chart_from_selected_stock_list(id, start_date, end_date);
        }
        else if(value == 1)
        { 
            alert("Please provide valid dates or clear both!!");
        }
        else if(value == 2)
        {
            update_chart_from_selected_stock_list(id, start_date, end_date);
        }
        
    });
    
    
    $(document).on("click", "#graph_header #close_graph" , function() {
        
        hide_graph_div();
        console.log("close fired");

        document.getElementById("graph_date_start").value = "";
        document.getElementById("graph_date_end").value = "";
        
        
    });
    
    
    $(document).on("click", "#graph_range #btn_update" , function() {
        
       var start_date = $("#graph_range #graph_date_start").val();
        
        var end_date = $("#graph_range #graph_date_end").val();;
        
        console.log(check_valid_dates(start_date, end_date));
        
        if(check_valid_dates(start_date, end_date)!= 2)
        {
            alert("Please provide valid dates and fill both !!");
        }
        else
        {
            var id = $("#"+unique_id+" "+"#p_id").val();
            console.log(start_date+ end_date+" event fired");
            update_chart_from_selected_stock_list(id, start_date, end_date);
            
        }
            
        
    });
    
    
});



//function to check for valid dates
function check_valid_dates(start_date, end_date){
    
    if(!start_date || !end_date)
        return 0;
    
    start_date = new Date(start_date).getTime();
    end_date = new Date(end_date).getTime();
    console.log(start_date+end_date);
    
    if(start_date > end_date)
    {
        return 1;
    }
    else
        return 2;
}




// add stock list into graph from portfolio
function load_stocklist_into_graph(row){
    
    var stock_name = $('td', row).eq(0).text().trim();
    
    var li = $(document.createElement( 'li' ));
    
    var chkbox = $(document.createElement( 'input' )).attr({ type: 'checkbox', id: stock_name, name:'chkbox'}).prop('checked', true).addClass("chk");
    
    var label = $('<label/>').attr({ for: stock_name}).text(stock_name);
    li.append(chkbox, label);
     
    $('#stock_list').find('ul').append(li);
    
}



// main function that creates graph, grab data from API and update into chart.
function graph_data_request(portfolio_id){
      
        var rows = $("#"+unique_id+" "+"#json-response").find('tbody tr');
        //console.log(rows.length);
    
        if(rows.length>0)
        {   
            
            $('#stock_list').find('ul').empty();
            rows.each(function(){

                var stock_name = $('td', this).eq(0).text().trim();
                
                load_stocklist_into_graph(this);

            });
            
            show_graph_div();
            var string = "undefined";
            update_chart_from_selected_stock_list(portfolio_id, string, string);
            
        }
        else
            alert("Please add some stock first !!");
    
}


// Update the graph for user selected stock from the stock list in graph.
function update_chart_from_selected_stock_list(portfolio_id, start_date, end_date){ 
    
    var mychart = create_graph(portfolio_id);
            
            if(status == 0)
            {
               mychart = create_graph(portfolio_id);
            }
    
    var list = $("#stock_list").find('ul li');
            
            list.find('input[name="chkbox"]').each(function(){
                
                    if($(this).is(":checked"))
                    {
                        var name = $(this).attr('id'); 
                        var data_set = graph_API_request(name, start_date, end_date);
                        mychart.data.datasets.push(data_set);
                        mychart.update();
                    }
                
            });
    
}



//Function to update stock prices into chart from API
function graph_API_request(s_name, start_date, end_date){
    
    var dataset;
    
     $.ajax({
            async: false,
            url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+s_name+"&apikey="+key,
            success: function(json) {
                
                if(!json.hasOwnProperty("Error Message"))
                {
                    
                    var data = json["Time Series (Daily)"];
                    
                    if(start_date && end_date != "undefined" )
                    {
                        start_date = new Date(start_date).getTime();
                        end_date = new Date(end_date).getTime();
                    }
                    
                    for (const prop in data)
                    {    
                        var api_date = new Date(prop).getTime();
                        
                        if(start_date && end_date != "undefined")
                        {
                      
                            if(start_date <= api_date && end_date >= api_date)
                            {
                                var price = data[prop]['4. close'];
                                cp.push(price);
                                date.push(prop);
                                
                            }
                            else
                                {
                                
                                }
                                
                        }
                        else
                        {
                            var price = data[prop]['4. close'];
                            cp.push(price);
                            date.push(prop);
                            
                        }
                    }
                    
                    cp.reverse();
                    date.reverse();
                    dataset = create_new_graph_dataset(s_name, cp);
                    
                
                }
                
                else{
                    alert("Invalid Stock Name !!");
                }
            },
                //if query fails
            error: function(xhr, textStatus, errorThrown){
                alert('Something is wrong, Server is not responding !');
                close_price = "error";
                
            }
        });
    
    cp = [];
    date = [];
    return dataset;
    
}

//Push new dataset for a stock into graph
function create_new_graph_dataset(name, data){
    
    var dataset = {
            label: name,
            data: data,
            borderColor:randomColors(),
            borderWidth: 2,
            fill: false
}
    
return dataset;    
}




// creata a blank graph
function create_graph(portfolio_id){
    
    $("#graph_header").find('p strong').text("Portfolio "+portfolio_id+" Performance $");
    var ctx = document.getElementById("myChart").getContext('2d');
    
    //console.log(typeof(myChart));
    
    if(status == 0)
    {
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: date,
                datasets: []
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }

                    }],
                  xAxes: [{
                        ticks: {
                            beginAtZero:true
                        }

                    }]
                },
                
                title: {
                    display: true,
                    text: 'Price History Chart (Max 3 months)'
                }
            }
        });
        
        
        status = 1;
        //console.log("out of destroy");
        return myChart;
        
    }
    else {
        myChart.destroy();
        status = 0;
        return 0;
    }


}


// function that return random color for each stock to be represented in graph
var randomColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}




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
    else
    {
        make_row(name, value, qty);    
    }
       
}


// function that makes row in stock table with stock details
function make_row(name, value, qty){
    
    var button_status = $("#"+unique_id+" "+"#p_head").find('#btn_euro').is(':disabled');
    console.log(button_status);
    var table = $("#"+unique_id+" "+"#json-response");
    
    if(button_status)
    {
        var rate = exchange_rate_request_from_API("USD", "EUR");
        
        var row = "<tr><td>"+ name +"</td><td>" + (value*rate).toFixed(4) + "</td><td>" + qty + "</td><td>" + (value*rate*qty).toFixed(2) + "</td><td><input type='radio' name='btn_radio'></td></tr>";

        $(table).find('tbody').append(row);
        console.log("showing in Euro");
    }
    else
    {
        var row = "<tr><td>"+ name +"</td><td>" + value + "</td><td>" + qty + "</td><td>" + (value*qty).toFixed(2) + "</td><td><input type='radio' name='btn_radio'></td></tr>";

        $(table).find('tbody').append(row);
    }
    
}




// While adding new stock, merge price, quantity if it already exists in the portfolio
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
            
        
    if (typeof(Storage) !== "undefined")
    {
        localStorage.setItem(id, myjson);
    }
    else
        alert("Brwser doesn't support web storage !!");
 

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
                close_price = "error";
                
            }
        });
    }
    



//Function to convert stock between dollar and euro.
function currency_conversion(currency_button, currency_from, currency_to, row){
        
        var rate = exchange_rate_request_from_API(currency_from, currency_to);
        
        row.find('tbody tr').each(function (){
            
            var unit_value = $('td', this).eq(1).text().trim();
            var quantity = $('td', this).eq(2).text().trim();
            
            $('td', this).eq(1).text((unit_value*rate).toFixed(2));
            $('td', this).eq(3).text((quantity*(unit_value*rate)).toFixed(2));
            
        });
    
}





//API request for stcok in graph
function exchange_rate_request_from_API(currency_from, currency_to){
    
    var data;
     
    $.ajax({
         
            async: false,
            url: "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="+currency_from+"&to_currency="+currency_to+"&apikey=9XXW62FAHTQ2DG2P",
            success: function(json) {
                
                if(!json.hasOwnProperty("Error Message"))
                {
                    
                    data = json["Realtime Currency Exchange Rate"];
                    data = data["5. Exchange Rate"];
                    console.log(data);
                    
                
                }
                
                else
                {
                    alert("Please check URL and currency name !!");
                }
                
            },
                //if query fails
            error: function(xhr, textStatus, errorThrown){
                alert('Something is wrong, Server is not responding !');
                
            }
        });
    
    return data;
    
}



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
    
    $( "<div class='p_head' id='p_head'> <!-- Currency and portfolio header container div --><label class='label'>ID: <input type='text' id='p_id' readonly></label><input id='uniqueid_container' type='hidden'><input type='button' id='btn_euro' value='\u20ac Euro'><input type='button' id='btn_dollar' value='$ Dollar' disabled><img class='image' id='image' src='trash.png' alt='Trash Box' height='20' width='25'></div><div class='p_table' id='p_table'> <!--  table container div --><table id='json-response'><thead><tr>                            <th>Name</th><th>Unit Value $</th><th>Quantity</th><th>Total Value $</th><th>Select</th></tr></thead><tbody></tbody>    </table><p><strong>Total Stock Value: </strong></p></div><div class='p_buttons' id='p_buttons'> <!--  stock add, delete and graph button container div --><input type='button' id='btn_addstock' value='Add Stock'><input type='button' id='btn_graph' value='Show Graph'><input type='button' id='btn_remove' value='Remove Selected'></div>").appendTo("#"+unique_id);
    
    var table = $("#"+unique_id+" "+"#json-response");
    $(table).scrollTableBody;
    
}


// Validating Empty Field
function check_empty() {
    
    if (document.getElementById('stock_name').value == "" || document.getElementById('stock_quantity').value == "") 
    {
        alert("Please fill all !");
        return false;
    } 
    else 
    {


        document.getElementById("form").reset();
        return true;

    }
}



// function that shows graph when user clicks to show graph
function show_graph_div(){
    document.getElementById('graph_container').style.display = "block";
}



//function that hides the graph from user
function hide_graph_div(){
    document.getElementById('graph_container').style.display = "none";
}


//Function To Display Popup form
function div_show() {
       
    document.getElementById('popup_container').style.display = "block";
    $(".port_name").children().prop('disabled',true);
    $(".p_buttons").children().prop('disabled',true);
    
}


//Function to Hide Popup form
function div_hide(){
    
    document.getElementById('popup_container').style.display = "none";
    $(".port_name").children().prop('disabled',false);
    $(".p_buttons").children().prop('disabled',false);
    //unique_id = "";
}

