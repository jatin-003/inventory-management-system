$(document).ready(function () {
    $("#itemName, #openingStock, #uom").prop("disabled", true);
    $("#saveBtn, #editBtn").prop("disabled", true);
    $("#resetBtn").prop("disabled", false);

    $("#itemId").on("blur", handleItemIdCheck);
});

function resetForm(preserveId = false) {
    const id = $("#itemId").val();
    $("#itemForm")[0].reset();
    $("#itemName, #openingStock, #uom").prop("disabled", true);
    $("#saveBtn, #editBtn").prop("disabled", true);
    $("#resetBtn").prop("disabled", false);
    $("#itemId").prop("disabled", false);
    if (preserveId) $("#itemId").val(id);
}

function handleItemIdCheck() {
    const itemId = $("#itemId").val().trim();
    if (!itemId) return;

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        $("#itemName").val(data.ItemName);
        $("#openingStock").val(data.OpeningStock);
        $("#uom").val(data.UoM);
        $("#itemName, #openingStock, #uom").prop("disabled", false);
        $("#editBtn").prop("disabled", false);
        $("#saveBtn").prop("disabled", true);
        $("#itemId").prop("disabled", true);
    } else {
        $("#itemName, #openingStock, #uom").val("").prop("disabled", false);
        $("#saveBtn").prop("disabled", false);
        $("#editBtn").prop("disabled", true);
        $("#itemId").prop("disabled", true);
    }
}

function validateItemForm() {
    const id = $("#itemId").val().trim();
    const name = $("#itemName").val().trim();
    const stock = $("#openingStock").val().trim();
    const uom = $("#uom").val().trim();

    if (!id || !name || !stock || !uom) {
        alert("All fields are required.");
        return false;
    }

    const stockValue = parseFloat(stock);
    if (isNaN(stockValue) || stockValue < 0) {
        alert("Opening stock must be a valid non-negative number.");
        return false;
    }
    if (!/^\d{1,12}(.\d{1,3})?$/.test(stock)) {
        alert("Opening stock must be numeric, up to 12 digits before decimal and 3 digits after decimal.");
        return false;
    }


    if (uom.length > 10) {
        alert("Unit of Measurement must be up to 10 characters.");
        return false;
    }

    return true;
}

function saveItem() {
    if (!validateItemForm()) return;

    const openingStock = parseFloat($("#openingStock").val().trim());

    const itemData = {
        ItemID: $("#itemId").val().trim(),
        ItemName: $("#itemName").val().trim(),
        OpeningStock: openingStock,
        ItemsReceived: 0,   
        ItemsIssued: 0,    
        AvailableStock: openingStock, 
        UoM: $("#uom").val().trim()
    };

    const putReq = createPUTRequest(TOKEN, JSON.stringify(itemData), DB_NAME, ITEMS_REL);

    jQuery.ajaxSetup({ async: false });
    const result = executeCommandAtGivenBaseUrl(putReq, JPDB_BASE_URL, "/api/iml");
    jQuery.ajaxSetup({ async: true });

    if (result.status === 200) {
        alert("Item saved successfully.");
        resetForm();
    } else {
        alert("Failed to save item: " + (result.message || JSON.stringify(result)));
        console.error(result);
    }
}

function editItem() {
    if (!validateItemForm()) return;

    const itemId = $("#itemId").val().trim();
    const newOpeningStock = parseFloat($("#openingStock").val().trim());

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data);
        const existingRecord = data.record;
        const rec_no = data.rec_no;

        const updatedItem = {
            ItemID: itemId,
            ItemName: $("#itemName").val().trim(),
            OpeningStock: newOpeningStock,
            ItemsReceived: existingRecord.ItemsReceived || 0, 
            ItemsIssued: existingRecord.ItemsIssued || 0,     
            AvailableStock: newOpeningStock + (existingRecord.ItemsReceived || 0) - (existingRecord.ItemsIssued || 0),
            UoM: $("#uom").val().trim()
        };

        const updateReq = createUPDATERecordRequest(TOKEN, JSON.stringify(updatedItem), DB_NAME, ITEMS_REL, rec_no);

        jQuery.ajaxSetup({ async: false });
        const updateResult = executeCommandAtGivenBaseUrl(updateReq, JPDB_BASE_URL, "/api/iml");
        jQuery.ajaxSetup({ async: true });

        if (updateResult.status === 200) {
            alert("Item updated successfully.");
            resetForm();
        } else {
            alert("Failed to update item: " + (updateResult.message || JSON.stringify(updateResult)));
            console.error(updateResult);
        }
    } else {
        alert("Item not found for update. Please ensure the Item ID exists.");
        console.error(getResult);
    }
}