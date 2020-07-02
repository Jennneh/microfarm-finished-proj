var SESSION_ID = $.cookie("userSession");
var buyingItems = []
var previousBuyingItems = []

function saveProduce(producedItems){
    //     console.log(producedItems)
    let apiPath = `${env}/api/updateBuyerItems`;
    let payload = JSON.stringify({
        sessionID: SESSION_ID,
        itemList: producedItems
    });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
          console.info(data.Status);
            alert("Produce updated successfully")
            location.reload()
        },
        error: function (err) {
          console.warn(`Error with: ${apiPath}`);
        },
    });
}

function checkAddress(checkbox)
{
    if (checkbox.checked)
    {
        console.log("Adding " + checkbox.value)
        buyingItems.push(checkbox.value)
    }else{
        const index = buyingItems.indexOf(checkbox.value);
        if (index > -2) {
            console.log("Removing " + checkbox.value)
          buyingItems.splice(index, 1);
        }
    }
}

function getBuying(){
    let apiPath = `${env}/api/getUserInfo`;
    let payload = JSON.stringify({
        sessionID: SESSION_ID,
    });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
//             console.log(data[0].buying)
            for (const element of data[0].buying) {
                previousBuyingItems.push(element)
            }
            console.log(previousBuyingItems)
            writeList()
        },
        error: function (err) {
          console.warn(`Error with: ${apiPath}`);
            writeList();

        },
    });
}

function writeList(){

// start populating the checkbox list, if the element we're iterating on is already in the existingItems field, check the box and move on, otherwise carry on
    for (const item of itemList) {
        if(previousBuyingItems.includes(item)){
            $("#produceList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
            document.getElementById(`CheckBox${item}`).click();
        }else{
            console.log("i dont see anything")
            $("#produceList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
        }
    }
}

getBuying()


