const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tranwt`;

async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed with status ${response.status}`
        );
    }

    return result;
}

export async function getAllChallanCreation() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });
        console.log("challanCreation Response",response)
        return await handleResponse(response);



    }
    catch (error) {
        console.error(" getAll error:", error);
        throw error;
    }
}

export async function getByChallanCreationId(challanId) {
    try {
        console.log("getById challanChallanCreation:", challanId);

        const response = await fetch(`${API_URL}/${encodeURIComponent(challanId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
           cache:"no-store",
        });

        return await handleResponse(response);


    } catch (error) {
        console.error("getById error:", error);
        throw error;
    }
}
export async function createChallanCreation(challan, loggedUserId) {
    try {
        console.log("Creating challanChallanCreation:", challan);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: loggedUserId,
            },
            body: JSON.stringify(challan),
        });

        const result = await handleResponse(response);

        console.log("Create challanCreation response:", result);

        return result;

    } catch (error) {
        console.error("create error:", error);
        throw error;
    }
}


 export async function updateChallanCreation(challanId, challan, loggedUserId){
    try{
        console.log(
            "updating challan:", challanId, challan
        );
         const response = await fetch( `${API_URL}/${encodeURIComponent(challanId)}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                 userId:loggedUserId,
            },
            body: JSON.stringify(challan),
        });
        const result = await handleResponse(response);

        console.log("updatechallanCreation response:", result);

        return result;

    } catch (error) {
        console.error("update error:", error);
        throw error;
    }
}
