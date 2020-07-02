var SESSION_ID = $.cookie("userSession");
var sellingItems = []
var previousSellingItems = []

function saveSelling(sellingItems){
    //     console.log(producedItems)
    let apiPath = `${env}/api/updateSupplierItems`;
    let payload = JSON.stringify({
        sessionID: SESSION_ID,
        itemList: sellingItems
    });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
          console.info(data.Status);
            alert("Items updated successfully")
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
        sellingItems.push(checkbox.value)
    }else{
        const index = sellingItems.indexOf(checkbox.value);
        if (index > -2) {
            console.log("Removing " + checkbox.value)
          sellingItems.splice(index, 1);
        }
    }
}

function getSelling(){
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
            console.log(data[0].selling)
            for (const element of data[0].selling) {
                previousSellingItems.push(element)
            }
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
    for (const item of supplyList) {
        if(previousSellingItems.includes(item)){
            $("#itemList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
            document.getElementById(`CheckBox${item}`).click();
        }else{
            console.log(item + ": i dont see a match")
            $("#itemList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
        }
    }
}

getSelling()



