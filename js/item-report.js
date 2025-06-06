function validateItemId(itemId, errorElementId) {
    if (!itemId) return true; 

    const getReq = createGET_BY_KEYRequest(TOKEN, DB_NAME, ITEMS_REL, JSON.stringify({ ItemID: itemId }));
    jQuery.ajaxSetup({ async: false });
    const result = executeCommandAtGivenBaseUrl(getReq, JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    const errorElement = $("#" + errorElementId);

    if (result.status === 200) {
        errorElement.text("").hide();
        return true;
    } else {
        errorElement.text("Item ID not found").show();
        return false;
    }
}

function generateItemReport() {
    const fromId = $("#reportItemIdFrom").val().trim();
    const toId = $("#reportItemIdTo").val().trim();

    const isFromValid = validateItemId(fromId, "fromIdError");
    const isToValid = validateItemId(toId, "toIdError");

    if (!isFromValid || !isToValid) {
        return; 
    }

    const getAllReq = {
        token: TOKEN,
        cmd: "GET_ALL",
        dbName: DB_NAME,
        rel: ITEMS_REL
    };

    jQuery.ajaxSetup({ async: false });
    const rawResult = executeCommandAtGivenBaseUrl(JSON.stringify(getAllReq), JPDB_BASE_URL, "/api/irl");
    jQuery.ajaxSetup({ async: true });

    let records = [];

    try {
        const parsedData = JSON.parse(rawResult.data);
        if (parsedData && parsedData.json_records && Array.isArray(parsedData.json_records)) {
            records = parsedData.json_records.map(d => d.record);
        }
    } catch (e) {
        $("#itemReportTableBody").empty();
        $("#noReportData").show();
        return;
    }

    const filteredRecords = records.filter(item => {
        const itemId = item.ItemID;

        if (fromId && toId && !isNaN(fromId) && !isNaN(toId) && !isNaN(itemId)) {
            const numItemId = parseFloat(itemId);
            return numItemId >= parseFloat(fromId) && numItemId <= parseFloat(toId);
        } else {
            if (fromId && itemId < fromId) return false;
            if (toId && itemId > toId) return false;
            return true;
        }
    });

    const tableBody = $("#itemReportTableBody");
    tableBody.empty();

    if (filteredRecords.length === 0) {
        $("#noReportData").show();
    } else {
        $("#noReportData").hide();
        for (const item of filteredRecords) {
            const row = `
                <tr>
                    <td>${item.ItemID}</td>
                    <td>${item.ItemName}</td>
                    <td>${parseFloat(item.AvailableStock || 0).toFixed(3)}</td>
                    <td>${item.UoM || ''}</td>
                    <td>${parseFloat(item.OpeningStock || 0).toFixed(3)}</td>
                    <td>${parseFloat(item.ItemsReceived || 0).toFixed(3)}</td>
                    <td>${parseFloat(item.ItemsIssued || 0).toFixed(3)}</td>
                </tr>
            `;
            tableBody.append(row);
        }
    }
}
