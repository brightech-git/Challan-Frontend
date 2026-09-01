const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/metalmast`;

async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed with status ${response.status}`
        );
    }
    console.log("Response From MetalService",result)
    return result;
}

export async function getAllMetal() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });
        console.log("Metal Response",response)
        return await handleResponse(response);



    }
    catch (error) {
        console.error(" getAll error:", error);
        throw error;
    }
}
export async function getByMetalId(metalId) {
    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(metalId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",

        });
        return await handleResponse(response);

    } catch (error) {
        console.error("getById error:", error);
        throw error;

    }
}

export async function updateMetal(editMetalId,newMetal,loggedUserId) {
    try {
        console.log(
            "Updating Metal:",
        );

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(editMetalId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    userId:loggedUserId,
                },
                body: JSON.stringify(newMetal),
            }
        );

        const result = await handleResponse(response);

        console.log("updateMetal response:", result);

        return result;

    } catch (error) {
        console.error("updateMetal error:", error);
        throw error;
    }
}

export async function createMetal(newMetal, loggeduserId) {
    try {
        console.log("Creating Metal:", newMetal, loggeduserId);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: loggeduserId,
            },
            body: JSON.stringify(newMetal),
        });

        const result = await handleResponse(response);

        console.log("createMetal response:", result);

        return result;

    } catch (error) {
        console.error("createMetal error:", error);
        throw error;
    }
}

