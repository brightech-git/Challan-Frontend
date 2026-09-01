const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/ChallanFormat`;

async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed with status ${response.status}`
        );
    }

    return result;
}
export async function getAllChallanFormat() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("getUsers error:", error);
        throw error;
    }
}
export async function getByIdChallanFormat(printer) {
    try {
        console.log("getByIdChallanFormat:",printer);

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(printer)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );
      const result = await handleResponse(response);

        console.log("challanFromat response:", result);

        return result;

    } catch (error) {
        console.error("getByIdchallanFormat error:", error);
        throw error;
    }
}
// export async function createChallanFromat(printer, loggeduserId) {
//     try {
//         console.log("ChallanFromat:", printer, loggeduserId);

//         const response = await fetch(API_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 userId: loggeduserId,
//             },
//             body: JSON.stringify(printer),
//         });

//         const result = await handleResponse(response);

//         console.log("challanFromat response:", result);

//         return result;

//     } catch (error) {
//         console.error("create challanFromat error:", error);
//         throw error;
//     }
// }