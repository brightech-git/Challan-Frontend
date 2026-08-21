const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/companies`;

/**
 * Handle API response
 */
async function handleResponse(response) {
    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed with status ${response.status}`
        );
    }

    return result;
}


/**
 * GET - Get all companies
 *
 * GET /api/companies
 */
export async function getCompanies() {
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
        console.error("getCompanies error:", error);
        throw error;
    }
}


/**
 * POST - Create company
 *
 * POST /api/companies
 */
export async function createCompany(company) {
    try {
        console.log("Creating company:", company);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(company),
        });

        const result = await handleResponse(response);

        console.log("Create company response:", result);

        return result;

    } catch (error) {
        console.error("createCompany error:", error);
        throw error;
    }
}


/**
 * PUT - Update company
 *
 * PUT /api/companies/{companyId}
 */
export async function updateCompany(companyId, company) {
    try {
        console.log(
            "Updating company:",
            companyId,
            company
        );

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(companyId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(company),
            }
        );

        const result = await handleResponse(response);

        console.log("Update company response:", result);

        return result;

    } catch (error) {
        console.error("updateCompany error:", error);
        throw error;
    }
}


/**
 * DELETE - Delete company
 *
 * DELETE /api/companies/{companyId}
 */
export async function deleteCompany(companyId) {
    try {
        console.log("Deleting company:", companyId);

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(companyId)}`,
            {
                method: "DELETE",
            }
        );

        const result = await handleResponse(response);

        console.log("Delete company response:", result);

        return result;

    } catch (error) {
        console.error("deleteCompany error:", error);
        throw error;
    }
}