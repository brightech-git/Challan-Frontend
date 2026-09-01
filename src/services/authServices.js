const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed with status ${response.status}`
        );
    }

    return result;
}


export async function getAll() {
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
export async function getUserById(userId) {
    try {
        console.log("Getting user:", userId);

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        const result = await handleResponse(response);

        console.log("Get user response:", result);

        return result;

    } catch (error) {
        console.error("getUserById error:", error);
        throw error;
    }
}
export async function createUser(user, loggedUserId) {

    try {
        console.log("Creating user:", user);
        console.log("loggeduserid",loggedUserId)

        const response = await fetch(API_URL,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId:loggedUserId,
            },

            body: JSON.stringify(user),
        });
console.log("response",response)
        const result = await handleResponse(response);

        console.log("Create user response:", result);

        return result;

    } catch (error) {
        console.error("createUser error:", error);
        throw error;
    }
}
export async function Login(formLogin) {
    try {
        console.log("Login payload:", formLogin);

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formLogin),
        });

        console.log("Login HTTP status:", response.status);

        const result = await handleResponse(response);

        console.log("Login response:", result);

        alert(result?.message || "User logged successfully");

        return result;

    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}