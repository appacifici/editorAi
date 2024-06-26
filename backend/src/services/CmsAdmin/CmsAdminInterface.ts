interface Typology {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    typology: {
        [key: number]: Typology;
    };
}

interface Category {
    id: number;
    name: string;
    subcategory: {
        [key: number]: Subcategory;
    };
}

interface Sections {
    [key: number]: Category;
}