class RequestHandler {
    static async sendRequest(endpoint, data) {
        const formData = new FormData();
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                formData.append(`${key}`, data[key]);
            }
        }

        try {
            const response = await fetch('/' + endpoint, {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                const { e, m, d = null } = await response.json();
                return { e, m, d };
            } else {
                throw new Error('Response is not ok.');
            }
        } catch (error) {
            throw error;
        }
    }
}