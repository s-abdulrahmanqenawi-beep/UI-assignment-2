const DATA_URL = './data/laptops.json';

export const fetchLaptops = async () => {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Failed to load laptop data (HTTP ${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching laptops:', error);
        throw error;
    }
};

export const fetchLaptopById = async (id) => {
    const laptops = await fetchLaptops();
    return laptops.find((item) => item.id === Number(id)) || null;
};