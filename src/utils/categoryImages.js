/**
 * Utility to map event categories to high-quality Unsplash images.
 * This replaces the custom image upload feature with professional, curated visuals.
 */

const CATEGORY_IMAGES = {
    "artificial intelligence & machine learning": "photo-1677442136019-21780ecad995",
    "arts & culture": "photo-1547826039-bfc35e0f1ea8",
    "business & entrepreneurship": "photo-1556761175-b413da4baf72",
    "data science & analytics": "photo-1551288049-bbda44a5f7ea",
    "design & creativity": "photo-1558655146-d09347e92766",
    "diversity & inclusion": "photo-1573164713988-8665fc963095",
    "education & e-learning": "photo-1501503069356-3c6b82a17d89",
    "engineering & architecture": "photo-1503387762-592dea58ef21",
    "finance & investing": "photo-1611974714014-4986a274e702",
    "fitness & wellness": "photo-1574680096145-d01b474bd234",
    "fitness": "photo-1574680096145-d01b474bd234",
    "wellness": "photo-1574680096145-d01b474bd234",
    "gaming & esports": "photo-1542751371-adc38448a05e",
    "healthcare & medicine": "photo-1505751172107-59d86a6058c6",
    "human resources (hr)": "photo-1521791136064-7986c308cb31",
    "leadership & management": "photo-1517245386807-bb43f82c33c4",
    "legal & compliance": "photo-1589829545856-d10d557cf95f",
    "marketing & seo": "photo-1460925895917-afdab827c52f",
    "nonprofit & charity": "photo-1532629345422-7515f3d16bb6",
    "personal development": "photo-1499750310107-5fef28a66643",
    "productivity & time management": "photo-1484480974693-6ca0a78fb36b",
    "real estate": "photo-1560518883-ce09059eeffa",
    "sales & customer success": "photo-1552581234-26160f608093",
    "science & research": "photo-1532094349884-543bb117a4a9",
    "technology & software": "photo-1498050108023-c5249f4df085",
    "travel & hospitality": "photo-1436491865332-7a61a109c055",
    "writing & publishing": "photo-1455390582262-044cdead277a",
    "general": "photo-1497215728101-856f4ea42174"
};

export const CATEGORIES = Object.keys(CATEGORY_IMAGES).filter(k => k !== "general");

/**
 * Returns the Unsplash URL for a given category.
 * @param {string} category - The category name.
 * @returns {string} The full Unsplash image URL.
 */
const FITNESS_CATEGORIES = new Set(["fitness & wellness", "fitness", "wellness"]);

const SCIENCE_RESEARCH_CATEGORIES = new Set(["science & research", "science", "research"]);

export const getCategoryImage = (category) => {
    const normalizedKey = (category || "").trim().toLowerCase();
    if (FITNESS_CATEGORIES.has(normalizedKey)) {
        return "/assets/fitness.jpg";
    }
    if (SCIENCE_RESEARCH_CATEGORIES.has(normalizedKey)) {
        return "/assets/Research.png";
    }
    const photoId = CATEGORY_IMAGES[normalizedKey] || CATEGORY_IMAGES["general"];
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=1200`;
};
