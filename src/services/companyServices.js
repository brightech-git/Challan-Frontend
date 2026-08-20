const API_URL = process.env.NEXT_PUBLIC_API_URL + "/companies";


// GET - Get all companies
export async function getCompanies() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to get companies");
    }

    return response.json();
}


// POST - Create company
export async function createCompany(company) {

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(company),
    });

    if (!response.ok) {
        throw new Error("Failed to create company");
    }

    return response.json();
}


// PUT - Update company
export async function updateCompany(id, company) {
console.log("Updating company with ID:", id, "and data:", company);

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(company),
    });

console.log("Response from updateCompany:", response);

    if (!response.ok) {
        throw new Error("Failed to update company");
    }

    return response.json();
}


// DELETE - Delete company
export async function deleteCompany(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete company");
    }

    return response.json();
}