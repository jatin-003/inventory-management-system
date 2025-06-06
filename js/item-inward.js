$(document).ready(function () {
    $("#receiptDate, #inwardItemId, #inwardQty").prop("disabled", true);
    $("#inwardSaveBtn, #inwardEditBtn").prop("disabled", true);
    $("#inwardResetBtn").prop("disabled", false); 

    $("#receiptNo").on("blur", handleReceiptNoCheck);
    $("#inwardItemId").on("blur", handleInwardItemIdCheck);
    $("#receiptDate").on("change", validateReceiptDate);
});

function resetInwardForm(preserveReceiptNo = false) {
    const receiptNo = $("#receiptNo").val();
    $("#inwardForm")[0].reset();
    $("#receiptDate, #inwardItemId, #inwardQty").prop("disabled", true);
    $("#inwardSaveBtn, #inwardEditBtn").prop("disabled", true);
    $("#inwardResetBtn").prop("disabled", false);
    $("#receiptNo").prop("disabled", false);
    $("#inwardItemNameDisplay").text("");
    $("#receiptDate").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    $("#inwardItemId").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    $("#inwardQty").removeClass("is-invalid").siblings(".invalid-feedback").text("");

    if (preserveReceiptNo) $("#receiptNo").val(receiptNo);
}

function handleReceiptNoCheck() {
    const receiptNo = $("#receiptNo").val().trim();
    if (!receiptNo) {
        resetInwardForm(); 
        return;
    }

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, INWARD_REL, JSON.stringify({ ReceiptNo: receiptNo }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        $("#receiptDate").val(data.ReceiptDate);
        $("#inwardItemId").val(data.ItemID);
        $("#inwardQty").val(data.QtyReceived);

        $("#receiptDate, #inwardItemId, #inwardQty").prop("disabled", false);
        $("#inwardEditBtn").prop("disabled", false);
        $("#inwardSaveBtn").prop("disabled", true);
        $("#receiptNo").prop("disabled", true);
        loadItemNameForInward(data.ItemID);
    } else {
        $("#receiptDate, #inwardItemId, #inwardQty").val("").prop("disabled", false);
        $("#inwardSaveBtn").prop("disabled", false);
        $("#inwardEditBtn").prop("disabled", true);
        $("#receiptNo").prop("disabled", true);
        $("#inwardItemNameDisplay").text("");
        validateReceiptDate();
    }
}

function handleInwardItemIdCheck() {
    const itemId = $("#inwardItemId").val().trim();
    const itemIdInput = $("#inwardItemId");
    const itemIdError = $("#inwardItemIdError");
    const itemNameDisplay = $("#inwardItemNameDisplay");

    if (!itemId) {
        itemNameDisplay.text("");
        itemIdInput.removeClass("is-invalid");
        itemIdError.text("");
        return;
    }

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        itemNameDisplay.text(`Item Name: ${data.ItemName}`);
        itemIdInput.removeClass("is-invalid");
        itemIdError.text("");
    } else {
        itemNameDisplay.text("");
        itemIdInput.addClass("is-invalid");
        itemIdError.text("Item not present");
        $("#inwardItemId").focus();
    }
}

function validateReceiptDate() {
    const receiptDateInput = $("#receiptDate");
    const receiptDateError = $("#receiptDateError");
    const today = new Date().toISOString().split('T')[0]; 

    if (receiptDateInput.val() > today) {
        receiptDateInput.addClass("is-invalid");
        receiptDateError.text("Receipt Date cannot be a future date.");
        return false;
    } else {
        receiptDateInput.removeClass("is-invalid");
        receiptDateError.text("");
        return true;
    }
}

function validateInwardForm() {
    let isValid = true;

    const receiptNo = $("#receiptNo").val().trim();
    const receiptDate = $("#receiptDate").val().trim();
    const itemId = $("#inwardItemId").val().trim();
    const qty = $("#inwardQty").val().trim();

    if (!receiptNo || !receiptDate || !itemId || !qty) {
        alert("All fields are required.");
        isValid = false;
    }

    if (!validateReceiptDate()) {
        isValid = false;
    }

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));
    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status !== 200) {
        $("#inwardItemId").addClass("is-invalid").siblings(".invalid-feedback").text("Item not present");
        $("#inwardItemId").focus();
        isValid = false;
    } else {
        $("#inwardItemId").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    }

    if (isNaN(parseFloat(qty)) || parseFloat(qty) <= 0) {
        $("#inwardQty").addClass("is-invalid").siblings(".invalid-feedback").text("Quantity must be a positive number.");
        isValid = false;
    } else {
        $("#inwardQty").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    }

    return isValid;
}

function loadItemNameForInward(itemId) {
    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));
    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        $("#inwardItemNameDisplay").text(`Item Name: ${data.ItemName}`);
    } else {
        $("#inwardItemNameDisplay").text("Item not found!");
    }
}


function saveInward() {
    if (!validateInwardForm()) return;

    const inwardData = {
        ReceiptNo: $("#receiptNo").val().trim(),
        ReceiptDate: $("#receiptDate").val().trim(),
        ItemID: $("#inwardItemId").val().trim(),
        QtyReceived: parseFloat($("#inwardQty").val().trim())
    };

    const putReq = createPUTRequest(TOKEN, JSON.stringify(inwardData), DB_NAME, INWARD_REL);

    jQuery.ajaxSetup({ async: false });
    const result = executeCommandAtGivenBaseUrl(putReq, JPDB_BASE_URL, "/api/iml");
    jQuery.ajaxSetup({ async: true });

    if (result.status === 200) {
        if (updateItemStock(inwardData.ItemID, inwardData.QtyReceived, 'received')) {
            alert("Inward entry saved and stock updated successfully.");
            resetInwardForm();
        } else {
            alert("Inward entry saved, but failed to update item stock.");
        }
    } else {
        alert("Failed to save inward entry: " + (result.message || JSON.stringify(result)));
        console.error(result);
    }
}

function editInward() {
    if (!validateInwardForm()) return;

    const receiptNo = $("#receiptNo").val().trim();
    const itemId = $("#inwardItemId").val().trim();
    const newQtyReceived = parseFloat($("#inwardQty").val().trim());

    const getOldReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, INWARD_REL, JSON.stringify({ ReceiptNo: receiptNo }));
    jQuery.ajaxSetup({ async: false });
    const getOldResult = executeCommandAtGivenBaseUrl(getOldReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getOldResult.status !== 200) {
        alert("Could not retrieve old inward record for editing.");
        return;
    }

    const oldRecord = JSON.parse(getOldResult.data).record;
    const oldQtyReceived = oldRecord.QtyReceived;
    const rec_no = JSON.parse(getOldResult.data).rec_no;

    const inwardData = {
        ReceiptNo: receiptNo,
        ReceiptDate: $("#receiptDate").val().trim(),
        ItemID: itemId,
        QtyReceived: newQtyReceived
    };

    const updateReq = createUPDATERecordRequest(TOKEN, JSON.stringify(inwardData), DB_NAME, INWARD_REL, rec_no);

    jQuery.ajaxSetup({ async: false });
    const updateResult = executeCommandAtGivenBaseUrl(updateReq, JPDB_BASE_URL, "/api/iml");
    jQuery.ajaxSetup({ async: true });

    if (updateResult.status === 200) {
        const qtyDifference = newQtyReceived - oldQtyReceived;
        if (updateItemStock(itemId, qtyDifference, 'received')) { 
            alert("Inward entry updated and stock adjusted successfully.");
            resetInwardForm();
        } else {
            alert("Inward entry updated, but failed to adjust item stock.");
        }
    } else {
        alert("Failed to update inward entry: " + (updateResult.message || JSON.stringify(updateResult)));
        console.error(updateResult);
    }
}