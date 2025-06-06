let currentAvailableStock = 0; 

$(document).ready(function () {
    $("#issueDate, #outwardItemId, #outwardQty").prop("disabled", true);
    $("#outwardSaveBtn, #outwardEditBtn").prop("disabled", true);
    $("#outwardResetBtn").prop("disabled", false); 

    $("#issueNo").on("blur", handleIssueNoCheck);
    $("#outwardItemId").on("blur", handleOutwardItemIdCheck);
    $("#issueDate").on("change", validateIssueDate);
    $("#outwardQty").on("input", validateOutwardQuantity);
});

function resetOutwardForm(preserveIssueNo = false) {
    const issueNo = $("#issueNo").val();
    $("#outwardForm")[0].reset();
    $("#issueDate, #outwardItemId, #outwardQty").prop("disabled", true);
    $("#outwardSaveBtn, #outwardEditBtn").prop("disabled", true);
    $("#outwardResetBtn").prop("disabled", false);
    $("#issueNo").prop("disabled", false);
    $("#outwardItemNameDisplay").text("");
    $("#availableStockDisplay").text("");
    currentAvailableStock = 0; 
    $("#issueDate").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    $("#outwardItemId").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    $("#outwardQty").removeClass("is-invalid").siblings(".invalid-feedback").text("");

    if (preserveIssueNo) $("#issueNo").val(issueNo);
}

function handleIssueNoCheck() {
    const issueNo = $("#issueNo").val().trim();
    if (!issueNo) {
        resetOutwardForm(); 
        return;
    }

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, OUTWARD_REL, JSON.stringify({ IssueNo: issueNo }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        $("#issueDate").val(data.IssueDate);
        $("#outwardItemId").val(data.ItemID);
        $("#outwardQty").val(data.QtyIssued);

        $("#issueDate, #outwardItemId, #outwardQty").prop("disabled", false);
        $("#outwardEditBtn").prop("disabled", false);
        $("#outwardSaveBtn").prop("disabled", true);
        $("#issueNo").prop("disabled", true);
        loadItemDetailsForOutward(data.ItemID);
        validateOutwardQuantity();
    } else {
        $("#issueDate, #outwardItemId, #outwardQty").val("").prop("disabled", false);
        $("#outwardSaveBtn").prop("disabled", false);
        $("#outwardEditBtn").prop("disabled", true);
        $("#issueNo").prop("disabled", true);
        $("#outwardItemNameDisplay").text("");
        $("#availableStockDisplay").text("");
        currentAvailableStock = 0; 
        validateIssueDate();
    }
}

function handleOutwardItemIdCheck() {
    const itemId = $("#outwardItemId").val().trim();
    const itemIdInput = $("#outwardItemId");
    const itemIdError = $("#outwardItemIdError");
    const itemNameDisplay = $("#outwardItemNameDisplay");
    const availableStockDisplay = $("#availableStockDisplay");

    if (!itemId) {
        itemNameDisplay.text("");
        availableStockDisplay.text("");
        itemIdInput.removeClass("is-invalid");
        itemIdError.text("");
        currentAvailableStock = 0;
        return;
    }

    loadItemDetailsForOutward(itemId);
}

function loadItemDetailsForOutward(itemId) {
    const itemIdInput = $("#outwardItemId");
    const itemIdError = $("#outwardItemIdError");
    const itemNameDisplay = $("#outwardItemNameDisplay");
    const availableStockDisplay = $("#availableStockDisplay");

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));

    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status === 200) {
        const data = JSON.parse(getResult.data).record;
        itemNameDisplay.text(`Item Name: ${data.ItemName}`);
        currentAvailableStock = parseFloat(data.AvailableStock || 0); 
        availableStockDisplay.text(`Available Stock: ${currentAvailableStock}`);
        itemIdInput.removeClass("is-invalid");
        itemIdError.text("");
        validateOutwardQuantity(); 
    } else {
        itemNameDisplay.text("");
        availableStockDisplay.text("");
        itemIdInput.addClass("is-invalid");
        itemIdError.text("Item not present");
        $("#outwardItemId").focus();
        currentAvailableStock = 0; 
    }
}

function validateIssueDate() {
    const issueDateInput = $("#issueDate");
    const issueDateError = $("#issueDateError");
    const today = new Date().toISOString().split('T')[0]; 

    if (issueDateInput.val() > today) {
        issueDateInput.addClass("is-invalid");
        issueDateError.text("Issue Date cannot be a future date.");
        return false;
    } else {
        issueDateInput.removeClass("is-invalid");
        issueDateError.text("");
        return true;
    }
}

function validateOutwardQuantity() {
    const qtyInput = $("#outwardQty");
    const qtyError = $("#outwardQtyError");
    const quantity = parseFloat(qtyInput.val().trim());

    if (isNaN(quantity) || quantity <= 0) {
        qtyInput.addClass("is-invalid");
        qtyError.text("Quantity must be a positive number.");
        return false;
    } else if (quantity > currentAvailableStock) {
        qtyInput.addClass("is-invalid");
        qtyError.text(`Quantity entered is more than available (Current: ${currentAvailableStock}).`);
        return false;
    } else {
        qtyInput.removeClass("is-invalid");
        qtyError.text("");
        return true;
    }
}


function validateOutwardForm() {
    let isValid = true;

    const issueNo = $("#issueNo").val().trim();
    const issueDate = $("#issueDate").val().trim();
    const itemId = $("#outwardItemId").val().trim();
    const qty = $("#outwardQty").val().trim();

    if (!issueNo || !issueDate || !itemId || !qty) {
        alert("All fields are required.");
        isValid = false;
    }

    if (!validateIssueDate()) {
        isValid = false;
    }

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));
    jQuery.ajaxSetup({ async: false });
    const getResult = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getResult.status !== 200) {
        $("#outwardItemId").addClass("is-invalid").siblings(".invalid-feedback").text("Item not present");
        $("#outwardItemId").focus();
        isValid = false;
    } else {
        currentAvailableStock = parseFloat(JSON.parse(getResult.data).record.AvailableStock || 0);
        $("#outwardItemId").removeClass("is-invalid").siblings(".invalid-feedback").text("");
    }

    if (!validateOutwardQuantity()) { 
        isValid = false;
    }

    return isValid;
}


function saveOutward() {
    if (!validateOutwardForm()) return;

    const outwardData = {
        IssueNo: $("#issueNo").val().trim(),
        IssueDate: $("#issueDate").val().trim(),
        ItemID: $("#outwardItemId").val().trim(),
        QtyIssued: parseFloat($("#outwardQty").val().trim())
    };

    const putReq = createPUTRequest(TOKEN, JSON.stringify(outwardData), DB_NAME, OUTWARD_REL);

    jQuery.ajaxSetup({ async: false });
    const result = executeCommandAtGivenBaseUrl(putReq, JPDB_BASE_URL, "/api/iml");
    jQuery.ajaxSetup({ async: true });

    if (result.status === 200) {
        if (updateItemStock(outwardData.ItemID, outwardData.QtyIssued, 'issued')) {
            alert("Outward entry saved and stock updated successfully.");
            resetOutwardForm();
        } else {
            alert("Outward entry saved, but failed to update item stock.");
        }
    } else {
        alert("Failed to save outward entry: " + (result.message || JSON.stringify(result)));
        console.error(result);
    }
}

function editOutward() {
    if (!validateOutwardForm()) return;

    const issueNo = $("#issueNo").val().trim();
    const itemId = $("#outwardItemId").val().trim();
    const newQtyIssued = parseFloat($("#outwardQty").val().trim());

    const getOldReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, OUTWARD_REL, JSON.stringify({ IssueNo: issueNo }));
    jQuery.ajaxSetup({ async: false });
    const getOldResult = executeCommandAtGivenBaseUrl(getOldReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    if (getOldResult.status !== 200) {
        alert("Could not retrieve old outward record for editing.");
        return;
    }

    const oldRecord = JSON.parse(getOldResult.data).record;
    const oldQtyIssued = oldRecord.QtyIssued;
    const rec_no = JSON.parse(getOldResult.data).rec_no;

    const outwardData = {
        IssueNo: issueNo,
        IssueDate: $("#issueDate").val().trim(),
        ItemID: itemId,
        QtyIssued: newQtyIssued
    };

    const updateReq = createUPDATERecordRequest(TOKEN, JSON.stringify(outwardData), DB_NAME, OUTWARD_REL, rec_no);

    jQuery.ajaxSetup({ async: false });
    const updateResult = executeCommandAtGivenBaseUrl(updateReq, JPDB_BASE_URL, "/api/iml");
    jQuery.ajaxSetup({ async: true });

    if (updateResult.status === 200) {
        const qtyDifference = newQtyIssued - oldQtyIssued;
        if (updateItemStock(itemId, qtyDifference, 'issued')) { 
            alert("Outward entry updated and stock adjusted successfully.");
            resetOutwardForm();
        } else {
            alert("Outward entry updated, but failed to adjust item stock.");
        }
    } else {
        alert("Failed to update outward entry: " + (updateResult.message || JSON.stringify(updateResult)));
        console.error(updateResult);
    }
}