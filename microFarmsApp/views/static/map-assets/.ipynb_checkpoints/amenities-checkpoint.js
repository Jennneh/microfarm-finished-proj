function populateField(){
    for (const item of supplyList) {
            $("#amenityList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
        }
    }

amenityList = ""

amenityItems = []

// function checkAddress(checkbox){
//     amenityList += item.value + ","
//     console.log(amenityList)
// }

function checkAddress(checkbox)
{
    if (checkbox.checked)
    {
        console.log("Adding " + checkbox.value)
        amenityItems.push(checkbox.value)
    }else{
        const index = amenityItems.indexOf(checkbox.value);
        if (index > -2) {
            console.log("Removing " + checkbox.value)
            amenityItems.splice(index, 1);

        }
    }
}




populateField()